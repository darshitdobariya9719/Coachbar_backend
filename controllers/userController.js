import { validationResult } from "express-validator";
import User from "../models/User.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
// Get the correct __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload directory
const uploadDir = path.join(__dirname, "../public/uploads");

export async function registerUser(req, res) {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function loginUser(req, res) {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    res.json({ token, user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUsers(req, res) {
  try {
    let { page = 1, limit = 5, sort = 'name', order = 'asc' } = req.query;

    order = order === 'desc' ? -1 : 1;
    const query = User.find().select("-password").sort({ [sort]: order });

    if (req.query.limit) {
      query.skip((page - 1) * limit).limit(limit);
    }

    const users = await query;
    const total = await User.countDocuments();
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function uploadProfilePicture(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log('user: ', user);

    if (user.profile && fs.existsSync(`${uploadDir}/${user.profile}`)) fs.unlinkSync(`${uploadDir}/${user.profile}`); // Remove image

    user.profile = req.file.filename;
    console.log('req.file.filename: ', req.file.filename);
    console.log('user: ', user);

    await user.save();

    res.json({ message: "Profile picture uploaded successfully" });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid old password" });

    user.password = await hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


