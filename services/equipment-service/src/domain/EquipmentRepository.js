/**
 * Assure l’accès aux données persistantes du matériel.
 *
 * Cette classe encapsule le modèle Mongoose et fournit les opérations dont le
 * service a besoin pour gérer le catalogue et les quantités disponibles. Les
 * autres classes ne doivent pas avoir à connaître les détails des requêtes
 * MongoDB.
 *
 * Travail demandé :
 * - conserver le modèle Mongoose fourni;
 * - permettre la consultation et le CRUD du matériel;
 * - permettre l’ajustement atomique d’une quantité disponible;
 * - retourner les documents obtenus après chaque opération.
 *
 * Les règles de disponibilité et de validation appartiennent au domaine ou au
 * service applicatif, pas à cette classe.
 */
export default class EquipmentRepository {
  constructor(model) { this.model = model; }
  findAll() { return this.model.find().sort({ name: 1 }); }
  findById(id) { return this.model.findById(id); }
  create(equipment) { return this.model.create(equipment); }
  update(id, equipment) { return this.model.findByIdAndUpdate(id, equipment, { new: true, runValidators: true }); }
  delete(id) { return this.model.findByIdAndDelete(id); }
  reserve(id, quantity) {
    return this.model.findOneAndUpdate(
      { _id: id, availableQuantity: { $gte: quantity } },
      { $inc: { availableQuantity: -quantity } },
      { new: true }
    );
  }
  release(id, quantity) {
    return this.model.findByIdAndUpdate(id, { $inc: { availableQuantity: quantity } }, { new: true });
  }
}
