"use client";

import React, { useEffect, useState } from "react";
import { author_service, Blog, blog_service, useAppData, User } from "@/context/AppContext";

import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/components/loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Edit, Trash2, Trash2Icon, User2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Comments {
  id:string
  userid: string;
  comments: string;
  create_at: string;
  username: string;
}

const BlogPage = () => {
  const { isAuth, user,fetchBlogs,savedBlogs,getSavedBlogs } = useAppData();
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comments[]>([]);

 async function fetchComments() {
  try {
    const { data } = await axios.get(
      `${blog_service}/api/v1/comment/${id}`
    );

    setComments(data.comments ?? data);
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}

 const deleteComment=async(id:string)=>{
  if(confirm("Are you sure you want to delete this comment")){
 try {
    setLoading(true);

    const token = Cookies.get("token");

    const { data } = await axios.delete(
      `${blog_service}/api/v1/comment/${id}`,
    
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(data.message);
    

    await fetchComments();
  } catch (error) {
    toast.error("proble while deleting comment")
  }
  finally{
    setLoading(false)
  }
  }
 
 }

  useEffect(() => {
    console.log("hi by use");

    fetchComments();
  }, [id]);

 async function fetchSingleBlog() {
  try {
    setLoading(true);
console.log("data nahi id",id);

    const { data } = await axios.get(
      `${blog_service}/api/v1/blog/${id}`
    );
    console.log("data wala data",data);
    

    setBlog(data.blog);
    setAuthor(data.author);
  } catch (error) {
    console.error("Error fetching blog:", error);
  } finally {
    setLoading(false);
  }
}



 async function deleteBlog(){
  
   if(confirm("Are you sure you want to delete this comment")){
 try {
    setLoading(true);

    const token = Cookies.get("token");

    const { data } = await axios.delete(
      `${author_service}/api/v1/blog/${id}`,
    
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(data.message);
    router.push("/blogs")
    setTimeout(()=>{
      fetchBlogs()
    },4000)

    
  } catch (error) {
    toast.error("proble while deleting comment")
  }
  finally{
    setLoading(false)
  }
  }


 }

  const[saved,setSaved]=useState(false)

  useEffect(()=>{

  if(savedBlogs&& savedBlogs.some((b)=>b.blogid===id)){
    setSaved(true)
  }
  else{
    setSaved(false)
  }

  },[savedBlogs,id])

 async function saveBlog(){
  const token=Cookies.get("token")
  try {
    setLoading(true)
    const{data}=await axios.post(`${blog_service}/api/v1/save/${id}`,{},{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    toast.success(data.message)
    setSaved(!saved)
    getSavedBlogs()
  } catch (error) {
    toast.error("problem  while saving blog")
  }
  finally{
    setLoading(false)
  }
 }


  useEffect(() => {
    fetchSingleBlog();
  }, [id]);

  console.log(blog?.title);

  if (!blog) {
    return <Loading />;
  }

 async function addComment() {
  if (!comment.trim()) {
    toast.error("Please enter a comment");
    return;
  }

  try {
    setLoading(true);

    const token = Cookies.get("token");

    const { data } = await axios.post(
      `${blog_service}/api/v1/comment/${id}`,
      { comment: comment.trim() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(data.message);
    setComment("");

    await fetchComments();
  } catch (error) {
    toast.error("Problem while adding comment");
    console.error(error);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="w-[500px]">
        <CardHeader className="w-full">
          <h1 className="text-3xl font-bold text-gray-900">{blog?.title}</h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <Link href={`/profile/${author?._id}`}>
              <img src={author?.image} className="w-8 h-8 rounded-full" />
              {author?.name}
            </Link>
            {isAuth && (
              <Button variant={"ghost"} className={"mx-3"} size={"lg"} disabled={loading} onClick={saveBlog} >
                {saved?<BookmarkCheck/>:<Bookmark />}
              </Button>
            )}
            {blog.author === user?._id && (
              <>
                <Button
                  size={"sm"}
                  onClick={() => router.push(`/blog/edit/${id}`)}
                >
                  <Edit />
                </Button>
                <Button variant={"destructive"} size={"sm"} onClick={deleteBlog} disabled={loading} >
                  <Trash2Icon />
                </Button>
              </>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <img
            src={blog.image}
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt=""
          />
          <p className="text-lg text-gray-700 mb-4">{blog.description}</p>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
          />
        </CardContent>
      </Card>
      {isAuth && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Leave a comment</h3>
          </CardHeader>
          <CardContent>
            <Label htmlFor="comment">Your Comment</Label>
            <Input
              id="comment"
              placeholder="Type your comment here"
              className="my-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={addComment} disabled={loading}>
              {loading ? "Adding Comment" : "Post Comment"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">All COMMENTS</h3>
        </CardHeader>
        {comments && comments.length > 0 ? (
          comments.map((e, i) => {
            console.log(e);
            
            return (
              <div key={i} className="border-b py-2 flex items-center gap-3">
                <div>
                <p className="font-semibold flex items-center gap-1">
                  <span className="user border border-gray-400 rounded-full p-1 m-2">
                    <User2 />
                  </span>
                  {e.username}
                   
                </p>
               <p className="m-2" >{e.comments}</p>
                <p className="text-xs text-gray-500 m-2">
                  {new Date(e.create_at).toLocaleString()}
                </p>
                </div>
                {e.userid===user?._id&& <Button variant={"destructive"} disabled={loading} onClick={()=>deleteComment(e.id)}>
                  <Trash2   />
                  </Button>}
              </div>
            );
          })
        ) : (
          <p>No Comments Yet</p>
        )}
      </Card>
    </div>
  );
};

export default BlogPage;
