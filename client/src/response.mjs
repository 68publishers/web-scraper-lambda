export class Response {
    constructor(requestUrl, meta, queries) {
        this.requestUrl = requestUrl;
        this._meta = meta;
        this._queries = queries;
    }

    meta(name = undefined) {
        if (undefined === name || null === name) {
            return this._meta;
        }

        return this._meta[name] ?? undefined;
    }

    queryValues(name, defaultValues = []) {
        if (!(name in this._queries)) {
            return defaultValues;
        }

        const query = this._queries[name];

        if (false !== query.error || 0 >= query.values.length) {
            return defaultValues;
        }

        return query.values;
    }

    queryValue(name, defaultValue = null) {
        const values = this.queryValues(name, []);

        return values[0] ?? defaultValue;
    }

    queryError(name) {
        if (!(name in this._queries)) {
            return false;
        }

        return this._queries[name].error;
    }
}
