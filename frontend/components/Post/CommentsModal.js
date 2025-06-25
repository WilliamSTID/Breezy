import { motion } from "framer-motion";
import Post from "./Post";
import { useState } from "react";

export default function CommentsModal({
                                          post,
                                          onClose,
                                          onCommentChange,
                                          onCommentSubmit,
                                          onOpenComments,
                                          onLike,
                                      }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContents, setReplyContents] = useState({});

    const handleReplyChange = (commentId, value) => {
        setReplyContents((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleReplySubmit = (commentId) => {
        const content = replyContents[commentId];
        if (!content?.trim()) return;

        onCommentSubmit(post._id, content, commentId);
        setReplyContents((prev) => ({ ...prev, [commentId]: "" }));
        setReplyingTo(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4">Commentaires</h2>

                {post.comments?.map((comment) => (
                    <div key={comment._id} className="mb-4">
                        <Post
                            post={comment}
                            onLike={(id) => onLike(id, "comment")}
                            onCommentSubmit={onCommentSubmit}
                            onCommentChange={onCommentChange}
                            onOpenComments={onOpenComments}
                        />

                        <button
                            className="text-sm text-blue-500 ml-4"
                            onClick={() => setReplyingTo(comment._id)}
                        >
                            Répondre
                        </button>

                        {replyingTo === comment._id && (
                            <div className="ml-6 mt-2">
                <textarea
                    rows={2}
                    value={replyContents[comment._id] || ""}
                    onChange={(e) =>
                        handleReplyChange(comment._id, e.target.value)
                    }
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Votre réponse..."
                />
                                <button
                                    onClick={() => handleReplySubmit(comment._id)}
                                    className="mt-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                    Publier réponse
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
