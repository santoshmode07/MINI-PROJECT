const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        
        const txs = await Transaction.find({ userId: admin._id }).sort({ createdAt: 1 });
        
        console.log(`\nSYNDICATE AUDIT FOR ADMIN: ${admin.name} (ID: ${admin._id})`);
        console.log('---------------------------------------------------------');
        console.log(`DB BALANCE: ₹${admin.walletBalance}`);

        let balance = 2000;
        console.log(`\nINITIAL SEED: ₹2000.00`);

        txs.forEach((t, i) => {
            const prev = balance;
            balance += t.amount;
            console.log(`[${i+1}] ${new Date(t.createdAt).toLocaleTimeString()} | ${t.type.padEnd(15)} | ${t.amount >= 0 ? '+' : ''}${t.amount.toString().padEnd(6)} | New: ₹${balance.toString().padEnd(6)} | ${t.description}`);
        });

        console.log('---------------------------------------------------------');
        console.log(`FINAL CALCULATED BALANCE: ₹${balance}`);
        console.log(`EXPECTED DISCREPANCY FROM DB: ₹${admin.walletBalance - balance}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

audit();
