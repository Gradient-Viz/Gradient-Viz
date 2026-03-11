import { useRef, useState } from 'react';
import useStore from '../store/useStore';

export default function DragPlane(){
    const meshRef = useRef();

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
        e.stopPropagation();
        const x = Math.max(domainMin, Math.min(domainMax, e.point.x));
        const y = Math.max(domainMin, Math.min(domainMax, e.point.z));
        setPersonPosition([x,y]);
    }

    //Drag mode (trace ascent)
    const handlePointerDown = (e) => {
        if (interactionMode !== "drag") return;
        e.stopPropagation();
        setDragging(true);
        updatePosition(e);
    };

    const handlePointerMove = (e) => {
        if (!dragging || interactionMode !== "drag") return;
        e.stopPropagation();
        updatePosition(e);
    };

    const handlePointerUp = () => {
        setDragging(false);
    };

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