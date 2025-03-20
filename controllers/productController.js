import { validationResult } from "express-validator";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

// Get the correct __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload directory
const uploadDir = path.join(__dirname, "../public/uploads");

export async function createProduct(req, res) {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, sku, description, category } = req.body;
    let assignedTo = JSON.parse(req.body.assignedTo);

    const productExists = await Product.findOne({ sku });
    // if (productExists) return res.status(400).json({ message: "SKU already exists" });
    if (productExists) {
      if (req.file) fs.unlinkSync(req.file.path); // Remove uploaded image
      return res.status(400).json({ message: "SKU already exists" });
    }

    const product = new Product({
      name,
      sku,
      description,
      category,
      logo: req.file?.filename || "", // Image upload handling
      source: req.user.role === "admin" ? "ADMIN" : "USER",
      assignedTo: assignedTo || [req.user.id],
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
}

export async function getProducts(req, res) {
  try {
    let { page = 1, limit = 5, sort = 'name', order = 'asc', search = '', category = '', source = '' } = req.query;

    page = Math.max(parseInt(page), 1); // Ensure page is at least 1
    limit = parseInt(limit) || 0; // If limit is not passed, return all products
    order = order === 'desc' ? -1 : 1;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    if (category) filter.category = category;
    if (source) filter.source = source;

    const query = req.user.role === "admin"
      ? Product.find(filter)
      : Product.find({ ...filter, assignedTo: { $in: [req.user.id] } });
    const products = await query
      .sort({ [sort]: order })
      .skip((page - 1) * limit) // Ensuring page starts from 1
      .limit(limit);

    const total = await Product.countDocuments(req.user.role === "admin" ? filter : { ...filter, assignedTo: { $in: [req.user.id] } });

    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function assignProduct(req, res) {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, assignedTo, userId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if product is already assigned to this user
    // if (product.assignedTo?.toString() === userId) return res.status(400).json({ message: "Product is already assigned to this user" });

    // Assign the product
    product.assignedTo = assignedTo;
    await product.save();

    res.status(201).json({ message: "Product assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.file) {
      const imagePath = path.join(uploadDir, product.logo);
if (product.logo && fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath); // Remove existing image
} // Remove existing image
      product.logo = req.file.filename;
    }
    product.name = req.body.name || product.name;
    product.sku = req.body.sku || product.sku;
    product.category = req.body.category || product.category;
    product.source = req.body.source || product.source;
    product.assignedTo = JSON.parse(req.body.assignedTo) || product.assignedTo;


    await product.save();

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.logo) fs.unlinkSync(`${uploadDir}/${product.logo}`); // Remove image

    await Product.deleteOne({ _id: req.params.id });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
