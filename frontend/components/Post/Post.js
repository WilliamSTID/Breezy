export default function Post({ children }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
            {children}
        </div>
    );
}