import { createXRStore } from '@react-three/xr';

const store = createXRStore({
    offerSession: false,
    emulate: false,
});

console.log(store.getState());
