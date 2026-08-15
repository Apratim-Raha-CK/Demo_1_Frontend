export interface UserInterface {
  userid: number;
  username: string;
  role: string;
  permissions: string[];
}

interface UserTableProps {
  users: UserInterface[];
  onEditUser?: (user: UserInterface) => void;
}

export default function UserTable({ users, onEditUser }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-4">User ID</th>
              <th scope="col" className="px-6 py-4">Username</th>
              <th scope="col" className="px-6 py-4">Role</th>
              <th scope="col" className="px-6 py-4">Permissions</th>
              <th scope="col" className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">👥</span>
                    <p className="text-sm font-medium">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user.userid} 
                  className="hover:bg-gray-50/80 transition-colors duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    #{user.userid}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider ${
                      user.role.toLowerCase() === 'admin' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        user.role.toLowerCase() === 'admin' ? 'bg-purple-600' : 'bg-blue-500'
                      }`} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.permissions.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">None</span>
                      ) : (
                        user.permissions.map((perm) => {
                          let badgeStyle = "bg-gray-50 text-gray-600 border-gray-200/60";
                          if (perm === "file/upload") {
                            badgeStyle = "bg-amber-50 text-amber-700 border-amber-200/60";
                          } else if (perm === "file/view") {
                            badgeStyle = "bg-teal-50 text-teal-700 border-teal-200/60";
                          } else if (perm === "file/delete") {
                            badgeStyle = "bg-rose-50 text-rose-700 border-rose-200/60";
                          }
                          return (
                            <span 
                              key={perm} 
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${badgeStyle}`}
                            >
                              {perm}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onEditUser?.(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200/40 hover:bg-indigo-100 hover:text-indigo-700 active:bg-indigo-150 transition-all rounded-md cursor-pointer font-semibold"
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
