import {Response} from './response.mjs';

export class Client {
    constructor(scraperEndpoint) {
        this._scraperEndpoint = scraperEndpoint;
    }

    scrap(url, xpathQueries = {}, cssQueries = {}) {
        let query = `url=${encodeURIComponent(url)}`

        if ('object' === typeof xpathQueries && 0 < Object.keys(xpathQueries).length) {
            query += `&xpathQueries=${encodeURIComponent(JSON.stringify(xpathQueries))}`;
        }

        if ('object' === typeof cssQueries && 0 < Object.keys(cssQueries).length) {
            query += `&cssQueries=${encodeURIComponent(JSON.stringify(cssQueries))}`;
        }

        // eslint-disable-next-line
        return fetch(`${this._scraperEndpoint}?${query}`)
            .then(response => response.json())
            .then(json => {
                if ('OK' !== json.status || false !== json.error) {
                    throw new Error(`${json.status || 'ERR'}: ${json.error || 'Error'}`);
                }

                const {meta, queries} = json.result;

                return new Response(meta, queries);
            });
    }
}
