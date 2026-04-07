import { Text } from "@react-three/drei";
import useStore from "../../store/useStore";
import VRButton from "./VRButton";
import { forwardRef } from "react";
import VRToggle from "./VRToggle";
import VRSlider from "./VRSlider";

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

    const personPosition = useStore((s) => s.personPosition);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);

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

            <VRToggle
                position={[0,0.23, 0.01]}
                label="Vectors"
                value={showVectors}
                onToggle={toggleVectors}
                width={0.50}
            />

            <VRToggle
                position={[0,0.14, 0.01]}
                label="Ground Contours"
                value={showGroundContours}
                onToggle={toggleGroundContours}
                width={0.50}
            /> 

            <VRToggle
                position={[0,0.05, 0.01]}
                label="Surface Contours"
                value={showSurfaceContours}
                onToggle={toggleSurfaceContours}
                width={0.50}
            /> 

            <VRSlider
                position={[0,-0.20, 0.01]}
                label="X Position"
                min={domainMin}
                max={domainMax}
                step={0.1}
                value={personPosition[0]}
                onChange={(x) => setPersonPosition([x, personPosition[1]])}
                width={0.42}
            />                
            <VRSlider
                position={[0,-0.30, 0.01]}
                label="Y Position"
                min={domainMin}
                max={domainMax}
                step={0.1}
                value={personPosition[1]}
                onChange={(y) => setPersonPosition([personPosition[0], y])}
                width={0.42}
            />  

            <VRButton
                position={[0,-0.31, 0.01]}
                label={viewMode === "3d_explore" ? "Switch to 2D view" : "Switch to 3D view"}
                onClick={() => 
                    setViewMode(viewMode === "3d_explore" ? "2d_explore" : "3d_explore")
                }
                width={0.50}
            />
        </group>
    );
});

export default VRUIPanel;