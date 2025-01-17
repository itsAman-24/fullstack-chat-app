import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js"; // Update the path as per your project structure

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email"); // Extract the email from query parameters
  const [verificationCode, setVerificationCode] = useState(""); // State to hold the code input
  const verifyEmail = useAuthStore((state) => state.verifyEmail); // Access the verifyEmail function from the store

  const handleVerify = () => {
    if (!verificationCode) {
      alert("Please enter the verification code.");
      return;
    }
    verifyEmail(email, verificationCode); // Call the verifyEmail function with email and code
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Email Verification</h1>
        <p className="text-gray-600 mb-6">
          We sent a verification code to your email:{" "}
          <span className="font-semibold text-blue-600">{email}</span>
        </p>
        <input
          type="text"
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="w-full px-4 py-2 mb-4 border text-center rounded-md text-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleVerify}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          Verify Email
        </button>
      </div>
    </div>
  );
};

export default VerifyPage;
