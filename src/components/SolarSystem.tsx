import React, { useState, useEffect, useRef } from 'react';
import Orbit from './Orbit';
import ContributionDot from './ContributionDot';
import GitHubLogo from './GitHubLogo';
import type { OrbitData } from '../App';

const friction = 0.95;
const lerpFactor = 0.15;

interface SolarSystemProps {
    orbitsData: OrbitData[];
    glowEnabled: boolean;
}

const SolarSystem: React.FC<SolarSystemProps> = ({ orbitsData, glowEnabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredDotId, setHoveredDotId] = useState<string | null>(null);
    const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
    const [tilt, setTilt] = useState(1.0);
    const [zoom, setZoom] = useState(1.0);
    const [dotAngles, setDotAngles] = useState<Record<string, number>>({});

    const containerRef = useRef<HTMLDivElement>(null);
    const velocityRef = useRef({ x: 0, y: 0 });
    const rotationVelocityRef = useRef(0);
    const rotationMultiplierRef = useRef(1);
    const targetTiltRef = useRef(1.0);
    const targetZoomRef = useRef(1.0);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);

    // Initialize/Update angles for new contributions with minimum separation
    useEffect(() => {
        setDotAngles(prev => {
            const next = { ...prev };
            const minSeparation = 0.4; // Radians (~23 degrees)

            orbitsData.forEach(orbit => {
                const existingAnglesInOrbit: number[] = [];

                // Collect existing angles for this orbit
                orbit.contributions.forEach(c => {
                    if (next[c.id] !== undefined) {
                        existingAnglesInOrbit.push(next[c.id]);
                    }
                });

                orbit.contributions.forEach(c => {
                    if (next[c.id] === undefined) {
                        let angle = Math.random() * Math.PI * 2;
                        let attempts = 0;
                        let isTooClose = true;

                        while (isTooClose && attempts < 50) {
                            angle = Math.random() * Math.PI * 2;
                            isTooClose = existingAnglesInOrbit.some(existing => {
                                const diff = Math.abs(existing - angle);
                                const circularDiff = Math.min(diff, Math.PI * 2 - diff);
                                return circularDiff < minSeparation;
                            });
                            attempts++;
                        }

                        next[c.id] = angle;
                        existingAnglesInOrbit.push(angle);
                    }
                });
            });
            return next;
        });
    }, [orbitsData]);

    const lerp = (current: number, target: number, factor: number) => {
        return current + (target - current) * factor;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setIsDragging(true);
        isDraggingRef.current = true;

        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        lastMousePosRef.current = { x: relX, y: relY };

        // Remember rotation multiplier based on initial Y position
        const centerY = rect.height / 2;
        rotationMultiplierRef.current = relY > centerY ? 1 : -1;

        velocityRef.current = { x: 0, y: 0 };
        rotationVelocityRef.current = 0;
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            if (isDraggingRef.current) {
                const deltaX = relX - lastMousePosRef.current.x;
                const deltaY = relY - lastMousePosRef.current.y;

                const currentRotationDelta = deltaX * -0.01 * rotationMultiplierRef.current;
                rotationVelocityRef.current = currentRotationDelta;
                velocityRef.current = { x: deltaX, y: deltaY };
                lastMousePosRef.current = { x: relX, y: relY };

                setDotAngles(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(id => {
                        next[id] += currentRotationDelta;
                    });
                    return next;
                });

                // Dragging Y controls TILT (perspective)
                targetTiltRef.current = Math.max(0.2, Math.min(1.2, targetTiltRef.current + deltaY * 0.005));
                setHoveredDotId(null);
            } else {
                // Hover detection
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const mouseX = (relX - centerX) / targetZoomRef.current;
                const mouseY = (relY - centerY) / targetZoomRef.current;

                let bestDotId = null;
                let minDist = 15;

                orbitsData.forEach((orbit) => {
                    orbit.contributions.forEach(c => {
                        const angle = dotAngles[c.id];
                        if (angle === undefined) return;

                        const dx = (orbit.width / 2) * Math.cos(angle);
                        const dy = (orbit.height / 2) * Math.sin(angle) * targetTiltRef.current;

                        const dist = Math.sqrt(Math.pow(mouseX - dx, 2) + Math.pow(mouseY - dy, 2));
                        if (dist < minDist) {
                            minDist = dist;
                            bestDotId = c.id;
                        }
                    });
                });

                setHoveredDotId(bestDotId);
                if (bestDotId !== null) {
                    setPreviewPos({ x: e.clientX, y: e.clientY });
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            isDraggingRef.current = false;
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomSpeed = 0.001;
            const newZoom = Math.max(0.5, Math.min(3.0, targetZoomRef.current - e.deltaY * zoomSpeed));
            targetZoomRef.current = newZoom;

            // Update preview position if a dot is hovered to keep it pinned
            if (hoveredDotId) {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    orbitsData.forEach(orbit => {
                        orbit.contributions.forEach(c => {
                            if (c.id === hoveredDotId) {
                                const angle = dotAngles[c.id];
                                if (angle !== undefined) {
                                    const dx = (orbit.width / 2) * Math.cos(angle) * newZoom;
                                    const dy = (orbit.height / 2) * Math.sin(angle) * targetTiltRef.current * newZoom;
                                    setPreviewPos({
                                        x: rect.left + centerX + dx,
                                        y: rect.top + centerY + dy
                                    });
                                }
                            }
                        });
                    });
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dotAngles, orbitsData, zoom, tilt]);

    useEffect(() => {
        let animationFrame: number;

        const update = () => {
            setTilt(current => lerp(current, targetTiltRef.current, lerpFactor));
            setZoom(current => lerp(current, targetZoomRef.current, lerpFactor));

            if (!isDraggingRef.current) {
                const hasMomentum = Math.abs(rotationVelocityRef.current) > 0.0001 || Math.abs(velocityRef.current.y) > 0.01;

                if (hasMomentum) {
                    setDotAngles(prev => {
                        const next = { ...prev };
                        Object.keys(next).forEach(id => {
                            next[id] += rotationVelocityRef.current;
                        });
                        return next;
                    });

                    // Momentum affects TILT
                    targetTiltRef.current = Math.max(0.2, Math.min(1.2, targetTiltRef.current + velocityRef.current.y * 0.002));

                    rotationVelocityRef.current *= friction;
                    velocityRef.current.y *= friction;
                } else {
                    rotationVelocityRef.current = 0;
                    velocityRef.current.y = 0;
                }
            }

            animationFrame = requestAnimationFrame(update);
        };

        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div
            ref={containerRef}
            className="solar-container"
            onMouseDown={handleMouseDown}
            style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
        >
            <div
                className="orbit-system"
                style={{
                    position: 'relative',
                    width: 0,
                    height: 0,
                    transform: `scale(${zoom})`,
                }}
            >

                <GitHubLogo size={50} />
                {orbitsData.map((orbit, i) => (
                    <Orbit
                        key={i}
                        width={orbit.width}
                        height={orbit.height}
                        tilt={tilt}
                        color={orbit.color}
                        glowEnabled={glowEnabled}
                    >
                        {orbit.contributions.map(c => (
                            <ContributionDot
                                key={c.id}
                                contribution={c}
                                angle={dotAngles[c.id] || 0}
                                orbitWidth={orbit.width}
                                orbitHeight={orbit.height}
                                tilt={tilt}
                                zoom={zoom}
                                glowEnabled={glowEnabled}
                                isHovered={hoveredDotId === c.id}
                                previewPos={previewPos}
                            />
                        ))}
                    </Orbit>
                ))}
            </div>
        </div>
    );
};

export default SolarSystem;
