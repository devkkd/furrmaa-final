import Auth0 from 'react-native-auth0';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, isAuth0Configured } from './auth0';

let _client: Auth0 | null = null;

export function getAuth0Client(): Auth0 | null {
  if (!isAuth0Configured()) {
    return null;
  }
  if (!_client) {
    _client = new Auth0({
      domain: AUTH0_DOMAIN.trim(),
      clientId: AUTH0_CLIENT_ID.trim(),
    });
  }
  return _client;
}
