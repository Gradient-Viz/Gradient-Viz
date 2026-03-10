import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { generateContours, autoContourLevels, f } from "../utils/math";
import useStore from "../store/useStore";

const CONTOUR_COLORS = [
    '#1a5276', '#1f6f8b', '#2e86ab', '#58C4DD', '#7ec8e3', '#a8d8ea', '#dff9fb', '#f5f6fa',
];

const CONTOUR_COLORS_SURFACE = [
    '#1a7622', '#338b1f', '#5cab2e', '#92dd58', '#96e37e', '#c2eaa8', '#ebfbdf', '#f8faf5',
];


export default function ContourLines(){
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const viewMode = useStore((s) => s.viewMode);
    const functionVersion = useStore((s) => s.functionVersion);
    const showGround = useStore((s) => s.showGroundContours);
    const showSurface = useStore((s) => s.showSurfaceContours);
    const contours = useMemo(() => {
        const levels = autoContourLevels(domainMin, domainMax, domainMin, domainMax);
        const raw = generateContours(levels, domainMin, domainMax, domainMin, domainMax, 120);
        return raw.map((contour) => ({
            level: contour.level,
            segments: contour.segments.map((seg) => ({
                ground: [
                    [seg[0][0], 0.01, seg[0][1]],
                    [seg[1][0], 0.01, seg[1][1]],
                ],
                surface: [
                    [seg[0][0], f(seg[0][0], seg[0][1]) + 0.01, seg[0][1]],
                    [seg[1][0], f(seg[1][0], seg[1][1]) + 0.01, seg[1][1]],
                ],
            })),
        }));
    }, [domainMin, domainMax, functionVersion]);

    return (
        <group>
            {contours.map((contour, ci) =>
                contour.segments.map((seg, si) => (
                    <group key={`${ci}-${si}`}>
                        {showGround && (
                            <Line
                                key={`${ci}-${si}`}
                                points={seg.ground}
                                color={CONTOUR_COLORS[ci % CONTOUR_COLORS.length]}
                                lineWidth={1.5}
                            />
                        )}
                        {/*Surface contour*/ }
                        {showSurface && viewMode !== '2d_explore' && (
                            <Line
                                points={seg.surface}
                                color={CONTOUR_COLORS_SURFACE[ci%CONTOUR_COLORS_SURFACE.length]}
                                lineWidth={1.5}
                            />
                        )}
                    </group>
                ))
            )}
        </group>
    );
}
