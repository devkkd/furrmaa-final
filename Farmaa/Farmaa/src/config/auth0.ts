/**
 * furmma-frontend `.env.local` jaisi values.
 *
 * ── Auth0 "Callback URL mismatch" fix ─────────────────────────────────────
 * Dashboard → Applications → isi Client ID wali app → Settings:
 *
 * Allowed Callback URLs (dono lines ek hi field me comma-separated):
 *   com.furmaa.auth0://dev-63qpc7fix57kiy31.us.auth0.com/android/com.furmaa/callback,
 *   org.reactjs.native.example.farmaa.auth0://dev-63qpc7fix57kiy31.us.auth0.com/ios/org.reactjs.native.example.farmaa/callback
 *
 * Allowed Logout URLs: upar wale dono URLs same paste karo.
 *
 * iOS Bundle ID agar Xcode me alag ho (General → Bundle Identifier) to path me
 * wahi lowercase ID use karo, pehla segment `$(ID).auth0://` scheme bhi wahi.
 *
 * SPA app custom scheme save na kare to: naya "Native" application banao,
 * usme ye URLs + yehi Audience; Native ka Client ID yahan AUTH0_CLIENT_ID me lagao.
 */
export const AUTH0_DOMAIN = 'dev-63qpc7fix57kiy31.us.auth0.com';
export const AUTH0_CLIENT_ID = 'Nv3coceaBxKIGEmeqkXeUNRXg0BT5YD4';
export const AUTH0_AUDIENCE = 'https://api.furmaa.com';

/** Auth0 → Authentication → Database → connection name (default) */
export const AUTH0_EMAIL_CONNECTION = 'Username-Password-Authentication';

export function isAuth0Configured(): boolean {
  return Boolean(
    AUTH0_DOMAIN?.trim() &&
      AUTH0_CLIENT_ID?.trim() &&
      AUTH0_AUDIENCE?.trim()
  );
}
