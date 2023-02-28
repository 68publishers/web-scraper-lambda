import {parseHTML} from 'linkedom/cached';

const fixIndentation = text => {
    return text.replace(RegExp('(^ +)|( +$)|(^$)', 'gm'), '').trim();
};

export const Extractor = {
    createDom(html) {
        return parseHTML(html);
    },
    extractCssSelector(dom, cssSelector) {
        try {
            const parts = cssSelector.split('@');
            let attribute = parts.pop().trim();
            let selector = parts.join('@').trim();

            if ('' === selector) {
                selector = attribute;
                attribute = null;
            }

            const values = [];
            const doc = dom.window.document;
            const elements = doc.querySelectorAll(selector);

            for (let i = 0; i < elements.length; ++i) {
                if (attribute && !elements[i].hasAttribute(attribute)) {
                    continue;
                }

                const value = attribute ? elements[i].getAttribute(attribute) : fixIndentation(elements[i].textContent);
                values.push(value);
            }

            return {
                values: values,
                error: false,
            };
        } catch (e) {
            return {
                values: [],
                error: e.toString(),
            };
        }
    },
};
