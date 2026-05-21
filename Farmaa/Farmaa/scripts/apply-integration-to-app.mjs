/**
 * Copy .integration-backup -> Farmaa/src (this app folder)
 * Run from repo root: node Farmaa/scripts/apply-integration-to-app.mjs
 * Or from Farmaa/: node scripts/apply-integration-to-app.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const backupRoot = path.resolve(appRoot, '..', '.integration-backup');

const files = [
  'config/api.js',
  'services/cartService.ts',
  'services/razorpayPayment.ts',
  'context/AuthContext.tsx',
  'navigation/AppNavigator.tsx',
  'screens/ecommerce/CartScreen.tsx',
  'screens/ecommerce/CheckoutScreen.tsx',
  'screens/ecommerce/ReturnOrderScreen.tsx',
  'screens/ecommerce/OrderDetailScreen.tsx',
  'screens/profile/SupportChatScreen.tsx',
  'screens/profile/WalletScreen.tsx',
  'screens/profile/WithdrawWalletScreen.tsx',
  'screens/profile/RechargeWalletScreen.tsx',
  'screens/profile/PetProfileScreen.tsx',
  'screens/profile/ProfileScreen.tsx',
  'screens/profile/SubscriptionScreen.tsx',
  'screens/profile/OrdersScreen.tsx',
  'screens/healthcare/PetHealthScreen.tsx',
  'screens/explore/ExploreScreen.tsx',
  'screens/hope/HopeDetailScreen.tsx',
  'screens/training/SubscriptionScreen.tsx',
];

const appSrc = path.join(appRoot, 'src');
for (const rel of files) {
  const from = path.join(backupRoot, 'src', rel);
  const to = path.join(appSrc, rel);
  if (!fs.existsSync(from)) {
    console.warn('skip:', rel);
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log('ok', rel);
}
console.log('Done ->', appSrc);
