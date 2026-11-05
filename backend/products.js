const express = require("express");
const router = express.Router();
const pool = require("./db");

// Add product
router.post("/", async (req, res) => {
    try {
        const {
            product_code,
            product_name,
            category_id,
            supplier_id,
            unit_price,
            quantity,
            reorder_level,
        } = req.body;

        const newProduct = await pool.query(
            `INSERT INTO inventory.products
            (product_code, product_name, category_id, supplier_id,
             unit_price, quantity, reorder_level)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                product_code,
                product_name,
                category_id,
                supplier_id,
                unit_price,
                quantity,
                reorder_level,
            ]
        );

        res.status(201).json(newProduct.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to add product"
        });
    }
});

// Fetch all products
router.get("/", async (req, res) => {
    try {
        const allProducts = await pool.query(
            "SELECT * FROM inventory.products"
        );

        res.json(allProducts.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to fetch products"
        });
    }
});

// Fetch one product
router.get("/:product_id", async (req, res) => {
    try {
        const { product_id } = req.params;

        const product = await pool.query(
            `SELECT * FROM inventory.products
             WHERE product_id = $1`,
            [product_id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json(product.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to fetch product"
        });
    }
});

// Update product
router.put("/:product_id", async (req, res) => {
    try {
        const { product_id } = req.params;

        const {
            product_code,
            product_name,
            category_id,
            supplier_id,
            unit_price,
            quantity,
            reorder_level,
        } = req.body;

        const updateProduct = await pool.query(
            `UPDATE inventory.products
             SET product_code = $1,
                 product_name = $2,
                 category_id = $3,
                 supplier_id = $4,
                 unit_price = $5,
                 quantity = $6,
                 reorder_level = $7,
                 updated_at = CURRENT_TIMESTAMP
             WHERE product_id = $8
             RETURNING *`,
            [
                product_code,
                product_name,
                category_id,
                supplier_id,
                unit_price,
                quantity,
                reorder_level,
                product_id,
            ]
        );

        if (updateProduct.rows.length === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json(updateProduct.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to update product"
        });
    }
});

// Delete product
router.delete("/:product_id", async (req, res) => {
    try {
        const { product_id } = req.params;

        const deleteProduct = await pool.query(
            `DELETE FROM inventory.products
             WHERE product_id = $1
             RETURNING *`,
            [product_id]
        );

        if (deleteProduct.rows.length === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to delete product"
        });
    }
});

module.exports = router;