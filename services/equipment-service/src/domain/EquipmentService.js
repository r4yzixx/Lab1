/**
 * Contient la logique applicative du service du matériel.
 *
 * Cette classe orchestre l’entité Equipment et son dépôt. Elle doit gérer le
 * catalogue, valider les nouveaux articles et appliquer les règles de stock
 * lors d’une réservation ou d’une remise en disponibilité.
 *
 * Travail demandé :
 * - recevoir le dépôt de matériel;
 * - exposer les opérations requises par les contrats REST;
 * - valider les données avant la création;
 * - empêcher une réservation lorsque le matériel est absent ou insuffisant;
 * - diminuer ou augmenter la quantité disponible de façon cohérente;
 * - produire des erreurs compréhensibles lorsque l’opération est impossible.
 *
 * Cette classe ne doit pas traiter directement les objets req et res.
 */
import Equipment from "./Equipment.js";

export default class EquipmentService {
  constructor(repository) { this.repository = repository; }
  list() { return this.repository.findAll(); }
  async get(id) {
    const equipment = await this.repository.findById(id);
    if (!equipment) throw Object.assign(new Error("Matériel introuvable."), { status: 404 });
    return equipment;
  }
  async create(data) {
    const equipment = new Equipment(data); this.#validate(equipment);
    return this.repository.create(equipment);
  }
  async update(id, data) {
    const equipment = new Equipment(data); this.#validate(equipment);
    const updated = await this.repository.update(id, equipment);
    if (!updated) throw Object.assign(new Error("Matériel introuvable."), { status: 404 });
    return updated;
  }
  async reserve(id, rawQuantity) {
    const quantity = this.#quantity(rawQuantity);
    await this.get(id);
    const updated = await this.repository.reserve(id, quantity);
    if (!updated) throw Object.assign(new Error("Quantité disponible insuffisante."), { status: 409 });
    return updated;
  }
  async release(id, rawQuantity) {
    const quantity = this.#quantity(rawQuantity);
    const updated = await this.repository.release(id, quantity);
    if (!updated) throw Object.assign(new Error("Matériel introuvable."), { status: 404 });
    return updated;
  }
  async delete(id) {
    if (!await this.repository.delete(id)) throw Object.assign(new Error("Matériel introuvable."), { status: 404 });
  }
  #validate(equipment) {
    const errors = equipment.validate();
    if (errors.length) throw Object.assign(new Error(errors.join(" ")), { status: 400 });
  }
  #quantity(value) {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error("La quantité doit être un entier supérieur ou égal à 1."), { status: 400 });
    return quantity;
  }
}
