"use client";

import React, { useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { author_service, useAppData } from "@/context/AppContext";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
});

export const blogCategories = [
  "Technology",
  "Health",
  "Finance",
  "Travel",
  "Education",
  "Enteraiment",
  "Study",
];

const AddBlog = () => {
  const { fetchBlogs } = useAppData;
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    blogcontent: "",
  });

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("blogcontent", formData.blogcontent);
    formDataToSend.append("category", formData.category);

    if (formData.image) {
      formDataToSend.append("file", formData.image);
    }

    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${author_service}/api/v1/blog/new`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(data.message);
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogcontent: "",
      });
      setContent("");
      fetchBlogs()
    } catch (error) {
      console.log(error);

      setLoading(false);
      toast.error("error while adding blog");
    } finally {
      setLoading(false);
    }
  };

  const [aiTitle, setAiTitle] = useState(false);
  const [aiDescripiton, setAiDescripition] = useState(false);
  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/title`, {
        text: formData.title,
      });
      setFormData((prev) => ({
        ...prev,
        title: typeof data === "string" ? data : data.title,
      }));
    } catch (error) {
      toast.error("problem while fetching from all");
      console.log(error);
    } finally {
      setAiTitle(false);
    }
  };

  const aiDescriptionResponse = async () => {
    try {
      setAiDescripition(true);
      const { data } = await axios.post(
        `${author_service}/api/v1/ai/description`,
        {
          title: formData.title,
          description: formData.description,
        },
      );
      setFormData((prev) => ({
        ...prev,
        description: typeof data === "string" ? data : data.description,
      }));
    } catch (error) {
      toast.error("problem while fetching from all");
      console.log(error);
    } finally {
      setAiDescripition(false);
    }
  };

  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/blog`, {
        blog: formData.blogcontent,
      });
      setContent(data.html);
      setFormData({ ...formData, blogcontent: data.html });
    } catch (error) {
      toast.error("problem while fetching from all");
      console.log(error);
    } finally {
      setAiBlogLoading(false);
    }
  };

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    [],
  );
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Add New Blog</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>

              <div className="flex justify-center items-center gap-2">
                <Input
                  value={formData.title}
                  onChange={handleInputChange}
                  id="title"
                  name="title"
                  className={
                    aiTitle ? "animate-pulse placeholder:opacity-60" : ""
                  }
                  placeholder="Enter blog title"
                  required
                />

                {formData.title === "" ? (
                  ""
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={aiTitleResponse}
                    disabled={aiTitle}
                  >
                    <RefreshCw
                      className={aiTitle ? "animate-spin" : ""}
                      size={18}
                    />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <div className="flex justify-center items-center gap-2">
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  className={
                    aiDescripiton ? "animate-pulse placeholder:opacity-60" : ""
                  }
                  onChange={handleInputChange}
                  placeholder="Enter blog description"
                  required
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={aiDescriptionResponse}
                  disabled={aiDescripiton}
                >
                  <RefreshCw
                    size={18}
                    className={aiDescripiton ? "animate-spin" : ""}
                  />
                </Button>
              </div>
            </div>
            <Label>Category</Label>
            <Select
              onValueChange={(value: any) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={formData.category || "Select category"}
                />
              </SelectTrigger>
              <SelectContent>
                {blogCategories?.map((e, i) => {
                  return (
                    <SelectItem key={i} value={e}>
                      {e}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <div>
              <Label>Image Upload</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Past your blog or type here. You can use rich text
                  formating.Please add image after improving your grammer
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading}
                >
                  <RefreshCw
                    size={16}
                    className={aiBlogLoading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">Fix Grammer</span>
                </Button>
              </div>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  (setContent(newContent),
                    setFormData({ ...formData, blogcontent: newContent }));
                }}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting" : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;
