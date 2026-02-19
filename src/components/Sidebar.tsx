import React from 'react';

interface SidebarProps {
    username: string;
    onUsernameChange: (val: string) => void;
    pat: string;
    onPatChange: (val: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ username, onUsernameChange, pat, onPatChange }) => {
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
                    onChange={(e) => onUsernameChange(e.target.value)}
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
                    onChange={(e) => onPatChange(e.target.value)}
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

            <div style={{ marginTop: 'auto', borderTop: '1px solid #30363d', paddingTop: '20px' }}>
                <p style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center' }}>
                    Celestial visualization powered by React.
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
