
import mongoose, { Schema,type Document } from "mongoose";

export interface IUser extends Document{
    name:string,
    email:string,
    image:string,
    instagram:string,
    facebook:string,
    linkedin:string,
    bio:string,
   
}


const userSchema=new mongoose.Schema<IUser>({

 name:{
    type:String,
    required:true
 },
 email:{
    type:String,
    required:true,
    unique:true
 },
 image:{
    type:String,
    required:true
 },
 instagram:{
    type:String,
    
 },
 facebook:{
    type:String,
    
 },
 linkedin:{
    type:String,
    
 },
 bio:String

},{
    timestamps:true
})


export const User=mongoose.model<IUser>("User",userSchema)