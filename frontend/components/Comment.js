import { useState } from "react";

export default function Comment({ comment, onReply }) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const handleReplySubmit = () => {
        if (replyContent.trim()) {
            onReply(comment._id, replyContent);
            setReplyContent("");
            setIsReplying(false);
        }
    };
    console.log("Auteur du commentaire :", comment.author);

    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
            {/* Header personnalisé */}
            <div className="flex items-center gap-2 mb-2">
                <img
                    src={`http://localhost:4005${comment.author?.avatar || "/uploads/avatars/default_picture.jpg"}`}
                    alt={comment.author?.name || "Utilisateur"}
                    className="w-8 h-8 rounded-full"
                />
                <div>
                    <p className="text-sm font-semibold text-gray-800">{comment.author.name}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Contenu */}
            <div className="text-gray-800 text-sm whitespace-pre-wrap mb-3">
                {comment.content}
            </div>

            {/* Bouton Répondre */}
            <div
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
                Répondre
            </div>

            {/* Zone de réponse */}
            {isReplying && (
                <div className="mt-3">
          <textarea
              rows={2}
              maxLength={280}
              placeholder="Votre réponse..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className={`w-full p-2 border rounded text-sm ${
                  replyContent.length === 280 ? "border-red-500" : ""
              }`}
          />
                    <div className="flex justify-between items-center mt-1">
            <span
                className={`text-xs ${
                    replyContent.length === 280
                        ? "text-red-500"
                        : "text-gray-400"
                }`}
            >
              {replyContent.length}/280
            </span>
                        <button
                            onClick={handleReplySubmit}
                            className="bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                            Publier
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
