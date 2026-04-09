import { useRef, useEffect, useState } from 'react';
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
    const isVRsession = useStore((s) => s.isVRsession);
    const viewMode = useStore((s) => s.viewMode);
    const controlsRef = useRef();
    const { camera } = useThree();
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
         const config = CAMERA_POSITIONS[viewMode]; 
         if (!config || !controlsRef.current) return;

        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(controlsRef.current.target);

        gsap.to(camera.position, {
            x: config.pos[0],
            y: config.pos[1],
            z: config.pos[2],
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
                camera.lookAt(config.target[0], config.target[1], config.target[2]);
                controlsRef.current?.update();
            },
            onComplete: () =>{
                // Re-enable controls
                if (controlsRef.current){
                    controlsRef.current.enabled = viewMode !== '2d_explore';
                }
            },
        });

        gsap.to(controlsRef.current.target,{
            x: config.target[0],
            y: config.target[1],
            z: config.target[2],
            duration: 1,
            ease: 'power2.inOut',
            onUpdate: () => controlsRef.current?.update(),
        });
    }, [viewMode, camera]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.shiftKey) setIsShiftPressed(true);
        };

        const handleKeyUp = (e) => {
            if (!e.shiftKey) setIsShiftPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
        }, []);


    if (isVRsession) return null;
    
    return (
        <OrbitControls
            ref={controlsRef}
            enabled={!isShiftPressed && viewMode !== '2d_explore'}
            enableDamping
            dampingFactor={0.08}
            enablePan={viewMode !== '2d_explore'}
            enableRotate={viewMode !== '2d_explore'}
            rotateSpeed={0.75}
            minDistance={2}
            maxDistance={24}
            maxPolarAngle={viewMode === '2d_explore' ? 0 : Math.PI}
        />
    );
}