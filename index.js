import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(express.json());
//cors policy
app.use(cors());

//database

connectDB(DATABASE_URL);

// load routes
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server Running at http://localhost:${port}`);
});
