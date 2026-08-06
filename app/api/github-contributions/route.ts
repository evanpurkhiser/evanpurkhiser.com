import {getCloudflareContext} from '@opennextjs/cloudflare';

import {cachedJsonResponse} from '../../lib/serverCache';

const GITHUB_API_URL = 'https://api.github.com/graphql';
const GITHUB_LOGIN = 'evanpurkhiser';
const YEAR = 365 * 24 * 60 * 60 * 1000;

const CONTRIBUTIONS_QUERY = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

type ContributionDay = {
  date: string;
  contributionCount: number;
};

type GitHubResponse = {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: Array<{contributionDays: ContributionDay[]}>;
        };
      };
    } | null;
  };
  errors?: Array<{message: string}>;
};

class GitHubApiError extends Error {}
class MissingGitHubTokenError extends Error {}

async function getGitHubToken() {
  const processToken = process.env.GITHUB_TOKEN?.trim();

  if (processToken) {
    return processToken;
  }

  try {
    const {env} = await getCloudflareContext({async: true});
    const token = (env as CloudflareEnv & {GITHUB_TOKEN?: string}).GITHUB_TOKEN;
    return token?.trim() ?? null;
  } catch {
    return null;
  }
}

async function fetchContributions(token: string) {
  const to = new Date();
  const from = new Date(to.getTime() - YEAR);
  const response = await fetch(GITHUB_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'evanpurkhiser.com',
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        login: GITHUB_LOGIN,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
  });

  if (!response.ok) {
    throw new GitHubApiError(`GitHub returned ${response.status}`);
  }

  const result = (await response.json()) as GitHubResponse;

  if (result.errors?.length) {
    throw new GitHubApiError(result.errors.map(error => error.message).join('; '));
  }

  const weeks = result.data?.user?.contributionsCollection.contributionCalendar.weeks;

  if (!weeks) {
    throw new GitHubApiError(`GitHub user ${GITHUB_LOGIN} was not found`);
  }

  return weeks
    .flatMap(week => week.contributionDays)
    .map(({date, contributionCount}) => ({date, count: contributionCount}))
    .filter(({date}) => {
      const timestamp = Date.parse(`${date}T00:00:00Z`);
      return timestamp >= from.getTime() && timestamp <= to.getTime();
    })
    .toSorted((left, right) => left.date.localeCompare(right.date));
}

export async function GET(request: Request) {
  try {
    return await cachedJsonResponse(request, async () => {
      const token = await getGitHubToken();

      if (!token) {
        throw new MissingGitHubTokenError();
      }

      return fetchContributions(token);
    });
  } catch (error) {
    if (error instanceof MissingGitHubTokenError) {
      return Response.json(
        {error: 'GitHub token is not configured'},
        {status: 503, headers: {'Cache-Control': 'no-store'}},
      );
    }

    console.error('Failed to load GitHub contributions', error);

    return Response.json(
      {error: 'Failed to load GitHub contributions'},
      {status: 502, headers: {'Cache-Control': 'no-store'}},
    );
  }
}
