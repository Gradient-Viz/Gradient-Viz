import { useMemo } from "react";
import * as THREE from 'three';
import { evaluateFunction } from '../utils/math';
import useStore from "../store/useStore";

export default function MountainSurface({ fnKey = 'A' }) {
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const gridLines = useStore((s) => s.gridLines);
    const functionVersion = useStore((s) => s.functionVersion);

    const wireframe = useStore((s) => s.wireframe);
    

    const showSurfaceGraph = useStore((s) => (fnKey === 'B' ? s.showSurfaceB: s.showSurfaceA));
    const showSurfaceContours = useStore((s) => (fnKey === 'B' ? s.showSurfaceContoursB : s.showSurfaceContoursA ));
    const shouldShowWireframe = wireframe && !showSurfaceContours;



    const SIZE = domainMax - domainMin;
    const SEGMENTS = gridLines;

    const geometry = useMemo(() => { 
        void functionVersion;
        const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);

        let fMin = Infinity, fMax = -Infinity;

        for(let i = 0; i < pos.count; i++){
            const z = evaluateFunction(fnKey, pos.getX(i), pos.getY(i));
            if (z < fMin) fMin = z;
            if (z > fMax) fMax = z;
        }

        for (let i = 0; i < pos.count; i++){
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = evaluateFunction(fnKey, x, y);  // Compute height
            
            pos.setX(i, x);
            pos.setY(i, z);
            pos.setZ(i, y); 

            const t = fMax > fMin ? (z-fMin) / (fMax - fMin): 0; // maps

            if (fnKey === 'B'){
            colors[i * 3] = 0.02 + t * 0.20; // R
            colors[i * 3 + 1] =  0.03 + t * 0.10; // G
            colors[i * 3 + 2] =  0.10  + t * 0.18; // B
            } else {
                colors[i * 3] = 0.02 + t * 0.08; // R
                colors[i * 3 + 1] =  0.05 + t * 0.15; // G
                colors[i * 3 + 2] =  0.10  + t * 0.20; // B 
            }
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals(); 
        return geo;

    }, [SIZE, SEGMENTS, functionVersion, fnKey]);
    
    if(!showSurfaceGraph) return null;
    
    return (
        <group>
            {/*Solid semi-trans surface */}
            <mesh geometry={geometry}>
                <meshStandardMaterial
                    vertexColors
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.76}
                    roughness={0.52}
                    metalness={0.40}
                    emissive={fnKey === 'B' ? '#501261' : '#065563'}
                    emissiveIntensity={2}
                    wireframe={wireframe}
                />
            </mesh>
            {shouldShowWireframe && (
                <mesh geometry={geometry}>
                    <meshBasicMaterial
                        wireframe
                        color={fnKey === 'B' ? "#f071ff" : '#2fc8f6'}
                        transparent
                        opacity={0.5}
                        toneMapped={false}
                    />
                </mesh>
            )}
        </group>
    );
}