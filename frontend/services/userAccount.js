export async function register(email, password, username) {
    const response = await fetch("http://localhost:4005/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, username }),
    });
  
    if (!response.ok) {
      throw new Error("Échec de l'inscription");
    }
  
    return await response.json();
  }

// frontend/services/userAccount.js

export async function login(email, password) {
    const response = await fetch("http://localhost:4005/login", {
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