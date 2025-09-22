"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  isWhitelisted: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setMessage({ type: "error", text: "Failed to fetch users" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error fetching users" });
    } finally {
      setLoading(false);
    }
  };

  const toggleWhitelist = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/users/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isWhitelisted: !currentStatus }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "User status updated" });
        fetchUsers();
      } else {
        setMessage({ type: "error", text: "Failed to update user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error updating user" });
    }
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      setMessage({ type: "error", text: "Email and password are required" });
      return;
    }

    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          isWhitelisted: true,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "User created successfully" });
        setNewUserEmail("");
        setNewUserPassword("");
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Failed to create user",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error creating user" });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "User deleted successfully" });
        fetchUsers();
      } else {
        setMessage({ type: "error", text: "Failed to delete user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error deleting user" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Check authentication and role
  if (status === "loading") {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  // Check if user has admin or co-owner role
  const userRole = session.user.role;
  if (userRole !== "admin" && userRole !== "co-owner") {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            Access denied. Admin or co-owner role required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Administration</h1>

      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className="mb-4"
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Create New User */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createUser} className="w-full">
              Create User (Whitelisted)
            </Button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Users ({users.length})</h2>
            <Button onClick={fetchUsers} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isWhitelisted
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "co-owner"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant={user.isWhitelisted ? "destructive" : "default"}
                      onClick={() =>
                        toggleWhitelist(user.id, user.isWhitelisted)
                      }
                    >
                      {user.isWhitelisted ? "Remove Whitelist" : "Whitelist"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
