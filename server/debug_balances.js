const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const names = ['Priya', 'Vidya', 'Umesh', 'Santosh'];
        const users = await User.find({ name: { $in: names } });
        
        console.log(`--- Wallet Balances ---`);
        users.forEach(u => {
            console.log(`${u.name.padEnd(12)} | ${u.role.padEnd(8)} | ₹${u.walletBalance}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
