import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { 
    autoContourLevelsForKey,
    evaluateFunction,
    generateContoursForKey,
    intersectionSegments,
} from "../utils/math";
import useStore from "../store/useStore";
//import { events } from "@react-three/fiber";

const CONTOUR_COLORS_A = [
    '#1a5276', '#1f6f8b', '#2e86ab', '#58C4DD', '#7ec8e3', '#a8d8ea', '#dff9fb', '#f5f6fa',
];

const CONTOUR_COLORS_B = [
    '#661466', '#7d1e7a', '#9836a1', '#b558bf', '#c778d4', '#e49ae7', '#f3c5f6', '#fceafe'
];

const CONTOUR_COLORS_SURFACE = [
    '#1a7622', '#338b1f', '#5cab2e', '#92dd58', '#96e37e', '#c2eaa8', '#ebfbdf', '#f8faf5',
];

function mapContours(rawContours, key){
    return rawContours.map((contour) => ({
        level: contour.level,
        segments: contour.segments.map((seg) => ({
            ground: [
                [seg[0][0], 0.01, seg[0][1]],
                [seg[1][0], 0.01, seg[1][1]],
            ],
            surface: [
                [seg[0][0], evaluateFunction(key, seg[0][0], seg[0][1]) + 0.02, seg[0][1]],
                [seg[1][0], evaluateFunction(key, seg[1][0], seg[1][1]) + 0.02, seg[1][1]],
            ],
        })),
    }));
}

export default function ContourLines(){
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const viewMode = useStore((s) => s.viewMode);
    const functionVersion = useStore((s) => s.functionVersion);

    const showGroundA = useStore((s) => s.showGroundContoursA);
    const showSurfaceA = useStore((s) => s.showSurfaceContoursA);
    const showGroundB = useStore((s) => s.showGroundContoursB);
    const showSurfaceB = useStore((s) => s.showSurfaceContoursB);
    const showIntersectionCurve = useStore((s) => s.showIntersectionCurve);

    const contoursA = useMemo(() => {
        const levels = autoContourLevelsForKey('A', domainMin, domainMax, domainMin, domainMax);
        const raw = generateContoursForKey('A', levels, domainMin, domainMax, domainMin, domainMax, 120);
        return mapContours(raw, 'A');
    }, [domainMin, domainMax, functionVersion]);

    const contoursB = useMemo(() => {    
        const levels = autoContourLevelsForKey('B', domainMin, domainMax, domainMin, domainMax);
        const raw = generateContoursForKey('B', levels, domainMin, domainMax, domainMin, domainMax, 120);        
        return mapContours(raw, 'B');
    }, [domainMin, domainMax, functionVersion]); 

    const intersection = useMemo(() => {
        return intersectionSegments('A', 'B', domainMin, domainMax, domainMin, domainMax, 140);
    }, [domainMin, domainMax, functionVersion]);

    return (
        <group>
            {contoursA.map((contour, ci) =>
                contour.segments.map((seg, si) => (
                    <group key={`${ci}-${si}`}>
                        {showGroundA && (
                            <Line
                                points={seg.ground}
                                color={CONTOUR_COLORS_A[ci % CONTOUR_COLORS_A.length]}
                                lineWidth={1.5}
                            />
                        )}
                        {/*Surface contour*/ }
                        {showSurfaceA && viewMode !== '2d_explore' && (
                            <Line
                                points={seg.surface}
                                color={CONTOUR_COLORS_A[ci%CONTOUR_COLORS_A.length]}
                                lineWidth={1.5}
                            />
                        )}
                    </group>
                ))
            )}
           
           {contoursB.map((contour, ci) =>
                contour.segments.map((seg, si) => (
                    <group key={`${ci}-${si}`}>
                        {showGroundB && (
                            <Line
                                points={seg.ground}
                                color={CONTOUR_COLORS_B[ci % CONTOUR_COLORS_B.length]}
                                lineWidth={1.5}
                            />
                        )}
                        {/*Surface contour*/ }
                        {showSurfaceB && viewMode !== '2d_explore' && (
                            <Line
                                points={seg.surface}
                                color={CONTOUR_COLORS_B[ci%CONTOUR_COLORS_B.length]}
                                lineWidth={1.5}
                            />
                        )}
                    </group>
                ))
            )} 

            {showIntersectionCurve && viewMode !== '2d_explore' && 
                intersection.map((seg, i) => {
                    const p1 = [seg[0][0], evaluateFunction('A', seg[0][0], seg[0][1]) + 0.04, seg[0][1]];
                    const p2 = [seg[1][0], evaluateFunction('A', seg[1][0], seg[1][1]) + 0.04, seg[1][1]];
                    return (
                        <Line
                            key={`intersection-${i}`}
                            points={[p1, p2]}
                            color="#ff4fa3"
                            lineWidth={2.2}
                        />
                    );
                })}
        </group>
    );
}
