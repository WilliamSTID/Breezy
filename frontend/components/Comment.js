// components/Post/Comment.js
import Header from "./Post/Header";
import Body from "./Post/Body";
import Footer from "./Post/Footer";

export default function Comment({
                                    comment,
                                    onLike,
                                    onCommentSubmit,
                                    onCommentChange,
                                    onOpenComments,
                                }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition mb-3 ml-6">
            <Header
                username={comment.author?.username || "Utilisateur"}
                createdAt={comment.createdAt}
            />
            <Body content={comment.content} />
            <Footer
                post={comment} // le commentaire est structuré comme un post
                onLike={onLike}
                onCommentSubmit={onCommentSubmit}
                onCommentChange={onCommentChange}
                onOpenComments={onOpenComments}
            />
        </div>
    );
}
