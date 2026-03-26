/**
 * Generates a random 6-digit OTP string.
 */
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
