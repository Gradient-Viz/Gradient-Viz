import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import useStore from '../store/useStore';
import { gradientAscentPath, path2DtoFlat, path2Dto3D } from '../utils/math';

export default function AscentPaths(){
    const personPosition = useStore((s) => s.personPosition);
    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);
    const setAscentProgress = useStore((s) => s.setAscentProgress);
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
    });

    if(!showAscentPath) return null;

    // how many points to draw based on progress
    const count = Math.max(2, Math.floor(flatPath.length * ascentProgress));
    const visibleFlat = flatPath.slice(0, count);
    const visibleSurface = surfacePath.slice(0, count);

    return(
        <group>
            {/* 2D path: always visible */}
            <Line points={visibleFlat} color="#FF6B6B" lineWidth={3} />

            {/* 3D path: when comparing */}
            {viewMode === '3d_compare' && (
                <>
                    <Line points={visibleSurface} color="#58C4DD" lineWidth={3} />

                    {/*Vertical connector lines every 10 points */}
                    {visibleFlat.filter((_, i) => i % 10 === 0).map((pt, i) => (
                        <Line
                            key={i}
                            points={[pt, visibleSurface[i*10]]}
                            color='#ffffff'
                            lineWidth={0.5}
                            transparent
                            opacity={0.3}
                        />
                    ))}
                </>
            )} 
        </group>
    )
}