"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:4003/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          fetchUserPosts(data.profile.userId, token);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
      }
    };

    const fetchUserPosts = async (userId, token) => {
      try {
        const res = await fetch(`http://localhost:4003/profile/${userId}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Erreur lors du chargement des posts utilisateur", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Chargement du profil...</p>;

  if (!profile) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-semibold mb-2 text-center">{profile.displayName}</h1>
        <p className="text-gray-500 text-center mb-6">@{profile.username}</p>

        {/* Bio fictive (à améliorer plus tard) */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6 text-sm text-gray-700">
          Passionné par le développement et le partage d'idées.
        </div>

        <h2 className="text-xl font-bold mb-4">Mes publications</h2>
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
              >
                <p className="text-gray-700 text-sm whitespace-pre-line">{post.content}</p>
                <div className="mt-2 text-right text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">Aucun post pour le moment.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}