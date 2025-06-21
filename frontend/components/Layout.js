"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Layout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">
          Breezy
        </Link>
        <div className="space-x-4">
          <Link href="/profile" className="text-blue-600 hover:underline">
            Profil
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          >
            Déconnexion
          </button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}