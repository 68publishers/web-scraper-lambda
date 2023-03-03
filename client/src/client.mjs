import {Response} from './response.mjs';

export class Client {
    constructor(scraperEndpoint, options = {}) {
        this._scraperEndpoint = scraperEndpoint;

        const cacheOptions = {
            storage: null,
            ttl: 60 * 60, // one hour
            prefix: 'web-scraper-cache:',
            ...('object' === typeof options.cache ? options.cache : {}),
        };

        if (null === cacheOptions.storage
            || 'object' !== typeof cacheOptions.storage
            || 'function' !== typeof cacheOptions.storage.getItem
            || 'function' !== typeof cacheOptions.storage.setItem
            || 'function' !== typeof cacheOptions.storage.removeItem
        ) {
            cacheOptions.storage = null;
        }

        this._options = {
            cache: cacheOptions,
        }
    }

    scrap(url, queries = {}) {
        let query = `url=${encodeURIComponent(url)}`

        if ('object' === typeof queries && 0 < Object.keys(queries).length) {
            query += `&queries=${encodeURIComponent(JSON.stringify(queries))}`;
        }

        const endpoint = `${this._scraperEndpoint}?${query}`;
        const cacheStorage = this._options.cache.storage;
        let cacheKey;

        if (cacheStorage) {
            cacheKey = this._options.cache.prefix + endpoint;

            let cachedItem = cacheStorage.getItem(cacheKey);
            cachedItem = 'string' === typeof cachedItem ? JSON.parse(cachedItem) : null;

            if (null !== cachedItem && (new Date()).getTime() > cachedItem.expiration) {
                cacheStorage.removeItem(cacheKey);
            } else if (null !== cachedItem) {
                const {requestUrl, meta, queries} = cachedItem;

                return new Promise(resolve => {
                    resolve(new Response(requestUrl, meta, queries));
                })
            }
        }

        // eslint-disable-next-line
        return fetch(endpoint)
            .then(response => response.json())
            .then(json => {
                if ('OK' !== json.status || false !== json.error) {
                    throw new Error(`${json.status || 'ERR'}: ${json.error || 'Error'}`);
                }

                const {requestUrl, meta, queries} = json.result;

                if (cacheStorage) {
                    cacheStorage.setItem(cacheKey, JSON.stringify({
                        requestUrl: requestUrl,
                        meta: meta,
                        queries: queries,
                        expiration: (new Date()).getTime() + (this._options.cache.ttl * 1000),
                    }));
                }

                return new Response(requestUrl, meta, queries);
            });
    }
}
