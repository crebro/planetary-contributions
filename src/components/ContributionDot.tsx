import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ContributionDotProps {
    angle: number;
    orbitWidth: number;
    orbitHeight: number;
    tilt: number;
    color?: string;
}

const ContributionDot: React.FC<ContributionDotProps> = ({
    angle,
    orbitWidth,
    orbitHeight,
    tilt,
    color = "#2dba4e",
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
    const dotRef = useRef<HTMLDivElement>(null);

    const x = (orbitWidth / 2) * Math.cos(angle);
    const y = (orbitHeight / 2) * Math.sin(angle);

    // Preview data
    const previewImg = "https://opengraph.githubassets.com/1a2b3c/facebook/react/pull/27000";

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dotRef.current) return;
            const rect = dotRef.current.getBoundingClientRect();
            const dotCenterX = rect.left + rect.width / 2;
            const dotCenterY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
                Math.pow(e.clientX - dotCenterX, 2) + Math.pow(e.clientY - dotCenterY, 2)
            );

            const hovered = distance < 15;
            setIsHovered(hovered);
            if (hovered) {
                setPreviewPos({ x: dotCenterX, y: dotCenterY });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <>
            <div
                ref={dotRef}
                className="dot"
                style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    background: color,
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scaleY(${1 / tilt})`,
                    cursor: 'pointer',
                    zIndex: 20,
                    boxShadow: `0 0 10px ${color}`,
                    pointerEvents: 'auto',
                }}
            >
                <div
                    className="glow"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: color,
                        borderRadius: '50%',
                        filter: 'blur(4px)',
                        opacity: 0.6,
                        animation: 'pulse 2s infinite ease-in-out',
                    }}
                />

                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.5); opacity: 0.3; }
          }
           @keyframes fadeInUp {
            from { opacity: 0; transform: translateX(-50%) translateY(calc(-100% + 10px)); }
            to { opacity: 1; transform: translateX(-50%) translateY(-100%); }
          }
        `}} />
            </div>

            {isHovered && createPortal(
                <div
                    className="preview"
                    style={{
                        position: 'fixed',
                        left: previewPos.x,
                        top: previewPos.y - 20,
                        transform: 'translateX(-50%) translateY(-100%)',
                        width: '191px',
                        height: '100px',
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        pointerEvents: 'none',
                        zIndex: 10000,
                        overflow: 'hidden',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeInUp 0.1s ease-out',
                    }}
                >
                    <div
                        className="preview-arrow"
                        style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: '12px',
                            height: '12px',
                            background: '#161b22',
                            borderRight: '1px solid #30363d',
                            borderBottom: '1px solid #30363d',
                        }}
                    />
                    <img
                        src={previewImg}
                        alt="Contribution Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>,
                document.body
            )}
        </>
    );
};

export default ContributionDot;
