const express = require("express");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");

dotenv.config("./.env");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

const sslOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // app.listen(5000, () => console.log("Server running on port 5000"));
    console.log("MongoDB connected");

    https.createServer(sslOptions, app).listen(443, () => {
      console.log("Server running on port 443");
    });
  })
  .catch((err) => console.log(err));
