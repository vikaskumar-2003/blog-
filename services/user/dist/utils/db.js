import mongoose from "mongoose";
export const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI, { dbName: "blog" });
        console.log("connect db");
    }
    catch (error) {
        console.log(error);
    }
};
//# sourceMappingURL=db.js.map