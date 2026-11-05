const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
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

// Keep your other API imports and app.use() statements here.

app.listen(3000, () => {
    console.log("Server has started on port 3000");
});