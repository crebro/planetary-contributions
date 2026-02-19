import React from 'react';

interface SidebarProps {
    username: string;
    setUsername: (val: string) => void;
    pat: string;
    setPat: (val: string) => void;
    onFetch: () => void;
    isLoading: boolean;
    error: string | null;
    glowEnabled: boolean;
    setGlowEnabled: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    username,
    setUsername,
    pat,
    setPat,
    onFetch,
    isLoading,
    error,
    glowEnabled,
    setGlowEnabled,
}) => {
    return (
        <div
            className="sidebar"
            style={{
                width: '33.333%',
                height: '100vh',
                background: '#0d1117',
                borderRight: '1px solid #30363d',
                padding: '40px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                color: '#f0f6fc',
                zIndex: 100,
            }}
        >
            <div className="sidebar-header">
                <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>GitHub Solar</h1>
                <p style={{ color: '#8b949e', fontSize: '14px' }}>
                    Visualize your contributions as a planetary system.
                </p>
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>GitHub Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. facebook"
                    style={{
                        background: '#010409',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#f0f6fc',
                        outline: 'none',
                        fontSize: '14px',
                    }}
                />
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Personal Access Token (PAT)</label>
                <input
                    type="password"
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    style={{
                        background: '#010409',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#f0f6fc',
                        outline: 'none',
                        fontSize: '14px',
                    }}
                />
                <p style={{ color: '#8b949e', fontSize: '12px', marginTop: '4px' }}>
                    Requires <code>read:user</code> permissions.
                </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', color: '#8b949e', fontSize: '0.9rem' }}>
                    <input
                        type="checkbox"
                        checked={glowEnabled}
                        onChange={(e) => setGlowEnabled(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Atmospheric Glow
                </label>
            </div>

            <button
                onClick={onFetch}
                disabled={isLoading || !username || !pat}
                style={{
                    background: '#238636',
                    color: '#ffffff',
                    border: '1px solid rgba(240, 246, 252, 0.1)',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (isLoading || !username || !pat) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || !username || !pat) ? 0.6 : 1,
                    transition: 'all 0.2s',
                    marginTop: '0px',
                }}
            >
                {isLoading ? 'Fetching...' : 'Show Contributions'}
            </button>

            {error && (
                <p style={{ color: '#f85149', fontSize: '12px', background: 'rgba(248, 81, 73, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(248, 81, 73, 0.2)' }}>
                    {error}
                </p>
            )}

            <div style={{ marginTop: 'auto', borderTop: '1px solid #30363d', paddingTop: '20px' }}>
                <p style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center' }}>
                    Celestial visualization powered by React.
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
