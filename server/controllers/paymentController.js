const stripe = require('../config/stripe');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');

// @desc    Create Stripe Payment Intent for top-up
// @route   POST /api/payments/topup/intent
// @access  Private
exports.createTopUpIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum top up amount is ₹100'
      });
    }

    const amountInPaise = amount * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr',
      metadata: {
        userId: req.user._id.toString(),
        type: 'wallet_topup'
      }
    });

    console.log(`[Stripe] 🛒 Created PaymentIntent: ${paymentIntent.id} for ₹${amount}`);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe Intent Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payment service temporarily unavailable. Please try again.'
    });
  }
};

// @desc    Handle Stripe Webhook for payment confirmation
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  console.log(`[Stripe Webhook] 🔔 Received request at ${new Date().toISOString()}`);

  try {
    // req.body should be a Buffer from express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(`[Stripe Webhook] ✅ Verified signature. Event Type: ${event.type}`);
  } catch (err) {
    console.error(`[Stripe Webhook] ❌ Signature Verification Failed: ${err.message}`);
    console.error(`[Stripe Webhook] Secret used: ${endpointSecret?.substring(0, 8)}...`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    console.log(`[Stripe Webhook] 💰 PaymentIntent Succeeded: ${paymentIntent.id}`);
    console.log(`[Stripe Webhook] 🏷️ Metadata:`, paymentIntent.metadata);

    // Only process wallet topups
    if (paymentIntent.metadata && paymentIntent.metadata.type === 'wallet_topup') {
      const userId = paymentIntent.metadata.userId;
      const amountPaise = paymentIntent.amount;
      const amountRupees = amountPaise / 100;

      console.log(`[Stripe Webhook] 👤 User: ${userId} | Amount: ₹${amountRupees}`);

      try {
        // Idempotency: skip if we've already logged this payment ID
        const existingTx = await Transaction.findOne({ 'metadata.paymentIntentId': paymentIntent.id });
        if (existingTx) {
          console.log(`[Stripe Webhook] ⚠️ Already processed transaction: ${paymentIntent.id}`);
          return res.status(200).json({ received: true });
        }

        // 1. Create Official Transaction Record (Audit Trail)
        await Transaction.create({
          userId: userId,
          type: 'TOPUP',
          amount: amountRupees,
          description: `Wallet top up via Stripe`,
          metadata: {
            paymentIntentId: paymentIntent.id,
            paymentMethod: paymentIntent.payment_method_types?.[0] || 'stripe'
          }
        });

        // 2. Update User Balance and Local History
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $inc: { walletBalance: amountRupees },
            $push: {
              walletTransactions: {
                type: 'Money Added',
                amount: amountRupees,
                description: 'Wallet top up via Stripe',
                paymentIntentId: paymentIntent.id,
                createdAt: new Date()
              }
            }
          },
          { returnDocument: 'after' }
        );

        if (updatedUser) {
          console.log(`[Stripe Webhook] 🎉 Wallet Successfully Credited. New Balance: ₹${updatedUser.walletBalance}`);
        } else {
          console.log(`[Stripe Webhook] ❌ FAILED: User ${userId} could not be found to credit balance.`);
        }

      } catch (processErr) {
        console.error('[Stripe Webhook] 💥 Internal Processing Error:', processErr.message);
      }
    }
  }

  // Always return 200 to Stripe to acknowledge receipt
  res.status(200).json({ received: true });
};

// @desc    Get user's wallet statement/transactions
// @route   GET /api/payments/wallet/statement
// @access  Private
exports.getWalletStatement = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance walletTransactions');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Fetch from the official Transaction collection
    const officialTxs = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // 2. Map backend record types to frontend UI labels for consistency
    const formattedTxs = officialTxs.map(t => ({
      type: t.type === 'TOPUP' ? 'Money Added' : 
            t.type === 'RIDE_EARNING' ? 'Ride Earning' : 
            t.type === 'RIDE_PAYMENT' ? 'Ride Payment' :
            t.type === 'COMMISSION' ? 'Commission' : 
            t.type === 'WITHDRAWAL' ? 'Withdrawal' : 
            t.type === 'REFUND' ? 'Refund' : 
            t.type === 'SUBSIDY' ? 'Justice Subsidy' : t.type,
      amount: t.amount,
      description: t.description,
      createdAt: t.createdAt,
      paymentIntentId: t.metadata?.paymentIntentId || null
    }));

    // 3. Fallback: Include any legacy transactions stored directly on user object that aren't in formattedTxs
    const legacyTxs = (user.walletTransactions || []).map(t => t.toObject ? t.toObject() : t);
    const combined = [...formattedTxs];
    
    // Deduplication based on paymentIntentId
    legacyTxs.forEach(lt => {
      const isDuplicate = lt.paymentIntentId && formattedTxs.some(ft => ft.paymentIntentId === lt.paymentIntentId);
      if (!isDuplicate) {
        combined.push({
          type: lt.type,
          amount: lt.amount,
          description: lt.description,
          createdAt: lt.createdAt,
          paymentIntentId: lt.paymentIntentId
        });
      }
    });

    // Final sort: Newest first
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      balance: user.walletBalance,
      transactions: combined
    });
  } catch (error) {
    console.error('Statement Fetch Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate financial statement.' });
  }
};

// @desc    Request withdrawal to UPI
// @route   POST /api/payments/withdraw
// @access  Private
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, upiId } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal is ₹100' });
    }

    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid UPI ID (e.g. name@okaxis)' });
    }

    const user = await User.findById(req.user._id);

    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    // 1. Create Payout Request Record
    const payout = await Payout.create({
      userId: user._id,
      amount,
      upiId,
      status: 'pending'
    });

    // 2. Deduct from User Wallet Immediately (Hold)
    user.walletBalance -= amount;
    
    // 3. Create Transaction Record
    await Transaction.create({
      userId: user._id,
      type: 'WITHDRAWAL',
      amount: -amount,
      description: `Withdrawal Request - UPI: ${upiId}`,
      metadata: {
        payoutId: payout._id,
        method: 'UPI'
      }
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted! Funds will be settled to your UPI within 24 hours.',
      data: payout
    });

  } catch (error) {
    console.error('Withdrawal Request Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process withdrawal request.' });
  }
};

// @desc    Get all payout requests (Admin only)
// @route   GET /api/payments/payouts
// @access  Private (Admin)
exports.getPayoutRequests = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payouts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payout requests.' });
  }
};

// @desc    Update payout status (Admin only)
// @route   PUT /api/payments/payouts/:id
// @access  Private (Admin)
exports.updatePayoutStatus = async (req, res) => {
  try {
    const { status, adminNote, transactionId } = req.body;
    const payout = await Payout.findById(req.params.id);

    if (!payout) return res.status(404).json({ success: false, message: 'Payout request not found' });

    if (payout.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be updated' });
    }

    payout.status = status;
    payout.adminNote = adminNote || payout.adminNote;
    payout.transactionId = transactionId || payout.transactionId;

    // If rejected, refund the money back to user wallet
    if (status === 'rejected') {
      const user = await User.findById(payout.userId);
      user.walletBalance += payout.amount;
      
      await Transaction.create({
        userId: user._id,
        type: 'REFUND',
        amount: payout.amount,
        description: `Refund - Rejected withdrawal request`,
        metadata: { payoutId: payout._id }
      });
      
      await user.save();
    }

    await payout.save();

    res.status(200).json({
      success: true,
      message: `Payout marked as ${status}`,
      data: payout
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update payout status.' });
  }
};
// @desc    Get current wallet balance
// @route   GET /api/payments/wallet
// @access  Private
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.status(200).json({
      success: true,
      balance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
