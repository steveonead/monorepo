import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type States = {
  token: string | undefined;
};

type Actions = {
  actions: {
    setToken: (token: string) => void;
  };
};

export const useAuthStore = create<States & Actions>()(
  devtools(
    persist(
      (set) => ({
        token: undefined,
        actions: {
          setToken: (token) => set(() => ({ token }), undefined, 'setToken'),
        },
      }),
      {
        name: 'authStore',
        // 只持久化 token，actions（函式）不寫入 localStorage
        partialize: (state) => ({ token: state.token }),
      },
    ),
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

/** 供 router beforeLoad 等非 React 環境讀取 token。 */
export function getToken() {
  return useAuthStore.getState().token;
}
