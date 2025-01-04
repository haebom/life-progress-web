import { create } from 'zustand';
import type { User, Block } from '@/types';

interface Store {
  user: User | null;
  setUser: (user: User | null | ((prev: User | null) => User | null)) => void;
  blocks: Record<string, Block>;
  setBlocks: (blocks: Record<string, Block>) => void;
  updateBlock: (blockId: string, block: Block) => void;
}

const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set((state) => ({
    user: typeof user === 'function' ? user(state.user) : user,
  })),
  blocks: {},
  setBlocks: (blocks) => set({ blocks }),
  updateBlock: (blockId, block) =>
    set((state) => ({
      blocks: {
        ...state.blocks,
        [blockId]: block,
      },
    })),
}));

export default useStore; 