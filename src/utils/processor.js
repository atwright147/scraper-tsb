import generateTransactionId from './generateTransactionId';

export default (transactions) => {
    return transactions.map((transaction) => {
        const sanitisedTransaction = {};

        Object.keys(transaction).forEach((key) => {
            let cleaned = transaction[key];
                cleaned = cleaned.replace(/\n|\t/ig, '');
                cleaned = cleaned.trim();
            sanitisedTransaction[key] = cleaned;
        });

        sanitisedTransaction.id = generateTransactionId(sanitisedTransaction);
        return sanitisedTransaction;
    });
}
