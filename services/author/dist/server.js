import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import { sql } from "./utils/db.js";
import blogRoutes from "./routes/blog.js";
const app = express();
cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECERT
});
const PORT = process.env.PORT || 5001;
async function initDB() {
    try {
        await sql `
        CREATE TABLE IF NOT EXISTS blogs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        blogcontent VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT  CURRENT_TIMESTAMP)
        `;
        await sql `
        CREATE TABLE IF NOT EXISTS comments(
        id SERIAL PRIMARY KEY,
        comments VARCHAR(255) NOT NULL,
        userid VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT  CURRENT_TIMESTAMP)
        `;
        await sql `
        CREATE TABLE IF NOT EXISTS savedblog(
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
         create_at TIMESTAMP DEFAULT  CURRENT_TIMESTAMP)
        `;
        console.log("database intialize successfully");
    }
    catch (error) {
        console.log("error", error);
    }
}
app.use(express.json());
app.use("/api/v1", blogRoutes);
initDB().then(() => {
    app.listen(PORT, () => {
        console.log("server is running on author");
    });
});
//# sourceMappingURL=server.js.map