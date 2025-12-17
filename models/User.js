import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    age: Number,
    dob: String,
    contact: String
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
