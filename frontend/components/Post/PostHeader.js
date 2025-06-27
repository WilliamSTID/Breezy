export default function PostHeader({ name, avatar, createdAt }) {
    return (
        <div className="flex justify-between items-center mb-2">
            <img
                src={`http://localhost:4005${avatar}`}
                alt={name}
                className="w-8 h-8 rounded-full"
            />
            <span className="font-medium text-gray-800">{name}</span>
            <span className="text-xs text-gray-500">
        {new Date(createdAt).toLocaleString()}
      </span>
        </div>
    );
}
