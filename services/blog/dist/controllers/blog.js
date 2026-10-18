import { redisClient } from "../server.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";
export const getAllBlogs = TryCatch(async (req, res) => {
    const { searchQuery = "", category = "" } = req.query;
    const cacheKey = `blogs:${searchQuery}:${category}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log("serving from redi cache");
        res.json(JSON.parse(cached));
        return;
    }
    let blogs;
    if (searchQuery && category) {
        blogs =
            await sql `SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) AND category=${category} ORDER BY create_at DESC`;
    }
    else if (searchQuery) {
        blogs =
            await sql `SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})  ORDER BY create_at DESC`;
    }
    else if (category) {
        // Added this block to handle cases where only a category filter is applied
        blogs =
            await sql `SELECT * FROM blogs WHERE category = ${category} ORDER BY create_at DESC`;
    }
    else {
        blogs = await sql `SELECT * FROM blogs ORDER BY create_at DESC`;
    }
    console.log("serving from db");
    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });
    res.json(blogs);
});
export const getSingleBlog = TryCatch(async (req, res) => {
    const blogId = req.params.id;
    const cacheKey = `blogs:${blogId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log("serving from single blog redi cache");
        res.json(JSON.parse(cached));
        return;
    }
    const blog = await sql `SELECT * FROM blogs WHERE id =${blogId}`;
    if (blog.length === 0) {
        res.status(404).json({
            message: "no blog with this id",
        });
        return;
    }
    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`);
    const responseData = { blog: blog[0], author: data };
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
    res.json({ blog: blog[0], author: data });
});
//rabbit mq 
//# sourceMappingURL=blog.js.map