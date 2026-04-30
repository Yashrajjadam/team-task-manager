import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Shield, User, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      setUsers((p) => p.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted');
      setUsers((p) => p.filter((u) => u._id !== userId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Users</h1>
        <p className="text-surface-400 mt-1">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-surface-700/30 hover:bg-surface-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-400">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="text-xs bg-surface-700/60 border border-surface-600/40 rounded-lg px-3 py-1.5 text-surface-300 focus:outline-none focus:border-brand-500/50"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => handleDelete(u._id, u.name)} className="p-1.5 text-surface-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-surface-700/30">
          {users.map((u) => (
            <div key={u._id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-surface-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={u.role === 'admin' ? 'badge-admin' : 'badge-member'}>{u.role}</span>
                <button onClick={() => handleDelete(u._id, u.name)} className="p-1.5 text-surface-500 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
