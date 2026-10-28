import { build } from 'esbuild';
import fs from 'fs';
fs.mkdirSync('dist', { recursive: true });
await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', outfile: 'dist/app.js', logLevel: 'error' });
const tpl = fs.readFileSync('src/template.html', 'utf8');
const js = fs.readFileSync('dist/app.js', 'utf8').replace(/<\/script/g, '<\\/script');
const glb = fs.readFileSync('lambo.glb');

// 1) website build: index.html + app.js + lambo.glb
fs.writeFileSync('dist/index.html', tpl.replace('<!--MODEL_SCRIPT-->', ''));
fs.copyFileSync('lambo.glb', 'dist/lambo.glb');

// 2) single-file build: everything embedded, opens by double-click
const standalone = tpl.replace('<!--MODEL_SCRIPT-->', `<script>window.LAMBO_MODEL_B64="${glb.toString('base64')}";</script>`)
  .replace('<script src="app.js"></script>', () => `<script>${js}</script>`);
fs.writeFileSync('dist/lambo-standalone.html', standalone);
for (const f of ['index.html', 'app.js', 'lambo.glb', 'lambo-standalone.html']) console.log(f, (fs.statSync('dist/' + f).size / 1e6).toFixed(2) + ' MB');
