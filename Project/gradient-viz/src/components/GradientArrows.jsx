import {Line } from '@react-three/drei';
import { gradient } from "../utils/math";
import  useStore  from '../store/useStore';
import { useMemo } from 'react';

function GradientArrow( {x,y, color = '#FFFF00'}){
    const [gx, gy] = gradient(x,y);
    const mag = Math.sqrt(gx * gx + gy * gy);
    if (mag < 0.01) return null;

    const scale = 0.3;
    const dx = (gx / mag) * scale;
    const dy = (gy / mag) * scale;

    const start = [x, 0.02, y];
    const end = [x + dx, 0.02, y + dy];
    const angle = Math.atan2(dy, dx);

    return (
        <group>
            <Line points={[start, end]} color={color} lineWidth={2.5} />
            <mesh position={[end[0], 0.02, end[2]]} rotation={[0, -angle, Math.PI/2]}>
                <coneGeometry args={[0.04, 0.1, 8]} />
                <meshBasicMaterial color={color}/>
            </mesh>
        </group>
    )
}

export default function GradientArrows(){
    const personPosition = useStore((s) => s.personPosition);
    const showVectors = useStore((s) => s.showVectors);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);

    const samplePoints = useMemo(() => {
        const points = [];
        const step = 1.5; // one arrow per unit
        for(let x = domainMin; x <= domainMax; x+= step){
            for(let y = domainMin; y <= domainMax; y += step){
                points.push([x,y]);
            }
        }
        return points;
    }, [domainMin, domainMax]);

    if (!showVectors) return null;

    return (
        <group>
            <GradientArrow x={personPosition[0]} y={personPosition[1]} color='#FFFF00'/>
            {samplePoints.map(([x,y], i) => (
                <GradientArrow key={i} x={x} y={y} />
            ))}
        </group>
    );
}