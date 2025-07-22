// client/src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            userInfo: null,
            token: null,
            login: (data) => set({ userInfo: { id: data.id, email: data.email }, token: data.token }),
            logout: () => set({ userInfo: null, token: null }),
        }),
        {
            name: 'auth-storage', // Nome per il local storage
        }
    )
);

export default useAuthStore;