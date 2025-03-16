import axios from 'axios'

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = {
    get: async (endpoint: string, params = {}) => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API GET: ${url}`, params)
        return axios.get(url, { params })
    },

    post: async (endpoint: string, data = {}) => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API POST: ${url}`, data)
        return axios.post(url, data)
    },

    put: async (endpoint: string, data = {}) => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API PUT: ${url}`, data)
        return axios.put(url, data)
    },

    delete: async (endpoint: string) => {
        const url = `${getApiBaseUrl()}${endpoint}`
        console.log(`API DELETE: ${url}`)
        return axios.delete(url)
    }
}