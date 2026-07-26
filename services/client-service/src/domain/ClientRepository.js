/**
 * Assure l’accès aux données persistantes des clients.
 *
 * Cette classe reçoit le modèle Mongoose du client et centralise toutes les
 * opérations effectuées dans MongoDB. Elle doit permettre au reste du service
 * de consulter, ajouter, modifier et supprimer des clients sans manipuler
 * directement Mongoose.
 *
 * Travail demandé :
 * - conserver une référence vers le modèle Mongoose fourni;
 * - prévoir les opérations de persistance nécessaires aux contrats REST;
 * - retourner les résultats produits par Mongoose.
 *
 * Cette classe ne doit contenir ni validation métier ni traitement HTTP.
 */
export default class ClientRepository {
  constructor(model) { this.model = model; }
  findAll() { return this.model.find().sort({ name: 1 }); }
  findById(id) { return this.model.findById(id); }
  create(client) { return this.model.create(client); }
  update(id, client) { return this.model.findByIdAndUpdate(id, client, { new: true, runValidators: true }); }
  delete(id) { return this.model.findByIdAndDelete(id); }
}
