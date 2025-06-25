export default function Header({ username, createdAt }) {
    return (
        <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-800">{username}</span>
            <span className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</span>
        </div>
    );
}