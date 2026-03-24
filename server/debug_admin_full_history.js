const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        
        const txs = await Transaction.find({ userId: admin._id }).sort({ createdAt: -1 });
        console.log(`--- FULL HISTORY FOR ${admin.name} (${admin._id}) ---`);
        let runningBalance = admin.walletBalance; 
        
        console.log(`Current Balance from DB: ${admin.walletBalance}`);

        txs.forEach((t, i) => {
            console.log(`[${t.createdAt.toISOString()}] | ${t.type.padEnd(15)} | ${t.amount.toString().padEnd(6)} | ${t.description}`);
        });

        const totalCredits = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const totalDebits = txs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
        console.log(`\nAggregated Total Credits: ${totalCredits}`);
        console.log(`Aggregated Total Debits: ${totalDebits}`);
        console.log(`Aggregated Net Change: ${totalCredits + totalDebits}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
