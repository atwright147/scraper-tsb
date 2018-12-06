import generateTransactionId from './generateTransactionId';

describe('generateTransactionId', () => {
    it('should return the correct hash', () => {
        const mockTransaction = {
            'date': '22 Sep 2018',
            'description': 'MY WONDERFUL TRANSACTION',
            'type': 'DEB',
            'in': '',
            'out': '15.00',
            'balance': '1234.00'
        };

        expect(generateTransactionId(mockTransaction)).to.equal('152c59c650c74afdfad71a7fbb6d6b62');
    });
});
