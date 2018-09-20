(function e(t, n, r) {
function s(o, u) {
if (!n[o]) {
if (!t[o]) {
let a=typeof require=='function'&&require; if (!u&&a) return a(o, !0); if (i) return i(o, !0); let f=new Error('Cannot find module \''+o+'\''); throw f.code='MODULE_NOT_FOUND', f;
} let l=n[o]={exports: {}}; t[o][0].call(l.exports, function(e) {
let n=t[o][1][e]; return s(n?n:e)
;}, l, l.exports, e, t, n, r);
} return n[o].exports
;} var i=typeof require=='function'&&require; for (let o=0; o<r.length; o++)s(r[o]); return s
;})({1: [function(require, module, exports) {
'use strict';

let _interopRequire = function(obj) {
return obj && obj.__esModule ? obj['default'] : obj;
};

// this file means to be compiled to lib

let createFn = _interopRequire(require('./icon'));

// change this if you want a different tag name
let tagName = 'svg-icon';

// run
createFn(tagName)();

}, {'./icon': 2}], 2: [function(require, module, exports) {
'use strict';

let _interopRequireWildcard = function(obj) {
return obj && obj.__esModule ? obj : {'default': obj};
};

let _interopRequire = function(obj) {
return obj && obj.__esModule ? obj['default'] : obj;
};

let pickASrc = _interopRequire(require('./src'));

let registerElement = _interopRequireWildcard(require('document-register-element'));

/*
 * The prototype
 */
let elementProto = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function value() {
            let _this = this;

            // get all the src element
            let srcs = this.getElementsByTagName('src');

            if (srcs.length) {
                pickASrc(Array.prototype.slice.call(srcs).map(function(s) {
                    return s.getAttribute('href');
                }), function(content) {
                    // check for shadow DOM
                    if (false && _this.createShadowRoot) {
                        let sr = _this.createShadowRoot();
                        sr.appendChild(content);
                    } else {
                        _this.appendChild(content);
                    }
                });
            }
        },
    },
});

// the register event stuff

module.exports = function() {
    let tag = arguments[0] === undefined ? 'svg-icon' : arguments[0];

    return function() {
        return document.registerElement(tag, {
            prototype: elementProto,
        });
    };
};
}, {'./src': 3, 'document-register-element': 4}], 3: [function(require, module, exports) {
'use strict';

/*
 * Check if this browser support SVG and createDocument()
 */
let supportsSVG = function supportsSVG() {
    // if it doesn't support createDocument()
    // it must be IE 8, this dude doesnt support SVG anyway
    return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1') && document.implementation.createDocument;
};

/*
 * Cache register for all the sources
 */
let _srcCache = {};

let _loadingCallback = {};

/*
 * Load
 */
let makeAjaxRequest = function makeAjaxRequest(file, cb) {
    let x = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
    x.open('GET', file, 1);
    //
    x.onreadystatechange = function() {
        if (x.readyState > 3) {
            if (x.status < 400) {
                cb(x.responseText);
            } else {
                cb(null);
            }
        }
        return;
    };
    x.send();
    return file;
};

/*
 * Create an alternative document object
 * @param content -  String
 */
let createDoc = function createDoc(content) {
    let srcDoc = document.implementation.createHTMLDocument('http://www.w3.org/1999/xhtml', 'html', null);

    let body = srcDoc.createElement('body');
    body.innerHTML = content;

    srcDoc.documentElement.appendChild(body);
    return srcDoc;
};

/*
 * Make a HTTP request for a file if needs to.
 * Return a document object
 * @param file - string
 * @param cb - function
 */
let loadSrc = function loadSrc(file, cb) {

    let callCallback = function callCallback(doc) {
        let cb;
        while (cb = _loadingCallback[file].shift()) {
            cb(doc);
        }
    };

    let doLoad = function doLoad() {
        if (!_loadingCallback[file]) {
            _loadingCallback[file] = [];

            makeAjaxRequest(file, function(content) {
                if (content) {
                    let doc = createDoc(content);
                    _srcCache[file] = doc;
                    callCallback(doc);
                } else {
                    callCallback(null);
                }
            });
        }

        _loadingCallback[file].push(cb);
    };

    return _srcCache[file] ? cb(_srcCache[file]) : doLoad();
};

/*
 * Recursively import nodes from an element to another
 * This exists because IE9 and below doesnt support innerHTML on SVGElement
 */
let importNodes = function importNodes(orig, dest) {
    for (let i = 0; i < orig.childNodes.length; i++) {
        dest.appendChild(orig.childNodes[i].cloneNode(true));
    };
    return dest;
};

/*
 * Create a SVG element
 * @param element - the original SVG element
 */
let createSvgElement = function createSvgElement(element) {
    let svg = importNodes(element, document.createElementNS('http://www.w3.org/2000/svg', 'svg'));

    // assign viewBox
    if (element.getAttribute('viewBox')) {
        svg.setAttribute('viewBox', element.getAttribute('viewBox'));
    }

    // namespace and stuff
    svg.setAttribute('xmlns', element.getAttribute('xmlns') ? element.getAttribute('xmlns') : 'http://www.w3.org/2000/svg');

    svg.setAttribute('version', element.getAttribute('version') ? element.getAttribute('version') : '1.1');

    return svg;
};

/*
 * Picks an icon source, fallbacks to other if one fails
 *
 * @param srcs - Array of source URL
 * @param callback - A callback function
 */

module.exports = function(srcs, callback) {
    let isSvg = function isSvg(url) {
        let parts = url.split('#');
        return /\.svg/.test(parts[0]);
    };

    var innerPicker = (function(_innerPicker) {
        let _innerPickerWrapper = function innerPicker() {
            return _innerPicker.apply(this, arguments);
        };

        _innerPickerWrapper.toString = function() {
            return _innerPicker.toString();
        };

        return _innerPickerWrapper;
    })(function(c) {
        if (c >= srcs.length) {
            return void 0;
        }

        //
        let nex = c + 1;
        let src = srcs[c];
        let isSvgSupported = supportsSVG();

        if (isSvg(src)) {
            if (!isSvgSupported) {
                return innerPicker(nex);
            } else {
                let _ret = (function() {
                    let parts = src.split('#');
                    let anchor = parts[1];
                    return {
                        v: loadSrc(parts[0], function(doc) {
                            if (doc) {
                                let ele;

                                // check if the anchor matches any element in the document
                                // if not, then move on
                                if (anchor) {
                                    ele = doc.getElementById(anchor);

                                    if (!ele) {
                                        return innerPicker(nex);
                                    }
                                }

                                return callback(createSvgElement(anchor ? ele : doc.getElementsByTagName('svg')[0]));
                            }
                            return innerPicker(nex);
                        }),
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            }
        } else {
            let img = document.createElement('img');
            img.src = src;
            img.onerror = function() {
                innerPicker(nex);
            };

            img.onload = function() {
                callback(this);
            };
            return;
        }
    });

    // start the loop
    innerPicker(0);
};
}, {}], 4: [function(require, module, exports) {
/* ! (C) WebReflection Mit Style License */
(function(e, t, n, r) {
'use strict'; function rt(e, t) {
for (let n=0, r=e.length; n<r; n++)dt(e[n], t)
;} function it(e) {
for (var t=0, n=e.length, r; t<n; t++)r=e[t], nt(r, b[ot(r)])
;} function st(e) {
return function(t) {
j(t)&&(dt(t, e), rt(t.querySelectorAll(w), e));
}
;} function ot(e) {
let t=e.getAttribute('is'); var n=e.nodeName.toUpperCase(); var  r=S.call(y, t?v+t.toUpperCase():d+n); return t&&-1<r&&!ut(n, t)?-1:r;
} function ut(e, t) {
return -1<w.indexOf(e+'[is="'+t+'"]')
;} function at(e) {
let t=e.currentTarget; var n=e.attrChange; var r=e.prevValue; var  i=e.newValue; Q&&t.attributeChangedCallback&&e.attrName!=='style'&&t.attributeChangedCallback(e.attrName, n===e[a]?null:r, n===e[l]?null:i);
} function ft(e) {
let t=st(e); return function(e) {
X.push(t, e.target)
;}
;} function lt(e) {
K&&(K=!1, e.currentTarget.removeEventListener(h, lt)), rt((e.target||t).querySelectorAll(w), e.detail===o?o:s), B&&pt()
;} function ct(e, t) {
let n=this; q.call(n, e, t), G.call(n, {target: n});
} function ht(e, t) {
D(e, t), et?et.observe(e, z):(J&&(e.setAttribute=ct, e[i]=Z(e), e.addEventListener(p, G)), e.addEventListener(c, at)), e.createdCallback&&Q&&(e.created=!0, e.createdCallback(), e.created=!1);
} function pt() {
for (var e, t=0, n=F.length; t<n; t++)e=F[t], E.contains(e)||(F.splice(t, 1), dt(e, o));
} function dt(e, t) {
let n; var  r=ot(e); -1<r&&(tt(e, b[r]), r=0, t===s&&!e[s]?(e[o]=!1, e[s]=!0, r=1, B&&S.call(F, e)<0&&F.push(e)):t===o&&!e[o]&&(e[s]=!1, e[o]=!0, r=1), r&&(n=e[t+'Callback'])&&n.call(e));
}if (r in t) return; var i='__'+r+(Math.random()*1e5>>0); var s="attached"; var o="detached"; var u="extends"; var a="ADDITION"; var f="MODIFICATION"; var l="REMOVAL"; var c="DOMAttrModified"; var h="DOMContentLoaded"; var p="DOMSubtreeModified"; var d="<"; var v="="; var m=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/; var g=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"]; var y=[]; var b=[]; var w=""; var E=t.documentElement; var S=y.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t}; var x=n.prototype; var T=x.hasOwnProperty; var N=x.isPrototypeOf; var C=n.defineProperty; var k=n.getOwnPropertyDescriptor; var L=n.getOwnPropertyNames; var A=n.getPrototypeOf; var O=n.setPrototypeOf; var M=!!n.__proto__; var _=n.create||function vt(e){return e?(vt.prototype=e,new vt):this}; var D=O||(M?function(e,t){return e.__proto__=t,e}:L&&k?function(){function e(e,t){for(var n,r=L(t),i=0,s=r.length;i<s;i++)n=r[i],T.call(e,n)||C(e,n,k(t,n))}return function(t,n){do e(t,n);while((n=A(n))&&!N.call(n,t));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}); var P=e.MutationObserver||e.WebKitMutationObserver; var H=(e.HTMLElement||e.Element||e.Node).prototype; var B=!N.call(H,E); var j=B?function(e){return e.nodeType===1}:function(e){return N.call(H,e)}; var F=B&&[]; var I=H.cloneNode; var q=H.setAttribute; var R=H.removeAttribute; var U=t.createElement; var z=P&&{attributes:!0,characterData:!0,attributeOldValue:!0}; var W=P||function(e){J=!1,E.removeEventListener(c,W)}; var X; var V=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.msRequestAnimationFrame||function(e){setTimeout(e,10)}; var $=!1; var J=!0; var K=!0; var Q=!0; var G; var Y; var Z; var et; var tt; var  nt; O||M?(tt=function(e, t) {
N.call(t, e)||ht(e, t);
}, nt=ht):(tt=function(e, t) {
e[i]||(e[i]=n(!0), ht(e, t));
}, nt=tt), B?(J=!1, function() {
let e=k(H, 'addEventListener'); var t=e.value; var n=function(e){var t=new CustomEvent(c,{bubbles:!0});t.attrName=e,t.prevValue=this.getAttribute(e),t.newValue=null,t[l]=t.attrChange=2,R.call(this,e),this.dispatchEvent(t)}; var r=function(e,t){var n=this.hasAttribute(e),r=n&&this.getAttribute(e),i=new CustomEvent(c,{bubbles:!0});q.call(this,e,t),i.attrName=e,i.prevValue=n?r:null,i.newValue=t,n?i[f]=i.attrChange=1:i[a]=i.attrChange=0,this.dispatchEvent(i)}; var  s=function(e) {
let t=e.currentTarget; var n=t[i]; var r=e.propertyName; var  s; n.hasOwnProperty(r)&&(n=n[r], s=new CustomEvent(c, {bubbles: !0}), s.attrName=n.name, s.prevValue=n.value||null, s.newValue=n.value=t[r]||null, s.prevValue==null?s[a]=s.attrChange=0:s[f]=s.attrChange=1, t.dispatchEvent(s));
}; e.value=function(e, o, u) {
e===c&&this.attributeChangedCallback&&this.setAttribute!==r&&(this[i]={className: {name: 'class', value: this.className}}, this.setAttribute=r, this.removeAttribute=n, t.call(this, 'propertychange', s)), t.call(this, e, o, u)
;}, C(H, 'addEventListener', e);
}()):P||(E.addEventListener(c, W), E.setAttribute(i, 1), E.removeAttribute(i), J&&(G=function(e) {
let t=this; var n; var r; var  s; if (t===e.target) {
n=t[i], t[i]=r=Z(t); for (s in r) {
if (!(s in n)) return Y(0, t, s, n[s], r[s], a); if (r[s]!==n[s]) return Y(1, t, s, n[s], r[s], f);
}for (s in n) if(!(s in r)) return Y(2, t, s, n[s], r[s], l);
}
}, Y=function(e, t, n, r, i, s) {
let o={attrChange: e, currentTarget: t, attrName: n, prevValue: r, newValue: i}; o[s]=e, at(o)
;}, Z=function(e) {
for (var t, n, r={}, i=e.attributes, s=0, o=i.length; s<o; s++)t=i[s], n=t.name, n!=='setAttribute'&&(r[n]=t.value); return r;
})), t[r]=function(n, r) {
p=n.toUpperCase(), $||($=!0, P?(et=function(e, t) {
function n(e, t) {
for (let n=0, r=e.length; n<r; t(e[n++]));
} return new P(function(r) {
for (var i, s, o=0, u=r.length; o<u; o++)i=r[o], i.type==='childList'?(n(i.addedNodes, e), n(i.removedNodes, t)):(s=i.target, Q&&s.attributeChangedCallback&&i.attributeName!=='style'&&s.attributeChangedCallback(i.attributeName, i.oldValue, s.getAttribute(i.attributeName)))
;});
}(st(s), st(o)), et.observe(t, {childList: !0, subtree: !0})):(X=[], V(function E() {
while (X.length)X.shift().call(null, X.shift()); V(E);
}), t.addEventListener('DOMNodeInserted', ft(s)), t.addEventListener('DOMNodeRemoved', ft(o))), t.addEventListener(h, lt), t.addEventListener('readystatechange', lt), t.createElement=function(e, n) {
let r=U.apply(t, arguments); var i=""+e; var s=S.call(y,(n?v:d)+(n||i).toUpperCase()); var  o=-1<s; return n&&(r.setAttribute('is', n=n.toLowerCase()), o&&(o=ut(i.toUpperCase(), n))), Q=!t.createElement.innerHTMLHelper, o&&nt(r, b[s]), r;
}, H.cloneNode=function(e) {
let t=I.call(this, !!e); var  n=ot(t); return -1<n&&nt(t, b[n]), e&&it(t.querySelectorAll(w)), t
;}); if (-2<S.call(y, v+p)+S.call(y, d+p)) throw new Error('A '+n+' type is already registered'); if (!m.test(p)||-1<S.call(g, p)) throw new Error('The type '+n+' is invalid'); var i=function() {
return f?t.createElement(l, p):t.createElement(l)
;}; var a=r||x; var f=T.call(a,u); var l=f?r[u].toUpperCase():p; var c=y.push((f?v:d)+p)-1; var  p; return w=w.concat(w.length?',':'', f?l+'[is="'+n.toLowerCase()+'"]':l), i.prototype=b[c]=T.call(a, 'prototype')?a.prototype:_(H), rt(t.querySelectorAll(w), s), i
;}
;})(window, document, Object, 'registerElement');
}, {}]}, {}, [3, 2, 1]);
