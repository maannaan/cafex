import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const screenshotDir = '/Users/apple/.gemini/antigravity/brain/b3305846-f1ae-48d5-a581-f76c2841b3e2';
const screenshotPath = path.join(screenshotDir, 'hero-3d-mug.png');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- Verifying 3D Coffee Mug in Headless Chrome ---');
  
  // 1. Launch headless Chrome with WebGL support
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1280,900',
    '--disable-background-networking',
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  chromeProc.stderr.on('data', (d) => {
    // console.log('[Chrome]', d.toString());
  });

  try {
    // 2. Wait for CDP port
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const res = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        if (wsUrl) break;
      } catch (e) {
        // Retry
      }
    }

    if (!wsUrl) {
      throw new Error('Failed to connect to Chrome DevTools port 9222');
    }
    console.log('Connected to CDP target:', wsUrl);

    // 3. Connect via native WebSocket
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let id = 1;
    const send = (method, params = {}) => {
      const msgId = id++;
      return new Promise((resolve) => {
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    const errors = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        errors.push(msg.params.exceptionDetails);
      }
      if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
        errors.push(msg.params.entry.text);
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Waiting for 3D model, textures, and canvas to render...');
    await sleep(4000);

    // 4. Evaluate canvas in DOM
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { error: 'No canvas found' };
        const rect = canvas.getBoundingClientRect();
        return {
          found: true,
          width: canvas.width,
          height: canvas.height,
          clientWidth: rect.width,
          clientHeight: rect.height,
          title: document.title
        };
      })()`,
      returnByValue: true
    });

    console.log('DOM Canvas State:', evalRes.result.value);

    // 5. Capture screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshot.data, 'base64');
    fs.writeFileSync(screenshotPath, buffer);
    fs.writeFileSync(path.join(process.cwd(), 'apps/web/public/hero-preview.png'), buffer);
    console.log('Captured screenshot successfully to:', screenshotPath);

    console.log('Collected Client Errors count:', errors.length);
    if (errors.length > 0) {
      console.log('Errors:', JSON.stringify(errors, null, 2));
    } else {
      console.log('SUCCESS: 0 client-side exceptions or console errors!');
    }

    ws.close();
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

