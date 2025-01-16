import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore.js";

const StoryList = () => {
  const { status, getStory } = useChatStore();
  const [selectedUserStories, setSelectedUserStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [viewedStories, setViewedStories] = useState(new Set());

  useEffect(() => {
    getStory();
    const savedViewedStories =
      JSON.parse(localStorage.getItem("viewedStories")) || [];
    setViewedStories(new Set(savedViewedStories));

    const intervalId = setInterval(() => {
      getStory();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [getStory]);

  const handleStoryClick = (userStories) => {
    // Sort userStories by creation time in descending order
    const sortedStories = [...userStories].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setSelectedUserStories(sortedStories);
    setCurrentStoryIndex(0);

    const updatedViewedStories = new Set(viewedStories);
    sortedStories.forEach((story) => updatedViewedStories.add(story._id));
    setViewedStories(updatedViewedStories);
    localStorage.setItem(
      "viewedStories",
      JSON.stringify([...updatedViewedStories])
    );
  };

  const handleNextStory = () => {
    if (currentStoryIndex < selectedUserStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      setSelectedUserStories([]);
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  // Group stories by userId
  const groupedStories = status.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    return acc;
  }, {});

  return (
    <div className="p-2">
      <div className="overflow-y-auto h-full max-h-[400px] max-w-[150px] sm:max-w-[400px] md:max-w-[640px] lg:max-w-[720px]  scroll-container scrollbar-none">
        <div className="inline-flex space-x-4 overflow-x-auto pb-4">
          {Object.values(groupedStories).map((userStories) => {
            const firstStory = userStories[0];
            const isViewed = userStories.every((story) =>
              viewedStories.has(story._id)
            );

            return (
              <div
                key={firstStory.userId}
                className={`inline-block flex-shrink-0 w-[70px] h-[70px] rounded-full overflow-hidden relative group cursor-pointer ${
                  isViewed
                    ? "bg-gray-200"
                    : "border-1 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 p-1"
                }`}
                onClick={() => handleStoryClick(userStories)}
              >
                <div className="w-full h-full bg-white rounded-full overflow-hidden">
                  <img
                    src={firstStory.mediaUrl}
                    alt="Story"
                    className="w-full h-full object-cover filter blur-sm group-hover:blur-none transition-all"
                  />
                </div>
                <div className="absolute inset-0 flex text-center items-center justify-center text-white text-xs font-semibold">
                  {firstStory.username}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Stories */}
      {selectedUserStories.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg relative w-full max-w-md">
            <img
              src={selectedUserStories[currentStoryIndex].mediaUrl}
              alt={`Story ${currentStoryIndex + 1}`}
              className="w-full h-96 object-cover rounded-lg border border-gray-400"
            />

            <div className="mt-2 text-center text-stone-800 text-lg font-semibold">
              {selectedUserStories[currentStoryIndex].username}
            </div>

            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-3xl font-bold"
              onClick={() => setSelectedUserStories([])}
            >
              &times;
            </button>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePreviousStory}
                disabled={currentStoryIndex === 0}
                className="px-4 py-2 text-stone-950 bg-gray-500 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNextStory}
                className="px-4 py-2 text-stone-950 bg-gray-500 rounded-lg hover:bg-gray-300"
              >
                {currentStoryIndex < selectedUserStories.length - 1
                  ? "Next"
                  : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryList;
