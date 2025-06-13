const Post = require('../models/Post'); // Assurez-vous d'avoir un modèle Post

module.exports = {
    likedPost: async (req, res) => {
        const { postId } = req.params; // Récupérer l'ID du post depuis les paramètres de la requête
        const userId = req.user._id; // Récupérer l'ID de l'utilisateur depuis la requête

        try {
            // Trouver le post par son ID
            const post = await Post.findById(postId);

            // Vérifier si l'utilisateur a déjà liké le post
            if (post.likes.includes(userId)) {
                // Si oui, retirer le like
                post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            } else {
                // Sinon, ajouter le like
                post.likes.push(userId);
            }

            // Sauvegarder les modifications
            await post.save();

            // Envoyer une réponse de succès
            res.status(200).json({ message: 'Post liked/unliked successfully', post });
        } catch (error) {
            // Envoyer une réponse d'erreur
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    }
};
