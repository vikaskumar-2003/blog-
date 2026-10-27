import dotenv from "dotenv";
dotenv.config({ quiet: true });
import cors from "cors";
import express from "express";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer.js";
const app = express();
const port = process.env.PORT || 5002;
if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is missing from environment variables");
}
export const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => Math.min(retries * 1000, 5000),
    },
});
redisClient.on("error", (err) => {
    console.error("Redis error:", err.message);
});
redisClient.on("ready", () => {
    console.log("Redis is ready");
});
app.use(express.json());
app.use(cors());
app.use("/api/v1", blogRoutes);
async function startServer() {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
        // Start the consumer only after Redis is connected.
        await startCacheConsumer();
        app.listen(port, () => {
            console.log("Server is running on port", port);
        });
    }
    catch (error) {
        console.error("Startup failed:", error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map