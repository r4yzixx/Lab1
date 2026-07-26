import test from "node:test";
import assert from "node:assert/strict";
import Client from "../services/client-service/src/domain/Client.js";
import Equipment from "../services/equipment-service/src/domain/Equipment.js";
import Reservation from "../services/reservation-service/src/domain/Reservation.js";
import Notification from "../services/notification-service/src/domain/Notification.js";

test("un client normalise son courriel et valide ses champs", () => {
  const client = new Client({ name: " Ada ", email: " ADA@EXAMPLE.COM ", phone: "514-555-0100" });
  assert.equal(client.email, "ada@example.com");
  assert.deepEqual(client.validate(), []);
});

test("un matériel refuse un stock négatif et une réservation excessive", () => {
  assert.notDeepEqual(new Equipment({ name: "Projecteur", category: "Vidéo", dailyPrice: 50, availableQuantity: -1 }).validate(), []);
  assert.equal(new Equipment({ name: "Projecteur", category: "Vidéo", dailyPrice: 50, availableQuantity: 3 }).canReserve(4), false);
});

test("la durée facturable inclut le premier et le dernier jour", () => {
  const reservation = new Reservation({ clientId: "c1", equipmentId: "e1", quantity: 2, startDate: "2026-07-01", endDate: "2026-07-03" });
  assert.equal(reservation.billableDays(), 3);
  assert.equal(reservation.calculateTotal(25), 150);
  assert.deepEqual(reservation.validate(), []);
});

test("une réservation refuse une date de fin antérieure", () => {
  const reservation = new Reservation({ clientId: "c1", equipmentId: "e1", quantity: 1, startDate: "2026-07-04", endDate: "2026-07-03" });
  assert.match(reservation.validate().join(" "), /date de fin/i);
});

test("une notification exige un destinataire et un message", () => {
  assert.deepEqual(new Notification({ recipient: "client@example.com", message: "Confirmée" }).validate(), []);
  assert.equal(new Notification({}).validate().length, 2);
});
