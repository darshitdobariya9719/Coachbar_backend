import { Router } from "express";
import { registerUser, loginUser, getUsers, uploadProfilePicture, updateUser, getCurrentUser, updatePassword } from "../controllers/userController.js";
import { authAdminMiddleware, authMiddleware } from "../middlewares/authMiddleware.js";
import { check } from "express-validator";
import { compressImage, upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

// User Creation
router.post(
  "/register",
  authAdminMiddleware,
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
    check("role", "Role must be either 'admin' or 'user'").isIn(["admin", "user"]),
  ],
  registerUser
);

// User Login
router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  loginUser
);

// Get all users
router.get("/", authAdminMiddleware, getUsers);

// Upload profile picture
router.post("/upload-profile-pic", authMiddleware, upload.single("profile"), compressImage, uploadProfilePicture);

// Update user
router.put(
  "/update",
  authMiddleware,
  [
    check("name", "Name is required").notEmpty(),
  ],
  updateUser
);

// Update password
router.put(
  "/update-password",
  authMiddleware,
  [
    check("oldPassword", "Old Password is required").notEmpty(),
    check("newPassword", "New Password is required").notEmpty(),
    check("newpassword", "New Password must be at least 6 characters long").isLength({ min: 6 }),
  ],
  updatePassword
);

// Get Current User
router.get("/me", authMiddleware, getCurrentUser);



export default router;
