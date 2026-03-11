import { useState } from 'react';
import useStore from '../store/useStore';
import douglasLogo from '../assets/logo.png';
import { setUserFunction, f, gradient, gradientMagnitude } from '../utils/math';

export default function UIOverlay(){
    const viewMode = useStore((s) => s.viewMode);
    const setViewMode = useStore((s) => s.setViewMode);
    const personPosition = useStore((s) => s.personPosition);
    const showVectors = useStore((s) => s.showVectors);
    const toggleVectors = useStore((s) => s.toggleVectors);
    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const setShowAscentPath = useStore((s) => s.setShowAscentPath);
    const setAscentProgress = useStore((s) => s.setAscentProgress);
    const toggleGroundContours = useStore((s) => s.toggleGroundContours);
    const toggleSurfaceContours = useStore((s) => s.toggleSurfaceContours);
    const showGroundContours = useStore((s) => s.showGroundContours);
    const showSurfaceContours = useStore((s) => s.showSurfaceContours);
    const reset = useStore((s) => s.reset);
    const incrementFunctionVersion = useStore((s) => s.incrementFunctionVersion);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const interactionMode = useStore((s) => s.interactionMode);
    const setInteractionMode = useStore((s) => s.setInteractionMode);

    const [funcText, setFuncText] = useState('(7*x*y)/exp(x^2+y^2)');
    const [funcError, setFuncError] = useState(false);

    const handleFunctionChange = (e)  => {
        setFuncText(e.target.value);
    }

    const handleApplyFunction = () => {
        const success = setUserFunction(funcText);
        setFuncError(!success);
        if (success){
            incrementFunctionVersion();
            reset();
        }
    };

    const handleSwitchTo2D = () => setViewMode('2d_explore');
    const handleTraceAscent = () => {
        setAscentProgress(0);
        setShowAscentPath(true);
    };

    const handleReturnTo3D = () => setViewMode('3d_compare');
    const handleReset = () => reset();

    return (
        <div className='sidebar'>
            {/* Header */}
            <div className="sidebar-header">
                <img src={douglasLogo} alt="Douglas College" />
                <h3>Gradient Visualizer</h3>
            </div>

            {/* Function input */}
            <label style={{ fontWeight: 'bold'}}>z = f(x,y)</label>
            <input
                style={{
                    ...inputStyle,
                    borderColor: funcError ? 'red' : '#aaa',
                }}
                value={funcText}
                onChange={handleFunctionChange}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFunction()}
            />
            <button 
                style={{ ...buttonStyle, width: '100%', marginBottom: '15px' }}
                onClick={handleApplyFunction}
                >
                    Graph
                </button>

                {funcError && (
                    <p  style={{ color: 'red', fontSize: '11px' }}>
                    Invalid function. Use JavaScript math syntax.
                    </p>
                )}

                <hr style={{ border: '1px solid #ccc', marginTop: '15px' }} />
                <div style={{ margin: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>Contour Visiblity</label>
                    <div style={{ marginTop: '8px' }}>
                        <button 
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                background: showGroundContours ? '#3c7e41' : '#555',
                            }}
                            onClick={toggleGroundContours}
                        >
                            Ground Contours: { showGroundContours ? 'ON' : 'OFF'}
                        </button>
                        <button
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                background:  showSurfaceContours ? '#3c7e41' : '#555', 
                            }}
                            onClick={toggleSurfaceContours}
                        >
                            Surface Contours: {showSurfaceContours ? 'ON' : 'OFF'}    
                        </button>
                        
                        <button
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                background: showVectors ? '#3c7e41' : '#555',
                            }}
                            onClick={toggleVectors}
                            >
                                Gradient Vectors: {showVectors ? 'ON' : 'OFF'}
                        </button>

                        <button
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                background: interactionMode === "click" ? '#3c7e41' : '#555',
                            }}
                            onClick={() =>
                                setInteractionMode(interactionMode === "click" ? "drag" : "click")
                            }
                            >
                                Interaction Mode: {interactionMode === "click" ? "Click Move": "Drag Trace"}
                        </button>
                    </div>
                </div>

                {/* Person position sliders */}
                <div style={{ marginTop: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>Person Position</label>
                    <div style={sliderLabelStyle}>
                        <span>x = {personPosition[0].toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min={domainMin}
                        max={domainMax}
                        step={0.1}
                        value={personPosition[0]}
                        onChange={(e) =>
                            setPersonPosition([parseFloat(e.target.value), personPosition[1]])
                        }
                        style={{ width: '100%' }}
                />

                <div style={sliderLabelStyle}>
                    <span>y = {[personPosition[1].toFixed(2)]}</span>
                </div>
                <input
                    type="range"
                    min={domainMin}
                    max={domainMax}
                    step={0.1}
                    value={personPosition[1]}
                    onChange={(e) => 
                        setPersonPosition([personPosition[0], parseFloat(e.target.value)])
                    }
                    style={{ width: '100%' }}
                />
                </div>

                {/* Computed values at person position */}
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ marginBottom: '4px' }}>
                        f({personPosition[0].toFixed(2)}, {personPosition[1].toFixed(2)}) = <span style={{ color: '#58C4DD' }}>{f(personPosition[0], personPosition[1]).toFixed(4)}</span>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                        ∇f = <span style={{ color: '#FFFF00' }}>[{gradient(personPosition[0], personPosition[1]).map(v => v.toFixed(4)).join(', ')}]</span>
                    </div>
                    <div>
                        |∇f| = <span style={{ color: '#FF6B6B' }}>{gradientMagnitude(personPosition[0], personPosition[1]).toFixed(4)}</span>
                    </div>
                </div>

                <hr style={{ border: '1px solid #ccc', marginTop: '15px' }}/>

                {/* View mode buttons */}
                <div style={{marginTop: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>Animation Controls</label>
                    <div style={{ marginTop: '8px' }}>
                        {viewMode === '3d_explore' && (
                            <button style={buttonStyle} onClick={handleSwitchTo2D}>
                                Switch to 2D View
                            </button>
                        )}
                        {viewMode === '2d_explore' && (
                            <>
                            {!showAscentPath &&(
                                <button style={buttonStyle} onClick={handleTraceAscent}>
                                    Trace Ascent
                                </button>
                            )}
                            {showAscentPath && ascentProgress >= 1 && (
                                <button style={buttonStyle} onClick={handleReturnTo3D}>
                                    Return to 3D
                                </button>
                            )}
                            {showAscentPath && ascentProgress < 1 && (
                                <p style={{color: '#58C4DD', fontSize: '11px', margin: '8px 4px'}}>
                                    Tracing path... {Math.round(ascentProgress * 100)}%
                                </p>
                            )}
                            </>
                        )}
                        {viewMode === '3d_compare' && (
                            <button style={buttonStyle} onClick={handleReset}>
                                Reset
                            </button>
                        )}
                </div>
            </div>

            <hr style={{ border: '1px solid #ccc', marginTop: '15px' }}/>

            {/*Info */}
            <div style={{ marginTop: '10px', color: '#666', fontSize: '11px' }}>
                {viewMode === '3d_explore' && 
                    'Explore the 3D surface. Drag to rotate, scroll to zoom.'}
                {viewMode === '2d_explore' &&
                    'Overhead 2D view. Yellow arrows show grad(f).'}
                {viewMode === '3d_compare' && 
                    'Pink = 2D ascent path. Teal = 3D surface path.'}
            </div>
        </div>
    );
}
