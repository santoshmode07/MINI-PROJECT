const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const txs = await Transaction.find({ type: 'TOPUP' }).sort({ createdAt: -1 }).limit(10);
        console.log('Recent TOPUP Transactions:');
        if (txs.length === 0) {
            console.log('NO TOPUP TRANSACTIONS FOUND IN DATABASE.');
        } else {
            txs.forEach(t => {
                console.log(`- ID: ${t.metadata?.paymentIntentId}, Amount: ${t.amount}, User: ${t.userId}, Date: ${t.createdAt}`);
            });
        }

        const users = await User.find({ walletBalance: { $gt: 0 } }).select('name walletBalance').limit(5);
        console.log('\nUsers with non-zero balance:');
        if (users.length === 0) {
            console.log('NO USERS HAVE BALANCE > 0.');
        } else {
            users.forEach(u => {
                console.log(`- ${u.name}: ₹${u.walletBalance}`);
            });
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
