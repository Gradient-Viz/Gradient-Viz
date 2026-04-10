import { useEffect, useMemo, useState } from 'react';
import useStore from '../store/useStore';
import douglasLogo from '../assets/logo.png';
import { setUserFunction, f, gradient } from '../utils/math';
import './UIOverlay.css';
import Contour2DPanel from './Contour2DPanel';

export default function UIOverlay() {
    const viewMode = useStore((s) => s.viewMode);
    const setViewMode = useStore((s) => s.setViewMode);
    const personPosition = useStore((s) => s.personPosition);
    const showVectors = useStore((s) => s.showVectors);
    const toggleVectors = useStore((s) => s.toggleVectors);
    const showAscentPath = useStore((s) => s.showAscentPath);
    const ascentProgress = useStore((s) => s.ascentProgress);
    const surfacePathProgress = useStore((s) => s.surfacePathProgress);
    const setPersonPosition = useStore((s) => s.setPersonPosition);
    const setShowAscentPath = useStore((s) => s.setShowAscentPath);
    const setAscentProgress = useStore((s) => s.setAscentProgress);
    const setSurfacePathProgress = useStore((s) => s.setSurfacePathProgress);
    const toggleGroundContours = useStore((s) => s.toggleGroundContours);
    const toggleSurfaceContours = useStore((s) => s.toggleSurfaceContours);
    const showGroundContours = useStore((s) => s.showGroundContours);
    const showSurfaceContours = useStore((s) => s.showSurfaceContours);
    const reset = useStore((s) => s.reset);
    const incrementFunctionVersion = useStore((s) => s.incrementFunctionVersion);
    const gridLines = useStore((s) => s.gridLines);
    const setGridLines = useStore((s) => s.setGridLines);
    const vectorCount = useStore((s) => s.vectorCount);
    const setVectorCount = useStore((s) => s.setVectorCount);
    const domainMin = useStore((s) => s.domainMin);
    const domainMax = useStore((s) => s.domainMax);
    const setDomainHalfRange = useStore((s) => s.setDomainHalfRange);
    const interactionMode = useStore((s) => s.interactionMode);
    const setInteractionMode = useStore((s) => s.setInteractionMode);

    const [funcText, setFuncText] = useState('(7*x*y)/exp(x^2+y^2)');
    const [funcError, setFuncError] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [vectorCountText, setVectorCountText] = useState(String(vectorCount));

    const canSwitchTo2D = viewMode === '3d_explore' || viewMode === '3d_compare';
    const canTraceAscent = viewMode === '2d_explore' && (!showAscentPath || ascentProgress >= 1);
    const canReturnTo3D = viewMode === '2d_explore' && showAscentPath && ascentProgress >= 1;
    const canReset = viewMode !== '3d_explore' || showAscentPath || surfacePathProgress > 0;
    const canEnterFirstPerson = viewMode === '3d_explore' || viewMode === '3d_compare';
    const canExitFirstPerson = viewMode === 'first_person';
    const traceLabel = showAscentPath && ascentProgress >= 1 ? 'Trace Again' : 'Trace Ascent';
    const progressPercent = Math.round(ascentProgress * 100);

    const modeLabel = useMemo(() => {
        if (viewMode === '3d_explore') return 'Mode: 3D Explore';
        if (viewMode === '2d_explore' && showAscentPath && ascentProgress < 1) return 'Mode: 2D Tracing';
        if (viewMode === '2d_explore') return 'Mode: 2D Explore';
        return 'Mode: 3D Compare';
    }, [viewMode, showAscentPath, ascentProgress]);

    const handleFunctionChange = (e) => {
        setFuncText(e.target.value);
    };

    const handleApplyFunction = () => {
        const success = setUserFunction(funcText);
        setFuncError(!success);
        if (success) {
            incrementFunctionVersion();
            reset();
            setSurfacePathProgress(0);
        }
    };

    const handleSwitchTo2D = () => setViewMode('2d_explore');

    const handleTraceAscent = () => {
        setViewMode('2d_explore');
        setAscentProgress(0);
        setSurfacePathProgress(0);
        setShowAscentPath(true);
    };

    const handleReturnTo3D = () => {
        setSurfacePathProgress(0);
        setViewMode('3d_compare');
    };

    const handleReset = () => reset();

    const handleSwitchToFirstPerson = () => setViewMode('first_person');
    const handleExitFirstPerson = () => setViewMode('3d_explore');
    const grad = gradient(personPosition[0], personPosition[1]);
    const gradMagnitude = Math.hypot(grad[0], grad[1]);
    const planeSize = useMemo(() => domainMax - domainMin, [domainMin, domainMax]);

    useEffect(() => {
        setVectorCountText(String(vectorCount));
    }, [vectorCount]);

    const applyVectorCountText = () => {
        const parsed = Number.parseInt(vectorCountText, 10);
        if (Number.isNaN(parsed)) {
            setVectorCountText(String(vectorCount));
            return;
        }
        const clamped = Math.max(6, Math.min(36, parsed));
        setVectorCount(clamped);
        setVectorCountText(String(clamped));
    };

    return (
        <aside className="sidebar" aria-label="Gradient visualizer controls">
            <div className="sidebar-header">
                <img src={douglasLogo} alt="Douglas College" />
                <h2>Gradient Visualizer</h2>
                <span className="mode-pill">{modeLabel}</span>
            </div>

            <div className="sidebar-scroll">
                <div className="section-card">
                    <span className="section-label">Function</span>
                    <p className="subtle-help">Use JavaScript math syntax for z = f(x, y).</p>
                    <input
                        className={`func-input ${funcError ? 'error' : ''}`}
                        value={funcText}
                        onChange={handleFunctionChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFunction()}
                    />
                    <button className="btn-primary" onClick={handleApplyFunction}>
                        Update Surface
                    </button>
                    {funcError && (
                        <p className="func-error">
                            Invalid function. Try expressions like: sin(x)*cos(y), exp(-0.2*(x^2+y^2)).
                        </p>
                    )}
                </div>

                <div className="section-card">
                    <span className="section-label">2D Contour Map</span>
                    <p className="subtle-help">Click or drag inside the map to reposition the explorer.</p>
                    <Contour2DPanel />
                </div>

                <div className="section-card">
                    <span className="section-label">Display</span>
                    <div className="btn-group">
                        <button
                            className={`btn-toggle ${showGroundContours ? 'active' : ''}`}
                            onClick={toggleGroundContours}
                        >
                            Ground Contours
                            <span className="toggle-dot" />
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
                            className={`btn-toggle ${interactionMode === 'click' ? 'active' : ''}`}
                            onClick={() => setInteractionMode(interactionMode === 'click' ? 'drag' : 'click')}
                        >
                            {interactionMode === 'click' ? 'Interaction: Click to Place' : 'Interaction: Shift + Drag'}
                            <span className="toggle-dot" />
                        </button>
                    </div>
                    <p className="subtle-help">
                        {interactionMode === 'click'
                            ? 'Click mode places the marker directly on the surface plane.'
                            : 'Drag mode allows smooth scrubbing while holding SHIFT in 3D.'}
                    </p>
                </div>

                <div className="section-card">
                    <div className="settings-toggle-row">
                        <span className="section-label settings-label">Settings</span>
                        <button
                            type="button"
                            className="settings-toggle-btn"
                            onClick={() => setShowSettings((open) => !open)}
                        >
                            {showSettings ? 'Hide' : 'Open'}
                        </button>
                    </div>
                    <p className="subtle-help">Adjust scene scale, surface detail, and vector density.</p>

                    {showSettings && (
                        <div className="settings-panel">
                            <div className="slider-row">
                                <div className="slider-label">
                                    <span>Plane Size</span>
                                    <span className="slider-value">{planeSize.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={6}
                                    max={24}
                                    step={0.5}
                                    value={planeSize}
                                    onChange={(e) => {
                                        const nextSize = parseFloat(e.target.value);
                                        setDomainHalfRange(nextSize / 2);
                                    }}
                                />
                            </div>

                            <div className="slider-row">
                                <div className="slider-label">
                                    <span>Surface Segments</span>
                                    <span className="slider-value">{gridLines}</span>
                                </div>
                                <input
                                    type="range"
                                    min={32}
                                    max={320}
                                    step={16}
                                    value={gridLines}
                                    onChange={(e) => setGridLines(parseInt(e.target.value, 10))}
                                />
                            </div>

                            <div className="slider-row">
                                <div className="slider-label">
                                    <span>Gradient Arrows</span>
                                    <div className="settings-input-group">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="settings-number-input"
                                            value={vectorCountText}
                                            onChange={(e) => {
                                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                setVectorCountText(digitsOnly);
                                            }}
                                            onBlur={applyVectorCountText}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    applyVectorCountText();
                                                }
                                            }}
                                            aria-label="Gradient arrow count"
                                        />
                                        <span className="slider-value">{vectorCount}x{vectorCount}</span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min={6}
                                    max={36}
                                    step={1}
                                    value={vectorCount}
                                    onChange={(e) => setVectorCount(parseInt(e.target.value, 10))}
                                />
                            </div>
                        </div>
                    )}
                </div>

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

                <div className="computed-card">
                    <div>
                        f({personPosition[0].toFixed(2)}, {personPosition[1].toFixed(2)}) ={' '}
                        <span className="val-cyan">{f(personPosition[0], personPosition[1]).toFixed(4)}</span>
                    </div>
                    <div>
                        ∇f = <span className="val-yellow">[{grad.map((v) => v.toFixed(4)).join(', ')}]</span>
                    </div>
                    <div>
                        |∇f| = <span className="val-orange">{gradMagnitude.toFixed(4)}</span>
                    </div>
                </div>

                <div className="section-card">
                    <span className="section-label">Animation Controls</span>
                    <p className="subtle-help">
                        Workflow: 3D Explore → 2D Trace → 3D Compare. You can replay without full reset.
                    </p>

                    <div className="btn-group">
                        <button
                            className={`btn-primary ${!canSwitchTo2D ? 'disabled' : ''}`}
                            onClick={handleSwitchTo2D}
                            disabled={!canSwitchTo2D}
                        >
                            Switch to 2D View
                        </button>

                        <button
                            className={`btn-primary ${!canTraceAscent ? 'disabled' : ''}`}
                            onClick={handleTraceAscent}
                            disabled={!canTraceAscent}
                        >
                            {traceLabel}
                        </button>

                        <button
                            className={`btn-primary ${!canReturnTo3D ? 'disabled' : ''}`}
                            onClick={handleReturnTo3D}
                            disabled={!canReturnTo3D}
                        >
                            Return to 3D Compare
                        </button>

                        <button
                            className={`btn-secondary ${!canReset ? 'disabled' : ''}`}
                            onClick={handleReset}
                            disabled={!canReset}
                        >
                            Reset Scene
                        </button>
                        
                        <button
                          className={`btn-primary ${!canEnterFirstPerson ? 'disabled' : ''}`}
                          onClick={handleSwitchToFirstPerson}
                          disabled={!canEnterFirstPerson}
                        >
                          Enter First Person
                        </button>

                        <button
                          className={`btn-secondary ${!canExitFirstPerson ? 'disabled' : ''}`}
                          onClick={handleExitFirstPerson}
                          disabled={!canExitFirstPerson}
                        >
                          Exit First Person
                    </button>
                        
                    </div>

                    {showAscentPath && ascentProgress < 1 && viewMode === '2d_explore' && (
                        <div className="progress-block">
                            <div className="progress-container">
                                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <p className="progress-text">Tracing path... {progressPercent}%</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Info */}
        <div className="info-hint">
            {viewMode === '3d_explore' && 'Explore the 3D surface. Drag to rotate camera, scroll to zoom, hold SHIFT and click/drag to move the explorer.'}
            {viewMode === '2d_explore' && 'Overhead 2D view. Yellow arrows show ∇f.'}
            {viewMode === '3d_compare' && 'Pink = 2D ascent path. Teal = 3D surface path.'}
            {viewMode === 'first_person' && 'First-person camera. Use mouse to look and move along the surface.'}
        </div>
    </div>
    </aside>
    );
}
