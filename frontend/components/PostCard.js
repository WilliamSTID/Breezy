// frontend/components/PostCard.js
import React from "react";

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-2">
      <div className="font-bold text-gray-900">{post.username}</div>
      <div className="text-gray-700">{post.content}</div>
    </div>
  );
};

export default PostCard;