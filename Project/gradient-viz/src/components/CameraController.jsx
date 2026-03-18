import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import useStore from '../store/useStore';

const CAMERA_POSITIONS = {
    '3d_explore': { pos: [5,4,5], target: [0,0,0]},
    '2d_explore': {pos: [0, 12, 0], target: [0, 0, 0]},
    '3d_compare': {pos:[4,5,4], target: [0,0,0]},
};

export default function CameraController(){
    const viewMode = useStore((s) => s.viewMode);
    const controlsRef = useRef();
    const { camera } = useThree();

    useEffect(() => {
        const config = CAMERA_POSITIONS[viewMode];
        if(!config) return;

        // Disable controls
        if(controlsRef.current){
            controlsRef.current.enabled = false;
        }

        // Animate camera pos
        gsap.to(camera.position, {
            x: config.pos[0],
            y: config.pos[1],
            z: config.pos[2],
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
                camera.lookAt(config.target[0], config.target[1], config.target[2])
            },
            onComplete: () =>{
                // Re-enable controls
                if (controlsRef.current){
                    controlsRef.current.enabled = viewMode !== '2d_explore';
                }
            },
        });
    }, [viewMode, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            enableRotate={viewMode !== '2d_explore'}
            maxPolarAngle={viewMode === '2d_explore' ? 0 : Math.PI}
        />
    );
}