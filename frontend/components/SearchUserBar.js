"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const SearchUserBar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [followMap, setFollowMap] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);

    const wrapperRef = useRef();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setCurrentUserId(decoded.id);
        }
    }, []);
    // Recherche automatique avec debounce
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const search = async () => {
                if (!query || !currentUserId) {
                    setResults([]);
                    setFollowMap({});
                    return;
                }

                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(
                        `http://localhost:4000/api/account/users/search?query=${query}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const users = res.data;
                    setResults(users);

                    // Vérifier le follow pour chaque utilisateur
                    const followStates = {};
                    await Promise.all(
                        users.map(async (user) => {
                            try {
                                const check = await axios.get(
                                    `http://localhost:4000/api/followers/following/${user._id}`,
                                    {
                                        headers: { Authorization: `Bearer ${token}` },
                                    }
                                );
                                followStates[user._id] = check.data.isFollowing;
                            } catch {
                                followStates[user._id] = false;
                            }
                        })
                    );

                    setFollowMap(followStates);
                } catch (err) {
                    console.error("Erreur de recherche", err);
                }
            };

            search();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    // Fermer la liste au clic extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setResults([]);
                setFollowMap({});
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle Follow/Unfollow
    const toggleFollow = async (userId) => {
        try {
            const token = localStorage.getItem("token");

            const isFollowing = followMap[userId];

            if (isFollowing) {
                await axios.delete(
                    `http://localhost:4000/api/followers/unfollow/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFollowMap((prev) => ({ ...prev, [userId]: false }));
            } else {
                await axios.post(
                    `http://localhost:4000/api/followers/follow/${userId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFollowMap((prev) => ({ ...prev, [userId]: true }));
            }
        } catch (err) {
            if (err.response?.status === 409) {
                console.warn("Déjà suivi");
            } else {
                console.error("Erreur lors du (un)follow", err);
            }
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-96 px-2 py-1 border border-gray-300 rounded-xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {query && results.length === 0 && (
                <div className="absolute mt-1 px-3 py-2 w-96 bg-white border border-gray-200 text-sm text-gray-500 rounded shadow">
                    Aucun utilisateur trouvé.
                </div>
            )}

            {results.length > 0 && (
                <div className="absolute mt-1 w-96 max-h-96 overflow-y-auto bg-white shadow rounded border border-gray-200 z-50">
                    <ul className="divide-y divide-gray-100">
                        {results.map((user) => {
                            const isFollowing = followMap[user._id];
                            const isSelf = user._id === currentUserId; // Ne pas suivre soi-même

                            return (
                                <li
                                    key={user._id}
                                    className="p-2 hover:bg-gray-50 flex justify-between items-center"
                                >
                                    <Link
                                        href={isSelf ? "/profile" : `/user/${user._id}`}
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src={`http://localhost:4005${user.avatar}`}
                                            alt=""
                                            width="24"
                                            height="24"
                                            className="rounded-full"
                                        />
                                        <div>
                                            <span className="font-semibold">{user.name}</span>{" "}
                                            <span className="text-sm text-gray-500">
                        (@{user.username})
                    </span>
                                        </div>
                                    </Link>

                                    {!isSelf && (
                                        <button
                                            onClick={() => toggleFollow(user._id)}
                                            className={`text-xs px-3 py-1 rounded-md border ${
                                                isFollowing
                                                    ? "bg-gray-200 text-gray-700"
                                                    : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                        >
                                            {isFollowing ? "Se désabonner" : "Suivre"}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchUserBar;
