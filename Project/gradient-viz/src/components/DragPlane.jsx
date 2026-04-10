import { useRef, useState } from 'react';
import useStore from '../store/useStore';
import { forwardRef, useImperativeHandle } from 'react';

const DragPlane = forwardRef(function DragPlane(_props, ref){
    const meshRef = useRef();

    useImperativeHandle(ref, () => meshRef.current);

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
        if (isVRsession || interactionMode !== 'click') return;
        if (e.shiftKey) return;
        e.stopPropagation();
        updatePosition(e);
    }

    //Drag mode (trace ascent)
    const handlePointerDown = (e) => {
        if(isVRsession){
            setDragging(true);
            updatePosition(e);
        } else {
            // In non-VR drag mode, only track while SHIFT is pressed.
            if (interactionMode !== 'drag') return;
            if (!e.shiftKey) return;
            setDragging(true);
            updatePosition(e);
        }
    };

    const handlePointerMove = (e) => {
        if (!dragging) return;
        if (!isVRsession && (interactionMode !== 'drag' || !e.shiftKey)) return;

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
})

export default DragPlane;