import { useState } from 'react';
import useStore from '../store/useStore';
import douglasLogo from '../assets/logo.png';
import { setUserFunction, f, gradient, gradientMagnitude } from '../utils/math';
import './UIOverlay.css'; 
import Contour2DPanel from './Contour2DPanel';
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
            <div className="section-card">
                <span className="section-label">Function</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#888' }}>
                    z = f(x,y)
                </span>
                <input
                    className={`func-input ${funcError ? 'error' : ''}`}
                    value={funcText}
                    onChange={handleFunctionChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFunction()}
                />
                <button className="btn-primary" onClick={handleApplyFunction}>
                    Graph
                </button>
                {funcError && <p className="func-error">Invalid function. Use JavaScript math syntax.</p>}
            </div>

            {/* 2D contour map */}
            <div className="section-card">
                <span className="section-label">2D Contour Map</span>
                <Contour2DPanel />
            </div>

            {/* Display Toggles */}
            <div className="section-card">
                <span className="section-label">Display</span>
                <div className="btn-group">
                    <button
                        className={`btn-toggle ${showGroundContours ? 'active' : ''}`}
                        onClick={toggleGroundContours}
                    >
                        Ground Contours
                        <span className="toggle-dot"/>
                    </button>
                    <button
                        className={`btn-toggle ${showSurfaceContours ? 'active' : ''}`}
                        onClick={toggleSurfaceContours}
                    >
                        Surface Contours
                        <span className="toggle-dot" />
                    </button>
                    <button
                        className={`btn-toggle ${showVectors ? 'active' : ''}`}
                        onClick={toggleVectors}
                    >
                        Gradient Vectors
                        <span className="toggle-dot" />
                    </button>
                    <button
                        className={`btn-toggle ${interactionMode == 'click' ? 'active' : ''}`}
                        onClick={() => setInteractionMode(interactionMode === 'click' ? 'drag' : 'click')}
                    >
                        {interactionMode === 'click' ? 'Click Move' : 'Drag Trace'}
                        <span className="toggle-dot" />
                    </button>
                </div>
            </div>

            {/* Person position sliders */}
            <div className="section-card">
                <span className="section-label">Person Position</span>

                <div className="slider-row">
                    <div className="slider-label">
                        <span>x</span>
                        <span className="slider-value">{personPosition[0].toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min={domainMin}
                        max={domainMax}
                        step={0.1}
                        value={personPosition[0]}
                        onChange={(e) => setPersonPosition([parseFloat(e.target.value), personPosition[1]])}
                    />
                </div>

                <div className="slider-row">
                    <div className="slider-label">
                        <span>y</span>
                        <span className="slider-value">{personPosition[1].toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min={domainMin}
                        max={domainMax}
                        step={0.1}
                        value={personPosition[1]}
                        onChange={(e) => setPersonPosition([personPosition[0], parseFloat(e.target.value)])}
                    /> 
                </div>
            </div>

            {/* Computed Values */}
            <div className="computed-card">
                <div>
                    f({personPosition[0].toFixed(2)}, {personPosition[1].toFixed(2)}) ={' '}
                    <span className="val-cyan">{f(personPosition[0], personPosition[1]).toFixed(4)}</span>
                </div>
                <div>
                    ∇f ={' '}
                    <span className="val-yellow">
                        [{gradient(personPosition[0], personPosition[1]).map(v => v.toFixed(4)).join(', ')}]
                    </span>
                </div>
                <div>
                    |∇f| ={' '}
                    <span className="val-orange">{gradientMagnitude(personPosition[0], personPosition[1]).toFixed(4)}</span>
                </div>
            </div>

        {/*Animation Controls */}
        <div className="section-card">
            <span className="section-label">Animation Controls</span>
            <div className="btn-group">
                <button 
                    className={`btn-primary ${viewMode !== '3d_explore' ? 'disabled' : ''}`}
                    onClick={handleSwitchTo2D}
                    disabled={viewMode !== '3d_explore'}
                >
                    Switch to 2D View
                </button>
                <button 
                    className={`btn-primary ${viewMode !== '2d_explore' || showAscentPath ? 'disabled' : ''}`}
                    onClick={handleTraceAscent}
                    disabled={viewMode !== '2d_explore' || showAscentPath}
                >
                    Trace Ascent
                </button>
                <button 
                    className={`btn-primary ${viewMode !== '2d_explore' || !showAscentPath || ascentProgress < 1 ? 'disabled' : ''}`}
                    onClick={handleReturnTo3D}
                    disabled={viewMode !== '2d_explore' || !showAscentPath || ascentProgress < 1}
                >
                    Return to 3D
                </button>
                <button 
                    className={`btn-primary ${viewMode !== '3d_compare' ? 'disabled' : ''}`}
                    onClick={handleReset}
                    disabled={viewMode !== '3d_compare'}
                >
                    Reset
                </button>
            </div>
            {showAscentPath && ascentProgress < 1 && viewMode === '2d_explore' && (
                <div style={{ marginTop: '12px' }}>
                    <div className="progress-container">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.round(ascentProgress * 100)}%` }}
                        />
                    </div>
                    <p className="progress-text">
                        Tracing path... {Math.round(ascentProgress * 100)}%
                    </p>
                </div>
            )}
        </div>

        {/* Info */}
        <div className="info-hint">
            {viewMode === '3d_explore' && 'Explore the 3D surface. Drag to rotate camera, scroll to zoom, hold SHIFT and click/drag to move the explorer.'}
            {viewMode === '2d_explore' && 'Overhead 2D view. Yellow arrows show ∇f.'}
            {viewMode === '3d_compare' && 'Pink = 2D ascent path. Teal = 3D surface path.'}
        </div>
    </div>
    );
}
