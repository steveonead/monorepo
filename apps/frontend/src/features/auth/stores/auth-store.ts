import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type States = {
  token: string | undefined;
};

type Actions = {
  actions: {
    setToken: (token: string) => void;
  };
};

const useAuthStore = create<States & Actions>()(
  devtools(
    (set) => ({
      token: undefined,
      actions: {
        setToken: (token) => set(() => ({ token }), undefined, 'setToken'),
      },
    }),
    {
      name: 'authStore',
    },
  ),
);

export function useToken() {
  return useAuthStore((state) => state.token);
}

export function useAuthStoreActions() {
  return useAuthStore((state) => state.actions);
}
