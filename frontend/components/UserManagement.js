"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function UserManagement() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/users");
      setUsers(response.data.data);
      setError("");
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    setShowCreateForm(false);
    fetchUsers(); // Refresh user list
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "SALES_MANAGER":
        return "bg-blue-100 text-blue-800";
      case "SALES":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Memuat data pengguna...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Daftar Pengguna
          </h2>
          <p className="text-sm text-gray-600">
            Total {users.length} pengguna terdaftar
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Buat Akun Baru
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-50 rounded-lg p-6">
          <CreateUserForm
            onSuccess={handleUserCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pengguna Terdaftar
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p className="mt-2 text-gray-500">Belum ada pengguna terdaftar</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Create User Form Component
function CreateUserForm({ onSuccess, onCancel }) {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "SALES",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    };

    return requirements;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak sama");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordRequirements = validatePassword(formData.password);
    const invalidRequirements = Object.entries(passwordRequirements)
      .filter(([, passed]) => !passed)
      .map(([requirement]) => {
        switch (requirement) {
          case 'minLength': return 'Minimal 8 karakter';
          case 'hasUpperCase': return 'Huruf besar';
          case 'hasLowerCase': return 'Huruf kecil';
          case 'hasNumbers': return 'Angka';
          case 'hasSpecialChar': return 'Karakter khusus (@$!%*?&)';
          default: return requirement;
        }
      });

    if (invalidRequirements.length > 0) {
      setError(`Password harus memenuhi: ${invalidRequirements.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register/admin", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);

      if (error.response?.data?.details) {
        // Validation errors with field details
        const errorMessages = error.response.data.details.map(detail => detail.message);
        setError(errorMessages.join(', '));
      } else if (error.response?.data?.error?.message) {
        setError(error.response.data.error.message);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Gagal membuat pengguna");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Buat Akun Baru
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="email@contoh.com"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="SALES">Sales</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Minimal 8 karakter dengan huruf besar, angka, dan karakter khusus"
          />
          <p className="mt-1 text-xs text-gray-500">
            Password harus mengandung: minimal 8 karakter, huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&)
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Konfirmasi Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ulangi password"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Membuat..." : "Buat Akun"}
          </button>
        </div>
      </form>
    </div>
  );
}