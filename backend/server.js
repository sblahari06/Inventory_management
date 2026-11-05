const { readFile } = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const categories = require("./categories");
const users = require("./users");
const suppliers = require("./suppliers");
const products = require("./products")
const transactions = require("./transactions")


app.use("/categories", categories);
app.use("/users",users);
app.use("/suppliers", suppliers);
app.use("/products",products);
app.use("/transactions",transactions);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

const port = process.env.PORT || 3000;

async function startServer() {
    const schema = await readFile(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);

    app.listen(port, "0.0.0.0", () => {
        console.log(`Server has started on port ${port}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to initialize database and start server:", error);
    process.exit(1);
});