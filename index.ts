import * as http from 'http';
import { URL } from 'url';
import { IncomingMessage, ServerResponse } from 'http';

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (req.method !== 'GET' || url.pathname !== '/token') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  try {
    const credentials = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString('base64');
    
    const tokenRes = await fetch('https://www.fflogs.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenRes.ok) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Failed to get token');
      return;
    }

    const json = await tokenRes.json();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ access_token: (json as any).access_token }));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error: ' + err.message);
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
