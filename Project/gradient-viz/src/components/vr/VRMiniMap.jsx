import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useFBO, Text } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../../store/useStore";


export default function VRMiniMap(){
    const viewMode = useStore((s) => s.viewMode);
    const isVRsession = useStore((s) => s.isVRsession);
    const personPosition = useStore((s) => s.personPosition);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);

    const { scene } = useThree();

    const visible = isVRsession && viewMode === '2d_explore';

    // Overhead view
    const fbo = useFBO(512, 512, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
    });

    const orthroCamera = useMemo(() =>{
        const size = (domainMax - domainMin) / 2;
        const cam = new THREE.OrthographicCamera(-size, size, size, -size, 0.1, 50);
        cam.position.set(0, 15, 0);
        cam.lookAt(0,0,0);
        cam.up.set(0,0,-1);
        return cam;
    }, [domainMax, domainMin]);

    const minimapRef = useRef();
    const markerRef = useRef();

    useFrame(({ gl }) => {
        if(!visible) return;

        if(minimapRef.current){
            minimapRef.current.visible = false;
        }

        gl.setRenderTarget(fbo);
        gl.render(scene, orthroCamera);
        gl.setRenderTarget(null);

        if(minimapRef.current){
            minimapRef.current.visible =true;
        }
        
        if(markerRef.current){
            const normalizedX = (personPosition[0] - domainMin) / (domainMax - domainMin);
            const normalizedZ = (personPosition[1] - domainMin) / (domainMax - domainMin);
            markerRef.current.position.x = (normalizedX - 0.5) * 0.55;
            markerRef.current.position.y = (0.5 - normalizedZ ) * 0.55;
        }
    });

    if(!visible) return null;

    return (
        <group ref={minimapRef} position={[0.6, 1.4, -1.2]} rotation={[0, -0.3, 0]}>
            <Text position={[0, 0.35, 0]} fontSize={0.035} color="white">
                2D Overhead View
            </Text>

            <mesh position={[0,0, -0.005]}>
                <boxGeometry args={[0.62, 0.62, 0.01]} />
                <meshStandardMaterial color="#1a1a2e" />    
            </mesh>

            <mesh position={[0,0, 0.001]}>
                <planeGeometry args={[0.55, 0.55]} />
                <meshBasicMaterial map={fbo.texture} />    
            </mesh>

            <mesh ref={markerRef} position={[0, 0, 0.01]} >
                <circleGeometry args={[0.015, 16]} />
                <meshBasicMaterial color="#ff4444" />    
            </mesh>

            <Text position={[0, -0.35, 0]} fontSize={0.02} color="#888">
                Tracing Path ....
            </Text>
        </group>
    );
}