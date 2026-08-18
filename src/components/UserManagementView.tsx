import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createNewUser } from '../auth-utils';
import { Trash2, Shield, ShieldAlert } from 'lucide-react';

export function UserManagementView() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);
    try {
      await createNewUser(newUsername, newPassword, newRole);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm('Xóa tài khoản này?')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
        // Note: Firebase Auth user is not deleted, only firestore profile. For a toy app, this prevents login effectively.
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const toggleRole = async (uid: string, currentRole: 'admin' | 'user') => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', uid), { role: nextRole });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Quản lý Tài khoản</h2>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create form */}
        <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-4">Thêm tài khoản mới</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="w-full border rounded p-2 text-sm" placeholder="VD: nhanvien1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full border rounded p-2 text-sm" placeholder="Tối thiểu 6 ký tự" minLength={6}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phân quyền</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as 'admin'|'user')} className="w-full border rounded p-2 text-sm">
                <option value="user">Nhân viên (User)</option>
                <option value="admin">Quản trị (Admin)</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={isCreating} className="w-full bg-blue-600 text-white rounded p-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {isCreating ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="md:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Danh sách tài khoản ({users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Tài khoản</th>
                  <th className="px-4 py-2">Vai trò</th>
                  <th className="px-4 py-2">Ngày tạo</th>
                  <th className="px-4 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const username = u.email.split('@')[0];
                  return (
                    <tr key={u.uid} className="border-b">
                      <td className="px-4 py-3 font-medium text-gray-800">{username}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleRole(u.uid, u.role)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {u.role === 'admin' ? <ShieldAlert size={14} /> : <Shield size={14} />}
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteUser(u.uid)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
