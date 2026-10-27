import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { redisClient } from "../server.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";

export const getAllBlogs = TryCatch(async (req, res) => {
  try {
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
        await sql`SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) AND category=${category} ORDER BY create_at DESC`;
    } else if (searchQuery) {
      blogs =
        await sql`SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})  ORDER BY create_at DESC`;
    } else if (category) {
      // Added this block to handle cases where only a category filter is applied
      blogs =
        await sql`SELECT * FROM blogs WHERE category = ${category} ORDER BY create_at DESC`;
    } else {
      blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
    }

    console.log("serving from db");

    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

    res.json(blogs);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "wrong",
    });
  }
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

  const blog = await sql`SELECT * FROM blogs WHERE id =${blogId}`;

  if (blog.length === 0) {
    res.status(404).json({
      message: "no blog with this id",
    });
    return;
  }

  const { data } = await axios.get(
    `${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`,
  );

  const responseData = { blog: blog[0], author: data };

  await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

  res.json({ blog: blog[0], author: data });
});

//rabbit mq

export const addComment = TryCatch(async (req:AuthenticatedRequest, res) => {
  const { id: blogid } = req.params;
  const { comment } = req.body;
  await sql`INSERT INTO comments (comments,blogid,userid,username) VALUES (${comment},${blogid},${req?.user?._id},${req?.user?.name}) RETURNING * `;

  res.json({
    message: "Comment Added",
  });
});

export const getAllComment = TryCatch(async (req, res) => {
  const { id } = req.params;
  const comments =
    await sql`SELECT * FROM comments WHERE blogid=${id} ORDER BY create_at DESC `;

  res.json(comments);
});

export const deleteComment=TryCatch(async(req:AuthenticatedRequest,res)=>{
  const {commentid}=req.params

  const comment=await sql`SELECT * FROM comments where id=${commentid}`

  if (comment[0]?.userid!==req.user?._id) {
   return res.status(401).json({
      message:"Your are not owner of this comment"
    })

    

  }


  await sql`DELETe FROM comments Where id =${commentid}`
    
   res.json({
    message:"comment delete"
   })
})

export const saveBlog=TryCatch(async(req:AuthenticatedRequest,res)=>{
  const{blogid}=req.params
  const userid=req.user?._id

  if (!blogid&&!userid) {
   return res.status(400).json({
      message:"Missing blog id or userid"
    })
  }

  const existing=await sql`SELECT * FROM savedblog WHERE userid=${userid} AND blogid=${blogid}  `

  if (existing.length==0) {
    await sql`INSERT INTO savedblog (blogid,userid) VALUES (${blogid},${userid}) `
     res.json({
    message:"blog saved"
  })
  return
  }

 else{
  await sql`DELETE FROM  savedblog WHERE userid=${userid} AND  blogid=${blogid}`
 
  res.json({
    message:"Blog unsaved"
  })
return
 }

})

export const getSavedBlog=TryCatch(async(req:AuthenticatedRequest,res)=>{
  const blogs=await sql`SELECT * FROM savedblogs WHERE userid=${req.user?._id}`
 
  res.json(blogs)

})
