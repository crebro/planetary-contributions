import React, { memo } from 'react';

interface OrbitProps {
    width: number;
    height: number;
    tilt: number;
    color: string;
    glowEnabled: boolean;
    children?: React.ReactNode;
}

const Orbit = memo(({
    width,
    height,
    tilt,
    color,
    glowEnabled,
    children,
}: OrbitProps) => {
    return (
        <div
            className="orbit"
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: width,
                height: height,
                border: `1px solid ${color}`,
                borderRadius: '50%',
                transform: `translate(-50%, -50%) scaleY(${tilt})`,
                boxShadow: glowEnabled ? `0 0 15px ${color}33, inset 0 0 15px ${color}11` : 'none',
                pointerEvents: 'none',
            }}
        >
            {children}
        </div>
    );
});

export default Orbit;
