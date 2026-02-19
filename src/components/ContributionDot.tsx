import { memo } from 'react';
import { createPortal } from 'react-dom';
import type { Contribution } from '../App';

interface ContributionDotProps {
    contribution: Contribution;
    angle: number;
    orbitWidth: number;
    orbitHeight: number;
    tilt: number;
    color?: string;
    isHovered: boolean;
    previewPos: { x: number; y: number };
}

const ContributionDot = memo(({
    contribution,
    angle,
    orbitWidth,
    orbitHeight,
    tilt,
    color = "#2dba4e",
    isHovered,
    previewPos,
}: ContributionDotProps) => {
    const x = (orbitWidth / 2) * Math.cos(angle);
    const y = (orbitHeight / 2) * Math.sin(angle);

    // Dynamic OG Preview URL construction
    let previewImg = "";
    const repoParts = contribution.repo.split('/');
    const owner = repoParts[0];
    const repo = repoParts[1];

    if (contribution.type === 'PR') {
        previewImg = `https://opengraph.githubassets.com/1/${owner}/${repo}/pull/${contribution.number}`;
    } else if (contribution.type === 'ISSUE') {
        previewImg = `https://opengraph.githubassets.com/1/${owner}/${repo}/issues/${contribution.number}`;
    } else if (contribution.type === 'COMMIT') {
        // Commits don't have a specific OG image for individual commits easily, 
        // using the repo og image as a fallback
        previewImg = `https://opengraph.githubassets.com/1/${owner}/${repo}`;
    }

    return (
        <>
            <div
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
                    pointerEvents: 'auto',
                }}
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
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
});

export default ContributionDot;
