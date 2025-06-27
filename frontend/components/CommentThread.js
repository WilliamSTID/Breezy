import { useState } from "react";

export default function CommentThread({ comment, depth = 0, onReply }) {
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const handleReply = () => {
        if (replyContent.trim()) {
            onReply(comment._id, replyContent);
            setReplyContent("");
            setReplying(false);
        }
    };

    return (
        <div className="border-l pl-4 mb-2" style={{ marginLeft: depth * 12 }}>
            <p className="text-sm text-gray-700">
                <strong>{comment.author?.name || "Utilisateur"}</strong> : {comment.content}
            </p>
            <button
                onClick={() => setReplying(!replying)}
                className="text-xs text-blue-500 mt-1 hover:underline"
            >
                {replying ? "Annuler" : "Répondre"}
            </button>
            {replying && (
                <div className="mt-1">
                <textarea
                    value={replyContent}
                    maxLength={280}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className={`w-full p-1 text-sm border rounded ${
                        replyContent.length === 280 ? "border-red-500" : ""
                    }`}
                    rows={2}
                    placeholder="Votre réponse..."
                />
                    <p
                        className={`text-xs text-right mt-1 ${
                            replyContent.length === 280 ? "text-red-500" : "text-gray-400"
                        }`}
                    >
                        {replyContent.length}/280
                    </p>
                    <button
                        onClick={handleReply}
                        className="mt-1 text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                    >
                        Envoyer
                    </button>
                </div>
            )}
            {comment.replies?.map((child) => (
                <CommentThread
                    key={child._id}
                    comment={child}
                    depth={depth + 1}
                    onReply={onReply}
                />
            ))}
        </div>
    );
}
