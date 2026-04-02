import { useState, useEffect } from "react";
import useStore from "../../store/useStore";

export default function VRSessionManager({ xrStore }){
    const [vrSupported, setVrSupported] = useState(false);
    const [busy, setBusy] = useState(false);
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

    useEffect(() => {
        const session = xrStore.getState().session;
        if (!session) return;

        const handleSessionEnd = () => {
            setIsVRsession(false);
            setBusy(false);
        };

        session.addEventListener('end', handleSessionEnd);
        return () => {
            session.removeEventListener('end', handleSessionEnd);
        };
    }, [xrStore, isVRsession, setIsVRsession]);

    useEffect(() => {
        if (!isVRsession) {
            setBusy(false);
        }
    }, [isVRsession]);

    const toggleVr = async () => {
        if (busy) return;

        setBusy(true);
        try {
            const session = xrStore.getState().session;
            if (session) {
                await session.end();
            } else {
                await xrStore.enterVR();
            }
        } catch (error) {
            console.error('Failed  toggle VR session:', error);
            setIsVRsession(false);
        } finally {
            setBusy(false);
        }
    };

    if(!vrSupported) return null;

    return (
        <button
            onClick={toggleVr}
            disabled={busy}
            style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                padding: '12px 24px',
                fontSize: '16px',
                background: isVRsession ? '#c84d4d' : '#4a90d9',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                zIndex: 1000,
            }}
        >
            {busy ? 'Switching...' : isVRsession ? 'Exit VR' : 'Enter VR'}
        </button>
    );
}