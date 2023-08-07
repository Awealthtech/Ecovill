const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const dotenv = require("dotenv");
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/static", express.static(path.join(__dirname, "public")));

// mongodb URI
const DB_URI = process.env.MONGOLAB_URI;

// Routes
app.use("/api", userRoutes);
app.use("/", require("./routes/otpRoutes.js"));
app.use("/payment", require("./routes/paymentRoutes"));

// Start the server
mongoose
  .connect(DB_URI)
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });
