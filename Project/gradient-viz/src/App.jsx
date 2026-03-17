import {Canvas} from '@react-three/fiber';
import MountainSurface from './components/MountainSurface';
import ContourLines from "./components/ContourLines";
import GradientArrows from "./components/GradientArrows";
import AscentPaths from "./components/AscentPaths";
import PersonMarker from "./components/PersonMarker";
import CameraController from "./components/CameraController";
import UIOverlay from './components/UIOverlay';
import DragPlane from './components/DragPlane';
import { EffectComposer, Bloom } from '@react-three/postprocessing';


function App() {
  return (
      <div style={{width:'100vw', height:'100vh', background:'#000000'}}>
        <UIOverlay />
        <div style={{ position: 'absolute', left: '310px', top: 0, right: 0, bottom: 0}}>
          <Canvas camera={{position:[5,4,5], fov:50}}>
            <ambientLight intensity={0.4}/>
            <directionalLight position={[5,10,5]} intensity={1}/>
            <axesHelper args={[4]} />
            <MountainSurface/>
            <ContourLines/>
            <GradientArrows />
            <AscentPaths />
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
          </Canvas>
        </div>
      </div>
  );
}

export default App
