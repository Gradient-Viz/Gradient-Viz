import {create} from 'zustand';
const useStore = create((set) => ({
    // State
    viewMode: '3d_explore',
    personPosition: [1.0, 1.0],
    showAscentPath: false,
    ascentProgress: 0,
    surfacePathProgress: 0,
    functionText: 'Math.sin(x) + Math.cos(x)',
    gridLines: 64,
    domainMin: -6,
    domainMax: 6,
    functionVersion: 0,
    showGroundContours: false,
    showSurfaceContours: true,
    showVectors: true,

    //Actions
    setViewMode: (mode) => set({viewMode: mode}),
    setPersonPosition: (pos) => set({personPosition: pos}),
    setShowAscentPath: (show) => set({showAscentPath: show}),
    setAscentProgress: (progress) => set({ascentProgress : progress}),
    setFunctionText: (text) => set({functionText: text}),
    incrementFunctionVersion: () => set((state) => ({functionVersion: state.functionVersion + 1})),
    setGridLines: (n) => set({gridLines: n}),
    setDomainMin: (val) => set({domainMin: val}),
    setDomainMax: (val) => set({domainMax: val}),
    toggleGroundContours: () => set((s) => ({ showGroundContours: !s.showGroundContours })),
    toggleSurfaceContours: () => set((s) =>  ({ showSurfaceContours: !s.showSurfaceContours })),
    toggleVectors: () => set((s) => ({ showVectors: !s.showVectors })),
    setSurfacePathProgress: (progress) => set({surfacePathProgress: progress}),
    reset: () => set({
        viewMode: '3d_explore',
        personPosition: [1.0, 1.0],
        showAscentPath: false,
        ascentProgress: 0,
        surfacePathProgress: 0,
    }),
}));

export default useStore;