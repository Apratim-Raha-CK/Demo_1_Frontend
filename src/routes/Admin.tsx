import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "universal-cookie";
import UserTable from "../components/UserTable";
import type { UserInterface } from "../components/UserTable";
import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";

export default function Admin() {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleEditUser = (user: UserInterface) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";
  const navigate = useNavigate();
  const cookies = new Cookies();

  // Authentication check
  const userData = cookies.get("user_data");
  const isAdmin = userData && userData.role?.toLowerCase() === "admin";

  const handleLogout = () => {
    cookies.remove("user_data", { path: "/" });
    navigate("/login");
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${BACKEND_URL}/users`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user directory.");
      }
      const data = await response.json();
      if (!data || !data.data || !data.data.users) {
        throw new Error("Failed to load user records.");
      }
      setUsers(data.data.users);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An error occurred while fetching users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // If not admin, show Access Denied UI
  if (!userData || !isAdmin) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-150 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-6">
            You must be logged in as an administrator to access the admin dashboard panel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="py-2.5 px-5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const adminCount = users.filter((u) => u.role.toLowerCase() === "admin").length;
  const standardUserCount = users.length - adminCount;

  // Count instances of each permission
  let uploadPerms = 0;
  let viewPerms = 0;
  let deletePerms = 0;
  users.forEach((u) => {
    if (u.permissions.includes("file/upload")) uploadPerms++;
    if (u.permissions.includes("file/view")) viewPerms++;
    if (u.permissions.includes("file/delete")) deletePerms++;
  });

  return (
    <div className="min-h-screen w-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold text-sm tracking-wider shadow-md shadow-indigo-600/10">
              ADM
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin Console</h1>
              <p className="text-xs text-gray-400">System user directory & permissions control</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100/85 hover:bg-gray-200/60 active:bg-gray-200 transition-all rounded-lg cursor-pointer"
            >
              ← Files Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 active:bg-rose-100 transition-all rounded-lg cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Users Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-200">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total User Base</p>
              <h3 className="text-3xl font-extrabold text-gray-950 mt-1">{users.length}</h3>
              <p className="text-xs text-gray-500 mt-1.5">
                <span className="font-semibold text-purple-600">{adminCount}</span> Admins •{" "}
                <span className="font-semibold text-blue-600">{standardUserCount}</span> standard
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-xs">
              👥
            </div>
          </div>

          {/* Card 2: Permissions Stats */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-200">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Permissions Active</p>
              <h3 className="text-3xl font-extrabold text-gray-950 mt-1">
                {uploadPerms + viewPerms + deletePerms}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5">
                <span className="font-semibold text-teal-600">{viewPerms}</span> view •{" "}
                <span className="font-semibold text-amber-600">{uploadPerms}</span> upload •{" "}
                <span className="font-semibold text-rose-600">{deletePerms}</span> delete
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl shadow-xs">
              🔑
            </div>
          </div>

          {/* Card 3: Admin User Session */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-200">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Administrator Identity</p>
              <h3 className="text-xl font-bold text-gray-900 mt-2 truncate max-w-[200px]">
                {userData.username}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Logged in as system root</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl shadow-xs">
              🛡️
            </div>
          </div>
        </section>

        {/* Directory Header / Action Table */}
        <section className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">User Directory Control</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View all registered accounts and modify their authorization tokens
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/10 transition-all cursor-pointer self-start sm:self-auto"
            >
              <span className="text-base">+</span> Create User
            </button>
          </div>

          {/* Users Table */}
          {errorMsg ? (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600 font-medium text-center">
              ⚠️ {errorMsg}
              <button
                onClick={fetchUsers}
                className="block mx-auto mt-2 text-xs underline text-rose-700 hover:text-rose-900"
              >
                Retry Fetching
              </button>
            </div>
          ) : isLoading ? (
            <div className="py-20 text-center text-gray-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-600 rounded-full mb-3" />
              <p className="text-sm font-medium">Synchronizing system records...</p>
            </div>
          ) : (
            <UserTable users={users} onEditUser={handleEditUser} />
          )}
        </section>
      </main>

      {/* Modal overlay to create users */}
      <CreateUserModal open={showModal} setOpen={setShowModal} fetchUsers={fetchUsers} />

      {/* Modal overlay to edit users */}
      <EditUserModal open={showEditModal} setOpen={setShowEditModal} user={editingUser} fetchUsers={fetchUsers} />
    </div>
  );
}