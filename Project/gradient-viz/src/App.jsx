import {Canvas} from '@react-three/fiber';
import MountainSurface from './components/MountainSurface';
import ContourLines from "./components/ContourLines";
import GradientArrows from "./components/GradientArrows";
import AscentPaths from "./components/AscentPaths";
import PersonMarker from "./components/PersonMarker";
import CameraController from "./components/CameraController";
import UIOverlay from './components/UIOverlay';
import VRsessionManager from './components/vr/VRSessionManager';
import DragPlane from './components/DragPlane';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import {XR, createXRStore } from '@react-three/xr';
import useStore from './store/useStore';
import VRUIPanel from './components/vr/VRUIPanel';
import VRMiniMap from './components/vr/VRMiniMap';

const xrStore = createXRStore();

function App() {

  const isVRsession = useStore((s) => s.isVRsession);

  return (
      <div style={{width:'100vw', height:'100vh', background:'#000000'}}>
        {!isVRsession && <UIOverlay />}
        <VRsessionManager xrStore={xrStore} />
        <div style={{ position: 'absolute', left: isVRsession ? 0 : '310px', top: 0, right: 0, bottom: 0}}>
          <Canvas camera={{position:[5,4,5], fov:50}}>
            <XR store={xrStore}>
              <ambientLight intensity={0.4}/>
              <directionalLight position={[5,10,5]} intensity={1}/>
              <axesHelper args={[4]} />
              <MountainSurface/>
              <ContourLines/>
              <GradientArrows />
              <AscentPaths />
              <VRUIPanel />
              <VRMiniMap />
              <PersonMarker />
              <CameraController />
              <DragPlane />
              <EffectComposer>
                <Bloom
                  intensity={1.5}
                  luminanceThreshold={0.1}
                  luminanceSmoothing={0.9}
                  mipmapBlur
                />
              </EffectComposer>   
            </XR>
          </Canvas>
        </div>
      </div>
  );
}

export { xrStore };
export default App;