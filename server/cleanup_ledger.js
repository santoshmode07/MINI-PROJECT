const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
require('dotenv').config({ path: './.env' });

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const amount = 62;
        const passengerName = 'Nani'; 

        const passenger = await User.findOne({ name: passengerName });
        if (!passenger) return console.error('Passenger not found');

        const transactions = await Transaction.find({
            userId: passenger._id,
            amount: amount,
            type: 'REFUND',
            createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
        });

        console.log(`Found ${transactions.length} transactions for passenger`);

        if (transactions.length > 1) {
            const extraCount = transactions.length - 1;
            console.log(`Reversing ${extraCount} transactions...`);

            const driver = await User.findOne({ name: 'Umesh' });
            if (!driver) return console.error('Driver not found');

            const driverTransactions = await Transaction.find({
                userId: driver._id,
                amount: -amount,
                type: 'REFUND',
                createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
            });

            console.log(`Found ${driverTransactions.length} transactions for driver`);

            const totalToReverse = extraCount * amount;
            
            passenger.walletBalance -= totalToReverse;
            driver.walletBalance += totalToReverse;

            await passenger.save();
            await driver.save();

            const transToDel = transactions.slice(0, extraCount).map(t => t._id);
            const driverTransToDel = driverTransactions.slice(0, extraCount).map(t => t._id);

            await Transaction.deleteMany({ _id: { $in: [...transToDel, ...driverTransToDel] } });

            console.log(`Balances Restored. Deducted ₹${totalToReverse} from Nani and credited to Umesh.`);
        } else {
            console.log('No duplication found.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

cleanup();
