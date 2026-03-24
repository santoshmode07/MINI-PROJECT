const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminId = '69ad3e1bcd651855271c9c33';
        console.log(`Searching for transactions for admin ID: ${adminId}`);

        // Search within the minute of the TRANSFER
        const txs = await Transaction.find({ userId: adminId }).sort({ createdAt: -1 }).limit(10);
        txs.forEach(t => {
            console.log(`[${t.createdAt.toISOString()}] | ${t.type.padEnd(15)} | ${t.amount} | ID: ${t._id} | ${t.description}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
