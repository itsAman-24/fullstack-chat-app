import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    storyExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 4 * 60 * 60 * 1000), // Expires in 4 hours
    },
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);

export default Story;