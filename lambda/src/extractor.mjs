import {JSDOM} from 'jsdom';

const fixIndentation = text => {
    return text.replace(RegExp('(^ +)|( +$)|(^$)', 'gm'), '').trim();
};

export const Extractor = {
    createDom(html) {
        return new JSDOM(html);
    },
    extractXpath(dom, xpath) {
        try {
            const values = [];
            const doc = dom.window.document;
            const result = doc.evaluate(xpath, doc, null, dom.window.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
            let node = result.iterateNext();

            while (node) {
                values.push(fixIndentation(node.textContent));

                node = result.iterateNext();
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
    extractCssSelector(dom, cssSelector) {
        try {
            const values = [];
            const doc = dom.window.document;
            const elements = doc.querySelectorAll(cssSelector);

            for (let i = 0; i < elements.length; ++i) {
                values.push(fixIndentation(elements[i].textContent));
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
