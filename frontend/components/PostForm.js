// components/PostForm.js
"use client";

import { useState } from "react";

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4006/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Erreur lors de la publication");
      setContent("");
      onPostCreated && onPostCreated();
    } catch (err) {
      console.error("Erreur :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Quoi de neuf ?"
        maxLength={280}
        className="w-full p-2 border rounded mb-4"
      />
      <div className="text-right">
        <button
          onClick={handlePost}
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Publication..." : "Publier"}
        </button>
      </div>
    </div>
  );
}