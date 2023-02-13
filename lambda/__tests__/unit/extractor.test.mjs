import path from 'path';
import {readFileSync} from 'fs';
import {Extractor} from '../../src/extractor.mjs';
import {JSDOM} from 'jsdom';

describe('Test Extractor object', function () {
    let pageHtml;

    beforeAll(() => {
        pageHtml = readFileSync(path.resolve('__tests__/unit/fixtures/page.withoutOg.html'));
    });

    it('DOM should be created', () => {
        const dom = Extractor.createDom(pageHtml);

        expect(dom).toBeInstanceOf(JSDOM);
    });

    it('Values should be extracted via Xpath', () => {
        const dom = Extractor.createDom(pageHtml);

        expect(Extractor.extractXpath(dom, '//foo')).toStrictEqual({
            values: [],
            error: false,
        });

        expect(Extractor.extractXpath(dom, '//title')).toStrictEqual({
            values: ['Page without OG'],
            error: false,
        });

        expect(Extractor.extractXpath(dom, '/html/head/meta/@name')).toStrictEqual({
            values: ['viewport', 'author', 'description'],
            error: false,
        });

        expect(Extractor.extractXpath(dom, '//*[@id="menu"]/li/a')).toStrictEqual({
            values: ['Home', 'About', 'Contact'],
            error: false,
        });

        expect(Extractor.extractXpath(dom, '//*[@id="menu"]/li/a/@href')).toStrictEqual({
            values: ['#home', '#about', '#contact'],
            error: false,
        });

        expect(Extractor.extractXpath(dom, '//*[@id="content"]/section')).toStrictEqual({
            values: ["Home\nHome paragraph 1\nHome paragraph 2\nHome paragraph 3", "About\nAbout paragraph 1\nAbout paragraph 2\nAbout paragraph 3", "Contact\nContact paragraph 1\nContact paragraph 2\nContact paragraph 3"],
            error: false,
        });
    });

    it('Values should not be extracted via invalid Xpath', () => {
        const dom = Extractor.createDom(pageHtml);

        expect(Extractor.extractXpath(dom, '???')).toStrictEqual({
            values: [],
            error: "Error",
        });
    });

    it('Values should be extracted via CSS selector', () => {
        const dom = Extractor.createDom(pageHtml);

        expect(Extractor.extractCssSelector(dom, 'foo')).toStrictEqual({
            values: [],
            error: false,
        });

        expect(Extractor.extractCssSelector(dom, 'title')).toStrictEqual({
            values: ['Page without OG'],
            error: false,
        });

        expect(Extractor.extractCssSelector(dom, 'h1')).toStrictEqual({
            values: ['Page without OG'],
            error: false,
        });

        expect(Extractor.extractCssSelector(dom, '#menu > li > a')).toStrictEqual({
            values: ['Home', 'About', 'Contact'],
            error: false,
        });

        expect(Extractor.extractCssSelector(dom, '#content > section')).toStrictEqual({
            values: ["Home\nHome paragraph 1\nHome paragraph 2\nHome paragraph 3", "About\nAbout paragraph 1\nAbout paragraph 2\nAbout paragraph 3", "Contact\nContact paragraph 1\nContact paragraph 2\nContact paragraph 3"],
            error: false,
        });
    });

    it('Values should not be extracted via invalid CSS selector', () => {
        const dom = Extractor.createDom(pageHtml);

        expect(Extractor.extractCssSelector(dom, '???')).toStrictEqual({
            values: [],
            error: "SyntaxError: '???' is not a valid selector",
        });
    });
});
