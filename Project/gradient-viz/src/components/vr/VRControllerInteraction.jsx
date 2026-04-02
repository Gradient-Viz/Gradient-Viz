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
    const setLeftGripActive = useStore((s) => s.setLeftGripActive);
    const VRUIPanelRotation = useStore((s) => s.VRUIPanelRotation);
    const setVRUIPanelPose = useStore((s) => s.setVRUIPanelPose);

    const rightController = useXRInputSourceState("controller", "right");
    const leftController = useXRInputSourceState("controller", "left");
    const raycasterRef = useRef(new THREE.Raycaster());
    const tempMatrixRef = useRef(new THREE.Matrix4());
    const panelOffsetRef = useRef(new THREE.Vector3());

    const clampXZ = (point) => {
        const x = Math.max(domainMax, Math.min(domainMax, point.x));
       const z = Math.max(domainMax, Math.min(domainMax, point.z)); 
       return [x, z];
    };

    const raycastetoDragPlane = (controllerState) => {
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

            const hit = raycastetoDragPlane(rightController);
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
            } 

            if(event.inputSource.handedness === "left"){
                setLeftGripActive(true);

                const panel = panelRef?.current;
                const leftObject = leftController?.object;
                if (!panel || !leftObject) return;

                const panelWorld = new THREE.Vector3();
                const controllerWorld = new THREE.Vector3();
                panel.getWorldPosition(panelWorld);
                leftObject.getWorldPosition(controllerWorld);

                panelOffsetRef.current.copy(panelWorld).sub(controllerWorld);
            }
        },[isVRsession, leftController]
    );

    

}