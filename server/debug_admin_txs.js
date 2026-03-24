const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        console.log(`Searching for transactions for admin ID: ${admin?._id}`);

        const txs = await Transaction.find({ userId: admin?._id }).sort({ createdAt: -1 }).limit(10);
        console.log('\nAdmin specific transactions:');
        txs.forEach(t => {
            console.log(`[${t.createdAt.toISOString()}] | ${t.type.padEnd(15)} | ${t.amount} | ${t.description}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
