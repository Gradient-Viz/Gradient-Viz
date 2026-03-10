import { useMemo } from "react";
import * as THREE from 'three';
import { f } from '../utils/math';
import useStore from "../store/useStore";

export default function MountainSurface() {
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const gridLines = useStore((s) => s.gridLines);
    const functionVersion = useStore((s) => s.functionVersion);

    const SIZE = domainMax - domainMin;
    const SEGMENTS = gridLines;

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);

        let fMin = Infinity, fMax = -Infinity;

        for(let i = 0; i < pos.count; i++){
            const z = f(pos.getX(i), pos.getY(i));
            if (z < fMin) fMin = z;
            if (z > fMax) fMax = z;
        }

        for (let i = 0; i < pos.count; i++){
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = f(x,y);  // Compute height
            
            pos.setX(i, x);
            pos.setY(i, z);
            pos.setZ(i, y); 

            const t = fMax > fMin ? (z-fMin) / (fMax - fMin): 0; // maps
            colors[i*3] =0.02 + t * 0.08; // R
            colors[i*3 + 1] =  0.05 + t * 0.15; // G
            colors[i*3 + 2] =  0.1  + t * 0.2; // B
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals(); 
        return geo;

    }, [domainMin, domainMax, gridLines, functionVersion]);
    // make y = z
    return (
        <group>
            {/*Solid semi-trans surface */}
            <mesh geometry={geometry}>
                <meshStandardMaterial
                    vertexColors
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.6}
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>
            {/*Wireframe overlay*/}
            <mesh geometry={geometry}>
                <meshBasicMaterial
                    color= "#00ffcc"
                    wireframe
                    transparent
                    opacity={0.3}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}