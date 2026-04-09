import {f} from '../utils/math';
import useStore from '../store/useStore';


export default function PersonMarker(){
    const personPosition = useStore((s) => s.personPosition);
    //const functionVersion = useStore((s) => s.functionVersion);
    const [px, py] = personPosition;
    const height = f(px, py);

    return (
        <group position={[px, height, py]}>
            {/*Body : cone*/}
            <mesh position={[0, 0.15, 0]}>
                <coneGeometry args={[0.08, 0.3, 8]} />
                <meshStandardMaterial color='#FFD700' />
            </mesh>
            {/*Head : sphere*/}
            <mesh position={[0, 0.38, 0]}>
                <sphereGeometry args={[0.06, 16, 16]}/>
                <meshStandardMaterial color="#FFD700" />
            </mesh>
        </group>
    );
}