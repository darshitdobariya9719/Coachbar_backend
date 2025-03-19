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
// app.use(
//   cors({
//     origin: "*", // Allows all origins (change this to specific origins if needed)
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//   })
// );
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Allow only your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allow cookies or authorization headers
  })
);


app.use(json());

connectDB();
app.get("/test", (req, res) => {res.json({ message: "Test route is working!" })});
app.use("/api/images", express.static(path.join(__dirname, "public/uploads")));
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

export default app;
