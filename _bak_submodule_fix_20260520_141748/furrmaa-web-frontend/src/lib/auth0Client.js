'use client';

/**
 * Auth0 SPA client — Google / Apple via Auth0 connections (same backend JWT verification path as mobile).
 */

export function isAuth0WebConfigReady() {
  return !!(process.env.NEXT_PUBLIC_AUTH0_DOMAIN && process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID);
}

let clientPromise;

function resolveCreateAuth0Client(mod) {
  if (typeof mod === 'function') return mod;
  if (typeof mod?.default === 'function') return mod.default;
  if (typeof mod?.createAuth0Client === 'function') return mod.createAuth0Client;
  throw new Error('Auth0 SDK import failed');
}

export async function getAuth0SpaClient() {
  if (typeof window === 'undefined') return null;
  if (!isAuth0WebConfigReady()) return null;

  if (!clientPromise) {
    const mod = await import('@auth0/auth0-spa-js');
    const createAuth0Client = resolveCreateAuth0Client(mod);
    const redirect_uri = `${window.location.origin}/login`;

    clientPromise = createAuth0Client({
      domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
      clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri,
        scope: 'openid profile email',
        ...(process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
          ? { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE }
          : {}),
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
    });
  }

  return clientPromise;
}

function loginRedirectOptions(connection, returnTo = '/account') {
  return {
    authorizationParams: { connection },
    appState: { returnTo },
  };
}

export async function auth0LoginWithGoogle(returnTo = '/account') {
  const client = await getAuth0SpaClient();
  if (!client) throw new Error('Auth0 is not configured');
  const connection = process.env.NEXT_PUBLIC_AUTH0_CONNECTION_GOOGLE || 'google-oauth2';
  await client.loginWithRedirect(loginRedirectOptions(connection, returnTo));
}

export async function auth0LoginWithApple(returnTo = '/account') {
  const client = await getAuth0SpaClient();
  if (!client) throw new Error('Auth0 is not configured');
  const connection = process.env.NEXT_PUBLIC_AUTH0_CONNECTION_APPLE || 'apple';
  await client.loginWithRedirect(loginRedirectOptions(connection, returnTo));
}

/** After Auth0 redirect — returns access token + optional return path from appState */
export async function completeAuth0RedirectLogin() {
  const client = await getAuth0SpaClient();
  if (!client) throw new Error('Auth0 is not configured');
  const result = await client.handleRedirectCallback();
  const token = await client.getTokenSilently({
    authorizationParams: {
      audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || undefined,
    },
  });
  return {
    token,
    returnTo: result?.appState?.returnTo || '/account',
  };
}
