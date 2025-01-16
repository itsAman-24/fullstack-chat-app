import React, { useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const StoryUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(""); // To track the file type
  const [isUploading, setIsUploading] = useState(false); // To track upload status

  const handleImageUpload = async (e) => {
    const selectedFile = e.target.files[0];
    // console.log(selectedFile);

    if (!selectedFile) return;

    setFileType(selectedFile.type); // Save the file type before converting

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onload = async () => {
      const base64Image = reader.result;
      setFile(base64Image);
      setPreview(base64Image);
      await uploadStory({ story: base64Image });
    };
  };

  const uploadStory = async (data) => {
    // console.log("this is my data: ", data);

    setIsUploading(true); // Start uploading

    try {
      const res = await axiosInstance.put("/messages/upload-story", data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setPreview(null);
      toast.success("Story uploaded successfully");
    } catch (error) {
      console.log("error in upload story:", error);
      toast.error(error.response?.data?.message || "Failed to upload story");
    } finally {
      setIsUploading(false); // Stop uploading
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center space-x-4">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*, video/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex text-center items-center justify-center w-[65px] h-[65px] bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[13px] rounded-full hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer shadow-md">
            Upload Story
          </div>
        </label>
        {preview && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
            {fileType.startsWith("image/") ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={preview}
                controls
                className="w-full h-full object-cover"
              />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-xs font-semibold animate-pulse">
                  Uploading...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryUpload;
