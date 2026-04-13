import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PointerLockControls } from '@react-three/drei';
import gsap from 'gsap';
import useStore from '../store/useStore.js';
import { useFrame } from '@react-three/fiber';
import { f } from '../utils/math';
import * as THREE from 'three';

const CAMERA_HEIGHT = 0.5;

const CAMERA_POSITIONS = {
    '3d_explore': { pos: [5,4,5], target: [0,0,0]},
    '2d_explore': {pos: [0, 12, 0], target: [0, 0, 0]},
    '3d_compare': { pos: [4, 5, 4], target: [0, 0, 0] },
    'first_person': { pos: [0, CAMERA_HEIGHT, 0] },
};

export default function CameraController(){
    const isVRsession = useStore((s) => s.isVRsession);
    const viewMode = useStore((s) => s.viewMode);
    const personPosition = useStore((s) => s.personPosition);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const controlsRef = useRef();
    const pointerLockRef = useRef();
    const { camera } = useThree();
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const keys = useRef({});

    useEffect(() => {
         const config = CAMERA_POSITIONS[viewMode]; 
        if (!config || !controlsRef.current) return;

        if (viewMode === "first_person") {
            // Disable orbit controls
            if (controlsRef.current) controlsRef.current.enabled = false;

            // Use current pawn position instead of fixed 0,0,0
            const startX = personPosition[0];
            const startY = personPosition[1];
            const startHeight = f(startX, startY) + CAMERA_HEIGHT;

            camera.position.set(startX, startHeight, startY);

            return;
        }

        const handleKeyDown = (e) => {
            if (e.shiftKey) setIsShiftPressed(true);
        };

        const handleKeyUp = (e) => {
            if (!e.shiftKey) setIsShiftPressed(false);
        };


        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        if (controlsRef.current) {
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(controlsRef.current.target);
        }
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
      
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
      
    }, [viewMode, camera, personPosition]);


    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (viewMode !== 'first_person') return;

        const handleKeyDown = (e) => { keys.current[e.key] = true; };
        const handleKeyUp = (e) => { keys.current[e.key] = false; };
        
        const handleClick = () => {
            if (pointerLockRef.current) {
                pointerLockRef.current.lock();
            }
        };

        document.addEventListener('click', handleClick);
      
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [viewMode]);
  

    useFrame((state, delta) => {
        if (viewMode !== 'first_person') return;

        if (!pointerLockRef.current) return;

        const speed = 2 * delta;
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

        const pressed = keys.current;
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

    if (isVRsession) return null;
    
    if (typeof window === 'undefined') return;
    
    return viewMode === "first_person" ? (
      <PointerLockControls ref={pointerLockRef} />
    ) : (
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
