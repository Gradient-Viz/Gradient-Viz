import {Line } from '@react-three/drei';
import { gradient } from "../utils/math";
import  useStore  from '../store/useStore';

const SAMPLE_POINTS = [
    [1.5, 0], [0, 1.5], [-1.5, 0], [0,-1.5],
    [1,1], [-1,1], [-1,-1], [1, -1],
    [2, 0], [0, 2], [-2, 0], [0, -2],
];

const ARROW_COLOR = 'FFFF00'

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

    if (!showVectors) return null;
    
    return (
        <group>
            <GradientArrow x={personPosition[0]} y={personPosition[1]} color='#FFFF00'/>
            {SAMPLE_POINTS.map(([x,y], i) => (
                <GradientArrow key={i} x={x} y={y} />
            ))}
        </group>
    );
}