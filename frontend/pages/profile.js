import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
import {usePostActions} from "@/hooks/usePostActions";
import CommentThread from '@/components/CommentThread';


export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [popupComment, setPopupComment] = useState("");
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [editingPostId, setEditingPostId] = useState(null);


    const userId = user?._id;

    const {
        handleLike,
        fetchComments,
        handleEdit,
        handleDelete,
        handleCommentSubmit,
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
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch(`http://localhost:4000/api/followers/following/${user._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
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
        <div className="max-w-2xl mx-auto mt-6 p-4 border rounded shadow bg-white">
            <div className="flex items-center space-x-4">
                <img
                    src={`http://localhost:4005${user.avatar}`}
                    alt={user.username}
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500">@{user.username}</p>
                </div>
            </div>
            <p className="mt-4">{user.bio}</p>
            <div className="mt-4 flex space-x-6 text-sm text-gray-700">
                <p><strong>{followStats.following}</strong> abonnements</p>
                <p><strong>{followStats.followers}</strong> abonnés</p>
            </div>
            <p className="mt-2 text-sm text-gray-400">
                Inscrit le {new Date(user.createdAt).toLocaleDateString()}
            </p>
        </div>
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-white border rounded shadow">
                <h3 className="text-lg font-semibold mb-2">Mes publications</h3>
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
