import {cachedJsonResponse} from '../../lib/serverCache';

const ATUIN_API_URL =
  'https://apis.evanpurkhiser.com/atuin-abacus/agent-history?period=1y&rollup=1d';

type AgentActivity = {
  date: string;
  prompts: number;
};

async function fetchAgentActivity() {
  const response = await fetch(ATUIN_API_URL, {
    headers: {Prefer: 'timezone=America/New_York'},
  });

  if (!response.ok) {
    throw new Error(`Atuin Abacus returned ${response.status}`);
  }

  const data = (await response.json()) as AgentActivity[];

  return data.map(({date, prompts}) => ({date, count: prompts}));
}

export async function GET(request: Request) {
  try {
    return await cachedJsonResponse(request, fetchAgentActivity);
  } catch (error) {
    console.error('Failed to load agent prompt activity', error);

    return Response.json(
      {error: 'Failed to load agent prompt activity'},
      {status: 502, headers: {'Cache-Control': 'no-store'}},
    );
  }
}
