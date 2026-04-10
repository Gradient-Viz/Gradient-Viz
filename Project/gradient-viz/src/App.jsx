import { Canvas } from '@react-three/fiber';
import MountainSurface from './components/MountainSurface';
import ContourLines from './components/ContourLines';
import GradientArrows from './components/GradientArrows';
import AscentPaths from './components/AscentPaths';
import PersonMarker from './components/PersonMarker';
import CameraController from './components/CameraController';
import UIOverlay from './components/UIOverlay';
import VRSessionManager from './components/vr/VRSessionManager';
import DragPlane from './components/DragPlane';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { XR, createXRStore } from '@react-three/xr';
import useStore from './store/useStore';
import VRUIPanel from './components/vr/VRUIPanel';
import VRMiniMap from './components/vr/VRMiniMap';
import { useRef } from 'react';
import VRControllerInteraction from './components/vr/VRControllerInteraction';
import './App.css';

const xrStore = createXRStore({
  offerSession: false,
  enterGrantedSession: false,
  emulate: false,
});

function App() {
  const isVRsession = useStore((s) => s.isVRsession);
  const dragPlaneRef = useRef(null);
  const vrPanelRef = useRef(null);

  return (
    <div className={`app-shell ${isVRsession ? 'is-vr' : 'has-sidebar'}`}>
      {!isVRsession && <UIOverlay />}
      <VRSessionManager xrStore={xrStore} />

      <div className="canvas-shell">
        <Canvas 
          camera={{ position: [5, 4, 5], fov: 50 }} 
          dpr={[1, 2]}
          gl={{antialias: true, alpha: false, preserveDrawingBuffer: true }}
          onCreated={ ({ gl }) => {
            gl.setClearColor('#05070d', 1);
          }} 
        >
          <XR store={xrStore}>
            <color attach="background" args={['#05070d']} />
            <fog attach="fog" args={['#05070d', 8, 28]} />

            <hemisphereLight color="#b9f3ff" groundColor="#03060d" intensity={0.5} />
            <directionalLight position={[6, 10, 5]} intensity={1.05} />
            <ambientLight intensity={0.32} />

            <MountainSurface />
            <ContourLines />
            <GradientArrows />
            <AscentPaths />
            <VRUIPanel ref={vrPanelRef} />
            <VRMiniMap />
            <PersonMarker />
            <CameraController />
            <DragPlane ref={dragPlaneRef} />
            <VRControllerInteraction dragPlaneRef={dragPlaneRef} panelRef={vrPanelRef} />(
              <EffectComposer>
                <Bloom
                  intensity={0.9}
                  luminanceThreshold={0.2}
                  luminanceSmoothing={0.45}
                  mipmapBlur
                />
              </EffectComposer>
          </XR>
        </Canvas>
      </div>
    </div>
  );
}

export default App;