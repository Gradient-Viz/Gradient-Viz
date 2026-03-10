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
            pos.setZ(i, z); 

            const t = (z-fMin) / (fMax - fMin); // maps
            colors[i*3] = 0.05 + t * 0.2; // R
            colors[i*3 + 1] = 0.2 + t * 0.55; // G
            colors[i*3 + 2] =  0.35 + t * 0.5; // B
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals(); 
        return geo;

    }, [domainMin, domainMax, gridLines, functionVersion]);
    // make y = z
    return (
        <group rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
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
                <meshStandardMaterial
                    color= "#b8860b"
                    wireframe
                    transparent
                    opacity={0.6}
                />
            </mesh>
        </group>
    );
}