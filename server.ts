import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve the complete native Android project ZIP package
  app.get(['/download-android-zip', '/NarayaniDeviGirlsCollegeERP-Android.zip'], (_req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'NarayaniDeviGirlsCollegeERP-Android.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="NarayaniDeviGirlsCollegeERP-Android.zip"');
      res.download(zipPath, 'NarayaniDeviGirlsCollegeERP-Android.zip');
    } else {
      res.status(404).send('ZIP file not found');
    }
  });

  // CORS-safe proxy for FastRoute PHP ERP at https://ndedu.in/erp/api
  app.all('/api/erp/*', async (req: Request, res: Response) => {
    // Enable CORS for web browser preview
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Access-Token, X-Institution-Id, X-Requested-With');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const subpath = req.params[0] || '';
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    // Exact remote FastRoute API endpoint
    const targetUrl = `https://ndedu.in/erp/api/${subpath}${query}`;

    try {
      const forwardedHeaders: Record<string, string> = {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'NDGC-Android-FastRoute-Client/1.0.0 (Linux; Android 14; Mobile)',
      };

      if (req.headers['authorization']) {
        forwardedHeaders['Authorization'] = req.headers['authorization'] as string;
      }
      if (req.headers['x-access-token']) {
        forwardedHeaders['X-Access-Token'] = req.headers['x-access-token'] as string;
      }
      if (req.headers['x-institution-id']) {
        forwardedHeaders['X-Institution-Id'] = req.headers['x-institution-id'] as string;
      }
      if (req.headers['content-type']) {
        forwardedHeaders['Content-Type'] = req.headers['content-type'] as string;
      }

      if (req.headers['cookie']) {
        forwardedHeaders['Cookie'] = req.headers['cookie'] as string;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers: forwardedHeaders,
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        forwardedHeaders['Content-Type'] = (req.headers['content-type'] as string) || 'application/json';
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      fetchOptions.signal = controller.signal;

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      const setCookies = response.headers.get('set-cookie');
      if (setCookies) {
        // Strip secure flag so preview environments over http can retain the PHPSESSID cookie
        const sanitizedCookie = setCookies.replace(/;\s*secure/gi, '');
        res.setHeader('Set-Cookie', sanitizedCookie);
      }

      const contentType = response.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text || 'Non-JSON response from ERP server' };
        }
      }

      return res.status(response.status).json(data);
    } catch (err: any) {
      return res.status(502).json({
        error: err.name === 'AbortError' ? 'Connection to ndedu.in timed out after 12s' : err.message,
        targetUrl,
      });
    }
  });

  // Health and ping tester endpoint for ERP server
  app.get('/api/test-connection', async (req: Request, res: Response) => {
    const target = (req.query.target as string) || 'https://ndedu.in/erp/api/auth/captcha';
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(target, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NDGC-Android-ERP-Diagnostic/1.0',
        },
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      const data = await response.json().catch(() => null);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json({
        success: response.ok,
        target,
        status: response.status,
        statusText: response.statusText,
        latencyMs: latency,
        data,
      });
    } catch (error: any) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(502).json({
        success: false,
        target,
        error: error.message,
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Catch-all handler to serve index.html in dev mode (prevents blank screen)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Narayani Devi Girls College ERP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
