import Comment from "./Comment";

export default function CommentThread({ comment, depth = 0, onReply, onEdit, onDelete, currentUserId }) {
    return (
        <div className={`ml-${depth * 4} mt-4`}>
            <Comment
                comment={comment}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUserId={currentUserId}
            />
            {comment.replies?.length > 0 && (
                <div className="mt-3 space-y-3">
                    {comment.replies.map((reply) => (
                        <CommentThread
                            key={reply._id}
                            comment={reply}
                            depth={depth + 1}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
