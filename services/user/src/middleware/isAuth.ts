import type { IUser } from './../model/User.js';
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"


export interface AuthenticatedRequest extends Request{
    user?:IUser |null
}

export const isAuth=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{

    try {

    const authHeader=req.headers.authorization

    if (!authHeader ||!authHeader.startsWith("Bearer")) {
        res.status(401).json({
            message:"Please Login-Noauth header"
        })
        return
    }

    const token=authHeader.split(" ")[1]

     if (!token) {
  res.status(401).json({
    message: "Invalid authorization token",
  });
  return;
}


     const decodedValue=jwt.verify(token,process.env.JWT_SECERT_KEY as string) as JwtPayload

     if(!decodedValue || !decodedValue.user){
        res.status(401).json({
            message:"invalid token"
        })
        return
     }

     req.user=decodedValue.user
     next()
        
    } catch (error) {
        console.log("jwt verification error",error);
        res.status(401).json({
            message:"please login -jwt error"
        })
        
    }


}