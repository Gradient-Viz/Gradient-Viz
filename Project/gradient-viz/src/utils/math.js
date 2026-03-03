const H = 0.0001;

// z = f(x,y) = 2e^(-0.5(x^2 + y^2))
export function f(x,y){
    //
    // Math.sin(x) + Math.cos(y)
    // 2.0 * Math.exp(-0.5 * (x*x+y*y))
    // Math.sin(Math.sqrt(x*x + y*y))
    return Math.sin(x) + Math.cos(y);
}

// calculating gradient
export function gradient(x,y){
    const dfdx = (f(x+H,y) - f(x-H,y))/(2*H);
    const dfdy = (f(x,y+H) - f(x,y-H))/(2*H);
    return [dfdx, dfdy];
}

// Magnitude of the gradient (length)
export function gradientMagnitude(x,y){
    const [gx, gy] = gradient(x,y);
    return Math.sqrt(gx*gx + gy*gy);
}

// Contour Lines via Marching squares with linear interpolation

// Helper func for linear interpolation 
function lerp(v0, v1, t){
    return v0 + t * (v1 - v0);
}

export function contourSegments(level, xMin, xMax, yMin, yMax, steps = 120){
    const dx = (xMax - xMin) / steps;
    const dy = (yMax - yMin) / steps;
    const segments = [];

    // 1. Pre-compute f(x,y) at every grid point
    const grid = [];
    for(let i = 0; i <= steps; i++){
        grid[i] = [];
        for(let j = 0; j <= steps; j++){
            grid[i][j] = f(xMin + i * dx, yMin + j * dy);
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
            const v10 = grid[i+1][j];   //bottom right
            const v11 = grid[i+1][j+1]; //top right
            const v01 = grid[i][j+1];   // top left

            // 4-bit classification
            const code =  (v00 >= level ? 1 : 0)
                        | (v10 >= level ? 2 : 0)
                        | (v11 >= level ? 4 : 0)
                        | (v01 >= level ? 8 : 0);
            
            if (code === 0 || code === 15 ) continue;

            // Edge interpolation helpers
            const edgeBottom = () => {
                const t = (level - v00) / (v10 - v00);
                return [lerp(x0, x1, t), y0];
            };
            const edgeRight = () => {
                const t = (level - v10) / (v11 - v10);
                return [x1, lerp(y0, y1, t)];
            };
            const edgeTop = () => {
                const t = (level - v01) / (v11 - v01);
                return [lerp(x0, x1, t), y1];
            };
            const edgeLeft = () => {
                const t = (level - v00) / (v01 - v00);
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

export function generateContours(levels, xMin = -3, xMax = 3, yMin = -3, yMax = 3, steps = 120){
    return levels.map(level => ({
        level,
        segments: contourSegments(level, xMin, xMax, yMin, yMax, steps),
    }));
}

export function autoContourLevels(xMin, xMax, yMin, yMax, numLevels = 9, sampleSteps = 50){
    let fMin = Infinity;
    let fMax = -Infinity;
    const dx = (xMax - xMin) / sampleSteps;
    const dy = (yMax - yMin) / sampleSteps;

    for (let i = 0; i <= sampleSteps; i++){
        for(let j = 0; j <= sampleSteps; j++){
            const val = f(xMin + i *dx, yMin + j*dy);
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


export function gradientAscentPath(startX, startY, stepSize = 0.03, maxSteps = 600, tolerance = 0.001, domainMin = -18, domainMax = 18){
    const path = [[startX, startY]];
    let x = startX, y = startY;

    for(let i = 0; i < maxSteps; i++){
        const [gx, gy] = gradient(x,y);
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

// 2D path -> 3D path on the surface
export function path2Dto3D(path2D){
    return path2D.map(([x, y]) => [x, f(x, y), y]);
}

// 2D path -> flat ground plane
export function path2DtoFlat(path2D, yOffset = 0.02){
    return path2D.map(([x, y]) => [x, yOffset, y]);
}