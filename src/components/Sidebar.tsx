import React from 'react';

interface SidebarProps {
    username: string;
    setUsername: (val: string) => void;
    onFetch: () => void;
    isLoading: boolean;
    error: string | null;
    glowEnabled: boolean;
    setGlowEnabled: (v: boolean) => void;
    isAuthenticated: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    username,
    setUsername,
    onFetch,
    isLoading,
    error,
    glowEnabled,
    setGlowEnabled,
    isAuthenticated,
}) => {
    const handleGitHubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        // Scope read:user and repo is usually more robust for various contribution types
        const scope = 'read:user';
        const redirectUri = window.location.origin + '/api/callback';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
    };

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
                <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>GitHub Planetary Contributions</h1>
                <p style={{ color: '#8b949e', fontSize: '14px' }}>
                    Visualize your contributions as a planetary system.
                </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={isAuthenticated ? undefined : handleGitHubLogin}
                        style={{
                            background: isAuthenticated ? 'transparent' : '#238636',
                            color: isAuthenticated ? '#238636' : '#ffffff',
                            border: isAuthenticated ? '1px solid #238636' : '1px solid rgba(240, 246, 252, 0.1)',
                            borderRadius: '6px',
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: isAuthenticated ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: isAuthenticated ? 1 : (isLoading ? 0.6 : 1),
                            flex: 1
                        }}
                    >
                        <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                        {isAuthenticated ? 'Authenticated' : 'Login with GitHub'}
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={() => {
                                // Backend manages session via HttpOnly cookies, 
                                // we just clear local indicator
                                localStorage.removeItem('authenticated');
                                localStorage.removeItem('github_username');
                                // To actually logout we'd need a /api/logout to clear cookies
                                window.location.reload();
                            }}
                            style={{
                                background: 'transparent',
                                color: '#f85149',
                                border: '1px solid #f85149',
                                borderRadius: '6px',
                                padding: '12px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                alignSelf: 'center',
                                flex: 1
                            }}
                        >
                            Sign Out
                        </button>
                    )}

                </div>

                <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
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
            </div>

            <div style={{ marginBottom: '1rem', marginTop: 'auto' }}>
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
                disabled={isLoading || !username || !isAuthenticated}
                style={{
                    background: '#238636',
                    color: '#ffffff',
                    border: '1px solid rgba(240, 246, 252, 0.1)',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (isLoading || !username || !isAuthenticated) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || !username || !isAuthenticated) ? 0.6 : 1,
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

            <div style={{ marginTop: '20px', borderTop: '1px solid #30363d', paddingTop: '20px' }}>
                <p style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center' }}>
                    Celestial visualization powered by React.
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
