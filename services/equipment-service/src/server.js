import "dotenv/config";
import express from "express"; import cors from "cors"; import mongoose from "mongoose";
import createRoutes from "./routes.js";
import EquipmentRepository from "./domain/EquipmentRepository.js";
import EquipmentService from "./domain/EquipmentService.js";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  dailyPrice: { type: Number, required: true, min: 0 },
  availableQuantity: { type: Number, required: true, min: 0, validate: Number.isInteger }
}, { timestamps: true });
const app = express(); app.use(cors()); app.use(express.json());
app.get("/health", (_req, res) => res.json({ service: "equipment-service", status: "UP" }));
app.use("/api/equipments", createRoutes(new EquipmentService(new EquipmentRepository(mongoose.model("Equipment", schema)))));
app.use((e, _req, res, _next) => res.status(e.status || (e.name === "CastError" ? 400 : 500)).json({ message: e.message }));
const port = Number(process.env.PORT || 4002);
await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_equipments");
app.listen(port, () => console.log(`equipment-service sur le port ${port}`));
