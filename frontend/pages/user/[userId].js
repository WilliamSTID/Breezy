import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
import CommentThread from "@/components/CommentThread";
import { usePostActions } from "@/hooks/usePostActions";
import { jwtDecode } from "jwt-decode";

export default function PublicProfilePage() {
    const router = useRouter();
    const { userId } = router.query;
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [popupComment, setPopupComment] = useState("");
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const {
        handleLike,
        fetchComments,
        handleCommentSubmit,
    } = usePostActions({
        userId: currentUserId,
        posts,
        setPosts,
        setSelectedPost,
        selectedPost,
        setPopupComment,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setCurrentUserId(decoded.id);
        }
    }, []);

    useEffect(() => {
        if (!userId) return;

        const fetchUserAndPosts = async () => {
            try {
                const token = localStorage.getItem("token");

                // 1. Récupération de l'utilisateur
                const userRes = await fetch(`http://localhost:4000/api/publicprofile/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!userRes.ok) throw new Error("Utilisateur non trouvé");
                const userData = await userRes.json();
                setUser(userData);

                // 2. Récupération des posts, une fois l'utilisateur connu
                const postRes = await fetch(`http://localhost:4000/api/publicprofile/${userId}/posts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!postRes.ok) throw new Error("Erreur chargement des publications");
                const postData = await postRes.json();

                const enrichedPosts = postData.map(post => ({
                    ...post,
                    username: userData.username,
                    avatar: userData.avatar,
                }));

                setPosts(enrichedPosts);
            } catch (err) {
                console.error("Erreur lors du chargement du profil ou des posts :", err.message);
                setUser(null);
            }
        };

        fetchUserAndPosts();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        const fetchFollowStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const [followersRes, followingRes] = await Promise.all([
                    fetch(`http://localhost:4000/api/followers/follower/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`http://localhost:4000/api/followers/following-list/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const followersData = await followersRes.json();
                const followingData = await followingRes.json();

                setFollowStats({
                    followers: followersData.length,
                    following: followingData.length,
                });
            } catch (err) {
                console.error("Erreur chargement stats follow :", err.message);
            }
        };

        fetchFollowStats();
    }, [userId]);


    if (user === null) {
        return <p className="text-center mt-10 text-red-500">Profil introuvable.</p>;
    }

    if (!user) {
        return <p className="text-center mt-10">Chargement du profil...</p>;
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto mt-6 p-4 border rounded shadow bg-white">
                <div className="flex items-center space-x-4">
                    <img
                        src={`http://localhost:4005${user.avatar}`}
                        alt={user.username}
                        className="w-24 h-24 rounded-full"
                    />
                    <div>
                        <h2 className="text-xl font-bold">@{user.username}</h2>
                        {user.bio && <p className="text-gray-500">{user.bio}</p>}
                    </div>
                </div>
                <div className="mt-4 flex space-x-6 text-sm text-gray-700">
                    <p><strong>{followStats.following}</strong> abonnements</p>
                    <p><strong>{followStats.followers}</strong> abonnés</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto mt-6 p-4 bg-white border rounded shadow">
                <h3 className="text-lg font-semibold mb-2">Publications</h3>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Post
                            key={post._id}
                            post={post}
                            currentUserId={userId}
                            onLike={handleLike}
                            onCommentClick={fetchComments}
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
