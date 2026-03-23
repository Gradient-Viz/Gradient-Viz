import { useState, useEffect } from "react";
import useStore from "../../store/useStore";

export default function VRSessionManager({ xrStore }){
    const [vrSupported, setVrSupported] = useState(false);
    const isVRsession = useStore((s) => s.isVRsession);
    const setIsVRsession = useStore((s) => s.setIsVRsession);

    useEffect(() =>{
        async function checkVR() {
            if (navigator.xr){
                const supported = await navigator.xr.isSessionSupported('immersive-vr');
                setVrSupported(supported);
            }
        }
        checkVR();
    }, []);

    useEffect(() =>{
        const unsubcribe = xrStore.subscribe((state) => {
            setIsVRsession(state.session !== null);
        });
        return unsubcribe;
    }, [setIsVRsession, xrStore]);

    const enterVr = () => {
        xrStore.enterVR();
    };

    if(!vrSupported || isVRsession) return null;

    return (
        <button
            onClick={enterVr}
            style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                padding: '12px 24px',
                fontSize: '16px',
                background: "#4a90d9",
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                zIndex: 1000,
            }}
        >
            Enter VR (sadness TT)
        </button>
    );
}