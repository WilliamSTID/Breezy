"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { jwtDecode } from "jwt-decode";

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token trouvé dans localStorage ?", token);

      if (!token) {
        router.push("/login");
        return;
      }
      const decoded = jwtDecode(token);
      console.log("Token décodé :", decoded);
      setUserId(decoded.id); // ou decoded.userId selon ton backend
    } catch (err) {
      console.error("Token invalide", err);
      router.push("/login");
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/feed/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Erreur lors du chargement des posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setPosting(true);

    try {
      const res = await fetch("http://localhost:4000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost, author: userId }),
      });

      if (res.ok) {
        setNewPost("");
        fetchPosts();
      } else {
        const errorText = await res.text();
        console.error("Erreur lors de la publication :", errorText);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setPosting(false);
    }
  };

  return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 py-10 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-center text-gray-800 mb-8"
            >
              Fil d'actualités
            </motion.h1>

            <motion.form
                onSubmit={handlePostSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white p-5 rounded-xl shadow-md mb-8"
            >
            <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Exprimez-vous..."
                rows={3}
                className="w-full resize-none border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
            />
              <button
                  type="submit"
                  disabled={posting}
                  className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {posting ? "Publication..." : "Publier"}
              </button>
            </motion.form>

            {loading ? (
                <p className="text-center text-gray-600">Chargement...</p>
            ) : (
                <div className="space-y-5">
                  {posts.map((post, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{post.username}</span>
                          <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {post.content}
                        </p>
                        <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                          <button className="flex items-center gap-1 hover:text-red-500 transition">
                            <Heart size={18} />
                            <span>{post.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-500 transition">
                            <MessageCircle size={18} />
                            <span>{post.comments?.length || 0}</span>
                          </button>
                        </div>
                      </motion.div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </Layout>
  );
}
