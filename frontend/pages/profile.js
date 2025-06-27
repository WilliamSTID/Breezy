import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
import { usePostActions } from "@/hooks/usePostActions";
import CommentThread from '@/components/CommentThread';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [popupComment, setPopupComment] = useState("");
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [editingPostId, setEditingPostId] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editAvatar, setEditAvatar] = useState(null);

    const userId = user?._id;
    const startEditingProfile = () => {
        setEditName(user.name || "");
        setEditBio(user.bio || "");
        setEditAvatar(null); // reset l’image
        setIsEditingProfile(true);
    };

    const {
        handleLike,
        fetchComments,
        handleEdit,
        handleDelete,
        handleCommentSubmit,
        handleCommentEdit,
        handleCommentDelete,
    } = usePostActions({
        userId,
        posts,
        setPosts,
        setSelectedPost,
        selectedPost,
        setPopupComment,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch("http://localhost:4000/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Erreur de chargement");

                setUser(data);
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (!user?._id) return;

        const fetchFollowStats = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const [followersRes, followingRes] = await Promise.all([
                    fetch(`http://localhost:4000/api/followers/follower/${user._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`http://localhost:4000/api/followers/following-list/${user._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const followersData = await followersRes.json();
                const followingData = await followingRes.json();

                if (!followersRes.ok || !followingRes.ok) {
                    throw new Error("Erreur lors de la récupération des statistiques de follow");
                }

                setFollowStats({
                    followers: followersData.length,
                    following: followingData.length,
                });
            } catch (err) {
                console.error("Erreur stats followers/following :", err.message);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`http://localhost:4000/api/feed/${user._id}?authorOnly=true`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Erreur chargement posts");
                setPosts(data);
            } catch (err) {
                console.error("Erreur chargement des posts :", err.message);
            }
        };

        fetchFollowStats();
        fetchUserPosts();
    }, [user]);

    if (!user) return <p>Chargement...</p>;

    return (
        <Layout>
            <div className="max-w-2xl mx-auto mt-6 p-6 border border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src={`http://localhost:4005${user.avatar}`}
                            alt={user.username}
                            className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-sm"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
                            <p className="text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => startEditingProfile()}
                        className="text-gray-400 hover:text-blue-500 text-xl transition-colors"
                        title="Modifier le profil"
                    >
                        ✎
                    </button>
                </div>
                <p className="mt-4 text-gray-700 whitespace-pre-line">{user.bio}</p>
                <div className="mt-4 flex space-x-8 text-sm text-gray-600">
                    <p>
                        <span className="font-bold text-gray-900">{followStats.following}</span> abonnements
                    </p>
                    <p>
                        <span className="font-bold text-gray-900">{followStats.followers}</span> abonnés
                    </p>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                    Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </div>


            <div className="max-w-2xl mx-auto mt-6 space-y-5">
                <h3 className="text-lg font-semibold mb-4">Mes publications</h3>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Post
                            key={post._id}
                            post={post}
                            currentUserId={userId}
                            isEditing={editingPostId === post._id}
                            editContent={editingPostId === post._id ? post.content : undefined}
                            setEditContent={(content) => {
                                setPosts((prev) =>
                                    prev.map((p) => (p._id === post._id ? { ...p, content } : p))
                                );
                            }}
                            onSave={() => {
                                handleEdit(post._id, post.content);
                                setEditingPostId(null);
                            }}
                            onCancel={() => setEditingPostId(null)}
                            onLike={handleLike}
                            onCommentClick={fetchComments}
                            onEdit={() => setEditingPostId(post._id)}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">Aucune publication trouvée.</p>
                )}
            </div>

            {selectedPost && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-4 w-full max-w-3xl relative shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Commentaires</h2>

                        <div className="max-h-60 p-4 overflow-y-auto space-y-2">
                            {selectedPost.comments?.map((comment) => (
                                <CommentThread
                                    key={comment._id}
                                    comment={comment}
                                    depth={0}
                                    onReply={(parentId, content) =>
                                        handleCommentSubmit(selectedPost._id, content, parentId)
                                    }
                                    onEdit={(commentId, newContent) =>
                                        handleCommentEdit(commentId, newContent)
                                    }
                                    onDelete={(commentId) =>
                                        handleCommentDelete(selectedPost._id, commentId)
                                    }
                                    currentUserId={userId}
                                />


                            ))}
                        </div>

                        <textarea
                            rows={2}
                            maxLength={280}
                            placeholder="Ajouter un commentaire..."
                            value={popupComment}
                            onChange={(e) => setPopupComment(e.target.value)}
                            className={`w-full mt-4 p-2 border rounded text-sm ${
                                popupComment.length === 280 ? "border-red-500" : ""
                            }`}
                        />
                        <p className={`text-xs text-right mt-1 ${
                            popupComment.length === 280 ? "text-red-500" : "text-gray-400"
                        }`}>
                            {popupComment.length}/280
                        </p>

                        <button
                            onClick={() => {
                                handleCommentSubmit(selectedPost._id, popupComment);
                                setPopupComment("");
                            }}
                            disabled={!popupComment.trim()}
                            className={`mt-2 w-full py-2 rounded-lg transition 
                            ${!popupComment.trim()
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"}`}
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
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative p-6 space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Modifier le profil</h2>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                            <input
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Nom"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Biographie</label>
                            <textarea
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Biographie"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Photo de profil</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditAvatar(e.target.files[0])}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                        </div>

                        {editAvatar && (
                            <div className="flex justify-center">
                                <img
                                    src={URL.createObjectURL(editAvatar)}
                                    alt="Aperçu de l'avatar"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                                />
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                                onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    const formData = new FormData();
                                    formData.append("name", editName);
                                    formData.append("bio", editBio);
                                    if (editAvatar) {
                                        formData.append("avatar", editAvatar);
                                    }

                                    const res = await fetch("http://localhost:4000/api/users/me", {
                                        method: "PUT",
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: formData,
                                    });

                                    if (res.ok) {
                                        const updated = await res.json();
                                        setUser(updated);
                                        setIsEditingProfile(false);
                                    } else {
                                        alert("Erreur lors de la mise à jour.");
                                    }
                                }}
                            >
                                Enregistrer
                            </button>
                            <button
                                className="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                                onClick={() => setIsEditingProfile(false)}
                            >
                                Annuler
                            </button>
                        </div>

                        <button
                            className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl transition"
                            onClick={() => setIsEditingProfile(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}


        </Layout>
    );
}
