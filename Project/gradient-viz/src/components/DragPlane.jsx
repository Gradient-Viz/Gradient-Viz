import { useRef, useState } from 'react';
import useStore from '../store/useStore';
import { useXRInputSourceEvent } from '@react-three/xr'

export default function DragPlane(){
    const meshRef = useRef();

    const isVRsession = useStore((s) => s.isVRsession);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const interactionMode = useStore((s) => s.interactionMode);

    const [dragging, setDragging] = useState(false);

    const updatePosition = (e) => {
        const x = Math.max(domainMin, Math.min(domainMax, e.point.x));
        const z = Math.max(domainMin, Math.min(domainMax, e.point.z));
        setPersonPosition([x,z]);
    }
    
    //Click mode (3D)
    const handleClick = (e) =>{
        if (e.shiftKey) return;
        e.stopPropagation();
        updatePosition(e);
    }

    //Drag mode (trace ascent)
    const handlePointerDown = (e) => {
        if(isVRsession){
            setDragging(true);
            updatePosition(e);
        }else{
        //only work when SHIFT is held
            if (!e.shiftKey) return;
            setDragging(true);
            updatePosition(e);
        }
    };

    const handlePointerMove = (e) => {
        if (!dragging || !e.shiftKey) return;
        e.stopPropagation();
        updatePosition(e);
    };

    const handlePointerUp = () => {
        setDragging(false);
    };

    // Right Trigger (select) - place marker
    useXRInputSourceEvent('all', 'selectstart', (event) => {
        if (event.inputSource.handedness === 'right'){
          console.log('XR Event:', Object.keys(event));
          console.log('Event pro:', Object.keys(event)); 
        }
    }, []);

    // Right Controller (Right grip) - test
    useXRInputSourceEvent('all', 'squeezestart', (event) => {
        if (event.inputSource.handedness == 'right'){
            console.log('Squeeze Event:', event);
            console.log('Squueez pro:', Object.keys(event)); 
        }
    }, []);

    // useXRInputSourceEvent('all', 'selectstart', (event) => {
    //     if (event.inputSource.handedness == 'right'){
    //         setDragging(false);
    //     }
    // }, []);


    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, 0]}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            >
                <planeGeometry args={[domainMax - domainMin, domainMax - domainMin]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
    );
}