import React, { memo } from 'react';

interface OrbitProps {
    width: number;
    height: number;
    tilt: number;
    color: string;
    children?: React.ReactNode;
}

const Orbit = memo(({
    width,
    height,
    tilt,
    color,
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
                pointerEvents: 'none',
                willChange: 'transform',
            }}
        >
            {children}
        </div>
    );
});

export default Orbit;
