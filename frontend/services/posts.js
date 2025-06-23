export const createPost = async (content, token) => {
    const res = await fetch("http://localhost:4000/api/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur ${res.status} : ${errorText}`);
    }
    return res.json();
};