!(function() {
  var e = function(t) {
    var r = new e.Builder();
    return (r.pipeline.add(e.trimmer, e.stopWordFilter, e.stemmer),
            r.searchPipeline.add(e.stemmer), t.call(r, r), r.build());
  };
  (e.version = '2.3.7'), (e.utils = {}),
      (e.utils.warn = (function(e) {
         return function(t) { e.console && console.warn && console.warn(t); };
       })(this)),
      (e.utils.asString = function(
           e) { return null == e ? '' : e.toString(); }),
      (e.utils.clone =
           function(e) {
             if (null == e)
               return e;
             for (var t = Object.create(null), r = Object.keys(e), i = 0;
                  i < r.length; i++) {
               var n = r[i], s = e[n];
               if (Array.isArray(s))
                 t[n] = s.slice();
               else {
                 if ('string' != typeof s && 'number' != typeof s &&
                     'boolean' != typeof s)
                   throw new TypeError(
                       'clone is not deep and does not support nested objects');
                 t[n] = s;
               }
             }
             return t;
           }),
      (e.FieldRef =
           function(e, t, r) {
             (this.docRef = e), (this.fieldName = t), (this._stringValue = r);
           }),
      (e.FieldRef.joiner = '/'),
      (e.FieldRef.fromString =
           function(t) {
             var r = t.indexOf(e.FieldRef.joiner);
             if (-1 === r)
               throw 'malformed field ref string';
             var i = t.slice(0, r), n = t.slice(r + 1);
             return new e.FieldRef(n, i, t);
           }),
      (e.FieldRef.prototype.toString =
           function() {
             return (null == this._stringValue &&
                         (this._stringValue =
                              this.fieldName + e.FieldRef.joiner + this.docRef),
                     this._stringValue);
           }),
      (e.Set =
           function(e) {
             if (((this.elements = Object.create(null)), e)) {
               this.length = e.length;
               for (var t = 0; t < this.length; t++)
                 this.elements[e[t]] = !0;
             } else
               this.length = 0;
           }),
      (e.Set.complete = {
        intersect : function(e) { return e; },
        union : function(e) { return e; },
        contains : function() { return !0; },
      }),
      (e.Set.empty = {
        intersect : function() { return this; },
        union : function(e) { return e; },
        contains : function() { return !1; },
      }),
      (e.Set.prototype.contains = function(e) { return !!this.elements[e]; }),
      (e.Set.prototype.intersect =
           function(t) {
             var r, i, n, s = [];
             if (t === e.Set.complete)
               return this;
             if (t === e.Set.empty)
               return t;
             (i = this.length < t.length ? ((r = this), t) : ((r = t), this)),
                 (n = Object.keys(r.elements));
             for (var o = 0; o < n.length; o++) {
               var a = n[o];
               a in i.elements && s.push(a);
             }
             return new e.Set(s);
           }),
      (e.Set.prototype.union =
           function(t) {
             return t === e.Set.complete
                        ? e.Set.complete
                        : t === e.Set.empty
                              ? this
                              : new e.Set(Object.keys(this.elements)
                                              .concat(Object.keys(t.elements)));
           }),
      (e.idf =
           function(e, t) {
             var r = 0;
             for (var i in e)
               '_index' != i && (r += Object.keys(e[i]).length);
             var n = (t - r + 0.5) / (r + 0.5);
             return Math.log(1 + Math.abs(n));
           }),
      (e.Token = function(
           e, t) { (this.str = e || ''), (this.metadata = t || {}); }),
      (e.Token.prototype.toString = function() { return this.str; }),
      (e.Token.prototype.update = function(
           e) { return (this.str = e(this.str, this.metadata)), this; }),
      (e.Token.prototype.clone =
           function(t) {
             return ((t = t || function(e) { return e; }),
                     new e.Token(t(this.str, this.metadata), this.metadata));
           }),
      (e.tokenizer =
           function(t, r) {
             if (null == t || null == t)
               return [];
             if (Array.isArray(t))
               return t.map(function(t) {
                 return new e.Token(e.utils.asString(t).toLowerCase(),
                                    e.utils.clone(r));
               });
             for (var i = t.toString().toLowerCase(), n = i.length, s = [],
                      o = 0, a = 0;
                  o <= n; o++) {
               var l = o - a;
               if (i.charAt(o).match(e.tokenizer.separator) || o == n) {
                 if (0 < l) {
                   var c = e.utils.clone(r) || {};
                   (c.position = [ a, l ]), (c.index = s.length),
                       s.push(new e.Token(i.slice(a, o), c));
                 }
                 a = o + 1;
               }
             }
             return s;
           }),
      (e.tokenizer.separator = /[\s\-]+/),
      (e.Pipeline = function() { this._stack = []; }),
      (e.Pipeline.registeredFunctions = Object.create(null)),
      (e.Pipeline.registerFunction =
           function(t, r) {
             r in this.registeredFunctions &&
                 e.utils.warn('Overwriting existing registered function: ' + r),
                 (t.label = r), (e.Pipeline.registeredFunctions[t.label] = t);
           }),
      (e.Pipeline.warnIfFunctionNotRegistered =
           function(t) {
             (t.label && t.label in this.registeredFunctions) ||
                 e.utils.warn(
                     'Function is not registered with pipeline. This may cause problems when serialising the index.\n',
                     t);
           }),
      (e.Pipeline.load =
           function(t) {
             var r = new e.Pipeline();
             return (t.forEach(function(t) {
               var i = e.Pipeline.registeredFunctions[t];
               if (!i)
                 throw new Error('Cannot load unregistered function: ' + t);
               r.add(i);
             }),
                     r);
           }),
      (e.Pipeline.prototype.add =
           function() {
             Array.prototype.slice.call(arguments).forEach(function(t) {
               e.Pipeline.warnIfFunctionNotRegistered(t), this._stack.push(t);
             }, this);
           }),
      (e.Pipeline.prototype.after =
           function(t, r) {
             e.Pipeline.warnIfFunctionNotRegistered(r);
             var i = this._stack.indexOf(t);
             if (-1 == i)
               throw new Error('Cannot find existingFn');
             (i += 1), this._stack.splice(i, 0, r);
           }),
      (e.Pipeline.prototype.before =
           function(t, r) {
             e.Pipeline.warnIfFunctionNotRegistered(r);
             var i = this._stack.indexOf(t);
             if (-1 == i)
               throw new Error('Cannot find existingFn');
             this._stack.splice(i, 0, r);
           }),
      (e.Pipeline.prototype.remove =
           function(e) {
             var t = this._stack.indexOf(e);
             -1 != t && this._stack.splice(t, 1);
           }),
      (e.Pipeline.prototype.run =
           function(e) {
             for (var t = this._stack.length, r = 0; r < t; r++) {
               for (var i = this._stack[r], n = [], s = 0; s < e.length; s++) {
                 var o = i(e[s], s, e);
                 if (null != o && '' !== o)
                   if (Array.isArray(o))
                     for (var a = 0; a < o.length; a++)
                       n.push(o[a]);
                   else
                     n.push(o);
               }
               e = n;
             }
             return e;
           }),
      (e.Pipeline.prototype.runString =
           function(t, r) {
             var i = new e.Token(t, r);
             return this.run([ i ]).map(function(e) { return e.toString(); });
           }),
      (e.Pipeline.prototype.reset = function() { this._stack = []; }),
      (e.Pipeline.prototype.toJSON =
           function() {
             return this._stack.map(function(t) {
               return e.Pipeline.warnIfFunctionNotRegistered(t), t.label;
             });
           }),
      (e.Vector = function(
           e) { (this._magnitude = 0), (this.elements = e || []); }),
      (e.Vector.prototype.positionForIndex =
           function(e) {
             if (0 == this.elements.length)
               return 0;
             for (var t = 0, r = this.elements.length / 2, i = r - t,
                      n = Math.floor(i / 2), s = this.elements[2 * n];
                  1 < i && (s < e && (t = n), e < s && (r = n), s != e);

             )
               (i = r - t), (n = t + Math.floor(i / 2)),
                   (s = this.elements[2 * n]);
             return s == e ? 2 * n
                           : e < s ? 2 * n : s < e ? 2 * (n + 1) : void 0;
           }),
      (e.Vector.prototype.insert = function(
           e,
           t) { this.upsert(e, t, function() { throw 'duplicate index'; }); }),
      (e.Vector.prototype.upsert =
           function(e, t, r) {
             this._magnitude = 0;
             var i = this.positionForIndex(e);
             this.elements[i] == e
                 ? (this.elements[i + 1] = r(this.elements[i + 1], t))
                 : this.elements.splice(i, 0, e, t);
           }),
      (e.Vector.prototype.magnitude =
           function() {
             if (this._magnitude)
               return this._magnitude;
             for (var e = 0, t = this.elements.length, r = 1; r < t; r += 2) {
               var i = this.elements[r];
               e += i * i;
             }
             return (this._magnitude = Math.sqrt(e));
           }),
      (e.Vector.prototype.dot =
           function(e) {
             for (var t = 0, r = this.elements, i = e.elements, n = r.length,
                      s = i.length, o = 0, a = 0, u = 0, l = 0;
                  u < n && l < s;

             )
               (o = r[u]) < (a = i[l])
                   ? (u += 2)
                   : a < o ? (l += 2)
                           : o == a && ((t += r[u + 1] * i[l + 1]), (u += 2),
                                        (l += 2));
             return t;
           }),
      (e.Vector.prototype.similarity = function(
           e) { return this.dot(e) / this.magnitude() || 0; }),
      (e.Vector.prototype.toArray =
           function() {
             for (var e = new Array(this.elements.length / 2), t = 1, r = 0;
                  t < this.elements.length; t += 2, r++)
               e[r] = this.elements[t];
             return e;
           }),
      (e.Vector.prototype.toJSON = function() { return this.elements; }),
      (e.stemmer = (function() {
         var e = {
           ational : 'ate',
           tional : 'tion',
           enci : 'ence',
           anci : 'ance',
           izer : 'ize',
           bli : 'ble',
           alli : 'al',
           entli : 'ent',
           eli : 'e',
           ousli : 'ous',
           ization : 'ize',
           ation : 'ate',
           ator : 'ate',
           alism : 'al',
           iveness : 'ive',
           fulness : 'ful',
           ousness : 'ous',
           aliti : 'al',
           iviti : 'ive',
           biliti : 'ble',
           logi : 'log',
         },
             t = {
               icate : 'ic',
               ative : '',
               alize : 'al',
               iciti : 'ic',
               ical : 'ic',
               ful : '',
               ness : '',
             },
             i = '[aeiouy]', n = '[^aeiou][^aeiouy]*',
             c = new RegExp(
                 '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*'),
             h = new RegExp(
                 '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*'),
             d = new RegExp(
                 '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$'),
             f = new RegExp('^([^aeiou][^aeiouy]*)?[aeiouy]'),
             p = /^(.+?)(ss|i)es$/, y = /^(.+?)([^s])s$/, m = /^(.+?)eed$/,
             v = /^(.+?)(ed|ing)$/, g = /.$/, x = /(at|bl|iz)$/,
             w = new RegExp('([^aeiouylsz])\\1$'),
             Q = new RegExp('^' + n + i + '[^aeiouwxy]$'),
             k = /^(.+?[^aeiou])y$/,
             S = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,
             E = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,
             L = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,
             b = /^(.+?)(s|t)(ion)$/, P = /^(.+?)e$/, T = /ll$/,
             O = new RegExp('^' + n + i + '[^aeiouwxy]$'), I = function(r) {
               var i, n, s, o, a, u, l;
               if (r.length < 3)
                 return r;
               if (('y' == (s = r.substr(0, 1)) &&
                        (r = s.toUpperCase() + r.substr(1)),
                    (a = y),
                    (o = p).test(r) ? (r = r.replace(o, '$1$2'))
                                    : a.test(r) && (r = r.replace(a, '$1$2')),
                    (a = v), (o = m).test(r))) {
                 var I = o.exec(r);
                 (o = c).test(I[1]) && ((o = g), (r = r.replace(o, '')));
               } else if (a.test(r)) {
                 (i = (I = a.exec(r))[1]),
                     (a = f).test(i) &&
                         ((u = w), (l = Q),
                          (a = x).test((r = i))
                              ? (r += 'e')
                              : u.test(r) ? ((o = g), (r = r.replace(o, '')))
                                          : l.test(r) && (r += 'e'));
               }
               (o = k).test(r) && (r = (i = (I = o.exec(r))[1]) + 'i');
               (o = S).test(r) && ((i = (I = o.exec(r))[1]), (n = I[2]),
                                   (o = c).test(i) && (r = i + e[n]));
               (o = E).test(r) && ((i = (I = o.exec(r))[1]), (n = I[2]),
                                   (o = c).test(i) && (r = i + t[n]));
               if (((a = b), (o = L).test(r)))
                 (i = (I = o.exec(r))[1]), (o = h).test(i) && (r = i);
               else if (a.test(r)) {
                 (i = (I = a.exec(r))[1] + I[2]), (a = h).test(i) && (r = i);
               }
               (o = P).test(r) &&
                   ((i = (I = o.exec(r))[1]), (a = d), (u = O),
                    ((o = h).test(i) || (a.test(i) && !u.test(i))) && (r = i));
               return ((a = h),
                       (o = T).test(r) && a.test(r) &&
                           ((o = g), (r = r.replace(o, ''))),
                       'y' == s && (r = s.toLowerCase() + r.substr(1)), r);
             };
         return function(e) { return e.update(I); };
       })()),
      e.Pipeline.registerFunction(e.stemmer, 'stemmer'),
      (e.generateStopWordFilter =
           function(e) {
             var t = e.reduce(function(e, t) { return (e[t] = t), e; }, {});
             return function(e) {
               if (e && t[e.toString()] !== e.toString())
                 return e;
             };
           }),
      (e.stopWordFilter = e.generateStopWordFilter([
        'a',      'able',    'about', 'across',  'after', 'all',    'almost',
        'also',   'am',      'among', 'an',      'and',   'any',    'are',
        'as',     'at',      'be',    'because', 'been',  'but',    'by',
        'can',    'cannot',  'could', 'dear',    'did',   'do',     'does',
        'either', 'else',    'ever',  'every',   'for',   'from',   'get',
        'got',    'had',     'has',   'have',    'he',    'her',    'hers',
        'him',    'his',     'how',   'however', 'i',     'if',     'in',
        'into',   'is',      'it',    'its',     'just',  'least',  'let',
        'like',   'likely',  'may',   'me',      'might', 'most',   'must',
        'my',     'neither', 'no',    'nor',     'not',   'of',     'off',
        'often',  'on',      'only',  'or',      'other', 'our',    'own',
        'rather', 'said',    'say',   'says',    'she',   'should', 'since',
        'so',     'some',    'than',  'that',    'the',   'their',  'them',
        'then',   'there',   'these', 'they',    'this',  'tis',    'to',
        'too',    'twas',    'us',    'wants',   'was',   'we',     'were',
        'what',   'when',    'where', 'which',   'while', 'who',    'whom',
        'why',    'will',    'with',  'would',   'yet',   'you',    'your',
      ])),
      e.Pipeline.registerFunction(e.stopWordFilter, 'stopWordFilter'),
      (e.trimmer =
           function(e) {
             return e.update(function(
                 e) { return e.replace(/^\W+/, '').replace(/\W+$/, ''); });
           }),
      e.Pipeline.registerFunction(e.trimmer, 'trimmer'),
      (e.TokenSet =
           function() {
             (this.final = !1), (this.edges = {}),
                 (this.id = e.TokenSet._nextId), (e.TokenSet._nextId += 1);
           }),
      (e.TokenSet._nextId = 1),
      (e.TokenSet.fromArray =
           function(t) {
             for (var r = new e.TokenSet.Builder(), i = 0, n = t.length; i < n;
                  i++)
               r.insert(t[i]);
             return r.finish(), r.root;
           }),
      (e.TokenSet.fromClause =
           function(t) {
             return 'editDistance' in t
                        ? e.TokenSet.fromFuzzyString(t.term, t.editDistance)
                        : e.TokenSet.fromString(t.term);
           }),
      (e.TokenSet.fromFuzzyString =
           function(t, r) {
             for (var i = new e.TokenSet(),
                      n = [ {node : i, editsRemaining : r, str : t} ];
                  n.length;

             ) {
               var s = n.pop();
               if (0 < s.str.length) {
                 var o, a = s.str.charAt(0);
                 a in s.node.edges
                     ? (o = s.node.edges[a])
                     : ((o = new e.TokenSet()), (s.node.edges[a] = o)),
                     1 == s.str.length && (o.final = !0), n.push({
                       node : o,
                       editsRemaining : s.editsRemaining,
                       str : s.str.slice(1),
                     });
               }
               if (0 != s.editsRemaining) {
                 if ('*' in s.node.edges)
                   var u = s.node.edges['*'];
                 else {
                   u = new e.TokenSet();
                   s.node.edges['*'] = u;
                 }
                 if ((0 == s.str.length && (u.final = !0), n.push({
                       node : u,
                       editsRemaining : s.editsRemaining - 1,
                       str : s.str,
                     }),
                      1 < s.str.length && n.push({
                        node : s.node,
                        editsRemaining : s.editsRemaining - 1,
                        str : s.str.slice(1),
                      }),
                      1 == s.str.length && (s.node.final = !0),
                      1 <= s.str.length)) {
                   if ('*' in s.node.edges)
                     var l = s.node.edges['*'];
                   else {
                     l = new e.TokenSet();
                     s.node.edges['*'] = l;
                   }
                   1 == s.str.length && (l.final = !0), n.push({
                     node : l,
                     editsRemaining : s.editsRemaining - 1,
                     str : s.str.slice(1),
                   });
                 }
                 if (1 < s.str.length) {
                   var c, h = s.str.charAt(0), d = s.str.charAt(1);
                   d in s.node.edges
                       ? (c = s.node.edges[d])
                       : ((c = new e.TokenSet()), (s.node.edges[d] = c)),
                       1 == s.str.length && (c.final = !0), n.push({
                         node : c,
                         editsRemaining : s.editsRemaining - 1,
                         str : h + s.str.slice(2),
                       });
                 }
               }
             }
             return i;
           }),
      (e.TokenSet.fromString =
           function(t) {
             for (var r = new e.TokenSet(), i = r, n = 0, s = t.length; n < s;
                  n++) {
               var o = t[n], a = n == s - 1;
               if ('*' == o)
                 (r.edges[o] = r).final = a;
               else {
                 var u = new e.TokenSet();
                 (u.final = a), (r.edges[o] = u), (r = u);
               }
             }
             return i;
           }),
      (e.TokenSet.prototype.toArray =
           function() {
             for (var e = [], t = [ {prefix : '', node : this} ]; t.length;) {
               var r = t.pop(), i = Object.keys(r.node.edges), n = i.length;
               r.node.final && (r.prefix.charAt(0), e.push(r.prefix));
               for (var s = 0; s < n; s++) {
                 var o = i[s];
                 t.push({prefix : r.prefix.concat(o), node : r.node.edges[o]});
               }
             }
             return e;
           }),
      (e.TokenSet.prototype.toString =
           function() {
             if (this._str)
               return this._str;
             for (var e = this.final ? '1' : '0',
                      t = Object.keys(this.edges).sort(), r = t.length, i = 0;
                  i < r; i++) {
               var n = t[i];
               e = e + n + this.edges[n].id;
             }
             return e;
           }),
      (e.TokenSet.prototype.intersect =
           function(t) {
             for (var r = new e.TokenSet(), i = void 0,
                      n = [ {qNode : t, output : r, node : this} ];
                  n.length;

             ) {
               i = n.pop();
               for (var s = Object.keys(i.qNode.edges), o = s.length,
                        a = Object.keys(i.node.edges), u = a.length, l = 0;
                    l < o; l++)
                 for (var c = s[l], h = 0; h < u; h++) {
                   var d = a[h];
                   if (d == c || '*' == c) {
                     var f = i.node.edges[d], p = i.qNode.edges[c],
                         y = f.final && p.final, m = void 0;
                     d in i.output.edges
                         ? ((m = i.output.edges[d]).final = m.final || y)
                         : (((m = new e.TokenSet()).final = y),
                            (i.output.edges[d] = m)),
                         n.push({qNode : p, output : m, node : f});
                   }
                 }
             }
             return r;
           }),
      (e.TokenSet.Builder =
           function() {
             (this.previousWord = ''), (this.root = new e.TokenSet()),
                 (this.uncheckedNodes = []), (this.minimizedNodes = {});
           }),
      (e.TokenSet.Builder.prototype.insert =
           function(t) {
             var r, i = 0;
             if (t < this.previousWord)
               throw new Error('Out of order word insertion');
             for (var n = 0; n < t.length && n < this.previousWord.length &&
                             t[n] == this.previousWord[n];
                  n++)
               i++;
             this.minimize(i),
                 (r = 0 == this.uncheckedNodes.length
                          ? this.root
                          : this.uncheckedNodes[this.uncheckedNodes.length - 1]
                                .child);
             for (n = i; n < t.length; n++) {
               var s = new e.TokenSet(), o = t[n];
               (r.edges[o] = s),
                   this.uncheckedNodes.push({parent : r, char : o, child : s}),
                   (r = s);
             }
             (r.final = !0), (this.previousWord = t);
           }),
      (e.TokenSet.Builder.prototype.finish = function() { this.minimize(0); }),
      (e.TokenSet.Builder.prototype.minimize =
           function(e) {
             for (var t = this.uncheckedNodes.length - 1; e <= t; t--) {
               var r = this.uncheckedNodes[t], i = r.child.toString();
               i in this.minimizedNodes
                   ? (r.parent.edges[r.char] = this.minimizedNodes[i])
                   : ((r.child._str = i), (this.minimizedNodes[i] = r.child)),
                   this.uncheckedNodes.pop();
             }
           }),
      (e.Index =
           function(e) {
             (this.invertedIndex = e.invertedIndex),
                 (this.fieldVectors = e.fieldVectors),
                 (this.tokenSet = e.tokenSet), (this.fields = e.fields),
                 (this.pipeline = e.pipeline);
           }),
      (e.Index.prototype.search =
           function(t) {
             return this.query(function(
                 r) { new e.QueryParser(t, r).parse(); });
           }),
      (e.Index.prototype.query =
           function(t) {
             for (var r = new e.Query(this.fields), i = Object.create(null),
                      n = Object.create(null), s = Object.create(null),
                      o = Object.create(null), a = Object.create(null), u = 0;
                  u < this.fields.length; u++)
               n[this.fields[u]] = new e.Vector();
             t.call(r, r);
             for (u = 0; u < r.clauses.length; u++) {
               var c, l = r.clauses[u], h = e.Set.complete;
               c = l.usePipeline
                       ? this.pipeline.runString(l.term, {fields : l.fields})
                       : [ l.term ];
               for (var d = 0; d < c.length; d++) {
                 var f = c[d];
                 l.term = f;
                 var p = e.TokenSet.fromClause(l),
                     y = this.tokenSet.intersect(p).toArray();
                 if (0 === y.length &&
                     l.presence === e.Query.presence.REQUIRED) {
                   for (var m = 0; m < l.fields.length; m++) {
                     o[(v = l.fields[m])] = e.Set.empty;
                   }
                   break;
                 }
                 for (var g = 0; g < y.length; g++) {
                   var x = y[g], w = this.invertedIndex[x], Q = w._index;
                   for (m = 0; m < l.fields.length; m++) {
                     var k = w[(v = l.fields[m])], S = Object.keys(k),
                         E = x + '/' + v, L = new e.Set(S);
                     if ((l.presence == e.Query.presence.REQUIRED &&
                              ((h = h.union(L)),
                               void 0 === o[v] && (o[v] = e.Set.complete)),
                          l.presence != e.Query.presence.PROHIBITED)) {
                       if ((n[v].upsert(Q, l.boost,
                                        function(e, t) { return e + t; }),
                            !s[E])) {
                         for (var b = 0; b < S.length; b++) {
                           var P, T = S[b], O = new e.FieldRef(T, v), I = k[T];
                           void 0 === (P = i[O])
                               ? (i[O] = new e.MatchData(x, v, I))
                               : P.add(x, v, I);
                         }
                         s[E] = !0;
                       }
                     } else
                       void 0 === a[v] && (a[v] = e.Set.empty),
                           (a[v] = a[v].union(L));
                   }
                 }
               }
               if (l.presence === e.Query.presence.REQUIRED)
                 for (m = 0; m < l.fields.length; m++) {
                   o[(v = l.fields[m])] = o[v].intersect(h);
                 }
             }
             var R = e.Set.complete, F = e.Set.empty;
             for (u = 0; u < this.fields.length; u++) {
               var v;
               o[(v = this.fields[u])] && (R = R.intersect(o[v])),
                   a[v] && (F = F.union(a[v]));
             }
             var C = Object.keys(i), N = [], _ = Object.create(null);
             if (r.isNegated()) {
               C = Object.keys(this.fieldVectors);
               for (u = 0; u < C.length; u++) {
                 O = C[u];
                 var j = e.FieldRef.fromString(O);
                 i[O] = new e.MatchData();
               }
             }
             for (u = 0; u < C.length; u++) {
               var D = (j = e.FieldRef.fromString(C[u])).docRef;
               if (R.contains(D) && !F.contains(D)) {
                 var A, B = this.fieldVectors[j],
                        V = n[j.fieldName].similarity(B);
                 if (void 0 !== (A = _[D]))
                   (A.score += V), A.matchData.combine(i[j]);
                 else {
                   var z = {ref : D, score : V, matchData : i[j]};
                   (_[D] = z), N.push(z);
                 }
               }
             }
             return N.sort(function(e, t) { return t.score - e.score; });
           }),
      (e.Index.prototype.toJSON =
           function() {
             var t = Object.keys(this.invertedIndex).sort().map(function(e) {
               return [ e, this.invertedIndex[e] ];
             }, this), r = Object.keys(this.fieldVectors).map(function(e) {
               return [ e, this.fieldVectors[e].toJSON() ];
             }, this);
             return {
               version : e.version,
               fields : this.fields,
               fieldVectors : r,
               invertedIndex : t,
               pipeline : this.pipeline.toJSON(),
             };
           }),
      (e.Index.load =
           function(t) {
             var r = {}, i = {}, n = t.fieldVectors, s = Object.create(null),
                 o = t.invertedIndex, a = new e.TokenSet.Builder(),
                 u = e.Pipeline.load(t.pipeline);
             t.version != e.version &&
                 e.utils.warn(
                     "Version mismatch when loading serialised index. Current version of lunr '" +
                     e.version + "' does not match serialized index '" +
                     t.version + "'");
             for (var l = 0; l < n.length; l++) {
               var h = (c = n[l])[0], d = c[1];
               i[h] = new e.Vector(d);
             }
             for (l = 0; l < o.length; l++) {
               var c, f = (c = o[l])[0], p = c[1];
               a.insert(f), (s[f] = p);
             }
             return (a.finish(), (r.fields = t.fields), (r.fieldVectors = i),
                     (r.invertedIndex = s), (r.tokenSet = a.root),
                     (r.pipeline = u), new e.Index(r));
           }),
      (e.Builder =
           function() {
             (this._ref = 'id'), (this._fields = Object.create(null)),
                 (this._documents = Object.create(null)),
                 (this.invertedIndex = Object.create(null)),
                 (this.fieldTermFrequencies = {}), (this.fieldLengths = {}),
                 (this.tokenizer = e.tokenizer),
                 (this.pipeline = new e.Pipeline()),
                 (this.searchPipeline = new e.Pipeline()),
                 (this.documentCount = 0), (this._b = 0.75), (this._k1 = 1.2),
                 (this.termIndex = 0), (this.metadataWhitelist = []);
           }),
      (e.Builder.prototype.ref = function(e) { this._ref = e; }),
      (e.Builder.prototype.field =
           function(e, t) {
             if (/\//.test(e))
               throw new RangeError("Field '" + e +
                                    "' contains illegal character '/'");
             this._fields[e] = t || {};
           }),
      (e.Builder.prototype.b = function(
           e) { this._b = e < 0 ? 0 : 1 < e ? 1 : e; }),
      (e.Builder.prototype.k1 = function(e) { this._k1 = e; }),
      (e.Builder.prototype.add =
           function(t, r) {
             var i = t[this._ref], n = Object.keys(this._fields);
             (this._documents[i] = r || {}), (this.documentCount += 1);
             for (var s = 0; s < n.length; s++) {
               var o = n[s], a = this._fields[o].extractor, u = a ? a(t) : t[o],
                   l = this.tokenizer(u, {fields : [ o ]}),
                   c = this.pipeline.run(l), h = new e.FieldRef(i, o),
                   d = Object.create(null);
               (this.fieldTermFrequencies[h] = d), (this.fieldLengths[h] = 0),
                   (this.fieldLengths[h] += c.length);
               for (var f = 0; f < c.length; f++) {
                 var p = c[f];
                 if ((null == d[p] && (d[p] = 0), (d[p] += 1),
                      null == this.invertedIndex[p])) {
                   var y = Object.create(null);
                   (y._index = this.termIndex), (this.termIndex += 1);
                   for (var m = 0; m < n.length; m++)
                     y[n[m]] = Object.create(null);
                   this.invertedIndex[p] = y;
                 }
                 null == this.invertedIndex[p][o][i] &&
                     (this.invertedIndex[p][o][i] = Object.create(null));
                 for (var v = 0; v < this.metadataWhitelist.length; v++) {
                   var g = this.metadataWhitelist[v], x = p.metadata[g];
                   null == this.invertedIndex[p][o][i][g] &&
                       (this.invertedIndex[p][o][i][g] = []),
                       this.invertedIndex[p][o][i][g].push(x);
                 }
               }
             }
           }),
      (e.Builder.prototype.calculateAverageFieldLengths =
           function() {
             for (var t = Object.keys(this.fieldLengths), r = t.length, i = {},
                      n = {}, s = 0;
                  s < r; s++) {
               var o = e.FieldRef.fromString(t[s]), a = o.fieldName;
               n[a] || (n[a] = 0), (n[a] += 1), i[a] || (i[a] = 0),
                   (i[a] += this.fieldLengths[o]);
             }
             var u = Object.keys(this._fields);
             for (s = 0; s < u.length; s++) {
               var l = u[s];
               i[l] = i[l] / n[l];
             }
             this.averageFieldLength = i;
           }),
      (e.Builder.prototype.createFieldVectors =
           function() {
             for (var t = {}, r = Object.keys(this.fieldTermFrequencies),
                      i = r.length, n = Object.create(null), s = 0;
                  s < i; s++) {
               for (var o = e.FieldRef.fromString(r[s]), a = o.fieldName,
                        u = this.fieldLengths[o], l = new e.Vector(),
                        c = this.fieldTermFrequencies[o], h = Object.keys(c),
                        d = h.length, f = this._fields[a].boost || 1,
                        p = this._documents[o.docRef].boost || 1, y = 0;
                    y < d; y++) {
                 var m, v, g, x = h[y], w = c[x],
                              Q = this.invertedIndex[x]._index;
                 void 0 === n[x]
                     ? ((m = e.idf(this.invertedIndex[x], this.documentCount)),
                        (n[x] = m))
                     : (m = n[x]),
                     (v = (m * ((this._k1 + 1) * w)) /
                          (this._k1 *
                               (1 - this._b +
                                this._b * (u / this.averageFieldLength[a])) +
                           w)),
                     (v *= f), (v *= p), (g = Math.round(1e3 * v) / 1e3),
                     l.insert(Q, g);
               }
               t[o] = l;
             }
             this.fieldVectors = t;
           }),
      (e.Builder.prototype.createTokenSet =
           function() {
             this.tokenSet =
                 e.TokenSet.fromArray(Object.keys(this.invertedIndex).sort());
           }),
      (e.Builder.prototype.build =
           function() {
             return (this.calculateAverageFieldLengths(),
                     this.createFieldVectors(), this.createTokenSet(),
                     new e.Index({
                       invertedIndex : this.invertedIndex,
                       fieldVectors : this.fieldVectors,
                       tokenSet : this.tokenSet,
                       fields : Object.keys(this._fields),
                       pipeline : this.searchPipeline,
                     }));
           }),
      (e.Builder.prototype.use =
           function(e) {
             var t = Array.prototype.slice.call(arguments, 1);
             t.unshift(this), e.apply(this, t);
           }),
      (e.MatchData =
           function(e, t, r) {
             for (var i = Object.create(null), n = Object.keys(r || {}), s = 0;
                  s < n.length; s++) {
               var o = n[s];
               i[o] = r[o].slice();
             }
             (this.metadata = Object.create(null)),
                 void 0 !== e && ((this.metadata[e] = Object.create(null)),
                                  (this.metadata[e][t] = i));
           }),
      (e.MatchData.prototype.combine =
           function(e) {
             for (var t = Object.keys(e.metadata), r = 0; r < t.length; r++) {
               var i = t[r], n = Object.keys(e.metadata[i]);
               null == this.metadata[i] &&
                   (this.metadata[i] = Object.create(null));
               for (var s = 0; s < n.length; s++) {
                 var o = n[s], a = Object.keys(e.metadata[i][o]);
                 null == this.metadata[i][o] &&
                     (this.metadata[i][o] = Object.create(null));
                 for (var u = 0; u < a.length; u++) {
                   var l = a[u];
                   null == this.metadata[i][o][l]
                       ? (this.metadata[i][o][l] = e.metadata[i][o][l])
                       : (this.metadata[i][o][l] =
                              this.metadata[i][o][l].concat(
                                  e.metadata[i][o][l]));
                 }
               }
             }
           }),
      (e.MatchData.prototype.add =
           function(e, t, r) {
             if (!(e in this.metadata))
               return ((this.metadata[e] = Object.create(null)),
                       void (this.metadata[e][t] = r));
             if (t in this.metadata[e])
               for (var i = Object.keys(r), n = 0; n < i.length; n++) {
                 var s = i[n];
                 s in this.metadata[e][t]
                     ? (this.metadata[e][t][s] =
                            this.metadata[e][t][s].concat(r[s]))
                     : (this.metadata[e][t][s] = r[s]);
               }
             else
               this.metadata[e][t] = r;
           }),
      (e.Query = function(e) { (this.clauses = []), (this.allFields = e); }),
      (e.Query.wildcard = new String('*')), (e.Query.wildcard.NONE = 0),
      (e.Query.wildcard.LEADING = 1), (e.Query.wildcard.TRAILING = 2),
      (e.Query.presence = {OPTIONAL : 1, REQUIRED : 2, PROHIBITED : 3}),
      (e.Query.prototype.clause =
           function(t) {
             return ('fields' in t || (t.fields = this.allFields),
                     'boost' in t || (t.boost = 1),
                     'usePipeline' in t || (t.usePipeline = !0),
                     'wildcard' in t || (t.wildcard = e.Query.wildcard.NONE),
                     t.wildcard & e.Query.wildcard.LEADING &&
                         t.term.charAt(0) != e.Query.wildcard &&
                         (t.term = '*' + t.term),
                     t.wildcard & e.Query.wildcard.TRAILING &&
                         t.term.slice(-1) != e.Query.wildcard &&
                         (t.term = t.term + '*'),
                     'presence' in t ||
                         (t.presence = e.Query.presence.OPTIONAL),
                     this.clauses.push(t), this);
           }),
      (e.Query.prototype.isNegated =
           function() {
             for (var t = 0; t < this.clauses.length; t++)
               if (this.clauses[t].presence != e.Query.presence.PROHIBITED)
                 return !1;
             return !0;
           }),
      (e.Query.prototype.term =
           function(t, r) {
             if (Array.isArray(t))
               return (
                   t.forEach(function(t) { this.term(t, e.utils.clone(r)); },
                             this),
                   this);
             var i = r || {};
             return (i.term = t.toString()), this.clause(i), this;
           }),
      (e.QueryParseError =
           function(e, t, r) {
             (this.name = 'QueryParseError'), (this.message = e),
                 (this.start = t), (this.end = r);
           }),
      (e.QueryParseError.prototype = new Error()),
      (e.QueryLexer =
           function(e) {
             (this.lexemes = []), (this.str = e), (this.length = e.length),
                 (this.pos = 0), (this.start = 0),
                 (this.escapeCharPositions = []);
           }),
      (e.QueryLexer.prototype.run =
           function() {
             for (var t = e.QueryLexer.lexText; t;)
               t = t(this);
           }),
      (e.QueryLexer.prototype.sliceString =
           function() {
             for (var e = [], t = this.start, r = this.pos, i = 0;
                  i < this.escapeCharPositions.length; i++)
               (r = this.escapeCharPositions[i]), e.push(this.str.slice(t, r)),
                   (t = r + 1);
             return (e.push(this.str.slice(t, this.pos)),
                     (this.escapeCharPositions.length = 0), e.join(''));
           }),
      (e.QueryLexer.prototype.emit =
           function(e) {
             this.lexemes.push({
               type : e,
               str : this.sliceString(),
               start : this.start,
               end : this.pos,
             }),
                 (this.start = this.pos);
           }),
      (e.QueryLexer.prototype.escapeCharacter =
           function() {
             this.escapeCharPositions.push(this.pos - 1), (this.pos += 1);
           }),
      (e.QueryLexer.prototype.next =
           function() {
             if (this.pos >= this.length)
               return e.QueryLexer.EOS;
             var t = this.str.charAt(this.pos);
             return (this.pos += 1), t;
           }),
      (e.QueryLexer.prototype.width =
           function() { return this.pos - this.start; }),
      (e.QueryLexer.prototype.ignore =
           function() {
             this.start == this.pos && (this.pos += 1), (this.start = this.pos);
           }),
      (e.QueryLexer.prototype.backup = function() { this.pos -= 1; }),
      (e.QueryLexer.prototype.acceptDigitRun =
           function() {
             for (var t, r;
                  47 < (r = (t = this.next()).charCodeAt(0)) && r < 58;)
               ;
             t != e.QueryLexer.EOS && this.backup();
           }),
      (e.QueryLexer.prototype.more =
           function() { return this.pos < this.length; }),
      (e.QueryLexer.EOS = 'EOS'), (e.QueryLexer.FIELD = 'FIELD'),
      (e.QueryLexer.TERM = 'TERM'),
      (e.QueryLexer.EDIT_DISTANCE = 'EDIT_DISTANCE'),
      (e.QueryLexer.BOOST = 'BOOST'), (e.QueryLexer.PRESENCE = 'PRESENCE'),
      (e.QueryLexer.lexField =
           function(t) {
             return (t.backup(), t.emit(e.QueryLexer.FIELD), t.ignore(),
                     e.QueryLexer.lexText);
           }),
      (e.QueryLexer.lexTerm =
           function(t) {
             if ((1 < t.width() && (t.backup(), t.emit(e.QueryLexer.TERM)),
                  t.ignore(), t.more()))
               return e.QueryLexer.lexText;
           }),
      (e.QueryLexer.lexEditDistance =
           function(t) {
             return (t.ignore(), t.acceptDigitRun(),
                     t.emit(e.QueryLexer.EDIT_DISTANCE), e.QueryLexer.lexText);
           }),
      (e.QueryLexer.lexBoost =
           function(t) {
             return (t.ignore(), t.acceptDigitRun(), t.emit(e.QueryLexer.BOOST),
                     e.QueryLexer.lexText);
           }),
      (e.QueryLexer.lexEOS = function(
           t) { 0 < t.width() && t.emit(e.QueryLexer.TERM); }),
      (e.QueryLexer.termSeparator = e.tokenizer.separator),
      (e.QueryLexer.lexText = function(t) {
        for (;;) {
          var r = t.next();
          if (r == e.QueryLexer.EOS)
            return e.QueryLexer.lexEOS;
          if (92 != r.charCodeAt(0)) {
            if (':' == r)
              return e.QueryLexer.lexField;
            if ('~' == r)
              return (t.backup(), 0 < t.width() && t.emit(e.QueryLexer.TERM),
                      e.QueryLexer.lexEditDistance);
            if ('^' == r)
              return (t.backup(), 0 < t.width() && t.emit(e.QueryLexer.TERM),
                      e.QueryLexer.lexBoost);
            if ('+' == r && 1 === t.width())
              return t.emit(e.QueryLexer.PRESENCE), e.QueryLexer.lexText;
            if ('-' == r && 1 === t.width())
              return t.emit(e.QueryLexer.PRESENCE), e.QueryLexer.lexText;
            if (r.match(e.QueryLexer.termSeparator))
              return e.QueryLexer.lexTerm;
          } else
            t.escapeCharacter();
        }
      }), (e.QueryParser = function(t, r) {
        (this.lexer = new e.QueryLexer(t)), (this.query = r),
            (this.currentClause = {}), (this.lexemeIdx = 0);
      }), (e.QueryParser.prototype.parse = function() {
        this.lexer.run(), (this.lexemes = this.lexer.lexemes);
        for (var t = e.QueryParser.parseClause; t;)
          t = t(this);
        return this.query;
      }), (e.QueryParser.prototype.peekLexeme = function() {
        return this.lexemes[this.lexemeIdx];
      }), (e.QueryParser.prototype.consumeLexeme = function() {
        var e = this.peekLexeme();
        return (this.lexemeIdx += 1), e;
      }), (e.QueryParser.prototype.nextClause = function() {
        var e = this.currentClause;
        this.query.clause(e), (this.currentClause = {});
      }), (e.QueryParser.parseClause = function(t) {
        var r = t.peekLexeme();
        if (null != r)
          switch (r.type) {
          case e.QueryLexer.PRESENCE:
            return e.QueryParser.parsePresence;
          case e.QueryLexer.FIELD:
            return e.QueryParser.parseField;
          case e.QueryLexer.TERM:
            return e.QueryParser.parseTerm;
          default:
            var i = 'expected either a field or a term, found ' + r.type;
            throw ((1 <= r.str.length && (i += " with value '" + r.str + "'"),
                    new e.QueryParseError(i, r.start, r.end)));
          }
      }), (e.QueryParser.parsePresence = function(t) {
        var r = t.consumeLexeme();
        if (null != r) {
          switch (r.str) {
          case '-':
            t.currentClause.presence = e.Query.presence.PROHIBITED;
            break;
          case '+':
            t.currentClause.presence = e.Query.presence.REQUIRED;
            break;
          default:
            var i = "unrecognised presence operator'" + r.str + "'";
            throw new e.QueryParseError(i, r.start, r.end);
          }
          var n = t.peekLexeme();
          if (null == n) {
            i = 'expecting term or field, found nothing';
            throw new e.QueryParseError(i, r.start, r.end);
          }
          switch (n.type) {
          case e.QueryLexer.FIELD:
            return e.QueryParser.parseField;
          case e.QueryLexer.TERM:
            return e.QueryParser.parseTerm;
          default:
            i = "expecting term or field, found '" + n.type + "'";
            throw new e.QueryParseError(i, n.start, n.end);
          }
        }
      }), (e.QueryParser.parseField = function(t) {
        var r = t.consumeLexeme();
        if (null != r) {
          if (-1 == t.query.allFields.indexOf(r.str)) {
            var i = t.query.allFields.map(function(e) { return "'" + e + "'"; })
                        .join(', '),
                n = "unrecognised field '" + r.str + "', possible fields: " + i;
            throw new e.QueryParseError(n, r.start, r.end);
          }
          t.currentClause.fields = [ r.str ];
          var s = t.peekLexeme();
          if (null == s) {
            n = 'expecting term, found nothing';
            throw new e.QueryParseError(n, r.start, r.end);
          }
          switch (s.type) {
          case e.QueryLexer.TERM:
            return e.QueryParser.parseTerm;
          default:
            n = "expecting term, found '" + s.type + "'";
            throw new e.QueryParseError(n, s.start, s.end);
          }
        }
      }), (e.QueryParser.parseTerm = function(t) {
        var r = t.consumeLexeme();
        if (null != r) {
          (t.currentClause.term = r.str.toLowerCase()),
              -1 != r.str.indexOf('*') && (t.currentClause.usePipeline = !1);
          var i = t.peekLexeme();
          if (null == i)
            return void t.nextClause();
          switch (i.type) {
          case e.QueryLexer.TERM:
            return t.nextClause(), e.QueryParser.parseTerm;
          case e.QueryLexer.FIELD:
            return t.nextClause(), e.QueryParser.parseField;
          case e.QueryLexer.EDIT_DISTANCE:
            return e.QueryParser.parseEditDistance;
          case e.QueryLexer.BOOST:
            return e.QueryParser.parseBoost;
          case e.QueryLexer.PRESENCE:
            return t.nextClause(), e.QueryParser.parsePresence;
          default:
            var n = "Unexpected lexeme type '" + i.type + "'";
            throw new e.QueryParseError(n, i.start, i.end);
          }
        }
      }), (e.QueryParser.parseEditDistance = function(t) {
        var r = t.consumeLexeme();
        if (null != r) {
          var i = parseInt(r.str, 10);
          if (isNaN(i)) {
            var n = 'edit distance must be numeric';
            throw new e.QueryParseError(n, r.start, r.end);
          }
          t.currentClause.editDistance = i;
          var s = t.peekLexeme();
          if (null == s)
            return void t.nextClause();
          switch (s.type) {
          case e.QueryLexer.TERM:
            return t.nextClause(), e.QueryParser.parseTerm;
          case e.QueryLexer.FIELD:
            return t.nextClause(), e.QueryParser.parseField;
          case e.QueryLexer.EDIT_DISTANCE:
            return e.QueryParser.parseEditDistance;
          case e.QueryLexer.BOOST:
            return e.QueryParser.parseBoost;
          case e.QueryLexer.PRESENCE:
            return t.nextClause(), e.QueryParser.parsePresence;
          default:
            n = "Unexpected lexeme type '" + s.type + "'";
            throw new e.QueryParseError(n, s.start, s.end);
          }
        }
      }), (e.QueryParser.parseBoost = function(t) {
        var r = t.consumeLexeme();
        if (null != r) {
          var i = parseInt(r.str, 10);
          if (isNaN(i)) {
            var n = 'boost must be numeric';
            throw new e.QueryParseError(n, r.start, r.end);
          }
          t.currentClause.boost = i;
          var s = t.peekLexeme();
          if (null == s)
            return void t.nextClause();
          switch (s.type) {
          case e.QueryLexer.TERM:
            return t.nextClause(), e.QueryParser.parseTerm;
          case e.QueryLexer.FIELD:
            return t.nextClause(), e.QueryParser.parseField;
          case e.QueryLexer.EDIT_DISTANCE:
            return e.QueryParser.parseEditDistance;
          case e.QueryLexer.BOOST:
            return e.QueryParser.parseBoost;
          case e.QueryLexer.PRESENCE:
            return t.nextClause(), e.QueryParser.parsePresence;
          default:
            n = "Unexpected lexeme type '" + s.type + "'";
            throw new e.QueryParseError(n, s.start, s.end);
          }
        }
      }), (function(e, t) {
        'function' == typeof define && define.amd
            ? define(t)
            : 'object' == typeof exports ? (module.exports = t())
                                         : (e.lunr = t());
      })(this, function() { return e; });
})();
var typedoc,
    __extends =
        (this && this.__extends) || (function() {
          var extendStatics = function(d, b) {
            return (extendStatics = Object.setPrototypeOf ||
                                    ({__proto__ : []} instanceof Array &&
                                     function(d, b) { d.__proto__ = b; }) ||
                                    function(d, b) {
                                      for (var p in b)
                                        b.hasOwnProperty(p) && (d[p] = b[p]);
                                    })(d, b);
          };
          return function(d, b) {
            function __() { this.constructor = d; }
            extendStatics(d, b),
                (d.prototype = null === b
                                   ? Object.create(b)
                                   : ((__.prototype = b.prototype), new __()));
          };
        })();
!(function(typedoc) {
  var services = [], components = [];
  (typedoc.registerService =
       function(constructor, name, priority) {
         void 0 === priority && (priority = 0), services.push({
           constructor : constructor,
           name : name,
           priority : priority,
           instance : null,
         }),
             services.sort(function(a, b) { return a.priority - b.priority; });
       }),
      (typedoc.registerComponent = function(constructor, selector, priority,
                                            namespace) {
        void 0 === priority && (priority = 0),
            void 0 === namespace && (namespace = '*'), components.push({
              selector : selector,
              constructor : constructor,
              priority : priority,
              namespace : namespace,
            }),
            components.sort(function(a, b) { return a.priority - b.priority; });
      });
  var Application = (function() {
    function Application() {
      this.createServices(), this.createComponents(document.body);
    }
    return (
        (Application.prototype.createServices =
             function() {
               services.forEach(function(c) {
                 (c.instance = new c.constructor()),
                     (typedoc[c.name] = c.instance);
               });
             }),
        (Application.prototype.createComponents = function(context, namespace) {
          void 0 === namespace && (namespace = 'default'),
              components.forEach(function(c) {
                (c.namespace != namespace && '*' != c.namespace) ||
                    context.querySelectorAll(c.selector).forEach(function(el) {
                      el.dataset.hasInstance ||
                          (new c.constructor({el : el}),
                           (el.dataset.hasInstance = String(!0)));
                    });
              });
        }), Application);
  })();
  typedoc.Application = Application;
})(typedoc || (typedoc = {})),
    (function(typedoc) {
      var EventTarget = (function() {
        function EventTarget() { this.listeners = {}; }
        return ((EventTarget.prototype.addEventListener =
                     function(type, callback) {
                       type in this.listeners || (this.listeners[type] = []),
                           this.listeners[type].push(callback);
                     }),
                (EventTarget.prototype.removeEventListener =
                     function(type, callback) {
                       if (type in this.listeners)
                         for (var stack = this.listeners[type], i = 0,
                                  l = stack.length;
                              i < l; i++)
                           if (stack[i] === callback)
                             return void stack.splice(i, 1);
                     }),
                (EventTarget.prototype.dispatchEvent = function(event) {
                  if (!(event.type in this.listeners))
                    return !0;
                  for (var stack = this.listeners[event.type].slice(), i = 0,
                           l = stack.length;
                       i < l; i++)
                    stack[i].call(this, event);
                  return !event.defaultPrevented;
                }), EventTarget);
      })();
      typedoc.EventTarget = EventTarget;
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      typedoc.throttle = function(fn, wait) {
        void 0 === wait && (wait = 100);
        var time = Date.now();
        return function() {
          for (var args = [], _i = 0; _i < arguments.length; _i++)
            args[_i] = arguments[_i];
          time + wait - Date.now() < 0 &&
              (fn.apply(void 0, args), (time = Date.now()));
        };
      };
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      var Viewport = (function(_super) {
        function Viewport() {
          var _this = _super.call(this) || this;
          return ((_this.scrollTop = 0), (_this.lastY = 0), (_this.width = 0),
                  (_this.height = 0), (_this.showToolbar = !0),
                  (_this.toolbar = document.querySelector('.tsd-page-toolbar')),
                  (_this.secondaryNav =
                       document.querySelector('.tsd-navigation.secondary')),
                  window.addEventListener(
                      'scroll',
                      typedoc.throttle(function() { return _this.onScroll(); },
                                       10)),
                  window.addEventListener(
                      'resize',
                      typedoc.throttle(function() { return _this.onResize(); },
                                       10)),
                  _this.onResize(), _this.onScroll(), _this);
        }
        return (
            __extends(Viewport, _super),
            (Viewport.prototype.triggerResize = function() {
              var event = new CustomEvent('resize', {
                detail : {width : this.width, height : this.height},
              });
              this.dispatchEvent(event);
            }), (Viewport.prototype.onResize = function() {
              (this.width = window.innerWidth || 0),
                  (this.height = window.innerHeight || 0);
              var event = new CustomEvent('resize', {
                detail : {width : this.width, height : this.height},
              });
              this.dispatchEvent(event);
            }), (Viewport.prototype.onScroll = function() {
              this.scrollTop = window.scrollY || 0;
              var event = new CustomEvent('scroll', {
                detail : {scrollTop : this.scrollTop},
              });
              this.dispatchEvent(event), this.hideShowToolbar();
            }), (Viewport.prototype.hideShowToolbar = function() {
              var isShown = this.showToolbar;
              (this.showToolbar =
                   this.lastY >= this.scrollTop || 0 === this.scrollTop),
                  isShown !== this.showToolbar &&
                      (this.toolbar.classList.toggle('tsd-page-toolbar--hide'),
                       this.secondaryNav.classList.toggle(
                           'tsd-navigation--toolbar-hide')),
                  (this.lastY = this.scrollTop);
            }), Viewport);
      })(typedoc.EventTarget);
      (typedoc.Viewport = Viewport),
          typedoc.registerService(Viewport, 'viewport');
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      function Component(options) { this.el = options.el; }
      typedoc.Component = Component;
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      (typedoc.pointerDown = 'mousedown'), (typedoc.pointerMove = 'mousemove'),
          (typedoc.pointerUp = 'mouseup'),
          (typedoc.pointerDownPosition = {x : 0, y : 0}),
          (typedoc.preventNextClick = !1), (typedoc.isPointerDown = !1),
          (typedoc.isPointerTouch = !1), (typedoc.hasPointerMoved = !1),
          (typedoc.isMobile =
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                   .test(navigator.userAgent)),
          document.documentElement.classList.add(
              typedoc.isMobile ? 'is-mobile' : 'not-mobile'),
          typedoc.isMobile && 'ontouchstart' in document.documentElement &&
              ((typedoc.isPointerTouch = !0),
               (typedoc.pointerDown = 'touchstart'),
               (typedoc.pointerMove = 'touchmove'),
               (typedoc.pointerUp = 'touchend')),
          document.addEventListener(typedoc.pointerDown, function(e) {
            (typedoc.isPointerDown = !0), (typedoc.hasPointerMoved = !1);
            var t =
                'touchstart' == typedoc.pointerDown ? e.targetTouches[0] : e;
            (typedoc.pointerDownPosition.y = t.pageY || 0),
                (typedoc.pointerDownPosition.x = t.pageX || 0);
          }), document.addEventListener(typedoc.pointerMove, function(e) {
            if (typedoc.isPointerDown && !typedoc.hasPointerMoved) {
              var t = 'touchstart' == typedoc.pointerDown ? e.targetTouches[0]
                                                          : e,
                  x = typedoc.pointerDownPosition.x - (t.pageX || 0),
                  y = typedoc.pointerDownPosition.y - (t.pageY || 0);
              typedoc.hasPointerMoved = 10 < Math.sqrt(x * x + y * y);
            }
          }), document.addEventListener(typedoc.pointerUp, function() {
            typedoc.isPointerDown = !1;
          }), document.addEventListener('click', function(e) {
            typedoc.preventNextClick &&
                (e.preventDefault(), e.stopImmediatePropagation(),
                 (typedoc.preventNextClick = !1));
          });
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      var FilterItem = (function() {
        function FilterItem(key, value) {
          (this.key = key), (this.value = value), (this.defaultValue = value),
              this.initialize(),
              window.localStorage[this.key] &&
                  this.setValue(
                      this.fromLocalStorage(window.localStorage[this.key]));
        }
        return ((FilterItem.prototype.initialize = function() {}),
                (FilterItem.prototype.setValue = function(value) {
                  if (this.value != value) {
                    var oldValue = this.value;
                    (this.value = value),
                        (window.localStorage[this.key] =
                             this.toLocalStorage(value)),
                        this.handleValueChange(oldValue, value);
                  }
                }), FilterItem);
      })(),
          FilterItemCheckbox = (function(_super) {
            function FilterItemCheckbox() {
              return (null !== _super && _super.apply(this, arguments)) || this;
            }
            return (__extends(FilterItemCheckbox, _super),
                    (FilterItemCheckbox.prototype.initialize =
                         function() {
                           var _this = this, checkbox = document.querySelector(
                                                 '#tsd-filter-' + this.key);
                           checkbox &&
                               ((this.checkbox = checkbox),
                                this.checkbox.addEventListener(
                                    'change', function() {
                                      _this.setValue(_this.checkbox.checked);
                                    }));
                         }),
                    (FilterItemCheckbox.prototype.handleValueChange =
                         function(oldValue, newValue) {
                           (this.checkbox.checked = this.value),
                               document.documentElement.classList.toggle(
                                   'toggle-' + this.key,
                                   this.value != this.defaultValue);
                         }),
                    (FilterItemCheckbox.prototype.fromLocalStorage = function(
                         value) { return 'true' == value; }),
                    (FilterItemCheckbox.prototype.toLocalStorage = function(
                         value) { return value ? 'true' : 'false'; }),
                    FilterItemCheckbox);
          })(FilterItem),
          FilterItemSelect = (function(_super) {
            function FilterItemSelect() {
              return (null !== _super && _super.apply(this, arguments)) || this;
            }
            return (
                __extends(FilterItemSelect, _super),
                (FilterItemSelect.prototype.initialize =
                     function() {
                       var _this = this;
                       document.documentElement.classList.add(
                           'toggle-' + this.key + this.value);
                       var select =
                           document.querySelector('#tsd-filter-' + this.key);
                       if (select) {
                         this.select = select;
                         function onActivate() {
                           _this.select.classList.add('active');
                         }
                         this.select.addEventListener(typedoc.pointerDown,
                                                      onActivate),
                             this.select.addEventListener('mouseover',
                                                          onActivate),
                             this.select.addEventListener(
                                 'mouseleave',
                                 function() {
                                   _this.select.classList.remove('active');
                                 }),
                             this.select.querySelectorAll('li').forEach(
                                 function(el) {
                                   el.addEventListener(
                                       typedoc.pointerUp, function(e) {
                                         select.classList.remove('active'),
                                             _this.setValue(
                                                 e.target.dataset.value || '');
                                       });
                                 }),
                             document.addEventListener(
                                 typedoc.pointerDown, function(e) {
                                   _this.select.contains(e.target) ||
                                       _this.select.classList.remove('active');
                                 });
                       }
                     }),
                (FilterItemSelect.prototype.handleValueChange =
                     function(oldValue, newValue) {
                       this.select.querySelectorAll('li.selected')
                           .forEach(function(
                               el) { el.classList.remove('selected'); });
                       var selected = this.select.querySelector(
                               'li[data-value="' + newValue + '"]'),
                           label =
                               this.select.querySelector('.tsd-select-label');
                       selected && label &&
                           (selected.classList.add('selected'),
                            (label.textContent = selected.textContent)),
                           document.documentElement.classList.remove('toggle-' +
                                                                     oldValue),
                           document.documentElement.classList.add('toggle-' +
                                                                  newValue);
                     }),
                (FilterItemSelect.prototype.fromLocalStorage = function(
                     value) { return value; }),
                (FilterItemSelect.prototype.toLocalStorage = function(
                     value) { return value; }),
                FilterItemSelect);
          })(FilterItem),
          Filter = (function(_super) {
            function Filter(options) {
              var _this = _super.call(this, options) || this;
              return ((_this.optionVisibility =
                           new FilterItemSelect('visibility', 'private')),
                      (_this.optionInherited =
                           new FilterItemCheckbox('inherited', !0)),
                      (_this.optionExternals =
                           new FilterItemCheckbox('externals', !0)),
                      (_this.optionOnlyExported =
                           new FilterItemCheckbox('only-exported', !1)),
                      _this);
            }
            return (__extends(Filter, _super),
                    (Filter.isSupported = function() {
                      try {
                        return void 0 !== window.localStorage;
                      } catch (e) {
                        return !1;
                      }
                    }), Filter);
          })(typedoc.Component);
      Filter.isSupported()
          ? typedoc.registerComponent(Filter, '#tsd-filter')
          : document.documentElement.classList.add('no-filter');
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      var MenuHighlight = (function(_super) {
        function MenuHighlight(options) {
          var _this = _super.call(this, options) || this;
          return ((_this.anchors = []), (_this.index = -1),
                  typedoc.viewport.addEventListener(
                      'resize', function() { return _this.onResize(); }),
                  typedoc.viewport.addEventListener(
                      'scroll', function(e) { return _this.onScroll(e); }),
                  _this.createAnchors(), _this);
        }
        return (
            __extends(MenuHighlight, _super),
            (MenuHighlight.prototype.createAnchors = function() {
              var _this = this, base = window.location.href;
              -1 != base.indexOf('#') &&
                  (base = base.substr(0, base.indexOf('#'))),
                  this.el.querySelectorAll('a').forEach(function(el) {
                    var href = el.href;
                    if (-1 != href.indexOf('#') &&
                        href.substr(0, base.length) == base) {
                      var hash = href.substr(href.indexOf('#') + 1),
                          anchor = document.querySelector(
                              'a.tsd-anchor[name=' + hash + ']'),
                          link = el.parentNode;
                      anchor && link && _this.anchors.push({
                        link : link,
                        anchor : anchor,
                        position : 0,
                      });
                    }
                  }),
                  this.onResize();
            }), (MenuHighlight.prototype.onResize = function() {
              for (var anchor, index = 0, count = this.anchors.length;
                   index < count; index++) {
                var rect = (anchor = this.anchors[index])
                               .anchor.getBoundingClientRect();
                anchor.position = rect.top + document.body.scrollTop;
              }
              this.anchors.sort(function(
                  a, b) { return a.position - b.position; });
              var event = new CustomEvent('scroll', {
                detail : {scrollTop : typedoc.viewport.scrollTop},
              });
              this.onScroll(event);
            }), (MenuHighlight.prototype.onScroll = function(event) {
              for (var scrollTop = event.detail.scrollTop + 5,
                       anchors = this.anchors, count = anchors.length - 1,
                       index = this.index;
                   - 1 < index && anchors[index].position > scrollTop;

              )
                index -= 1;
              for (; index < count && anchors[index + 1].position < scrollTop;)
                index += 1;
              this.index != index &&
                  (-1 < this.index &&
                       this.anchors[this.index].link.classList.remove('focus'),
                   (this.index = index),
                   -1 < this.index &&
                       this.anchors[this.index].link.classList.add('focus'));
            }), MenuHighlight);
      })(typedoc.Component);
      (typedoc.MenuHighlight = MenuHighlight),
          typedoc.registerComponent(MenuHighlight, '.menu-highlight');
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      !(function(search) {
        var SearchLoadingState;
        !(function(SearchLoadingState) {
          (SearchLoadingState[(SearchLoadingState.Idle = 0)] = 'Idle'),
              (SearchLoadingState[(SearchLoadingState.Loading = 1)] =
                   'Loading'),
              (SearchLoadingState[(SearchLoadingState.Ready = 2)] = 'Ready'),
              (SearchLoadingState[(SearchLoadingState.Failure = 3)] =
                   'Failure');
        })(SearchLoadingState || (SearchLoadingState = {}));
        var Search = (function(_super) {
          function Search(options) {
            var _this = _super.call(this, options) || this;
            (_this.query = ''), (_this.loadingState = SearchLoadingState.Idle),
                (_this.hasFocus = !1), (_this.preventPress = !1),
                (_this.data = null), (_this.index = null),
                (_this.resultClicked = !1);
            var field = document.querySelector('#tsd-search-field'),
                results = document.querySelector('.results');
            if (!field || !results)
              throw new Error(
                  'The input field or the result list wrapper are not found');
            return ((_this.field = field), (_this.results = results),
                    (_this.base = _this.el.dataset.base + '/'),
                    _this.bindEvents(), _this);
          }
          return (
              __extends(Search, _super),
              (Search.prototype.loadIndex = function() {
                var _this = this;
                if (this.loadingState == SearchLoadingState.Idle &&
                    !this.data) {
                  setTimeout(function() {
                    _this.loadingState == SearchLoadingState.Idle &&
                        _this.setLoadingState(SearchLoadingState.Loading);
                  }, 500);
                  var url = this.el.dataset.index;
                  url ? fetch(url)
                            .then(function(response) {
                              if (!response.ok)
                                throw new Error('The search index is missing');
                              return response.json();
                            })
                            .then(function(source) {
                              (_this.data = source),
                                  (_this.index = lunr.Index.load(source.index)),
                                  _this.setLoadingState(
                                      SearchLoadingState.Ready);
                            })
                            .catch(function(error) {
                              console.error(error),
                                  _this.setLoadingState(
                                      SearchLoadingState.Failure);
                            })
                      : this.setLoadingState(SearchLoadingState.Failure);
                }
              }), (Search.prototype.updateResults = function() {
                if (this.loadingState == SearchLoadingState.Ready &&
                    ((this.results.textContent = ''),
                     this.query && this.index && this.data)) {
                  var res = this.index.search('*' + this.query + '*');
                  0 === res.length &&
                      (res = this.index.search('*' + this.query + '~1*'));
                  for (var i = 0, c = Math.min(10, res.length); i < c; i++) {
                    var row = this.data.rows[Number(res[i].ref)],
                        name = row.name.replace(
                            new RegExp(this.query, 'i'),
                            function(match) { return '<b>' + match + '</b>'; }),
                        parent = row.parent || '';
                    (parent = parent.replace(
                         new RegExp(this.query, 'i'),
                         function(match) { return '<b>' + match + '</b>'; })) &&
                        (name = '<span class="parent">' + parent + '.</span>' +
                                name);
                    var item = document.createElement('li');
                    (item.classList.value = row.classes),
                        (item.innerHTML = '\n                    <a href="' +
                                          (this.base + row.url) +
                                          '" class="tsd-kind-icon">' + name +
                                          "'</a>\n                "),
                        this.results.appendChild(item);
                  }
                }
              }), (Search.prototype.setLoadingState = function(value) {
                this.loadingState != value &&
                    (this.el.classList.remove(
                         SearchLoadingState[this.loadingState].toLowerCase()),
                     (this.loadingState = value),
                     this.el.classList.add(
                         SearchLoadingState[this.loadingState].toLowerCase()),
                     this.updateResults());
              }), (Search.prototype.setHasFocus = function(value) {
                this.hasFocus != value &&
                    ((this.hasFocus = value),
                     this.el.classList.toggle('has-focus'),
                     value ? (this.setQuery(''), (this.field.value = ''))
                           : (this.field.value = this.query));
              }), (Search.prototype.setQuery = function(value) {
                (this.query = value.trim()), this.updateResults();
              }), (Search.prototype.setCurrentResult = function(dir) {
                var current = this.results.querySelector('.current');
                if (current) {
                  var rel = 1 == dir ? current.nextElementSibling
                                     : current.previousElementSibling;
                  rel && (current.classList.remove('current'),
                          rel.classList.add('current'));
                } else
                  (current = this.results.querySelector(
                       1 == dir ? 'li:first-child' : 'li:last-child')) &&
                      current.classList.add('current');
              }), (Search.prototype.gotoCurrentResult = function() {
                var current = this.results.querySelector('.current');
                if ((current || (current = this.results.querySelector(
                                     'li:first-child')),
                     current)) {
                  var link = current.querySelector('a');
                  link && (window.location.href = link.href), this.field.blur();
                }
              }), (Search.prototype.bindEvents = function() {
                var _this = this;
                this.results.addEventListener(
                    'mousedown', function() { _this.resultClicked = !0; }),
                    this.results.addEventListener('mouseup', function() {
                      (_this.resultClicked = !1), _this.setHasFocus(!1);
                    }), this.field.addEventListener('focusin', function() {
                      _this.setHasFocus(!0), _this.loadIndex();
                    }), this.field.addEventListener('focusout', function() {
                      _this.resultClicked
                          ? (_this.resultClicked = !1)
                          : setTimeout(
                                function() { return _this.setHasFocus(!1); },
                                100);
                    }), this.field.addEventListener('input', function() {
                      _this.setQuery(_this.field.value);
                    }), this.field.addEventListener('keydown', function(e) {
                      13 == e.keyCode || 27 == e.keyCode || 38 == e.keyCode ||
                              40 == e.keyCode
                          ? ((_this.preventPress = !0), e.preventDefault(),
                             13 == e.keyCode
                                 ? _this.gotoCurrentResult()
                                 : 27 == e.keyCode
                                       ? _this.field.blur()
                                       : 38 == e.keyCode
                                             ? _this.setCurrentResult(-1)
                                             : 40 == e.keyCode &&
                                                   _this.setCurrentResult(1))
                          : (_this.preventPress = !1);
                    }), this.field.addEventListener('keypress', function(e) {
                      _this.preventPress && e.preventDefault();
                    }), document.body.addEventListener('keydown', function(e) {
                      e.altKey || e.ctrlKey || e.metaKey ||
                          (!_this.hasFocus && 47 < e.keyCode &&
                           e.keyCode < 112 && _this.field.focus());
                    });
              }), Search);
        })(typedoc.Component);
        (search.Search = Search),
            typedoc.registerComponent(Search, '#tsd-search');
      })(typedoc.search || (typedoc.search = {}));
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      var SignatureGroup = (function() {
        function SignatureGroup(signature, description) {
          (this.signature = signature), (this.description = description);
        }
        return (
            (SignatureGroup.prototype.addClass = function(className) {
              return (this.signature.classList.add(className),
                      this.description.classList.add(className), this);
            }), (SignatureGroup.prototype.removeClass = function(className) {
              return (this.signature.classList.remove(className),
                      this.description.classList.remove(className), this);
            }), SignatureGroup);
      })(),
          Signature = (function(_super) {
            function Signature(options) {
              var _this = _super.call(this, options) || this;
              return (
                  (_this.groups = []), (_this.index = -1), _this.createGroups(),
                  _this.container &&
                      (_this.el.classList.add('active'),
                       _this.el.querySelectorAll('.tsd-signature')
                           .forEach(function(signature) {
                             signature.addEventListener(
                                 'touchstart',
                                 function(
                                     event) { return _this.onClick(event); }),
                                 signature.addEventListener(
                                     'click', function(event) {
                                       return _this.onClick(event);
                                     });
                           }),
                       _this.container.classList.add('active'),
                       _this.setIndex(0)),
                  _this);
            }
            return (
                __extends(Signature, _super),
                (Signature.prototype.setIndex = function(index) {
                  if ((index < 0 && (index = 0),
                       index > this.groups.length - 1 &&
                           (index = this.groups.length - 1),
                       this.index != index)) {
                    var to = this.groups[index];
                    if (-1 < this.index) {
                      var from_1 = this.groups[this.index];
                      from_1.removeClass('current').addClass('fade-out'),
                          to.addClass('current'), to.addClass('fade-in'),
                          typedoc.viewport.triggerResize(),
                          setTimeout(function() {
                            from_1.removeClass('fade-out'),
                                to.removeClass('fade-in');
                          }, 300);
                    } else
                      to.addClass('current'), typedoc.viewport.triggerResize();
                    this.index = index;
                  }
                }), (Signature.prototype.createGroups = function() {
                  var _this = this,
                      signatures = this.el.querySelectorAll('.tsd-signature');
                  if (!(signatures.length < 2)) {
                    this.container = this.el.nextElementSibling;
                    var descriptions =
                        this.container.querySelectorAll('.tsd-description');
                    (this.groups = []), signatures.forEach(function(el, index) {
                      _this.groups.push(
                          new SignatureGroup(el, descriptions[index]));
                    });
                  }
                }), (Signature.prototype.onClick = function(e) {
                  var _this = this;
                  this.groups.forEach(function(group, index) {
                    group.signature === e.currentTarget &&
                        _this.setIndex(index);
                  });
                }), Signature);
          })(typedoc.Component);
      typedoc.registerComponent(Signature, '.tsd-signatures');
    })(typedoc || (typedoc = {})),
    (function(typedoc) {
      var Toggle = (function(_super) {
        function Toggle(options) {
          var _this = _super.call(this, options) || this;
          return ((_this.className = _this.el.dataset.toggle || ''),
                  _this.el.addEventListener(
                      typedoc.pointerUp,
                      function(e) { return _this.onPointerUp(e); }),
                  _this.el.addEventListener(
                      'click', function(e) { return e.preventDefault(); }),
                  document.addEventListener(
                      typedoc.pointerDown,
                      function(e) { return _this.onDocumentPointerDown(e); }),
                  document.addEventListener(
                      typedoc.pointerUp,
                      function(e) { return _this.onDocumentPointerUp(e); }),
                  _this);
        }
        return (
            __extends(Toggle, _super),
            (Toggle.prototype.setActive = function(value) {
              if (this.active != value) {
                (this.active = value),
                    document.documentElement.classList.toggle(
                        'has-' + this.className, value),
                    this.el.classList.toggle('active', value);
                var transition =
                    (this.active ? 'to-has-' : 'from-has-') + this.className;
                document.documentElement.classList.add(transition),
                    setTimeout(function() {
                      return document.documentElement.classList.remove(
                          transition);
                    }, 500);
              }
            }), (Toggle.prototype.onPointerUp = function(event) {
              typedoc.hasPointerMoved ||
                  (this.setActive(!0), event.preventDefault());
            }), (Toggle.prototype.onDocumentPointerDown = function(e) {
              if (this.active) {
                if (e.target.closest('.col-menu, .tsd-filter-group'))
                  return;
                this.setActive(!1);
              }
            }), (Toggle.prototype.onDocumentPointerUp = function(e) {
              var _this = this;
              if (!typedoc.hasPointerMoved && this.active &&
                  e.target.closest('.col-menu')) {
                var link = e.target.closest('a');
                if (link) {
                  var href = window.location.href;
                  -1 != href.indexOf('#') &&
                      (href = href.substr(0, href.indexOf('#'))),
                      link.href.substr(0, href.length) == href &&
                          setTimeout(function() { return _this.setActive(!1); },
                                     250);
                }
              }
            }), Toggle);
      })(typedoc.Component);
      typedoc.registerComponent(Toggle, 'a[data-toggle]');
    })(typedoc || (typedoc = {})),
    (function(typedoc) { typedoc.app = new typedoc.Application(); })(
        typedoc || (typedoc = {}));
