import {WebScraper} from '../web-scraper.mjs';
import {ResponseFactory} from '../response-factory.mjs';

export const webScraperLambdaHandler = async (event) => {
    const queryParameters = event.queryStringParameters || {};
    const options = {};

    if ('url' in queryParameters) {
        options.url = queryParameters.url;
    }

    for (let key of ['xpathQueries', 'cssQueries']) {
        if (!(key in queryParameters)) {
            continue;
        }

        let valid = false;

        try {
            const queries = JSON.parse(decodeURIComponent(queryParameters[key]));

            if ('object' === typeof queries) {
                valid = true;
                options[key] = queries;
            }
        } catch (e) {
            // ignore an error
        }

        if (!valid) {
            return ResponseFactory.createErrorResponse(422, 'ERR_INVALID_PARAMETER_VALUE', `The query parameter '${key}' contains malformed JSON.`);
        }
    }

    return await WebScraper.scrap(options);
};
