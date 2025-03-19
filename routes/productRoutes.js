import { Router } from "express";
import { assignProduct, createProduct, deleteProduct, getCategories, getProductById, getProducts, updateProduct } from "../controllers/productController.js";
import { authAdminMiddleware, authMiddleware } from "../middlewares/authMiddleware.js";
import { check } from "express-validator";
import { compressImage, upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

// Create a new product
router.post(
  "/",
  authMiddleware,
  upload.single("logo"),
  compressImage,
  [
    check("name", "Product name is required").notEmpty(),
    check("sku", "SKU is required").notEmpty(),
    check("sku", "SKU must be at least 3 characters long").isLength({ min: 3 }),
    check("category", "Category is required").notEmpty(),
  ],
  createProduct
);

// Get all products
router.get("/", authMiddleware, getProducts);

// Get product categories (placed before dynamic :id to prevent conflicts)
router.get("/categories", authMiddleware, getCategories);

// Get product by ID
router.get("/:id", authMiddleware, getProductById);

// Update product by ID (Add this if editing a product is needed)
router.put(
  "/:id",
  authMiddleware,
  upload.single("logo"),
  async (req, res, next) => {
    try {
      if (req.file) {
        // If an image is uploaded, validate and compress it
        await compressImage(req, res, next);
      } else {
        // No new image uploaded, skip compression
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  [
    check("name", "Product name is required").optional().notEmpty(),
    check("sku", "SKU must be at least 3 characters long").optional().isLength({ min: 3 }),
    check("category", "Category is required").optional().notEmpty(),
  ],
  updateProduct
);

// Delete product by ID (Add this if deleting a product is needed)
router.delete("/:id", authMiddleware, deleteProduct);

// Assign product to user
router.post(
  "/assign",
  authAdminMiddleware,
  [
    check("productId", "Product ID is required").notEmpty(),
    check("userId", "User ID is required").notEmpty(),
    check("assignedTo", "assignedTo is required").notEmpty(),
  ],
  assignProduct
);
export default router;
