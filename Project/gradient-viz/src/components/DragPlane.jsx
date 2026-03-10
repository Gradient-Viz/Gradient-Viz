import { useRef } from 'react';
import useStore from '../store/useStore';

export default function DragPlane(){
    const meshRef = useRef();
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    
    const handleClick = (e) =>{
        e.stopPropagation();
        const x = Math.max(domainMin, Math.min(domainMax, e.point.x));
        const y = Math.max(domainMin, Math.min(domainMax, e.point.z));
        setPersonPosition([x,y]);
    }

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, 0]}
            onClick={handleClick}
            >
                <planeGeometry args={[domainMax - domainMin, domainMax - domainMin]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
    );
}