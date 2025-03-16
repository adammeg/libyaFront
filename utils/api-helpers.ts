import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = {
    get: async <T = any>(endpoint: string, params = {}, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API GET: ${url}`, params)
        return axios.get(url, { ...config, params })
    },

    post: async <T = any>(endpoint: string, data = {}, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API POST: ${url}`, data)
        return axios.post(url, data, config)
    },

    put: async <T = any>(endpoint: string, data = {}, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API PUT: ${url}`, data)
        return axios.put(url, data, config)
    },

    delete: async <T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API DELETE: ${url}`)
        return axios.delete(url, config)
    },

    // Special method for form data (multipart/form-data)
    postForm: async <T = any>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API POST FORM: ${url}`)
        return axios.post(url, formData, {
            ...config,
            headers: {
                ...(config?.headers || {}),
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    putForm: async <T = any>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API PUT FORM: ${url}`)
        return axios.put(url, formData, {
            ...config,
            headers: {
                ...(config?.headers || {}),
                'Content-Type': 'multipart/form-data',
            },
        })
    }
}