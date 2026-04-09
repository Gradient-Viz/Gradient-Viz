import { useRef, useEffect, useCallback, useState } from "react";
import useStore from "../store/useStore";
import { generateContours, autoContourLevels, gradientAscentPath } from "../utils/math";

export default function Contour2DPanel() {
    const zoom = 2.5;
    const canvasRef = useRef();
    const [isDragging, setIsDragging] = useState(false);

    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const personPosition = useStore((s) => s.personPosition);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const functionVersion = useStore((s) => s.functionVersion);
    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);
    

    const size = 260;

    //Convert domain to screen
    const domainToScreen = useCallback((x, y) => {
        const center = (domainMin + domainMax) / 2;

        const scaledX = (x - center) * zoom + center;
        const scaledY = (y - center) * zoom + center;

        const nx = (scaledX - domainMin) / (domainMax - domainMin);
        const ny = (scaledY - domainMin) / (domainMax - domainMin);

        return [
            nx * size,
            (1 - ny) * size
        ];
    }, [domainMin, domainMax, size, zoom]);

    //Convert screen to domain
    const screenToDomain = useCallback((x, y) => {
        const nx = x / size;
        const ny = y / size;

        const center = (domainMin + domainMax) / 2;

        const scaledX = domainMin + nx * (domainMax - domainMin);
        const scaledY = domainMax - ny * (domainMax - domainMin);

        const dx = (scaledX - center) / zoom + center;
        const dy = (scaledY - center) / zoom + center;

        return [dx, dy];
    }, [domainMin, domainMax, size, zoom]);

    //Draw contours
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const path2D = gradientAscentPath(personPosition[0], personPosition[1]);

        ctx.clearRect(0, 0, size, size);

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, size, size);

        const gridStep = size / 8;
        ctx.strokeStyle = "rgba(196, 214, 0, 0.16)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 8; i++) {
            const p = i * gridStep;
            ctx.beginPath();
            ctx.moveTo(0, p);
            ctx.lineTo(size, p);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(p, 0);
            ctx.lineTo(p, size);
            ctx.stroke();
        }

        const center = size / 2;
        ctx.strokeStyle = "rgba(196, 214, 0, 0.33)";
        ctx.beginPath();
        ctx.moveTo(center, 0);
        ctx.lineTo(center, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, center);
        ctx.lineTo(size, center);
        ctx.stroke();

        const levels = autoContourLevels(domainMin, domainMax, domainMin, domainMax);
        const contours = generateContours(levels, domainMin, domainMax, domainMin, domainMax, 100);

        const colors = ['#9cab00', '#b8c900', '#c4d600', '#d6e553'];
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
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            visiblePath.forEach(([x, y], i) => {
                const [sx, sy] = domainToScreen(x, y);
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            });

            ctx.strokeStyle = "#c4d600";
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(196, 214, 0, 0.55)";
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw current position marker with glow ring.
        const [px, py] = domainToScreen(personPosition[0], personPosition[1]);

        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196, 214, 0, 0.24)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#c4d600";
        ctx.fill();

    }, [domainMin, domainMax, personPosition, functionVersion, showAscentPath, ascentProgress, domainToScreen]);

    const clampDomain = useCallback(
        (value) => Math.max(domainMin, Math.min(domainMax, value)),
        [domainMin, domainMax]
    );

    const handlePointer = useCallback((e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const [dx, dy] = screenToDomain(x, y);
        setPersonPosition([clampDomain(dx), clampDomain(dy)]);
    }, [screenToDomain, setPersonPosition, clampDomain]);

    const handlePointerDown = (e) => {
        canvasRef.current?.setPointerCapture?.(e.pointerId);
        setIsDragging(true);
        handlePointer(e);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        handlePointer(e);
    };

    const handlePointerUp = (e) => {
        if (canvasRef.current?.hasPointerCapture?.(e.pointerId)) {
            canvasRef.current.releasePointerCapture(e.pointerId);
        }
        setIsDragging(false);
    };

    return (
        <canvas
            ref={canvasRef}
            className="contour-canvas"
            width={size}
            height={size}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        />
    );
}