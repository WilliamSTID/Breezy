import { useState } from "react";
import { Edit, Trash } from "lucide-react";

export default function Comment({ comment, onReply, onEdit, onDelete, currentUserId }) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    const handleReplySubmit = () => {
        if (replyContent.trim()) {
            onReply(comment._id, replyContent);
            setReplyContent("");
            setIsReplying(false);
        }
    };

    const handleEditSubmit = () => {
        if (editContent.trim() && editContent !== comment.content) {
            onEdit(comment._id, editContent);
        }
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">

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


            {isEditing ? (
                <div>
    <textarea
        rows={2}
        maxLength={280}
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className={`w-full p-2 border rounded text-sm ${
            editContent.length === 280 ? "border-red-500" : ""
        }`}
    />
                    <div className="flex justify-between items-center mt-1 mb-2">
      <span
          className={`text-xs ${
              editContent.length === 280 ? "text-red-500" : "text-gray-400"
          }`}
      >
        {editContent.length}/280
      </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-gray-800 text-sm whitespace-pre-wrap break-words mb-3">
                    {comment.content}
                </div>
            )}


            <div className="flex items-center gap-4 text-sm">
                <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-blue-600 hover:underline"
                >
                    Répondre
                </button>
                {currentUserId === comment.author?._id && (
                    <div className="flex gap-4 ">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1 text-gray-600 hover:underline"
                        >
                            <Edit size={14} />
                            Modifier
                        </button>
                        <button
                            onClick={() => onDelete(comment._id)}
                            className="flex items-center gap-1 text-red-600 hover:underline"
                        >
                            <Trash size={14} />
                            Supprimer
                        </button>
                    </div>
                )}
            </div>


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
                } mt-2`}
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
