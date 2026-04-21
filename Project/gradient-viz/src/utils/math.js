//import { exp } from "three/src/nodes/TSL.js";

const H = 0.0001;

const DEFAULT_FN_A_TEXT = '(7*x*y)/exp(x^2+y^2)';
const DEFAULT_FN_B_TEXT = 'sin(x)*cos(y)';

// z = f(x,y) = 2e^(-0.5(x^2 + y^2))

function mathToJS(expr){
    let js = expr;
    
    const funcs = ['sin', 'cos', 'tan', 'sec', 'cosec', 'cot','asin', 'acos', 'atan', 'atan2',
        'sqrt', 'abs', 'log', 'log2', 'log10', 'exp', 'floor', 'ceil', 'round', 'min', 
        'max', 'pow'];
    
    for(const fn of funcs){
        js = js.replace(new RegExp(`\\b${fn}\\b`, `g`), `Math.${fn}`);
    }
    // ^ to **
    js = js.replace(/\^/g, '**');
    // Math.pi to pi (symbol)
    js = js.replace(/\bpi\b/gi, 'Math.PI');
    js = js.replace(/π/g, 'Math.PI');

    // Math.E to e
    js = js.replace(/\be\b(?!x|y)/g, 'Math.E');
    js = js.replace(/Math\.Math\./g, 'Math.');
    return js;
}

 function compileUserExpression(funcText){
    const jsText = mathToJS(funcText);
    const fn = new Function('x','y',`return ${jsText};`);
    const sample = fn(0,0);

    if(!Number.isFinite(sample)){
        throw new Error('Function must evalute to a finite number at (0,0).');
    }
    return fn;
 }

 function normalizeKey(key){
    return key === 'B' ? 'B' : 'A';
 }

 const _compiledFns = {
    A: compileUserExpression(DEFAULT_FN_A_TEXT),
    B: compileUserExpression(DEFAULT_FN_B_TEXT),
 };

 let _activeFunctionKey = 'A';
 
 function getFnByKey(key){
    return _compiledFns[normalizeKey(key)];
 }

 export function setActiveFunctionKey(key){
    _activeFunctionKey = normalizeKey(key);
 }

 export function getActiveFunctionKey(){
    return _activeFunctionKey;
 }
export function setFunctionByKey(key, funcText){
    try{
        const normalized = normalizeKey(key);
        const fn = compileUserExpression(funcText);
        _compiledFns[normalized] = fn;
        return true;
    } catch (e){
        console.error(`Invalid function ${key}:`, e);
        return false;
    }
}

export function evaluateFunction(key, x, y){
    return getFnByKey(key)(x,y);
}

export function f(x, y){
    return evaluateFunction(_activeFunctionKey, x, y);
}

export function setUserFunction(funcText){
    return setFunctionByKey(_activeFunctionKey, funcText);
}

// Backward-compatible API (uses active function key)
export function gradientForKey(key, x,y){
    const fn = getFnByKey(key);
    const dfdx = (fn(x + H, y) - fn(x - H, y)) / (2 * H);
    const dfdy = (fn(x, y + H) - fn(x, y - H)) / (2 * H);
    return [dfdx , dfdy];
}

export function gradient(x,y){
    return gradientForKey(_activeFunctionKey, x, y);
}

// Magnitude of the gradient (length)
export function gradientMagnitudeForKey(key, x, y){
    const [gx, gy] = gradientForKey(key, x, y);
    return Math.sqrt(gx*gx + gy*gy);
}

export function gradientMagnitude( x, y){
    return gradientMagnitudeForKey(_activeFunctionKey, x, y );
}

// Contour Lines via Marching squares with linear interpolation

// Helper func for linear interpolation 
function lerp(v0, v1, t){
    return v0 + t * (v1 - v0);
}

function safeRatio(level, v0, v1){
    const denom = v1 - v0;
    if (Math.abs(denom) < 1e-12) return 0.5;
    return (level - v0) / denom;
}


export function contourSegmentsForFunction(fn, level, xMin, xMax, yMin, yMax, steps = 120){
    const dx = (xMax - xMin) / steps;
    const dy = (yMax - yMin) / steps;
    const segments = [];

    // 1. Pre-compute f(x,y) at every grid point
    const grid = [];
    for(let i = 0; i <= steps; i++){
        grid[i] = [];
        for(let j = 0; j <= steps; j++){
            grid[i][j] = fn(xMin + i * dx, yMin + j * dy);
        }
    }

    for(let i = 0; i < steps; i++){
        for(let j = 0; j < steps; j++){
            const x0 = xMin + i * dx;
            const y0 = yMin + j * dy;
            const x1 = x0 + dx;
            const y1 = y0 + dy;

            // Corner values
            const v00 = grid[i][j];     //bottom left
            const v10 = grid[i + 1][j];   //bottom right
            const v11 = grid[i + 1][j+1]; //top right
            const v01 = grid[i][j + 1];   // top left

            // 4-bit classification
            const code =  (v00 >= level ? 1 : 0)
                        | (v10 >= level ? 2 : 0)
                        | (v11 >= level ? 4 : 0)
                        | (v01 >= level ? 8 : 0);
            
            if (code === 0 || code === 15 ) continue;

            // Edge interpolation helpers
            const edgeBottom = () => {
                const t = safeRatio(level, v00, v10);
                return [lerp(x0, x1, t), y0];
            };
            const edgeRight = () => {
                const t = safeRatio(level, v10, v11);
                return [x1, lerp(y0, y1, t)];
            };
            const edgeTop = () => {
                const t = safeRatio(level, v01, v11);
                return [lerp(x0, x1, t), y1];
            };
            const edgeLeft = () => {
                const t = safeRatio(level, v00, v01);
                return [x0, lerp(y0, y1, t)];
            };

            // Switch on all 16 marching sqrs cases
            switch(code){
                case 1: segments.push([edgeBottom(), edgeLeft()]); break;
                case 2: segments.push([edgeBottom(), edgeRight()]); break;
                case 3: segments.push([edgeLeft(), edgeRight()]); break;
                case 4: segments.push([edgeRight(), edgeTop()]); break;
                case 5: // saddle point - two segments
                    segments.push([edgeBottom(), edgeLeft()]);
                    segments.push([edgeRight(), edgeTop()]);
                    break;
                case 6: segments.push([edgeBottom(), edgeTop()]); break;
                case 7: segments.push([edgeLeft(), edgeTop()]); break;
                case 8: segments.push([edgeLeft(), edgeTop()]); break;
                case 9: segments.push([edgeBottom(), edgeTop()]); break;
                case 10: // saddle point 
                    segments.push([edgeBottom(), edgeRight()]);
                    segments.push([edgeLeft(), edgeTop()]);
                    break;
                case 11: segments.push([edgeRight(), edgeTop()]); break;
                case 12: segments.push([edgeLeft(), edgeRight()]); break;
                case 13: segments.push([edgeBottom(), edgeRight()]); break;
                case 14: segments.push([edgeBottom(), edgeLeft()]); break;
            }
        }
    }
    return segments;
}

export function contourSegmentsForKey(key, level, xMin, xMax, yMin, yMax, steps = 120){
    return contourSegmentsForFunction(getFnByKey(key), level, xMin, xMax, yMin, yMax, steps);
}

export function contourSegments(level, xMin, xMax, yMin, yMax, steps = 120){
    return contourSegmentsForKey(_activeFunctionKey, level, xMin, xMax, yMax, yMin, steps);
}

export function generateContoursForKey(key, levels, xMin = -3, xMax = 3, yMin = -3, yMax = 3, steps = 120){
    return levels.map(level => ({
        level,
        segments: contourSegmentsForKey(key, level, xMin, xMax, yMin, yMax, steps),
    }));
}

export function generateContours(levels, xMin = -3, xMax = 3, yMin = -3, yMax = 3, steps){
    return generateContoursForKey(_activeFunctionKey, levels, xMin, xMax, yMin, yMax, steps);
}

export function autoContourLevelsForFunction(fn, xMin, xMax, yMin, yMax, numLevels = 9, sampleSteps = 50){
    let fMin = Infinity;
    let fMax = -Infinity;
    const dx = (xMax - xMin) / sampleSteps;
    const dy = (yMax - yMin) / sampleSteps;

    for (let i = 0; i <= sampleSteps; i++){
        for(let j = 0; j <= sampleSteps; j++){
            const val = fn(xMin + i *dx, yMin + j*dy);
            if (val < fMin) fMin = val;
            if (val > fMax) fMax = val; 
        }
    }

    const levels = [];
    const step = (fMax - fMin) / (numLevels + 1);
    for(let k = 1; k <= numLevels; k++){
        levels.push(fMin + k * step);
    }
    return levels;
}

export function autoContourLevelsForKey(key, xMin, xMax, yMin, yMax, numLevels = 9, sampleSteps = 50){
    return autoContourLevelsForFunction(getFnByKey(key), xMin, xMax, yMin, yMax, numLevels, sampleSteps);
}

export function autoContourLevels(xMin, xMax, yMin, yMax, numLevels = 9, sampleSteps = 50){
    return autoContourLevelsForKey(_activeFunctionKey, xMin, xMax, yMin, yMax, numLevels, sampleSteps );
}

export function intersectionSegments(keyA = 'A', keyB = 'B', xMin = -3, xMax = 3, yMin = -3, yMax = 3, steps = 140){
    const fnA = getFnByKey(keyA);
    const fnB = getFnByKey(keyB);
    const diffFn = (x, y) => fnA(x, y) - fnB(x, y);
    return contourSegmentsForFunction(diffFn, 0, xMin, xMax, yMin, yMax, steps);
}


export function gradientAscentPathForKey(
    key,
    startX, 
    startY, 
    stepSize = 0.03, 
    maxSteps = 600, 
    tolerance = 0.001, 
    domainMin = -18, 
    domainMax = 18
){
    const path = [[startX, startY]];
    let x = startX, y = startY;

    for(let i = 0; i < maxSteps; i++){
        const [gx, gy] = gradientForKey(key, x,y);
        const mag = Math.sqrt(gx*gx + gy*gy);
        if (mag < tolerance) break;
        
        x += (gx / mag) * stepSize;
        y += (gy / mag) * stepSize;
        x = Math.max(domainMin, Math.min(domainMax,x));
        y = Math.max(domainMin, Math.min(domainMax,y));
        path.push([x, y]);
    }
    return path;
}

export function gradientAscentPath(
    startX,
    startY,
    stepSize = 0.03,
    maxSteps = 600,
    tolerance = 0.001,
    domainMin = -18,
    domainMax = 18
) {
    return gradientAscentPathForKey(_activeFunctionKey, startX, startY, stepSize, maxSteps, tolerance, domainMin, domainMax);
}


// 2D path -> 3D path on the surface
export function path2Dto3DForKey(key, path2D){
    return path2D.map(([x, y]) => [x, evaluateFunction(key, x, y), y]);
}

export function path2Dto3D(path2D){
    return path2Dto3DForKey(_activeFunctionKey, path2D);
}
// 2D path -> flat ground plane
export function path2DtoFlat(path2D, yOffset = 0.02){
    return path2D.map(([x, y]) => [x, yOffset, y]);
}