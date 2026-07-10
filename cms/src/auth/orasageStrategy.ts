import type { AuthStrategy } from 'payload';
import { generatePayloadCookie, getFieldsToSign, jwtSign } from 'payload';

import { readCookie, resolveUserFromOrasageToken } from './orasageSso';

const JWT_COOKIE = process.env.JWT_COOKIE_NAME || 'orasage_token';

/** 使用 orasage_token（auth-service 签发，运营员工角色）单点登录 CMS */
export const orasageAuthStrategy: AuthStrategy = {
  name: 'orasage-jwt',
  authenticate: async ({ canSetHeaders, headers, payload }) => {
    const token = readCookie(headers.get('cookie') ?? '', JWT_COOKIE);
    const doc = await resolveUserFromOrasageToken(payload, token);
    if (!doc) return { user: null };

    const user = {
      ...doc,
      collection: 'users',
    };

    const usersConfig = payload.collections.users.config;
    const fieldsToSign = getFieldsToSign({
      collectionConfig: usersConfig,
      email: typeof doc.email === 'string' ? doc.email : '',
      user: user as Parameters<typeof getFieldsToSign>[0]['user'],
    });
    const { token: payloadToken } = await jwtSign({
      fieldsToSign,
      secret: payload.secret,
      tokenExpiration: usersConfig.auth.tokenExpiration,
    });

    if (!canSetHeaders || !payloadToken) {
      return { user: user as AuthStrategyResultUser };
    }

    const cookie = generatePayloadCookie({
      collectionAuthConfig: usersConfig.auth,
      cookiePrefix: payload.config.cookiePrefix,
      token: payloadToken,
    });
    const responseHeaders = new Headers();
    responseHeaders.append('Set-Cookie', cookie);

    return { user: user as AuthStrategyResultUser, responseHeaders };
  },
};

type AuthStrategyResultUser = Extract<
  Awaited<ReturnType<NonNullable<AuthStrategy['authenticate']>>>,
  { user: unknown }
>['user'];
