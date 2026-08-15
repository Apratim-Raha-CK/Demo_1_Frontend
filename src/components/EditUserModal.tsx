import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";
import type { UserInterface } from "./UserTable";

interface EditUserModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserInterface | null;
  fetchUsers: () => void;
}

export default function EditUserModal({ open, setOpen, user, fetchUsers }: EditUserModalProps) {
  const [role, setRole] = useState("user");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

  // Prefill the values whenever the active user changes
  useEffect(() => {
    if (user) {
      setRole(user.role);
      setPermissions(user.permissions);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [user]);

  const handlePermissionChange = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${BACKEND_URL}/users/${user.userid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: role,
          permissions: permissions,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        setErrorMsg(data?.message || "Failed to update user.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data?.message || "User updated successfully!");
      setTimeout(() => {
        setOpen(false);
        fetchUsers();
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={() => !isSubmitting && setOpen(false)} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity duration-300 ease-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all duration-300 ease-out data-closed:translate-y-4 data-closed:opacity-0 data-closed:scale-95 sm:my-8 sm:w-full sm:max-w-md"
          >
            <form onSubmit={handleFormSubmit}>
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <span className="text-xl">✏️</span>
                  </div>
                  <div>
                    <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 leading-none">
                      Edit User: {user.username}
                    </DialogTitle>
                    <p className="text-xs text-gray-400 mt-1">Modify account role and assigned permissions.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Read-only Username */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Username (cannot be changed)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.username}
                      className="w-full px-3.5 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* System Role */}
                  <div>
                    <label htmlFor="edit-role-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      System Role
                    </label>
                    <select
                      id="edit-role-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-955 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="user">User (Standard Access)</option>
                      <option value="admin">Administrator (Full Dashboard Access)</option>
                    </select>
                  </div>

                  {/* Permissions */}
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Permissions
                    </span>
                    <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                      {["file/view", "file/upload", "file/delete","file/project1/upload","file/project2/upload","file/project1/view","file/project2/view","file/project1/delete","file/project2/delete"].map((perm) => (
                        <label key={perm} className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={permissions.includes(perm)}
                            onChange={() => handlePermissionChange(perm)}
                            className="h-4.5 w-4.5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500/20 transition-all"
                          />
                          <span className="text-sm font-medium text-gray-700">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-600 font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mt-4 rounded-lg bg-teal-50 border border-teal-100 p-3 text-xs text-teal-600 font-medium">
                    ✓ {successMsg}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3 rounded-b-2xl border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 active:bg-indigo-800 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 focus:outline-hidden transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
