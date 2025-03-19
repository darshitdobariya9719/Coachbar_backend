import express, { json } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const allowedOrigins = [
  "https://coachbar-frontend.vercel.app", 
  "http://localhost:5173" // for local development
];

app.use(cors({
  origin: allowedOrigins,
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(json());

connectDB();
app.get("/test", (req, res) => {res.json({ message: "Test route is working!" })});
app.use("/api/images", express.static(path.join(__dirname, "public/uploads")));
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

export default app;
