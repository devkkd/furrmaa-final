import axios from 'axios';

const getConfig = () => ({
  accessToken: process.env.ZOHO_INVENTORY_ACCESS_TOKEN || '',
  clientId: process.env.ZOHO_INVENTORY_CLIENT_ID || '',
  clientSecret: process.env.ZOHO_INVENTORY_CLIENT_SECRET || '',
  refreshToken: process.env.ZOHO_INVENTORY_REFRESH_TOKEN || '',
  organizationId: process.env.ZOHO_INVENTORY_ORG_ID || '',
  baseUrl: process.env.ZOHO_INVENTORY_BASE_URL || 'https://www.zohoapis.in',
  accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in',
});

function isConfigured() {
  const cfg = getConfig();
  const hasTokenMode = Boolean(cfg.accessToken);
  const hasRefreshMode = Boolean(cfg.clientId && cfg.clientSecret && cfg.refreshToken);
  return Boolean(cfg.organizationId && (hasTokenMode || hasRefreshMode));
}

function formatDate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

let cachedAccessToken = '';
let cachedAccessTokenExpiresAt = 0;

async function getAccessToken() {
  const cfg = getConfig();
  if (!isConfigured()) throw new Error('Zoho Inventory is not configured');
  if (cfg.accessToken) return cfg.accessToken;
  const now = Date.now();
  if (cachedAccessToken && now < cachedAccessTokenExpiresAt) return cachedAccessToken;
  const tokenRes = await axios({
    method: 'post',
    url: `${cfg.accountsUrl}/oauth/v2/token`,
    params: {
      refresh_token: cfg.refreshToken,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: 'refresh_token',
    },
    timeout: 15000,
  });
  const token = tokenRes?.data?.access_token;
  const expiresIn = Number(tokenRes?.data?.expires_in || 3600);
  if (!token) throw new Error('Failed to refresh Zoho access token');
  cachedAccessToken = token;
  cachedAccessTokenExpiresAt = Date.now() + Math.max(30, expiresIn - 120) * 1000;
  return cachedAccessToken;
}

async function zohoRequest(method, path, params = {}, data = undefined) {
  const cfg = getConfig();
  if (!isConfigured()) throw new Error('Zoho Inventory is not configured');
  const token = await getAccessToken();
  const url = `${cfg.baseUrl}${path}`;
  try {
    const res = await axios({
      method,
      url,
      params: { organization_id: cfg.organizationId, ...params },
      data,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
    return res.data;
  } catch (error) {
    const status = error?.response?.status;
    const canRetry = !cfg.accessToken && (status === 401 || status === 403);
    if (!canRetry) throw error;
    cachedAccessToken = '';
    cachedAccessTokenExpiresAt = 0;
    const retryToken = await getAccessToken();
    const retry = await axios({
      method,
      url,
      params: { organization_id: cfg.organizationId, ...params },
      data,
      headers: {
        Authorization: `Zoho-oauthtoken ${retryToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
    return retry.data;
  }
}

export async function pushOrderToZoho(order) {
  const line_items = (order.items || []).map((item) => ({
    name: item?.product?.name || `Product-${item?.product || ''}`.slice(0, 100),
    description: item?.product?.description || '',
    rate: Number(item?.price || 0),
    quantity: Number(item?.quantity || 1),
  }));
  const payload = {
    customer_name: order?.shippingAddress?.name || 'Furrmaa Customer',
    reference_number: `FM-${order._id}`,
    date: formatDate(order.createdAt || new Date()),
    line_items,
    shipping_charge: Number(order.deliveryFee || 0),
    notes: order.notes || '',
  };
  const data = await zohoRequest('post', '/inventory/v1/salesorders', {}, payload);
  return {
    salesOrderId: data?.salesorder?.salesorder_id,
    salesOrderNumber: data?.salesorder?.salesorder_number,
  };
}

export async function fetchZohoShippingStatus(salesOrderId) {
  const data = await zohoRequest('get', `/inventory/v1/salesorders/${salesOrderId}`);
  const so = data?.salesorder || {};
  const packageItem = (so.packages && so.packages[0]) || {};
  return {
    packageId: packageItem.package_id || '',
    shipmentId: packageItem.shipment_id || '',
    trackingNumber: packageItem.tracking_number || '',
    trackingUrl: packageItem.tracking_url || '',
    status: so.status || packageItem.status || 'unknown',
  };
}

export async function syncZohoShippingForOrder(order) {
  if (!isConfigured()) {
    return {
      syncStatus: 'failed',
      syncError: 'Zoho Inventory credentials missing in .env',
    };
  }
  try {
    let salesOrderId = order?.zohoShipping?.salesOrderId;
    let salesOrderNumber = order?.zohoShipping?.salesOrderNumber;
    if (!salesOrderId) {
      const created = await pushOrderToZoho(order);
      salesOrderId = created.salesOrderId;
      salesOrderNumber = created.salesOrderNumber;
    }
    const shipping = salesOrderId ? await fetchZohoShippingStatus(salesOrderId) : {};
    return {
      salesOrderId: salesOrderId || '',
      salesOrderNumber: salesOrderNumber || '',
      ...shipping,
      syncStatus: 'success',
      syncError: '',
      lastSyncAt: new Date(),
    };
  } catch (error) {
    return {
      syncStatus: 'failed',
      syncError: error.message || 'Zoho sync failed',
      lastSyncAt: new Date(),
    };
  }
}

export const zohoInventoryConfigured = isConfigured;
