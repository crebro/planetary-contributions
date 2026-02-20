const GITHUB_GRAPHQL_QUERY = `
query ProfilePublicContributions($login: String!) {
  user(login: $login) {
    contributionsCollection {
      pullRequestContributions(first: 20) {
        nodes {
          occurredAt
          pullRequest {
            title
            url
            number
            repository {
              nameWithOwner
            }
          }
        }
      }
      issueContributions(first: 20) {
        nodes {
          occurredAt
          issue {
            title
            url
            number
            repository {
              nameWithOwner
            }
          }
        }
      }
      commitContributionsByRepository(maxRepositories: 10) {
        repository {
          nameWithOwner
        }
        contributions(first: 10) {
          nodes {
            occurredAt
            commitCount
          }
        }
      }
    }
  }
}
`;

function getCookies(cookieHeader: string | null) {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(c => {
        const [name, ...value] = c.trim().split('=');
        if (name && value) cookies[name] = value.join('=');
    });
    return cookies;
}

async function refreshAccessToken(refreshToken: string) {
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    return await response.json();
}

async function fetchGitHubData(username: string, accessToken: string) {
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: GITHUB_GRAPHQL_QUERY,
            variables: { login: username },
        }),
    });
    return response;
}

export default {
    async fetch(request: Request) {
        const url = new URL(request.url);
        const username = url.searchParams.get('username');

        if (!username) {
            return new Response(JSON.stringify({ error: 'Username is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const cookies = getCookies(request.headers.get('Cookie'));
        let accessToken = cookies['access_token'];
        const refreshToken = cookies['refresh_token'];

        let response = await fetchGitHubData(username, accessToken || '');
        let result = await response.json();

        // If unauthorized or token invalid, attempt refresh
        if ((response.status === 401 || (result.errors && result.errors.some((e: any) => e.type === 'NOT_FOUND' || e.message.includes('token')))) && refreshToken) {
            const refreshData = await refreshAccessToken(refreshToken);

            if (refreshData.access_token) {
                accessToken = refreshData.access_token;
                response = await fetchGitHubData(username, accessToken || '');
                result = await response.json();

                // If successful, create response with new cookies
                const finalResponse = new Response(JSON.stringify(result), {
                    headers: { 'Content-Type': 'application/json' },
                });

                const cookieOptions = "path=/; max-age=86400; HttpOnly; Secure; SameSite=Lax";
                finalResponse.headers.append('Set-Cookie', `access_token=${refreshData.access_token}; ${cookieOptions}`);
                if (refreshData.refresh_token) {
                    finalResponse.headers.append('Set-Cookie', `refresh_token=${refreshData.refresh_token}; ${cookieOptions}`);
                }
                return finalResponse;
            }
        }

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    },
};