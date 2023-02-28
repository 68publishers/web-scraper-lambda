import {ResponseFactory} from '../../src/response-factory.mjs';

describe('Test ResponseFactory object', function () {
    it('Error response should be created', () => {
        const response = ResponseFactory.createErrorResponse(500, 'ERR_INTERNAL_ERROR', 'Internal error.');

        expect(response).toStrictEqual({
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json',
            },
            body: '{"status":"ERR_INTERNAL_ERROR","error":"Internal error.","result":{}}',
            isBase64Encoded: false,
        });
    });

    it('Response with failed result should be created', () => {
        const response = ResponseFactory.createResponseWithFailedResult("ERR_NOT_FOUND", 'Page not found.');

        expect(response).toStrictEqual({
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json',
            },
            body: '{"status":"ERR_NOT_FOUND","error":"Page not found.","result":{}}',
            isBase64Encoded: false,
        });
    });

    it('Response with successful result should be created', () => {
        const response = ResponseFactory.createResponseWithSuccessfulResult({
            test: 'test',
        });

        expect(response).toStrictEqual({
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json',
            },
            body: '{"status":"OK","error":false,"result":{"test":"test"}}',
            isBase64Encoded: false,
        });
    });
});
