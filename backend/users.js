const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("./db");

// Register user
router.post("/", async (req, res) => {
    try {
        const { username, email, role, password } = req.body;

        if (!username || !email || !role || !password) {
            return res.status(400).json({
                error: "All fields are required."
            });
        }

        const existingUser = await pool.query(
            "SELECT user_id FROM inventory.users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: "Email is already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO inventory.users
            (username, email, role, password)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, username, email, role`,
            [username, email, role, passwordHash]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error("USER REGISTRATION ERROR:", err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Get all users
router.get("/", async (req, res) => {
    try {
        const allUsers = await pool.query(
            `SELECT user_id, username, email, role
             FROM inventory.users
             ORDER BY user_id`
        );

        res.json(allUsers.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to fetch users"
        });
    }
});

// Get user by ID
router.get("/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await pool.query(
            `SELECT user_id, username, email, role
             FROM inventory.users
             WHERE user_id = $1`,
            [user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json(user.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to fetch user"
        });
    }
});

// Update user
router.put("/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const { username, email, role, password } = req.body;

        if (!username || !email || !role) {
            return res.status(400).json({
                error: "Username, email and role are required."
            });
        }

        let updateUser;

        if (password && password.trim() !== "") {
            const passwordHash = await bcrypt.hash(password, 10);

            updateUser = await pool.query(
                `UPDATE inventory.users
                 SET username = $1, email = $2, role = $3, password = $4
                 WHERE user_id = $5
                 RETURNING user_id, username, email, role`,
                [username, email, role, passwordHash, user_id]
            );
        } else {
            updateUser = await pool.query(
                `UPDATE inventory.users
                 SET username = $1, email = $2, role = $3
                 WHERE user_id = $4
                 RETURNING user_id, username, email, role`,
                [username, email, role, user_id]
            );
        }

        if (updateUser.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json({
            message: "User updated successfully",
            user: updateUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Failed to update user"
        });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const result = await pool.query(
            `SELECT user_id, username, email, role, password
             FROM inventory.users
             WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        res.json({
            message: "Login successful",
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({
            message: "Login failed"
        });
    }
});

module.exports = router;