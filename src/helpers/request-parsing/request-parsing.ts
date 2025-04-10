import { AxiosResponse } from 'axios';

export interface Cookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: Date;
  rawExpires?: string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  raw?: string;
  unparsed?: string[];
}

export function parseCookie(cookieString: string): Cookie {
  if (!cookieString || cookieString.trim() === '') {
    return {
      name: '',
      value: '',
      secure: false,
      httpOnly: false,
      sameSite: 'Lax',
    };
  }

  const parts = cookieString.split(';').map((part) => part.trim());
  const nameValue = parts[0];

  if (!nameValue || !nameValue.includes('=')) {
    return {
      name: '',
      value: '',
      secure: false,
      httpOnly: false,
      sameSite: 'Lax',
    };
  }

  const equalIndex = nameValue.indexOf('=');
  const name = nameValue.substring(0, equalIndex);
  const value = nameValue.substring(equalIndex + 1);

  const cookie: Cookie = {
    name: name ? decodeURIComponent(name.trim()) : '',
    value: value ? decodeURIComponent(value.trim()) : '',
    secure: false,
    httpOnly: false,
    sameSite: 'Lax',
  };

  const attributes = parts.slice(1);
  attributes.forEach((attribute) => {
    if (!attribute) return;

    const [attrName, attrValue] = attribute.split('=');
    if (!attrName) return;

    switch (attrName.trim().toLowerCase()) {
      case 'max-age':
        cookie.maxAge = attrValue ? parseInt(attrValue.trim()) : undefined;
        break;
      case 'path':
        cookie.path = attrValue?.trim();
        break;
      case 'domain':
        cookie.domain = attrValue?.trim();
        break;
      case 'samesite':
        if (attrValue) {
          const trimmedValue = attrValue.trim();
          if (trimmedValue === 'Strict' || trimmedValue === 'Lax' || trimmedValue === 'None') {
            cookie.sameSite = trimmedValue;
          }
        }
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'expires':
        if (attrValue) {
          const expiresDate = new Date(attrValue.trim());
          if (!isNaN(expiresDate.getTime())) {
            cookie.expires = expiresDate;
            cookie.rawExpires = expiresDate.toISOString();
          }
        }
        break;
    }
  });

  return cookie;
}

export function parseResponse(response: AxiosResponse): AxiosResponse & {
  body?: any;
  cookies?: Cookie[];
  redirectLocation?: string;
} {
  const result: {
    body?: any;
    cookies?: Cookie[];
    redirectLocation?: string;
  } = {};

  if (response.data !== undefined && response.data !== '') {
    result.body = response.data;
  } else {
    result.body = '';
  }

  if (response.headers['location']) result.redirectLocation = response.headers['location'];
  if (response.headers['set-cookie']) result.cookies = response.headers['set-cookie'].map(parseCookie);
  try {
    if (typeof result.body === 'string' && result.body) result.body = JSON.parse(result.body);
  } catch (e) {
    /* empty */
  }

  return { ...response, ...result };
}

export function parseUrlParams(url: string): Record<string, string> {
  const result: Record<string, string> = {};

  try {
    const parsedUrl = new URL(url);
    for (const [key, value] of parsedUrl.searchParams.entries()) result[key] = value;
  } catch (error) {
    /* empty */
  }

  return result;
}
