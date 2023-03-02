<h1 align="center">Web scraper lambda</h1>

<p align="center">AWS SAM application and client for scraping website og meta tags and content via css selectors.</p>

## Prerequisites

* Git
* AWS SAM Cli

## Lambda deploy

```sh
$ git clone https://github.com/68publishers/web-scraper-lambda.git
$ cd web-scraper-lambda
$ sam build
$ sam deploy --guided
```

## Client installation

The first option is to download the client as a module.

```sh
$ npm i --save @68publishers/web-scraper-client
# or
$ yarn add @68publishers/web-scraper-client
```

And import it in your project.

```js
import WebScraperClient from '@68publishers/web-scraper-client';
// or
const WebScraperClient = require('@68publishers/web-scraper-client');
```

Or you can import the client into the browser from the CDN

```html
<script src="https://unpkg.com/@68publishers/web-scraper-client/dist/web-scraper-client.min.js"></script>
```

## Client usage

The client must be initialized with the URL of your lambda function and an optional configuration object.

```js
var client = new WebScraperClient(
    'https://<gateway>.execute-api.<region>.amazonaws.com/<stage>/scrap',
    {} // optional configuration
);
```

Optional configuration values table:

| Option path     | Type                | Default                | Description                                                                            |
|-----------------|---------------------|------------------------|----------------------------------------------------------------------------------------|
| `cache.storage` | `null` or `storage` | `null`                 | Pass `localStorage` or `sessionStorage` or any compatible storage for enabled caching. |
| `cache.ttl`     | `int`               | `3600`                 | Cache expiration in seconds.                                                           |
| `cache.prefix`  | `string`            | `"web-scraper-cache:"` | Prefix for cache item keys.                                                            |

To scrap data from a web page, call the `scrap` method with the desired URL. You can use the second optional `queries` argument to retrieve additional data.
The value of the argument should be an object whose keys are arbitrary names and whose values are CSS selectors, such as `#main > .header > .title`.
If you need an attribute value, add `@attributeName` to the end of the selector, for example `#gallery > img @src`.

```js
// get only og meta tags
client.scrap('https://wwww.website-to-scrap.com/test')
    .then(response => {
        // do anything with parsed response
    })
    .catch(e => {
        // whoops
    });

// get og meta tags and some additional data
client.scrap(
    'https://wwww.website-to-scrap.com/test',
    {
        pageLinks: "a @href",
        galleryImages: "#product_gallery img @src",
        productName: "#main .product-card > .product-name",
    }
).then(response => {
    // do anything with parsed response
}).catch(e => {
    // whoops
});
```

### Response object

The response object contains all parsed meta tags and "queries".

```js
client.scrap(/*...*/).then(response => {
    var url = response.requestUrl; // url from which the data was scraped
    var allMeta = response.meta(); // returns all found og meta tags
    var ogTitle = response.meta('ogTitle', ''); // return the specific meta tag, the second argument is the default value

    var pageLinks = response.queryValues('pageLinks', []) // return all found page links
    var galleryImages = response.queryValues('galleryImages', []) // return all gallery images
    var productName = response.queryValue('productName', 'Unknown product'); // the method `queryValue` returns the first value in an array
    
    var productNameError = response.queryError('productName'); // the method `queryError` returns an error message (for example if passed css selector is invalid) or false
});
```

### Response caching

The cache must be enabled in the client configuration.

```js
var client = new WebScraperClient(
    'https://<gateway>.execute-api.<region>.amazonaws.com/<stage>/scrap',
    {
        cache: {
            storage: window.sessionStorage, // or window.localStorage
            ttl: 3600, // expiration in seconds
            prefix: 'web-scraper-cache:', // prefix for cache keys
        },
    }
);
```
