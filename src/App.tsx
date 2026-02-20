import { useState, useEffect } from 'react';
import SolarSystem from './components/SolarSystem';
import Sidebar from './components/Sidebar';
import './App.css';

export interface Contribution {
  id: string;
  type: 'PR' | 'ISSUE' | 'COMMIT';
  title: string;
  repo: string;
  url: string;
  number?: number;
  sha?: string;
  date: string;
}

export interface OrbitData {
  width: number;
  height: number;
  color: string;
  contributions: Contribution[];
}

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('github_username') || '');
  const [glowEnabled, setGlowEnabled] = useState(() => localStorage.getItem('glow_enabled') !== 'false');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('authenticated') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orbits, setOrbits] = useState<OrbitData[]>([]);

  // Check for OAuth callback success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const login_success = params.get('login_success');
    if (login_success === 'true') {
      localStorage.setItem('authenticated', 'true');
      setIsAuthenticated(true);
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // Load orbits from localStorage on mount
  useEffect(() => {
    const savedOrbits = localStorage.getItem('github_orbits');
    if (savedOrbits) {
      try {
        setOrbits(JSON.parse(savedOrbits));
      } catch (e) {
        console.error('Failed to parse saved orbits', e);
      }
    }
  }, []);

  // Persist credentials when they change
  useEffect(() => {
    localStorage.setItem('github_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('glow_enabled', String(glowEnabled));
  }, [glowEnabled]);

  const fetchContributions = async () => {
    if (!isAuthenticated) {
      setError("Please login with GitHub first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/contributions?username=${username}`);
      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data || !result.data.user) {
        throw new Error('User not found or API error');
      }

      const collection = result.data.user.contributionsCollection;
      const mappedOrbits: OrbitData[] = [];

      // Orbit 1: Pull Requests
      const prs: Contribution[] = (collection.pullRequestContributions.nodes || [])
        .filter((n: any) => n !== null)
        .map((n: any) => ({
          id: `pr-${n.pullRequest.url}`,
          type: 'PR',
          title: n.pullRequest.title,
          repo: n.pullRequest.repository.nameWithOwner,
          url: n.pullRequest.url,
          number: n.pullRequest.number,
          date: n.occurredAt
        }));
      if (prs.length > 0) {
        mappedOrbits.push({ width: 600, height: 320, color: '#30363d', contributions: prs });
      }

      // Orbit 2: Issues
      const issues: Contribution[] = (collection.issueContributions.nodes || [])
        .filter((n: any) => n !== null)
        .map((n: any) => ({
          id: `issue-${n.issue.url}`,
          type: 'ISSUE',
          title: n.issue.title,
          repo: n.issue.repository.nameWithOwner,
          url: n.issue.url,
          number: n.issue.number,
          date: n.occurredAt
        }));
      if (issues.length > 0) {
        mappedOrbits.push({ width: 450, height: 240, color: '#30363d', contributions: issues });
      }

      // Orbit 3: Commits
      const commits: Contribution[] = [];
      collection.commitContributionsByRepository.forEach((repoContrib: any) => {
        repoContrib.contributions.nodes.forEach((node: any, idx: number) => {
          commits.push({
            id: `commit-${repoContrib.repository.nameWithOwner}-${idx}`,
            type: 'COMMIT',
            title: `${node.commitCount} commit(s) to ${repoContrib.repository.nameWithOwner}`,
            repo: repoContrib.repository.nameWithOwner,
            url: `https://github.com/${repoContrib.repository.nameWithOwner}`,
            date: node.occurredAt
          });
        });
      });
      if (commits.length > 0) {
        mappedOrbits.push({ width: 300, height: 160, color: '#30363d', contributions: commits });
      }

      setOrbits(mappedOrbits);
      localStorage.setItem('github_orbits', JSON.stringify(mappedOrbits));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contributions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        username={username}
        setUsername={setUsername}
        onFetch={fetchContributions}
        isLoading={isLoading}
        error={error}
        glowEnabled={glowEnabled}
        setGlowEnabled={setGlowEnabled}
        isAuthenticated={isAuthenticated}
      />
      <div className="solar-system-slot" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SolarSystem orbitsData={orbits} glowEnabled={glowEnabled} />

        {/* Footer Actions */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          gap: '12px',
          zIndex: 1000,
        }}>
          <div style={{ position: 'relative' }} className="export-btn-container">
            <button
              style={{
                background: '#161b22',
                color: '#f0f6fc',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: "100%"
              }}
              onMouseEnter={(e) => {
                const tooltip = e.currentTarget.parentElement?.querySelector('.tooltip');
                if (tooltip) (tooltip as HTMLElement).style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const tooltip = e.currentTarget.parentElement?.querySelector('.tooltip');
                if (tooltip) (tooltip as HTMLElement).style.opacity = '0';
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                fill="currentColor"
                className="bi bi-send"
                viewBox="0 0 16 16"
              >
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
              </svg>
              Export
            </button>
            <div className="tooltip" style={{
              position: 'absolute',
              top: '-35px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0d1117',
              color: '#8b949e',
              border: '1px solid #30363d',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap',
              zIndex: 1001,
            }}>
              Coming Soon
            </div>
          </div>

          <a
            href="https://github.com/crebro/planetary-contributions"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#161b22',
              color: '#f0f6fc',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
