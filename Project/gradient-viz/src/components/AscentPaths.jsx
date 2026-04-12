import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import useStore from '../store/useStore';
import { gradientAscentPath, path2DtoFlat, path2Dto3D } from '../utils/math';
import { Vector3, Quaternion } from 'three';

export default function AscentPaths(){
    const personPosition = useStore((s) => s.personPosition);
    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);
    const setAscentProgress = useStore((s) => s.setAscentProgress);
    const surfacePathProgress = useStore((s) => s.surfacePathProgress);
    const setSurfacePathProgress = useStore((s) => s.setSurfacePathProgress);
    const viewMode = useStore((s) => s.viewMode);

    // Compute the path once when person positon changes
    const path2D = useMemo(() => {
        return gradientAscentPath(personPosition[0], personPosition[1]);
    }, [personPosition]);

    const flatPath = useMemo(() => path2DtoFlat(path2D), [path2D]);
    const surfacePath = useMemo(() => path2Dto3D(path2D), [path2D]);

    // Animate:= increment progress each frame when path is shown
    useFrame((_, delta) => {
        if (showAscentPath && ascentProgress < 1){
            setAscentProgress(Math.min(1, ascentProgress + delta * 0.5));
        }
        // Animate 3D surface path in 3d_compare mode
        if (viewMode === '3d_compare' && surfacePathProgress < 1){
            setSurfacePathProgress(Math.min(1, surfacePathProgress + delta * 0.5 ));
        }
    });

    // how many points to draw based on progress
    const flatCount = Math.max(2, Math.floor(flatPath.length * ascentProgress));
    const visibleFlat = flatPath.slice(0, flatCount);

    const surfaceCount = Math.max(2, Math.floor(surfacePath.length * surfacePathProgress))
    const visibleSurface = surfacePath.slice(0, surfaceCount);

    const arrow = useMemo(() => {
    if (surfacePath.length < 2) return null;

    const p1 = surfacePath[0];
    const p2 = surfacePath[1];
    const start = new Vector3(...p1);
    const end = new Vector3(...p2);
    const direction = new Vector3().subVectors(end, start).normalize();
    const length = 0.3;
    const arrowEnd = start.clone().add(direction.multiplyScalar(length));
    const quaternion = new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction
    );

    return {
        start: start.toArray(),
        end: arrowEnd.toArray(),
        quaternion
    };
}, [surfacePath]);

    if(!showAscentPath) return null;

    return(
        <group>
            {/* 2D path: always visible once tracing starts*/}
            <Line points={visibleFlat} color="#FF9F38" lineWidth={3} />

            {/* 3D path: when comparing */}
            {viewMode === '3d_compare' && surfacePathProgress > 0 && (
                <>
                    <Line points={visibleSurface} color="#B83325" lineWidth={3} />

                    {arrow && (
                        <group>
                            <Line
                                points={[arrow.start, arrow.end]}
                                color="#ffe66a"
                                lineWidth={3} />
                            <mesh position={arrow.end} quaternion={arrow.quaternion}>
                                <coneGeometry args={[0.04, 0.10, 8]} />
                                <meshBasicMaterial color="#ffe66a" />
                            </mesh>
                        </group>
                    )}
                    {/*Vertical connector lines every 10 points */}
                    {visibleFlat.filter((_, i) => i % 10 === 0).map((pt, i) => {
                        const surfaceIdx = i * 10;
                        if(surfaceIdx >= surfaceCount) return null;
                        return (
                            <Line
                                key={i}
                                points={[pt, surfacePath[surfaceIdx]]}
                                color='#ffffff'
                                lineWidth={0.5}
                                transparent
                                opacity={0.3}
                            />
                        );
                    })}
                </>
            )} 
        </group>
    )
}
