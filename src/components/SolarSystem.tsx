import React, { useState, useEffect, useRef } from 'react';
import Orbit from './Orbit';
import ContributionDot from './ContributionDot';
import GitHubLogo from './GitHubLogo';

const friction = 0.95;
const lerpFactor = 0.15;

const orbitsConfigs = [
    { width: 550, height: 300, dots: [0, 1], color: "#30363d" },
    { width: 400, height: 200, dots: [2, 3], color: "#30363d" }
];

const SolarSystem: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [scale, setScale] = useState(1.0);
    const [dotAngles, setDotAngles] = useState<number[]>([
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
    ]);

    const containerRef = useRef<HTMLDivElement>(null);
    const velocityRef = useRef({ x: 0, y: 0 });
    const rotationVelocityRef = useRef(0);
    const rotationMultiplierRef = useRef(1);
    const targetScaleRef = useRef(1.0);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);

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
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            const deltaX = relX - lastMousePosRef.current.x;
            const deltaY = relY - lastMousePosRef.current.y;

            // Use the rotation multiplier captured at the start of the drag
            const currentRotationDelta = deltaX * -0.01 * rotationMultiplierRef.current;

            rotationVelocityRef.current = currentRotationDelta;
            velocityRef.current = { x: deltaX, y: deltaY }; // Keep for scale momentum
            lastMousePosRef.current = { x: relX, y: relY };

            setDotAngles(prev => prev.map(a => a + currentRotationDelta));
            targetScaleRef.current = Math.max(0.3, Math.min(1.5, targetScaleRef.current + deltaY * 0.005));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            isDraggingRef.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useEffect(() => {
        let animationFrame: number;

        const update = () => {
            setScale(current => lerp(current, targetScaleRef.current, lerpFactor));

            if (!isDraggingRef.current) {
                const hasMomentum = Math.abs(rotationVelocityRef.current) > 0.0001 || Math.abs(velocityRef.current.y) > 0.01;

                if (hasMomentum) {
                    setDotAngles(prev => prev.map(a => a + rotationVelocityRef.current));
                    targetScaleRef.current = Math.max(0.3, Math.min(1.5, targetScaleRef.current + velocityRef.current.y * 0.002));

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
                width: 'calc(100% * 2/3)',
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
                }}
            >

                <GitHubLogo size={50} />
                {orbitsConfigs.map((config, i) => (
                    <Orbit
                        key={i}
                        width={config.width}
                        height={config.height}
                        tilt={scale}
                        color={config.color}
                    >
                        {config.dots.map(dotIndex => (
                            <ContributionDot
                                key={dotIndex}
                                angle={dotAngles[dotIndex]}
                                orbitWidth={config.width}
                                orbitHeight={config.height}
                                tilt={scale}
                            />
                        ))}
                    </Orbit>
                ))}
            </div>
        </div>
    );
};

export default SolarSystem;
