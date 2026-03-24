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
        
        console.log(`Current DB Balance: ₹${admin.walletBalance}`);
        console.log(`--- Ledger Analysis ---`);
        
        let txSum = 0;
        txs.forEach(t => {
            txSum += t.amount;
        });
        
        console.log(`Sum of all Transaction records: ₹${txSum}`);
        const baseline = 2000; // From seed_test_funds.js
        console.log(`Test Seed Baseline (from seed_test_funds): ₹${baseline}`);
        console.log(`Calculated Balance (Baseline + TxSum): ₹${baseline + txSum}`);
        console.log(`\nDiscrepancy: ₹${admin.walletBalance - (baseline + txSum)}`);

        // BREAKDOWN OF TYPES
        const breakdown = {};
        txs.forEach(t => {
            breakdown[t.type] = (breakdown[t.type] || 0) + t.amount;
        });
        console.log('\nBreakdown by Transaction Type:');
        Object.keys(breakdown).forEach(type => {
            console.log(`- ${type}: ₹${breakdown[type]}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

audit();
