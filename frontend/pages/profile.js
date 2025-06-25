import { useEffect, useState } from "react";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log("🔑 Token utilisé :", token);

                if (!token) return; // Pas connecté

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

    if (!mounted) return null;
    if (!user) return <p>Chargement...</p>;

    return (
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
            <p className="mt-2 text-sm text-gray-400">
                Inscrit le {new Date(user.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}
