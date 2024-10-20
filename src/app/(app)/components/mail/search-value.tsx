import { create } from 'zustand';

type SearchStore = {
  searchValue: string;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  setSearchValue: (searchValue: string) => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  searchValue: '',
  isSearching: false,
  setIsSearching: (isSearching: boolean) => set({ isSearching }),
  setSearchValue: (searchValue: string) => set({ searchValue }),
}));
