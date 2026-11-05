const express = require("express");
const router = express.Router();
const pool = require("./db");

// Add supplier
router.post("/", async (req, res) => {
    try {
        const {
            supplier_name,
            phone,
            email,
            address
        } = req.body;

        const newSupplier = await pool.query(
            `INSERT INTO inventory.suppliers
            (supplier_name, phone, email, address)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [supplier_name, phone, email, address]
        );

        res.status(201).json(newSupplier.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to add supplier"
        });
    }
});

// Get all suppliers
router.get("/", async (req, res) => {
    try {
        const allSuppliers = await pool.query(
            "SELECT * FROM inventory.suppliers"
        );

        res.json(allSuppliers.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to fetch supplier details"
        });
    }
});

// Get supplier by ID
router.get("/:supplier_id", async (req, res) => {
    try {
        const { supplier_id } = req.params;

        const supplier = await pool.query(
            `SELECT * FROM inventory.suppliers
             WHERE supplier_id = $1`,
            [supplier_id]
        );

        if (supplier.rows.length === 0) {
            return res.status(404).json({
                error: "Supplier not found"
            });
        }

        res.json(supplier.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to fetch supplier"
        });
    }
});

// Update supplier
router.put("/:supplier_id", async (req, res) => {
    try {
        const { supplier_id } = req.params;

        const {
            supplier_name,
            phone,
            email,
            address
        } = req.body;

        const updateSupplier = await pool.query(
            `UPDATE inventory.suppliers
             SET supplier_name = $1,
                 phone = $2,
                 email = $3,
                 address = $4
             WHERE supplier_id = $5
             RETURNING *`,
            [
                supplier_name,
                phone,
                email,
                address,
                supplier_id
            ]
        );

        if (updateSupplier.rows.length === 0) {
            return res.status(404).json({
                error: "Supplier not found"
            });
        }

        res.json({
            message: "Supplier updated successfully",
            supplier: updateSupplier.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to update supplier"
        });
    }
});

module.exports = router;