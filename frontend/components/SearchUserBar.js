// components/SearchUserBar.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const SearchUserBar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const wrapperRef = useRef();

    // Requête automatique avec debounce
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const search = async () => {
                if (!query) {
                    setResults([]);
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
                    setResults(res.data);
                } catch (err) {
                    console.error("Erreur de recherche", err);
                }
            };

            search();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    // Fermer les résultats au clic extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                <div className="absolute mt-1 px-3 py-2 w-96 max-h-96 bg-white border border-gray-200 text-sm text-gray-500 rounded shadow">
                    Aucun utilisateur trouvé.
                </div>
            )}

            {results.length > 0 && (
                <div className="absolute mt-1 w-96 max-h-96 overflow-y-auto bg-white shadow rounded border border-gray-200 z-50">
                    <ul className="divide-y divide-gray-100">
                        {results.map((user) => (
                            <li key={user._id} className="p-2 hover:bg-gray-50">
                                <Link href={`/users/${user._id}`} className="flex items-center gap-2">
                                    <img
                                        src={`http://localhost:4005${user.avatar}`}
                                        alt=""
                                        width="24"
                                        height="24"
                                        className="rounded-full"
                                    />
                                    <div>
                                        <span className="font-semibold">{user.username}</span>{" "}
                                        <span className="text-sm text-gray-500">({user.name})</span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchUserBar;
