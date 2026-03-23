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
        cam.lookAt(0,0,1);
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

        if(markerRef.current){
            const normalizedX = (personPosition[0] - domainMin) / (domainMax - domainMin);
            const normalizedZ = (personPosition[1] - domainMin) / (domainMax - domainMin);
            markerRef.current.position.x = (normalizedX - 0.5) * 0.55;
            markerRef.current.position.y = (0.5 - normalizedZ ) * 0.55;
        }
    });

    if(!visible) return null;

    return (
        
    )
}