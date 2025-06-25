import React, { useEffect, useState } from "react";

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Erreur lors du chargement du profil");
                setUser(data);
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchProfile();
    }, []);

    if (!user) return <p>Chargement du profil...</p>;

    return (
        <div className="max-w-md mx-auto mt-6 p-4 border rounded shadow">
            <div className="flex items-center space-x-4">
                <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-16 h-16 rounded-full object-cover"
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
};

export default Profile;
