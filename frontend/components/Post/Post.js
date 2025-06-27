import { useState } from "react";
import PostHeader from "./PostHeader";
import PostFooter from "./PostFooter";
import PostBody from "./PostBody"; // ⚠️ N'oublie pas d'importer ton composant

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
                name={post.name}
                avatar={post.avatar}
                createdAt={post.createdAt}
            />

            <PostBody
                post={post}
                isEditing={isEditing}
                editContent={editContent}
                setEditContent={setEditContent}
                onSave={onSave}
                onCancel={onCancel}
            />

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
