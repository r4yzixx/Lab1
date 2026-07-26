/**
 * Contient la logique applicative du service des clients.
 *
 * Cette classe constitue l’intermédiaire entre les routes REST, l’entité
 * Client et le dépôt de clients. Elle doit appliquer les règles métier avant
 * de demander au dépôt de lire ou de modifier les données.
 *
 * Travail demandé :
 * - recevoir le dépôt nécessaire à son fonctionnement;
 * - offrir les opérations correspondant aux cas d’utilisation du service;
 * - créer et valider l’entité appropriée avant un enregistrement;
 * - déléguer la persistance au dépôt;
 * - signaler clairement les données invalides.
 *
 * Cette classe ne doit pas utiliser directement Express ni Mongoose.
 */
import Client from "./Client.js";

export default class ClientService {
  constructor(repository) { this.repository = repository; }
  list() { return this.repository.findAll(); }
  async get(id) {
    const client = await this.repository.findById(id);
    if (!client) throw Object.assign(new Error("Client introuvable."), { status: 404 });
    return client;
  }
  async create(data) {
    const client = new Client(data);
    this.#validate(client);
    return this.repository.create(client);
  }
  async update(id, data) {
    const client = new Client(data);
    this.#validate(client);
    const updated = await this.repository.update(id, client);
    if (!updated) throw Object.assign(new Error("Client introuvable."), { status: 404 });
    return updated;
  }
  async delete(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw Object.assign(new Error("Client introuvable."), { status: 404 });
  }
  #validate(client) {
    const errors = client.validate();
    if (errors.length) throw Object.assign(new Error(errors.join(" ")), { status: 400 });
  }
}
