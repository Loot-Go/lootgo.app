import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Vrf } from "./routes/vrf";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/vrf", Vrf);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
