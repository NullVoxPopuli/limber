const { spawnSync } = require('child_process');

function currentCommitSHA() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Git command failed with status ${result.status}: ${result.stderr}`);
  }

  return result.stdout.trim();
}
function currentGitBranch() {
  const result = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf-8' });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Git command failed with status ${result.status}: ${result.stderr}`);
  }

  return result.stdout.trim();
}

function refAbbr() {
  return `${currentGitBranch()} :: ${currentCommitSHA()}`;
}

module.exports = { currentCommitSHA, currentGitBranch, refAbbr };
