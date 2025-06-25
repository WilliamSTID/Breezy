export async function register(email, password, username, avatarFile, bio = "") {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", username);
    formData.append("bio", bio);
    if (avatarFile) {
        formData.append("avatar", avatarFile); // <--- important
    }

    const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        body: formData,
        // ⚠️ surtout pas de headers ici ! (fetch le gère seul pour FormData)
    });

    if (!response.ok) {
        throw new Error("Échec de l'inscription");
    }

    return await response.json();
}


// frontend/services/userAccount.js

export async function login(email, password) {
    const response = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ✅ très important
      },
      body: JSON.stringify({ email, password }),
    });
  
    if (!response.ok) {
      throw new Error("Échec de la connexion");
    }
  
    return await response.json(); // ✅ retour du JSON
  }

export async function getProfile() {
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:4005/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`, // 🔐 Envoie le token
  },
});

if (!response.ok) {
  throw new Error("Échec de récupération du profil");
}

return await response.json();
}