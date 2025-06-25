import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";

export default function Post({
                                 post,
                                 onLike,
                                 onCommentSubmit,
                                 onCommentChange,
                                 onOpenComments,
                                 isComment = false, // nouvelle prop par défaut à false
                             }) {
    return (
        <div
            className={`p-4 rounded-xl shadow hover:shadow-md transition ${
                isComment ? "bg-gray-50 ml-4 border-l-4 border-blue-100" : "bg-white"
            }`}
        >
            <Header username={post.author?.username || post.username} createdAt={post.createdAt} />
            <Body content={post.content} />
            <Footer
                post={post}
                onLike={onLike}
                onCommentSubmit={onCommentSubmit}
                onCommentChange={onCommentChange}
                onOpenComments={onOpenComments}
            />
        </div>
    );
}
