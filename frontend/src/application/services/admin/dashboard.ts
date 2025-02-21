import apiClient from '../../../infrastructure/axios/axios';

export const fetchAdmins = async () => {
    const response = await apiClient.get('/admins');
    return response.data.data; // Extracting only the "data" field
};

export const createAdmin = async (adminData: []) => {
    const response = await apiClient.post('/admins', { requestData: adminData });
    return response.data.data; // Extracting only the "data" field
};
