import dotenv from "dotenv";
dotenv.config({
    quiet: true
});
import express from "express";
import { connectDb } from "./utils/db.js";
import userRoutes from "./routes/user.js";
const app = express();
const PORT = process.env.PORT || 5000;
connectDb();
app.use(express.json());
app.use("/api/v1/", userRoutes);
app.listen(PORT, () => {
    console.log("server is running", PORT);
});
//# sourceMappingURL=server.js.map