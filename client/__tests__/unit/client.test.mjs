import {Client} from '../../src/client.mjs';
import {Response} from '../../src/response.mjs';
import {jest} from '@jest/globals';

describe('Test Client object', function () {
    const endpoint = 'https://scraper-endpoint.io/test/scrap';
    let fetchMock;

    beforeEach(() => {
        fetchMock = jest.fn();
        // eslint-disable-next-line
        global.fetch = fetchMock;
    });

    it('Response should be returned - url only', async () => {
        await testSuccessfulResponse(
            'https://www.example.com',
            undefined,
            undefined,
            {
                ogTitle: 'Title',
            },
            {},
        );
    });

    it('Response should be returned - url and xpath', async () => {
        await testSuccessfulResponse(
            'https://www.example.com',
            {
                test: '//a/@href',
            },
            undefined,
            {
                ogTitle: 'Title',
            },
            {
                test: {
                    values: ["test1", "test2"],
                    error: false,
                },
            },
        );
    });

    it('Response should be returned - url and css-path', async () => {
        await testSuccessfulResponse(
            'https://www.example.com',
            undefined,
            {
                test: '#main h2',
            },
            {
                ogTitle: 'Title',
            },
            {
                test: {
                    values: ["test1", "test2"],
                    error: false,
                },
            },
        );
    });

    it('Response should be returned - url, xpath and css-path', async () => {
        await testSuccessfulResponse(
            'https://www.example.com',
            {
                testA: '//a/@href',
            },
            {
                testB: '#main h2',
            },
            {
                ogTitle: 'Title',
            },
            {
                testA: {
                    values: ["test1", "test2"],
                    error: false,
                },
                testB: {
                    values: [],
                    error: false,
                },
            },
        );
    });

    it('Error should be thrown on non successful response', async () => {
        await testNonSuccessfulResponse(
            'https://www.example.com',
            undefined,
            undefined,
            'ERR_TEST',
            'Test Error.',
        );
    });

    const testSuccessfulResponse = async (url, xpathQueries, cssQueries, meta, queries) => {
        fetchMock.mockImplementationOnce(request => {
            assertUrl(request, url, xpathQueries, cssQueries);

            return new Promise(resolve => {
                resolve({
                    json: () => {
                        return {
                            status: 'OK',
                            error: false,
                            result: {
                                requestUrl: 'https://www.example.com',
                                meta: meta || {},
                                queries: queries || {},
                            },
                        };
                    },
                });
            })
        });

        const client = new Client(endpoint);
        const response = await client.scrap(url, xpathQueries, cssQueries);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(response).toBeInstanceOf(Response);
        expect(response.meta()).toStrictEqual(meta);
        expect(response._queries).toStrictEqual(queries);
    };

    const testNonSuccessfulResponse = async (url, xpathQueries, cssQueries, status, error) => {
        fetchMock.mockImplementationOnce(request => {
            assertUrl(request, url, xpathQueries, cssQueries);

            return new Promise(resolve => {
                resolve({
                    json: () => {
                        return {
                            status: status,
                            error: error,
                            result: {},
                        }
                    },
                });
            })
        });

        const client = new Client(endpoint);

        await expect(client.scrap(url, xpathQueries, cssQueries)).rejects.toThrow(new Error(`${status}: ${error}`));
        expect(fetchMock).toHaveBeenCalledTimes(1);
    };

    const assertUrl = (requestedUrl, scrapedUrl, xpathQueries, cssQueries) => {
        let reqUrl = `url=${encodeURIComponent(scrapedUrl)}`

        if (xpathQueries) {
            reqUrl += `&xpathQueries=${encodeURIComponent(JSON.stringify(xpathQueries))}`;
        }

        if (cssQueries) {
            reqUrl += `&cssQueries=${encodeURIComponent(JSON.stringify(cssQueries))}`;
        }

        expect(requestedUrl).toStrictEqual(endpoint + '?' + reqUrl);
    };
});
