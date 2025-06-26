"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { jwtDecode } from "jwt-decode";
import CommentThread from '@/components/CommentThread';
import Post from "@/components/Post";
import { usePostActions } from "@/hooks/usePostActions";

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [popupComment, setPopupComment] = useState("");

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
      console.log("Données reçues :", data);
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

  useEffect(() => {
    if (!selectedPost) return;

    const refreshed = posts.find(p => p._id === selectedPost._id);
    if (refreshed) {
      setSelectedPost(JSON.parse(JSON.stringify(refreshed)));
    }
  }, [posts]);

  const {
    handleLike,
    fetchComments,
    handleEdit,
    handleDelete,
    handlePostSubmit,
    handleCommentSubmit
  } = usePostActions({
    userId,
    posts,
    setPosts,
    setSelectedPost,
    setPopupComment,
    fetchPosts,
    setNewPost,
    setPosting,
    router,
  });

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
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePostSubmit(newPost);
                }}
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
                  {Array.isArray(posts) && posts.map((post, index) => (
                      <motion.div
                          key={post._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Post>
                          <Post.Header
                              username={post.username}
                              avatar={post.avatar}
                              createdAt={post.createdAt}
                          />
                          <Post.Body content={post.content} />
                          <Post.Footer
                              post={post}
                              currentUserId={userId}
                              onLike={handleLike}
                              onCommentClick={fetchComments}
                              onEdit={handleEdit}       // tu pourras gérer ça ensuite
                              onDelete={handleDelete}   // idem
                          />
                        </Post>
                      </motion.div>
                  ))}
                </div>
            )}
          </div>
        </div>
        {selectedPost && (
            <div
                key={selectedPost._id + '-' + selectedPost.comments?.length}
                className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <div
                  key={selectedPost._id + '-' + selectedPost.comments?.length}
                  className="bg-white rounded-lg p-6 max-w-md w-full relative"
              >
                <h2 className="text-lg font-bold mb-4">Commentaires</h2>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedPost.comments?.map((comment) => (
                      <CommentThread
                          key={comment._id + '-' + comment.replies?.length}
                          comment={comment}
                          depth={0}
                          onReply={(parentId, content) =>
                              handleCommentSubmit(selectedPost._id, content, parentId)
                          }
                      />
                  ))}

                </div>

                <textarea
                    rows={2}
                    placeholder="Ajouter un commentaire..."
                    value={popupComment}
                    onChange={(e) => setPopupComment(e.target.value)}
                    className="w-full mt-4 p-2 border rounded text-sm"
                />

                <button
                    onClick={() => handleCommentSubmit(selectedPost._id, popupComment)}
                className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Publier
                </button>

                <button
                    onClick={() => setSelectedPost(null)}
                    className="absolute top-2 right-3 text-gray-600 hover:text-gray-900 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
        )}

      </Layout>
  );
}
