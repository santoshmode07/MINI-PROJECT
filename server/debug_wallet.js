const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const txs = await Transaction.find({ type: 'TOPUP' }).sort({ createdAt: -1 }).limit(5);
        console.log('Recent TOPUP Transactions:');
        txs.forEach(t => {
            console.log(`- ID: ${t.metadata?.paymentIntentId}, Amount: ${t.amount}, User: ${t.userId}, Date: ${t.createdAt}`);
        });

        const users = await User.find({ walletBalance: { $gt: 0 } }).select('name walletBalance').limit(5);
        console.log('\nUsers with non-zero balance:');
        users.forEach(u => {
            console.log(`- ${u.name}: ₹${u.walletBalance}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
