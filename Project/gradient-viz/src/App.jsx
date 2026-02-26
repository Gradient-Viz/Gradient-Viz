import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import MountainSurface from './components/MountainSurface';
import ContourLines from "./components/ContourLines";

function App() {
  return (
      <div style={{width:'100vw', height:'100vh', background:'#000000'}}>
        <Canvas camera={{position:[5,4,5], fov:50}}>
          <ambientLight intensity={0.4}/>
          <directionalLight position={[5,10,5]}intensity={1}/>
          <axesHelper args={[4]} />
          <MountainSurface/>
          <ContourLines/>
          <OrbitControls/>
        </Canvas>
      </div>
  );
}

export default App
