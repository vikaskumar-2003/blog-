import TryCatch from "../utils/TryCatch.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import { invalidateChacheJob } from "../utils/rabbitmq.js";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    await invalidateChacheJob(["blogs:*"]);
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
export const aiTitleResponse = TryCatch(async (req, res) => {
    try {
        const { text } = req.body;
        const prompt = `Correct the grammar of the following blog title and return only the corrected
title without any additional text, formatting, or symbols: "${text}"`;
        let result;
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
            });
            let rawText = response.text;
            if (!rawText) {
                return res.status(400).json({
                    message: "something went wrong",
                });
            }
            result = rawText
                .replace(/\*\*/g, "")
                .replace(/[\r\n]+/g, "")
                .replace(/[*_`~]/g, "")
                .trim();
        }
        await main();
        res.json(result);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message,
        });
    }
});
export const aiDescriptionResponse = TryCatch(async (req, res) => {
    try {
        const { title, description } = req.body;
        const prompt = description === ""
            ? `Generate only one short blog description based on
this title: "${title}". Your response must be only one sentence, strictly under 30 words, with no options, no
greetings, and no extra text. Do not explain. Do not say 'here is'. Just return the description only.`
            : `Fix the
grammar in the following blog description and return only the corrected sentence. Do not add anything else:
"${description}"`;
        let result;
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
            });
            let rawText = response.text;
            if (!rawText) {
                return res.status(400).json({
                    message: "something went wrong",
                });
            }
            result = rawText
                .replace(/\*\*/g, "")
                .replace(/[\r\n]+/g, "")
                .replace(/[*_`~]/g, "")
                .trim();
        }
        await main();
        res.json(result);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message,
        });
    }
});
export const aiBlogResponse = TryCatch(async (req, res) => {
    try {
        const { blog } = req.body;
        if (!blog) {
            return res.status(400).json({
                message: "Please provide blog",
            });
        }
        const prompt = `
You are a grammar correction engine.

I will provide blog content in rich HTML format from Jodit Editor.

Rules:
1. Correct only grammar, spelling, and punctuation.
2. Do not add new ideas or rewrite the content unnecessarily.
3. Preserve all HTML tags, attributes, inline styles, images, links,
   line breaks, and document structure.
4. Do not remove or modify valid HTML attributes.
5. Return only the complete corrected HTML.
6. Do not include Markdown code fences or explanations.
`;
        const fullMessage = `${prompt}\n\n${blog}`;
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({
            model: "gemini-3.8-flash",
        });
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: fullMessage }],
                },
            ],
        });
        const responseText = await result.response.text();
        // Remove Markdown code fences only if present.
        const cleanedHtml = responseText
            .trim()
            .replace(/^```(?:html)?\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();
        console.log(cleanedHtml);
        return res.status(200).json({
            html: cleanedHtml,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({
            message: error.message
        });
    }
});
//# sourceMappingURL=blog.js.map