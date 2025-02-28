import { useState } from 'react';
import apiClient from '../../infrastructure/axios/axios';
import { RequestModel } from '../../domain/models/requestModel';
import { AxiosError } from 'axios';

type ApiMethod = 'get' | 'post' | 'put' | 'delete';
interface ApiResponse<T> {  // Define an interface for the API response
    success: boolean;
    data?: T;
    message?: string;
}

export const useApi = <T, R = unknown>() => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ApiResponse<T> | null>(null);

    const request = async (method: ApiMethod, url: string, requestData?: R) => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (method === 'get') {
                response = await apiClient.get<{ success: boolean; data: T }>(url);
            } else {
                const requestPayload: RequestModel<R> = {
                    requestId: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    requestData: requestData || {} as R,
                };
                response = await apiClient[method]<{ success: boolean; data: T }>(url, requestPayload);
            }
            setData(response.data);
            return response.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ message: string }>;
            setError(axiosError.response?.data?.message || 'Something went wrong');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, data, request };
};
