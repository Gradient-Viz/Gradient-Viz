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

    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);
    const setAscentProgress = useStore((s) => s.setAscentProgress);
    const setShowAscentPath = useStore((s) => s.setShowAscentPath);
    const reset = useStore((s) => s.reset);


    if (!isVRsession || !vrUIVisible) return null;

    const canSwitchTo2D = viewMode === "3d_explore";
    const canTraceAscent = viewMode === "2d_explore" && !showAscentPath;
    const canReturnTo3D = 
        viewMode === "2d_explore" && showAscentPath && ascentProgress >= 1;
    const canReset = viewMode === "3d_compare";

    const handleSwitchTo2D = () => setViewMode("2d_explore");
    const handleTraceAscent = () => {
        setAscentProgress(0);
        setShowAscentPath(true);
    }
    const handleReturnTo3D = () => setViewMode("3d_compare");
    const handleReset = () => reset();


    return (
        <group ref={ref} position={vrUIPanelPosition} rotation={vrUIPanelRotation}>
            <mesh>
                <boxGeometry args={[0.76, 1.16, 0.01]}/>
                <meshStandardMaterial color="#1a1a2e" transparent opacity={0.9}/>
            </mesh>

            <Text position={[0, 0.5, 0.01]} fontSize={0.04} color="white">
                Controls
            </Text>

            <VRToggle
                position={[0,0.38, 0.01]}
                label="Vectors"
                value={showVectors}
                onToggle={toggleVectors}
                width={0.50}
            />

            <VRToggle
                position={[0,0.29, 0.01]}
                label="Ground Contours"
                value={showGroundContours}
                onToggle={toggleGroundContours}
                width={0.50}
            /> 

            <VRToggle
                position={[0,0.20, 0.01]}
                label="Surface Contours"
                value={showSurfaceContours}
                onToggle={toggleSurfaceContours}
                width={0.50}
            /> 

            <VRSlider
                position={[0,0.08, 0.01]}
                label="X Position"
                min={domainMin}
                max={domainMax}
                step={0.1}
                value={personPosition[0]}
                onChange={(x) => setPersonPosition([x, personPosition[1]])}
                width={0.42}
            />                
            <VRSlider
                position={[0,-0.02, 0.01]}
                label="Y Position"
                min={domainMin}
                max={domainMax}
                step={0.1}
                value={personPosition[1]}
                onChange={(y) => setPersonPosition([personPosition[0], y])}
                width={0.42}
            />  

            <VRButton
                position={[0,-0.15, 0.01]}
                label = "Switch to 2D View"
                onClick={handleSwitchTo2D}
                disabled={!canSwitchTo2D}
                width={0.56}
            />

            <VRButton
                position={[0,-0.23, 0.01]}
                label = "Trace Ascent"
                onClick={handleTraceAscent}
                disabled={!canTraceAscent}
                width={0.56}
            />
            <VRButton
                position={[0,-0.31, 0.01]}
                label = "Return to 3D compare"
                onClick={handleReturnTo3D}
                disabled={!canReturnTo3D}
                width={0.56}
            />

            <VRButton
                position={[0,-0.39, 0.01]}
                label = "Reset"
                onClick={handleReset}
                disabled={!canReset}
                width={0.56}
            />

            {showAscentPath && viewMode === "2d_explore" && ascentProgress < 1 && (
                <Text position={[0,-0.50, 0.01]} fontSize={0.022} color="#c7d2fe">
                    Tracing Ascent.... {Math.round(ascentProgress * 100)}%
                </Text>
            )}
        </group>
    );
});

export default VRUIPanel;