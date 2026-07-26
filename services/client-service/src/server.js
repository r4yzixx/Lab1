import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import createRoutes from "./routes.js";
import ClientRepository from "./domain/ClientRepository.js";
import ClientService from "./domain/ClientService.js";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true }
}, { timestamps: true });
const ClientModel = mongoose.model("Client", schema);
const app = express();
app.use(cors()); app.use(express.json());
app.get("/health", (_req, res) => res.json({ service: "client-service", status: "UP" }));
app.use("/api/clients", createRoutes(new ClientService(new ClientRepository(ClientModel))));
app.use((error, _req, res, _next) => {
  const duplicate = error?.code === 11000;
  res.status(duplicate ? 409 : (error.status || (error.name === "CastError" ? 400 : 500)))
    .json({ message: duplicate ? "Ce courriel est déjà utilisé." : error.message });
});
const port = Number(process.env.PORT || 4001);
await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_clients");
app.listen(port, () => console.log(`client-service sur le port ${port}`));
