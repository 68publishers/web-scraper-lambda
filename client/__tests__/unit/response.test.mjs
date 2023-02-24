import {Response} from '../../src/response.mjs';

describe('Test Response object', function () {
    it('Meta and queries should be returned', () => {
        const response = new Response({
            a: 1,
            b: 2,
        }, {
            a: {
                values: [5, 15, 20],
                error: false,
            },
            b: {
                values: [],
                error: false,
            },
            c: {
                values: [],
                error: "Test error.",
            },
        });

        expect(response.meta()).toStrictEqual({a: 1, b: 2});
        expect(response.meta('a')).toStrictEqual(1);
        expect(response.meta('b')).toStrictEqual(2);
        expect(response.meta('c')).toStrictEqual(undefined);

        expect(response.queryValues('a')).toStrictEqual([5, 15, 20]);
        expect(response.queryValues('a', ['default'])).toStrictEqual([5, 15, 20]);
        expect(response.queryValues('b')).toStrictEqual([]);
        expect(response.queryValues('b', ['default'])).toStrictEqual(['default']);
        expect(response.queryValues('c')).toStrictEqual([]);
        expect(response.queryValues('c', ['default'])).toStrictEqual(['default']);
        expect(response.queryValues('d')).toStrictEqual([]);
        expect(response.queryValues('d', ['default'])).toStrictEqual(['default']);

        expect(response.queryValue('a')).toStrictEqual(5);
        expect(response.queryValue('a', 'default')).toStrictEqual(5);
        expect(response.queryValue('b')).toBeNull();
        expect(response.queryValue('b', 'default')).toStrictEqual('default');
        expect(response.queryValue('c')).toBeNull()
        expect(response.queryValue('c', 'default')).toStrictEqual('default');
        expect(response.queryValue('d')).toBeNull()
        expect(response.queryValue('d', 'default')).toStrictEqual('default');

        expect(response.queryError('a')).toBeFalsy();
        expect(response.queryError('b')).toBeFalsy();
        expect(response.queryError('c')).toStrictEqual('Test error.');
        expect(response.queryError('d')).toBeFalsy();
    });
});
