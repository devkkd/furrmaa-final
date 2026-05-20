import Razorpay from 'razorpay';

/** Razorpay receipt max length is 40 characters. */
export function makeRazorpayReceipt(prefix = 'pay') {
  const safe = String(prefix).replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'pay';
  const receipt = `${safe}_${Date.now().toString(36)}`;
  return receipt.slice(0, 40);
}

export function formatRazorpayError(error, fallback = 'Razorpay request failed') {
  return (
    error?.error?.description ||
    error?.error?.reason ||
    error?.description ||
    error?.message ||
    fallback
  );
}

export function hasRazorpayConfig() {
  const id =
    process.env.RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZOR_PAY_KEY_ID?.trim();
  const secret =
    process.env.RAZORPAY_KEY_SECRET?.trim() ||
    process.env.RAZOR_PAY_KEY_SECRET?.trim();
  return Boolean(id && secret);
}

let instance = null;

/** Only construct when keys exist — avoids crashing server startup if Razorpay env is missing. */
export function getRazorpay() {
  if (!hasRazorpayConfig()) return null;
  if (!instance) {
    const keyId =
      process.env.RAZORPAY_KEY_ID?.trim() ||
      process.env.RAZOR_PAY_KEY_ID?.trim();
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET?.trim() ||
      process.env.RAZOR_PAY_KEY_SECRET?.trim();
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return instance;
}
