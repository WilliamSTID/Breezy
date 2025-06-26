import Post from "./Post";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";

// Attache les sous-composants au composant principal
Post.Header = PostHeader;
Post.Body = PostBody;
Post.Footer = PostFooter;

export default Post;
