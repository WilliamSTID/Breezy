"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { jwtDecode } from "jwt-decode";
import CommentThread from '@/components/CommentThread';

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

  function buildCommentTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c._id] = { ...c, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parentComment) {
        map[c.parentComment]?.replies.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    return roots;
  }


  const fetchComments = async (postId) => {
    const token = localStorage.getItem("token");
    const currentPost = posts.find((p) => p._id === postId);

    if (currentPost?.comments && currentPost.showComments) {
      setSelectedPost(currentPost);
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/interactions/comments/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const comments = await res.json();
      const tree = buildCommentTree(comments);


      if (!Array.isArray(comments)) {
        console.error("Les commentaires reçus ne sont pas un tableau :", comments);
        return;
      }

      const updatedPost = {
        ...currentPost,
        comments,
        showComments: true,
      };

      // Met à jour les posts
      setPosts((prevPosts) =>
          prevPosts.map((post) =>
              post._id === postId ? updatedPost : post
          )
      );

      // Affiche les commentaires dans la popup
      setSelectedPost(updatedPost);
      setPopupComment("");
    } catch (err) {
      console.error("Erreur chargement commentaires :", err);
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

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/interactions/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.warn("Erreur lors du like :", error.message);
        return;
      }

      // Mise à jour locale (optimistic toggle)
      setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id !== postId) return post;

            const isLiking = !post.liked;
            return {
              ...post,
              liked: isLiking,
              likes: isLiking ? (post.likes || 0) + 1 : (post.likes || 0) - 1,
            };
          })
      );
    } catch (err) {
      console.error("Erreur réseau lors du like :", err);
    }
  };

  const handleCommentSubmit = async (postId, content, parentComment = null) => {
    if (!content?.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/interactions/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          author: userId,
          content,
          parentComment, // 🔥 support récursif
        }),
      });

      const newComment = await res.json();

      // Ajoute récursivement dans selectedPost.comments
      setSelectedPost((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));

        function insertReply(list) {
          for (let i = 0; i < list.length; i++) {
            if (list[i]._id === parentComment) {
              list[i].replies = [...(list[i].replies || []), newComment];
              return true;
            }
            if (list[i].replies && insertReply(list[i].replies)) return true;
          }
          return false;
        }

        if (parentComment) {
          insertReply(updated.comments);
        } else {
          updated.comments.push({ ...newComment, replies: [] });
        }

        return updated;
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
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
                  {Array.isArray(posts) && posts.map((post, index) => (
                      <motion.div
                          key={post._id}
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
                        <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>

                        <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                          <button
                              onClick={() => handleLike(post._id)}
                              className="flex items-center gap-1 hover:text-red-500 transition"
                          >
                            <Heart
                                size={18}
                                fill={post.liked ? "red" : "none"}
                                stroke={post.liked ? "red" : "currentColor"}
                            />
                            <span>{post.likes || 0}</span>
                          </button>

                          <button
                              onClick={() => fetchComments(post._id)}
                              className="flex items-center gap-1 hover:text-blue-500 transition"
                          >
                            <MessageCircle size={18} />
                            <span>{post.commentCount || 0}</span>
                          </button>


                          {/*<button*/}
                          {/*    onClick={async () => {*/}
                          {/*      const updatedPost = await fetchComments(post._id);*/}
                          {/*      if (updatedPost) setSelectedPost(updatedPost);*/}
                          {/*    }}*/}
                          {/*    className="text-sm text-blue-500 hover:underline"*/}
                          {/*>*/}
                          {/*  Voir les commentaires*/}
                          {/*</button>*/}

                        </div>

                        {/* Affichage des commentaires */}
                        {/*{post.showComments && post.comments?.map((comment) => (*/}
                        {/*    <div*/}
                        {/*        key={comment._id}*/}
                        {/*        className="mt-2 pl-4 border-l text-sm text-gray-600"*/}
                        {/*    >*/}
                        {/*      <p>*/}
                        {/*        <strong>{comment.author?.username || "Utilisateur"}</strong> :{" "}*/}
                        {/*        {comment.content}*/}
                        {/*      </p>*/}
                        {/*    </div>*/}
                        {/*))}*/}

                        {/* Zone pour écrire un commentaire */}
                        <div className="mt-2">
      {/*<textarea*/}
      {/*    rows={2}*/}
      {/*    placeholder="Ajouter un commentaire..."*/}
      {/*    value={post.newComment || ""}*/}
      {/*    onChange={(e) =>*/}
      {/*        setPosts((prev) =>*/}
      {/*            prev.map((p) =>*/}
      {/*                p._id === post._id ? { ...p, newComment: e.target.value } : p*/}
      {/*            )*/}
      {/*        )*/}
      {/*    }*/}
      {/*    className="w-full p-2 border rounded text-sm"*/}
      {/*/>*/}
      {/*                    <button*/}
      {/*                        onClick={() => handleCommentSubmit(post._id, post.newComment)}*/}
      {/*                        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"*/}
      {/*                    >*/}
      {/*                      Publier*/}
      {/*                    </button>*/}
                        </div>
                      </motion.div>
                  ))}
                </div>
            )}
          </div>
        </div>
        {selectedPost && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
                <h2 className="text-lg font-bold mb-4">Commentaires</h2>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedPost.comments?.map((comment) => (
                      <CommentThread
                          key={comment._id}
                          comment={comment}
                          depth={0}
                          onReply={(parentId, content) =>
                              handleCommentSubmit(selectedPost._id, content, parentId)
                          }
                      />
                  ))
                  }

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
