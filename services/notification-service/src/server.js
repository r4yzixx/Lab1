import "dotenv/config";
import express from "express"; import cors from "cors"; import mongoose from "mongoose";
import createRoutes from "./routes.js";
import NotificationRepository from "./domain/NotificationRepository.js";
import NotificationService from "./domain/NotificationService.js";
const schema = new mongoose.Schema({
  recipient: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, required: true, default: "INFO" }
}, { timestamps: true });
const app = express(); app.use(cors()); app.use(express.json());
app.get("/health", (_req, res) => res.json({ service: "notification-service", status: "UP" }));
app.use("/api/notifications", createRoutes(new NotificationService(new NotificationRepository(mongoose.model("Notification", schema)))));
app.use((e, _req, res, _next) => res.status(e.status || 500).json({ message: e.message }));
const port = Number(process.env.PORT || 4004);
await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_notifications");
app.listen(port, () => console.log(`notification-service sur le port ${port}`));
