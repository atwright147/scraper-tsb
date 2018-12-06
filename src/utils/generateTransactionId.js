import crypto from 'crypto';

export default (transaction) => {
    const transactionString = Object.values(transaction).reduce((prev, curr) => {
        return prev + curr;
    });

    return crypto.createHash('md5').update(transactionString).digest('hex');
};
