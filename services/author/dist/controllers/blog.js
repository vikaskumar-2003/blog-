import TryCatch from "../utils/TryCatch.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
export const createBlog = TryCatch(async (req, res) => {
    const { title, description, blogcontent, category } = req.body;
    console.log("body body", req.body);
    console.log("blogcontent:", blogcontent);
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "No file to upload",
        });
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({
            message: "fail to generate the file",
        });
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });
    const result = await sql `INSERT INTO blogs (title,description,image,blogcontent,category,author) VALUES(${title},${description},${cloud.secure_url},${blogcontent},${category},${req.user?._id})
       RETURNING *
    `;
    res.json({
        message: "blog created ",
        blog: result[0],
    });
});
export const updateBlog = TryCatch(async (req, res) => {
    const { id } = req.params;
    const { title, description, blogcontent, category } = req.body;
    const file = req.file;
    const blog = await sql `SELECT * FROM blogs WHERE id =${id}`;
    if (!blog.length) {
        res.status(404).json({
            message: "No blog with this id",
        });
        return;
    }
    if (blog[0]?.author !== req.user?._id) {
        res.status(401).json({
            message: "You are not the author of this blog",
        });
        return;
    }
    let imageUrl = blog[0]?.image;
    if (file) {
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || !fileBuffer.content) {
            return res.status(400).json({
                message: "fail to generate the file",
            });
        }
        const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
            folder: "blogs",
        });
        imageUrl = cloud.secure_url;
    }
    const updatedBlog = await sql `UPDATE blogs SET
 title =${title || blog[0]?.title},
 description=${description || blog[0]?.description},
 image=${imageUrl},
 blogcontent=${blogcontent || blog[0]?.blogcontent},
  category=${category || blog[0]?.category}


 WHERE id=${id}
 RETURNING *

 `;
    res.json({
        message: "Blog Updated",
        blog: updatedBlog[0],
    });
});
export const deletedBlog = TryCatch(async (req, res) => {
    const blog = await sql `SELECT * FROM blogs WHERE id=${req.params.id}`;
    if (!blog.length) {
        res.status(404).json({
            message: "No blog with this id",
        });
        return;
    }
    if (blog[0]?.author !== req.user?._id) {
        res.status(401).json({
            message: "You are not the author of this blog",
        });
        return;
    }
    await sql `DELETE FROM savedblog WHERE blogid=${req.params.id}`;
    await sql `DELETE FROM comments WHERE blogid=${req.params.id}`;
    await sql `DELETE FROM blogs WHERE id=${req.params.id}`;
    res.json({
        message: "blog delete",
    });
});
//# sourceMappingURL=blog.js.map