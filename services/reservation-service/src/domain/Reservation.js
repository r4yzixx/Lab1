/**
 * Représente une réservation de matériel effectuée par un client.
 *
 * Cette classe porte les données et calculs propres à une réservation. Elle
 * doit notamment interpréter correctement les dates et la quantité, vérifier
 * la cohérence de la période demandée et participer au calcul du montant de la
 * location à partir du prix quotidien fourni par le service du matériel.
 *
 * Travail demandé :
 * - déduire toutes les données d’une réservation à partir des besoins.
 * - normaliser les nombres et les dates lors de la création de l’objet.
 * - attribuer un état initial lorsqu’il n’est pas fourni.
 * - calculer la durée facturable de la location.
 * - calculer le total à partir de la durée, de la quantité et d’un prix.
 * - vérifier la validité de la réservation.
 *
 * Cette classe ne doit appeler aucun autre service et ne doit pas utiliser
 * directement MongoDB.
 */
export default class Reservation {
  constructor({ clientId, equipmentId, quantity, startDate, endDate, clientName, equipmentName, totalPrice, status = "CONFIRMED" }) {
    this.clientId = String(clientId ?? "").trim();
    this.equipmentId = String(equipmentId ?? "").trim();
    this.quantity = Number(quantity);
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.clientName = clientName;
    this.equipmentName = equipmentName;
    this.totalPrice = totalPrice === undefined ? undefined : Number(totalPrice);
    this.status = status;
  }
  billableDays() {
    return Math.floor((this.endDate - this.startDate) / 86400000) + 1;
  }
  calculateTotal(dailyPrice) {
    return this.billableDays() * this.quantity * Number(dailyPrice);
  }
  validate() {
    const errors = [];
    if (!this.clientId) errors.push("Le client est obligatoire.");
    if (!this.equipmentId) errors.push("Le matériel est obligatoire.");
    if (!Number.isInteger(this.quantity) || this.quantity < 1) errors.push("La quantité doit être un entier supérieur ou égal à 1.");
    if (Number.isNaN(this.startDate.getTime()) || Number.isNaN(this.endDate.getTime())) errors.push("Les dates sont invalides.");
    else if (this.endDate < this.startDate) errors.push("La date de fin ne peut pas précéder la date de début.");
    return errors;
  }
}
