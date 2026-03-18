import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PointerLockControls } from '@react-three/drei';
import gsap from 'gsap';
import useStore from '../store/useStore';
import { useFrame } from '@react-three/fiber';
import { f } from '../utils/math';
import * as THREE from 'three';


window.keysPressed = {};
const CAMERA_HEIGHT = 0.5;

const CAMERA_POSITIONS = {
    '3d_explore': { pos: [5,4,5], target: [0,0,0]},
    '2d_explore': {pos: [0, 12, 0], target: [0, 0, 0]},
    '3d_compare': { pos: [4, 5, 4], target: [0, 0, 0] },
    'first_person': { pos: [0, CAMERA_HEIGHT, 0] },
};

export default function CameraController(){
    const viewMode = useStore((s) => s.viewMode);
    const personPosition = useStore((s) => s.personPosition);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const controlsRef = useRef();
    const pointerRef = useRef();
    const { camera } = useThree();
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.shiftKey) setIsShiftPressed(true);
        };

        const handleKeyUp = (e) => {
            if (!e.shiftKey) setIsShiftPressed(false);
        };

        if (viewMode === "first_person") {
            // Disable orbit controls
            if (controlsRef.current) controlsRef.current.enabled = false;

            // Use current pawn position instead of fixed 0,0,0
            const startX = personPosition[0];
            const startY = personPosition[1];
            const startHeight = f(startX, startY) + CAMERA_HEIGHT;

            camera.position.set(startX, startHeight, startY);

            // Look forward in the same direction the camera was already facing
            const lookAtTarget = new THREE.Vector3();
            camera.getWorldDirection(lookAtTarget);
            lookAtTarget.add(camera.position);
            camera.lookAt(lookAtTarget);

            return;
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
    }, [viewMode, camera, personPosition]);

    useEffect(() => {
        if (viewMode !== 'first_person') return;

        const handleKeyDown = (e) => { window.keysPressed[e.key] = true; };
        const handleKeyUp = (e) => { window.keysPressed[e.key] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [viewMode]);

    useFrame(() => {
        if (viewMode !== 'first_person') return;

        const speed = 0.01;
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0); // world up

        // Get camera forward and right directions
        camera.getWorldDirection(direction);
        direction.y = 0; // flatten forward to horizontal plane
        direction.normalize();

        right.crossVectors(direction, up).normalize(); // perpendicular right vector

        let moveX = 0;
        let moveZ = 0;

        const pressed = window.keysPressed;
        if (pressed['ArrowUp'] || pressed['w']) {
            moveX += direction.x * speed;
            moveZ += direction.z * speed;
        }
        if (pressed['ArrowDown'] || pressed['s']) {
            moveX -= direction.x * speed;
            moveZ -= direction.z * speed;
        }
        if (pressed['ArrowLeft'] || pressed['a']) {
            moveX -= right.x * speed;
            moveZ -= right.z * speed;
        }
        if (pressed['ArrowRight'] || pressed['d']) {
            moveX += right.x * speed;
            moveZ += right.z * speed;
        }

        if (!camera) return;

        const newX = camera.position.x + moveX;
        const newZ = camera.position.z + moveZ;
        const newY = f(newX, newZ) + CAMERA_HEIGHT;

        camera.position.set(newX, newY, newZ);

        setPersonPosition([camera.position.x, camera.position.z]);
    });

    return viewMode === "first_person" ? (
        <PointerLockControls ref={pointerRef} />
    ) : (
        <OrbitControls
            ref={controlsRef}
            enabled={!isShiftPressed && viewMode !== '2d_explore'}
            enableRotate={viewMode !== '2d_explore'}
            maxPolarAngle={viewMode === '2d_explore' ? 0 : Math.PI}
        />
    );
}