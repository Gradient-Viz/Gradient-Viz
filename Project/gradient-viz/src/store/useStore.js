import { createWithEqualityFn } from 'zustand/traditional';
const useStore = createWithEqualityFn((set) => ({
    // State
    viewMode: '3d_explore',
    personPosition: [1.0, 1.0],
    showAscentPath: false,
    ascentProgress: 0,
    surfacePathProgress: 0,
    functionText: '(7*x*y)/exp(x^2+y^2)',
    gridLines: 256,
    domainMin: -6,
    domainMax: 6,
    vectorCount: 13,
    functionVersion: 0,
    showGroundContours: false,
    showSurfaceContours: true,
    showVectors: true,
    interactionMode: "click",
    isVRsession: false,
    vrUIVisible: true,
    vrUIPanelPosition: [0, 1.2, -1.5],
    vrUIPanelRotation: [0,0,0],
    vrLeftGripActive: false,
    vrRightGripActive: false,
    wireframe: true,

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
    setVectorCount: (n) => set({vectorCount: n}),
    setDomainHalfRange: (halfRange) => set((state) => {
        const min = -halfRange;
        const max = halfRange;
        const [px, py] = state.personPosition;
        const clamp = (value) => Math.max(min, Math.min(max, value));
        return {
            domainMin: min,
            domainMax: max,
            personPosition: [clamp(px), clamp(py)],
        };
    }),
    toggleGroundContours: () => set((s) => ({ showGroundContours: !s.showGroundContours })),
    toggleSurfaceContours: () => set((s) =>  ({ showSurfaceContours: !s.showSurfaceContours })),
    toggleVectors: () => set((s) => ({ showVectors: !s.showVectors })),
    setSurfacePathProgress: (progress) => set({surfacePathProgress: progress}),
    setInteractionMode: (mode) => set({interactionMode: mode}),
    setIsVRsession: (val) => set({ isVRsession: val}),
    toggleVRUI: () => set((s) => ({ vrUIVisible: !s.vrUIVisible })),
    setVRUIPanelPose: (position, rotation) => set(({vrUIPanelPosition: position, vrUIPanelRotation: rotation})),
    setVRLeftGripActive: (active) => set({vrLeftGripActive: active}),
    setVRRightGripActive: (active) => set({vrRightGripActive: active}),
    setVRUIVisible: (visible) => set({vrUIVisible: visible}),
    setWireframe: (val) => set({ wireframe: val}),

    reset: () => set({
        viewMode: '3d_explore',
        personPosition: [1.0, 1.0],
        showAscentPath: false,
        ascentProgress: 0,
        surfacePathProgress: 0,
        vrLeftGripActive: false, 
        vrRightGripActive: false,
        vrUIPanelPosition:[0, 1.2, -1.5],
        vrUIPanelRotation: [0,0,0],
    }),
}));

export default useStore;