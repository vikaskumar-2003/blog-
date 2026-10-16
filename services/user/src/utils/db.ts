import mongoose from "mongoose";

export const connectDb=async()=>{
    try {
        mongoose.connect(process.env.MONGO_URI as string,{dbName:"blog"})
        console.log("connect db");
        
    } catch (error) {
        console.log(error);
        
    }
}