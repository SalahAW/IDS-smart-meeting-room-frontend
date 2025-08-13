import axios from 'axios';
import { getSession } from 'next-auth/react';
import {Session} from "next-auth";

const api = axios.create({
    baseURL: 'https://localhost:7032', //
    headers: {
        'Content-Type': 'application/json',
    },
});

// Use an interceptor to dynamically add the token to every request
api.interceptors.request.use(async (config) => {
    const session: Session | null = await getSession();

    if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;