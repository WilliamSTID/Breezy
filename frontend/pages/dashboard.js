"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Post from "@/components/Post/Post";
import CommentsModal from "@/components/Post/CommentsModal";
import { jwtDecode } from "jwt-decode";

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activePostComments, setActivePostComments] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
    } catch (err) {
      router.push("/login");
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/feed/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Erreur chargement posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchPosts();
  }, [userId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const token = localStorage.getItem("token");
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
      }
    } catch (err) {
      console.error("Erreur publication", err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id, type = "post") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/interactions/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, userId }),
      });

      if (!res.ok) return;

      if (type === "post") {
        setPosts((prev) =>
            prev.map((post) =>
                post._id === id
                    ? {
                      ...post,
                      liked: !post.liked,
                      likes: post.liked ? post.likes - 1 : post.likes + 1,
                    }
                    : post
            )
        );
      } else if (type === "comment") {
        setActivePostComments((prev) => ({
          ...prev,
          comments: prev.comments.map((comment) =>
              comment._id === id
                  ? {
                    ...comment,
                    liked: !comment.liked,
                    likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
                  }
                  : comment
          ),
        }));
      }
    } catch (err) {
      console.error("Erreur like :", err);
    }
  };


  const handleCommentSubmit = async (postId, content, parentId = null) => {
    if (!content?.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/interactions/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, author: userId, content, parentComment: parentId }),
      });

      const newComment = await res.json();

      setActivePostComments((prev) =>
          prev?._id === postId
              ? {
                ...prev,
                newComment: "",
                comments: [...prev.comments, newComment],
              }
              : prev
      );
    } catch (err) {
      console.error("Erreur commentaire", err);
    }
  };


  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/interactions/comments/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const comments = await res.json();

      // Vérifie que userId est défini avant de continuer
      if (!userId) {
        console.warn("userId non défini lors de la récupération des commentaires");
        return;
      }

      const updatedComments = comments.map((comment) => ({
        ...comment,
        liked: comment.likedBy?.includes(userId) || false,
        likes: comment.likes || 0,
      }));

      setActivePostComments({
        ...(posts.find((p) => p._id === postId) || {}),
        comments: updatedComments,
        newComment: "",
      });
    } catch (err) {
      console.error("Erreur récupération commentaires", err);
    }
  };

  const handleCommentChange = (postId, value) => {
    setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, newComment: value } : p))
    );

    setActivePostComments((prev) =>
        prev && prev._id === postId ? { ...prev, newComment: value } : prev
    );
  };


  const handleOpenComments = async (postId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/interactions/comments/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const comments = await res.json();
      setActivePostComments({
        ...(posts.find((p) => p._id === postId) || {}),
        comments,
        newComment: "",
      });
    } catch (err) {
      console.error("Erreur récupération commentaires", err);
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
                  {Array.isArray(posts) &&
                      posts.map((post, index) => (
                          <motion.div
                              key={post._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Post
                                post={post}
                                onLike={(id) => handleLike(id, "post")}
                                onCommentSubmit={(content, parentId) => handleCommentSubmit(post._id, content, parentId)}
                                onCommentChange={handleCommentChange}
                                onOpenComments={handleOpenComments}
                            />
                          </motion.div>
                      ))}
                </div>
            )}
          </div>
        </div>
        {activePostComments && (
            <CommentsModal
                post={activePostComments}
                onClose={() => setActivePostComments(null)}
                onCommentChange={handleCommentChange}
                onCommentSubmit={(content, parentId) =>
                    handleCommentSubmit(activePostComments._id, content, parentId)
                }                onOpenComments={handleOpenComments}
                onLike={handleLike}
            />
        )}
      </Layout>
  );
}
