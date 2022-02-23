import { create } from 'apisauce'

const apiClient = create({
    baseURL: 'https://api.coingecko.com/api/v3/'
});

const get = apiClient.get;

apiClient.get = async (url, params, axiosConfig) => {
    const response = await get(url, params, axiosConfig);
    if (response.ok) {
        return response;
    }
    return data ? { ok: true, data } : response;
}

export default apiClient;