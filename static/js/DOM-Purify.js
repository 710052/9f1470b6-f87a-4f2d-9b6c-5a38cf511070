/**
 * @license DOMPurify 2.3.6
 * (c) Cure53 and other contributors
 * Released under the Apache license 2.0 and Mozilla Public License 2.0
 * github.com/cure53/DOMPurify/blob/2.3.6/LICENSE
 * source https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.6/purify.min.js
 */

(function(global, factory) {
    // UMD pattern setup
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        (global = global || self).DOMPurify = factory();
    }
})(this, function() {
    'use strict';

    // Core utility functions
    const hasOwnProperty = Object.hasOwnProperty;
    const setPrototypeOf = Object.setPrototypeOf;
    const isFrozen = Object.isFrozen;
    const getPrototypeOf = Object.getPrototypeOf;
    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    const freeze = Object.freeze;
    const seal = Object.seal;
    const create = Object.create;

    // Reflect utilities setup
    const reflectApply = typeof Reflect !== 'undefined' && Reflect.apply;
    const reflectConstruct = typeof Reflect !== 'undefined' && Reflect.construct;

    // Fallbacks for Reflect methods
    if (!reflectApply) {
        reflectApply = function(target, thisArgument, argumentsList) {
            return target.apply(thisArgument, argumentsList);
        };
    }

    if (!freeze) {
        freeze = function(x) {
            return x;
        };
    }

    if (!seal) {
        seal = function(x) {
            return x;
        };
    }

    if (!reflectConstruct) {
        reflectConstruct = function(Target, args) {
            return new (Function.prototype.bind.apply(
                Target,
                [null].concat(Array.from(args))
            ));
        };
    }

    // Helper functions for array operations
    const arrayForEach = Array.prototype.forEach;
    const arrayPop = Array.prototype.pop;
    const arrayPush = Array.prototype.push;

    // Helper functions for string operations
    const stringToLowerCase = String.prototype.toLowerCase;
    const stringMatch = String.prototype.match;
    const stringReplace = String.prototype.replace;
    const stringIndexOf = String.prototype.indexOf;
    const stringTrim = String.prototype.trim;

    // RegExp test helper
    const regExpTest = RegExp.prototype.test;

    // Custom TypeError constructor wrapper
    const typeErrorCreate = (function(TypeError) {
        return function() {
            return reflectConstruct(TypeError, arguments);
        };
    })(TypeError);

    // Constants - Allowed tags and attributes
    const ALLOWED_TAGS = freeze([
        'a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio',
        'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button',
        'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content',
        'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog',
        'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption',
        'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins',
        'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu',
        'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output',
        'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp',
        'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span',
        'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody',
        'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr',
        'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr'
    ]);

    // SVG related tags
    const ALLOWED_SVG_TAGS = freeze([
        'svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor',
        'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs',
        'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern',
        'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath',
        'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect',
        'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title',
        'tref', 'tspan', 'view', 'vkern'
    ]);

    // Main DOMPurify function
    function createDOMPurify(window = getWindow()) {
        const DOMPurify = root => createDOMPurify(root);
        DOMPurify.version = '2.3.6';
        DOMPurify.removed = [];

        if (!window || !window.document || window.document.nodeType !== 9) {
            DOMPurify.isSupported = false;
            return DOMPurify;
        }

        // Main sanitization functions
        DOMPurify.sanitize = function(dirty, cfg) {
            let body;
            let importedNode;
            let currentNode;
            let returnNode;
            
            // Initialize the document to work with
            body = initDocument(dirty);
            
            if (!body) {
                return Ie ? null : trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
            }
            
            // Remove forbidden elements
            while (currentNode = nodeIterator.nextNode()) {
                if (sanitizeElement(currentNode)) {
                    continue;
                }
                
                if (currentNode.content instanceof DocumentFragment) {
                    sanitizeShadowDOM(currentNode.content);
                }
                
                sanitizeAttributes(currentNode);
            }
            
            // Return sanitized version
            if (RETURN_DOM) {
                if (RETURN_DOM_FRAGMENT) {
                    returnNode = createDocumentFragment.call(body.ownerDocument);
                    while (body.firstChild) {
                        returnNode.appendChild(body.firstChild);
                    }
                } else {
                    returnNode = body;
                }
                
                if (ALLOWED_ATTR.shadowroot) {
                    returnNode = importNode.call(originalDocument, returnNode, true);
                }
                
                return returnNode;
            }
            
            return WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
        };

        return DOMPurify;
    }

    return createDOMPurify();
}));
