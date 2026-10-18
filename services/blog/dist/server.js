import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer.js";
const app = express();
const port = process.env.PORT || 5002;
startCacheConsumer();
export const redisClient = createClient({
    url: process.env.REDIS_URL
});
redisClient.connect()
    .then(() => console.log("connected to redis"))
    .catch(console.error);
app.use(express.json());
app.use("/api/v1", blogRoutes);
app.listen(port, () => {
    console.log("server is running", port);
});
app.listen;
//# sourceMappingURL=server.js.map