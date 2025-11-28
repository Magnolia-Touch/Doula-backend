"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNumber = generateOrderNumber;
exports.generate6DigitOtp = generate6DigitOtp;
const crypto_1 = require("crypto");
function generateOrderNumber(prefix = 'ORD') {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');
    const randomStr = (0, crypto_1.randomBytes)(2).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${randomStr}`;
}
function generate6DigitOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
//# sourceMappingURL=utils.js.map