import mongoose, { Schema } from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    instagram: {
        type: String,
    },
    facebook: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    bio: String
}, {
    timestamps: true
});
export const User = mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map