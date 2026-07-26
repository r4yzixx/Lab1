/**
 * Assure l’accès aux réservations stockées dans MongoDB.
 *
 * Cette classe encapsule le modèle Mongoose et fournit les opérations de
 * persistance nécessaires à la création, la consultation et la modification
 * de l’état d’une réservation.
 *
 * Travail demandé :
 * - conserver le modèle Mongoose reçu.
 * - récupérer les réservations dans un ordre utile.
 * - retrouver une réservation précise.
 * - enregistrer une nouvelle réservation.
 * - modifier une réservation existante et retourner sa nouvelle version.
 *
 * Les appels aux autres microservices ne doivent pas être placés ici.
 */
export default class ReservationRepository {
  constructor(model) { this.model = model; }
  findAll() { return this.model.find().sort({ createdAt: -1 }); }
  findById(id) { return this.model.findById(id); }
  create(reservation) { return this.model.create(reservation); }
  updateStatus(id, status) { return this.model.findByIdAndUpdate(id, { status }, { new: true }); }
  delete(id) { return this.model.findByIdAndDelete(id); }
}
