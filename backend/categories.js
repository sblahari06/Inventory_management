const express = require("express");
const router = express.Router();
const pool = require("./db");
router.post("/", async (req, res) => {
    try {
        const { category_name, description } = req.body;

        const newCategory = await pool.query(
            `INSERT INTO inventory.categories
            (category_name, description)
            VALUES ($1, $2)
            RETURNING *`,
            [category_name, description]
        );

        res.json(newCategory.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add category" });
    }
});

// Get all categories
router.get("/", async (req, res) => {
    try {
        const allCategories = await pool.query(
            "SELECT * FROM inventory.categories"
        );

        res.json(allCategories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// Get category by ID
router.get("/:category_id", async (req, res) => {
    try {
        const { category_id } = req.params;

        const category = await pool.query(
            "SELECT * FROM inventory.categories WHERE category_id = $1",
            [category_id]
        );

        if (category.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json(category.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch category" });
    }
});

// Update category
router.put("/:category_id", async (req, res) => {
    try {
        const { category_id } = req.params;
        const { category_name, description } = req.body;

        const updateCategory = await pool.query(
            `UPDATE inventory.categories
            SET category_name = $1, description = $2
            WHERE category_id = $3
            RETURNING *`,
            [category_name, description, category_id]
        );

        if (updateCategory.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json(updateCategory.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update category" });
    }
});

module.exports = router;