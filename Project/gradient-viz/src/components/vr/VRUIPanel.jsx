import { Text } from "@react-three/drei";
import useStore from "../../store/useStore";
import VRButton from "./VRButton";
import { forwardRef } from "react";

const VRUIPanel = forwardRef(function VRUIPanel(_, ref){
    const isVRsession = useStore((s) => s.isVRsession);
    const vrUIVisible = useStore((s) => s.vrUIVisible);
    const showVectors = useStore((s) => s.showVectors);
    const toggleVectors = useStore((s) => s.toggleVectors);
    const showSurfaceContours = useStore((s) => s.showSurfaceContours);
    const showGroundContours = useStore((s) => s.showGroundContours);
    const toggleGroundContours = useStore((s) => s.toggleGroundContours);
    const toggleSurfaceContours = useStore((s) => s.toggleSurfaceContours);
    const setViewMode = useStore((s) => s.setViewMode);
    const viewMode = useStore((s) => s.viewMode);
    const vrUIPanelPosition = useStore((s) => s.vrUIPanelPosition);
    const vrUIPanelRotation = useStore((s) => s.vrUIPanelRotation);

    if (!isVRsession || !vrUIVisible) return null;

    return (
        <group ref={ref} position={vrUIPanelPosition} rotation={vrUIPanelRotation}>
            <mesh>
                <boxGeometry args={[0.6, 0.5, 0.01]}/>
                <meshStandardMaterial color="#1a1a2e" transparent opacity={0.9}/>
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

            <VRButton
                position={[-0.15, -0.14, 0.01]}
                label={viewMode === '3d_explore' ? '2D View' : '3D View'}
                onClick={() => setViewMode(viewMode === "3d_explore" ? "2d_explore" : "3d_explore")}
                width={0.25} 
            />
        </group>
    );
});

export default VRUIPanel;