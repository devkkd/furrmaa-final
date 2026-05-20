import Wallet from '../models/Wallet.model.js';

/**
 * Credit user wallet when an order is marked returned/refunded (once per order).
 */
export async function creditWalletForOrderRefund(order) {
  if (!order?.user || !order?.totalAmount) {
    return { credited: false, reason: 'invalid_order' };
  }
  if (order.refundCreditedAt) {
    return { credited: false, reason: 'already_credited' };
  }

  const refundableMethods = ['wallet', 'razorpay', 'card', 'upi', 'cash'];
  if (!refundableMethods.includes(order.paymentMethod)) {
    return { credited: false, reason: 'payment_method_not_eligible' };
  }

  const amount = Number(order.totalAmount);
  if (!amount || amount <= 0) {
    return { credited: false, reason: 'invalid_amount' };
  }

  let wallet = await Wallet.findOne({ user: order.user });
  if (!wallet) {
    wallet = await Wallet.create({ user: order.user, balance: 0 });
  }

  wallet.transactions.push({
    type: 'credit',
    amount,
    description: `Refund for order #${order._id.toString().slice(-6).toUpperCase()}`,
    order: order._id,
    paymentMethod: 'refund',
    status: 'completed',
  });
  wallet.balance += amount;
  await wallet.save();

  order.paymentStatus = 'refunded';
  order.refundCreditedAt = new Date();
  await order.save();

  return { credited: true, balance: wallet.balance, amount };
}
