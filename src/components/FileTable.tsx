import { useState } from "react";
import type { FileInterface } from "../routes/Dashboard";

interface FileTableProps {
  fileData: FileInterface[];
  userPermissions: string[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function FileTable({ fileData, userPermissions, isAdmin, onRefresh }: FileTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

  // Helper to check folder permission
  const checkPermission = (action: "view" | "upload" | "delete", project: string) => {
    if (isAdmin) return true;
    const cleanProj = project.toLowerCase().trim();
    // Check general permission
    if (userPermissions.includes(`file/${action}`)) return true;
    // Check project-specific permission
    if (userPermissions.includes(`file/${cleanProj}/${action}`)) return true;
    return false;
  };

  const handleStartRename = (file: FileInterface) => {
    if (!file.id) return;
    setEditingId(file.id);
    setNewName(file.file_name);
    setActionError(null);
  };

  const handleSaveRename = async (id: string) => {
    if (!newName.trim()) {
      setActionError("File name cannot be empty.");
      return;
    }
    setIsSaving(true);
    setActionError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/files/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_name: newName.trim() }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to rename file.");
      }
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to rename file.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    setActionError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/files/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to delete file.");
      }
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete file.");
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("pdf")) return "bg-red-50 text-red-700 border-red-200/50";
    if (t.includes("csv")) return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
    if (t.includes("xls") || t.includes("sheet")) return "bg-teal-50 text-teal-700 border-teal-200/50";
    if (t.includes("json")) return "bg-amber-50 text-amber-700 border-amber-200/50";
    return "bg-zinc-50 text-zinc-700 border-zinc-200/50";
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-600 font-medium">
          ⚠️ {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">File Name</th>
                <th scope="col" className="px-6 py-4">Extension</th>
                <th scope="col" className="px-6 py-4">Size</th>
                <th scope="col" className="px-6 py-4">Created By</th>
                <th scope="col" className="px-6 py-4">Created At</th>
                <th scope="col" className="px-6 py-4">Folder</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {fileData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">📁</span>
                      <p className="text-sm font-medium">No files found in this folder</p>
                    </div>
                  </td>
                </tr>
              ) : (
                fileData.map((file) => {
                  const proj = file.project || "general";
                  const canView = checkPermission("view", proj);
                  const canEdit = checkPermission("upload", proj);
                  const canDelete = checkPermission("delete", proj);

                  return (
                    <tr 
                      key={file.id || `${file.file_name}-${file.created_at}`}
                      className="hover:bg-gray-50/50 transition-colors duration-150 ease-in-out"
                    >
                      {/* File Name */}
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs md:max-w-md">
                        {editingId === file.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              disabled={isSaving}
                              className="flex-1 px-3 py-1 border border-indigo-400 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                              onClick={() => file.id && handleSaveRename(file.id)}
                              disabled={isSaving}
                              className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-md font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer"
                            >
                              {isSaving ? "..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={isSaving}
                              className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">📄</span>
                            <span className="truncate">{file.file_name}</span>
                          </div>
                        )}
                      </td>

                      {/* File Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border ${getFileTypeColor(file.file_type)}`}>
                          {file.file_type}
                        </span>
                      </td>

                      {/* File Size */}
                      <td className="px-6 py-4 text-xs font-medium text-gray-400">
                        {formatBytes(file.file_size)}
                      </td>

                      {/* Created By */}
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {file.created_by}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(file.created_at).toLocaleDateString("en-IN")}
                      </td>

                      {/* Folder Project tag */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {proj}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* View Button */}
                          <button
                            disabled={!canView}
                            onClick={() => alert(`Mocking file view: ${file.file_name}`)}
                            title={canView ? "View file" : "You do not have view permissions"}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
                              canView 
                                ? "bg-teal-50 text-teal-600 border-teal-200/40 hover:bg-teal-100 hover:text-teal-700 cursor-pointer"
                                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            }`}
                          >
                            👁️ {canView ? "" : "🔒"}
                          </button>

                          {/* Edit (Rename) Button */}
                          <button
                            disabled={!canEdit || editingId === file.id}
                            onClick={() => handleStartRename(file)}
                            title={canEdit ? "Rename file" : "You do not have rename permissions"}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
                              canEdit 
                                ? "bg-amber-50 text-amber-600 border-amber-200/40 hover:bg-amber-100 hover:text-amber-700 cursor-pointer"
                                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            }`}
                          >
                            ✏️ {canEdit ? "" : "🔒"}
                          </button>

                          {/* Delete Button */}
                          <button
                            disabled={!canDelete || !file.id}
                            onClick={() => file.id && handleDelete(file.id)}
                            title={canDelete ? "Delete file" : "You do not have delete permissions"}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
                              canDelete 
                                ? "bg-rose-50 text-rose-600 border-rose-200/40 hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            }`}
                          >
                            🗑️ {canDelete ? "" : "🔒"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}