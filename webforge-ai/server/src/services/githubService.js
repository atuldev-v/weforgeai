import { Octokit } from 'octokit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

const GITHUB_OAUTH_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';

export function buildGitHubAuthorizeUrl(state) {
  if (!env.GITHUB_CLIENT_ID) throw ApiError.internal('GitHub OAuth is not configured on this server.');
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    scope: 'repo read:user user:email',
    state,
  });
  return `${GITHUB_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const res = await fetch(GITHUB_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_CALLBACK_URL,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    logger.error('GitHub OAuth token exchange failed', data);
    throw ApiError.badRequest('Unable to connect to GitHub. Please try again.');
  }
  return data.access_token;
}

export async function fetchGitHubProfile(accessToken) {
  const octokit = new Octokit({ auth: accessToken });
  const { data } = await octokit.rest.users.getAuthenticated();
  return { id: String(data.id), username: data.login };
}

/**
 * Creates a repository (if it doesn't already exist for this user) and pushes the
 * full project file list to it via the Contents API — one commit per file, which
 * is simple, dependency-free, and sufficient for an initial publish/update flow.
 */
export async function createAndPushRepo({ accessToken, repoName, isPrivate, files, description }) {
  const octokit = new Octokit({ auth: accessToken });

  let repo;
  try {
    const { data } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate,
      description: description || 'Generated with WebForge AI',
      auto_init: true,
    });
    repo = data;
  } catch (err) {
    if (err.status === 422) {
      throw ApiError.conflict(`A repository named "${repoName}" already exists on your GitHub account.`);
    }
    logger.error('GitHub repo creation failed', err);
    throw ApiError.internal('Unable to publish to GitHub.');
  }

  await pushFiles({ octokit, owner: repo.owner.login, repo: repo.name, files, message: 'Initial commit from WebForge AI' });

  return { owner: repo.owner.login, name: repo.name, url: repo.html_url };
}

export async function pushChangesToRepo({ accessToken, owner, repoName, files, message }) {
  const octokit = new Octokit({ auth: accessToken });
  await pushFiles({ octokit, owner, repo: repoName, files, message: message || 'Update from WebForge AI' });
  const { data } = await octokit.rest.repos.get({ owner, repo: repoName });
  return { owner: data.owner.login, name: data.name, url: data.html_url };
}

async function pushFiles({ octokit, owner, repo, files, message }) {
  for (const file of files) {
    let sha;
    try {
      const existing = await octokit.rest.repos.getContent({ owner, repo, path: file.path });
      if (!Array.isArray(existing.data)) sha = existing.data.sha;
    } catch (err) {
      if (err.status !== 404) throw err; // 404 means the file doesn't exist yet — that's fine
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: file.path,
      message,
      content: Buffer.from(file.content, 'utf8').toString('base64'),
      ...(sha ? { sha } : {}),
    });
  }
}
