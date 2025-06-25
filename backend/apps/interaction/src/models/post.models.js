const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
      likes: { type: Number, default: 0 },
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);