import { Text } from "@react-three/drei";
import useStore from "../../store/useStore";
import VRButton from "./VRButton";

export default function VRUIPanel(){
    const isVRsession = useStore((s) => s.isVRsession);
    const vrUIVisible = useStore((s) => s.vrUIVisible);
    const showVectors = useStore((s) => s.showVectors);
    const toggleVectors = useStore((s) => s.toggleVectors);
    const showSurfaceContours = useStore((s) => s.showSurfaceContours);
    const showGroundContours = useStore((s) => s.showGroundContours);
    const toggleGroundContours = useStore((s) => s.toggleGroundContours);
    const toggleSurfaceContours = useStore((s) => s.toggleSurfaceContours);


    if (!isVRsession || !vrUIVisible) return null;

    return (
        <group position={[0, 1.2, -1.5]}>
            <mesh>
                <boxGeometry args={[0.6, 0.5, 0.01]}/>
                <meshStandardMaterial color="1a1a2e" transparent opacity={0.9}/>
            </mesh>

            <Text position={[0, 0.2, 0.01]} fontSize={0.04} color="white">
                Gradient Viz Controls
            </Text>

            <VRButton
                position={[-0.15, 0.1, 0.01]}
                label={showVectors ? "Vectors: ON" : "Vectors: OFF"}
                onClick={toggleVectors}
                width={0.25}
            />

            <VRButton
                position={[-0.15, 0.02, 0.01]}
                label={showGroundContours ? "Ground: ON" : "Ground: OFF"}
                onClick={toggleGroundContours}
                width={0.25}
            />

            <VRButton
                position={[-0.15, -0.06, 0.01]}
                label={showSurfaceContours ? "Surface: ON" : "Surface: OFF"}
                onClick={toggleSurfaceContours}
                width={0.25}
            /> 
        </group>
    )
}