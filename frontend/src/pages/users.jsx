import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../api";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase().trim();

        return (
            String(user.user_id || "").toLowerCase().includes(searchText) ||
            String(user.username || "").toLowerCase().includes(searchText) ||
            String(user.email || "").toLowerCase().includes(searchText) ||
            String(user.role || "").toLowerCase().includes(searchText)
        );
    });

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Users</h1>

                <div className="flex items-center rounded-md border px-3 py-2">
                    <Search size={18} className="mr-2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="outline-none"
                    />
                </div>
            </div>
        <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full border-collapse text-left">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="p-3">S.No</th>
                        <th className="p-3">User ID</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <tr key={user.user_id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3">{user.user_id}</td>
                                <td className="p-3">{user.username}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.role}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-4 text-center text-gray-500">
                                No users found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        </div>
    );
}
