import { useState } from 'react';
import useStore from '../store/useStore';

export default function DragPlane(){
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const [dragging, setDragging] = useState(false);

    const handlePointerDown = (e) => {
        e.stopPropagation();
        setDragging(true);
        updatePosition(e);
    };

    const handlePointerMove = (e) =>{
        if (!dragging) return;
        e.stopPropagation();
        updatePosition(e);
    };

    const handlePointerUp = () =>{
        setDragging(false);
    };

    const updatePosition = (e) => {
        const point = e.point;
        const x = Math.max(domainMin, Math.min(domainMax, point.x));
        const z = Math.max(domainMin, Math.min(domainMax, point.z));
        setPersonPosition([x, z]);
    };

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, 0]}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            >
                <planeGeometry args={[domainMax - domainMin, domainMax - domainMin]} />
                <meshBasicMaterial visible={false} />
            </mesh>
    );
}