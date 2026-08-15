import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useEffect } from "react";
import Cookies from "universal-cookie";

interface FileUploadProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchFiles: () => void;
}

export default function FileUpload({ open, setOpen, fetchFiles }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [project, setProject] = useState("general");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [allowedProjects, setAllowedProjects] = useState<string[]>([]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";
  const cookies = new Cookies();

  // Load user permissions to see where they can upload
  useEffect(() => {
    const userData = cookies.get("user_data");
    if (!userData) return;

    const isAdmin = userData.role?.toLowerCase() === "admin";
    const perms: string[] = userData.permissions || [];

    const allowed: string[] = [];
    if (isAdmin || perms.includes("file/upload")) {
      allowed.push("general");
    }
    if (isAdmin || perms.includes("file/upload") || perms.includes("file/project1/upload")) {
      allowed.push("project1");
    }
    if (isAdmin || perms.includes("file/upload") || perms.includes("file/project2/upload")) {
      allowed.push("project2");
    }

    setAllowedProjects(allowed);

    // Default to the first allowed folder
    if (allowed.length > 0) {
      setProject(allowed[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      setErrorMsg("Please select a file to upload.");
      return;
    }

    if (allowedProjects.length === 0) {
      setErrorMsg("You do not have permission to upload files to any folder.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("uploaded_file", uploadedFile);
    formData.append("project", project);

    try {
      const response = await fetch(`${BACKEND_URL}/upload-file`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        setErrorMsg("Error occurred while uploading the file.");
        setIsUploading(false);
        return;
      }

      const data = await response.json();
      if (!data || data?.status !== "success") {
        setErrorMsg(data?.message || "Error occurred while uploading the file.");
        setIsUploading(false);
        return;
      }

      setSuccessMsg(data?.message || "File uploaded successfully!");
      setTimeout(() => {
        setUploadedFile(null);
        setErrorMsg("");
        setOpen(false);
        setSuccessMsg("");
        setIsUploading(false);
        fetchFiles();
      }, 1000);
    } catch (error) {
      console.error(error);
      setErrorMsg("Connection error. Could not upload.");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !isUploading && setOpen(false)} className="relative z-50">
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
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <span className="text-xl">📤</span>
                </div>
                <div>
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 leading-none">
                    Upload File
                  </DialogTitle>
                  <p className="text-xs text-gray-400 mt-1">Select local file and define folder destination.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Folder destination */}
                <div>
                  <label htmlFor="folder-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Destination Folder
                  </label>
                  {allowedProjects.length === 0 ? (
                    <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                      ⚠️ No write access. You cannot upload files.
                    </p>
                  ) : (
                    <select
                      id="folder-select"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-950 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      {allowedProjects.includes("general") && <option value="general">General Files</option>}
                      {allowedProjects.includes("project1") && <option value="project1">Project 1 Folder</option>}
                      {allowedProjects.includes("project2") && <option value="project2">Project 2 Folder</option>}
                    </select>
                  )}
                </div>

                {/* File picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Select File
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100/80 transition group">
                    <input type="file" onChange={handleFileChange} disabled={isUploading} className="hidden" />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <span className="text-3xl mb-2 text-gray-400 group-hover:text-gray-500 transition-colors">📁</span>
                      <p className="text-sm font-semibold text-gray-600 truncate max-w-xs">
                        {uploadedFile ? uploadedFile.name : "Click to select local file"}
                      </p>
                      {!uploadedFile && <p className="text-xs text-gray-400 mt-1">Supports any format</p>}
                    </div>
                  </label>
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
                type="button"
                disabled={isUploading || allowedProjects.length === 0}
                onClick={handleFileUpload}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 active:bg-indigo-800 transition-all cursor-pointer"
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 focus:outline-hidden transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}