import axios, { type AxiosResponse } from 'axios'
import type { SystemState, QueryResponse } from '../types'

const BASE_URL = 'http://localhost:3000'

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

const getState = async (): Promise<SystemState> => {
    const response: AxiosResponse<SystemState> = await api.get('/api/state')
    return response.data
}

const query = async (question: string): Promise<QueryResponse> => {
    const response: AxiosResponse<QueryResponse> = await api.post('/api/query', { question })
    return response.data
}

export const apiService = { getState, query }
