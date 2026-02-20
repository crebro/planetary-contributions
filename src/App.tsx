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
      </div>
    </div>
  );
}

export default App;
