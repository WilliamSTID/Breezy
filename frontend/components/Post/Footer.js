import { Heart, MessageCircle } from "lucide-react";

export default function Footer({ post, onLike, onOpenComments, onCommentChange, onCommentSubmit }) {
    return (
        <div className="mt-3">
            <div className="flex gap-6 text-gray-500 text-sm">
                <button onClick={() => onLike(post._id)} className="flex items-center gap-1 hover:text-red-500 transition">
                    <Heart
                        size={18}
                        fill={post.liked ? "red" : "none"}
                        stroke={post.liked ? "red" : "currentColor"}
                    />
                    <span>{post.likes || 0}</span>
                </button>

                <button
                    onClick={() => onOpenComments(post._id)}
                    className="flex items-center gap-1 hover:text-blue-500 transition"
                >
                    <MessageCircle size={18} />
                    <span>{post.commentCount || 0}</span>
                </button>

                {/*<button onClick={() => onShowComments(post._id)} className="text-sm text-blue-500 hover:underline">*/}
                {/*    Afficher les commentaires*/}
                {/*</button>*/}
            </div>

        {/*    <div className="mt-2">*/}
        {/*<textarea*/}
        {/*    rows={2}*/}
        {/*    placeholder="Ajouter un commentaire..."*/}
        {/*    value={post.newComment || ""}*/}
        {/*    onChange={(e) => onCommentChange(post._id, e.target.value)}*/}
        {/*    className="w-full p-2 border rounded text-sm"*/}
        {/*/>*/}
        {/*        <button*/}
        {/*            onClick={() => onCommentSubmit(post._id, post.newComment)}*/}
        {/*            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"*/}
        {/*        >*/}
        {/*            Publier*/}
        {/*        </button>*/}
        {/*    </div>*/}
        </div>
    );
}
