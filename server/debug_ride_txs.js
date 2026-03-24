const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
require('./models/User'); // Register User model

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const rideId = '69bacde07ab5efb058ee8b33';
        console.log(`Searching for all transactions related to ride ${rideId}`);

        const txs = await Transaction.find({ rideId }).sort({ createdAt: -1 }).populate('userId', 'name role');
        txs.forEach(t => {
            console.log(`[${t.createdAt.toISOString()}] | ${t.type.padEnd(15)} | ${t.amount} | ${t.userId?.name} (${t.userId?.role}) | ${t.description}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
