import {  useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
    useXRInputSourceEvent, 
    useXRInputSourceState,
    useXRControllerButtonEvent,
} from "@react-three/xr";
import useStore from "../../store/useStore";

export default function VRControllerInteraction({ dragPlaneRef, panelRef }){
    const isVRsession = useStore((s) => s.isVRsession);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);

    const toggleVRUI = useStore((s) => s.toggleVRUI);
    const vrRightGripActive = useStore((s) => s.vrRightGripActive);
    const setVRRightGripActive = useStore((s) => s.setVRRightGripActive);
    const vrLeftGripActive = useStore((s) => s.vrLeftGripActive);
    const setVRLeftGripActive = useStore((s) => s.setVRLeftGripActive);
    const setVRUIPanelPose = useStore((s) => s.setVRUIPanelPose);
    const vrUIPanelRotation = useStore((s) => s.vrUIPanelRotation);

    const rightController = useXRInputSourceState("controller", "right");
    const leftController = useXRInputSourceState("controller", "left");
    const raycasterRef = useRef(new THREE.Raycaster());
    const tempMatrixRef = useRef(new THREE.Matrix4());
    
    const panelOffsetRef = useRef(new THREE.Vector3());
    const panelTargetPosRef = useRef(new THREE.Vector3());
    const panelCurrentPosRef = useRef(new THREE.Vector3());

    const rightSmoothedPointRef = useRef(null);
    const lastPersonPosRef = useRef([Number.NaN, Number.NaN]);
    const aPressedRef = useRef(false);

    const RIGHT_SMOOTH = 0.35;
    const PANEL_SMOOTH = 0.2;
    const UPDATE_EPSILON = 0.002;


    const clampXZ = (point) => {
        const x = Math.max(domainMin, Math.min(domainMax, point.x));
       const z = Math.max(domainMin, Math.min(domainMax, point.z)); 
       return [x, z];
    };

    const updatePersonFromPoint = (point) => {
        const [x, z] = clampXZ(point);
        const [lastX, lastZ] = lastPersonPosRef.current;

        if(
            Number.isNaN(lastX) || 
            Math.abs(x - lastX) > UPDATE_EPSILON || Math.abs(z - lastZ) > UPDATE_EPSILON
        ){
            setPersonPosition([x,z]);
            lastPersonPosRef.current = [x, z];
        }
    };

    const raycastToDragPlane = (controllerState) => {
        const plane = dragPlaneRef?.current;
        const controllerObject = controllerState?.object;
        if(!plane || !controllerObject) return null;
        
        const raycaster = raycasterRef.current;
        const tempMatrix = tempMatrixRef.current;

        tempMatrix.identity().extractRotation(controllerObject.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controllerObject.matrixWorld);
        raycaster.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix).normalize();

        const hits = raycaster.intersectObject(plane, true);
        if (!hits.length) return null;
        return hits[0].point;
    };

    useXRInputSourceEvent(
        "all",
        "selectstart",
        (event) => {
            if(!isVRsession) return;
            if (event.inputSource.handedness !== "right") return;

            const hit = raycastToDragPlane(rightController);
            if(!hit) return;

            setPersonPosition(clampXZ(hit));
        },
    [isVRsession, rightController, domainMin, domainMax]);

    useXRInputSourceEvent(
        "all",
        "squeezestart",
        (event) => {
            if(!isVRsession) return;

            if(event.inputSource.handedness === "right"){
                setVRRightGripActive(true);
                const hit = raycastToDragPlane(rightController);
                rightSmoothedPointRef.current = hit ? hit.clone() : null;
            } 

            if(event.inputSource.handedness === "left"){
                setVRLeftGripActive(true);

                const panel = panelRef?.current;
                const leftObject = leftController?.object;
                if (!panel || !leftObject) return;

                const panelWorld = new THREE.Vector3();
                const controllerWorld = new THREE.Vector3();
                panel.getWorldPosition(panelWorld);
                leftObject.getWorldPosition(controllerWorld);

                panelOffsetRef.current.copy(panelWorld).sub(controllerWorld);
            }
        },[isVRsession, leftController, rightController]
    );

    useXRInputSourceEvent(
        "all",
        "squeezeend",
        (event) => {
            if (!isVRsession) return;

            if(event.inputSource.handedness === "right"){
                setVRRightGripActive(false);
                rightSmoothedPointRef.current = null;
            }

            if(event.inputSource.handedness === 'left'){
                setVRLeftGripActive(false);
            }
        }, [isVRsession]
    );

    useXRControllerButtonEvent(rightController, "a-button", (state) => {
        if (!isVRsession) return;
        if (state === "pressed" && !aPressedRef.current) {
            toggleVRUI();
            aPressedRef.current = true;
        }

        if (state !== "pressed"){
            aPressedRef.current = false;
        }
    });

    useFrame(() => {
        if (!isVRsession) return;
        if(vrRightGripActive){
            const hit = raycastToDragPlane(rightController);
            if(hit){
                if(!rightSmoothedPointRef.current){
                    rightSmoothedPointRef.current = hit.clone();
                }else{
                    rightSmoothedPointRef.current.lerp(hit, RIGHT_SMOOTH);
                }
                updatePersonFromPoint(rightSmoothedPointRef.current);
            }
        }
        
        if(vrLeftGripActive){
            const panel = panelRef?.current;
            const leftObject = leftController?.object;
            if (!panel || !leftObject) return;

            const controllerWorld = new THREE.Vector3();
            leftObject.getWorldPosition(controllerWorld);

            panelTargetPosRef.current.copy(controllerWorld).add(panelOffsetRef.current);
            panelCurrentPosRef.current.lerp(panelTargetPosRef.current, PANEL_SMOOTH);


            setVRUIPanelPose(
                [panelCurrentPosRef.current.x,panelCurrentPosRef.current.y,panelCurrentPosRef.current.z ],
                vrUIPanelRotation
            );
        }
    });

    return null;

}