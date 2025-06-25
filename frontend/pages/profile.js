import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

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
    }, [mounted]);

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
                const res = await fetch(`http://localhost:4006/api/posts/user/${user._id}`);
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

    if (!mounted || !user) return <p>Chargement...</p>;

    return (
        <Layout>
        <div className="max-w-md mx-auto mt-6 p-4 border rounded shadow bg-white">
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
            <div className="max-w-md mx-auto mt-6 p-4 bg-white border rounded shadow">
                <h3 className="text-lg font-semibold mb-2">Mes publications</h3>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post._id} className="border-b py-2">
                            <p>{post.content}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Aucune publication trouvée.</p>
                )}
            </div>
        </Layout>
    );
}
