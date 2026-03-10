import { useState } from 'react';
import useStore from '../store/useStore';
import { setUserFunction } from '../utils/math';

const sidebarStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.95)',
    borderRight: '2px solid #999',
    padding: '15px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
    overflowY: 'auto',
    zIndex: 10,
    color: '#cecece',
};

const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #4e4e4e',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '13px',
    marginBottom: '10px',
};

const sliderLabelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
};

const buttonStyle = {
    padding: '8px 16px',
    margin: '4px',
    background: '#3c7e41',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
};

export default function UIOverlay(){
    const viewMode = useStore((s) => s.viewMode);
    const setViewMode = useStore((s) => s.setViewMode);
    const personPosition = useStore((s) => s.personPosition);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const setShowAscentPath = useStore((s) => s.setShowAscentPath);
    const setAscentProgress = useStore((s) => s.setAscentProgress);
    const toggleGroundContours = useStore((s) => s.toggleGroundContours);
    const toggleSurfaceContours = useStore((s) => s.toggleSurfaceContours);
    const showGroundContours = useStore((s) => s.showGroundContours);
    const showSurfaceContours = useStore((s) => s.showSurfaceContours);
    const reset = useStore((s) => s.reset);
    const incrementFunctionVersion = useStore((s) => s.incrementFunctionVersion);

    const [funcText, setFuncText] = useState('Math.sin(x) + Math.cos(y)');
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
        <div style={sidebarStyle}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2a5a2a'}}>
                Gradient Visualizer
            </h3>

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
                        min={-3}
                        max={3}
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
                    min={-3}
                    max={3}
                    step={0.1}
                    value={personPosition[1]}
                    onChange={(e) => 
                        setPersonPosition([personPosition[0], parseFloat(e.target.value)])
                    }
                    style={{ width: '100%' }}
                />
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
                                <button style={buttonStyle} onClick={handleTraceAscent}>
                                    Trace Ascent
                                </button>
                                <button style={buttonStyle} onClick={handleReturnTo3D}>
                                    Return to 3D
                                </button>
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
