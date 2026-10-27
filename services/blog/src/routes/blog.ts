import express from "express"
import { addComment, deleteComment, getAllBlogs, getAllComment, getSavedBlog, getSingleBlog, saveBlog } from "../controllers/blog.js"
import { isAuth } from "../middleware/isAuth.js"

const router=express.Router()

router.get("/blog/all",getAllBlogs)

router.get("/blog/saved/all",isAuth,getSavedBlog)

router.get("/blog/:id",getSingleBlog)

router.get("/comment/:id",getAllComment)

router.delete("/comment/:commentid",isAuth,deleteComment)

router.post("/save/:blogid",isAuth,saveBlog)

router.post("/comment/:id",isAuth,addComment)

export default router
