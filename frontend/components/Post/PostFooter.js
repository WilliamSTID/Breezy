import { Heart, MessageCircle, Edit, Trash } from "lucide-react";

export default function PostFooter({
                                       post,
                                       currentUserId,
                                       onLike,
                                       onCommentClick,
                                       onEdit,
                                       onDelete,
                                   }) {
    const isAuthor = post.author?.toString() === currentUserId;

    return (
        <div className="mt-3">
            <div className="flex gap-6 text-gray-500 text-sm">
                <button
                    onClick={() => onLike(post._id)}
                    className="flex items-center gap-1 hover:text-red-500"
                >
                    <Heart
                        size={18}
                        fill={post.liked ? "red" : "none"}
                        stroke={post.liked ? "red" : "currentColor"}
                    />
                    <span>{post.likes || 0}</span>
                </button>

                <button
                    onClick={() => onCommentClick(post._id)}
                    className="flex items-center gap-1 hover:text-blue-500"
                >
                    <MessageCircle size={18} />
                    <span>{post.commentCount || 0}</span>
                </button>
            </div>

            {isAuthor && (
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <button
                        onClick={() => onEdit(post._id, post.content)}
                        className="hover:text-blue-600 flex items-center gap-1"
                    >
                        <Edit size={14} /> Modifier
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Voulez-vous vraiment supprimer ce post ?")) {
                                onDelete(post._id);
                            }
                        }}
                        className="hover:text-red-600 flex items-center gap-1"
                    >
                        <Trash size={14} /> Supprimer
                    </button>
                </div>
            )}
        </div>
    );
}
