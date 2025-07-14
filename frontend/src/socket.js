import { io } from 'socket.io-client';
const backendUrl = process.env.REACT_APP_API_URL || 'https://movie-bae-backend.onrender.com/api';
const socket = io(backendUrl.replace(/\/api$/, ''));
export default socket; 