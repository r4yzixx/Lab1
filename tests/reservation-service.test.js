import test from "node:test";
import assert from "node:assert/strict";
import ReservationService from "../services/reservation-service/src/domain/ReservationService.js";

test("la création orchestre les services, calcule le total et notifie", async () => {
  const calls = [];
  const repository = {
    create: async value => ({ _id: "r1", ...value }),
    findAll: async () => []
  };
  const http = {
    get: async url => {
      calls.push(["GET", url]);
      return url.includes("clients") ? { data: { name: "Ada", email: "ada@example.com" } } : { data: { name: "Projecteur", dailyPrice: 25 } };
    },
    put: async (url, data) => { calls.push(["PUT", url, data]); return { data: {} }; },
    post: async (url, data) => { calls.push(["POST", url, data]); return { data: {} }; }
  };
  const service = new ReservationService(repository, { http, clientsUrl: "clients", equipmentUrl: "equipments", notificationsUrl: "notifications" });
  const result = await service.create({ clientId: "c1", equipmentId: "e1", quantity: 2, startDate: "2026-07-01", endDate: "2026-07-03" });
  assert.equal(result.totalPrice, 150);
  assert.equal(result.status, "CONFIRMED");
  assert.ok(calls.some(([method, url]) => method === "PUT" && url === "equipments/e1/reserve"));
  assert.ok(calls.some(([method, url]) => method === "POST" && url === "notifications"));
});

test("l'annulation remet le stock et empêche une seconde annulation", async () => {
  const puts = [];
  const repository = {
    findById: async () => ({ _id: "r1", clientId: "c1", equipmentId: "e1", equipmentName: "Projecteur", quantity: 2, status: "CONFIRMED" }),
    updateStatus: async (_id, status) => ({ _id: "r1", status })
  };
  const http = {
    get: async () => ({ data: { email: "ada@example.com" } }),
    put: async (url, data) => { puts.push([url, data]); return { data: {} }; },
    post: async () => ({ data: {} })
  };
  const service = new ReservationService(repository, { http, clientsUrl: "clients", equipmentUrl: "equipments", notificationsUrl: "notifications" });
  assert.equal((await service.cancel("r1")).status, "CANCELLED");
  assert.deepEqual(puts[0], ["equipments/e1/release", { quantity: 2 }]);
  repository.findById = async () => ({ _id: "r1", status: "CANCELLED" });
  await assert.rejects(() => service.cancel("r1"), error => error.status === 409);
});
