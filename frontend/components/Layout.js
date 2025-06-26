"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import SearchUserBar from "@/components/SearchUserBar"; // ajuste le chemin si besoin


export default function Layout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <Link
              href="/dashboard"
              className="text-2xl font-bold tracking-tight text-blue-600 hover:text-blue-700 transition"
          >
            Breezy
          </Link>

          <SearchUserBar />


          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
              Accueil
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition">
              Profil
            </Link>
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
            >
              Déconnexion
            </button>
          </div>
        </nav>
        
        <main className="px-4 py-6">{children}</main>
      </div>
  );
}
