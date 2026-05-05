import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type States = {
  fish: number;
  bear: number;
};

type Actions = {
  actions: {
    increaseFish: () => void;
    increaseBear: () => void;
  };
};

export const useStore = create<States & Actions>()(
  devtools(
    (set) => ({
      fish: 0,
      bear: 0,
      actions: {
        increaseFish: () => set((state) => ({ fish: state.fish + 1 }), undefined, 'increaseFish'),
        increaseBear: () => set((state) => ({ bear: state.bear + 1 }), undefined, 'increaseBear'),
      },
    }),
    {
      name: 'bearStore',
    },
  ),
);

export function useFish() {
  return useStore((state) => state.fish);
}

export function useBear() {
  return useStore((state) => state.bear);
}

export function useBearStoreActions() {
  return useStore((state) => state.actions);
}
