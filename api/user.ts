export default {
    async fetch(request: Request) {
        const url = new URL(request.url);
        const accessToken = url.searchParams.get('access_token');

        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'No access token provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'GitHub-Solar-Contributions',
                },
            });

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    },
};
