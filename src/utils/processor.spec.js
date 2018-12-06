import processor from './processor';

describe('generateTransactionId', () => {
    it('should return the correct hash', () => {
        const actual = [{
            date: '22 Sep 2018\t',
            description: 'MY WONDERFUL\n                          TRANSACTION\t',
            type: 'DEB\t',
            in: '\t',
            out: '15.00\t',
            balance: '1234.00\t'
        }];

        const expected = [{
            id: '152c59c650c74afdfad71a7fbb6d6b62',
            date: '22 Sep 2018',
            description: 'MY WONDERFUL TRANSACTION',
            type: 'DEB',
            in: '',
            out: '15.00',
            balance: '1234.00'
        }];


        expect(processor(actual)).to.deep.equal(expected);
    });
});
