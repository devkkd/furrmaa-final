/**
 * Phone OTP SMS — Twilio (global) ya MSG91 (India). Env set nahi ho to SMS skip (sirf log).
 */
import axios from 'axios';

function toIndia91(tenDigits) {
  const d = String(tenDigits).replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return null;
  return `91${d}`;
}

/**
 * @returns {Promise<{ sent: boolean, provider?: string, error?: string }>}
 */
export async function sendOtpSms(phoneTenDigits, otp) {
  const mobile91 = toIndia91(phoneTenDigits);
  if (!mobile91) {
    return { sent: false, error: 'Invalid phone' };
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        To: `+${mobile91}`,
        From: twilioFrom,
        Body: `Your Furrmaa verification code is ${otp}. Do not share it with anyone.`,
      });
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        body.toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 15000,
        }
      );
      return { sent: true, provider: 'twilio' };
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Twilio failed';
      console.error('❌ Twilio SMS:', msg);
      return { sent: false, error: msg };
    }
  }

  const msg91Key = process.env.MSG91_AUTHKEY?.trim();
  const msg91Sender = process.env.MSG91_SENDER_ID?.trim() || 'VERIFY';
  if (msg91Key) {
    try {
      const text = `Your Furrmaa OTP is ${otp}. Valid for 5 minutes. Do not share.`;
      const url =
        'https://api.msg91.com/api/sendhttp.php?' +
        new URLSearchParams({
          authkey: msg91Key,
          mobiles: mobile91,
          message: text,
          sender: msg91Sender,
          route: process.env.MSG91_ROUTE?.trim() || '4',
          country: '91',
        }).toString();
      const { data } = await axios.get(url, { timeout: 15000 });
      const raw = String(data ?? '');
      if (raw.toLowerCase().includes('error') || raw === 'Invalid') {
        console.error('❌ MSG91 response:', raw);
        return { sent: false, error: raw };
      }
      return { sent: true, provider: 'msg91' };
    } catch (e) {
      const msg = e.response?.data || e.message || 'MSG91 failed';
      console.error('❌ MSG91 SMS:', msg);
      return { sent: false, error: String(msg) };
    }
  }

  return { sent: false, error: 'no_sms_provider' };
}
