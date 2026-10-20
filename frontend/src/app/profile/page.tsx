"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData, user_service } from "@/context/AppContext";
import React, { useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { Instagram, Facebook, Linkedin } from "lucide-react";

const ProfilePage = () => {

 const {user,setUser}=useAppData()
 const InputRef=useRef<HTMLInputElement>(null)
const[loading,setLoading]=useState(false)
 
const clickHandler=()=>{
    InputRef.current?.click()
}

 const changeHandler=async(e:any)=>{
    const file=e.target.files[0]

   if (file) {
      const formData=new FormData()
      formData.append("file",file)

      try {
        setLoading(true)
        const token=Cookies.get("token")
        const {data}=await axios.post(`${user_service}/api/v1/user/update/pic`,formData,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        toast.success(data.message)
        setLoading(false)
        Cookies.set("token",data.token,{
            expires:5,
            secure:true,
            path:"/"
        })
        setUser(data.user)
      } catch (error) {
        toast.error("Image Update Failed")
        setLoading(false)
      }
   }

 }
 

  return <div className="flex justify-center items-center min-h-screen p-4">
   {loading?<Loading/>: <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
            <CardContent className="flex flex-col items-center">
                <Avatar className={'w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer'} onClick={clickHandler}>
                    <AvatarImage src={user?.image} alt="profile pic"  />
                    <input type="file" accept="image/*" className="hidden" ref={InputRef} onChange={changeHandler}/>
                </Avatar>

                <div className="w-full space-y-2 text-center">
                              <label className="font-medium">Name</label>
                              <p>{user?.name}</p>
                </div>

                {
                    user?.bio&& <div className="w-full space-y-2 text-center">
                              <label className="font-medium">Bio</label>
                              <p>{user?.bio}</p>
                </div>
                }

                <div className="flex gap-4 mt-3">
                          {
                            user?.instagram&&<a href={user.instagram} target="_blank" rel="noopner noreferrer">
                             <Instagram className={"text-pink-500"} />
                            
                            </a>
                          }
                            {
                            user?.facebook && <a href={user.facebook} target="_blank" rel="noopner noreferrer">
                             <Facebook className={"text-blue-500"} />
                            
                            </a>
                          }
                            {
                            user?.linkedin&&<a href={user.instagram} target="_blank" rel="noopner noreferrer">
                             <Instagram className={"text-blue-700"} />
                            
                            </a>
                          }
                </div>

            </CardContent>
        </CardHeader>
    </Card>
}
  </div>;
};

export default ProfilePage;
