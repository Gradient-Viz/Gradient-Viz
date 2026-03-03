import {create} from 'zustand';
const useStore = create((set) => ({
    // State
    viewMode: '3d_explore',
    personPosition: [1.0, 1.0],
    showAscentPath: false,
    ascentProgress: 0,

    //Actions
    setViewMode: (mode) => set({viewMode: mode}),
    setPersonPosition: (pos) => set({personPosition: pos}),
    setShowAscentPath: (show) => set({showAscentPath: show}),
    setAscentProgress: (progress) => set({ascentProgress : progress}),
    reset: () => set({
        viewMode: '3d_explore',
        personPosition: [1.0, 1.0],
        showAscentPath: false,
        ascentProgress: 0,
    }),
}));

export default useStore;