import axios from 'axios'
import type { SystemState, QueryResponse } from '../types'

const BASE_URL = 'http://localhost:3000'

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

export const apiService = {
    getState: async (): Promise<SystemState> => {
        const response = await api.get<SystemState>('/api/state')
        return response.data
    },

    query: async (question: string): Promise<QueryResponse> => {
        const response = await api.post<QueryResponse>('/api/query', { question })
        return response.data
    },
}
