import {Client} from '../../src/client.mjs';
import {Response} from '../../src/response.mjs';
import {jest} from '@jest/globals';
import MemoryStorage from 'memorystorage';

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
                test: 'a @href',
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

    it('Response should be returned - url and css-path', async () => {
        await testSuccessfulResponse(
            'https://www.example.com',
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
                testA: 'a @href',
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

    it('Cached response should be returned', async () => {
        const url = 'https://www.example.com';
        const storage = new MemoryStorage('cached-response-test');
        const client = new Client(endpoint, {
            cache: {
                storage: storage,
                ttl: 1,
            },
        });

        // setup fetch mock
        setupSuccessfulMock(url, undefined, {ogTitle: 'Title'}, {});

        // 1st call - boost the cache
        await client.scrap(url, {}, {});

        // the fetch api is called and the storage contains the response
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(storage).toHaveLength(1)

        // 2nd call - from the cache
        await client.scrap(url, {}, {});

        // the fetch api is not called and the storage contains the response
        expect(storage).toHaveLength(1)
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // wait more than 1 second (ttl)
        await new Promise((resolve) => setTimeout(resolve, 1005));

        // 3rd call - expire the cache and boost again
        await client.scrap(url, {}, {});

        // the fetch api is called and the storage contains the response
        expect(storage).toHaveLength(1)
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('Error should be thrown on non successful response', async () => {
        await testNonSuccessfulResponse(
            'https://www.example.com',
            undefined,
            'ERR_TEST',
            'Test Error.',
        );
    });

    const testSuccessfulResponse = async (url, reqQueries, meta, queries) => {
        setupSuccessfulMock(url, reqQueries, meta, queries);

        const client = new Client(endpoint);
        const response = await client.scrap(url, reqQueries);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(response).toBeInstanceOf(Response);
        expect(response.meta()).toStrictEqual(meta);
        expect(response._queries).toStrictEqual(queries);
    };

    const testNonSuccessfulResponse = async (url, reqQueries, status, error) => {
        fetchMock.mockImplementation(request => {
            assertUrl(request, url, reqQueries);

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

        await expect(client.scrap(url, reqQueries)).rejects.toThrow(new Error(`${status}: ${error}`));
        expect(fetchMock).toHaveBeenCalledTimes(1);
    };

    const setupSuccessfulMock = (url, reqQueries, meta, queries) => {
        fetchMock.mockImplementation(request => {
            assertUrl(request, url, reqQueries);

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
    };

    const assertUrl = (requestedUrl, scrapedUrl, reqQueries) => {
        let reqUrl = `url=${encodeURIComponent(scrapedUrl)}`

        if (reqQueries) {
            reqUrl += `&queries=${encodeURIComponent(JSON.stringify(reqQueries))}`;
        }

        expect(requestedUrl).toStrictEqual(endpoint + '?' + reqUrl);
    };
});
