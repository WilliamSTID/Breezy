export default function PostHeader({ username, avatar, createdAt }) {
    return (
        <div className="flex justify-between items-center mb-2">
            <img
                src={`http://localhost:4005${avatar}`}
                alt={username}
                className="w-8 h-8 rounded-full"
            />
            <span className="font-medium text-gray-800">{username}</span>
            <span className="text-xs text-gray-500">
        {new Date(createdAt).toLocaleString()}
      </span>
        </div>
    );
}
