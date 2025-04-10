import { Cookie } from './request-parsing/request-parsing';

interface CookieManagerCookies {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  size: number;
  httpOnly: boolean;
  secure: boolean;
  session: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  priority?: 'Low' | 'Medium' | 'High';
  sameParty?: boolean;
  sourceScheme?: 'Unset' | 'NonSecure' | 'Secure';
  partitionKey?:
    | {
        sourceOrigin: string;
        hasCrossSiteAncestor?: boolean;
      }
    | string;
  partitionKeyOpaque?: boolean;
}

export class CookieManager {
  private _cookies: CookieManagerCookies[] = [];

  public get cookies(): Cookie[] {
    return this._cookies?.map((el) => ({ name: el.name, value: el.value }));
  }

  public get fullCookies(): CookieManagerCookies[] {
    return this._cookies;
  }

  public get rawCookies(): string {
    return this._cookies?.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
  }

  public editCookie(
    cookies: Partial<CookieManagerCookies>[] | Partial<Cookie>[] | undefined,
    deleteFlag: boolean = false
  ) {
    if (!cookies) return;
    cookies?.forEach((cookie) => {
      const existingCookieIndex = this._cookies.findIndex((c) => c.name === cookie.name);
      if (deleteFlag) {
        if (existingCookieIndex !== -1) this._cookies.splice(existingCookieIndex, 1);
      } else {
        if (existingCookieIndex !== -1)
          this._cookies[existingCookieIndex] = <CookieManagerCookies>{
            ...this._cookies[existingCookieIndex],
            ...cookie,
          };
        else this._cookies.push(cookie as CookieManagerCookies);
      }
    });
  }

  public getCookieValueByName(name: string): string {
    return this._cookies.find((el) => el.name === name)?.value || '';
  }
}
