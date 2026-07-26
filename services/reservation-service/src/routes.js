import { Router } from "express";
export default function createRoutes(service) {
  const router = Router();
  const run = handler => async (req, res, next) => { try { await handler(req, res); } catch (e) { next(e); } };
  router.get("/", run(async (_req, res) => res.json(await service.list())));
  router.get("/:id", run(async (req, res) => res.json(await service.get(req.params.id))));
  router.post("/", run(async (req, res) => res.status(201).json(await service.create(req.body))));
  const cancel = run(async (req, res) => res.json(await service.cancel(req.params.id)));
  router.put("/:id/cancel", cancel);
  router.patch("/:id/cancel", cancel);
  router.delete("/:id", run(async (req, res) => { await service.delete(req.params.id); res.status(204).end(); }));
  return router;
}
