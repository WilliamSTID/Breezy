import { useState } from "react";

export function usePostActions({ userId, posts, setPosts, setSelectedPost, setPopupComment, fetchPosts, setNewPost, setPosting, router, selectedPost }) {
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

    const buildCommentTree = (comments) => {
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
    };

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
                comments: tree,
                showComments: true,
            };

            setPosts((prevPosts) =>
                prevPosts.map((post) => (post._id === postId ? updatedPost : post))
            );

            setSelectedPost(updatedPost);
            if (setPopupComment) setPopupComment("");
        } catch (err) {
            console.error("Erreur chargement commentaires :", err);
        }
    };

    const handleEdit = async (postId, newContent) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        console.log("EDIT APPUYE")

        try {
            const res = await fetch(`http://localhost:4000/api/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newContent }),
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Erreur lors de la modification :", error.message);
                return;
            }

            const updatedPost = await res.json();

            // Mettre à jour le state local
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p._id === postId
                        ? { ...p, content: updatedPost.content }
                        : p
                )
            );
        } catch (err) {
            console.error("Erreur réseau lors de la modification :", err);
        }
    };

    const handleDelete = async (postId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Token manquant. Redirection vers login.");
            router.push("/login");
            return;
        }

        try {
            console.log(token)
            const res = await fetch(`http://localhost:4000/api/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Erreur lors de la suppression :", error.message);
                return;
            }

            // Mise à jour locale du state après suppression
            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        } catch (err) {
            console.error("Erreur réseau lors de la suppression :", err);
        }
    };

    const handlePostSubmit = async (content) => {
        if (!content?.trim()) return;

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
                body: JSON.stringify({ content, author: userId }),
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
                    parentComment,
                }),
            });

            const newComment = await res.json();

            setPosts((prevPosts) =>
                prevPosts.map((p) => {
                    if (p._id !== postId) return p;

                    const updated = JSON.parse(JSON.stringify(p));
                    updated.commentCount = (updated.commentCount || 0) + 1;

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

                    return { ...updated, showComments: true };
                })
            );

            if (setSelectedPost && selectedPost?._id === postId) {
                const refreshed = posts.find((p) => p._id === postId);
                if (refreshed) {
                    const updated = JSON.parse(JSON.stringify(refreshed));
                    updated.commentCount = (updated.commentCount || 0) + 1;

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

                    setSelectedPost(updated);
                }
            }


        } catch (err) {
            console.error("Erreur lors de l'ajout du commentaire :", err);
        }
    };

    const handleCommentEdit = async (commentId, newContent) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:4000/api/interactions/comment/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newContent }),
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Erreur modification :", error.message);
                return;
            }

            const updatedComment = await res.json();

            const updateTree = (comments) =>
                comments.map((c) =>
                    c._id === updatedComment._id
                        ? { ...c, content: updatedComment.content }
                        : {
                            ...c,
                            replies: c.replies ? updateTree(c.replies) : [],
                        }
                );

            setPosts((prevPosts) =>
                selectedPost
                    ? prevPosts.map((post) =>
                        post._id === selectedPost._id
                            ? { ...post, comments: updateTree(post.comments) }
                            : post
                    )
                    : prevPosts
            );


            // mise à jour dans selectedPost (popup)
            setSelectedPost((prev) =>
                prev
                    ? {
                        ...prev,
                        comments: updateTree(prev.comments),
                    }
                    : null
            );
        } catch (err) {
            console.error("Erreur réseau :", err);
        }
    };

    const handleCommentDelete = async (postId, commentId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:4000/api/interactions/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Erreur suppression :", error.message);
                return;
            }

            const deleteInTree = (comments) =>
                comments
                    .filter((c) => c._id !== commentId)
                    .map((c) => ({
                        ...c,
                        replies: deleteInTree(c.replies || []),
                    }));

            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId
                        ? { ...post, comments: deleteInTree(post.comments || []) }
                        : post
                )
            );

            if (setSelectedPost) {
                setSelectedPost((prev) =>
                    prev
                        ? { ...prev, comments: deleteInTree(prev.comments || []) }
                        : prev
                );
            }
        } catch (err) {
            console.error("Erreur réseau suppression :", err);
        }
    };


    return {
        handleLike,
        fetchComments,
        handleEdit,
        handleDelete,
        handlePostSubmit,
        handleCommentSubmit,
        handleCommentEdit,
        handleCommentDelete,
    };
}
