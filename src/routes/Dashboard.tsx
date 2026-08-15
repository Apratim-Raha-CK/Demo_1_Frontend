import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "universal-cookie";
import FileTable from "../components/FileTable";
import FileUpload from "../components/FileUpload";

export interface FileInterface {
  id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  created_by: string;
  project?: string;
}

export default function Dashboard() {
  const [fileData, setFileData] = useState<FileInterface[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeFolder, setActiveFolder] = useState<string>("general");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";
  const navigate = useNavigate();
  const cookies = new Cookies();

  // Authentication & Permission state
  const userData = cookies.get("user_data");
  const isLoggedIn = !!userData;
  const username = userData?.username ?? "";
  const userRole = userData?.role ?? "";
  const userPermissions: string[] = userData?.permissions ?? [];
  const isAdmin = userRole.toLowerCase() === "admin";

  const handleLogout = () => {
    cookies.remove("user_data", { path: "/" });
    navigate("/login");
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${BACKEND_URL}/files`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch storage data.");
      }

      const data = await response.json();
      if (!data || !data?.data?.files) {
        throw new Error("Failed to parse file records.");
      }
      setFileData([...data.data.files]);
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred while fetching files.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      fetchFiles();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  // Folder configuration & permission rules
  const folders = [
    {
      id: "project1",
      name: "Project 1 Folder",
      icon: "💼",
      viewPerm: "file/project1/view",
      uploadPerm: "file/project1/upload",
      deletePerm: "file/project1/delete",
      description: "Confidential files for Project 1 team",
    },
    {
      id: "project2",
      name: "Project 2 Folder",
      icon: "🚀",
      viewPerm: "file/project2/view",
      uploadPerm: "file/project2/upload",
      deletePerm: "file/project2/delete",
      description: "Assets and resources for Project 2",
    },
  ];

  // Helper to check view permission for a folder card
  const canViewFolder = (folderId: string) => {
    if (isAdmin) return true;
    if (folderId === "project1") {
      return userPermissions.includes("file/view") || userPermissions.includes("file/project1/view");
    } else if (folderId === "project2") {
      return userPermissions.includes("file/view") || userPermissions.includes("file/project2/view");
    }
    return false;
  };

  // Helper to check upload permission in active folder
  const canUploadInActiveFolder = () => {
    if (isAdmin) return true;
    if (activeFolder === "project1") {
      return userPermissions.includes("file/upload") || userPermissions.includes("file/project1/upload");
    } else if (activeFolder === "project2") {
      return userPermissions.includes("file/upload") || userPermissions.includes("file/project2/upload");
    }
    return false;
  };

  // Auto-adjust active folder if current is locked
  useEffect(() => {
    if (!canViewFolder(activeFolder)) {
      // Find first viewable folder
      const firstAvailable = folders.find((f) => canViewFolder(f.id));
      if (firstAvailable) {
        setActiveFolder(firstAvailable.id);
      } else {
        setActiveFolder(""); // Completely locked out of everything
      }
    }
  }, [fileData]);

  const displayedFiles = fileData.filter((file) => {
    const fileProject = file.project || "general";
    return fileProject === activeFolder;
  });

  const getFolderFilesCount = (folderId: string) => {
    return fileData.filter((f) => (f.project || "general") === folderId).length;
  };

  const getFolderTotalSize = (folderId: string) => {
    const sizeBytes = fileData
      .filter((f) => (f.project || "general") === folderId)
      .reduce((sum, f) => sum + f.file_size, 0);
    if (sizeBytes === 0) return "0 KB";
    return (sizeBytes / 1024).toFixed(1) + " KB";
  };

  const hasUploadAccess = canUploadInActiveFolder() && activeFolder !== "";

  return (
    <div className="min-h-screen w-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-sm tracking-wider shadow-md shadow-blue-600/10">
              GCP
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">File Console</h1>
              <p className="text-xs text-gray-400">Secure storage with granular permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 py-1.5 px-3 rounded-lg">
              👤 {username} ({userRole})
            </span>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 active:bg-indigo-150 transition-all rounded-lg cursor-pointer"
              >
                🛡️ Admin Dashboard
              </button>
            )}
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
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Welcome, {username}</h2>
          <p className="text-sm text-gray-500 mt-1">Manage files and view details across assigned project directories.</p>
        </section>

        {/* Directory/Folders Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {folders.map((folder) => {
            const viewable = canViewFolder(folder.id);
            const active = activeFolder === folder.id;

            return (
              <button
                key={folder.id}
                disabled={!viewable}
                onClick={() => setActiveFolder(folder.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                  !viewable
                    ? "bg-gray-100/70 border-gray-200 cursor-not-allowed opacity-60"
                    : active
                    ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                    : "bg-white border-gray-200/80 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer"
                }`}
              >
                {/* Folder details */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{folder.icon}</span>
                    {!viewable ? (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        🔒 Locked
                      </span>
                    ) : active ? (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                    {folder.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{folder.description}</p>
                </div>

                {/* Info block */}
                {viewable && (
                  <div className="border-t border-gray-100 pt-3 mt-4 w-full flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>{getFolderFilesCount(folder.id)} files</span>
                    <span>{getFolderTotalSize(folder.id)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </section>

        {/* Locked Out Alert */}
        {activeFolder === "" ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center max-w-lg mx-auto shadow-xs">
            <span className="text-4xl">🛡️</span>
            <h3 className="text-lg font-bold text-gray-900 mt-4">Access Restricted</h3>
            <p className="text-sm text-gray-400 mt-1.5">
              You do not have permission to view files in any system folders. Contact your administrator to request permissions.
            </p>
          </div>
        ) : (
          /* File listing section */
          <section className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Folder: {folders.find((f) => f.id === activeFolder)?.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Displaying files matches this workspace node. Actions are restricted by directory permissions.
                </p>
              </div>

              {/* Add File button (conditional) */}
              <button
                disabled={!hasUploadAccess}
                onClick={() => setShowModal(true)}
                title={hasUploadAccess ? "Upload file" : "You do not have upload permissions in this folder"}
                className={`inline-flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all ${
                  hasUploadAccess
                    ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/10 cursor-pointer"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
                }`}
              >
                <span>+</span> Add file {hasUploadAccess ? "" : "🔒"}
              </button>
            </div>

            {/* Error or Loading states */}
            {errorMsg ? (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600 font-medium text-center">
                ⚠️ {errorMsg}
                <button
                  onClick={fetchFiles}
                  className="block mx-auto mt-2 text-xs underline text-rose-700 hover:text-rose-900"
                >
                  Retry Load
                </button>
              </div>
            ) : isLoading ? (
              <div className="py-20 text-center text-gray-400">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-3" />
                <p className="text-sm font-medium">Synchronizing storage directory...</p>
              </div>
            ) : (
              <FileTable
                fileData={displayedFiles}
                userPermissions={userPermissions}
                isAdmin={isAdmin}
                onRefresh={fetchFiles}
              />
            )}
          </section>
        )}
      </main>

      {/* File Upload Modal */}
      {showModal && (
        <FileUpload open={showModal} setOpen={setShowModal} fetchFiles={fetchFiles} />
      )}
    </div>
  );
}