/**
 * Marked - a markdown parser
 * Version: 14.1.3
 * Copyright (c) 2011-2024, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

// UMD wrapper
(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((global = typeof globalThis !== 'undefined' ? globalThis : global || self).marked = {});
    }
})(this, function(exports) {
    'use strict';

    // Default options
    const defaults = {
        async: false,
        breaks: false,
        extensions: null,
        gfm: true,
        hooks: null,
        pedantic: false,
        renderer: null,
        silent: false,
        tokenizer: null,
        walkTokens: null
    };

    // Core Classes
    class Tokenizer {
        constructor(options) {
            this.options = options || defaults;
        }

        // Token generation methods
        space(src) { /* ... */ }
        code(src) { /* ... */ }
        fences(src) { /* ... */ }
        heading(src) { /* ... */ }
        hr(src) { /* ... */ }
        blockquote(src) { /* ... */ }
        list(src) { /* ... */ }
        html(src) { /* ... */ }
        def(src) { /* ... */ }
        table(src) { /* ... */ }
        lheading(src) { /* ... */ }
        paragraph(src) { /* ... */ }
        text(src) { /* ... */ }
        escape(src) { /* ... */ }
        tag(src) { /* ... */ }
        link(src) { /* ... */ }
        emStrong(src, maskedSrc, prevChar) { /* ... */ }
        codespan(src) { /* ... */ }
        br(src) { /* ... */ }
        del(src) { /* ... */ }
        autolink(src) { /* ... */ }
        url(src) { /* ... */ }
        inlineText(src) { /* ... */ }
    }

    class Lexer {
        constructor(options) {
            this.tokens = [];
            this.tokens.links = Object.create(null);
            this.options = options || defaults;
            this.tokenizer = options.tokenizer || new Tokenizer();
            this.inlineQueue = [];
            this.state = {
                inLink: false,
                inRawBlock: false,
                top: true
            };
        }

        lex(src) {
            src = src.replace(/\r\n|\r/g, '\n');
            this.blockTokens(src, this.tokens);
            this.inline();
            return this.tokens;
        }

        blockTokens(src, tokens = [], top = true) { /* ... */ }
        inline(src, tokens = []) { /* ... */ }
        inlineTokens(src, tokens = []) { /* ... */ }
    }

    class Parser {
        constructor(options) {
            this.options = options || defaults;
            this.renderer = this.options.renderer || new Renderer();
            this.textRenderer = new TextRenderer();
            this.renderer.parser = this;
        }

        parse(tokens, top = true) { /* ... */ }
        parseInline(tokens, renderer) { /* ... */ }
    }

    class Renderer {
        constructor(options) {
            this.options = options || defaults;
        }

        // HTML rendering methods
        code(code, infostring, escaped) { /* ... */ }
        blockquote(quote) { /* ... */ }
        html(html) { /* ... */ }
        heading(text, level, raw, slugger) { /* ... */ }
        hr() { /* ... */ }
        list(body, ordered, start) { /* ... */ }
        listitem(text, task, checked) { /* ... */ }
        checkbox(checked) { /* ... */ }
        paragraph(text) { /* ... */ }
        table(header, body) { /* ... */ }
        tablerow(content) { /* ... */ }
        tablecell(content, flags) { /* ... */ }
        strong(text) { /* ... */ }
        em(text) { /* ... */ }
        codespan(text) { /* ... */ }
        br() { /* ... */ }
        del(text) { /* ... */ }
        link(href, title, text) { /* ... */ }
        image(href, title, text) { /* ... */ }
        text(text) { /* ... */ }
    }

    // Main marked function
    function marked(src, opt) {
        try {
            const options = { ...defaults, ...opt };
            return new Parser(options).parse(
                new Lexer(options).lex(src)
            );
        } catch (e) {
            e.message += '\nPlease report this to https://github.com/markedjs/marked';
            if (opt?.silent) {
                return '<p>An error occurred:</p><pre>' +
                    escape(e.message + '', true) +
                    '</pre>';
            }
            throw e;
        }
    }

    // Extension handling
    marked.use = function(...extensions) {
        const opts = { ...defaults };
        extensions.forEach(extension => {
            // Process extensions...
        });
        return marked;
    };

    // Export methods and classes
    exports.marked = marked;
    exports.Parser = Parser;
    exports.parser = Parser.parse;
    exports.Renderer = Renderer;
    exports.TextRenderer = TextRenderer;
    exports.Lexer = Lexer;
    exports.lexer = Lexer.lex;
    exports.Tokenizer = Tokenizer;
    exports.defaults = defaults;
});
