import { Router } from "express";
export default function createRoutes(service) {
  const router = Router();
  const run = handler => async (req, res, next) => { try { await handler(req, res); } catch (e) { next(e); } };
  router.get("/", run(async (_req, res) => res.json(await service.list())));
  router.post("/", run(async (req, res) => res.status(201).json(await service.create(req.body))));
  return router;
}
