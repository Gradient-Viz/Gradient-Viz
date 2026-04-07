import { useState } from "react";
import { Text } from "@react-three/drei";
import { flattenJSON } from "three/src/animation/AnimationUtils.js";

export default function VRToggle({
    position = [0,0,0],
    label = "Toggle",
    value = false,
    onToggle,
    disabled = false,
    width = 0.32,
}) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const trackWidth = 0.14;
    const trackHeight = 0.045;
    const trackDepth = 0.018;
    const knobRadius = 0.015;
    const knobInset = 0.01;

    const toggleCenterX = width / 2 - trackWidth / 2;
    const knobXLocal = value
        ? trackWidth / 2 - knobInset - knobRadius
        : -trackWidth / 2 + knobInset + knobRadius;
    const knobX =  toggleCenterX + knobXLocal;

    const onColor = hovered ? "#33c76d" : "#27ad5d";
    const offColor = hovered ? "#c24e4e" : "#9d4040";

    const trackColor = disabled
        ? "#333333"
        : pressed
        ? "#2d6aa3"
        : value
        ? onColor
        : offColor;

    const labelColor = disabled ? "#666666" : "#ffffff";

    const handlePointerUp = () => {
        if (!disabled && pressed){
            onToggle?.(!value);
        }
        setPressed(false);
    };

    return (
        <group position={position}>
            <Text 
                position={[-width / 2, 0, 0.012]}
                fontSize={0.023}
                color={labelColor}
                anchorX={left}
                anchorY={middle}
            >
                {label}
            </Text>

            <mesh
                position={[toggleCenterX, 0,0]}
                onPointerEnter={() => !disabled && setHovered(true)}
                onPointerLeave={() => {
                    setHovered(false);
                    setHovered(false);
                }}
                onPointerDown={() => !disabled && setPressed(true)}
                onPointerUp={handlePointerUp}
            >
                <boxGeometry args={[trackWidth, trackHeight, trackDepth]} />
                <meshStandardMaterial color={trackColor} />
            </mesh>
            
            <mesh position={[knobX, 0, 0.012]}>
                <sphereGeometry args={ [knobRadius, 20, 20]} />
                <meshStandardMaterial color={disabled ? "#aaaaaa" : "#f6f6f6"} />
            </mesh>
        </group>
    );
}