import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { generateContours, autoContourLevels, f } from "../utils/math";

const DOMAIN = [-18,18];

const CONTOUR_COLORS = [
    '#1a5276', '#1f6f8b', '#2e86ab', '#58C4DD', '#7ec8e3', '#a8d8ea', '#dff9fb', '#f5f6fa',
];

const CONTOUR_COLORS_SURFACE = [
    '#1a7622', '#338b1f', '#5cab2e', '#92dd58', '#96e37e', '#c2eaa8', '#ebfbdf', '#f8faf5',
];


export default function ContourLines(){
    const contours = useMemo(() => {
        const levels = autoContourLevels(DOMAIN[0], DOMAIN[1], DOMAIN[0], DOMAIN[1]);
        return generateContours(levels, DOMAIN[0], DOMAIN[1], DOMAIN[0], DOMAIN[1], 120);
    }, []);

    return (
        <group>
            {contours.map((contour, ci) =>
                contour.segments.map((seg, si) => (
                    <group key={`${ci}-${si}`}>
                        <Line
                            key={`${ci}-${si}`}
                            points={[
                                [seg[0][0], 0.01, seg[0][1]],
                                [seg[1][0], 0.01, seg[1][1]],
                            ]}
                            color={CONTOUR_COLORS[ci % CONTOUR_COLORS.length]}
                            lineWidth={1.5}
                        />
                        {/*Surface coutour*/ }
                        <Line
                        points={[
                            [seg[0][0], f(seg[0][0], seg[0][1])+0.01, seg[0][1]],
                            [seg[1][0], f(seg[1][0], seg[1][1])+0.01, seg[1][1]],
                        ]}
                        color={CONTOUR_COLORS_SURFACE[ci%CONTOUR_COLORS_SURFACE.length]}
                        lineWidth={1.5}
                        />
                    </group>
                ))
            )}
        </group>
    );
}
