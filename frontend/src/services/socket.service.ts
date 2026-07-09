import { io, Socket } from 'socket.io-client'

const BACKEND_URL = 'http://localhost:3000'

// Single socket instance - created once, reused everywhere
// Connecting to the /events namespace we defined in the backend
let socket: Socket | null = null

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(`${BACKEND_URL}/events`, {
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })
    }
    return socket
}

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
