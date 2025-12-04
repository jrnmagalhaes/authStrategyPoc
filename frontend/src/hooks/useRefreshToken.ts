import { api } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        try {
            const response = await api.post('/auth/refresh');
            setAuth(prev => {
                console.log('Previous Auth State:', JSON.stringify(prev));
                console.log('New Access Token:', response.data.accessToken);
                return { ...prev, accessToken: response.data.accessToken }
            });
            return response.data.accessToken;
        } catch (error) {
            console.error('Refresh failed', error);
            throw error;
        }
    }
    return refresh;
};

export default useRefreshToken;
