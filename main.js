'use strict';
const { app, BrowserWindow, protocol, net, shell, session, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// اجازه‌ی پخش خودکار صدا بدون نیاز به کلیک کاربر (برای موسیقی خوش‌آمدگویی هنگام باز شدن برنامه)؛
// باید پیش از app.whenReady تنظیم شود.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const ROOT = path.join(__dirname, 'www');

// پروتکل اختصاصی pargar://app/ → پوشه‌ی www.
// مزیت: مبدأ (origin) ثابت است؛ پس درس‌ها و فایل‌ها (localStorage / IndexedDB) با جابه‌جایی exe از بین نمی‌روند.
protocol.registerSchemesAsPrivileged([{
  scheme: 'pargar',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true }
}]);

if (!app.requestSingleInstanceLock()) app.quit();

const SPLASH_MIN_MS = 2600;
function createSplash() {
  const sp = new BrowserWindow({
    width: 640, height: 420, frame: false, resizable: false, movable: true, center: true, alwaysOnTop: true,
    skipTaskbar: true, show: false, backgroundColor: '#16324F', title: 'پرگار',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  sp.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  sp.once('ready-to-show', () => sp.show());
  sp.loadURL('pargar://app/splash.html');
  return sp;
}

function createWindow() {
  const splash = createSplash(), t0 = Date.now();
  const win = new BrowserWindow({
    width: 1280, height: 840, minWidth: 900, minHeight: 600, show: false,
    backgroundColor: '#EEF2F5', title: 'پرگار — سازنده‌ی درس ریاضی', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false }
  });
  win.once('ready-to-show', () => {
    setTimeout(() => { if (!splash.isDestroyed()) splash.close(); win.maximize(); win.show(); },
      Math.max(0, SPLASH_MIN_MS - (Date.now() - t0)));
  });
  // لینک‌های اینترنتی در مرورگر پیش‌فرض سیستم باز شوند، نه داخل برنامه
  const external = (url) => { if (/^https?:\/\//i.test(url)) shell.openExternal(url); };
  win.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('pargar://')) { e.preventDefault(); external(url); } });
  if (!app.isPackaged) win.webContents.on('before-input-event', (e, i) => { if (i.key === 'F12') win.webContents.toggleDevTools(); });
  win.loadURL('pargar://app/index.html');
}

app.whenReady().then(() => {
  protocol.handle('pargar', async (req) => {
    const rel = decodeURIComponent(new URL(req.url).pathname);
    const file = path.normalize(path.join(ROOT, rel === '/' ? 'index.html' : rel));
    if (!file.startsWith(ROOT)) return new Response('Forbidden', { status: 403 });
    let res;
    try { res = await net.fetch(pathToFileURL(file).toString()); } catch (e) { return new Response('Not found', { status: 404 }); }
    const headers = new Headers(res.headers);
    headers.set('Access-Control-Allow-Origin', '*');   // اپلت‌های sandbox‌شده بتوانند کتابخانه‌ها/فونت‌ها را بخوانند
    return new Response(res.body, { status: res.status, headers });
  });
  // فقط تمام‌صفحه و کپی در کلیپ‌بورد؛ بقیه‌ی مجوزها (دوربین، میکروفون، …) بسته است
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(['fullscreen', 'clipboard-sanitized-write'].includes(perm)));
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
