import { useMemo, useState } from "react";
import { Text } from "@react-three/drei";

function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
}

function snap(value, step){
    if(!step || step <= 0) return value;
    return Math.round(value / step) * step;
}

export default function VRSlider({
    position = [0,0,0],
    label = "Slider",
    min = -6,
    max = 6,
    step = 0.1,
    value = 0,
    onChange, 
    disabled = false,
    width = 0.38,
}) {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false);

    const trackWidth = 0.18;
    const trackHeight = 0.014;
    const trackDepth = 0.012;
    const knobRadius = 0.018;

    const safeValue = clamp(value, min, max);
    const range = max - min || 1;
    const t = (safeValue - min) / range;

    const sliderCenterX = width / 2 - trackWidth / 2;
    const knobMinX = -trackWidth / 2;
    const knobMaxX = trackWidth /2;
    const knobX = sliderCenterX + knobMinX + t * (knobMaxX - knobMinX);

    const trackColor = disabled
        ? "#2d2d2d"
        : pressed
        ? "#2d6aa3"
        : hovered
        ? "#3c7bb7"
        : "#1e4976"

    const labelColor = disabled ? "#666666" : "#ffffff";

    const displayValue = useMemo(() => safeValue.toFixed(2), [safeValue]);

    const setFromPointX = (worldX) => {
        if(disabled) return;
        const localX = worldX - sliderCenterX;
        const localClamped = clamp(localX, knobMinX, knobMaxX);
        const localT = (localClamped - knobMinX) / (knobMaxX - knobMinX);
        const raw = min + localT * range;
        const snapped = clamp(snap(raw, step), min, max);

        onChange?.(snapped);
    };

    const handlePointerDown = (e) => {
        if (disabled) return;
        e.stopPropagation();
        setPressed(true);
        e.target.setPointerCapture?.(e.pointerId);
        setFromPointX(e.point.x - position[0]);
    };

    const handlePointerUp = (e) => {
        e.stopPropagation();
        setPressed(false);
        e.target.releasePointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e) =>{
        if(!pressed || disabled) return;
        e.stopPropagation();
        setFromPointX(e.point.x - position[0]);
    };

    return (
        <group position={position}>
            <Text
                position={[-width/2, 0.03, 0.012]}
                fontSize={0.022}
                color={labelColor}
                anchorX="left"
                anchorY="middle"
                >   
                {label} 
            </Text>

            <Text
                position={[width / 2, 0.03, 0.012]}
                fontSize={0.02}
                color={labelColor}
                anchorX="right"
                anchorY="middle"
            >
                {displayValue}
            </Text>

            <mesh
                position={[sliderCenterX, 0, 0]}
                onPointerEnter={() => !disabled && setHovered(true)}
                onPointerLeave={() => {
                    setHovered(false);
                    setPressed(false);
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerMissed={handlePointerUp}
            >
                <boxGeometry args={[trackWidth, trackHeight, trackDepth]}/>
                <meshStandardMaterial color={trackColor}/>
            </mesh>

            <mesh position={[knobX, 0, 0.012]}>
                <sphereGeometry args={[knobRadius, 20, 20]}/>
                <meshStandardMaterial color={disabled ? "#9a9a9a" : "#f6f6f6"}/>
            </mesh>
        </group>
    );
}