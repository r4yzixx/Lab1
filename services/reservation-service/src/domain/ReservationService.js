/**
 * Orchestre le cas d’utilisation principal de réservation.
 *
 * Cette classe coordonne l’entité Reservation, son dépôt et les autres
 * microservices. Pour confirmer une réservation, elle doit vérifier les
 * données, obtenir les informations du client et du matériel, réserver la
 * quantité demandée, calculer le total, enregistrer la réservation et produire
 * une notification. Pour une annulation, elle doit remettre le matériel en
 * disponibilité, changer l’état de la réservation et produire une nouvelle
 * notification.
 *
 * Travail demandé :
 * - recevoir le dépôt de réservations.
 * - configurer les adresses des services externes à partir de l’environnement.
 * - fournir les opérations prévues par les contrats REST.
 * - utiliser Axios pour communiquer avec les autres services.
 * - gérer les erreurs : données invalides, ressource absente, stock insuffisant
 *   et réservation déjà annulée.
 * - préserver la cohérence des données autant que possible.
 *
 * Cette classe ne doit pas manipuler directement les objets req et res et ne
 * doit pas exécuter directement de requêtes Mongoose.
 */
import axios from "axios";
import Reservation from "./Reservation.js";

export default class ReservationService {
  constructor(repository, options = {}) {
    this.repository = repository;
    this.clientsUrl = options.clientsUrl || process.env.CLIENT_SERVICE_URL || "http://localhost:4001/api/clients";
    this.equipmentUrl = options.equipmentUrl || process.env.EQUIPMENT_SERVICE_URL || "http://localhost:4002/api/equipments";
    this.notificationsUrl = options.notificationsUrl || process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4004/api/notifications";
    this.http = options.http || axios;
  }
  list() { return this.repository.findAll(); }
  async get(id) {
    const reservation = await this.repository.findById(id);
    if (!reservation) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });
    return reservation;
  }
  async create(data) {
    const reservation = new Reservation(data);
    this.#validate(reservation);
    let client, equipment;
    try {
      [client, equipment] = await Promise.all([
        this.http.get(`${this.clientsUrl}/${reservation.clientId}`),
        this.http.get(`${this.equipmentUrl}/${reservation.equipmentId}`)
      ]);
    } catch (error) { throw this.#externalError(error, "Client ou matériel introuvable."); }
    reservation.clientName = client.data.name;
    reservation.equipmentName = equipment.data.name;
    reservation.totalPrice = reservation.calculateTotal(equipment.data.dailyPrice);
    try {
      await this.http.put(`${this.equipmentUrl}/${reservation.equipmentId}/reserve`, { quantity: reservation.quantity });
    } catch (error) { throw this.#externalError(error, "Impossible de réserver le matériel."); }
    let saved;
    try {
      saved = await this.repository.create(reservation);
    } catch (error) {
      await this.#bestEffortRelease(reservation);
      throw error;
    }
    await this.#notify({
      recipient: client.data.email,
      message: `Réservation confirmée: ${reservation.equipmentName} x ${reservation.quantity}, total ${reservation.totalPrice} $.`,
      type: "RESERVATION_CONFIRMED"
    });
    return saved;
  }
  async cancel(id) {
    const reservation = await this.get(id);
    if (reservation.status === "CANCELLED") throw Object.assign(new Error("Cette réservation est déjà annulée."), { status: 409 });
    try {
      await this.http.put(`${this.equipmentUrl}/${reservation.equipmentId}/release`, { quantity: reservation.quantity });
    } catch (error) { throw this.#externalError(error, "Impossible de remettre le matériel en inventaire."); }
    let updated;
    try {
      updated = await this.repository.updateStatus(id, "CANCELLED");
    } catch (error) {
      try { await this.http.put(`${this.equipmentUrl}/${reservation.equipmentId}/reserve`, { quantity: reservation.quantity }); } catch {}
      throw error;
    }
    let recipient = "employés";
    try { recipient = (await this.http.get(`${this.clientsUrl}/${reservation.clientId}`)).data.email; } catch {}
    await this.#notify({ recipient, message: `Réservation annulée: ${reservation.equipmentName} x ${reservation.quantity}.`, type: "RESERVATION_CANCELLED" });
    return updated;
  }
  async delete(id) {
    const reservation = await this.get(id);
    if (reservation.status === "CONFIRMED") await this.cancel(id);
    await this.repository.delete(id);
  }
  #validate(reservation) {
    const errors = reservation.validate();
    if (errors.length) throw Object.assign(new Error(errors.join(" ")), { status: 400 });
  }
  #externalError(error, fallback) {
    return Object.assign(new Error(error.response?.data?.message || fallback), { status: error.response?.status || 503 });
  }
  async #bestEffortRelease(reservation) {
    try { await this.http.put(`${this.equipmentUrl}/${reservation.equipmentId}/release`, { quantity: reservation.quantity }); } catch {}
  }
  async #notify(payload) {
    try { await this.http.post(this.notificationsUrl, payload); }
    catch (error) { console.error("Notification non enregistrée:", error.message); }
  }
}
