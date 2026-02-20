export default {
    async fetch(request: Request) {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return new Response(JSON.stringify({ error: 'No code provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const clientId = process.env.VITE_GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return new Response(JSON.stringify({ error: 'Missing environment variables.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            const response = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                }),
            });

            const data = await response.json();

            if (!data.access_token || !data.refresh_token) {
                return new Response(JSON.stringify({ error: 'Failed to exchange code for token', details: data }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const res = new Response(null, {
                status: 307,
                headers: {
                    'Location': `/?login_success=true`,
                }
            });

            // Use append to set multiple Set-Cookie headers
            const cookieOptions = "path=/; max-age=86400; HttpOnly; Secure; SameSite=Lax";
            res.headers.append('Set-Cookie', `access_token=${data.access_token}; ${cookieOptions}`);
            res.headers.append('Set-Cookie', `refresh_token=${data.refresh_token}; ${cookieOptions}`);

            return res;

        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to exchange code for token' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    },
};
