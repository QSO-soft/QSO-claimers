import dayjs from 'dayjs';
import { TransformableInfo } from 'logform';
import winston from 'winston';

import { LEVELS, LEVELS_NAMES, TIMESTAMP_FORMAT } from './constants';
import { LoggerType } from './index';

export interface LoggerProp {
  logger: LoggerType;
}
const formatWithColors = (value: string, levelName: string, message: any) => {
    const colorPaths = value.split(levelName);

    return {
      formattedLevel: colorPaths[0] + levelName.toUpperCase() + colorPaths[1],
      formattedMessage: colorPaths[0] + message + colorPaths[1],
    };
  },
  printFormat = (info: TransformableInfo) => {
    const { level, message, timestamp } = info;

    if (level.includes(LEVELS_NAMES.success)) {
      const { formattedLevel, formattedMessage } = formatWithColors(level, LEVELS_NAMES.success, message);

      return `${timestamp} | ${formattedLevel} | ${formattedMessage}`;
    }

    if (level.includes(LEVELS_NAMES.info)) {
      const { formattedLevel, formattedMessage } = formatWithColors(level, LEVELS_NAMES.info, message);

      return `${timestamp} | ${formattedLevel}    | ${formattedMessage}`;
    }

    if (level.includes(LEVELS_NAMES.warning)) {
      const { formattedLevel, formattedMessage } = formatWithColors(level, LEVELS_NAMES.warning, message);

      return `${timestamp} | ${formattedLevel} | ${formattedMessage}`;
    }

    if (level.includes(LEVELS_NAMES.error)) {
      const { formattedLevel, formattedMessage } = formatWithColors(level, LEVELS_NAMES.error, message);

      return `${timestamp} | ${formattedLevel}   | ${formattedMessage}`;
    }

    return `${message}`;
  };

export const initLogger = () =>
  winston.createLogger({
    levels: LEVELS,
    format: winston.format.combine(
      winston.format.timestamp({
        format: TIMESTAMP_FORMAT,
      }),
      winston.format.printf(printFormat)
    ),
    transports: [
      new winston.transports.Console({
        level: LEVELS_NAMES.info,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({
            format: TIMESTAMP_FORMAT,
          }),
          winston.format.printf(printFormat)
        ),
      }),
    ],
  });

export const buildFolderName = (loggerPath: string) => {
  const formattedTime = dayjs().format('HH-mm');
  const formattedDate = dayjs().format('DD-MM-YY');

  return `${loggerPath}/${formattedDate}_${formattedTime}`;
};
