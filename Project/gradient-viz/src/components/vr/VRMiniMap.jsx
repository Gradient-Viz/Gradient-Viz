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
    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);

    const { scene } = useThree();

    const visible = isVRsession && viewMode === '2d_explore';

    // Overhead view
    const fbo = useFBO(512, 512, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
    });

    const statusText = !showAscentPath
        ? "Ready to trace ascent"
        : ascentProgress < 1
        ? "Tracing ascent... " + (Math.round(ascentProgress * 100)) + "%"
        : "Trace complete. Return to 3D to compare.";

    const markerColor = !showAscentPath
        ? "#ff4444"
        : ascentProgress < 1
        ? "#ffaa00"
        : "#44ff88";
        
    const orthoCamera = useMemo(() =>{
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
        gl.render(scene, orthoCamera);
        gl.setRenderTarget(null);

        if(minimapRef.current){
            minimapRef.current.visible =true;
        }
        
        if(markerRef.current){
            const range = domainMax - domainMin || 1;
            const normalizedX = (personPosition[0] - domainMin) / (range);
            const normalizedZ = (personPosition[1] - domainMin) / (range);
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
                <meshBasicMaterial color={markerColor} />    
            </mesh>

            <Text position={[0, -0.35, 0]} fontSize={0.02} color="#888">
                {statusText}
            </Text>
        </group>
    );
}