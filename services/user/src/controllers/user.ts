import type { Request, Response } from "express";
import { User } from "../model/User.js";
import jwt from "jsonwebtoken"
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";



export const loginUser=TryCatch(async (req:Request,res:Response) => {
     const{email,name,image}=req.body

    let user=await User.findOne({email})

    if(!user){
        user=await User.create({
            name,
            email,
            image
        })
    }

    const token=jwt.sign({user},process.env.JWT_SECERT_KEY as string,{expiresIn:"5d"})
 
    res.status(200).json({
        message:"Login success",
        user,
        token
    })
})

export const myProfile=TryCatch(async (req:AuthenticatedRequest,res:Response) => {
    
 const user=req.user

   res.json(user)

})


export const getUserProfile=TryCatch(async(req,res)=>{
    
    const user=await User.findById(req.params.id)

    if (!user) {
        res.status(404).json({
            message:"no user with this id"
        })
        return
    }

    res.json(user)

})


export const updateUser=TryCatch(async(req:AuthenticatedRequest,res)=>{

  const {name,instagram,facebook,linkedin,bio}=req.body

  const user=await User.findByIdAndUpdate(req.user?.id)


})
