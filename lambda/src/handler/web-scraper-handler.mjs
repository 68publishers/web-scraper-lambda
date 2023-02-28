import {WebScraper} from '../web-scraper.mjs';
import {ResponseFactory} from '../response-factory.mjs';

export const webScraperLambdaHandler = async (event) => {
    const queryParameters = event.queryStringParameters || {};
    const options = {};

    if ('url' in queryParameters) {
        options.url = queryParameters.url;
    }

    if ('queries' in queryParameters) {
        let valid = false;

        try {
            const queries = JSON.parse(decodeURIComponent(queryParameters.queries));

            if ('object' === typeof queries) {
                valid = true;
                options.queries = queries;
            }
        } catch (e) {
            // ignore an error
        }

        if (!valid) {
            return ResponseFactory.createErrorResponse(422, 'ERR_INVALID_PARAMETER_VALUE', 'The query parameter "queries" contains malformed JSON.');
        }
    }

    return await WebScraper.scrap(options);
};
