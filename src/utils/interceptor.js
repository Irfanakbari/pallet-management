import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/'; // Meredirect ke halaman '/'
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
