import axios from 'axios';

import { ANTICAPTCHA_KEY } from '../../_inputs/settings';
import { StringRecord } from '../../types';
import { getHeaders, sleep } from '../utils';
import {
  CreateAnticaptchaRes,
  GetAnticaptchaArgs,
  isFunCaptchaTask,
  isImageToCoordsCaptchaTask,
  isRecaptchaTask,
  isTurnstileTask,
} from './anticaptcha-types';

const ANTICAPTCHA_API_URL = 'https://api.anti-captcha.com';

const getTaskResult = async (taskId: number, headers: StringRecord) => {
  const { data: resultData } = await axios.post(
    `${ANTICAPTCHA_API_URL}/getTaskResult`,
    {
      clientKey: ANTICAPTCHA_KEY,
      taskId,
    },
    { headers }
  );

  return resultData;
};
export const getAnticaptcha = async ({ proxyObject, websiteURL, logger, taskType, options }: GetAnticaptchaArgs) => {
  try {
    let proxyAgentObject = {};
    if (proxyObject) {
      const { proxyType, proxyLogin, proxyPort, proxyIp, proxyPass } = proxyObject;
      proxyAgentObject = {
        proxyType: proxyType.toLowerCase(),
        proxyPort,
        proxyLogin,
        proxyAddress: proxyIp,
        proxyPassword: proxyPass,
      };
    }

    logger?.info('Processing anticaptcha...');

    const headers = getHeaders();
    const baseTaskData = {
      websiteURL,
      type: taskType,
      ...proxyAgentObject,
    };

    const { data } = await axios.post(
      `${ANTICAPTCHA_API_URL}/createTask`,
      {
        clientKey: ANTICAPTCHA_KEY,
        task: {
          ...baseTaskData,
          ...options,
        },
      },
      { headers }
    );
    const createdTaskData: CreateAnticaptchaRes = data;

    if (createdTaskData.errorDescription) {
      throw new Error(createdTaskData.errorDescription);
    }

    let resultData = await getTaskResult(createdTaskData.taskId, headers);

    while (resultData.status === 'processing') {
      await sleep(10);
      resultData = await getTaskResult(createdTaskData.taskId, headers);
    }

    if (resultData.errorDescription) {
      throw new Error(resultData!.errorDescription);
    }

    if (resultData.solution) {
      logger?.success('Captcha solved successfully...');

      if (isRecaptchaTask(taskType)) {
        return resultData.solution.gRecaptchaResponse;
      }
      if (isImageToCoordsCaptchaTask(taskType)) {
        return resultData.solution.coordinates;
      }
      if (isTurnstileTask(taskType) || isFunCaptchaTask(taskType)) {
        return resultData.solution.token;
      }

      return resultData.solution;
    }

    throw new Error('Unable to get anticaptcha solution');
  } catch (err) {
    const error = err as Error;
    throw new Error(error.message);
  }
};
