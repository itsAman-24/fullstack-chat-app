import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // console.log("Setting cookie with token:", token);
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};


// utils/verificationCodeStore.js

const verificationCodes = {}; // In-memory store (use Redis or database in production)

export const saveVerificationCode = (email, code) => {
  // Save the verification code with an expiration time (e.g., 15 minutes)
  verificationCodes[email] = { code, expiresAt: Date.now() + 15 * 60 * 1000 }; // Expire in 15 minutes
};

export const getStoredVerificationCode = (email) => {
  const storedCode = verificationCodes[email];

  if (storedCode && Date.now() < storedCode.expiresAt) {
    return storedCode.code;
  }

  // If code is expired or not found
  delete verificationCodes[email]; // Clean up expired codes
  return null;
};
