import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: String,
  category: String,
  logo: String, // Image URL
  source: { type: String, enum: ["ADMIN", "USER"], required: true },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export default model("Product", ProductSchema);
