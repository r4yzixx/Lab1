import "dotenv/config";
import express from "express"; import cors from "cors"; import mongoose from "mongoose";
import createRoutes from "./routes.js";
import ReservationRepository from "./domain/ReservationRepository.js";
import ReservationService from "./domain/ReservationService.js";
const schema = new mongoose.Schema({
  clientId: { type: String, required: true }, equipmentId: { type: String, required: true },
  clientName: { type: String, required: true }, equipmentName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }, startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["CONFIRMED", "CANCELLED"], default: "CONFIRMED" }
}, { timestamps: true });
const app = express(); app.use(cors()); app.use(express.json());
app.get("/health", (_req, res) => res.json({ service: "reservation-service", status: "UP" }));
app.use("/api/reservations", createRoutes(new ReservationService(new ReservationRepository(mongoose.model("Reservation", schema)))));
app.use((e, _req, res, _next) => res.status(e.status || (e.name === "CastError" ? 400 : 500)).json({ message: e.message }));
const port = Number(process.env.PORT || 4003);
await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_reservations");
app.listen(port, () => console.log(`reservation-service sur le port ${port}`));
