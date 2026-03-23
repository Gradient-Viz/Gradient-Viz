import { useState } from "react";
import { Text } from "@react-three/drei"

export default function VRButton({ position, label, onClick, disabled = false, width = 0.15}){
    const [hovered , setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const bgColor = disabled ? "#333"
        : pressed ? "#4a90d9"
        : hovered ? "#2d6aa3"
        : "#1e4976";
        
    return (
        <group position={position}>
            <mesh
                onPointerEnter={() => !disabled && setHovered(true)}
                onPointerLeave={() => {setHovered(false); setPressed(false); }}
                onPointerDown={() => !disabled && setPressed(true)}
                onPointerUp={() => {
                    if(!disabled && pressed) onClick?.();
                    setPressed(false);
                }}
            >
                <boxGeometry args={[width, 0.05, 0.02]} />
                <meshStandardMaterial color={bgColor} />
            </mesh>
            <Text
                position={[0,0,0.015]}
                fontSize={0.025}
                color={disabled ? "#666" : "#fff"}
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
        </group>
    );
}