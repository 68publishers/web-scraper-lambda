import ogs from 'open-graph-scraper';
import {ResponseFactory} from './response-factory.mjs';
import {Extractor} from './extractor.mjs';

export const WebScraper = {
    async scrap(options) {
        if (!('url' in options)) {
            return ResponseFactory.createErrorResponse(422, 'ERR_MISSING_REQUIRED_PARAMETER', 'Missing required "url" option.');
        }

        const result = await ogs({
            url: decodeURIComponent(options.url),
            allMedia: true,
            downloadLimit: undefined,
        }).then((data) => {
            const { result, response } = data;

            return {
                error: false,
                ogResult: result,
                response: response,
            };
        }).catch(data => {
            const result = data.result;
            const errorDetails = result.errorDetails;
            const error = errorDetails.message || result.error || 'Internal error';

            return {
                status: errorDetails.code || 'ERR_INTERNAL_SERVER_ERROR',
                error: `Web scraper error: ${error}`,
            };
        });

        if (false !== result.error) {
            return ResponseFactory.createResponseWithFailedResult(result.status, result.error);
        }

        const {ogResult, response} = result;
        const {queries} = options;
        const requestUrl = ogResult.requestUrl;

        delete ogResult.requestUrl;
        delete ogResult.success;

        const responseResult = {
            requestUrl: requestUrl,
            meta: ogResult,
            queries: {},
        };

        if (('object' === typeof queries && 0 < Object.keys(queries).length)) {
            const dom = Extractor.createDom(response.rawBody.toString());

            for (let [key, value] of Object.entries(queries)) {
                responseResult.queries[key] = Extractor.extractCssSelector(dom, value);
            }
        }

        return ResponseFactory.createResponseWithSuccessfulResult(responseResult);
    },
};
