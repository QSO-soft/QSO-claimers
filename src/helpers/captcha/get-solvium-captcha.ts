import axios from 'axios';

import { SOLVIUM_CAPTCHA_KEY } from '../../_inputs/settings';
import { ProxyAgent } from '../../types';
import { getAxiosConfig, getHeaders, sleep } from '../utils';

const SOLVIUM_API_URL = 'https://captcha.solvium.io/api/v1/task';

export async function getSolviumCaptcha(proxyAgent: ProxyAgent | undefined, token: string) {
  try {
    const taskId = await requestSolving(proxyAgent, token);
    return getResult(proxyAgent, taskId);
  } catch (err) {
    const error = err as Error;
    throw new Error(error.message);
  }
}

async function requestSolving(proxyAgent: ProxyAgent | undefined, token: string): Promise<string> {
  try {
    const headers = {
      ...getHeaders(),
      Authorization: `Bearer ${SOLVIUM_CAPTCHA_KEY}`,
    };
    const config = {
      ...(await getAxiosConfig({
        proxyAgent,
        headers,
      })),
      validateStatus: () => true,
    };

    const response = await axios.get(`${SOLVIUM_API_URL}/vercel`, {
      ...config,
      params: { challengeToken: token },
    });

    const taskId = response.data.task_id;
    if (!taskId) {
      throw new Error(`Create captcha error: ${JSON.stringify(response.data)}`);
    }

    return taskId;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    throw new Error(`Failed to request solving: ${error.message}`);
  }
}

async function getResult(proxyAgent: ProxyAgent | undefined, taskId: string): Promise<string> {
  const maxAttempts = 150;
  const delaySeconds = 2;
  const headers = {
    ...getHeaders(),
    Authorization: `Bearer ${SOLVIUM_CAPTCHA_KEY}`,
  };

  const config = {
    ...(await getAxiosConfig({
      proxyAgent,
      headers,
    })),
    validateStatus: () => true,
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(
        `${SOLVIUM_API_URL}/status/${taskId}`,
        config
      );
      const { status, result } = response.data;

      if (status === 'completed') {
        if (!result) {
          throw new Error('No solution found in completed task');
        }
        return result?.solution;
      }

      if (status !== 'pending' && status !== 'running') {
        throw new Error(`Solve captcha error: ${JSON.stringify(response.data)}`);
      }

      await sleep(delaySeconds);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new Error(`Failed to get result: ${error.message}`);
    }
  }

  throw new Error('Captcha expired');
}
