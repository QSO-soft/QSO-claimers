import { BrowserContext, ElementHandle, Frame, Page } from 'patchright';

import settings from '../../_inputs/settings/settings';
import { getRandomNumber, sleep, sleepByRange } from '../../helpers';
import { LoggerData, LoggerType } from '../../logger';
import { NumberRange, OptionalPreparedProxyData } from '../../types';
import {
  ClickByCoordsProps,
  ClickProps,
  GetElementAttributeProps,
  GetElementProps,
  OpenPageCallback,
  TypeInInputOptions,
  WaitLocatorProps,
} from './types';

export class PlaywrightManager {
  private readonly browserContext: BrowserContext;
  private readonly logger: LoggerType;
  private readonly loggerTemplate: LoggerData;

  constructor(browserContext: BrowserContext, logger: LoggerType) {
    this.browserContext = browserContext;
    this.logger = logger;
    this.loggerTemplate = {
      action: 'PLAYWRIGHT',
    };
  }

  async getAllPages(): Promise<Page[]> {
    try {
      const pages = this.browserContext.pages();

      if (!pages?.length) {
        const err_message = 'No pages were found';
        this.logger.error(err_message, {
          ...this.loggerTemplate,
        });
        throw new Error(err_message);
      }

      return pages;
    } catch (err) {
      const err_message = this.logError(err, 'Error while retrieving pages from browser');
      throw new Error(err_message);
    }
  }

  async openPage(
    url?: string,
    cb?: OpenPageCallback,
    options: {
      disableStyles?: boolean;
      leaveImagesEnabled?: boolean;
      maxOpeningTime?: number;
      proxyObj?: OptionalPreparedProxyData;
    } = { maxOpeningTime: 90000 }
  ): Promise<Page> {
    try {
      this.logger.info(`Open new browser page with url: ${url}...`, this.loggerTemplate);

      const page = await this.browserContext.newPage();

      if (options.disableStyles) {
        await page.route('**/*', (route) => {
          const request = route.request();
          if (
            ['stylesheet', ...(options.leaveImagesEnabled ? [] : ['image', 'media']), 'font'].includes(
              request.resourceType()
            )
          ) {
            route.abort();
          } else {
            route.continue();
          }
        });
        await page.addStyleTag({
          content: `
            * {
                animation: none !important;
                transition: none !important;
            }
          `,
        });
      }

      if (options.proxyObj) {
        await page.route('**/*', (route) => {
          route.continue({
            headers: {
              ...route.request().headers(),
              'Proxy-Authorization': `Basic ${Buffer.from(
                `${options.proxyObj?.proxyLogin}:${options.proxyObj?.proxyPass}`
              ).toString('base64')}`,
            },
          });
        });
      }

      if (url) {
        await page.goto(url, {
          timeout: options.maxOpeningTime,
          // waitUntil: 'networkidle',
        });
      }
      cb?.(page, this.logger);

      return page;
    } catch (err) {
      const err_message = this.logError(err, `Error while opening new page with url ${url}`);
      throw new Error(err_message);
    }
  }

  async click(props: ClickProps): Promise<void> {
    const {
      page,
      frame,
      locator,
      maxAttempts = settings.maxAttempts,
      delayBetweenAttempts = 1,
      isRequired = true,
      delayToWaitElement = 30,
      showAttemptLog = false,
      clickCount = 1,
      hoverFirst = false,
      shadowLocator,
      delayToMove = getRandomNumber([100, 300]),
    } = props;

    this.logger.dev.info(`Click on an element with locator: ${locator}`, this.loggerTemplate);

    let isSuccessClick = false;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        let element;
        if (shadowLocator) {
          element =
            (await this.waitForShadowSelector(frame || page, locator, shadowLocator, delayToWaitElement * 1000)) ||
            null;
        } else {
          element = await (frame || page).waitForSelector(locator, {
            timeout: delayToWaitElement * 1000,
          });
        }

        if (hoverFirst) {
          const box = await element.boundingBox();
          if (box) {
            await sleepByRange([0.1, 0.3]);
            await page.mouse.move(box?.x + box.width / 2, box.y + box.height / 2);
          }
          await sleepByRange([0.1, 0.3]);

          await (frame || page).hover(locator, {
            timeout: delayToWaitElement * 1000,
          });
          await sleepByRange([0.1, 0.3]);
        }

        await (frame || page).click(locator, {
          timeout: delayToWaitElement * 1000,
          clickCount,
          delay: delayToMove,
        });

        isSuccessClick = true;
        break;
      } catch (err) {
        if (showAttemptLog) {
          this.logger.warning(`Attempt ${attempts + 1} of ${maxAttempts}`);
        }
      } finally {
        attempts++;
        await sleep(delayBetweenAttempts);
      }
    }

    if (!isSuccessClick && isRequired) {
      const err_message = `No element was found by locator: ${locator}`;
      this.logger.error(err_message, {
        ...this.loggerTemplate,
      });
      throw new Error(err_message);
    }
  }

  async clickByCoordinates(props: ClickByCoordsProps): Promise<void> {
    const {
      page,
      locator,
      maxAttempts = settings.maxAttempts,
      delayBetweenAttempts = 1,
      isRequired = true,
      delayToWaitElement = 30,
      showAttemptLog = false,
      clickCount = 1,
      shadowLocator,
    } = props;

    this.logger.dev.info(`Click on an element with locator: ${locator}`, this.loggerTemplate);

    let isSuccessClick = false;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        let element;
        if (shadowLocator) {
          element = (await this.waitForShadowSelector(page, locator, shadowLocator, delayToWaitElement * 1000)) || null;
        } else {
          element = await page.waitForSelector(locator, {
            timeout: delayToWaitElement * 1000,
          });
        }

        const box = (await element.boundingBox()) || { x: 0, y: 0, width: 0, height: 0 };
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;

        if (box) {
          await page.mouse.move(centerX, centerY);
        }

        await sleep(0.3);

        await page.hover(locator, {
          timeout: delayToWaitElement * 1000,
        });

        await page.mouse.click(centerX, centerY, {
          clickCount,
          delay: 300,
        });

        isSuccessClick = true;
        break;
      } catch (err) {
        if (showAttemptLog) {
          this.logger.warning(`Attempt ${attempts + 1} of ${maxAttempts}`);
        }
      } finally {
        attempts++;
        await sleep(delayBetweenAttempts);
      }
    }

    if (!isSuccessClick && isRequired) {
      const err_message = `No element was found by locator: ${locator}`;
      this.logger.error(err_message, {
        ...this.loggerTemplate,
      });
      throw new Error(err_message);
    }
  }

  async waitLocator(props: WaitLocatorProps): Promise<boolean> {
    const {
      locator,
      maxAttempts = 3,
      delayBetweenAttempts = 0.3,
      isRequired = true,
      delayToWaitElement = 3,
      showAttemptLog,
    } = props;

    this.logger.dev.info(`Wait locator ${locator}...`, this.loggerTemplate);

    let attempts = 0;
    let isDone = false;

    while (attempts < maxAttempts && !isDone) {
      try {
        await locator.waitFor({
          state: 'visible',
          timeout: delayToWaitElement * 1000,
        });

        if (showAttemptLog) {
          this.logger.warning(`Attempt ${attempts + 1} of ${maxAttempts}`);
        }

        isDone = true;
      } catch (err) {
        if (showAttemptLog) {
          this.logger.warning(`Attempt ${attempts + 1} of ${maxAttempts}`);
        }
      } finally {
        attempts++;
        await sleep(delayBetweenAttempts);
      }
    }

    if (!isDone && isRequired) {
      const err_message = `No element was found by locator: ${locator}`;
      this.logger.error(err_message, {
        ...this.loggerTemplate,
      });
      throw new Error(err_message);
    }

    return isDone;
  }

  async getElement(props: GetElementProps): Promise<ElementHandle | null> {
    const {
      page,
      frame,
      locator,
      max_attempts = settings.maxAttempts,
      delayBetweenAttempts = 0.3,
      isRequired = true,
      delayToWaitElement = 3,
      showAttemptLog = false,
      shadowLocator,
    } = props;

    this.logger.dev.info(`Searching element with locator: ${locator}`, this.loggerTemplate);

    let attempts = 0;
    let element: ElementHandle | null = null;

    while (attempts < max_attempts && element === null) {
      try {
        if (shadowLocator) {
          element =
            (await this.waitForShadowSelector(frame || page, locator, shadowLocator, delayToWaitElement * 1000)) ||
            null;
        } else {
          element = await (frame || page).waitForSelector(locator, {
            timeout: delayToWaitElement * 1000,
          });
        }

        if (element) {
          return element;
        }

        if (showAttemptLog) {
          this.logger.warning(`Attempt ${attempts + 1} of ${max_attempts}`);
        }
      } catch (err) {
        if (showAttemptLog) {
          this.logger.warning(`Attempt ${attempts + 1} of ${max_attempts}`);
        }
      } finally {
        attempts++;
        await sleep(delayBetweenAttempts);
      }
    }

    if (!element && isRequired) {
      const err_message = `No element was found by locator: ${locator}`;
      this.logger.error(err_message, {
        ...this.loggerTemplate,
      });
      throw new Error(err_message);
    }

    return element;
  }

  async waitForShadowSelector(
    frameOrPage: Page | Frame,
    shadowHostSelector: string,
    innerSelector: string,
    timeout = 3000
  ) {
    const shadowHost = await frameOrPage.waitForSelector(shadowHostSelector, { timeout });
    const shadowRoot = await shadowHost.evaluateHandle((host) => host.shadowRoot);
    const shadowRootElement = shadowRoot?.asElement();
    if (!shadowRootElement) {
      throw new Error(`Unable to get shadow element${shadowHostSelector}`);
    }
    return shadowRootElement.waitForSelector(innerSelector, { timeout });
  }

  async getElementWithRetry(
    page: Page,
    locator: string,
    max_attempts: number = settings.maxAttempts,
    delay: NumberRange = [0.3, 0.5]
  ): Promise<ElementHandle> {
    this.logger.dev.info(`Searching element with locator: ${locator}`, this.loggerTemplate);

    let attempts = 0;
    let element: ElementHandle | null = null;

    while (attempts < max_attempts && element === null) {
      try {
        element = await page.waitForSelector(locator, {
          timeout: getRandomNumber([2100, 1300]),
        });

        if (element) return element;

        this.logger.warning(`Attempt ${attempts + 1} of ${max_attempts}`);
      } catch (err) {
        this.logger.warning(`Attempt ${attempts + 1} of ${max_attempts}`);
      } finally {
        attempts++;
        await sleep(getRandomNumber(delay));
      }
    }

    if (!element) {
      const err_message = `No element was found by locator: ${locator}`;
      this.logger.error(err_message, {
        ...this.loggerTemplate,
      });
      throw new Error(err_message);
    }

    return element;
  }

  async getElementAttribute({ page, attribute, locator }: GetElementAttributeProps) {
    try {
      this.logger.dev.info(`Searching ${attribute} attribute of element with locator: ${locator}`, this.loggerTemplate);

      return page.getAttribute(locator, attribute);
    } catch (err) {
      const err_message = this.logError(err, `Unable to get ${attribute} for element with locator ${locator}`);
      throw new Error(err_message);
    }
  }

  async clearBrowser(saveFirstPage = false): Promise<void> {
    try {
      this.logger.info('Clearing browser...', this.loggerTemplate);
      const pages = await this.getAllPages();

      if (!pages?.length) return;

      const slicedPages = saveFirstPage ? pages.slice(1) : pages;
      const closingPromises = slicedPages.map(async (page) => page.close());
      await Promise.all(closingPromises);
    } catch (err) {
      const err_message = this.logError(err, 'Clearing browser failed');
      throw new Error(err_message);
    }
  }

  async closePage(page: Page): Promise<void> {
    try {
      this.logger.info('Closing page...', this.loggerTemplate);
      await page.close();
    } catch (err) {
      const err_message = this.logError(err, 'Closing page failed');
      throw new Error(err_message);
    }
  }

  async closeUnusedPages(pages: Page[]): Promise<void> {
    try {
      this.logger.info('Closing unused pages...', this.loggerTemplate);
      const closingUnusedPromises = pages.map(async (page, index) => {
        if (index) {
          await page.close();
        }
      });

      await Promise.all(closingUnusedPromises);
    } catch (err) {
      const err_message = this.logError(err, 'Closing unused pages failed');
      throw new Error(err_message);
    }
  }

  async findPageByValue(value: string, type: 'url' | 'title'): Promise<Page> {
    try {
      this.logger.dev.info(`Looking for page by value: ${value}`, this.loggerTemplate);

      const pages = await this.getAllPages();
      const pagePromises = pages.map(async (page) => {
        let result = '';
        if (type === 'title') {
          result = await page.title();
        } else if (type === 'url') {
          result = page.url();
        }

        return result.includes(value) && page;
      });
      const matchedPages = await Promise.all(pagePromises);
      const filteredPages = matchedPages.filter((page) => page) as Page[];

      if (!filteredPages?.length || !filteredPages[0]) {
        const err_message = '0 pages were found';
        this.logger.error(err_message, {
          ...this.loggerTemplate,
        });
        throw new Error(err_message);
      }

      if (filteredPages?.length > 1) {
        this.logger.info('Closing extra pages...', this.loggerTemplate);
        await this.closeUnusedPages(filteredPages);
      }

      return filteredPages[0];
    } catch (err) {
      const err_message = this.logError(err, 'Searching page failed');
      throw new Error(err_message);
    }
  }

  async clearInput(page: Page, locator: string) {
    try {
      const element = await this.getElementWithRetry(page, locator);
      this.logger.info(`Clearing input with locator: ${locator}`, this.loggerTemplate);
      await element.fill('');
    } catch (err) {
      const err_message = this.logError(err, 'Clearing input failed');
      throw new Error(err_message);
    }
  }

  async typeInInput({ page, locator, text, isRequired = true, waitTime = 3 }: TypeInInputOptions) {
    try {
      this.logger.dev.info(`Typing in input with locator: ${locator}`, this.loggerTemplate);

      await page.focus(locator);
      await sleepByRange([0.1, 0.5]);
      await page.fill(locator, text, {
        timeout: waitTime * 1000,
      });
    } catch (err) {
      if (isRequired) {
        const err_message = this.logError(err, 'Typing in input failed');
        throw new Error(err_message);
      }
    }
  }

  private logError(error: unknown, defaultMessage: string): string {
    const err_message = error instanceof Error ? error.message : defaultMessage;
    this.logger.error(err_message, this.loggerTemplate);
    return err_message;
  }
}
