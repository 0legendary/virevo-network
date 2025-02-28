import { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../../application/hooks/useApi';
import { Admin } from '../../../domain/models/Admin';

const AdminDashboard = () => {
  const { loading: loadingAdmins, error: errorAdmins, request: fetchAdmins } = useApi<Admin[]>();
  const { loading: loadingDelete, error: errorDelete, request: deleteAdmin } = useApi<void>(); 

  const [adminList, setAdminList] = useState<Admin[]>([]);

  const fetchAdminsCallback = useCallback(() => {
    fetchAdmins('get', '/admins').then((data) => {
    });
  }, [fetchAdmins]);

  useEffect(() => {
    fetchAdminsCallback();
  }, [fetchAdminsCallback]);

  const handleDelete = async (id: string) => {
    await deleteAdmin('delete', `/admins/${id}`);
    fetchAdminsCallback();
  };

  const handleChangeName = (id: string, newName: string) => {
    setAdminList((prev) =>
      prev.map((admin) => (admin.id === id ? { ...admin, name: newName } : admin))
    );
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {loadingAdmins && <p>Loading Admins...</p>}
      {errorAdmins && <p className="error">{errorAdmins}</p>}
      <ul>
        {adminList?.map((admin) => (
          <li key={admin.id}>
            <input
              type="text"
              value={admin.name}
              onChange={(e) => handleChangeName(admin.id, e.target.value)}
            />
            {admin.email}
            <button onClick={() => handleDelete(admin.id)} disabled={loadingDelete}>
              {loadingDelete ? 'Deleting...' : 'Delete'}
            </button>
            {errorDelete && <p className="error">{errorDelete}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
