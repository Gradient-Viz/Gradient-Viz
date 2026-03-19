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
    const viewMode = useStore((s) => s.viewMode);
    const controlsRef = useRef();
    const { camera } = useThree();
    const [isShiftPressed, setIsShiftPressed] = useState(false);

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

    return (
        <OrbitControls
            ref={controlsRef}
            enabled={!isShiftPressed && viewMode !== '2d_explore'}
            enableRotate={viewMode !== '2d_explore'}
            maxPolarAngle={viewMode === '2d_explore' ? 0 : Math.PI}
        />
    );
}