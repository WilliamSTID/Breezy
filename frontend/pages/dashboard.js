"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:4004/posts/feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Erreur lors du chargement des posts", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const token = localStorage.getItem("token");
    setPosting(true);

    try {
      const res = await fetch("http://localhost:4004/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (res.ok) {
        setNewPost("");
        fetchPosts(); // recharge les posts
      } else {
        console.error("Erreur lors de la publication");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-semibold mb-6 text-center">Fil d'actualités</h1>

        {/* Champ de création de post */}
        <form onSubmit={handlePostSubmit} className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Qu'avez-vous à partager ?"
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200 resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={posting}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {posting ? "Publication..." : "Publier"}
          </button>
        </form>

        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800">{post.username}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  {post.content}
                </p>
                <div className="flex space-x-4 mt-3 text-gray-500">
                  <button className="flex items-center space-x-1 hover:text-red-500">
                    <Heart size={18} />
                    <span>{post.likes || 0}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-500">
                    <MessageCircle size={18} />
                    <span>{post.comments?.length || 0}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}