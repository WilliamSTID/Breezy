import { useState } from "react";
import PostHeader from "./PostHeader";
import PostFooter from "./PostFooter";

export default function Post({
                                 post,
                                 currentUserId,
                                 isEditing,
                                 editContent,
                                 setEditContent,
                                 onSave,
                                 onCancel,
                                 onLike,
                                 onCommentClick,
                                 onEdit,
                                 onDelete
                             }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
            <PostHeader
                username={post.username}
                avatar={post.avatar}
                createdAt={post.createdAt}
            />

            {isEditing ? (
                <div className="mt-2">
          <textarea
              className="w-full border rounded-md p-2 text-sm"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
          />
                    <div className="flex gap-2 mt-1 text-sm text-gray-500">
                        <button onClick={onSave} className="text-blue-600 hover:underline">Enregistrer</button>
                        <button onClick={onCancel} className="hover:underline">Annuler</button>
                    </div>
                </div>
            ) : (
                <p className="mt-2 text-sm text-wrap">{post.content}</p>
            )}

            <PostFooter
                post={post}
                currentUserId={currentUserId}
                onLike={onLike}
                onCommentClick={onCommentClick}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}
