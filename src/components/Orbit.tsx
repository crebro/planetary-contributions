import React from 'react';

interface OrbitProps {
    width: number;
    height: number;
    tilt: number;
    color?: string;
    children?: React.ReactNode;
}

const Orbit: React.FC<OrbitProps> = ({
    width,
    height,
    tilt,
    color = "#30363d",
    children
}) => {
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
            }}
        >
            {children}
        </div>
    );
};

export default Orbit;
