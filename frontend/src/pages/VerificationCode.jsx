import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const EnterVerificationCode = ({ onSubmit }) => {
  const [code, setCode] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const { verifyEmail } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonDisabled(true); // Disable the button after submit
    await verifyEmail(code);
  };

  const handleInputChange = (e) => {
    setCode(e.target.value);
    setIsButtonDisabled(false); // Enable the button when input changes
  };

  useEffect(() => {
    // Reset button disabled state when the code changes
    setIsButtonDisabled(code.trim() === "");
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4 sm:px-6 md:px-8">
      <div className="bg-stone-300 p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Enter Verification Code
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          A verification code has been sent to your email. Please enter it below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 text-center"
            >
              Verification Code
            </label>
            <input
              type="text"
              inputmode="numeric"
              id="verificationCode"
              value={code}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter code"
            />
          </div>
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full py-2 px-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Submit Code
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterVerificationCode;
