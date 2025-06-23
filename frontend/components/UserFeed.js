// components/UserFeed.js
"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";

export default function UserFeed({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:4002/posts/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des posts utilisateur");
        }

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  if (loading) {
    return <p className="text-center mt-4">Chargement...</p>;
  }

  return (
    <div className="space-y-4 mt-6">
      {posts.map((post, index) => (
        <div
          key={index}
          className="bg-white shadow p-4 rounded-xl border border-gray-200"
        >
          <div className="font-semibold text-lg">{post.author}</div>
          <p className="text-gray-700 mt-2">{post.content}</p>

          <div className="flex items-center mt-4 space-x-4 text-gray-500">
            <button className="hover:text-red-500 transition">
              <Heart className="w-4 h-4 inline mr-1" /> {post.likes || 0}
            </button>
            <button className="hover:text-blue-500 transition">
              <MessageCircle className="w-4 h-4 inline mr-1" /> {post.comments?.length || 0}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}