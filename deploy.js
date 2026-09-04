import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting rock-solid GitHub Pages deployment...');

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory does not exist. Run build first.');
  process.exit(1);
}

// 1. Ensure 404.html and .nojekyll are present
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

// 2. Read remote origin URL from current repository
const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
console.log('📍 Remote URL:', remoteUrl);

// 3. Temporarily initialize git inside dist and push to gh-pages
try {
  // Remove any previous git repo in dist
  const gitInDist = path.join(distDir, '.git');
  if (fs.existsSync(gitInDist)) {
    fs.rmSync(gitInDist, { recursive: true, force: true });
  }

  execSync('git init', { cwd: distDir, stdio: 'inherit' });
  execSync('git checkout -b gh-pages', { cwd: distDir, stdio: 'inherit' });
  execSync('git add -A', { cwd: distDir, stdio: 'inherit' });
  execSync('git commit -m "Deploy to GitHub Pages [skip ci]"', { cwd: distDir, stdio: 'inherit' });
  execSync(`git push "${remoteUrl}" gh-pages --force`, { cwd: distDir, stdio: 'inherit' });

  // Clean up .git from dist
  fs.rmSync(gitInDist, { recursive: true, force: true });

  // Ensure root workspace stays on main
  try {
    execSync('git checkout main', { stdio: 'ignore' });
  } catch {}

  console.log('✅ Successfully published to GitHub Pages!');
} catch (err) {
  console.error('❌ Deployment failed:', err.message);
  process.exit(1);
}
