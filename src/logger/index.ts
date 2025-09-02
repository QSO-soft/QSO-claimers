import path from 'path';

import winston from 'winston';

import settings from '../_inputs/settings/settings';
import { getDirname, msgToTemplateTransform } from '../helpers';
import { WalletData } from '../types';
import { COMBINED_LOGS, LEVELS_COLORS, LEVELS_NAMES, LOGS_PATH } from './constants';
import { initLogger } from './utils';

export interface LoggerData extends LoggerMeta {
  action?: string; // can be any module or exec function name
  txId?: number;
}

interface LoggerMeta {
  wallet?: WalletData;
  moduleName?: string;
}

declare module 'winston' {
  export interface Logger {
    success: winston.LeveledLogMethod;
  }
}

winston.addColors(LEVELS_COLORS);

export class Logger {
  public meta: LoggerMeta;
  public dev: {
    info: (msg: string, templateData?: LoggerData) => void;
    success: (msg: string, templateData?: LoggerData) => void;
    warning: (msg: string, templateData?: LoggerData) => void;
    error: (msg: string, templateData?: LoggerData) => void;
  };
  private readonly logger: winston.Logger;
  private readonly logsPath: string;
  private readonly fileName: string;

  constructor(logsPath?: string, fileName?: string) {
    this.logger = initLogger();
    this.logsPath = logsPath || LOGS_PATH;
    this.fileName = fileName || COMBINED_LOGS;
    this.meta = { moduleName: '' };
    this.dev = {
      info: this.devInfo.bind(this),
      success: this.devSuccess.bind(this),
      warning: this.devWarning.bind(this),
      error: this.devError.bind(this),
    };
  }

  public setLoggerMeta(meta: LoggerMeta): void {
    this.meta = { ...this.meta, ...meta };
  }

  public successDisplay(msg: string, templateData?: LoggerData): void {
    this.logger.success(this.buildTemplate(msg, templateData));
  }

  public infoDisplay(msg: string, templateData?: LoggerData): void {
    this.logger.info(this.buildTemplate(msg, templateData));
  }

  public warningDisplay(msg: string, templateData?: LoggerData): void {
    this.logger.warning(this.buildTemplate(msg, templateData));
  }

  public errorDisplay(msg: string, templateData?: LoggerData): void {
    this.logger.error(this.buildTemplate(msg, templateData));
  }

  public success(msg: string, templateData?: LoggerData): void {
    const transportFile = this.addTransport(LEVELS_NAMES.success);
    if (transportFile) {
      this.successDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }

  public info(msg: string, templateData?: LoggerData): void {
    const transportFile = this.addTransport();
    if (transportFile) {
      this.infoDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }

  public warning(msg: string, templateData?: LoggerData): void {
    const transportFile = this.addTransport(LEVELS_NAMES.warning);
    if (transportFile) {
      this.warningDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }

  public error(msg: string, templateData?: LoggerData): void {
    const transportFile = this.addTransport(LEVELS_NAMES.error);
    if (transportFile) {
      this.errorDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }

  private buildPath(): string {
    const dirname = getDirname();

    return path.join(dirname, this.logsPath, this.fileName);
  }

  private buildTemplate(msg: string, templateData?: LoggerData): string {
    const walletAddress = templateData?.wallet?.walletAddress || this.meta.wallet?.walletAddress;

    const address = walletAddress;

    return msgToTemplateTransform(msg, {
      id: templateData?.wallet?.id || this.meta.wallet?.id,
      address,
      moduleName: this.meta.moduleName,
      ...templateData,
    });
  }

  private isTransportExists(transportFileName: string): boolean {
    return this.logger.transports.some((transport) => {
      if (transport instanceof winston.transports.File) {
        return transport.filename === transportFileName;
      }
      return false;
    });
  }

  private addTransport(level: string = 'info'): winston.transports.FileTransportInstance | null {
    const transportFile = new winston.transports.File({
      filename: this.buildPath(),
      level,
    });

    if (this.isTransportExists(transportFile.filename)) {
      console.error('Transport with the same filename already exists. Aborting.');
      return null;
    }

    this.logger.add(transportFile);

    return transportFile;
  }

  private removeTransport(transportFile: winston.transports.FileTransportInstance) {
    const hasTransport = this.logger.transports.indexOf(transportFile) !== -1;

    if (hasTransport) {
      this.logger.remove(transportFile);
    }
  }

  private devInfo(msg: string, templateData?: LoggerData): void {
    if (!settings.devMode) return;
    this.info(msg, templateData);
  }

  private devSuccess(msg: string, templateData?: LoggerData): void {
    if (!settings.devMode) return;
    this.success(msg, templateData);
  }

  private devWarning(msg: string, templateData?: LoggerData): void {
    if (!settings.devMode) return;
    this.warning(msg, templateData);
  }

  private devError(msg: string, templateData?: LoggerData): void {
    if (!settings.devMode) return;
    this.error(msg, templateData);
  }
}

export type LoggerType = Logger;
export default new Logger();
