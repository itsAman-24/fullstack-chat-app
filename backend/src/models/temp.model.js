import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: "10m" } }, // Automatically deletes after 10 minutes
  },
  { timestamps: true }
);

const TempUser = mongoose.model("TempUser", tempUserSchema);

export default TempUser;
