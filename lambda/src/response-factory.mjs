const createResponse = (code, body) => {
    return {
        statusCode: code,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(body),
        isBase64Encoded: false,
    };
};

export const ResponseFactory = {
    createErrorResponse(code, status, message) {
        return createResponse(code, {
            status: status,
            error: message,
            result: {},
        });
    },
    createResponseWithFailedResult(status, message, code = 200) {
        return createResponse(code, {
            status: status,
            error: message,
            result: {},
        });
    },
    createResponseWithSuccessfulResult(result, code = 200, status = 'OK') {
        return createResponse(code, {
            status: status,
            error: false,
            result: result,
        });
    },
};
