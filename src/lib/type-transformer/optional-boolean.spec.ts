import { OptionalBoolean } from '.';

describe('OptionalBoolean', () => {
    test('`TRUE` of string type returns `true` of boolean type', () => {
        expect(OptionalBoolean('TRUE')).toBeTruthy();
        expect(OptionalBoolean('true')).toBeTruthy();
    });

    test('`FALSE` of string type returns `false` of boolean type', () => {
        expect(OptionalBoolean('FALSE')).not.toBeTruthy();
        expect(OptionalBoolean('false')).not.toBeTruthy();
    });

    it('Should return the same value if the result of `uppercase()` is neither `TRUE` nor `FALSE`', () => {
        for (const value of ['FAIL', 'tru', true, false, 1, 2, undefined, 'null', 'undefined', '']) {
            expect(OptionalBoolean(value)).toEqual(value);
        }
    });
});
