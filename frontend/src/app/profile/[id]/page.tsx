"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData, User, user_service } from "@/context/AppContext";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect, useParams, useRouter } from "next/navigation";

const UserProfile = () => {

//    const { user, setUser,logoutUser } = useAppData();
 
const[user,setUser]=useState<User|null>(null)

const {id}=useParams()

async function fetchUser(){
           try {
            const {data}=await axios.get(`${user_service}/api/v1/user/${id}`)
            setUser(data)
           } catch (error) {
            console.log(error);
            
           }
}

useEffect(()=>{
    fetchUser()
},[id])


 if(!user){
    return <Loading/>
 }

 return (
    <div className="flex justify-center items-center min-h-screen p-4">
     
        <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
            <CardContent className="flex flex-col items-center">
              <Avatar
                className={
                  "w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer"
                }
                 
              >
                <AvatarImage src={user?.image} alt="profile pic" />
                 
              </Avatar>

              <div className="w-full space-y-2 text-center">
                <label className="font-medium">Name</label>
                <p>{user?.name}</p>
              </div>

              {user?.bio && (
                <div className="w-full space-y-2 text-center">
                  <label className="font-medium">Bio</label>
                  <p>{user?.bio}</p>
                </div>
              )}

              <div className="flex gap-4 mt-3">
                {user?.instagram && (
                  <a
                    href={user.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className={"text-pink-500"} size={24} />
                  </a>
                )}
                {user?.facebook && (
                  <a
                    href={user.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className={"text-blue-500"} size={24} />
                  </a>
                )}
                {user?.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className={"text-blue-700"} size={24} />
                  </a>
                )}
              </div>

               
            </CardContent>
          </CardHeader>
        </Card>
      
    </div>
  );
}

export default UserProfile