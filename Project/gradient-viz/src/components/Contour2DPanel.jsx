import { useRef, useEffect, useMemo } from "react";
import useStore from "../store/useStore";
import { generateContours, autoContourLevels, gradientAscentPath } from "../utils/math";

export default function Contour2DPanel() {
    const zoom = 2.5;
    const canvasRef = useRef();

    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const personPosition = useStore((s) => s.personPosition);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const functionVersion = useStore((s) => s.functionVersion);
    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);
    

    const size = 260;

    //Convert domain to screen
    const domainToScreen = (x, y) => {
        const center = (domainMin + domainMax) / 2;

        const scaledX = (x - center) * zoom + center;
        const scaledY = (y - center) * zoom + center;

        const nx = (scaledX - domainMin) / (domainMax - domainMin);
        const ny = (scaledY - domainMin) / (domainMax - domainMin);

        return [
            nx * size,
            (1 - ny) * size
        ];
    };

    //Convert screen to domain
    const screenToDomain = (x, y) => {
        const nx = x / size;
        const ny = y / size;

        const center = (domainMin + domainMax) / 2;

        const scaledX = domainMin + nx * (domainMax - domainMin);
        const scaledY = domainMax - ny * (domainMax - domainMin);

        const dx = (scaledX - center) / zoom + center;
        const dy = (scaledY - center) / zoom + center;

        return [dx, dy];
    };

    //Compute ascent path
    const path2D = useMemo(() => {
        return gradientAscentPath(personPosition[0], personPosition[1]);
    }, [personPosition]);

    //Draw contours
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, size, size);

        const levels = autoContourLevels(domainMin, domainMax, domainMin, domainMax);
        const contours = generateContours(levels, domainMin, domainMax, domainMin, domainMax, 100);

        const colors = ['#1f6f8b', '#58C4DD', '#a8d8ea', '#f5f6fa'];
        ctx.lineWidth = 1;

        contours.forEach((contour, i) => {
            ctx.strokeStyle = colors[i % colors.length];

            contour.segments.forEach((seg) => {
                const [x1, y1] = domainToScreen(seg[0][0], seg[0][1]);
                const [x2, y2] = domainToScreen(seg[1][0], seg[1][1]);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });
        });

        if (showAscentPath && path2D.length > 1) {
            const count = Math.max(2, Math.floor(path2D.length * ascentProgress));
            const visiblePath = path2D.slice(0, count);

            ctx.beginPath();

            visiblePath.forEach(([x, y], i) => {
                const [sx, sy] = domainToScreen(x, y);
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            });

            ctx.strokeStyle = "#ff6b6b"; // same as 3D
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        //Draw current position
        const [px, py] = domainToScreen(personPosition[0], personPosition[1]);

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#4a90d9";
        ctx.fill();

    }, [domainMin, domainMax, personPosition, functionVersion, showAscentPath, ascentProgress, path2D]);

    //Interaction
    const handlePointer = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const [dx, dy] = screenToDomain(x, y);
        const clamp = (e) => Math.max(domainMin, Math.min(domainMax, e));
        setPersonPosition([clamp(dx), clamp(dy)]);
    };

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            onPointerDown={handlePointer}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
            style={{
                width: "100%",
                marginTop: "10px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#0f172a",
                cursor: "crosshair"
            }}
        />
    );
}