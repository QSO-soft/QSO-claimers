import { LoggerData } from '../logger';

export interface TemplateData extends LoggerData {
  id?: string;
  address?: string;
  moduleName?: string;
}

export const msgToTemplateTransform = (msg: string, templateData?: TemplateData) => {
  if (!templateData) {
    return msg;
  }

  const { id, moduleName, action, address, txId } = templateData;
  const templateString = [];

  id && templateString.push(`[${id}]`);

  address && templateString.push(`[${address}]`);

  moduleName && templateString.push(`[${moduleName}]`);

  action && templateString.push(`[${action}]`);

  txId && templateString.push(`[TX: №${txId}]`);

  msg && templateString.push(`- ${msg}`);

  return templateString.join(' ');
};
export const getSavedCheckersMessage = (projectName: string) =>
  `Results saved to src/_output/csv/checkers/${projectName}.csv`;

export const getFileNameWithPrefix = (projectName: string, fileName: string) =>
  `${projectName === 'evm' ? '' : projectName + '-'}${fileName}`;

export const assert = (condition: boolean, message?: string): void => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message || 'Unknown error'}`);
  }
};
