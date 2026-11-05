const express = require("express");
const router = express.Router();
const pool = require("./db");

// Add stock transaction and update product quantity
router.post("/", async (req, res) => {
    const {
        product_id,
        transaction_type,
        quantity,
        reason,
        user_id,
    } = req.body;

    const productId = Number(product_id);
    const stockQuantity = Number(quantity);
    const transactionType = String(transaction_type || "").trim().toUpperCase();
    const userId = Number(user_id);
    const transactionReason = String(reason || "").trim();

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "A valid product ID is required.",
        });
    }

    if (!["IN", "OUT"].includes(transactionType)) {
        return res.status(400).json({
            message: "Transaction type must be IN or OUT.",
        });
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity <= 0) {
        return res.status(400).json({
            message: "Quantity must be a positive whole number.",
        });
    }

    if (!transactionReason) {
        return res.status(400).json({
            message: "A reason is required for the stock transaction.",
        });
    }

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            message: "A valid logged-in user ID is required. Please sign in again.",
        });
    }

    let client;
    let transactionStarted = false;

    try {
        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // Verify the user exists.
        const userResult = await client.query(
            `SELECT user_id
             FROM inventory.users
             WHERE user_id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                message: "The logged-in user was not found. Please sign in again.",
            });
        }

        // Lock the product row while calculating and updating stock.
        const productResult = await client.query(
            `SELECT product_id, quantity, unit_price
             FROM inventory.products
             WHERE product_id = $1
             FOR UPDATE`,
            [productId]
        );

        if (productResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Product not found.",
            });
        }

        const product = productResult.rows[0];
        const previousQuantity = Number(product.quantity);
        const unitPrice = Number(product.unit_price);

        const newQuantity =
            transactionType === "IN"
                ? previousQuantity + stockQuantity
                : previousQuantity - stockQuantity;

        if (newQuantity < 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                message: "Insufficient stock for this stock-out transaction.",
            });
        }

        const amount = stockQuantity * unitPrice;

        // Update the quantity shown on the Products page.
        await client.query(
            `UPDATE inventory.products
             SET quantity = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE product_id = $2`,
            [newQuantity, productId]
        );

        // Save the movement history.
        const transactionResult = await client.query(
            `INSERT INTO inventory.stock_transactions
                (product_id, transaction_type, quantity,
                 previous_quantity, new_quantity, unit_price,
                 amount, reason, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                productId,
                transactionType,
                stockQuantity,
                previousQuantity,
                newQuantity,
                unitPrice,
                amount,
                transactionReason,
                userId,
            ]
        );

        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(201).json({
            message: "Stock transaction added and product quantity updated successfully.",
            transaction: transactionResult.rows[0],
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError.message);
            }
        }

        console.error("Error adding stock transaction:", error);

        return res.status(500).json({
            message: "Failed to add stock transaction.",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Get all stock transactions
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM inventory.stock_transactions
             ORDER BY transaction_id DESC`
        );

        return res.json(result.rows);
    } catch (error) {
        console.error("Error fetching stock transactions:", error);

        return res.status(500).json({
            message: "Failed to fetch stock transactions.",
        });
    }
});

// Get one stock transaction
router.get("/:id", async (req, res) => {
    try {
        const transactionId = Number(req.params.id);

        if (!Number.isInteger(transactionId) || transactionId <= 0) {
            return res.status(400).json({
                message: "A valid transaction ID is required.",
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM inventory.stock_transactions
             WHERE transaction_id = $1`,
            [transactionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Transaction not found.",
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching stock transaction:", error);

        return res.status(500).json({
            message: "Failed to fetch stock transaction.",
        });
    }
});

module.exports = router;