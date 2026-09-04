import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting rock-solid GitHub Pages deployment...');

const distDir = path.resolve('dist');
const deployDir = path.resolve('.deploy_gh_pages');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory does not exist. Run build first.');
  process.exit(1);
}

// 1. Ensure 404.html and .nojekyll are present
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

try {
  // Clean up any stale worktree
  try {
    execSync('git worktree remove --force .deploy_gh_pages', { stdio: 'ignore' });
  } catch {}
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }

  // Fetch gh-pages branch
  try {
    execSync('git fetch origin gh-pages:gh-pages', { stdio: 'inherit' });
  } catch {}

  // Add worktree for gh-pages
  execSync('git worktree add .deploy_gh_pages gh-pages', { stdio: 'inherit' });

  // Delete all existing files in worktree except .git
  const files = fs.readdirSync(deployDir);
  for (const file of files) {
    if (file !== '.git') {
      fs.rmSync(path.join(deployDir, file), { recursive: true, force: true });
    }
  }

  // Copy dist contents into worktree
  fs.cpSync(distDir, deployDir, { recursive: true });

  // Commit and push
  execSync('git add -A', { cwd: deployDir, stdio: 'inherit' });
  try {
    execSync('git commit -m "Deploy latest build to GitHub Pages [skip ci]"', { cwd: deployDir, stdio: 'inherit' });
  } catch {
    console.log('ℹ️ No changes to commit');
  }

  execSync('git push origin gh-pages --force', { cwd: deployDir, stdio: 'inherit' });

  // Remove worktree
  execSync('git worktree remove --force .deploy_gh_pages', { stdio: 'inherit' });

  console.log('✅ Successfully published to GitHub Pages!');
} catch (err) {
  console.error('❌ Deployment failed:', err.message);
  try {
    execSync('git worktree remove --force .deploy_gh_pages', { stdio: 'ignore' });
  } catch {}
  process.exit(1);
}
