/**
 * 构建后脚本：确保 _redirects 文件被复制到 dist 目录
 * 这个脚本会在构建后运行，确保 _redirects 文件存在
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用 CommonJS 格式以确保兼容性

const distDir = path.join(__dirname, 'dist');
const redirectsSource = path.join(__dirname, 'public', '_redirects');
const redirectsDest = path.join(distDir, '_redirects');

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// 复制 _redirects 文件
if (fs.existsSync(redirectsSource)) {
  console.log('Copying _redirects file to dist...');
  fs.copyFileSync(redirectsSource, redirectsDest);
  console.log('✅ _redirects file copied successfully');
} else {
  console.warn('⚠️  _redirects source file not found, creating default...');
  // 创建默认的 _redirects 文件
  const defaultRedirects = `# Netlify redirects file
# Functions - must come first
/.netlify/functions/*  /.netlify/functions/:splat  200

# SPA fallback - redirect all routes to index.html
/*  /index.html  200
`;
  fs.writeFileSync(redirectsDest, defaultRedirects);
  console.log('✅ Default _redirects file created');
}

console.log('Build fix completed!');

