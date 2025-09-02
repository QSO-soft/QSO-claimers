import net from 'net';

import axios from 'axios';
import { FingerprintGenerator } from 'fingerprint-generator';
import { FingerprintInjector } from 'fingerprint-injector';
import { BrowserContext } from 'patchright';
import type { BrowserContext as PWContext } from 'playwright-core';
import { chromium } from 'playwright-extra';
import { anonymizeProxy } from 'proxy-chain';
import stealth from 'puppeteer-extra-plugin-stealth';

import settings from '../../_inputs/settings/settings';
import { BASE_TIMEOUT } from '../../constants';
import { getAxiosConfig, retry } from '../../helpers';
import { LoggerType } from '../../logger';
import { OptionalPreparedProxyData, ProxyAgent } from '../../types';
import { cleanOldPlaywrightProfiles, getPlaywrightProfilePath } from './helpers';
import { PlaywrightManager } from './playwright';

chromium.use(stealth());

export interface PlaywrightInstance {
  browserContext: BrowserContext;
  playwright: PlaywrightManager;
  clearProfile: () => Promise<void>;
}

export async function getFreePort(): Promise<number> {
  return new Promise((res) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as any).port;
      srv.close((err) => res(port));
    });
  });
}

type InitPlaywrightParams = {
  logger: LoggerType;
  proxyObject?: OptionalPreparedProxyData;
  proxyAgent?: ProxyAgent;
  extensionPaths?: string[];
  loadArgs?: string[];
  withMobile?: boolean;
  walletAddress: string;
};
export const initPlaywright = async ({
  logger,
  proxyObject,
  proxyAgent,
  extensionPaths,
  withMobile = false,
  loadArgs = [],
  walletAddress,
}: InitPlaywrightParams): Promise<PlaywrightInstance> => {
  let browserContext: BrowserContext | null = null;
  let playwright: PlaywrightManager | null = null;

  await retry({
    callback: async () => {
      // const mobileDevices = Object.entries(devices)
      //   .filter(
      //     ([name, device]) =>
      //       (name.includes('Galaxy') ||
      //         name.includes('iPhone') ||
      //         name.includes('iPad') ||
      //         name.includes('Pixel') ||
      //         name.includes('Microsoft') ||
      //         name.includes('Nexus')) &&
      //       device.defaultBrowserType === 'chromium'
      //   )
      //   .map(([_, device]) => device);

      // const useMobile = getRandomBoolean();
      // const device = useMobile ? getRandomItemFromArray(mobileDevices) : devices['Desktop Chrome'];

      // const userAgentData = new UserAgent({
      //   deviceCategory: device.isMobile
      //     ? device.viewport.width >= 768 || device.viewport.height >= 768
      //       ? 'tablet'
      //       : 'mobile'
      //     : 'desktop',
      //   // viewportHeight: device.viewport.height,
      //   // viewportWidth: device.viewport.width,
      //   // "vendor": "Google Inc.",
      // });
      // const userAgent = userAgentData.toString();

      await closeBrowserContext(browserContext, walletAddress);

      let proxyServer = '';
      let proxyArgs: string[] = [];
      if (proxyObject) {
        // proxyServer = `${proxyObject.proxyType.toLowerCase()}://${proxyObject.proxyIp}:${proxyObject.proxyPort}`;

        const port = await getFreePort();
        proxyServer = await anonymizeProxy({
          port,
          url: proxyObject.url,
        });
        // args.push(`--proxy-server=${proxyServer}`);

        proxyArgs = [
          `--proxy-server=${proxyServer}`,
          // `--proxy-auth=${proxyObject.proxyLogin}:${proxyObject.proxyPass}`,
        ];
      }

      const ipData = await getIpData(proxyAgent);
      const { latitude, longitude } = randomizeCoordinates(ipData.latitude, ipData.longitude);

      const fg = new FingerprintGenerator({});

      const { headers, fingerprint } = fg.getFingerprint({
        ...(!withMobile && {
          screen: {
            minWidth: 1200,
            maxWidth: 2048,
          },
        }),
        locales: ['en-US'],
        devices: withMobile ? ['desktop', 'mobile'] : ['desktop'],
        operatingSystems: withMobile ? ['windows', 'macos', 'linux', 'android', 'ios'] : ['windows', 'macos', 'linux'],
        browsers: [{ name: 'chrome', maxVersion: 128 }],
      });

      const profilePath = getPlaywrightProfilePath(walletAddress);

      browserContext = (await chromium.launchPersistentContext(profilePath, {
        // browserContext = await browser.newContext({

        executablePath: settings.playwrightExecutablePath,
        // executablePath: PLAYWRIGHT_CHROME_PATH ? PLAYWRIGHT_CHROME_PATH : undefined,
        headless: !settings.showExecution,
        timeout: BASE_TIMEOUT,
        args: [
          ...(extensionPaths
            ? [
                `--disable-extensions-except=${extensionPaths.join(',')}`,
                `--load-extension=${extensionPaths.join(',')}`,
              ]
            : []),
          // ...proxyArgs,
          ...loadArgs,
          ...(!settings.showExecution ? ['--headless=new'] : []),
          '--lang=en-US,en;q=0.9', // язык

          '--force-webrtc-ip-handling-policy=disable_non_proxied_udp', // запрещает не‑проксированные UDP‑пути, тем самым предотвращая утечку IP через WebRTC
          '--disable-features=Translate,ReducedReferrerGranularity', // отключает Google Translator, возвращает старый более уникальный Referer

          '--disable-renderer-backgrounding', // фоновые задачи не тормозят при множестве инстансов/вкладок; стабильнее тайминги
          '--no-first-run', // отключает первый мастер‑запуска (onboarding)
          '--no-default-browser-check', // не спрашивает «сделать браузер по умолчанию»
          '--disable-dev-shm-usage', // снижает шанс падений из‑за маленького SHM

          // '--disable-background-networking', // вырубает фоновые сетевые активности Chrome (experiments, variations, pings)
          // '--disable-background-timer-throttling', // не душит таймеры во вкладках в фоне (полезно для стабильных скриптов)

          // '--disable-infobars', // устаревший флаг
          // '--blink-settings=imagesEnabled=false', // вырубает картинки, легко заметно и ломает разметку, хорошо лишь для «голого» API‑скрапинга
          // '--disable-gpu', // для headless обычно не нужен, меняет WebGL/рендер‑capabilities (драйверы исчезают), что часто повышает детектируемость
          // '--no-sandbox', // полностью вырубает песочницу (небезопасно; только для CI, если без вариантов)
          // '--disable-setuid-sandbox', // хак для контейнеров/CI без user‑ns (не секуьюрно)
          // '--disable-web-security', // отключает CORS/SOP (крайняя мера для отладки; палится)
          // '--disable-features=IsolateOrigins,site-per-process', // отключает Site Isolation (делает браузер «не как у людей», детектится)
          // '--disable-webrtc', // лучше использовать force-webrtc-ip-handling-policy
          // '--enable-privacy-sandbox-ads-apis', // принудительно включает Ads/Attribution/Topics (Privacy Sandbox), В обычном профиле это и так управляется экспериментами/настройками
          // '--enable-webgl', // форсит наличие WebGL, в старом headless это помогало, в «new headless» WebGL обычно и так есть

          // Disable with stealth
          // '--enable-automation', // добавляет маркеры автоматизации (раньше ставил navigator.webdriver и др.)
          // '--disable-blink-features=AutomationControlled', // популярный трюк для Puppeteer/Stealth, чтобы скрыть часть следов автоматизации
        ],

        // channel: 'chrome',
        locale: 'en-US',

        ...(proxyServer
          ? {
              proxy: {
                server: proxyServer,
                // username: proxyObject.proxyLogin,
                // password: proxyObject.proxyPass,
              },
            }
          : {}),

        userAgent: headers['user-agent'],
        viewport: {
          width: fingerprint.screen.width,
          height: fingerprint.screen.height,
        },

        permissions: ['geolocation'],
        geolocation: { latitude, longitude },
        timezoneId: ipData.timezoneId,
      })) as BrowserContext;

      const injector = new FingerprintInjector();
      await injector.attachFingerprintToPlaywright(browserContext as PWContext, { fingerprint, headers });

      if (!browserContext) throw new Error('Unable to launch browser');

      await browserContext.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        // 'User-Agent': userAgent,
      });

      playwright = new PlaywrightManager(browserContext, logger);

      return true;
    },
    logger,
    maxAttempts: 3,
    baseDelayMs: settings.delay.betweenRetries,
  });

  if (!browserContext || !playwright) {
    throw new Error('Something went wrong with browser context or playwright init');
  }

  return {
    browserContext: browserContext as BrowserContext,
    playwright: playwright as PlaywrightManager,
    clearProfile: async () => {},
  };
};

export async function closeBrowserContext(browserContext: BrowserContext | null, walletAddress: string) {
  await browserContext?.close().catch(() => void 0);
  cleanOldPlaywrightProfiles(walletAddress);
}

export const randomizeCoordinates = (lat: number, lon: number, meters = 500) => {
  const dLat = ((Math.random() - 0.5) * 2 * meters) / 110540; // ~м/град широты
  const dLon = ((Math.random() - 0.5) * 2 * meters) / (111320 * Math.cos((lat * Math.PI) / 180));
  return { latitude: lat + dLat, longitude: lon + dLon };
};

export const getIpData = async (proxyAgent?: ProxyAgent) => {
  const config = await getAxiosConfig({
    proxyAgent,
    withoutAbort: true,
  });
  const { data } = await axios.get('https://ipwho.is', config);

  return {
    ip: data.ip,
    latitude: data.latitude,
    longitude: data.longitude,
    timezoneId: data.timezone.id,
  };
};
