const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- SYNDICATE LEDGER DEBUG ---');

        const admin = await User.findOne({ role: 'admin' });
        console.log(`Admin (${admin?.name}): Balance ₹${admin?.walletBalance}`);

        const txs = await Transaction.find().sort({ createdAt: -1 }).limit(20).populate('userId', 'name role');
        console.log('\n20 Recent Transactions (Global):');
        txs.forEach(t => {
            console.log(`[${new Date(t.createdAt).toLocaleTimeString()}] | ${t.type.padEnd(15)} | ₹${t.amount.toString().padEnd(6)} | ${t.userId?.name || 'System'} (${t.userId?.role || '?'}) | ${t.description}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
