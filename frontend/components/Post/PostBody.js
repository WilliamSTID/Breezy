export default function PostBody({ post, isEditing, editContent, setEditContent, onSave, onCancel }) {
    if (isEditing) {
        return (
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
        );
    }

    return <p className="mt-2 text-sm break-words whitespace-pre-wrap">{post.content}</p>;
}
