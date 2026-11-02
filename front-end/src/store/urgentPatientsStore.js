import { create } from 'zustand';
import { urgentPatientsService } from '../api/urgentPatientsService';

export const useUrgentPatientsStore = create((set, get) => ({
  urgentCount: 0,
  isLoadingCount: false,

  setUrgentCount: (count) => set({ urgentCount: typeof count === 'number' ? count : 0 }),

  fetchUrgentCount: async () => {
    try {
      set({ isLoadingCount: true });
      const data = await urgentPatientsService.list({ page: 1, pageSize: 1 });
      const count = typeof data?.count === 'number' ? data.count : 0;
      set({ urgentCount: count, isLoadingCount: false });
      return count;
    } catch {
      set({ isLoadingCount: false });
      return get().urgentCount;
    }
  },
}));

export default useUrgentPatientsStore;

