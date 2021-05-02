// ../../node_modules/@codemirror/text/dist/index.js
var extend = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
for (let i = 1; i < extend.length; i++)
  extend[i] += extend[i - 1];
function isExtendingChar(code) {
  for (let i = 1; i < extend.length; i += 2)
    if (extend[i] > code)
      return extend[i - 1] <= code;
  return false;
}
function isRegionalIndicator(code) {
  return code >= 127462 && code <= 127487;
}
var ZWJ = 8205;
function findClusterBreak(str, pos, forward = true) {
  return (forward ? nextClusterBreak : prevClusterBreak)(str, pos);
}
function nextClusterBreak(str, pos) {
  if (pos == str.length)
    return pos;
  if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
    pos--;
  let prev = codePointAt(str, pos);
  pos += codePointSize(prev);
  while (pos < str.length) {
    let next = codePointAt(str, pos);
    if (prev == ZWJ || next == ZWJ || isExtendingChar(next)) {
      pos += codePointSize(next);
      prev = next;
    } else if (isRegionalIndicator(next)) {
      let countBefore = 0, i = pos - 2;
      while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
        countBefore++;
        i -= 2;
      }
      if (countBefore % 2 == 0)
        break;
      else
        pos += 2;
    } else {
      break;
    }
  }
  return pos;
}
function prevClusterBreak(str, pos) {
  while (pos > 0) {
    let found = nextClusterBreak(str, pos - 2);
    if (found < pos)
      return found;
    pos--;
  }
  return 0;
}
function surrogateLow(ch) {
  return ch >= 56320 && ch < 57344;
}
function surrogateHigh(ch) {
  return ch >= 55296 && ch < 56320;
}
function codePointAt(str, pos) {
  let code0 = str.charCodeAt(pos);
  if (!surrogateHigh(code0) || pos + 1 == str.length)
    return code0;
  let code1 = str.charCodeAt(pos + 1);
  if (!surrogateLow(code1))
    return code0;
  return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
}
function fromCodePoint(code) {
  if (code <= 65535)
    return String.fromCharCode(code);
  code -= 65536;
  return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
}
function codePointSize(code) {
  return code < 65536 ? 1 : 2;
}
function countColumn(string2, n, tabSize) {
  for (let i = 0; i < string2.length; ) {
    if (string2.charCodeAt(i) == 9) {
      n += tabSize - n % tabSize;
      i++;
    } else {
      n++;
      i = findClusterBreak(string2, i);
    }
  }
  return n;
}
function findColumn(string2, n, col, tabSize) {
  for (let i = 0; i < string2.length; ) {
    if (n >= col)
      return {offset: i, leftOver: 0};
    n += string2.charCodeAt(i) == 9 ? tabSize - n % tabSize : 1;
    i = findClusterBreak(string2, i);
  }
  return {offset: string2.length, leftOver: col - n};
}
var Text = class {
  constructor() {
  }
  lineAt(pos) {
    if (pos < 0 || pos > this.length)
      throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
    return this.lineInner(pos, false, 1, 0);
  }
  line(n) {
    if (n < 1 || n > this.lines)
      throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
    return this.lineInner(n, true, 1, 0);
  }
  replace(from, to, text) {
    let parts = [];
    this.decompose(0, from, parts, 2);
    if (text.length)
      text.decompose(0, text.length, parts, 1 | 2);
    this.decompose(to, this.length, parts, 1);
    return TextNode.from(parts, this.length - (to - from) + text.length);
  }
  append(other) {
    return this.replace(this.length, this.length, other);
  }
  slice(from, to = this.length) {
    let parts = [];
    this.decompose(from, to, parts, 0);
    return TextNode.from(parts, to - from);
  }
  eq(other) {
    if (other == this)
      return true;
    if (other.length != this.length || other.lines != this.lines)
      return false;
    let a = new RawTextCursor(this), b = new RawTextCursor(other);
    for (; ; ) {
      a.next();
      b.next();
      if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
        return false;
      if (a.done)
        return true;
    }
  }
  iter(dir = 1) {
    return new RawTextCursor(this, dir);
  }
  iterRange(from, to = this.length) {
    return new PartialTextCursor(this, from, to);
  }
  toString() {
    return this.sliceString(0);
  }
  toJSON() {
    let lines = [];
    this.flatten(lines);
    return lines;
  }
  static of(text) {
    if (text.length == 0)
      throw new RangeError("A document must have at least one line");
    if (text.length == 1 && !text[0])
      return Text.empty;
    return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
  }
};
if (typeof Symbol != "undefined")
  Text.prototype[Symbol.iterator] = function() {
    return this.iter();
  };
var TextLeaf = class extends Text {
  constructor(text, length = textLength(text)) {
    super();
    this.text = text;
    this.length = length;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let string2 = this.text[i], end = offset + string2.length;
      if ((isLine ? line : end) >= target)
        return new Line(offset, end, line, string2);
      offset = end + 1;
      line++;
    }
  }
  decompose(from, to, target, open) {
    let text = from <= 0 && to >= this.length ? this : new TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
    if (open & 1) {
      let prev = target.pop();
      let joined = appendText(text.text, prev.text.slice(), 0, text.length);
      if (joined.length <= 32) {
        target.push(new TextLeaf(joined, prev.length + text.length));
      } else {
        let mid = joined.length >> 1;
        target.push(new TextLeaf(joined.slice(0, mid)), new TextLeaf(joined.slice(mid)));
      }
    } else {
      target.push(text);
    }
  }
  replace(from, to, text) {
    if (!(text instanceof TextLeaf))
      return super.replace(from, to, text);
    let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
    let newLen = this.length + text.length - (to - from);
    if (lines.length <= 32)
      return new TextLeaf(lines, newLen);
    return TextNode.from(TextLeaf.split(lines, []), newLen);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    let result = "";
    for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
      let line = this.text[i], end = pos + line.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += line.slice(Math.max(0, from - pos), to - pos);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let line of this.text)
      target.push(line);
  }
  static split(text, target) {
    let part = [], len = -1;
    for (let line of text) {
      part.push(line);
      len += line.length + 1;
      if (part.length == 32) {
        target.push(new TextLeaf(part, len));
        part = [];
        len = -1;
      }
    }
    if (len > -1)
      target.push(new TextLeaf(part, len));
    return target;
  }
};
var TextNode = class extends Text {
  constructor(children, length) {
    super();
    this.children = children;
    this.length = length;
    this.lines = 0;
    for (let child of children)
      this.lines += child.lines;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
      if ((isLine ? endLine : end) >= target)
        return child.lineInner(target, isLine, line, offset);
      offset = end + 1;
      line = endLine + 1;
    }
  }
  decompose(from, to, target, open) {
    for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (from <= end && to >= pos) {
        let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
        if (pos >= from && end <= to && !childOpen)
          target.push(child);
        else
          child.decompose(from - pos, to - pos, target, childOpen);
      }
      pos = end + 1;
    }
  }
  replace(from, to, text) {
    if (text.lines < this.lines)
      for (let i = 0, pos = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from >= pos && to <= end) {
          let updated = child.replace(from - pos, to - pos, text);
          let totalLines = this.lines - child.lines + updated.lines;
          if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
            let copy = this.children.slice();
            copy[i] = updated;
            return new TextNode(copy, this.length - (to - from) + text.length);
          }
          return super.replace(pos, end, updated);
        }
        pos = end + 1;
      }
    return super.replace(from, to, text);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    let result = "";
    for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
      let child = this.children[i], end = pos + child.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += child.sliceString(from - pos, to - pos, lineSep);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let child of this.children)
      child.flatten(target);
  }
  static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
    let lines = 0;
    for (let ch of children)
      lines += ch.lines;
    if (lines < 32) {
      let flat = [];
      for (let ch of children)
        ch.flatten(flat);
      return new TextLeaf(flat, length);
    }
    let chunk = Math.max(32, lines >> 5), maxChunk = chunk << 1, minChunk = chunk >> 1;
    let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
    function add(child) {
      let last;
      if (child.lines > maxChunk && child instanceof TextNode) {
        for (let node of child.children)
          add(node);
      } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
        flush();
        chunked.push(child);
      } else if (child instanceof TextLeaf && currentLines && (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last.lines <= 32) {
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
      } else {
        if (currentLines + child.lines > chunk)
          flush();
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk.push(child);
      }
    }
    function flush() {
      if (currentLines == 0)
        return;
      chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLen));
      currentLen = -1;
      currentLines = currentChunk.length = 0;
    }
    for (let child of children)
      add(child);
    flush();
    return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
  }
};
Text.empty = new TextLeaf([""], 0);
function textLength(text) {
  let length = -1;
  for (let line of text)
    length += line.length + 1;
  return length;
}
function appendText(text, target, from = 0, to = 1e9) {
  for (let pos = 0, i = 0, first = true; i < text.length && pos <= to; i++) {
    let line = text[i], end = pos + line.length;
    if (end >= from) {
      if (end > to)
        line = line.slice(0, to - pos);
      if (pos < from)
        line = line.slice(from - pos);
      if (first) {
        target[target.length - 1] += line;
        first = false;
      } else
        target.push(line);
    }
    pos = end + 1;
  }
  return target;
}
function sliceText(text, from, to) {
  return appendText(text, [""], from, to);
}
var RawTextCursor = class {
  constructor(text, dir = 1) {
    this.dir = dir;
    this.done = false;
    this.lineBreak = false;
    this.value = "";
    this.nodes = [text];
    this.offsets = [dir > 0 ? 0 : text instanceof TextLeaf ? text.text.length : text.children.length];
  }
  next(skip2 = 0) {
    for (; ; ) {
      let last = this.nodes.length - 1;
      if (last < 0) {
        this.done = true;
        this.value = "";
        this.lineBreak = false;
        return this;
      }
      let top2 = this.nodes[last], offset = this.offsets[last];
      let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
      if (offset == (this.dir > 0 ? size : 0)) {
        this.nodes.pop();
        this.offsets.pop();
      } else if (!this.lineBreak && offset != (this.dir > 0 ? 0 : size)) {
        this.lineBreak = true;
        if (skip2 == 0) {
          this.value = "\n";
          return this;
        }
        skip2--;
      } else if (top2 instanceof TextLeaf) {
        let next = top2.text[offset - (this.dir < 0 ? 1 : 0)];
        this.offsets[last] = offset += this.dir;
        this.lineBreak = false;
        if (next.length > Math.max(0, skip2)) {
          this.value = skip2 == 0 ? next : this.dir > 0 ? next.slice(skip2) : next.slice(0, next.length - skip2);
          return this;
        }
        skip2 -= next.length;
      } else {
        let next = top2.children[this.dir > 0 ? offset : offset - 1];
        this.offsets[last] = offset + this.dir;
        this.lineBreak = false;
        if (skip2 > next.length) {
          skip2 -= next.length;
        } else {
          this.nodes.push(next);
          this.offsets.push(this.dir > 0 ? 0 : next instanceof TextLeaf ? next.text.length : next.children.length);
        }
      }
    }
  }
};
var PartialTextCursor = class {
  constructor(text, start, end) {
    this.value = "";
    this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
    if (start > end) {
      this.skip = text.length - start;
      this.limit = start - end;
    } else {
      this.skip = start;
      this.limit = end - start;
    }
  }
  next(skip2 = 0) {
    if (this.limit <= 0) {
      this.limit = -1;
    } else {
      let {value, lineBreak, done} = this.cursor.next(this.skip + skip2);
      this.skip = 0;
      this.value = value;
      let len = lineBreak ? 1 : value.length;
      if (len > this.limit)
        this.value = this.cursor.dir > 0 ? value.slice(0, this.limit) : value.slice(len - this.limit);
      if (done || this.value.length == 0)
        this.limit = -1;
      else
        this.limit -= this.value.length;
    }
    return this;
  }
  get lineBreak() {
    return this.cursor.lineBreak;
  }
  get done() {
    return this.limit < 0;
  }
};
var Line = class {
  constructor(from, to, number2, text) {
    this.from = from;
    this.to = to;
    this.number = number2;
    this.text = text;
  }
  get length() {
    return this.to - this.from;
  }
};

// ../../node_modules/@codemirror/state/dist/index.js
var DefaultSplit = /\r\n?|\n/;
var MapMode = /* @__PURE__ */ function(MapMode2) {
  MapMode2[MapMode2["Simple"] = 0] = "Simple";
  MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
  MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
  MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
  return MapMode2;
}(MapMode || (MapMode = {}));
var ChangeDesc = class {
  constructor(sections) {
    this.sections = sections;
  }
  get length() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2)
      result += this.sections[i];
    return result;
  }
  get newLength() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2) {
      let ins = this.sections[i + 1];
      result += ins < 0 ? this.sections[i] : ins;
    }
    return result;
  }
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  iterGaps(f) {
    for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0) {
        f(posA, posB, len);
        posB += len;
      } else {
        posB += ins;
      }
      posA += len;
    }
  }
  iterChangedRanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  get invertedDesc() {
    let sections = [];
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0)
        sections.push(len, ins);
      else
        sections.push(ins, len);
    }
    return new ChangeDesc(sections);
  }
  composeDesc(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other);
  }
  mapDesc(other, before = false) {
    return other.empty ? this : mapSet(this, other, before);
  }
  mapPos(pos, assoc = -1, mode = MapMode.Simple) {
    let posA = 0, posB = 0;
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
      if (ins < 0) {
        if (endA > pos)
          return posB + (pos - posA);
        posB += len;
      } else {
        if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
          return null;
        if (endA > pos || endA == pos && assoc < 0 && !len)
          return pos == posA || assoc < 0 ? posB : posB + ins;
        posB += ins;
      }
      posA = endA;
    }
    if (pos > posA)
      throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
    return posB;
  }
  touchesRange(from, to = from) {
    for (let i = 0, pos = 0; i < this.sections.length && pos <= to; ) {
      let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
      if (ins >= 0 && pos <= to && end >= from)
        return pos < from && end > to ? "cover" : true;
      pos = end;
    }
    return false;
  }
  toString() {
    let result = "";
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
    }
    return result;
  }
  toJSON() {
    return this.sections;
  }
  static fromJSON(json) {
    if (!Array.isArray(json) || json.length % 2 || json.some((a) => typeof a != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new ChangeDesc(json);
  }
};
var ChangeSet = class extends ChangeDesc {
  constructor(sections, inserted) {
    super(sections);
    this.inserted = inserted;
  }
  apply(doc2) {
    if (this.length != doc2.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
    return doc2;
  }
  mapDesc(other, before = false) {
    return mapSet(this, other, before, true);
  }
  invert(doc2) {
    let sections = this.sections.slice(), inserted = [];
    for (let i = 0, pos = 0; i < sections.length; i += 2) {
      let len = sections[i], ins = sections[i + 1];
      if (ins >= 0) {
        sections[i] = ins;
        sections[i + 1] = len;
        let index = i >> 1;
        while (inserted.length < index)
          inserted.push(Text.empty);
        inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
      }
      pos += len;
    }
    return new ChangeSet(sections, inserted);
  }
  compose(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other, true);
  }
  map(other, before = false) {
    return other.empty ? this : mapSet(this, other, before, true);
  }
  iterChanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  get desc() {
    return new ChangeDesc(this.sections);
  }
  filter(ranges) {
    let resultSections = [], resultInserted = [], filteredSections = [];
    let iter = new SectionIter(this);
    done:
      for (let i = 0, pos = 0; ; ) {
        let next = i == ranges.length ? 1e9 : ranges[i++];
        while (pos < next || pos == next && iter.len == 0) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, next - pos);
          addSection(filteredSections, len, -1);
          let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
          addSection(resultSections, len, ins);
          if (ins > 0)
            addInsert(resultInserted, resultSections, iter.text);
          iter.forward(len);
          pos += len;
        }
        let end = ranges[i++];
        while (pos < end) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, end - pos);
          addSection(resultSections, len, -1);
          addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
          iter.forward(len);
          pos += len;
        }
      }
    return {
      changes: new ChangeSet(resultSections, resultInserted),
      filtered: new ChangeDesc(filteredSections)
    };
  }
  toJSON() {
    let parts = [];
    for (let i = 0; i < this.sections.length; i += 2) {
      let len = this.sections[i], ins = this.sections[i + 1];
      if (ins < 0)
        parts.push(len);
      else if (ins == 0)
        parts.push([len]);
      else
        parts.push([len].concat(this.inserted[i >> 1].toJSON()));
    }
    return parts;
  }
  static of(changes, length, lineSep) {
    let sections = [], inserted = [], pos = 0;
    let total = null;
    function flush(force = false) {
      if (!force && !sections.length)
        return;
      if (pos < length)
        addSection(sections, length - pos, -1);
      let set = new ChangeSet(sections, inserted);
      total = total ? total.compose(set.map(total)) : set;
      sections = [];
      inserted = [];
      pos = 0;
    }
    function process2(spec) {
      if (Array.isArray(spec)) {
        for (let sub of spec)
          process2(sub);
      } else if (spec instanceof ChangeSet) {
        if (spec.length != length)
          throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
        flush();
        total = total ? total.compose(spec.map(total)) : spec;
      } else {
        let {from, to = from, insert: insert2} = spec;
        if (from > to || from < 0 || to > length)
          throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
        let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
        let insLen = insText.length;
        if (from == to && insLen == 0)
          return;
        if (from < pos)
          flush();
        if (from > pos)
          addSection(sections, from - pos, -1);
        addSection(sections, to - from, insLen);
        addInsert(inserted, sections, insText);
        pos = to;
      }
    }
    process2(changes);
    flush(!total);
    return total;
  }
  static empty(length) {
    return new ChangeSet(length ? [length, -1] : [], []);
  }
  static fromJSON(json) {
    if (!Array.isArray(json))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let sections = [], inserted = [];
    for (let i = 0; i < json.length; i++) {
      let part = json[i];
      if (typeof part == "number") {
        sections.push(part, -1);
      } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i2) => i2 && typeof e != "string")) {
        throw new RangeError("Invalid JSON representation of ChangeSet");
      } else if (part.length == 1) {
        sections.push(part[0], 0);
      } else {
        while (inserted.length < i)
          inserted.push(Text.empty);
        inserted[i] = Text.of(part.slice(1));
        sections.push(part[0], inserted[i].length);
      }
    }
    return new ChangeSet(sections, inserted);
  }
};
function addSection(sections, len, ins, forceJoin = false) {
  if (len == 0 && ins <= 0)
    return;
  let last = sections.length - 2;
  if (last >= 0 && ins <= 0 && ins == sections[last + 1])
    sections[last] += len;
  else if (len == 0 && sections[last] == 0)
    sections[last + 1] += ins;
  else if (forceJoin) {
    sections[last] += len;
    sections[last + 1] += ins;
  } else
    sections.push(len, ins);
}
function addInsert(values2, sections, value) {
  if (value.length == 0)
    return;
  let index = sections.length - 2 >> 1;
  if (index < values2.length) {
    values2[values2.length - 1] = values2[values2.length - 1].append(value);
  } else {
    while (values2.length < index)
      values2.push(Text.empty);
    values2.push(value);
  }
}
function iterChanges(desc, f, individual) {
  let inserted = desc.inserted;
  for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
    let len = desc.sections[i++], ins = desc.sections[i++];
    if (ins < 0) {
      posA += len;
      posB += len;
    } else {
      let endA = posA, endB = posB, text = Text.empty;
      for (; ; ) {
        endA += len;
        endB += ins;
        if (ins && inserted)
          text = text.append(inserted[i - 2 >> 1]);
        if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
          break;
        len = desc.sections[i++];
        ins = desc.sections[i++];
      }
      f(posA, endA, posB, endB, text);
      posA = endA;
      posB = endB;
    }
  }
}
function mapSet(setA, setB, before, mkSet = false) {
  let sections = [], insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let posA = 0, posB = 0; ; ) {
    if (a.ins == -1) {
      posA += a.len;
      a.next();
    } else if (b.ins == -1 && posB < posA) {
      let skip2 = Math.min(b.len, posA - posB);
      b.forward(skip2);
      addSection(sections, skip2, -1);
      posB += skip2;
    } else if (b.ins >= 0 && (a.done || posB < posA || posB == posA && (b.len < a.len || b.len == a.len && !before))) {
      addSection(sections, b.ins, -1);
      while (posA > posB && !a.done && posA + a.len < posB + b.len) {
        posA += a.len;
        a.next();
      }
      posB += b.len;
      b.next();
    } else if (a.ins >= 0) {
      let len = 0, end = posA + a.len;
      for (; ; ) {
        if (b.ins >= 0 && posB > posA && posB + b.len < end) {
          len += b.ins;
          posB += b.len;
          b.next();
        } else if (b.ins == -1 && posB < end) {
          let skip2 = Math.min(b.len, end - posB);
          len += skip2;
          b.forward(skip2);
          posB += skip2;
        } else {
          break;
        }
      }
      addSection(sections, len, a.ins);
      if (insert2)
        addInsert(insert2, sections, a.text);
      posA = end;
      a.next();
    } else if (a.done && b.done) {
      return insert2 ? new ChangeSet(sections, insert2) : new ChangeDesc(sections);
    } else {
      throw new Error("Mismatched change set lengths");
    }
  }
}
function composeSets(setA, setB, mkSet = false) {
  let sections = [];
  let insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let open = false; ; ) {
    if (a.done && b.done) {
      return insert2 ? new ChangeSet(sections, insert2) : new ChangeDesc(sections);
    } else if (a.ins == 0) {
      addSection(sections, a.len, 0, open);
      a.next();
    } else if (b.len == 0 && !b.done) {
      addSection(sections, 0, b.ins, open);
      if (insert2)
        addInsert(insert2, sections, b.text);
      b.next();
    } else if (a.done || b.done) {
      throw new Error("Mismatched change set lengths");
    } else {
      let len = Math.min(a.len2, b.len), sectionLen = sections.length;
      if (a.ins == -1) {
        let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
        addSection(sections, len, insB, open);
        if (insert2 && insB)
          addInsert(insert2, sections, b.text);
      } else if (b.ins == -1) {
        addSection(sections, a.off ? 0 : a.len, len, open);
        if (insert2)
          addInsert(insert2, sections, a.textBit(len));
      } else {
        addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
        if (insert2 && !b.off)
          addInsert(insert2, sections, b.text);
      }
      open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
      a.forward2(len);
      b.forward(len);
    }
  }
}
var SectionIter = class {
  constructor(set) {
    this.set = set;
    this.i = 0;
    this.next();
  }
  next() {
    let {sections} = this.set;
    if (this.i < sections.length) {
      this.len = sections[this.i++];
      this.ins = sections[this.i++];
    } else {
      this.len = 0;
      this.ins = -2;
    }
    this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let {inserted} = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length ? Text.empty : inserted[index];
  }
  textBit(len) {
    let {inserted} = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
  }
  forward(len) {
    if (len == this.len)
      this.next();
    else {
      this.len -= len;
      this.off += len;
    }
  }
  forward2(len) {
    if (this.ins == -1)
      this.forward(len);
    else if (len == this.ins)
      this.next();
    else {
      this.ins -= len;
      this.off += len;
    }
  }
};
var SelectionRange = class {
  constructor(from, to, flags) {
    this.from = from;
    this.to = to;
    this.flags = flags;
  }
  get anchor() {
    return this.flags & 16 ? this.to : this.from;
  }
  get head() {
    return this.flags & 16 ? this.from : this.to;
  }
  get empty() {
    return this.from == this.to;
  }
  get assoc() {
    return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
  }
  get bidiLevel() {
    let level = this.flags & 3;
    return level == 3 ? null : level;
  }
  get goalColumn() {
    let value = this.flags >> 5;
    return value == 33554431 ? void 0 : value;
  }
  map(change, assoc = -1) {
    let from = change.mapPos(this.from, assoc), to = change.mapPos(this.to, assoc);
    return from == this.from && to == this.to ? this : new SelectionRange(from, to, this.flags);
  }
  extend(from, to = from) {
    if (from <= this.anchor && to >= this.anchor)
      return EditorSelection.range(from, to);
    let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
    return EditorSelection.range(this.anchor, head);
  }
  eq(other) {
    return this.anchor == other.anchor && this.head == other.head;
  }
  toJSON() {
    return {anchor: this.anchor, head: this.head};
  }
  static fromJSON(json) {
    if (!json || typeof json.anchor != "number" || typeof json.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return EditorSelection.range(json.anchor, json.head);
  }
};
var EditorSelection = class {
  constructor(ranges, mainIndex = 0) {
    this.ranges = ranges;
    this.mainIndex = mainIndex;
  }
  map(change, assoc = -1) {
    if (change.empty)
      return this;
    return EditorSelection.create(this.ranges.map((r) => r.map(change, assoc)), this.mainIndex);
  }
  eq(other) {
    if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
      return false;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(other.ranges[i]))
        return false;
    return true;
  }
  get main() {
    return this.ranges[this.mainIndex];
  }
  asSingle() {
    return this.ranges.length == 1 ? this : new EditorSelection([this.main]);
  }
  addRange(range, main = true) {
    return EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
  }
  replaceRange(range, which = this.mainIndex) {
    let ranges = this.ranges.slice();
    ranges[which] = range;
    return EditorSelection.create(ranges, this.mainIndex);
  }
  toJSON() {
    return {ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex};
  }
  static fromJSON(json) {
    if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
  }
  static single(anchor, head = anchor) {
    return new EditorSelection([EditorSelection.range(anchor, head)], 0);
  }
  static create(ranges, mainIndex = 0) {
    if (ranges.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let pos = 0, i = 0; i < ranges.length; i++) {
      let range = ranges[i];
      if (range.empty ? range.from <= pos : range.from < pos)
        return normalized(ranges.slice(), mainIndex);
      pos = range.to;
    }
    return new EditorSelection(ranges, mainIndex);
  }
  static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
    return new SelectionRange(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 : 8) | (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) | (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5);
  }
  static range(anchor, head, goalColumn) {
    let goal = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5;
    return head < anchor ? new SelectionRange(head, anchor, 16 | goal) : new SelectionRange(anchor, head, goal);
  }
};
function normalized(ranges, mainIndex = 0) {
  let main = ranges[mainIndex];
  ranges.sort((a, b) => a.from - b.from);
  mainIndex = ranges.indexOf(main);
  for (let i = 1; i < ranges.length; i++) {
    let range = ranges[i], prev = ranges[i - 1];
    if (range.empty ? range.from <= prev.to : range.from < prev.to) {
      let from = prev.from, to = Math.max(range.to, prev.to);
      if (i <= mainIndex)
        mainIndex--;
      ranges.splice(--i, 2, range.anchor > range.head ? EditorSelection.range(to, from) : EditorSelection.range(from, to));
    }
  }
  return new EditorSelection(ranges, mainIndex);
}
function checkSelection(selection, docLength) {
  for (let range of selection.ranges)
    if (range.to > docLength)
      throw new RangeError("Selection points outside of document");
}
var nextID = 0;
var Facet = class {
  constructor(combine, compareInput, compare2, isStatic, extensions) {
    this.combine = combine;
    this.compareInput = compareInput;
    this.compare = compare2;
    this.isStatic = isStatic;
    this.extensions = extensions;
    this.id = nextID++;
    this.default = combine([]);
  }
  static define(config2 = {}) {
    return new Facet(config2.combine || ((a) => a), config2.compareInput || ((a, b) => a === b), config2.compare || (!config2.combine ? sameArray : (a, b) => a === b), !!config2.static, config2.enables);
  }
  of(value) {
    return new FacetProvider([], this, 0, value);
  }
  compute(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 1, get);
  }
  computeN(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 2, get);
  }
  from(field, get) {
    if (!get)
      get = (x) => x;
    return this.compute([field], (state) => get(state.field(field)));
  }
};
function sameArray(a, b) {
  return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
}
var FacetProvider = class {
  constructor(dependencies, facet, type, value) {
    this.dependencies = dependencies;
    this.facet = facet;
    this.type = type;
    this.value = value;
    this.id = nextID++;
  }
  dynamicSlot(addresses) {
    var _a;
    let getter = this.value;
    let compare2 = this.facet.compareInput;
    let idx = addresses[this.id] >> 1, multi = this.type == 2;
    let depDoc = false, depSel = false, depAddrs = [];
    for (let dep of this.dependencies) {
      if (dep == "doc")
        depDoc = true;
      else if (dep == "selection")
        depSel = true;
      else if ((((_a = addresses[dep.id]) !== null && _a !== void 0 ? _a : 1) & 1) == 0)
        depAddrs.push(addresses[dep.id]);
    }
    return (state, tr) => {
      if (!tr || tr.reconfigured) {
        state.values[idx] = getter(state);
        return 1;
      } else {
        let depChanged = depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || depAddrs.some((addr) => (ensureAddr(state, addr) & 1) > 0);
        if (!depChanged)
          return 0;
        let newVal = getter(state), oldVal = tr.startState.values[idx];
        if (multi ? compareArray(newVal, oldVal, compare2) : compare2(newVal, oldVal))
          return 0;
        state.values[idx] = newVal;
        return 1;
      }
    };
  }
};
function compareArray(a, b, compare2) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (!compare2(a[i], b[i]))
      return false;
  return true;
}
function dynamicFacetSlot(addresses, facet, providers) {
  let providerAddrs = providers.map((p) => addresses[p.id]);
  let providerTypes = providers.map((p) => p.type);
  let dynamic = providerAddrs.filter((p) => !(p & 1));
  let idx = addresses[facet.id] >> 1;
  return (state, tr) => {
    let oldAddr = !tr ? null : tr.reconfigured ? tr.startState.config.address[facet.id] : idx << 1;
    let changed = oldAddr == null;
    for (let dynAddr of dynamic) {
      if (ensureAddr(state, dynAddr) & 1)
        changed = true;
    }
    if (!changed)
      return 0;
    let values2 = [];
    for (let i = 0; i < providerAddrs.length; i++) {
      let value = getAddr(state, providerAddrs[i]);
      if (providerTypes[i] == 2)
        for (let val of value)
          values2.push(val);
      else
        values2.push(value);
    }
    let newVal = facet.combine(values2);
    if (oldAddr != null && facet.compare(newVal, getAddr(tr.startState, oldAddr)))
      return 0;
    state.values[idx] = newVal;
    return 1;
  };
}
function maybeIndex(state, id2) {
  let found = state.config.address[id2];
  return found == null ? null : found >> 1;
}
var initField = /* @__PURE__ */ Facet.define({static: true});
var StateField = class {
  constructor(id2, createF, updateF, compareF, spec) {
    this.id = id2;
    this.createF = createF;
    this.updateF = updateF;
    this.compareF = compareF;
    this.spec = spec;
    this.provides = void 0;
  }
  static define(config2) {
    let field = new StateField(nextID++, config2.create, config2.update, config2.compare || ((a, b) => a === b), config2);
    if (config2.provide)
      field.provides = config2.provide(field);
    return field;
  }
  create(state) {
    let init = state.facet(initField).find((i) => i.field == this);
    return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
  }
  slot(addresses) {
    let idx = addresses[this.id] >> 1;
    return (state, tr) => {
      if (!tr) {
        state.values[idx] = this.create(state);
        return 1;
      }
      let oldVal, changed = 0;
      if (tr.reconfigured) {
        let oldIdx = maybeIndex(tr.startState, this.id);
        oldVal = oldIdx == null ? this.create(tr.startState) : tr.startState.values[oldIdx];
        changed = 1;
      } else {
        oldVal = tr.startState.values[idx];
      }
      let value = this.updateF(oldVal, tr);
      if (!changed && !this.compareF(oldVal, value))
        changed = 1;
      if (changed)
        state.values[idx] = value;
      return changed;
    };
  }
  init(create) {
    return [this, initField.of({field: this, create})];
  }
  get extension() {
    return this;
  }
};
var Prec_ = {fallback: 3, default: 2, extend: 1, override: 0};
function prec(value) {
  return (ext) => new PrecExtension(ext, value);
}
var Prec = {
  fallback: /* @__PURE__ */ prec(Prec_.fallback),
  default: /* @__PURE__ */ prec(Prec_.default),
  extend: /* @__PURE__ */ prec(Prec_.extend),
  override: /* @__PURE__ */ prec(Prec_.override)
};
var PrecExtension = class {
  constructor(inner, prec2) {
    this.inner = inner;
    this.prec = prec2;
  }
};
var Compartment = class {
  of(ext) {
    return new CompartmentInstance(this, ext);
  }
  reconfigure(content2) {
    return Compartment.reconfigure.of({compartment: this, extension: content2});
  }
  get(state) {
    return state.config.compartments.get(this);
  }
};
var CompartmentInstance = class {
  constructor(compartment, inner) {
    this.compartment = compartment;
    this.inner = inner;
  }
};
var Configuration = class {
  constructor(base2, compartments, dynamicSlots, address, staticValues) {
    this.base = base2;
    this.compartments = compartments;
    this.dynamicSlots = dynamicSlots;
    this.address = address;
    this.staticValues = staticValues;
    this.statusTemplate = [];
    while (this.statusTemplate.length < dynamicSlots.length)
      this.statusTemplate.push(0);
  }
  staticFacet(facet) {
    let addr = this.address[facet.id];
    return addr == null ? facet.default : this.staticValues[addr >> 1];
  }
  static resolve(base2, compartments, oldState) {
    let fields = [];
    let facets = Object.create(null);
    let newCompartments = new Map();
    for (let ext of flatten(base2, compartments, newCompartments)) {
      if (ext instanceof StateField)
        fields.push(ext);
      else
        (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
    }
    let address = Object.create(null);
    let staticValues = [];
    let dynamicSlots = [];
    for (let field of fields) {
      address[field.id] = dynamicSlots.length << 1;
      dynamicSlots.push((a) => field.slot(a));
    }
    for (let id2 in facets) {
      let providers = facets[id2], facet = providers[0].facet;
      if (providers.every((p) => p.type == 0)) {
        address[facet.id] = staticValues.length << 1 | 1;
        let value = facet.combine(providers.map((p) => p.value));
        let oldAddr = oldState ? oldState.config.address[facet.id] : null;
        if (oldAddr != null) {
          let oldVal = getAddr(oldState, oldAddr);
          if (facet.compare(value, oldVal))
            value = oldVal;
        }
        staticValues.push(value);
      } else {
        for (let p of providers) {
          if (p.type == 0) {
            address[p.id] = staticValues.length << 1 | 1;
            staticValues.push(p.value);
          } else {
            address[p.id] = dynamicSlots.length << 1;
            dynamicSlots.push((a) => p.dynamicSlot(a));
          }
        }
        address[facet.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
      }
    }
    return new Configuration(base2, newCompartments, dynamicSlots.map((f) => f(address)), address, staticValues);
  }
};
function flatten(extension, compartments, newCompartments) {
  let result = [[], [], [], []];
  let seen = new Map();
  function inner(ext, prec2) {
    let known = seen.get(ext);
    if (known != null) {
      if (known >= prec2)
        return;
      let found = result[known].indexOf(ext);
      if (found > -1)
        result[known].splice(found, 1);
      if (ext instanceof CompartmentInstance)
        newCompartments.delete(ext.compartment);
    }
    seen.set(ext, prec2);
    if (Array.isArray(ext)) {
      for (let e of ext)
        inner(e, prec2);
    } else if (ext instanceof CompartmentInstance) {
      if (newCompartments.has(ext.compartment))
        throw new RangeError(`Duplicate use of compartment in extensions`);
      let content2 = compartments.get(ext.compartment) || ext.inner;
      newCompartments.set(ext.compartment, content2);
      inner(content2, prec2);
    } else if (ext instanceof PrecExtension) {
      inner(ext.inner, ext.prec);
    } else if (ext instanceof StateField) {
      result[prec2].push(ext);
      if (ext.provides)
        inner(ext.provides, prec2);
    } else if (ext instanceof FacetProvider) {
      result[prec2].push(ext);
      if (ext.facet.extensions)
        inner(ext.facet.extensions, prec2);
    } else {
      let content2 = ext.extension;
      if (!content2)
        throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      inner(content2, prec2);
    }
  }
  inner(extension, Prec_.default);
  return result.reduce((a, b) => a.concat(b));
}
function ensureAddr(state, addr) {
  if (addr & 1)
    return 2;
  let idx = addr >> 1;
  let status = state.status[idx];
  if (status == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (status & 2)
    return status;
  state.status[idx] = 4;
  let changed = state.config.dynamicSlots[idx](state, state.applying);
  return state.status[idx] = 2 | changed;
}
function getAddr(state, addr) {
  return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
}
var languageData = /* @__PURE__ */ Facet.define();
var allowMultipleSelections = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.some((v) => v),
  static: true
});
var lineSeparator = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.length ? values2[0] : void 0,
  static: true
});
var changeFilter = /* @__PURE__ */ Facet.define();
var transactionFilter = /* @__PURE__ */ Facet.define();
var transactionExtender = /* @__PURE__ */ Facet.define();
var Annotation = class {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  static define() {
    return new AnnotationType();
  }
};
var AnnotationType = class {
  of(value) {
    return new Annotation(this, value);
  }
};
var StateEffectType = class {
  constructor(map) {
    this.map = map;
  }
  of(value) {
    return new StateEffect(this, value);
  }
};
var StateEffect = class {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  map(mapping) {
    let mapped = this.type.map(this.value, mapping);
    return mapped === void 0 ? void 0 : mapped == this.value ? this : new StateEffect(this.type, mapped);
  }
  is(type) {
    return this.type == type;
  }
  static define(spec = {}) {
    return new StateEffectType(spec.map || ((v) => v));
  }
  static mapEffects(effects, mapping) {
    if (!effects.length)
      return effects;
    let result = [];
    for (let effect of effects) {
      let mapped = effect.map(mapping);
      if (mapped)
        result.push(mapped);
    }
    return result;
  }
};
StateEffect.reconfigure = /* @__PURE__ */ StateEffect.define();
StateEffect.appendConfig = /* @__PURE__ */ StateEffect.define();
var Transaction = class {
  constructor(startState, changes, selection, effects, annotations, scrollIntoView2) {
    this.startState = startState;
    this.changes = changes;
    this.selection = selection;
    this.effects = effects;
    this.annotations = annotations;
    this.scrollIntoView = scrollIntoView2;
    this._doc = null;
    this._state = null;
    if (selection)
      checkSelection(selection, changes.newLength);
    if (!annotations.some((a) => a.type == Transaction.time))
      this.annotations = annotations.concat(Transaction.time.of(Date.now()));
  }
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  get state() {
    if (!this._state)
      this.startState.applyTransaction(this);
    return this._state;
  }
  annotation(type) {
    for (let ann of this.annotations)
      if (ann.type == type)
        return ann.value;
    return void 0;
  }
  get docChanged() {
    return !this.changes.empty;
  }
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
};
Transaction.time = /* @__PURE__ */ Annotation.define();
Transaction.userEvent = /* @__PURE__ */ Annotation.define();
Transaction.addToHistory = /* @__PURE__ */ Annotation.define();
Transaction.remote = /* @__PURE__ */ Annotation.define();
function joinRanges(a, b) {
  let result = [];
  for (let iA = 0, iB = 0; ; ) {
    let from, to;
    if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
      from = a[iA++];
      to = a[iA++];
    } else if (iB < b.length) {
      from = b[iB++];
      to = b[iB++];
    } else
      return result;
    if (!result.length || result[result.length - 1] < from)
      result.push(from, to);
    else if (result[result.length - 1] < to)
      result[result.length - 1] = to;
  }
}
function mergeTransaction(a, b, sequential) {
  var _a;
  let mapForA, mapForB, changes;
  if (sequential) {
    mapForA = b.changes;
    mapForB = ChangeSet.empty(b.changes.length);
    changes = a.changes.compose(b.changes);
  } else {
    mapForA = b.changes.map(a.changes);
    mapForB = a.changes.mapDesc(b.changes, true);
    changes = a.changes.compose(mapForA);
  }
  return {
    changes,
    selection: b.selection ? b.selection.map(mapForB) : (_a = a.selection) === null || _a === void 0 ? void 0 : _a.map(mapForA),
    effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
    annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
    scrollIntoView: a.scrollIntoView || b.scrollIntoView
  };
}
function resolveTransactionInner(state, spec, docSize) {
  let sel = spec.selection;
  return {
    changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
    selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
    effects: asArray(spec.effects),
    annotations: asArray(spec.annotations),
    scrollIntoView: !!spec.scrollIntoView
  };
}
function resolveTransaction(state, specs, filter) {
  let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
  if (specs.length && specs[0].filter === false)
    filter = false;
  for (let i = 1; i < specs.length; i++) {
    if (specs[i].filter === false)
      filter = false;
    let seq = !!specs[i].sequential;
    s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
  }
  let tr = new Transaction(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
  return extendTransaction(filter ? filterTransaction(tr) : tr);
}
function filterTransaction(tr) {
  let state = tr.startState;
  let result = true;
  for (let filter of state.facet(changeFilter)) {
    let value = filter(tr);
    if (value === false) {
      result = false;
      break;
    }
    if (Array.isArray(value))
      result = result === true ? value : joinRanges(result, value);
  }
  if (result !== true) {
    let changes, back;
    if (result === false) {
      back = tr.changes.invertedDesc;
      changes = ChangeSet.empty(state.doc.length);
    } else {
      let filtered = tr.changes.filter(result);
      changes = filtered.changes;
      back = filtered.filtered.invertedDesc;
    }
    tr = new Transaction(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
  }
  let filters = state.facet(transactionFilter);
  for (let i = filters.length - 1; i >= 0; i--) {
    let filtered = filters[i](tr);
    if (filtered instanceof Transaction)
      tr = filtered;
    else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
      tr = filtered[0];
    else
      tr = resolveTransaction(state, asArray(filtered), false);
  }
  return tr;
}
function extendTransaction(tr) {
  let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
  for (let i = extenders.length - 1; i >= 0; i--) {
    let extension = extenders[i](tr);
    if (extension && Object.keys(extension).length)
      spec = mergeTransaction(tr, resolveTransactionInner(state, extension, tr.changes.newLength), true);
  }
  return spec == tr ? tr : new Transaction(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
}
var none = [];
function asArray(value) {
  return value == null ? none : Array.isArray(value) ? value : [value];
}
var CharCategory = /* @__PURE__ */ function(CharCategory2) {
  CharCategory2[CharCategory2["Word"] = 0] = "Word";
  CharCategory2[CharCategory2["Space"] = 1] = "Space";
  CharCategory2[CharCategory2["Other"] = 2] = "Other";
  return CharCategory2;
}(CharCategory || (CharCategory = {}));
var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
var wordChar;
try {
  wordChar = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch (_) {
}
function hasWordChar(str) {
  if (wordChar)
    return wordChar.test(str);
  for (let i = 0; i < str.length; i++) {
    let ch = str[i];
    if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
      return true;
  }
  return false;
}
function makeCategorizer(wordChars) {
  return (char) => {
    if (!/\S/.test(char))
      return CharCategory.Space;
    if (hasWordChar(char))
      return CharCategory.Word;
    for (let i = 0; i < wordChars.length; i++)
      if (char.indexOf(wordChars[i]) > -1)
        return CharCategory.Word;
    return CharCategory.Other;
  };
}
var EditorState = class {
  constructor(config2, doc2, selection, tr = null) {
    this.config = config2;
    this.doc = doc2;
    this.selection = selection;
    this.applying = null;
    this.status = config2.statusTemplate.slice();
    if (tr && tr.startState.config == config2) {
      this.values = tr.startState.values.slice();
    } else {
      this.values = config2.dynamicSlots.map((_) => null);
      if (tr)
        for (let id2 in config2.address) {
          let cur2 = config2.address[id2], prev = tr.startState.config.address[id2];
          if (prev != null && (cur2 & 1) == 0)
            this.values[cur2 >> 1] = getAddr(tr.startState, prev);
        }
    }
    this.applying = tr;
    if (tr)
      tr._state = this;
    for (let i = 0; i < this.config.dynamicSlots.length; i++)
      ensureAddr(this, i << 1);
    this.applying = null;
  }
  field(field, require2 = true) {
    let addr = this.config.address[field.id];
    if (addr == null) {
      if (require2)
        throw new RangeError("Field is not present in this state");
      return void 0;
    }
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  update(...specs) {
    return resolveTransaction(this, specs, true);
  }
  applyTransaction(tr) {
    let conf = this.config, {base: base2, compartments} = conf;
    for (let effect of tr.effects) {
      if (effect.is(Compartment.reconfigure)) {
        if (conf) {
          compartments = new Map();
          conf.compartments.forEach((val, key) => compartments.set(key, val));
          conf = null;
        }
        compartments.set(effect.value.compartment, effect.value.extension);
      } else if (effect.is(StateEffect.reconfigure)) {
        conf = null;
        base2 = effect.value;
      } else if (effect.is(StateEffect.appendConfig)) {
        conf = null;
        base2 = asArray(base2).concat(effect.value);
      }
    }
    new EditorState(conf || Configuration.resolve(base2, compartments, this), tr.newDoc, tr.newSelection, tr);
  }
  replaceSelection(text) {
    if (typeof text == "string")
      text = this.toText(text);
    return this.changeByRange((range) => ({
      changes: {from: range.from, to: range.to, insert: text},
      range: EditorSelection.cursor(range.from + text.length)
    }));
  }
  changeByRange(f) {
    let sel = this.selection;
    let result1 = f(sel.ranges[0]);
    let changes = this.changes(result1.changes), ranges = [result1.range];
    let effects = asArray(result1.effects);
    for (let i = 1; i < sel.ranges.length; i++) {
      let result = f(sel.ranges[i]);
      let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
      for (let j = 0; j < i; j++)
        ranges[j] = ranges[j].map(newMapped);
      let mapBy = changes.mapDesc(newChanges, true);
      ranges.push(result.range.map(mapBy));
      changes = changes.compose(newMapped);
      effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
    }
    return {
      changes,
      selection: EditorSelection.create(ranges, sel.mainIndex),
      effects
    };
  }
  changes(spec = []) {
    if (spec instanceof ChangeSet)
      return spec;
    return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
  }
  toText(string2) {
    return Text.of(string2.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
  }
  sliceDoc(from = 0, to = this.doc.length) {
    return this.doc.sliceString(from, to, this.lineBreak);
  }
  facet(facet) {
    let addr = this.config.address[facet.id];
    if (addr == null)
      return facet.default;
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  toJSON(fields) {
    let result = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (fields)
      for (let prop in fields) {
        let value = fields[prop];
        if (value instanceof StateField)
          result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
      }
    return result;
  }
  static fromJSON(json, config2 = {}, fields) {
    if (!json || typeof json.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let fieldInit = [];
    if (fields)
      for (let prop in fields) {
        let field = fields[prop], value = json[prop];
        fieldInit.push(field.init((state) => field.spec.fromJSON(value, state)));
      }
    return EditorState.create({
      doc: json.doc,
      selection: EditorSelection.fromJSON(json.selection),
      extensions: config2.extensions ? fieldInit.concat([config2.extensions]) : fieldInit
    });
  }
  static create(config2 = {}) {
    let configuration = Configuration.resolve(config2.extensions || [], new Map());
    let doc2 = config2.doc instanceof Text ? config2.doc : Text.of((config2.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
    let selection = !config2.selection ? EditorSelection.single(0) : config2.selection instanceof EditorSelection ? config2.selection : EditorSelection.single(config2.selection.anchor, config2.selection.head);
    checkSelection(selection, doc2.length);
    if (!configuration.staticFacet(allowMultipleSelections))
      selection = selection.asSingle();
    return new EditorState(configuration, doc2, selection);
  }
  get tabSize() {
    return this.facet(EditorState.tabSize);
  }
  get lineBreak() {
    return this.facet(EditorState.lineSeparator) || "\n";
  }
  phrase(phrase) {
    for (let map of this.facet(EditorState.phrases))
      if (Object.prototype.hasOwnProperty.call(map, phrase))
        return map[phrase];
    return phrase;
  }
  languageDataAt(name2, pos) {
    let values2 = [];
    for (let provider of this.facet(languageData)) {
      for (let result of provider(this, pos)) {
        if (Object.prototype.hasOwnProperty.call(result, name2))
          values2.push(result[name2]);
      }
    }
    return values2;
  }
  charCategorizer(at) {
    return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
  }
  wordAt(pos) {
    let {text, from, length} = this.doc.lineAt(pos);
    let cat = this.charCategorizer(pos);
    let start = pos - from, end = pos - from;
    while (start > 0) {
      let prev = findClusterBreak(text, start, false);
      if (cat(text.slice(prev, start)) != CharCategory.Word)
        break;
      start = prev;
    }
    while (end < length) {
      let next = findClusterBreak(text, end);
      if (cat(text.slice(end, next)) != CharCategory.Word)
        break;
      end = next;
    }
    return start == end ? EditorSelection.range(start + from, end + from) : null;
  }
};
EditorState.allowMultipleSelections = allowMultipleSelections;
EditorState.tabSize = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.length ? values2[0] : 4
});
EditorState.lineSeparator = lineSeparator;
EditorState.phrases = /* @__PURE__ */ Facet.define();
EditorState.languageData = languageData;
EditorState.changeFilter = changeFilter;
EditorState.transactionFilter = transactionFilter;
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = /* @__PURE__ */ StateEffect.define();
function combineConfig(configs, defaults3, combine = {}) {
  let result = {};
  for (let config2 of configs)
    for (let key of Object.keys(config2)) {
      let value = config2[key], current = result[key];
      if (current === void 0)
        result[key] = value;
      else if (current === value || value === void 0)
        ;
      else if (Object.hasOwnProperty.call(combine, key))
        result[key] = combine[key](current, value);
      else
        throw new Error("Config merge conflict for field " + key);
    }
  for (let key in defaults3)
    if (result[key] === void 0)
      result[key] = defaults3[key];
  return result;
}

// ../../node_modules/style-mod/src/style-mod.js
var C = "\u037C";
var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
var StyleModule = class {
  constructor(spec, options) {
    this.rules = [];
    let {finish} = options || {};
    function splitSelector(selector) {
      return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
    }
    function render(selectors, spec2, target, isKeyframes) {
      let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
      if (isAt && spec2 == null)
        return target.push(selectors[0] + ";");
      for (let prop in spec2) {
        let value = spec2[prop];
        if (/&/.test(prop)) {
          render(prop.split(/,\s*/).map((part) => selectors.map((sel) => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)), value, target);
        } else if (value && typeof value == "object") {
          if (!isAt)
            throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
          render(splitSelector(prop), value, local, keyframes);
        } else if (value != null) {
          local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value + ";");
        }
      }
      if (local.length || keyframes) {
        target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
      }
    }
    for (let prop in spec)
      render(splitSelector(prop), spec[prop], this.rules);
  }
  getRules() {
    return this.rules.join("\n");
  }
  static newName() {
    let id2 = top[COUNT] || 1;
    top[COUNT] = id2 + 1;
    return C + id2.toString(36);
  }
  static mount(root, modules) {
    (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
  }
};
var adoptedSet = null;
var StyleSet = class {
  constructor(root) {
    if (!root.head && root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
      if (adoptedSet) {
        root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
        return root[SET] = adoptedSet;
      }
      this.sheet = new CSSStyleSheet();
      root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
      adoptedSet = this;
    } else {
      this.styleTag = (root.ownerDocument || root).createElement("style");
      let target = root.head || root;
      target.insertBefore(this.styleTag, target.firstChild);
    }
    this.modules = [];
    root[SET] = this;
  }
  mount(modules) {
    let sheet = this.sheet;
    let pos = 0, j = 0;
    for (let i = 0; i < modules.length; i++) {
      let mod = modules[i], index = this.modules.indexOf(mod);
      if (index < j && index > -1) {
        this.modules.splice(index, 1);
        j--;
        index = -1;
      }
      if (index == -1) {
        this.modules.splice(j++, 0, mod);
        if (sheet)
          for (let k = 0; k < mod.rules.length; k++)
            sheet.insertRule(mod.rules[k], pos++);
      } else {
        while (j < index)
          pos += this.modules[j++].rules.length;
        pos += mod.rules.length;
        j++;
      }
    }
    if (!sheet) {
      let text = "";
      for (let i = 0; i < this.modules.length; i++)
        text += this.modules[i].getRules() + "\n";
      this.styleTag.textContent = text;
    }
  }
};

// ../../node_modules/@codemirror/rangeset/dist/index.js
var RangeValue = class {
  eq(other) {
    return this == other;
  }
  range(from, to = from) {
    return new Range(from, to, this);
  }
};
RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
RangeValue.prototype.point = false;
RangeValue.prototype.mapMode = MapMode.TrackDel;
var Range = class {
  constructor(from, to, value) {
    this.from = from;
    this.to = to;
    this.value = value;
  }
};
function cmpRange(a, b) {
  return a.from - b.from || a.value.startSide - b.value.startSide;
}
var Chunk = class {
  constructor(from, to, value, maxPoint) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.maxPoint = maxPoint;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  findIndex(pos, end, side = end * 1e9, startAt = 0) {
    if (pos <= 0)
      return startAt;
    let arr = end < 0 ? this.to : this.from;
    for (let lo = startAt, hi = arr.length; ; ) {
      if (lo == hi)
        return lo;
      let mid = lo + hi >> 1;
      let diff = arr[mid] - pos || (end < 0 ? this.value[mid].startSide : this.value[mid].endSide) - side;
      if (mid == lo)
        return diff >= 0 ? lo : hi;
      if (diff >= 0)
        hi = mid;
      else
        lo = mid + 1;
    }
  }
  between(offset, from, to, f) {
    for (let i = this.findIndex(from, -1), e = this.findIndex(to, 1, void 0, i); i < e; i++)
      if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
        return false;
  }
  map(offset, changes) {
    let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
    for (let i = 0; i < this.value.length; i++) {
      let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
      if (curFrom == curTo) {
        let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
        if (mapped == null)
          continue;
        newFrom = newTo = mapped;
      } else {
        newFrom = changes.mapPos(curFrom, val.startSide);
        newTo = changes.mapPos(curTo, val.endSide);
        if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
          continue;
      }
      if ((newTo - newFrom || val.endSide - val.startSide) < 0)
        continue;
      if (newPos < 0)
        newPos = newFrom;
      if (val.point)
        maxPoint = Math.max(maxPoint, newTo - newFrom);
      value.push(val);
      from.push(newFrom - newPos);
      to.push(newTo - newPos);
    }
    return {mapped: value.length ? new Chunk(from, to, value, maxPoint) : null, pos: newPos};
  }
};
var RangeSet = class {
  constructor(chunkPos, chunk, nextLayer = RangeSet.empty, maxPoint) {
    this.chunkPos = chunkPos;
    this.chunk = chunk;
    this.nextLayer = nextLayer;
    this.maxPoint = maxPoint;
  }
  get length() {
    let last = this.chunk.length - 1;
    return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
  }
  get size() {
    if (this == RangeSet.empty)
      return 0;
    let size = this.nextLayer.size;
    for (let chunk of this.chunk)
      size += chunk.value.length;
    return size;
  }
  chunkEnd(index) {
    return this.chunkPos[index] + this.chunk[index].length;
  }
  update(updateSpec) {
    let {add = [], sort = false, filterFrom = 0, filterTo = this.length} = updateSpec;
    let filter = updateSpec.filter;
    if (add.length == 0 && !filter)
      return this;
    if (sort)
      add.slice().sort(cmpRange);
    if (this == RangeSet.empty)
      return add.length ? RangeSet.of(add) : this;
    let cur2 = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
    let builder = new RangeSetBuilder();
    while (cur2.value || i < add.length) {
      if (i < add.length && (cur2.from - add[i].from || cur2.startSide - add[i].value.startSide) >= 0) {
        let range = add[i++];
        if (!builder.addInner(range.from, range.to, range.value))
          spill.push(range);
      } else if (cur2.rangeIndex == 1 && cur2.chunkIndex < this.chunk.length && (i == add.length || this.chunkEnd(cur2.chunkIndex) < add[i].from) && (!filter || filterFrom > this.chunkEnd(cur2.chunkIndex) || filterTo < this.chunkPos[cur2.chunkIndex]) && builder.addChunk(this.chunkPos[cur2.chunkIndex], this.chunk[cur2.chunkIndex])) {
        cur2.nextChunk();
      } else {
        if (!filter || filterFrom > cur2.to || filterTo < cur2.from || filter(cur2.from, cur2.to, cur2.value)) {
          if (!builder.addInner(cur2.from, cur2.to, cur2.value))
            spill.push(new Range(cur2.from, cur2.to, cur2.value));
        }
        cur2.next();
      }
    }
    return builder.finishInner(this.nextLayer == RangeSet.empty && !spill.length ? RangeSet.empty : this.nextLayer.update({add: spill, filter, filterFrom, filterTo}));
  }
  map(changes) {
    if (changes.length == 0 || this == RangeSet.empty)
      return this;
    let chunks = [], chunkPos = [], maxPoint = -1;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      let touch = changes.touchesRange(start, start + chunk.length);
      if (touch === false) {
        maxPoint = Math.max(maxPoint, chunk.maxPoint);
        chunks.push(chunk);
        chunkPos.push(changes.mapPos(start));
      } else if (touch === true) {
        let {mapped, pos} = chunk.map(start, changes);
        if (mapped) {
          maxPoint = Math.max(maxPoint, mapped.maxPoint);
          chunks.push(mapped);
          chunkPos.push(pos);
        }
      }
    }
    let next = this.nextLayer.map(changes);
    return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next, maxPoint);
  }
  between(from, to, f) {
    if (this == RangeSet.empty)
      return;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
        return;
    }
    this.nextLayer.between(from, to, f);
  }
  iter(from = 0) {
    return HeapCursor.from([this]).goto(from);
  }
  static iter(sets, from = 0) {
    return HeapCursor.from(sets).goto(from);
  }
  static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
    let a = oldSets.filter((set) => set.maxPoint >= 500 || set != RangeSet.empty && newSets.indexOf(set) < 0 && set.maxPoint >= minPointSize);
    let b = newSets.filter((set) => set.maxPoint >= 500 || set != RangeSet.empty && oldSets.indexOf(set) < 0 && set.maxPoint >= minPointSize);
    let sharedChunks = findSharedChunks(a, b);
    let sideA = new SpanCursor(a, sharedChunks, minPointSize);
    let sideB = new SpanCursor(b, sharedChunks, minPointSize);
    textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
    if (textDiff.empty && textDiff.length == 0)
      compare(sideA, 0, sideB, 0, 0, comparator);
  }
  static spans(sets, from, to, iterator, minPointSize = -1) {
    let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
    let open = cursor.openStart;
    for (; ; ) {
      let curTo = Math.min(cursor.to, to);
      if (cursor.point) {
        iterator.point(pos, curTo, cursor.point, cursor.activeForPoint(cursor.to), open);
        open = cursor.openEnd(curTo) + (cursor.to > curTo ? 1 : 0);
      } else if (curTo > pos) {
        iterator.span(pos, curTo, cursor.active, open);
        open = cursor.openEnd(curTo);
      }
      if (cursor.to > to)
        break;
      pos = cursor.to;
      cursor.next();
    }
    return open;
  }
  static of(ranges, sort = false) {
    let build = new RangeSetBuilder();
    for (let range of ranges instanceof Range ? [ranges] : sort ? ranges.slice().sort(cmpRange) : ranges)
      build.add(range.from, range.to, range.value);
    return build.finish();
  }
};
RangeSet.empty = new RangeSet([], [], null, -1);
RangeSet.empty.nextLayer = RangeSet.empty;
var RangeSetBuilder = class {
  constructor() {
    this.chunks = [];
    this.chunkPos = [];
    this.chunkStart = -1;
    this.last = null;
    this.lastFrom = -1e9;
    this.lastTo = -1e9;
    this.from = [];
    this.to = [];
    this.value = [];
    this.maxPoint = -1;
    this.setMaxPoint = -1;
    this.nextLayer = null;
  }
  finishChunk(newArrays) {
    this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
    this.chunkPos.push(this.chunkStart);
    this.chunkStart = -1;
    this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
    this.maxPoint = -1;
    if (newArrays) {
      this.from = [];
      this.to = [];
      this.value = [];
    }
  }
  add(from, to, value) {
    if (!this.addInner(from, to, value))
      (this.nextLayer || (this.nextLayer = new RangeSetBuilder())).add(from, to, value);
  }
  addInner(from, to, value) {
    let diff = from - this.lastTo || value.startSide - this.last.endSide;
    if (diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    if (diff < 0)
      return false;
    if (this.from.length == 250)
      this.finishChunk(true);
    if (this.chunkStart < 0)
      this.chunkStart = from;
    this.from.push(from - this.chunkStart);
    this.to.push(to - this.chunkStart);
    this.last = value;
    this.lastFrom = from;
    this.lastTo = to;
    this.value.push(value);
    if (value.point)
      this.maxPoint = Math.max(this.maxPoint, to - from);
    return true;
  }
  addChunk(from, chunk) {
    if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
      return false;
    if (this.from.length)
      this.finishChunk(true);
    this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
    this.chunks.push(chunk);
    this.chunkPos.push(from);
    let last = chunk.value.length - 1;
    this.last = chunk.value[last];
    this.lastFrom = chunk.from[last] + from;
    this.lastTo = chunk.to[last] + from;
    return true;
  }
  finish() {
    return this.finishInner(RangeSet.empty);
  }
  finishInner(next) {
    if (this.from.length)
      this.finishChunk(false);
    if (this.chunks.length == 0)
      return next;
    let result = new RangeSet(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
    this.from = null;
    return result;
  }
};
function findSharedChunks(a, b) {
  let inA = new Map();
  for (let set of a)
    for (let i = 0; i < set.chunk.length; i++)
      if (set.chunk[i].maxPoint < 500)
        inA.set(set.chunk[i], set.chunkPos[i]);
  let shared = new Set();
  for (let set of b)
    for (let i = 0; i < set.chunk.length; i++)
      if (inA.get(set.chunk[i]) == set.chunkPos[i])
        shared.add(set.chunk[i]);
  return shared;
}
var LayerCursor = class {
  constructor(layer, skip2, minPoint, rank = 0) {
    this.layer = layer;
    this.skip = skip2;
    this.minPoint = minPoint;
    this.rank = rank;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(pos, side = -1e9) {
    this.chunkIndex = this.rangeIndex = 0;
    this.gotoInner(pos, side, false);
    return this;
  }
  gotoInner(pos, side, forward) {
    while (this.chunkIndex < this.layer.chunk.length) {
      let next = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
        break;
      this.chunkIndex++;
      forward = false;
    }
    let rangeIndex = this.chunkIndex == this.layer.chunk.length ? 0 : this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], -1, side);
    if (!forward || this.rangeIndex < rangeIndex)
      this.rangeIndex = rangeIndex;
    this.next();
  }
  forward(pos, side) {
    if ((this.to - pos || this.endSide - side) < 0)
      this.gotoInner(pos, side, true);
  }
  next() {
    for (; ; ) {
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9;
        this.value = null;
        break;
      } else {
        let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
        let from = chunkPos + chunk.from[this.rangeIndex];
        this.from = from;
        this.to = chunkPos + chunk.to[this.rangeIndex];
        this.value = chunk.value[this.rangeIndex];
        if (++this.rangeIndex == chunk.value.length) {
          this.chunkIndex++;
          if (this.skip) {
            while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
              this.chunkIndex++;
          }
          this.rangeIndex = 0;
        }
        if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
    }
  }
  nextChunk() {
    this.chunkIndex++;
    this.rangeIndex = 0;
    this.next();
  }
  compare(other) {
    return this.from - other.from || this.startSide - other.startSide || this.to - other.to || this.endSide - other.endSide;
  }
};
var HeapCursor = class {
  constructor(heap) {
    this.heap = heap;
  }
  static from(sets, skip2 = null, minPoint = -1) {
    let heap = [];
    for (let i = 0; i < sets.length; i++) {
      for (let cur2 = sets[i]; cur2 != RangeSet.empty; cur2 = cur2.nextLayer) {
        if (cur2.maxPoint >= minPoint)
          heap.push(new LayerCursor(cur2, skip2, minPoint, i));
      }
    }
    return heap.length == 1 ? heap[0] : new HeapCursor(heap);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(pos, side = -1e9) {
    for (let cur2 of this.heap)
      cur2.goto(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    this.next();
    return this;
  }
  forward(pos, side) {
    for (let cur2 of this.heap)
      cur2.forward(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    if ((this.to - pos || this.value.endSide - side) < 0)
      this.next();
  }
  next() {
    if (this.heap.length == 0) {
      this.from = this.to = 1e9;
      this.value = null;
      this.rank = -1;
    } else {
      let top2 = this.heap[0];
      this.from = top2.from;
      this.to = top2.to;
      this.value = top2.value;
      this.rank = top2.rank;
      if (top2.value)
        top2.next();
      heapBubble(this.heap, 0);
    }
  }
};
function heapBubble(heap, index) {
  for (let cur2 = heap[index]; ; ) {
    let childIndex = (index << 1) + 1;
    if (childIndex >= heap.length)
      break;
    let child = heap[childIndex];
    if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
      child = heap[childIndex + 1];
      childIndex++;
    }
    if (cur2.compare(child) < 0)
      break;
    heap[childIndex] = cur2;
    heap[index] = child;
    index = childIndex;
  }
}
var SpanCursor = class {
  constructor(sets, skip2, minPoint) {
    this.minPoint = minPoint;
    this.active = [];
    this.activeTo = [];
    this.activeRank = [];
    this.minActive = -1;
    this.point = null;
    this.pointFrom = 0;
    this.pointRank = 0;
    this.to = -1e9;
    this.endSide = 0;
    this.openStart = -1;
    this.cursor = HeapCursor.from(sets, skip2, minPoint);
  }
  goto(pos, side = -1e9) {
    this.cursor.goto(pos, side);
    this.active.length = this.activeTo.length = this.activeRank.length = 0;
    this.minActive = -1;
    this.to = pos;
    this.endSide = side;
    this.openStart = -1;
    this.next();
    return this;
  }
  forward(pos, side) {
    while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
      this.removeActive(this.minActive);
    this.cursor.forward(pos, side);
  }
  removeActive(index) {
    remove(this.active, index);
    remove(this.activeTo, index);
    remove(this.activeRank, index);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  addActive(trackOpen) {
    let i = 0, {value, to, rank} = this.cursor;
    while (i < this.activeRank.length && this.activeRank[i] <= rank)
      i++;
    insert(this.active, i, value);
    insert(this.activeTo, i, to);
    insert(this.activeRank, i, rank);
    if (trackOpen)
      insert(trackOpen, i, this.cursor.from);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  next() {
    let from = this.to;
    this.point = null;
    let trackOpen = this.openStart < 0 ? [] : null, trackExtra = 0;
    for (; ; ) {
      let a = this.minActive;
      if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[a] > from) {
          this.to = this.activeTo[a];
          this.endSide = this.active[a].endSide;
          break;
        }
        this.removeActive(a);
        if (trackOpen)
          remove(trackOpen, a);
      } else if (!this.cursor.value) {
        this.to = this.endSide = 1e9;
        break;
      } else if (this.cursor.from > from) {
        this.to = this.cursor.from;
        this.endSide = this.cursor.startSide;
        break;
      } else {
        let nextVal = this.cursor.value;
        if (!nextVal.point) {
          this.addActive(trackOpen);
          this.cursor.next();
        } else {
          this.point = nextVal;
          this.pointFrom = this.cursor.from;
          this.pointRank = this.cursor.rank;
          this.to = this.cursor.to;
          this.endSide = nextVal.endSide;
          if (this.cursor.from < from)
            trackExtra = 1;
          this.cursor.next();
          if (this.to > from)
            this.forward(this.to, this.endSide);
          break;
        }
      }
    }
    if (trackOpen) {
      let openStart = 0;
      while (openStart < trackOpen.length && trackOpen[openStart] < from)
        openStart++;
      this.openStart = openStart + trackExtra;
    }
  }
  activeForPoint(to) {
    if (!this.active.length)
      return this.active;
    let active = [];
    for (let i = 0; i < this.active.length; i++) {
      if (this.activeRank[i] > this.pointRank)
        break;
      if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide > this.point.endSide)
        active.push(this.active[i]);
    }
    return active;
  }
  openEnd(to) {
    let open = 0;
    while (open < this.activeTo.length && this.activeTo[open] > to)
      open++;
    return open;
  }
};
function compare(a, startA, b, startB, length, comparator) {
  a.goto(startA);
  b.goto(startB);
  let endB = startB + length;
  let pos = startB, dPos = startB - startA;
  for (; ; ) {
    let diff = a.to + dPos - b.to || a.endSide - b.endSide;
    let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
    if (a.point || b.point) {
      if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point))))
        comparator.comparePoint(pos, clipEnd, a.point, b.point);
    } else {
      if (clipEnd > pos && !sameValues(a.active, b.active))
        comparator.compareRange(pos, clipEnd, a.active, b.active);
    }
    if (end > endB)
      break;
    pos = end;
    if (diff <= 0)
      a.next();
    if (diff >= 0)
      b.next();
  }
}
function sameValues(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (a[i] != b[i] && !a[i].eq(b[i]))
      return false;
  return true;
}
function remove(array, index) {
  for (let i = index, e = array.length - 1; i < e; i++)
    array[i] = array[i + 1];
  array.pop();
}
function insert(array, index, value) {
  for (let i = array.length - 1; i >= index; i--)
    array[i + 1] = array[i];
  array[index] = value;
}
function findMinIndex(value, array) {
  let found = -1, foundPos = 1e9;
  for (let i = 0; i < array.length; i++)
    if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
      found = i;
      foundPos = array[i];
    }
  return found;
}

// ../../node_modules/w3c-keyname/index.es.js
var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'",
  229: "q"
};
var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"',
  229: "Q"
};
var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
var safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
var brokenModifierNames = chrome && (mac || +chrome[1] < 57) || gecko && mac;
for (var i = 0; i < 10; i++)
  base[48 + i] = base[96 + i] = String(i);
for (var i = 1; i <= 24; i++)
  base[i + 111] = "F" + i;
for (var i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32);
  shift[i] = String.fromCharCode(i);
}
for (var code in base)
  if (!shift.hasOwnProperty(code))
    shift[code] = base[code];
function keyName(event) {
  var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || (safari || ie) && event.shiftKey && event.key && event.key.length == 1;
  var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
  if (name2 == "Esc")
    name2 = "Escape";
  if (name2 == "Del")
    name2 = "Delete";
  if (name2 == "Left")
    name2 = "ArrowLeft";
  if (name2 == "Up")
    name2 = "ArrowUp";
  if (name2 == "Right")
    name2 = "ArrowRight";
  if (name2 == "Down")
    name2 = "ArrowDown";
  return name2;
}

// ../../node_modules/@codemirror/view/dist/index.js
function getSelection(root) {
  return root.getSelection ? root.getSelection() : document.getSelection();
}
function contains(dom, node) {
  return node ? dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
}
function deepActiveElement() {
  let elt2 = document.activeElement;
  while (elt2 && elt2.shadowRoot)
    elt2 = elt2.shadowRoot.activeElement;
  return elt2;
}
function hasSelection(dom, selection) {
  if (!selection.anchorNode)
    return false;
  try {
    return contains(dom, selection.anchorNode);
  } catch (_) {
    return false;
  }
}
function clientRectsFor(dom) {
  if (dom.nodeType == 3)
    return textRange(dom, 0, dom.nodeValue.length).getClientRects();
  else if (dom.nodeType == 1)
    return dom.getClientRects();
  else
    return [];
}
function isEquivalentPosition(node, off, targetNode, targetOff) {
  return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
}
function domIndex(node) {
  for (var index = 0; ; index++) {
    node = node.previousSibling;
    if (!node)
      return index;
  }
}
function scanFor(node, off, targetNode, targetOff, dir) {
  for (; ; ) {
    if (node == targetNode && off == targetOff)
      return true;
    if (off == (dir < 0 ? 0 : maxOffset(node))) {
      if (node.nodeName == "DIV")
        return false;
      let parent = node.parentNode;
      if (!parent || parent.nodeType != 1)
        return false;
      off = domIndex(node) + (dir < 0 ? 0 : 1);
      node = parent;
    } else if (node.nodeType == 1) {
      node = node.childNodes[off + (dir < 0 ? -1 : 0)];
      off = dir < 0 ? maxOffset(node) : 0;
    } else {
      return false;
    }
  }
}
function maxOffset(node) {
  return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
var Rect0 = {left: 0, right: 0, top: 0, bottom: 0};
function flattenRect(rect, left) {
  let x = left ? rect.left : rect.right;
  return {left: x, right: x, top: rect.top, bottom: rect.bottom};
}
function windowRect(win) {
  return {
    left: 0,
    right: win.innerWidth,
    top: 0,
    bottom: win.innerHeight
  };
}
var ScrollSpace = 5;
function scrollRectIntoView(dom, rect) {
  let doc2 = dom.ownerDocument, win = doc2.defaultView;
  for (let cur2 = dom.parentNode; cur2; ) {
    if (cur2.nodeType == 1) {
      let bounding, top2 = cur2 == document.body;
      if (top2) {
        bounding = windowRect(win);
      } else {
        if (cur2.scrollHeight <= cur2.clientHeight && cur2.scrollWidth <= cur2.clientWidth) {
          cur2 = cur2.parentNode;
          continue;
        }
        let rect2 = cur2.getBoundingClientRect();
        bounding = {
          left: rect2.left,
          right: rect2.left + cur2.clientWidth,
          top: rect2.top,
          bottom: rect2.top + cur2.clientHeight
        };
      }
      let moveX = 0, moveY = 0;
      if (rect.top < bounding.top)
        moveY = -(bounding.top - rect.top + ScrollSpace);
      else if (rect.bottom > bounding.bottom)
        moveY = rect.bottom - bounding.bottom + ScrollSpace;
      if (rect.left < bounding.left)
        moveX = -(bounding.left - rect.left + ScrollSpace);
      else if (rect.right > bounding.right)
        moveX = rect.right - bounding.right + ScrollSpace;
      if (moveX || moveY) {
        if (top2) {
          win.scrollBy(moveX, moveY);
        } else {
          if (moveY) {
            let start = cur2.scrollTop;
            cur2.scrollTop += moveY;
            moveY = cur2.scrollTop - start;
          }
          if (moveX) {
            let start = cur2.scrollLeft;
            cur2.scrollLeft += moveX;
            moveX = cur2.scrollLeft - start;
          }
          rect = {
            left: rect.left - moveX,
            top: rect.top - moveY,
            right: rect.right - moveX,
            bottom: rect.bottom - moveY
          };
        }
      }
      if (top2)
        break;
      cur2 = cur2.assignedSlot || cur2.parentNode;
    } else if (cur2.nodeType == 11) {
      cur2 = cur2.host;
    } else {
      break;
    }
  }
}
var DOMSelection = class {
  constructor() {
    this.anchorNode = null;
    this.anchorOffset = 0;
    this.focusNode = null;
    this.focusOffset = 0;
  }
  eq(domSel) {
    return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
  }
  set(domSel) {
    this.anchorNode = domSel.anchorNode;
    this.anchorOffset = domSel.anchorOffset;
    this.focusNode = domSel.focusNode;
    this.focusOffset = domSel.focusOffset;
  }
};
var preventScrollSupported = null;
function focusPreventScroll(dom) {
  if (dom.setActive)
    return dom.setActive();
  if (preventScrollSupported)
    return dom.focus(preventScrollSupported);
  let stack = [];
  for (let cur2 = dom; cur2; cur2 = cur2.parentNode) {
    stack.push(cur2, cur2.scrollTop, cur2.scrollLeft);
    if (cur2 == cur2.ownerDocument)
      break;
  }
  dom.focus(preventScrollSupported == null ? {
    get preventScroll() {
      preventScrollSupported = {preventScroll: true};
      return true;
    }
  } : void 0);
  if (!preventScrollSupported) {
    preventScrollSupported = false;
    for (let i = 0; i < stack.length; ) {
      let elt2 = stack[i++], top2 = stack[i++], left = stack[i++];
      if (elt2.scrollTop != top2)
        elt2.scrollTop = top2;
      if (elt2.scrollLeft != left)
        elt2.scrollLeft = left;
    }
  }
}
var scratchRange;
function textRange(node, from, to = from) {
  let range = scratchRange || (scratchRange = document.createRange());
  range.setEnd(node, to);
  range.setStart(node, from);
  return range;
}
var DOMPos = class {
  constructor(node, offset, precise = true) {
    this.node = node;
    this.offset = offset;
    this.precise = precise;
  }
  static before(dom, precise) {
    return new DOMPos(dom.parentNode, domIndex(dom), precise);
  }
  static after(dom, precise) {
    return new DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
  }
};
var none$3 = [];
var ContentView = class {
  constructor() {
    this.parent = null;
    this.dom = null;
    this.dirty = 2;
  }
  get editorView() {
    if (!this.parent)
      throw new Error("Accessing view in orphan content view");
    return this.parent.editorView;
  }
  get overrideDOMText() {
    return null;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(view) {
    let pos = this.posAtStart;
    for (let child of this.children) {
      if (child == view)
        return pos;
      pos += child.length + child.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(view) {
    return this.posBefore(view) + view.length;
  }
  coordsAt(_pos, _side) {
    return null;
  }
  sync(track) {
    var _a;
    if (this.dirty & 2) {
      let parent = this.dom, pos = null;
      for (let child of this.children) {
        if (child.dirty) {
          let next2 = pos ? pos.nextSibling : parent.firstChild;
          if (!child.dom && next2 && !((_a = ContentView.get(next2)) === null || _a === void 0 ? void 0 : _a.parent))
            child.reuseDOM(next2);
          child.sync(track);
          child.dirty = 0;
        }
        if (track && track.node == parent && pos != child.dom)
          track.written = true;
        syncNodeInto(parent, pos, child.dom);
        pos = child.dom;
      }
      let next = pos ? pos.nextSibling : parent.firstChild;
      if (next && track && track.node == parent)
        track.written = true;
      while (next)
        next = rm(next);
    } else if (this.dirty & 1) {
      for (let child of this.children)
        if (child.dirty) {
          child.sync(track);
          child.dirty = 0;
        }
    }
  }
  reuseDOM(_dom) {
    return false;
  }
  localPosFromDOM(node, offset) {
    let after;
    if (node == this.dom) {
      after = this.dom.childNodes[offset];
    } else {
      let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
      for (; ; ) {
        let parent = node.parentNode;
        if (parent == this.dom)
          break;
        if (bias == 0 && parent.firstChild != parent.lastChild) {
          if (node == parent.firstChild)
            bias = -1;
          else
            bias = 1;
        }
        node = parent;
      }
      if (bias < 0)
        after = node;
      else
        after = node.nextSibling;
    }
    if (after == this.dom.firstChild)
      return 0;
    while (after && !ContentView.get(after))
      after = after.nextSibling;
    if (!after)
      return this.length;
    for (let i = 0, pos = 0; ; i++) {
      let child = this.children[i];
      if (child.dom == after)
        return pos;
      pos += child.length + child.breakAfter;
    }
  }
  domBoundsAround(from, to, offset = 0) {
    let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
    for (let i = 0, pos = offset, prevEnd = offset; i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (pos < from && end > to)
        return child.domBoundsAround(from, to, pos);
      if (end >= from && fromI == -1) {
        fromI = i;
        fromStart = pos;
      }
      if (pos > to && child.dom.parentNode == this.dom) {
        toI = i;
        toEnd = prevEnd;
        break;
      }
      prevEnd = end;
      pos = end + child.breakAfter;
    }
    return {from: fromStart, to: toEnd < 0 ? offset + this.length : toEnd, startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild, endDOM: toI < this.children.length && toI >= 0 ? this.children[toI].dom : null};
  }
  markDirty(andParent = false) {
    if (this.dirty & 2)
      return;
    this.dirty |= 2;
    this.markParentsDirty(andParent);
  }
  markParentsDirty(childList) {
    for (let parent = this.parent; parent; parent = parent.parent) {
      if (childList)
        parent.dirty |= 2;
      if (parent.dirty & 1)
        return;
      parent.dirty |= 1;
      childList = false;
    }
  }
  setParent(parent) {
    if (this.parent != parent) {
      this.parent = parent;
      if (this.dirty)
        this.markParentsDirty(true);
    }
  }
  setDOM(dom) {
    this.dom = dom;
    dom.cmView = this;
  }
  get rootView() {
    for (let v = this; ; ) {
      let parent = v.parent;
      if (!parent)
        return v;
      v = parent;
    }
  }
  replaceChildren(from, to, children = none$3) {
    this.markDirty();
    for (let i = from; i < to; i++)
      this.children[i].parent = null;
    this.children.splice(from, to - from, ...children);
    for (let i = 0; i < children.length; i++)
      children[i].setParent(this);
  }
  ignoreMutation(_rec) {
    return false;
  }
  ignoreEvent(_event) {
    return false;
  }
  childCursor(pos = this.length) {
    return new ChildCursor(this.children, pos, this.children.length);
  }
  childPos(pos, bias = 1) {
    return this.childCursor().findPos(pos, bias);
  }
  toString() {
    let name2 = this.constructor.name.replace("View", "");
    return name2 + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (name2 == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
  }
  static get(node) {
    return node.cmView;
  }
};
ContentView.prototype.breakAfter = 0;
function rm(dom) {
  let next = dom.nextSibling;
  dom.parentNode.removeChild(dom);
  return next;
}
function syncNodeInto(parent, after, dom) {
  let next = after ? after.nextSibling : parent.firstChild;
  if (dom.parentNode == parent)
    while (next != dom)
      next = rm(next);
  else
    parent.insertBefore(dom, next);
}
var ChildCursor = class {
  constructor(children, pos, i) {
    this.children = children;
    this.pos = pos;
    this.i = i;
    this.off = 0;
  }
  findPos(pos, bias = 1) {
    for (; ; ) {
      if (pos > this.pos || pos == this.pos && (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
        this.off = pos - this.pos;
        return this;
      }
      let next = this.children[--this.i];
      this.pos -= next.length + next.breakAfter;
    }
  }
};
var [nav, doc] = typeof navigator != "undefined" ? [navigator, document] : [{userAgent: "", vendor: "", platform: ""}, {documentElement: {style: {}}}];
var ie_edge = /* @__PURE__ */ /Edge\/(\d+)/.exec(nav.userAgent);
var ie_upto10 = /* @__PURE__ */ /MSIE \d/.test(nav.userAgent);
var ie_11up = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
var gecko2 = !ie2 && /* @__PURE__ */ /gecko\/(\d+)/i.test(nav.userAgent);
var chrome2 = !ie2 && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nav.userAgent);
var webkit = "webkitFontSmoothing" in doc.documentElement.style;
var safari2 = !ie2 && /* @__PURE__ */ /Apple Computer/.test(nav.vendor);
var browser = {
  mac: /* @__PURE__ */ /Mac/.test(nav.platform),
  ie: ie2,
  ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
  gecko: gecko2,
  gecko_version: gecko2 ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
  chrome: !!chrome2,
  chrome_version: chrome2 ? +chrome2[1] : 0,
  ios: safari2 && (/* @__PURE__ */ /Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2),
  android: /* @__PURE__ */ /Android\b/.test(nav.userAgent),
  webkit,
  safari: safari2,
  webkit_version: webkit ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
  tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
var none$2 = [];
var InlineView = class extends ContentView {
  become(_other) {
    return false;
  }
  getSide() {
    return 0;
  }
};
InlineView.prototype.children = none$2;
var MaxJoinLen = 256;
var TextView = class extends InlineView {
  constructor(text) {
    super();
    this.text = text;
  }
  get length() {
    return this.text.length;
  }
  createDOM(textDOM) {
    this.setDOM(textDOM || document.createTextNode(this.text));
  }
  sync(track) {
    if (!this.dom)
      this.createDOM();
    if (this.dom.nodeValue != this.text) {
      if (track && track.node == this.dom)
        track.written = true;
      this.dom.nodeValue = this.text;
    }
  }
  reuseDOM(dom) {
    if (dom.nodeType != 3)
      return false;
    this.createDOM(dom);
    return true;
  }
  merge(from, to, source) {
    if (source && (!(source instanceof TextView) || this.length - (to - from) + source.length > MaxJoinLen))
      return false;
    this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to);
    this.markDirty();
    return true;
  }
  slice(from) {
    return new TextView(this.text.slice(from));
  }
  localPosFromDOM(node, offset) {
    return node == this.dom ? offset : offset ? this.text.length : 0;
  }
  domAtPos(pos) {
    return new DOMPos(this.dom, pos);
  }
  domBoundsAround(_from, _to, offset) {
    return {from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling};
  }
  coordsAt(pos, side) {
    return textCoords(this.dom, pos, side);
  }
};
var MarkView = class extends InlineView {
  constructor(mark, children = [], length = 0) {
    super();
    this.mark = mark;
    this.children = children;
    this.length = length;
    for (let ch of children)
      ch.setParent(this);
  }
  createDOM() {
    let dom = document.createElement(this.mark.tagName);
    if (this.mark.class)
      dom.className = this.mark.class;
    if (this.mark.attrs)
      for (let name2 in this.mark.attrs)
        dom.setAttribute(name2, this.mark.attrs[name2]);
    this.setDOM(dom);
  }
  sync(track) {
    if (!this.dom)
      this.createDOM();
    super.sync(track);
  }
  merge(from, to, source, openStart, openEnd) {
    if (source && (!(source instanceof MarkView && source.mark.eq(this.mark)) || from && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    mergeInlineChildren(this, from, to, source ? source.children : none$2, openStart - 1, openEnd - 1);
    this.markDirty();
    return true;
  }
  slice(from) {
    return new MarkView(this.mark, sliceInlineChildren(this.children, from), this.length - from);
  }
  domAtPos(pos) {
    return inlineDOMAtPos(this.dom, this.children, pos);
  }
  coordsAt(pos, side) {
    return coordsInChildren(this, pos, side);
  }
};
function textCoords(text, pos, side) {
  let length = text.nodeValue.length;
  if (pos > length)
    pos = length;
  let from = pos, to = pos, flatten2 = 0;
  if (pos == 0 && side < 0 || pos == length && side >= 0) {
    if (!(browser.chrome || browser.gecko)) {
      if (pos) {
        from--;
        flatten2 = 1;
      } else {
        to++;
        flatten2 = -1;
      }
    }
  } else {
    if (side < 0)
      from--;
    else
      to++;
  }
  let rects = textRange(text, from, to).getClientRects();
  if (!rects.length)
    return Rect0;
  let rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
  if (browser.safari && !flatten2 && rect.width == 0)
    rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
  return flatten2 ? flattenRect(rect, flatten2 < 0) : rect;
}
var WidgetView = class extends InlineView {
  constructor(widget, length, side) {
    super();
    this.widget = widget;
    this.length = length;
    this.side = side;
  }
  static create(widget, length, side) {
    return new (widget.customView || WidgetView)(widget, length, side);
  }
  slice(from) {
    return WidgetView.create(this.widget, this.length - from, this.side);
  }
  sync() {
    if (!this.dom || !this.widget.updateDOM(this.dom)) {
      this.setDOM(this.widget.toDOM(this.editorView));
      this.dom.contentEditable = "false";
    }
  }
  getSide() {
    return this.side;
  }
  merge(from, to, source, openStart, openEnd) {
    if (source && (!(source instanceof WidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    this.length = from + (source ? source.length : 0) + (this.length - to);
    return true;
  }
  become(other) {
    if (other.length == this.length && other instanceof WidgetView && other.side == this.side) {
      if (this.widget.constructor == other.widget.constructor) {
        if (!this.widget.eq(other.widget))
          this.markDirty(true);
        this.widget = other.widget;
        return true;
      }
    }
    return false;
  }
  ignoreMutation() {
    return true;
  }
  ignoreEvent(event) {
    return this.widget.ignoreEvent(event);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return Text.empty;
    let top2 = this;
    while (top2.parent)
      top2 = top2.parent;
    let view = top2.editorView, text = view && view.state.doc, start = this.posAtStart;
    return text ? text.slice(start, start + this.length) : Text.empty;
  }
  domAtPos(pos) {
    return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(pos, side) {
    let rects = this.dom.getClientRects(), rect = null;
    if (!rects.length)
      return Rect0;
    for (let i = pos > 0 ? rects.length - 1 : 0; ; i += pos > 0 ? -1 : 1) {
      rect = rects[i];
      if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
        break;
    }
    return pos == 0 && side > 0 || pos == this.length && side <= 0 ? rect : flattenRect(rect, pos == 0);
  }
};
var CompositionView = class extends WidgetView {
  domAtPos(pos) {
    return new DOMPos(this.widget.text, pos);
  }
  sync() {
    if (!this.dom)
      this.setDOM(this.widget.toDOM());
  }
  localPosFromDOM(node, offset) {
    return !offset ? 0 : node.nodeType == 3 ? Math.min(offset, this.length) : this.length;
  }
  ignoreMutation() {
    return false;
  }
  get overrideDOMText() {
    return null;
  }
  coordsAt(pos, side) {
    return textCoords(this.widget.text, pos, side);
  }
};
function mergeInlineChildren(parent, from, to, elts, openStart, openEnd) {
  let cur2 = parent.childCursor();
  let {i: toI, off: toOff} = cur2.findPos(to, 1);
  let {i: fromI, off: fromOff} = cur2.findPos(from, -1);
  let dLen = from - to;
  for (let view of elts)
    dLen += view.length;
  parent.length += dLen;
  let {children} = parent;
  if (fromI == toI && fromOff) {
    let start = children[fromI];
    if (elts.length == 1 && start.merge(fromOff, toOff, elts[0], openStart, openEnd))
      return;
    if (elts.length == 0) {
      start.merge(fromOff, toOff, null, openStart, openEnd);
      return;
    }
    let after = start.slice(toOff);
    if (after.merge(0, 0, elts[elts.length - 1], 0, openEnd))
      elts[elts.length - 1] = after;
    else
      elts.push(after);
    toI++;
    openEnd = toOff = 0;
  }
  if (toOff) {
    let end = children[toI];
    if (elts.length && end.merge(0, toOff, elts[elts.length - 1], 0, openEnd)) {
      elts.pop();
      openEnd = elts.length ? 0 : openStart;
    } else {
      end.merge(0, toOff, null, 0, 0);
    }
  } else if (toI < children.length && elts.length && children[toI].merge(0, 0, elts[elts.length - 1], 0, openEnd)) {
    elts.pop();
    openEnd = elts.length ? 0 : openStart;
  }
  if (fromOff) {
    let start = children[fromI];
    if (elts.length && start.merge(fromOff, start.length, elts[0], openStart, 0)) {
      elts.shift();
      openStart = elts.length ? 0 : openEnd;
    } else {
      start.merge(fromOff, start.length, null, 0, 0);
    }
    fromI++;
  } else if (fromI && elts.length) {
    let end = children[fromI - 1];
    if (end.merge(end.length, end.length, elts[0], openStart, 0)) {
      elts.shift();
      openStart = elts.length ? 0 : openEnd;
    }
  }
  while (fromI < toI && elts.length && children[toI - 1].become(elts[elts.length - 1])) {
    elts.pop();
    toI--;
    openEnd = elts.length ? 0 : openStart;
  }
  while (fromI < toI && elts.length && children[fromI].become(elts[0])) {
    elts.shift();
    fromI++;
    openStart = elts.length ? 0 : openEnd;
  }
  if (!elts.length && fromI && toI < children.length && openStart && openEnd && children[toI].merge(0, 0, children[fromI - 1], openStart, openEnd))
    fromI--;
  if (elts.length || fromI != toI)
    parent.replaceChildren(fromI, toI, elts);
}
function sliceInlineChildren(children, from) {
  let result = [], off = 0;
  for (let elt2 of children) {
    let end = off + elt2.length;
    if (end > from)
      result.push(off < from ? elt2.slice(from - off) : elt2);
    off = end;
  }
  return result;
}
function inlineDOMAtPos(dom, children, pos) {
  let i = 0;
  for (let off = 0; i < children.length; i++) {
    let child = children[i], end = off + child.length;
    if (end == off && child.getSide() <= 0)
      continue;
    if (pos > off && pos < end && child.dom.parentNode == dom)
      return child.domAtPos(pos - off);
    if (pos <= off)
      break;
    off = end;
  }
  for (; i > 0; i--) {
    let before = children[i - 1].dom;
    if (before.parentNode == dom)
      return DOMPos.after(before);
  }
  return new DOMPos(dom, 0);
}
function joinInlineInto(parent, view, open) {
  let last, {children} = parent;
  if (open > 0 && view instanceof MarkView && children.length && (last = children[children.length - 1]) instanceof MarkView && last.mark.eq(view.mark)) {
    joinInlineInto(last, view.children[0], open - 1);
  } else {
    children.push(view);
    view.setParent(parent);
  }
  parent.length += view.length;
}
function coordsInChildren(view, pos, side) {
  for (let off = 0, i = 0; i < view.children.length; i++) {
    let child = view.children[i], end = off + child.length;
    if (end == off && child.getSide() <= 0)
      continue;
    if (side <= 0 || end == view.length ? end >= pos : end > pos)
      return child.coordsAt(pos - off, side);
    off = end;
  }
  let last = view.dom.lastChild;
  if (!last)
    return view.dom.getBoundingClientRect();
  let rects = clientRectsFor(last);
  return rects[rects.length - 1];
}
function combineAttrs(source, target) {
  for (let name2 in source) {
    if (name2 == "class" && target.class)
      target.class += " " + source.class;
    else if (name2 == "style" && target.style)
      target.style += ";" + source.style;
    else
      target[name2] = source[name2];
  }
  return target;
}
function attrsEq(a, b) {
  if (a == b)
    return true;
  if (!a || !b)
    return false;
  let keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length != keysB.length)
    return false;
  for (let key of keysA) {
    if (keysB.indexOf(key) == -1 || a[key] !== b[key])
      return false;
  }
  return true;
}
function updateAttrs(dom, prev, attrs) {
  if (prev) {
    for (let name2 in prev)
      if (!(attrs && name2 in attrs))
        dom.removeAttribute(name2);
  }
  if (attrs) {
    for (let name2 in attrs)
      if (!(prev && prev[name2] == attrs[name2]))
        dom.setAttribute(name2, attrs[name2]);
  }
}
var WidgetType = class {
  eq(_widget) {
    return false;
  }
  updateDOM(_dom) {
    return false;
  }
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  get estimatedHeight() {
    return -1;
  }
  ignoreEvent(_event) {
    return true;
  }
  get customView() {
    return null;
  }
};
var BlockType = /* @__PURE__ */ function(BlockType2) {
  BlockType2[BlockType2["Text"] = 0] = "Text";
  BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
  BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
  BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
  return BlockType2;
}(BlockType || (BlockType = {}));
var Decoration = class extends RangeValue {
  constructor(startSide, endSide, widget, spec) {
    super();
    this.startSide = startSide;
    this.endSide = endSide;
    this.widget = widget;
    this.spec = spec;
  }
  get heightRelevant() {
    return false;
  }
  static mark(spec) {
    return new MarkDecoration(spec);
  }
  static widget(spec) {
    let side = spec.side || 0;
    if (spec.block)
      side += (2e8 + 1) * (side > 0 ? 1 : -1);
    return new PointDecoration(spec, side, side, !!spec.block, spec.widget || null, false);
  }
  static replace(spec) {
    let block = !!spec.block;
    let {start, end} = getInclusive(spec);
    let startSide = block ? -2e8 * (start ? 2 : 1) : 1e8 * (start ? -1 : 1);
    let endSide = block ? 2e8 * (end ? 2 : 1) : 1e8 * (end ? 1 : -1);
    return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
  }
  static line(spec) {
    return new LineDecoration(spec);
  }
  static set(of, sort = false) {
    return RangeSet.of(of, sort);
  }
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : false;
  }
};
Decoration.none = RangeSet.empty;
var MarkDecoration = class extends Decoration {
  constructor(spec) {
    let {start, end} = getInclusive(spec);
    super(1e8 * (start ? -1 : 1), 1e8 * (end ? 1 : -1), null, spec);
    this.tagName = spec.tagName || "span";
    this.class = spec.class || "";
    this.attrs = spec.attributes || null;
  }
  eq(other) {
    return this == other || other instanceof MarkDecoration && this.tagName == other.tagName && this.class == other.class && attrsEq(this.attrs, other.attrs);
  }
  range(from, to = from) {
    if (from >= to)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(from, to);
  }
};
MarkDecoration.prototype.point = false;
var LineDecoration = class extends Decoration {
  constructor(spec) {
    super(-1e8, -1e8, null, spec);
  }
  eq(other) {
    return other instanceof LineDecoration && attrsEq(this.spec.attributes, other.spec.attributes);
  }
  range(from, to = from) {
    if (to != from)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(from, to);
  }
};
LineDecoration.prototype.mapMode = MapMode.TrackBefore;
LineDecoration.prototype.point = true;
var PointDecoration = class extends Decoration {
  constructor(spec, startSide, endSide, block, widget, isReplace) {
    super(startSide, endSide, widget, spec);
    this.block = block;
    this.isReplace = isReplace;
    this.mapMode = !block ? MapMode.TrackDel : startSide < 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
  }
  get type() {
    return this.startSide < this.endSide ? BlockType.WidgetRange : this.startSide < 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && this.widget.estimatedHeight >= 5;
  }
  eq(other) {
    return other instanceof PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
  }
  range(from, to = from) {
    if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide < 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && to != from)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(from, to);
  }
};
PointDecoration.prototype.point = true;
function getInclusive(spec) {
  let {inclusiveStart: start, inclusiveEnd: end} = spec;
  if (start == null)
    start = spec.inclusive;
  if (end == null)
    end = spec.inclusive;
  return {start: start || false, end: end || false};
}
function widgetsEq(a, b) {
  return a == b || !!(a && b && a.compare(b));
}
function addRange(from, to, ranges, margin = 0) {
  let last = ranges.length - 1;
  if (last >= 0 && ranges[last] + margin > from)
    ranges[last] = Math.max(ranges[last], to);
  else
    ranges.push(from, to);
}
var LineView = class extends ContentView {
  constructor() {
    super(...arguments);
    this.children = [];
    this.length = 0;
    this.prevAttrs = void 0;
    this.attrs = null;
    this.breakAfter = 0;
  }
  merge(from, to, source, takeDeco, openStart, openEnd) {
    if (source) {
      if (!(source instanceof LineView))
        return false;
      if (!this.dom)
        source.transferDOM(this);
    }
    if (takeDeco)
      this.setDeco(source ? source.attrs : null);
    mergeInlineChildren(this, from, to, source ? source.children : none$1, openStart, openEnd);
    return true;
  }
  split(at) {
    let end = new LineView();
    end.breakAfter = this.breakAfter;
    if (this.length == 0)
      return end;
    let {i, off} = this.childPos(at);
    if (off) {
      end.append(this.children[i].slice(off), 0);
      this.children[i].merge(off, this.children[i].length, null, 0, 0);
      i++;
    }
    for (let j = i; j < this.children.length; j++)
      end.append(this.children[j], 0);
    while (i > 0 && this.children[i - 1].length == 0) {
      this.children[i - 1].parent = null;
      i--;
    }
    this.children.length = i;
    this.markDirty();
    this.length = at;
    return end;
  }
  transferDOM(other) {
    if (!this.dom)
      return;
    other.setDOM(this.dom);
    other.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs;
    this.prevAttrs = void 0;
    this.dom = null;
  }
  setDeco(attrs) {
    if (!attrsEq(this.attrs, attrs)) {
      if (this.dom) {
        this.prevAttrs = this.attrs;
        this.markDirty();
      }
      this.attrs = attrs;
    }
  }
  append(child, openStart) {
    joinInlineInto(this, child, openStart);
  }
  addLineDeco(deco) {
    let attrs = deco.spec.attributes;
    if (attrs)
      this.attrs = combineAttrs(attrs, this.attrs || {});
  }
  domAtPos(pos) {
    return inlineDOMAtPos(this.dom, this.children, pos);
  }
  sync(track) {
    if (!this.dom) {
      this.setDOM(document.createElement("div"));
      this.dom.className = "cm-line";
      this.prevAttrs = this.attrs ? null : void 0;
    }
    if (this.prevAttrs !== void 0) {
      updateAttrs(this.dom, this.prevAttrs, this.attrs);
      this.dom.classList.add("cm-line");
      this.prevAttrs = void 0;
    }
    super.sync(track);
    let last = this.dom.lastChild;
    if (!last || last.nodeName != "BR" && ContentView.get(last) instanceof WidgetView) {
      let hack = document.createElement("BR");
      hack.cmIgnore = true;
      this.dom.appendChild(hack);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let totalWidth = 0;
    for (let child of this.children) {
      if (!(child instanceof TextView))
        return null;
      let rects = clientRectsFor(child.dom);
      if (rects.length != 1)
        return null;
      totalWidth += rects[0].width;
    }
    return {lineHeight: this.dom.getBoundingClientRect().height, charWidth: totalWidth / this.length};
  }
  coordsAt(pos, side) {
    return coordsInChildren(this, pos, side);
  }
  match(_other) {
    return false;
  }
  get type() {
    return BlockType.Text;
  }
  static find(docView, pos) {
    for (let i = 0, off = 0; ; i++) {
      let block = docView.children[i], end = off + block.length;
      if (end >= pos) {
        if (block instanceof LineView)
          return block;
        if (block.length)
          return null;
      }
      off = end + block.breakAfter;
    }
  }
};
var none$1 = [];
var BlockWidgetView = class extends ContentView {
  constructor(widget, length, type) {
    super();
    this.widget = widget;
    this.length = length;
    this.type = type;
    this.breakAfter = 0;
  }
  merge(from, to, source, _takeDeco, openStart, openEnd) {
    if (source && (!(source instanceof BlockWidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    this.length = from + (source ? source.length : 0) + (this.length - to);
    return true;
  }
  domAtPos(pos) {
    return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
  }
  split(at) {
    let len = this.length - at;
    this.length = at;
    return new BlockWidgetView(this.widget, len, this.type);
  }
  get children() {
    return none$1;
  }
  sync() {
    if (!this.dom || !this.widget.updateDOM(this.dom)) {
      this.setDOM(this.widget.toDOM(this.editorView));
      this.dom.contentEditable = "false";
    }
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
  }
  domBoundsAround() {
    return null;
  }
  match(other) {
    if (other instanceof BlockWidgetView && other.type == this.type && other.widget.constructor == this.widget.constructor) {
      if (!other.widget.eq(this.widget))
        this.markDirty(true);
      this.widget = other.widget;
      this.length = other.length;
      this.breakAfter = other.breakAfter;
      return true;
    }
    return false;
  }
  ignoreMutation() {
    return true;
  }
  ignoreEvent(event) {
    return this.widget.ignoreEvent(event);
  }
};
var ContentBuilder = class {
  constructor(doc2, pos, end) {
    this.doc = doc2;
    this.pos = pos;
    this.end = end;
    this.content = [];
    this.curLine = null;
    this.breakAtStart = 0;
    this.openStart = -1;
    this.openEnd = -1;
    this.text = "";
    this.textOff = 0;
    this.cursor = doc2.iter();
    this.skip = pos;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let last = this.content[this.content.length - 1];
    return !last.breakAfter && !(last instanceof BlockWidgetView && last.type == BlockType.WidgetBefore);
  }
  getLine() {
    if (!this.curLine)
      this.content.push(this.curLine = new LineView());
    return this.curLine;
  }
  addWidget(view) {
    this.curLine = null;
    this.content.push(view);
  }
  finish() {
    if (!this.posCovered())
      this.getLine();
  }
  wrapMarks(view, active) {
    for (let i = active.length - 1; i >= 0; i--)
      view = new MarkView(active[i], [view], view.length);
    return view;
  }
  buildText(length, active, openStart) {
    while (length > 0) {
      if (this.textOff == this.text.length) {
        let {value, lineBreak, done} = this.cursor.next(this.skip);
        this.skip = 0;
        if (done)
          throw new Error("Ran out of text content when drawing inline views");
        if (lineBreak) {
          if (!this.posCovered())
            this.getLine();
          if (this.content.length)
            this.content[this.content.length - 1].breakAfter = 1;
          else
            this.breakAtStart = 1;
          this.curLine = null;
          length--;
          continue;
        } else {
          this.text = value;
          this.textOff = 0;
        }
      }
      let take = Math.min(this.text.length - this.textOff, length, 512);
      this.getLine().append(this.wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
      this.textOff += take;
      length -= take;
      openStart = 0;
    }
  }
  span(from, to, active, openStart) {
    this.buildText(to - from, active, openStart);
    this.pos = to;
    if (this.openStart < 0)
      this.openStart = openStart;
  }
  point(from, to, deco, active, openStart) {
    let len = to - from;
    if (deco instanceof PointDecoration) {
      if (deco.block) {
        let {type} = deco;
        if (type == BlockType.WidgetAfter && !this.posCovered())
          this.getLine();
        this.addWidget(new BlockWidgetView(deco.widget || new NullWidget("div"), len, type));
      } else {
        let widget = this.wrapMarks(WidgetView.create(deco.widget || new NullWidget("span"), len, deco.startSide), active);
        this.getLine().append(widget, openStart);
      }
    } else if (this.doc.lineAt(this.pos).from == this.pos) {
      this.getLine().addLineDeco(deco);
    }
    if (len) {
      if (this.textOff + len <= this.text.length) {
        this.textOff += len;
      } else {
        this.skip += len - (this.text.length - this.textOff);
        this.text = "";
        this.textOff = 0;
      }
      this.pos = to;
    }
    if (this.openStart < 0)
      this.openStart = openStart;
  }
  static build(text, from, to, decorations2) {
    let builder = new ContentBuilder(text, from, to);
    builder.openEnd = RangeSet.spans(decorations2, from, to, builder);
    if (builder.openStart < 0)
      builder.openStart = builder.openEnd;
    builder.finish();
    return builder;
  }
};
var NullWidget = class extends WidgetType {
  constructor(tag) {
    super();
    this.tag = tag;
  }
  eq(other) {
    return other.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(elt2) {
    return elt2.nodeName.toLowerCase() == this.tag;
  }
};
var none2 = [];
var clickAddsSelectionRange = /* @__PURE__ */ Facet.define();
var dragMovesSelection$1 = /* @__PURE__ */ Facet.define();
var mouseSelectionStyle = /* @__PURE__ */ Facet.define();
var exceptionSink = /* @__PURE__ */ Facet.define();
var updateListener = /* @__PURE__ */ Facet.define();
var inputHandler = /* @__PURE__ */ Facet.define();
function logException(state, exception, context) {
  let handler = state.facet(exceptionSink);
  if (handler.length)
    handler[0](exception);
  else if (window.onerror)
    window.onerror(String(exception), context, void 0, void 0, exception);
  else if (context)
    console.error(context + ":", exception);
  else
    console.error(exception);
}
var editable = /* @__PURE__ */ Facet.define({combine: (values2) => values2.length ? values2[0] : true});
var PluginFieldProvider = class {
  constructor(field, get) {
    this.field = field;
    this.get = get;
  }
};
var PluginField = class {
  from(get) {
    return new PluginFieldProvider(this, get);
  }
  static define() {
    return new PluginField();
  }
};
PluginField.decorations = /* @__PURE__ */ PluginField.define();
PluginField.scrollMargins = /* @__PURE__ */ PluginField.define();
var nextPluginID = 0;
var viewPlugin = /* @__PURE__ */ Facet.define();
var ViewPlugin = class {
  constructor(id2, create, fields) {
    this.id = id2;
    this.create = create;
    this.fields = fields;
    this.extension = viewPlugin.of(this);
  }
  static define(create, spec) {
    let {eventHandlers, provide, decorations: decorations2} = spec || {};
    let fields = [];
    if (provide)
      for (let provider of Array.isArray(provide) ? provide : [provide])
        fields.push(provider);
    if (eventHandlers)
      fields.push(domEventHandlers.from((value) => ({plugin: value, handlers: eventHandlers})));
    if (decorations2)
      fields.push(PluginField.decorations.from(decorations2));
    return new ViewPlugin(nextPluginID++, create, fields);
  }
  static fromClass(cls, spec) {
    return ViewPlugin.define((view) => new cls(view), spec);
  }
};
var domEventHandlers = /* @__PURE__ */ PluginField.define();
var PluginInstance = class {
  constructor(spec) {
    this.spec = spec;
    this.mustUpdate = null;
    this.value = null;
  }
  takeField(type, target) {
    for (let {field, get} of this.spec.fields)
      if (field == type)
        target.push(get(this.value));
  }
  update(view) {
    if (!this.value) {
      try {
        this.value = this.spec.create(view);
      } catch (e) {
        logException(view.state, e, "CodeMirror plugin crashed");
        return PluginInstance.dummy;
      }
    } else if (this.mustUpdate) {
      let update = this.mustUpdate;
      this.mustUpdate = null;
      if (!this.value.update)
        return this;
      try {
        this.value.update(update);
      } catch (e) {
        logException(update.state, e, "CodeMirror plugin crashed");
        if (this.value.destroy)
          try {
            this.value.destroy();
          } catch (_) {
          }
        return PluginInstance.dummy;
      }
    }
    return this;
  }
  destroy(view) {
    var _a;
    if ((_a = this.value) === null || _a === void 0 ? void 0 : _a.destroy) {
      try {
        this.value.destroy();
      } catch (e) {
        logException(view.state, e, "CodeMirror plugin crashed");
      }
    }
  }
};
PluginInstance.dummy = /* @__PURE__ */ new PluginInstance(/* @__PURE__ */ ViewPlugin.define(() => ({})));
var editorAttributes = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.reduce((a, b) => combineAttrs(b, a), {})
});
var contentAttributes = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.reduce((a, b) => combineAttrs(b, a), {})
});
var decorations = /* @__PURE__ */ Facet.define();
var styleModule = /* @__PURE__ */ Facet.define();
var ChangedRange = class {
  constructor(fromA, toA, fromB, toB) {
    this.fromA = fromA;
    this.toA = toA;
    this.fromB = fromB;
    this.toB = toB;
  }
  join(other) {
    return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
  }
  addToSet(set) {
    let i = set.length, me = this;
    for (; i > 0; i--) {
      let range = set[i - 1];
      if (range.fromA > me.toA)
        continue;
      if (range.toA < me.fromA)
        break;
      me = me.join(range);
      set.splice(i - 1, 1);
    }
    set.splice(i, 0, me);
    return set;
  }
  static extendWithRanges(diff, ranges) {
    if (ranges.length == 0)
      return diff;
    let result = [];
    for (let dI = 0, rI = 0, posA = 0, posB = 0; ; dI++) {
      let next = dI == diff.length ? null : diff[dI], off = posA - posB;
      let end = next ? next.fromB : 1e9;
      while (rI < ranges.length && ranges[rI] < end) {
        let from = ranges[rI], to = ranges[rI + 1];
        let fromB = Math.max(posB, from), toB = Math.min(end, to);
        if (fromB <= toB)
          new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
        if (to > end)
          break;
        else
          rI += 2;
      }
      if (!next)
        return result;
      new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
      posA = next.toA;
      posB = next.toB;
    }
  }
};
var ViewUpdate = class {
  constructor(view, state, transactions = none2) {
    this.view = view;
    this.state = state;
    this.transactions = transactions;
    this.flags = 0;
    this.startState = view.state;
    this.changes = ChangeSet.empty(this.startState.doc.length);
    for (let tr of transactions)
      this.changes = this.changes.compose(tr.changes);
    let changedRanges = [];
    this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
    this.changedRanges = changedRanges;
    let focus = view.hasFocus;
    if (focus != view.inputState.notifiedFocused) {
      view.inputState.notifiedFocused = focus;
      this.flags |= 1;
    }
    if (this.docChanged)
      this.flags |= 2;
  }
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  get geometryChanged() {
    return this.docChanged || (this.flags & (16 | 2)) > 0;
  }
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  get docChanged() {
    return this.transactions.some((tr) => tr.docChanged);
  }
  get selectionSet() {
    return this.transactions.some((tr) => tr.selection);
  }
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
};
var DocView = class extends ContentView {
  constructor(view) {
    super();
    this.view = view;
    this.compositionDeco = Decoration.none;
    this.decorations = [];
    this.minWidth = 0;
    this.minWidthFrom = 0;
    this.minWidthTo = 0;
    this.impreciseAnchor = null;
    this.impreciseHead = null;
    this.setDOM(view.contentDOM);
    this.children = [new LineView()];
    this.children[0].setParent(this);
    this.updateInner([new ChangedRange(0, 0, 0, view.state.doc.length)], this.updateDeco(), 0);
  }
  get root() {
    return this.view.root;
  }
  get editorView() {
    return this.view;
  }
  get length() {
    return this.view.state.doc.length;
  }
  update(update) {
    let changedRanges = update.changedRanges;
    if (this.minWidth > 0 && changedRanges.length) {
      if (!changedRanges.every(({fromA, toA}) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
        this.minWidth = 0;
      } else {
        this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
        this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
      }
    }
    if (this.view.inputState.composing < 0)
      this.compositionDeco = Decoration.none;
    else if (update.transactions.length)
      this.compositionDeco = computeCompositionDeco(this.view, update.changes);
    let forceSelection = (browser.ie || browser.chrome) && !this.compositionDeco.size && update && update.state.doc.lines != update.startState.doc.lines;
    let prevDeco = this.decorations, deco = this.updateDeco();
    let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
    changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
    let pointerSel = update.transactions.some((tr) => tr.annotation(Transaction.userEvent) == "pointerselection");
    if (this.dirty == 0 && changedRanges.length == 0 && !(update.flags & (4 | 8)) && update.state.selection.main.from >= this.view.viewport.from && update.state.selection.main.to <= this.view.viewport.to) {
      this.updateSelection(forceSelection, pointerSel);
      return false;
    } else {
      this.updateInner(changedRanges, deco, update.startState.doc.length, forceSelection, pointerSel);
      return true;
    }
  }
  updateInner(changes, deco, oldLength, forceSelection = false, pointerSel = false) {
    this.updateChildren(changes, deco, oldLength);
    this.view.observer.ignore(() => {
      this.dom.style.height = this.view.viewState.domHeight + "px";
      this.dom.style.minWidth = this.minWidth ? this.minWidth + "px" : "";
      let track = browser.chrome ? {node: getSelection(this.view.root).focusNode, written: false} : void 0;
      this.sync(track);
      this.dirty = 0;
      if (track === null || track === void 0 ? void 0 : track.written)
        forceSelection = true;
      this.updateSelection(forceSelection, pointerSel);
      this.dom.style.height = "";
    });
  }
  updateChildren(changes, deco, oldLength) {
    let cursor = this.childCursor(oldLength);
    for (let i = changes.length - 1; ; i--) {
      let next = i >= 0 ? changes[i] : null;
      if (!next)
        break;
      let {fromA, toA, fromB, toB} = next;
      let {content: content2, breakAtStart, openStart, openEnd} = ContentBuilder.build(this.view.state.doc, fromB, toB, deco);
      let {i: toI, off: toOff} = cursor.findPos(toA, 1);
      let {i: fromI, off: fromOff} = cursor.findPos(fromA, -1);
      this.replaceRange(fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd);
    }
  }
  replaceRange(fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd) {
    let before = this.children[fromI], last = content2.length ? content2[content2.length - 1] : null;
    let breakAtEnd = last ? last.breakAfter : breakAtStart;
    if (fromI == toI && !breakAtStart && !breakAtEnd && content2.length < 2 && before.merge(fromOff, toOff, content2.length ? last : null, fromOff == 0, openStart, openEnd))
      return;
    let after = this.children[toI];
    if (toOff < after.length || after.children.length && after.children[after.children.length - 1].length == 0) {
      if (fromI == toI) {
        after = after.split(toOff);
        toOff = 0;
      }
      if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
        content2[content2.length - 1] = after;
      } else {
        if (toOff || after.children.length && after.children[0].length == 0)
          after.merge(0, toOff, null, false, 0, openEnd);
        content2.push(after);
      }
    } else if (after.breakAfter) {
      if (last)
        last.breakAfter = 1;
      else
        breakAtStart = 1;
    }
    toI++;
    before.breakAfter = breakAtStart;
    if (fromOff > 0) {
      if (!breakAtStart && content2.length && before.merge(fromOff, before.length, content2[0], false, openStart, 0)) {
        before.breakAfter = content2.shift().breakAfter;
      } else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
        before.merge(fromOff, before.length, null, false, openStart, 0);
      }
      fromI++;
    }
    while (fromI < toI && content2.length) {
      if (this.children[toI - 1].match(content2[content2.length - 1]))
        toI--, content2.pop();
      else if (this.children[fromI].match(content2[0]))
        fromI++, content2.shift();
      else
        break;
    }
    if (fromI < toI || content2.length)
      this.replaceChildren(fromI, toI, content2);
  }
  updateSelection(force = false, fromPointer = false) {
    if (!(fromPointer || this.mayControlSelection()))
      return;
    let main = this.view.state.selection.main;
    let anchor = this.domAtPos(main.anchor);
    let head = main.empty ? anchor : this.domAtPos(main.head);
    if (browser.gecko && main.empty && betweenUneditable(anchor)) {
      let dummy = document.createTextNode("");
      this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
      anchor = head = new DOMPos(dummy, 0);
      force = true;
    }
    let domSel = this.view.observer.selectionRange;
    if (force || !domSel.focusNode || browser.gecko && main.empty && nextToUneditable(domSel.focusNode, domSel.focusOffset) || !isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) {
      this.view.observer.ignore(() => {
        let rawSel = getSelection(this.root);
        if (main.empty) {
          if (browser.gecko) {
            let nextTo = nextToUneditable(anchor.node, anchor.offset);
            if (nextTo && nextTo != (1 | 2)) {
              let text = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 ? 1 : -1);
              if (text)
                anchor = new DOMPos(text, nextTo == 1 ? 0 : text.nodeValue.length);
            }
          }
          rawSel.collapse(anchor.node, anchor.offset);
          if (main.bidiLevel != null && domSel.cursorBidiLevel != null)
            domSel.cursorBidiLevel = main.bidiLevel;
        } else if (rawSel.extend) {
          rawSel.collapse(anchor.node, anchor.offset);
          rawSel.extend(head.node, head.offset);
        } else {
          let range = document.createRange();
          if (main.anchor > main.head)
            [anchor, head] = [head, anchor];
          range.setEnd(head.node, head.offset);
          range.setStart(anchor.node, anchor.offset);
          rawSel.removeAllRanges();
          rawSel.addRange(range);
        }
      });
    }
    this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
    this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
  }
  enforceCursorAssoc() {
    let cursor = this.view.state.selection.main;
    let sel = getSelection(this.root);
    if (!cursor.empty || !cursor.assoc || !sel.modify)
      return;
    let line = LineView.find(this, cursor.head);
    if (!line)
      return;
    let lineStart = line.posAtStart;
    if (cursor.head == lineStart || cursor.head == lineStart + line.length)
      return;
    let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
    if (!before || !after || before.bottom > after.top)
      return;
    let dom = this.domAtPos(cursor.head + cursor.assoc);
    sel.collapse(dom.node, dom.offset);
    sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
  }
  mayControlSelection() {
    return this.view.state.facet(editable) ? this.root.activeElement == this.dom : hasSelection(this.dom, this.view.observer.selectionRange);
  }
  nearest(dom) {
    for (let cur2 = dom; cur2; ) {
      let domView = ContentView.get(cur2);
      if (domView && domView.rootView == this)
        return domView;
      cur2 = cur2.parentNode;
    }
    return null;
  }
  posFromDOM(node, offset) {
    let view = this.nearest(node);
    if (!view)
      throw new RangeError("Trying to find position for a DOM position outside of the document");
    return view.localPosFromDOM(node, offset) + view.posAtStart;
  }
  domAtPos(pos) {
    let {i, off} = this.childCursor().findPos(pos, -1);
    for (; i < this.children.length - 1; ) {
      let child = this.children[i];
      if (off < child.length || child instanceof LineView)
        break;
      i++;
      off = 0;
    }
    return this.children[i].domAtPos(off);
  }
  coordsAt(pos, side) {
    for (let off = this.length, i = this.children.length - 1; ; i--) {
      let child = this.children[i], start = off - child.breakAfter - child.length;
      if (pos > start || pos == start && (child.type == BlockType.Text || !i || this.children[i - 1].breakAfter))
        return child.coordsAt(pos - start, side);
      off = start;
    }
  }
  measureVisibleLineHeights() {
    let result = [], {from, to} = this.view.viewState.viewport;
    let minWidth = Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
    for (let pos = 0, i = 0; i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (end > to)
        break;
      if (pos >= from) {
        result.push(child.dom.getBoundingClientRect().height);
        let width = child.dom.scrollWidth;
        if (width > minWidth) {
          this.minWidth = minWidth = width;
          this.minWidthFrom = pos;
          this.minWidthTo = end;
        }
      }
      pos = end + child.breakAfter;
    }
    return result;
  }
  measureTextSize() {
    for (let child of this.children) {
      if (child instanceof LineView) {
        let measure = child.measureTextSize();
        if (measure)
          return measure;
      }
    }
    let dummy = document.createElement("div"), lineHeight, charWidth;
    dummy.className = "cm-line";
    dummy.textContent = "abc def ghi jkl mno pqr stu";
    this.view.observer.ignore(() => {
      this.dom.appendChild(dummy);
      let rect = clientRectsFor(dummy.firstChild)[0];
      lineHeight = dummy.getBoundingClientRect().height;
      charWidth = rect ? rect.width / 27 : 7;
      dummy.remove();
    });
    return {lineHeight, charWidth};
  }
  childCursor(pos = this.length) {
    let i = this.children.length;
    if (i)
      pos -= this.children[--i].length;
    return new ChildCursor(this.children, pos, i);
  }
  computeBlockGapDeco() {
    let deco = [], vs = this.view.viewState;
    for (let pos = 0, i = 0; ; i++) {
      let next = i == vs.viewports.length ? null : vs.viewports[i];
      let end = next ? next.from - 1 : this.length;
      if (end > pos) {
        let height = vs.lineAt(end, 0).bottom - vs.lineAt(pos, 0).top;
        deco.push(Decoration.replace({widget: new BlockGapWidget(height), block: true, inclusive: true}).range(pos, end));
      }
      if (!next)
        break;
      pos = next.to + 1;
    }
    return Decoration.set(deco);
  }
  updateDeco() {
    return this.decorations = [
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco,
      this.compositionDeco,
      ...this.view.state.facet(decorations),
      ...this.view.pluginField(PluginField.decorations)
    ];
  }
  scrollPosIntoView(pos, side) {
    let rect = this.coordsAt(pos, side);
    if (!rect)
      return;
    let mLeft = 0, mRight = 0, mTop = 0, mBottom = 0;
    for (let margins of this.view.pluginField(PluginField.scrollMargins))
      if (margins) {
        let {left, right, top: top2, bottom} = margins;
        if (left != null)
          mLeft = Math.max(mLeft, left);
        if (right != null)
          mRight = Math.max(mRight, right);
        if (top2 != null)
          mTop = Math.max(mTop, top2);
        if (bottom != null)
          mBottom = Math.max(mBottom, bottom);
      }
    scrollRectIntoView(this.dom, {
      left: rect.left - mLeft,
      top: rect.top - mTop,
      right: rect.right + mRight,
      bottom: rect.bottom + mBottom
    });
  }
};
function betweenUneditable(pos) {
  return pos.node.nodeType == 1 && pos.node.firstChild && (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") && (pos.offset < pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
}
var BlockGapWidget = class extends WidgetType {
  constructor(height) {
    super();
    this.height = height;
  }
  toDOM() {
    let elt2 = document.createElement("div");
    this.updateDOM(elt2);
    return elt2;
  }
  eq(other) {
    return other.height == this.height;
  }
  updateDOM(elt2) {
    elt2.style.height = this.height + "px";
    return true;
  }
  get estimatedHeight() {
    return this.height;
  }
};
function computeCompositionDeco(view, changes) {
  let sel = view.observer.selectionRange;
  let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
  if (!textNode)
    return Decoration.none;
  let cView = view.docView.nearest(textNode);
  let from, to, topNode = textNode;
  if (cView instanceof InlineView) {
    while (cView.parent instanceof InlineView)
      cView = cView.parent;
    from = cView.posAtStart;
    to = from + cView.length;
    topNode = cView.dom;
  } else if (cView instanceof LineView) {
    while (topNode.parentNode != cView.dom)
      topNode = topNode.parentNode;
    let prev = topNode.previousSibling;
    while (prev && !ContentView.get(prev))
      prev = prev.previousSibling;
    from = to = prev ? ContentView.get(prev).posAtEnd : cView.posAtStart;
  } else {
    return Decoration.none;
  }
  let newFrom = changes.mapPos(from, 1), newTo = Math.max(newFrom, changes.mapPos(to, -1));
  let text = textNode.nodeValue, {state} = view;
  if (newTo - newFrom < text.length) {
    if (state.sliceDoc(newFrom, Math.min(state.doc.length, newFrom + text.length)) == text)
      newTo = newFrom + text.length;
    else if (state.sliceDoc(Math.max(0, newTo - text.length), newTo) == text)
      newFrom = newTo - text.length;
    else
      return Decoration.none;
  } else if (state.sliceDoc(newFrom, newTo) != text) {
    return Decoration.none;
  }
  return Decoration.set(Decoration.replace({widget: new CompositionWidget(topNode, textNode)}).range(newFrom, newTo));
}
var CompositionWidget = class extends WidgetType {
  constructor(top2, text) {
    super();
    this.top = top2;
    this.text = text;
  }
  eq(other) {
    return this.top == other.top && this.text == other.text;
  }
  toDOM() {
    return this.top;
  }
  ignoreEvent() {
    return false;
  }
  get customView() {
    return CompositionView;
  }
};
function nearbyTextNode(node, offset, side) {
  for (; ; ) {
    if (node.nodeType == 3)
      return node;
    if (node.nodeType == 1 && offset > 0 && side <= 0) {
      node = node.childNodes[offset - 1];
      offset = maxOffset(node);
    } else if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
      node = node.childNodes[offset];
      offset = 0;
    } else {
      return null;
    }
  }
}
function nextToUneditable(node, offset) {
  if (node.nodeType != 1)
    return 0;
  return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
}
var DecorationComparator$1 = class {
  constructor() {
    this.changes = [];
  }
  compareRange(from, to) {
    addRange(from, to, this.changes);
  }
  comparePoint(from, to) {
    addRange(from, to, this.changes);
  }
};
function findChangedDeco(a, b, diff) {
  let comp = new DecorationComparator$1();
  RangeSet.compare(a, b, diff, comp);
  return comp.changes;
}
var Direction = /* @__PURE__ */ function(Direction2) {
  Direction2[Direction2["LTR"] = 0] = "LTR";
  Direction2[Direction2["RTL"] = 1] = "RTL";
  return Direction2;
}(Direction || (Direction = {}));
var LTR = Direction.LTR;
var RTL = Direction.RTL;
function dec(str) {
  let result = [];
  for (let i = 0; i < str.length; i++)
    result.push(1 << +str[i]);
  return result;
}
var LowTypes = /* @__PURE__ */ dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
var ArabicTypes = /* @__PURE__ */ dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
var Brackets = /* @__PURE__ */ Object.create(null);
var BracketStack = [];
for (let p of ["()", "[]", "{}"]) {
  let l = /* @__PURE__ */ p.charCodeAt(0), r = /* @__PURE__ */ p.charCodeAt(1);
  Brackets[l] = r;
  Brackets[r] = -l;
}
function charType(ch) {
  return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8203 ? 256 : ch == 8204 ? 256 : 1;
}
var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
var BidiSpan = class {
  constructor(from, to, level) {
    this.from = from;
    this.to = to;
    this.level = level;
  }
  get dir() {
    return this.level % 2 ? RTL : LTR;
  }
  side(end, dir) {
    return this.dir == dir == end ? this.to : this.from;
  }
  static find(order, index, level, assoc) {
    let maybe = -1;
    for (let i = 0; i < order.length; i++) {
      let span2 = order[i];
      if (span2.from <= index && span2.to >= index) {
        if (span2.level == level)
          return i;
        if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span2.from < index : span2.to > index : order[maybe].level > span2.level))
          maybe = i;
      }
    }
    if (maybe < 0)
      throw new RangeError("Index out of range");
    return maybe;
  }
};
var types = [];
function computeOrder(line, direction) {
  let len = line.length, outerType = direction == LTR ? 1 : 2, oppositeType = direction == LTR ? 2 : 1;
  if (!line || outerType == 1 && !BidiRE.test(line))
    return trivialOrder(len);
  for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
    let type = charType(line.charCodeAt(i));
    if (type == 512)
      type = prev;
    else if (type == 8 && prevStrong == 4)
      type = 16;
    types[i] = type == 4 ? 2 : type;
    if (type & 7)
      prevStrong = type;
    prev = type;
  }
  for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
    let type = types[i];
    if (type == 128) {
      if (i < len - 1 && prev == types[i + 1] && prev & 24)
        type = types[i] = prev;
      else
        types[i] = 256;
    } else if (type == 64) {
      let end = i + 1;
      while (end < len && types[end] == 64)
        end++;
      let replace = i && prev == 8 || end < len && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
      for (let j = i; j < end; j++)
        types[j] = replace;
      i = end - 1;
    } else if (type == 8 && prevStrong == 1) {
      types[i] = 1;
    }
    prev = type;
    if (type & 7)
      prevStrong = type;
  }
  for (let i = 0, sI = 0, context = 0, ch, br, type; i < len; i++) {
    if (br = Brackets[ch = line.charCodeAt(i)]) {
      if (br < 0) {
        for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
          if (BracketStack[sJ + 1] == -br) {
            let flags = BracketStack[sJ + 2];
            let type2 = flags & 2 ? outerType : !(flags & 4) ? 0 : flags & 1 ? oppositeType : outerType;
            if (type2)
              types[i] = types[BracketStack[sJ]] = type2;
            sI = sJ;
            break;
          }
        }
      } else if (BracketStack.length == 189) {
        break;
      } else {
        BracketStack[sI++] = i;
        BracketStack[sI++] = ch;
        BracketStack[sI++] = context;
      }
    } else if ((type = types[i]) == 2 || type == 1) {
      let embed = type == outerType;
      context = embed ? 0 : 1;
      for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
        let cur2 = BracketStack[sJ + 2];
        if (cur2 & 2)
          break;
        if (embed) {
          BracketStack[sJ + 2] |= 2;
        } else {
          if (cur2 & 4)
            break;
          BracketStack[sJ + 2] |= 4;
        }
      }
    }
  }
  for (let i = 0; i < len; i++) {
    if (types[i] == 256) {
      let end = i + 1;
      while (end < len && types[end] == 256)
        end++;
      let beforeL = (i ? types[i - 1] : outerType) == 1;
      let afterL = (end < len ? types[end] : outerType) == 1;
      let replace = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
      for (let j = i; j < end; j++)
        types[j] = replace;
      i = end - 1;
    }
  }
  let order = [];
  if (outerType == 1) {
    for (let i = 0; i < len; ) {
      let start = i, rtl = types[i++] != 1;
      while (i < len && rtl == (types[i] != 1))
        i++;
      if (rtl) {
        for (let j = i; j > start; ) {
          let end = j, l = types[--j] != 2;
          while (j > start && l == (types[j - 1] != 2))
            j--;
          order.push(new BidiSpan(j, end, l ? 2 : 1));
        }
      } else {
        order.push(new BidiSpan(start, i, 0));
      }
    }
  } else {
    for (let i = 0; i < len; ) {
      let start = i, rtl = types[i++] == 2;
      while (i < len && rtl == (types[i] == 2))
        i++;
      order.push(new BidiSpan(start, i, rtl ? 1 : 2));
    }
  }
  return order;
}
function trivialOrder(length) {
  return [new BidiSpan(0, length, 0)];
}
var movedOver = "";
function moveVisually(line, order, dir, start, forward) {
  var _a;
  let startIndex = start.head - line.from, spanI = -1;
  if (startIndex == 0) {
    if (!forward || !line.length)
      return null;
    if (order[0].level != dir) {
      startIndex = order[0].side(false, dir);
      spanI = 0;
    }
  } else if (startIndex == line.length) {
    if (forward)
      return null;
    let last = order[order.length - 1];
    if (last.level != dir) {
      startIndex = last.side(true, dir);
      spanI = order.length - 1;
    }
  }
  if (spanI < 0)
    spanI = BidiSpan.find(order, startIndex, (_a = start.bidiLevel) !== null && _a !== void 0 ? _a : -1, start.assoc);
  let span2 = order[spanI];
  if (startIndex == span2.side(forward, dir)) {
    span2 = order[spanI += forward ? 1 : -1];
    startIndex = span2.side(!forward, dir);
  }
  let indexForward = forward == (span2.dir == dir);
  let nextIndex = findClusterBreak(line.text, startIndex, indexForward);
  movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
  if (nextIndex != span2.side(forward, dir))
    return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span2.level);
  let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
  if (!nextSpan && span2.level != dir)
    return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
  if (nextSpan && nextSpan.level < span2.level)
    return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, forward ? 1 : -1, nextSpan.level);
  return EditorSelection.cursor(nextIndex + line.from, forward ? -1 : 1, span2.level);
}
function groupAt(state, pos, bias = 1) {
  let categorize = state.charCategorizer(pos);
  let line = state.doc.lineAt(pos), linePos = pos - line.from;
  if (line.length == 0)
    return EditorSelection.cursor(pos);
  if (linePos == 0)
    bias = 1;
  else if (linePos == line.length)
    bias = -1;
  let from = linePos, to = linePos;
  if (bias < 0)
    from = findClusterBreak(line.text, linePos, false);
  else
    to = findClusterBreak(line.text, linePos);
  let cat = categorize(line.text.slice(from, to));
  while (from > 0) {
    let prev = findClusterBreak(line.text, from, false);
    if (categorize(line.text.slice(prev, from)) != cat)
      break;
    from = prev;
  }
  while (to < line.length) {
    let next = findClusterBreak(line.text, to);
    if (categorize(line.text.slice(to, next)) != cat)
      break;
    to = next;
  }
  return EditorSelection.range(from + line.from, to + line.from);
}
function getdx(x, rect) {
  return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
}
function getdy(y, rect) {
  return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
}
function yOverlap(a, b) {
  return a.top < b.bottom - 1 && a.bottom > b.top + 1;
}
function upTop(rect, top2) {
  return top2 < rect.top ? {top: top2, left: rect.left, right: rect.right, bottom: rect.bottom} : rect;
}
function upBot(rect, bottom) {
  return bottom > rect.bottom ? {top: rect.top, left: rect.left, right: rect.right, bottom} : rect;
}
function domPosAtCoords(parent, x, y) {
  let closest, closestRect, closestX, closestY;
  let above, below, aboveRect, belowRect;
  for (let child = parent.firstChild; child; child = child.nextSibling) {
    let rects = clientRectsFor(child);
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (closestRect && yOverlap(closestRect, rect))
        rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
      let dx = getdx(x, rect), dy = getdy(y, rect);
      if (dx == 0 && dy == 0)
        return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
      if (!closest || closestY > dy || closestY == dy && closestX > dx) {
        closest = child;
        closestRect = rect;
        closestX = dx;
        closestY = dy;
      }
      if (dx == 0) {
        if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
          above = child;
          aboveRect = rect;
        } else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
          below = child;
          belowRect = rect;
        }
      } else if (aboveRect && yOverlap(aboveRect, rect)) {
        aboveRect = upBot(aboveRect, rect.bottom);
      } else if (belowRect && yOverlap(belowRect, rect)) {
        belowRect = upTop(belowRect, rect.top);
      }
    }
  }
  if (aboveRect && aboveRect.bottom >= y) {
    closest = above;
    closestRect = aboveRect;
  } else if (belowRect && belowRect.top <= y) {
    closest = below;
    closestRect = belowRect;
  }
  if (!closest)
    return {node: parent, offset: 0};
  let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
  if (closest.nodeType == 3)
    return domPosInText(closest, clipX, y);
  if (!closestX && closest.contentEditable == "true")
    return domPosAtCoords(closest, clipX, y);
  let offset = Array.prototype.indexOf.call(parent.childNodes, closest) + (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
  return {node: parent, offset};
}
function domPosInText(node, x, y) {
  let len = node.nodeValue.length;
  let closestOffset = -1, closestDY = 1e9, generalSide = 0;
  for (let i = 0; i < len; i++) {
    let rects = textRange(node, i, i + 1).getClientRects();
    for (let j = 0; j < rects.length; j++) {
      let rect = rects[j];
      if (rect.top == rect.bottom)
        continue;
      if (!generalSide)
        generalSide = x - rect.left;
      let dy = (rect.top > y ? rect.top - y : y - rect.bottom) - 1;
      if (rect.left - 1 <= x && rect.right + 1 >= x && dy < closestDY) {
        let right = x >= (rect.left + rect.right) / 2, after = right;
        if (browser.chrome || browser.gecko) {
          let rectBefore = textRange(node, i).getBoundingClientRect();
          if (rectBefore.left == rect.right)
            after = !right;
        }
        if (dy <= 0)
          return {node, offset: i + (after ? 1 : 0)};
        closestOffset = i + (after ? 1 : 0);
        closestDY = dy;
      }
    }
  }
  return {node, offset: closestOffset > -1 ? closestOffset : generalSide > 0 ? node.nodeValue.length : 0};
}
function posAtCoords(view, {x, y}, bias = -1) {
  let content2 = view.contentDOM.getBoundingClientRect(), block;
  let halfLine = view.defaultLineHeight / 2;
  for (let bounced = false; ; ) {
    block = view.blockAtHeight(y, content2.top);
    if (block.top > y || block.bottom < y) {
      bias = block.top > y ? -1 : 1;
      y = Math.min(block.bottom - halfLine, Math.max(block.top + halfLine, y));
      if (bounced)
        return -1;
      else
        bounced = true;
    }
    if (block.type == BlockType.Text)
      break;
    y = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
  }
  let lineStart = block.from;
  if (lineStart < view.viewport.from)
    return view.viewport.from == 0 ? 0 : null;
  if (lineStart > view.viewport.to)
    return view.viewport.to == view.state.doc.length ? view.state.doc.length : null;
  x = Math.max(content2.left + 1, Math.min(content2.right - 1, x));
  let root = view.root, element = root.elementFromPoint(x, y);
  let node, offset = -1;
  if (element && view.contentDOM.contains(element) && !(view.docView.nearest(element) instanceof WidgetView)) {
    if (root.caretPositionFromPoint) {
      let pos = root.caretPositionFromPoint(x, y);
      if (pos)
        ({offsetNode: node, offset} = pos);
    } else if (root.caretRangeFromPoint) {
      let range = root.caretRangeFromPoint(x, y);
      if (range) {
        ({startContainer: node, startOffset: offset} = range);
        if (browser.safari && isSuspiciousCaretResult(node, offset, x))
          node = void 0;
      }
    }
  }
  if (!node || !view.docView.dom.contains(node)) {
    let line = LineView.find(view.docView, lineStart);
    ({node, offset} = domPosAtCoords(line.dom, x, y));
  }
  return view.docView.posFromDOM(node, offset);
}
function isSuspiciousCaretResult(node, offset, x) {
  let len;
  if (node.nodeType != 3 || offset != (len = node.nodeValue.length))
    return false;
  for (let next = node.nextSibling; next; next = node.nextSibling)
    if (next.nodeType != 1 || next.nodeName != "BR")
      return false;
  return textRange(node, len - 1, len).getBoundingClientRect().left > x;
}
function moveToLineBoundary(view, start, forward, includeWrap) {
  let line = view.state.doc.lineAt(start.head);
  let coords = !includeWrap || !view.lineWrapping ? null : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
  if (coords) {
    let editorRect = view.dom.getBoundingClientRect();
    let pos = view.posAtCoords({
      x: forward == (view.textDirection == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
      y: (coords.top + coords.bottom) / 2
    });
    if (pos != null)
      return EditorSelection.cursor(pos, forward ? -1 : 1);
  }
  let lineView = LineView.find(view.docView, start.head);
  let end = lineView ? forward ? lineView.posAtEnd : lineView.posAtStart : forward ? line.to : line.from;
  return EditorSelection.cursor(end, forward ? -1 : 1);
}
function moveByChar(view, start, forward, by) {
  let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
  for (let cur2 = start, check = null; ; ) {
    let next = moveVisually(line, spans, view.textDirection, cur2, forward), char = movedOver;
    if (!next) {
      if (line.number == (forward ? view.state.doc.lines : 1))
        return cur2;
      char = "\n";
      line = view.state.doc.line(line.number + (forward ? 1 : -1));
      spans = view.bidiSpans(line);
      next = EditorSelection.cursor(forward ? line.from : line.to);
    }
    if (!check) {
      if (!by)
        return next;
      check = by(char);
    } else if (!check(char)) {
      return cur2;
    }
    cur2 = next;
  }
}
function byGroup(view, pos, start) {
  let categorize = view.state.charCategorizer(pos);
  let cat = categorize(start);
  return (next) => {
    let nextCat = categorize(next);
    if (cat == CharCategory.Space)
      cat = nextCat;
    return cat == nextCat;
  };
}
function moveVertically(view, start, forward, distance) {
  var _a;
  let startPos = start.head, dir = forward ? 1 : -1;
  if (startPos == (forward ? view.state.doc.length : 0))
    return EditorSelection.cursor(startPos);
  let startCoords = view.coordsAtPos(startPos);
  if (startCoords) {
    let rect = view.dom.getBoundingClientRect();
    let goal2 = (_a = start.goalColumn) !== null && _a !== void 0 ? _a : startCoords.left - rect.left;
    let resolvedGoal = rect.left + goal2;
    let dist = distance !== null && distance !== void 0 ? distance : view.defaultLineHeight >> 1;
    for (let startY = dir < 0 ? startCoords.top : startCoords.bottom, extra = 0; extra < 50; extra += 10) {
      let pos = posAtCoords(view, {x: resolvedGoal, y: startY + (dist + extra) * dir}, dir);
      if (pos == null)
        break;
      if (pos != startPos)
        return EditorSelection.cursor(pos, void 0, void 0, goal2);
    }
  }
  let {doc: doc2} = view.state, line = doc2.lineAt(startPos), tabSize = view.state.tabSize;
  let goal = start.goalColumn, goalCol = 0;
  if (goal == null) {
    for (const iter = doc2.iterRange(line.from, startPos); !iter.next().done; )
      goalCol = countColumn(iter.value, goalCol, tabSize);
    goal = goalCol * view.defaultCharacterWidth;
  } else {
    goalCol = Math.round(goal / view.defaultCharacterWidth);
  }
  if (dir < 0 && line.from == 0)
    return EditorSelection.cursor(0);
  else if (dir > 0 && line.to == doc2.length)
    return EditorSelection.cursor(line.to);
  let otherLine = doc2.line(line.number + dir);
  let result = otherLine.from;
  let seen = 0;
  for (const iter = doc2.iterRange(otherLine.from, otherLine.to); seen >= goalCol && !iter.next().done; ) {
    const {offset, leftOver} = findColumn(iter.value, seen, goalCol, tabSize);
    seen = goalCol - leftOver;
    result += offset;
  }
  return EditorSelection.cursor(result, void 0, void 0, goal);
}
var InputState = class {
  constructor(view) {
    this.lastKeyCode = 0;
    this.lastKeyTime = 0;
    this.lastIOSEnter = 0;
    this.lastIOSBackspace = 0;
    this.lastSelectionOrigin = null;
    this.lastSelectionTime = 0;
    this.lastEscPress = 0;
    this.lastContextMenu = 0;
    this.scrollHandlers = [];
    this.registeredEvents = [];
    this.customHandlers = [];
    this.composing = -1;
    this.compositionEndedAt = 0;
    this.mouseSelection = null;
    for (let type in handlers) {
      let handler = handlers[type];
      view.contentDOM.addEventListener(type, (event) => {
        if (type == "keydown" && this.keydown(view, event))
          return;
        if (!eventBelongsToEditor(view, event) || this.ignoreDuringComposition(event))
          return;
        if (this.mustFlushObserver(event))
          view.observer.forceFlush();
        if (this.runCustomHandlers(type, view, event))
          event.preventDefault();
        else
          handler(view, event);
      });
      this.registeredEvents.push(type);
    }
    this.notifiedFocused = view.hasFocus;
    this.ensureHandlers(view);
  }
  setSelectionOrigin(origin) {
    this.lastSelectionOrigin = origin;
    this.lastSelectionTime = Date.now();
  }
  ensureHandlers(view) {
    let handlers2 = this.customHandlers = view.pluginField(domEventHandlers);
    for (let set of handlers2) {
      for (let type in set.handlers)
        if (this.registeredEvents.indexOf(type) < 0 && type != "scroll") {
          this.registeredEvents.push(type);
          view.contentDOM.addEventListener(type, (event) => {
            if (!eventBelongsToEditor(view, event))
              return;
            if (this.runCustomHandlers(type, view, event))
              event.preventDefault();
          });
        }
    }
  }
  runCustomHandlers(type, view, event) {
    for (let set of this.customHandlers) {
      let handler = set.handlers[type], handled = false;
      if (handler) {
        try {
          handled = handler.call(set.plugin, event, view);
        } catch (e) {
          logException(view.state, e);
        }
        if (handled || event.defaultPrevented) {
          if (browser.android && type == "keydown" && event.keyCode == 13)
            view.observer.flushSoon();
          return true;
        }
      }
    }
    return false;
  }
  runScrollHandlers(view, event) {
    for (let set of this.customHandlers) {
      let handler = set.handlers.scroll;
      if (handler) {
        try {
          handler.call(set.plugin, event, view);
        } catch (e) {
          logException(view.state, e);
        }
      }
    }
  }
  keydown(view, event) {
    this.lastKeyCode = event.keyCode;
    this.lastKeyTime = Date.now();
    if (this.screenKeyEvent(view, event))
      return;
    if (browser.ios && (event.keyCode == 13 || event.keyCode == 8) && !(event.ctrlKey || event.altKey || event.metaKey) && !event.synthetic) {
      this[event.keyCode == 13 ? "lastIOSEnter" : "lastIOSBackspace"] = Date.now();
      return true;
    }
    return false;
  }
  ignoreDuringComposition(event) {
    if (!/^key/.test(event.type))
      return false;
    if (this.composing > 0)
      return true;
    if (browser.safari && Date.now() - this.compositionEndedAt < 500) {
      this.compositionEndedAt = 0;
      return true;
    }
    return false;
  }
  screenKeyEvent(view, event) {
    let protectedTab = event.keyCode == 9 && Date.now() < this.lastEscPress + 2e3;
    if (event.keyCode == 27)
      this.lastEscPress = Date.now();
    else if (modifierCodes.indexOf(event.keyCode) < 0)
      this.lastEscPress = 0;
    return protectedTab;
  }
  mustFlushObserver(event) {
    return event.type == "keydown" && event.keyCode != 229 || event.type == "compositionend" && !browser.ios;
  }
  startMouseSelection(view, event, style) {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
    this.mouseSelection = new MouseSelection(this, view, event, style);
  }
  update(update) {
    if (this.mouseSelection)
      this.mouseSelection.update(update);
    this.lastKeyCode = this.lastSelectionTime = 0;
  }
  destroy() {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
  }
};
var modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
var MouseSelection = class {
  constructor(inputState, view, startEvent, style) {
    this.inputState = inputState;
    this.view = view;
    this.startEvent = startEvent;
    this.style = style;
    let doc2 = view.contentDOM.ownerDocument;
    doc2.addEventListener("mousemove", this.move = this.move.bind(this));
    doc2.addEventListener("mouseup", this.up = this.up.bind(this));
    this.extend = startEvent.shiftKey;
    this.multiple = view.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view, startEvent);
    this.dragMove = dragMovesSelection(view, startEvent);
    this.dragging = isInPrimarySelection(view, startEvent) ? null : false;
    if (this.dragging === false) {
      startEvent.preventDefault();
      this.select(startEvent);
    }
  }
  move(event) {
    if (event.buttons == 0)
      return this.destroy();
    if (this.dragging !== false)
      return;
    this.select(event);
  }
  up(event) {
    if (this.dragging == null)
      this.select(this.startEvent);
    if (!this.dragging)
      event.preventDefault();
    this.destroy();
  }
  destroy() {
    let doc2 = this.view.contentDOM.ownerDocument;
    doc2.removeEventListener("mousemove", this.move);
    doc2.removeEventListener("mouseup", this.up);
    this.inputState.mouseSelection = null;
  }
  select(event) {
    let selection = this.style.get(event, this.extend, this.multiple);
    if (!selection.eq(this.view.state.selection) || selection.main.assoc != this.view.state.selection.main.assoc)
      this.view.dispatch({
        selection,
        annotations: Transaction.userEvent.of("pointerselection"),
        scrollIntoView: true
      });
  }
  update(update) {
    if (update.docChanged && this.dragging)
      this.dragging = this.dragging.map(update.changes);
    this.style.update(update);
  }
};
function addsSelectionRange(view, event) {
  let facet = view.state.facet(clickAddsSelectionRange);
  return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
}
function dragMovesSelection(view, event) {
  let facet = view.state.facet(dragMovesSelection$1);
  return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
}
function isInPrimarySelection(view, event) {
  let {main} = view.state.selection;
  if (main.empty)
    return false;
  let sel = getSelection(view.root);
  if (sel.rangeCount == 0)
    return true;
  let rects = sel.getRangeAt(0).getClientRects();
  for (let i = 0; i < rects.length; i++) {
    let rect = rects[i];
    if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
      return true;
  }
  return false;
}
function eventBelongsToEditor(view, event) {
  if (!event.bubbles)
    return true;
  if (event.defaultPrevented)
    return false;
  for (let node = event.target, cView; node != view.contentDOM; node = node.parentNode)
    if (!node || node.nodeType == 11 || (cView = ContentView.get(node)) && cView.ignoreEvent(event))
      return false;
  return true;
}
var handlers = /* @__PURE__ */ Object.create(null);
var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
function capturePaste(view) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.focus();
  setTimeout(() => {
    view.focus();
    target.remove();
    doPaste(view, target.value);
  }, 50);
}
function doPaste(view, input) {
  let {state} = view, changes, i = 1, text = state.toText(input);
  let byLine = text.lines == state.selection.ranges.length;
  let linewise = lastLinewiseCopy && state.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
  if (linewise) {
    let lastLine = -1;
    changes = state.changeByRange((range) => {
      let line = state.doc.lineAt(range.from);
      if (line.from == lastLine)
        return {range};
      lastLine = line.from;
      let insert2 = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
      return {
        changes: {from: line.from, insert: insert2},
        range: EditorSelection.cursor(range.from + insert2.length)
      };
    });
  } else if (byLine) {
    changes = state.changeByRange((range) => {
      let line = text.line(i++);
      return {
        changes: {from: range.from, to: range.to, insert: line.text},
        range: EditorSelection.cursor(range.from + line.length)
      };
    });
  } else {
    changes = state.replaceSelection(text);
  }
  view.dispatch(changes, {
    annotations: Transaction.userEvent.of("paste"),
    scrollIntoView: true
  });
}
handlers.keydown = (view, event) => {
  view.inputState.setSelectionOrigin("keyboardselection");
};
var lastTouch = 0;
handlers.touchstart = (view, e) => {
  lastTouch = Date.now();
  view.inputState.setSelectionOrigin("pointerselection");
};
handlers.touchmove = (view) => {
  view.inputState.setSelectionOrigin("pointerselection");
};
handlers.mousedown = (view, event) => {
  view.observer.flush();
  if (lastTouch > Date.now() - 2e3)
    return;
  let style = null;
  for (let makeStyle of view.state.facet(mouseSelectionStyle)) {
    style = makeStyle(view, event);
    if (style)
      break;
  }
  if (!style && event.button == 0)
    style = basicMouseSelection(view, event);
  if (style) {
    if (view.root.activeElement != view.contentDOM)
      view.observer.ignore(() => focusPreventScroll(view.contentDOM));
    view.inputState.startMouseSelection(view, event, style);
  }
};
function rangeForClick(view, pos, bias, type) {
  if (type == 1) {
    return EditorSelection.cursor(pos, bias);
  } else if (type == 2) {
    return groupAt(view.state, pos, bias);
  } else {
    let visual = LineView.find(view.docView, pos), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
    let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
    if (to < view.state.doc.length && to == line.to)
      to++;
    return EditorSelection.range(from, to);
  }
}
var insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
var inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
function findPositionSide(view, pos, x, y) {
  let line = LineView.find(view.docView, pos);
  if (!line)
    return 1;
  let off = pos - line.posAtStart;
  if (off == 0)
    return 1;
  if (off == line.length)
    return -1;
  let before = line.coordsAt(off, -1);
  if (before && inside(x, y, before))
    return -1;
  let after = line.coordsAt(off, 1);
  if (after && inside(x, y, after))
    return 1;
  return before && insideY(y, before) ? -1 : 1;
}
function queryPos(view, event) {
  let pos = view.posAtCoords({x: event.clientX, y: event.clientY});
  if (pos == null)
    return null;
  return {pos, bias: findPositionSide(view, pos, event.clientX, event.clientY)};
}
var BadMouseDetail = browser.ie && browser.ie_version <= 11;
var lastMouseDown = null;
var lastMouseDownCount = 0;
var lastMouseDownTime = 0;
function getClickType(event) {
  if (!BadMouseDetail)
    return event.detail;
  let last = lastMouseDown, lastTime = lastMouseDownTime;
  lastMouseDown = event;
  lastMouseDownTime = Date.now();
  return lastMouseDownCount = !last || lastTime > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 && Math.abs(last.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
}
function basicMouseSelection(view, event) {
  let start = queryPos(view, event), type = getClickType(event);
  let startSel = view.state.selection;
  let last = start, lastEvent = event;
  return {
    update(update) {
      if (update.changes) {
        if (start)
          start.pos = update.changes.mapPos(start.pos);
        startSel = startSel.map(update.changes);
      }
    },
    get(event2, extend2, multiple) {
      let cur2;
      if (event2.clientX == lastEvent.clientX && event2.clientY == lastEvent.clientY)
        cur2 = last;
      else {
        cur2 = last = queryPos(view, event2);
        lastEvent = event2;
      }
      if (!cur2 || !start)
        return startSel;
      let range = rangeForClick(view, cur2.pos, cur2.bias, type);
      if (start.pos != cur2.pos && !extend2) {
        let startRange = rangeForClick(view, start.pos, start.bias, type);
        let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
        range = from < range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from);
      }
      if (extend2)
        return startSel.replaceRange(startSel.main.extend(range.from, range.to));
      else if (multiple)
        return startSel.addRange(range);
      else
        return EditorSelection.create([range]);
    }
  };
}
handlers.dragstart = (view, event) => {
  let {selection: {main}} = view.state;
  let {mouseSelection} = view.inputState;
  if (mouseSelection)
    mouseSelection.dragging = main;
  if (event.dataTransfer) {
    event.dataTransfer.setData("Text", view.state.sliceDoc(main.from, main.to));
    event.dataTransfer.effectAllowed = "copyMove";
  }
};
handlers.drop = (view, event) => {
  if (!event.dataTransfer || !view.state.facet(editable))
    return;
  let dropPos = view.posAtCoords({x: event.clientX, y: event.clientY});
  let text = event.dataTransfer.getData("Text");
  if (dropPos == null || !text)
    return;
  event.preventDefault();
  let {mouseSelection} = view.inputState;
  let del = mouseSelection && mouseSelection.dragging && mouseSelection.dragMove ? {from: mouseSelection.dragging.from, to: mouseSelection.dragging.to} : null;
  let ins = {from: dropPos, insert: text};
  let changes = view.state.changes(del ? [del, ins] : ins);
  view.focus();
  view.dispatch({
    changes,
    selection: {anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1)},
    annotations: Transaction.userEvent.of("drop")
  });
};
handlers.paste = (view, event) => {
  if (!view.state.facet(editable))
    return;
  view.observer.flush();
  let data2 = brokenClipboardAPI ? null : event.clipboardData;
  let text = data2 && data2.getData("text/plain");
  if (text) {
    doPaste(view, text);
    event.preventDefault();
  } else {
    capturePaste(view);
  }
};
function captureCopy(view, text) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.value = text;
  target.focus();
  target.selectionEnd = text.length;
  target.selectionStart = 0;
  setTimeout(() => {
    target.remove();
    view.focus();
  }, 50);
}
function copiedRange(state) {
  let content2 = [], ranges = [], linewise = false;
  for (let range of state.selection.ranges)
    if (!range.empty) {
      content2.push(state.sliceDoc(range.from, range.to));
      ranges.push(range);
    }
  if (!content2.length) {
    let upto = -1;
    for (let {from} of state.selection.ranges) {
      let line = state.doc.lineAt(from);
      if (line.number > upto) {
        content2.push(line.text);
        ranges.push({from: line.from, to: Math.min(state.doc.length, line.to + 1)});
      }
      upto = line.number;
    }
    linewise = true;
  }
  return {text: content2.join(state.lineBreak), ranges, linewise};
}
var lastLinewiseCopy = null;
handlers.copy = handlers.cut = (view, event) => {
  let {text, ranges, linewise} = copiedRange(view.state);
  if (!text)
    return;
  lastLinewiseCopy = linewise ? text : null;
  let data2 = brokenClipboardAPI ? null : event.clipboardData;
  if (data2) {
    event.preventDefault();
    data2.clearData();
    data2.setData("text/plain", text);
  } else {
    captureCopy(view, text);
  }
  if (event.type == "cut" && view.state.facet(editable))
    view.dispatch({
      changes: ranges,
      scrollIntoView: true,
      annotations: Transaction.userEvent.of("cut")
    });
};
handlers.focus = handlers.blur = (view) => {
  setTimeout(() => {
    if (view.hasFocus != view.inputState.notifiedFocused)
      view.update([]);
  }, 10);
};
handlers.beforeprint = (view) => {
  view.viewState.printing = true;
  view.requestMeasure();
  setTimeout(() => {
    view.viewState.printing = false;
    view.requestMeasure();
  }, 2e3);
};
function forceClearComposition(view) {
  if (view.docView.compositionDeco.size)
    view.update([]);
}
handlers.compositionstart = handlers.compositionupdate = (view) => {
  if (view.inputState.composing < 0) {
    if (view.docView.compositionDeco.size) {
      view.observer.flush();
      forceClearComposition(view);
    }
    view.inputState.composing = 0;
  }
};
handlers.compositionend = (view) => {
  view.inputState.composing = -1;
  view.inputState.compositionEndedAt = Date.now();
  setTimeout(() => {
    if (view.inputState.composing < 0)
      forceClearComposition(view);
  }, 50);
};
handlers.contextmenu = (view) => {
  view.inputState.lastContextMenu = Date.now();
};
var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line"];
var HeightOracle = class {
  constructor() {
    this.doc = Text.empty;
    this.lineWrapping = false;
    this.direction = Direction.LTR;
    this.heightSamples = {};
    this.lineHeight = 14;
    this.charWidth = 7;
    this.lineLength = 30;
    this.heightChanged = false;
  }
  heightForGap(from, to) {
    let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
    if (this.lineWrapping)
      lines += Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength);
    return this.lineHeight * lines;
  }
  heightForLine(length) {
    if (!this.lineWrapping)
      return this.lineHeight;
    let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
    return lines * this.lineHeight;
  }
  setDoc(doc2) {
    this.doc = doc2;
    return this;
  }
  mustRefresh(lineHeights, whiteSpace, direction) {
    let newHeight = false;
    for (let i = 0; i < lineHeights.length; i++) {
      let h = lineHeights[i];
      if (h < 0) {
        i++;
      } else if (!this.heightSamples[Math.floor(h * 10)]) {
        newHeight = true;
        this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return newHeight || wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping || this.direction != direction;
  }
  refresh(whiteSpace, direction, lineHeight, charWidth, lineLength, knownHeights) {
    let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
    let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping || this.direction != direction;
    this.lineWrapping = lineWrapping;
    this.direction = direction;
    this.lineHeight = lineHeight;
    this.charWidth = charWidth;
    this.lineLength = lineLength;
    if (changed) {
      this.heightSamples = {};
      for (let i = 0; i < knownHeights.length; i++) {
        let h = knownHeights[i];
        if (h < 0)
          i++;
        else
          this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return changed;
  }
};
var MeasuredHeights = class {
  constructor(from, heights) {
    this.from = from;
    this.heights = heights;
    this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
};
var BlockInfo = class {
  constructor(from, length, top2, height, type) {
    this.from = from;
    this.length = length;
    this.top = top2;
    this.height = height;
    this.type = type;
  }
  get to() {
    return this.from + this.length;
  }
  get bottom() {
    return this.top + this.height;
  }
  join(other) {
    let detail = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(other.type) ? other.type : [other]);
    return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, detail);
  }
};
var QueryType = /* @__PURE__ */ function(QueryType2) {
  QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
  QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
  QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
  return QueryType2;
}(QueryType || (QueryType = {}));
var Epsilon = 1e-4;
var HeightMap = class {
  constructor(length, height, flags = 2) {
    this.length = length;
    this.height = height;
    this.flags = flags;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(value) {
    this.flags = (value ? 2 : 0) | this.flags & ~2;
  }
  setHeight(oracle, height) {
    if (this.height != height) {
      if (Math.abs(this.height - height) > Epsilon)
        oracle.heightChanged = true;
      this.height = height;
    }
  }
  replace(_from, _to, nodes) {
    return HeightMap.of(nodes);
  }
  decomposeLeft(_to, result) {
    result.push(this);
  }
  decomposeRight(_from, result) {
    result.push(this);
  }
  applyChanges(decorations2, oldDoc, oracle, changes) {
    let me = this;
    for (let i = changes.length - 1; i >= 0; i--) {
      let {fromA, toA, fromB, toB} = changes[i];
      let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
      let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
      toB += end.to - toA;
      toA = end.to;
      while (i > 0 && start.from <= changes[i - 1].toA) {
        fromA = changes[i - 1].fromA;
        fromB = changes[i - 1].fromB;
        i--;
        if (fromA < start.from)
          start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
      }
      fromB += start.from - fromA;
      fromA = start.from;
      let nodes = NodeBuilder.build(oracle, decorations2, fromB, toB);
      me = me.replace(fromA, toA, nodes);
    }
    return me.updateHeight(oracle, 0);
  }
  static empty() {
    return new HeightMapText(0, 0);
  }
  static of(nodes) {
    if (nodes.length == 1)
      return nodes[0];
    let i = 0, j = nodes.length, before = 0, after = 0;
    for (; ; ) {
      if (i == j) {
        if (before > after * 2) {
          let split = nodes[i - 1];
          if (split.break)
            nodes.splice(--i, 1, split.left, null, split.right);
          else
            nodes.splice(--i, 1, split.left, split.right);
          j += 1 + split.break;
          before -= split.size;
        } else if (after > before * 2) {
          let split = nodes[j];
          if (split.break)
            nodes.splice(j, 1, split.left, null, split.right);
          else
            nodes.splice(j, 1, split.left, split.right);
          j += 2 + split.break;
          after -= split.size;
        } else {
          break;
        }
      } else if (before < after) {
        let next = nodes[i++];
        if (next)
          before += next.size;
      } else {
        let next = nodes[--j];
        if (next)
          after += next.size;
      }
    }
    let brk = 0;
    if (nodes[i - 1] == null) {
      brk = 1;
      i--;
    } else if (nodes[i] == null) {
      brk = 1;
      j++;
    }
    return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
  }
};
HeightMap.prototype.size = 1;
var HeightMapBlock = class extends HeightMap {
  constructor(length, height, type) {
    super(length, height);
    this.type = type;
  }
  blockAt(_height, _doc, top2, offset) {
    return new BlockInfo(offset, this.length, top2, this.height, this.type);
  }
  lineAt(_value, _type, doc2, top2, offset) {
    return this.blockAt(0, doc2, top2, offset);
  }
  forEachLine(_from, _to, doc2, top2, offset, f) {
    f(this.blockAt(0, doc2, top2, offset));
  }
  updateHeight(oracle, offset = 0, _force = false, measured) {
    if (measured && measured.from <= offset && measured.more)
      this.setHeight(oracle, measured.heights[measured.index++]);
    this.outdated = false;
    return this;
  }
  toString() {
    return `block(${this.length})`;
  }
};
var HeightMapText = class extends HeightMapBlock {
  constructor(length, height) {
    super(length, height, BlockType.Text);
    this.collapsed = 0;
    this.widgetHeight = 0;
  }
  replace(_from, _to, nodes) {
    let node = nodes[0];
    if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
      if (node instanceof HeightMapGap)
        node = new HeightMapText(node.length, this.height);
      else
        node.height = this.height;
      if (!this.outdated)
        node.outdated = false;
      return node;
    } else {
      return HeightMap.of(nodes);
    }
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    if (measured && measured.from <= offset && measured.more)
      this.setHeight(oracle, measured.heights[measured.index++]);
    else if (force || this.outdated)
      this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)));
    this.outdated = false;
    return this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
};
var HeightMapGap = class extends HeightMap {
  constructor(length) {
    super(length, 0);
  }
  lines(doc2, offset) {
    let firstLine = doc2.lineAt(offset).number, lastLine = doc2.lineAt(offset + this.length).number;
    return {firstLine, lastLine, lineHeight: this.height / (lastLine - firstLine + 1)};
  }
  blockAt(height, doc2, top2, offset) {
    let {firstLine, lastLine, lineHeight} = this.lines(doc2, offset);
    let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / lineHeight)));
    let {from, length} = doc2.line(firstLine + line);
    return new BlockInfo(from, length, top2 + lineHeight * line, lineHeight, BlockType.Text);
  }
  lineAt(value, type, doc2, top2, offset) {
    if (type == QueryType.ByHeight)
      return this.blockAt(value, doc2, top2, offset);
    if (type == QueryType.ByPosNoHeight) {
      let {from: from2, to} = doc2.lineAt(value);
      return new BlockInfo(from2, to - from2, 0, 0, BlockType.Text);
    }
    let {firstLine, lineHeight} = this.lines(doc2, offset);
    let {from, length, number: number2} = doc2.lineAt(value);
    return new BlockInfo(from, length, top2 + lineHeight * (number2 - firstLine), lineHeight, BlockType.Text);
  }
  forEachLine(from, to, doc2, top2, offset, f) {
    let {firstLine, lineHeight} = this.lines(doc2, offset);
    for (let pos = Math.max(from, offset), end = Math.min(offset + this.length, to); pos <= end; ) {
      let line = doc2.lineAt(pos);
      if (pos == from)
        top2 += lineHeight * (line.number - firstLine);
      f(new BlockInfo(line.from, line.length, top2, lineHeight, BlockType.Text));
      top2 += lineHeight;
      pos = line.to + 1;
    }
  }
  replace(from, to, nodes) {
    let after = this.length - to;
    if (after > 0) {
      let last = nodes[nodes.length - 1];
      if (last instanceof HeightMapGap)
        nodes[nodes.length - 1] = new HeightMapGap(last.length + after);
      else
        nodes.push(null, new HeightMapGap(after - 1));
    }
    if (from > 0) {
      let first = nodes[0];
      if (first instanceof HeightMapGap)
        nodes[0] = new HeightMapGap(from + first.length);
      else
        nodes.unshift(new HeightMapGap(from - 1), null);
    }
    return HeightMap.of(nodes);
  }
  decomposeLeft(to, result) {
    result.push(new HeightMapGap(to - 1), null);
  }
  decomposeRight(from, result) {
    result.push(null, new HeightMapGap(this.length - from - 1));
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let end = offset + this.length;
    if (measured && measured.from <= offset + this.length && measured.more) {
      let nodes = [], pos = Math.max(offset, measured.from);
      if (measured.from > offset)
        nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
      while (pos <= end && measured.more) {
        let len = oracle.doc.lineAt(pos).length;
        if (nodes.length)
          nodes.push(null);
        let line = new HeightMapText(len, measured.heights[measured.index++]);
        line.outdated = false;
        nodes.push(line);
        pos += len + 1;
      }
      if (pos <= end)
        nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
      oracle.heightChanged = true;
      return HeightMap.of(nodes);
    } else if (force || this.outdated) {
      this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
      this.outdated = false;
    }
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
};
var HeightMapBranch = class extends HeightMap {
  constructor(left, brk, right) {
    super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
    this.left = left;
    this.right = right;
    this.size = left.size + right.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(height, doc2, top2, offset) {
    let mid = top2 + this.left.height;
    return height < mid || this.right.height == 0 ? this.left.blockAt(height, doc2, top2, offset) : this.right.blockAt(height, doc2, mid, offset + this.left.length + this.break);
  }
  lineAt(value, type, doc2, top2, offset) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    let left = type == QueryType.ByHeight ? value < rightTop || this.right.height == 0 : value < rightOffset;
    let base2 = left ? this.left.lineAt(value, type, doc2, top2, offset) : this.right.lineAt(value, type, doc2, rightTop, rightOffset);
    if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
      return base2;
    let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
    if (left)
      return base2.join(this.right.lineAt(rightOffset, subQuery, doc2, rightTop, rightOffset));
    else
      return this.left.lineAt(rightOffset, subQuery, doc2, top2, offset).join(base2);
  }
  forEachLine(from, to, doc2, top2, offset, f) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    if (this.break) {
      if (from < rightOffset)
        this.left.forEachLine(from, to, doc2, top2, offset, f);
      if (to >= rightOffset)
        this.right.forEachLine(from, to, doc2, rightTop, rightOffset, f);
    } else {
      let mid = this.lineAt(rightOffset, QueryType.ByPos, doc2, top2, offset);
      if (from < mid.from)
        this.left.forEachLine(from, mid.from - 1, doc2, top2, offset, f);
      if (mid.to >= from && mid.from <= to)
        f(mid);
      if (to > mid.to)
        this.right.forEachLine(mid.to + 1, to, doc2, rightTop, rightOffset, f);
    }
  }
  replace(from, to, nodes) {
    let rightStart = this.left.length + this.break;
    if (to < rightStart)
      return this.balanced(this.left.replace(from, to, nodes), this.right);
    if (from > this.left.length)
      return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
    let result = [];
    if (from > 0)
      this.decomposeLeft(from, result);
    let left = result.length;
    for (let node of nodes)
      result.push(node);
    if (from > 0)
      mergeGaps(result, left - 1);
    if (to < this.length) {
      let right = result.length;
      this.decomposeRight(to, result);
      mergeGaps(result, right);
    }
    return HeightMap.of(result);
  }
  decomposeLeft(to, result) {
    let left = this.left.length;
    if (to <= left)
      return this.left.decomposeLeft(to, result);
    result.push(this.left);
    if (this.break) {
      left++;
      if (to >= left)
        result.push(null);
    }
    if (to > left)
      this.right.decomposeLeft(to - left, result);
  }
  decomposeRight(from, result) {
    let left = this.left.length, right = left + this.break;
    if (from >= right)
      return this.right.decomposeRight(from - right, result);
    if (from < left)
      this.left.decomposeRight(from, result);
    if (this.break && from < right)
      result.push(null);
    result.push(this.right);
  }
  balanced(left, right) {
    if (left.size > 2 * right.size || right.size > 2 * left.size)
      return HeightMap.of(this.break ? [left, null, right] : [left, right]);
    this.left = left;
    this.right = right;
    this.height = left.height + right.height;
    this.outdated = left.outdated || right.outdated;
    this.size = left.size + right.size;
    this.length = left.length + this.break + right.length;
    return this;
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let {left, right} = this, rightStart = offset + left.length + this.break, rebalance = null;
    if (measured && measured.from <= offset + left.length && measured.more)
      rebalance = left = left.updateHeight(oracle, offset, force, measured);
    else
      left.updateHeight(oracle, offset, force);
    if (measured && measured.from <= rightStart + right.length && measured.more)
      rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
    else
      right.updateHeight(oracle, rightStart, force);
    if (rebalance)
      return this.balanced(left, right);
    this.height = this.left.height + this.right.height;
    this.outdated = false;
    return this;
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
};
function mergeGaps(nodes, around) {
  let before, after;
  if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
    nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
}
var relevantWidgetHeight = 5;
var NodeBuilder = class {
  constructor(pos, oracle) {
    this.pos = pos;
    this.oracle = oracle;
    this.nodes = [];
    this.lineStart = -1;
    this.lineEnd = -1;
    this.covering = null;
    this.writtenTo = pos;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(_from, to) {
    if (this.lineStart > -1) {
      let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
      if (last instanceof HeightMapText)
        last.length += end - this.pos;
      else if (end > this.pos || !this.isCovered)
        this.nodes.push(new HeightMapText(end - this.pos, -1));
      this.writtenTo = end;
      if (to > end) {
        this.nodes.push(null);
        this.writtenTo++;
        this.lineStart = -1;
      }
    }
    this.pos = to;
  }
  point(from, to, deco) {
    if (from < to || deco.heightRelevant) {
      let height = deco.widget ? Math.max(0, deco.widget.estimatedHeight) : 0;
      let len = to - from;
      if (deco.block) {
        this.addBlock(new HeightMapBlock(len, height, deco.type));
      } else if (len || height >= relevantWidgetHeight) {
        this.addLineDeco(height, len);
      }
    } else if (to > from) {
      this.span(from, to);
    }
    if (this.lineEnd > -1 && this.lineEnd < this.pos)
      this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let {from, to} = this.oracle.doc.lineAt(this.pos);
    this.lineStart = from;
    this.lineEnd = to;
    if (this.writtenTo < from) {
      if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
        this.nodes.push(this.blankContent(this.writtenTo, from - 1));
      this.nodes.push(null);
    }
    if (this.pos > from)
      this.nodes.push(new HeightMapText(this.pos - from, -1));
    this.writtenTo = this.pos;
  }
  blankContent(from, to) {
    let gap = new HeightMapGap(to - from);
    if (this.oracle.doc.lineAt(from).to == to)
      gap.flags |= 4;
    return gap;
  }
  ensureLine() {
    this.enterLine();
    let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (last instanceof HeightMapText)
      return last;
    let line = new HeightMapText(0, -1);
    this.nodes.push(line);
    return line;
  }
  addBlock(block) {
    this.enterLine();
    if (block.type == BlockType.WidgetAfter && !this.isCovered)
      this.ensureLine();
    this.nodes.push(block);
    this.writtenTo = this.pos = this.pos + block.length;
    if (block.type != BlockType.WidgetBefore)
      this.covering = block;
  }
  addLineDeco(height, length) {
    let line = this.ensureLine();
    line.length += length;
    line.collapsed += length;
    line.widgetHeight = Math.max(line.widgetHeight, height);
    this.writtenTo = this.pos = this.pos + length;
  }
  finish(from) {
    let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
      this.nodes.push(new HeightMapText(0, -1));
    else if (this.writtenTo < this.pos || last == null)
      this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let pos = from;
    for (let node of this.nodes) {
      if (node instanceof HeightMapText)
        node.updateHeight(this.oracle, pos);
      pos += node ? node.length : 1;
    }
    return this.nodes;
  }
  static build(oracle, decorations2, from, to) {
    let builder = new NodeBuilder(from, oracle);
    RangeSet.spans(decorations2, from, to, builder, 0);
    return builder.finish(from);
  }
};
function heightRelevantDecoChanges(a, b, diff) {
  let comp = new DecorationComparator();
  RangeSet.compare(a, b, diff, comp, 0);
  return comp.changes;
}
var DecorationComparator = class {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(from, to, a, b) {
    if (from < to || a && a.heightRelevant || b && b.heightRelevant)
      addRange(from, to, this.changes, 5);
  }
};
function visiblePixelRange(dom, paddingTop) {
  let rect = dom.getBoundingClientRect();
  let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
  let top2 = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
  for (let parent = dom.parentNode; parent; ) {
    if (parent.nodeType == 1) {
      let style = window.getComputedStyle(parent);
      if ((parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) && style.overflow != "visible") {
        let parentRect = parent.getBoundingClientRect();
        left = Math.max(left, parentRect.left);
        right = Math.min(right, parentRect.right);
        top2 = Math.max(top2, parentRect.top);
        bottom = Math.min(bottom, parentRect.bottom);
      }
      parent = style.position == "absolute" || style.position == "fixed" ? parent.offsetParent : parent.parentNode;
    } else if (parent.nodeType == 11) {
      parent = parent.host;
    } else {
      break;
    }
  }
  return {
    left: left - rect.left,
    right: right - rect.left,
    top: top2 - (rect.top + paddingTop),
    bottom: bottom - (rect.top + paddingTop)
  };
}
var LineGap = class {
  constructor(from, to, size) {
    this.from = from;
    this.to = to;
    this.size = size;
  }
  static same(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      let gA = a[i], gB = b[i];
      if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
        return false;
    }
    return true;
  }
  draw(wrapping) {
    return Decoration.replace({widget: new LineGapWidget(this.size, wrapping)}).range(this.from, this.to);
  }
};
var LineGapWidget = class extends WidgetType {
  constructor(size, vertical) {
    super();
    this.size = size;
    this.vertical = vertical;
  }
  eq(other) {
    return other.size == this.size && other.vertical == this.vertical;
  }
  toDOM() {
    let elt2 = document.createElement("div");
    if (this.vertical) {
      elt2.style.height = this.size + "px";
    } else {
      elt2.style.width = this.size + "px";
      elt2.style.height = "2px";
      elt2.style.display = "inline-block";
    }
    return elt2;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
};
var ViewState = class {
  constructor(state) {
    this.state = state;
    this.pixelViewport = {left: 0, right: window.innerWidth, top: 0, bottom: 0};
    this.inView = true;
    this.paddingTop = 0;
    this.paddingBottom = 0;
    this.contentWidth = 0;
    this.heightOracle = new HeightOracle();
    this.scaler = IdScaler;
    this.scrollTo = null;
    this.printing = false;
    this.visibleRanges = [];
    this.mustEnforceCursorAssoc = false;
    this.heightMap = HeightMap.empty().applyChanges(state.facet(decorations), Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
    this.viewport = this.getViewport(0, null);
    this.updateForViewport();
    this.lineGaps = this.ensureLineGaps([]);
    this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(false)));
    this.computeVisibleRanges();
  }
  updateForViewport() {
    let viewports = [this.viewport], {main} = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let pos = i ? main.head : main.anchor;
      if (!viewports.some(({from, to}) => pos >= from && pos <= to)) {
        let {from, to} = this.lineAt(pos, 0);
        viewports.push(new Viewport(from, to));
      }
    }
    this.viewports = viewports.sort((a, b) => a.from - b.from);
    this.scaler = this.heightMap.height <= 7e6 ? IdScaler : new BigScaler(this.heightOracle.doc, this.heightMap, this.viewports);
  }
  update(update, scrollTo2 = null) {
    let prev = this.state;
    this.state = update.state;
    let newDeco = this.state.facet(decorations);
    let contentChanges = update.changedRanges;
    let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(update.startState.facet(decorations), newDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
    let prevHeight = this.heightMap.height;
    this.heightMap = this.heightMap.applyChanges(newDeco, prev.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
    if (this.heightMap.height != prevHeight)
      update.flags |= 2;
    let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
    if (scrollTo2 && (scrollTo2.head < viewport.from || scrollTo2.head > viewport.to) || !this.viewportIsAppropriate(viewport))
      viewport = this.getViewport(0, scrollTo2);
    if (!viewport.eq(this.viewport)) {
      this.viewport = viewport;
      update.flags |= 4;
    }
    this.updateForViewport();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 15e3)
      update.flags |= this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
    this.computeVisibleRanges();
    if (scrollTo2)
      this.scrollTo = scrollTo2;
    if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping && update.state.selection.main.empty && update.state.selection.main.assoc)
      this.mustEnforceCursorAssoc = true;
  }
  measure(docView, repeated) {
    let dom = docView.dom, whiteSpace = "", direction = Direction.LTR;
    if (!repeated) {
      let style = window.getComputedStyle(dom);
      whiteSpace = style.whiteSpace, direction = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
      this.paddingTop = parseInt(style.paddingTop) || 0;
      this.paddingBottom = parseInt(style.paddingBottom) || 0;
    }
    let pixelViewport = this.printing ? {top: -1e8, bottom: 1e8, left: -1e8, right: 1e8} : visiblePixelRange(dom, this.paddingTop);
    let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
    this.pixelViewport = pixelViewport;
    this.inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (!this.inView)
      return 0;
    let lineHeights = docView.measureVisibleLineHeights();
    let refresh = false, bias = 0, result = 0, oracle = this.heightOracle;
    if (!repeated) {
      let contentWidth = docView.dom.clientWidth;
      if (oracle.mustRefresh(lineHeights, whiteSpace, direction) || oracle.lineWrapping && Math.abs(contentWidth - this.contentWidth) > oracle.charWidth) {
        let {lineHeight, charWidth} = docView.measureTextSize();
        refresh = oracle.refresh(whiteSpace, direction, lineHeight, charWidth, contentWidth / charWidth, lineHeights);
        if (refresh) {
          docView.minWidth = 0;
          result |= 16;
        }
      }
      if (this.contentWidth != contentWidth) {
        this.contentWidth = contentWidth;
        result |= 16;
      }
      if (dTop > 0 && dBottom > 0)
        bias = Math.max(dTop, dBottom);
      else if (dTop < 0 && dBottom < 0)
        bias = Math.min(dTop, dBottom);
    }
    oracle.heightChanged = false;
    this.heightMap = this.heightMap.updateHeight(oracle, 0, refresh, new MeasuredHeights(this.viewport.from, lineHeights));
    if (oracle.heightChanged)
      result |= 2;
    if (!this.viewportIsAppropriate(this.viewport, bias) || this.scrollTo && (this.scrollTo.head < this.viewport.from || this.scrollTo.head > this.viewport.to)) {
      let newVP = this.getViewport(bias, this.scrollTo);
      if (newVP.from != this.viewport.from || newVP.to != this.viewport.to) {
        this.viewport = newVP;
        result |= 4;
      }
    }
    this.updateForViewport();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 15e3)
      result |= this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps));
    this.computeVisibleRanges();
    if (this.mustEnforceCursorAssoc) {
      this.mustEnforceCursorAssoc = false;
      docView.enforceCursorAssoc();
    }
    return result;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top, 0);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom, 0);
  }
  getViewport(bias, scrollTo2) {
    let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
    let map = this.heightMap, doc2 = this.state.doc, {visibleTop, visibleBottom} = this;
    let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1e3, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1e3, QueryType.ByHeight, doc2, 0, 0).to);
    if (scrollTo2) {
      if (scrollTo2.head < viewport.from) {
        let {top: newTop} = map.lineAt(scrollTo2.head, QueryType.ByPos, doc2, 0, 0);
        viewport = new Viewport(map.lineAt(newTop - 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(newTop + (visibleBottom - visibleTop) + 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).to);
      } else if (scrollTo2.head > viewport.to) {
        let {bottom: newBottom} = map.lineAt(scrollTo2.head, QueryType.ByPos, doc2, 0, 0);
        viewport = new Viewport(map.lineAt(newBottom - (visibleBottom - visibleTop) - 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(newBottom + 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).to);
      }
    }
    return viewport;
  }
  mapViewport(viewport, changes) {
    let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
    return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0).to);
  }
  viewportIsAppropriate({from, to}, bias = 0) {
    let {top: top2} = this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0);
    let {bottom} = this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0);
    let {visibleTop, visibleBottom} = this;
    return (from == 0 || top2 <= visibleTop - Math.max(10, Math.min(-bias, 250))) && (to == this.state.doc.length || bottom >= visibleBottom + Math.max(10, Math.min(bias, 250))) && (top2 > visibleTop - 2 * 1e3 && bottom < visibleBottom + 2 * 1e3);
  }
  mapLineGaps(gaps, changes) {
    if (!gaps.length || changes.empty)
      return gaps;
    let mapped = [];
    for (let gap of gaps)
      if (!changes.touchesRange(gap.from, gap.to))
        mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
    return mapped;
  }
  ensureLineGaps(current) {
    let gaps = [];
    if (this.heightOracle.direction != Direction.LTR)
      return gaps;
    this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, (line) => {
      if (line.length < 1e4)
        return;
      let structure = lineStructure(line.from, line.to, this.state);
      if (structure.total < 1e4)
        return;
      let viewFrom, viewTo;
      if (this.heightOracle.lineWrapping) {
        if (line.from != this.viewport.from)
          viewFrom = line.from;
        else
          viewFrom = findPosition(structure, (this.visibleTop - line.top) / line.height);
        if (line.to != this.viewport.to)
          viewTo = line.to;
        else
          viewTo = findPosition(structure, (this.visibleBottom - line.top) / line.height);
      } else {
        let totalWidth = structure.total * this.heightOracle.charWidth;
        viewFrom = findPosition(structure, this.pixelViewport.left / totalWidth);
        viewTo = findPosition(structure, this.pixelViewport.right / totalWidth);
      }
      let sel = this.state.selection.main;
      if (sel.from <= viewFrom && sel.to >= line.from)
        viewFrom = sel.from;
      if (sel.from <= line.to && sel.to >= viewTo)
        viewTo = sel.to;
      let gapTo = viewFrom - 1e4, gapFrom = viewTo + 1e4;
      if (gapTo > line.from + 5e3)
        gaps.push(find(current, (gap) => gap.from == line.from && gap.to > gapTo - 5e3 && gap.to < gapTo + 5e3) || new LineGap(line.from, gapTo, this.gapSize(line, gapTo, true, structure)));
      if (gapFrom < line.to - 5e3)
        gaps.push(find(current, (gap) => gap.to == line.to && gap.from > gapFrom - 5e3 && gap.from < gapFrom + 5e3) || new LineGap(gapFrom, line.to, this.gapSize(line, gapFrom, false, structure)));
    });
    return gaps;
  }
  gapSize(line, pos, start, structure) {
    if (this.heightOracle.lineWrapping) {
      let height = line.height * findFraction(structure, pos);
      return start ? height : line.height - height;
    } else {
      let ratio = findFraction(structure, pos);
      return structure.total * this.heightOracle.charWidth * (start ? ratio : 1 - ratio);
    }
  }
  updateLineGaps(gaps) {
    if (!LineGap.same(gaps, this.lineGaps)) {
      this.lineGaps = gaps;
      this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this.heightOracle.lineWrapping)));
      return 8;
    }
    return 0;
  }
  computeVisibleRanges() {
    let deco = this.state.facet(decorations);
    if (this.lineGaps.length)
      deco = deco.concat(this.lineGapDeco);
    let ranges = [];
    RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
      span(from, to) {
        ranges.push({from, to});
      },
      point() {
      }
    }, 20);
    this.visibleRanges = ranges;
  }
  lineAt(pos, editorTop) {
    editorTop += this.paddingTop;
    return scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.state.doc, editorTop, 0), this.scaler, editorTop);
  }
  lineAtHeight(height, editorTop) {
    editorTop += this.paddingTop;
    return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height, editorTop), QueryType.ByHeight, this.state.doc, editorTop, 0), this.scaler, editorTop);
  }
  blockAtHeight(height, editorTop) {
    editorTop += this.paddingTop;
    return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height, editorTop), this.state.doc, editorTop, 0), this.scaler, editorTop);
  }
  forEachLine(from, to, f, editorTop) {
    editorTop += this.paddingTop;
    return this.heightMap.forEachLine(from, to, this.state.doc, editorTop, 0, this.scaler.scale == 1 ? f : (b) => f(scaleBlock(b, this.scaler, editorTop)));
  }
  get contentHeight() {
    return this.domHeight + this.paddingTop + this.paddingBottom;
  }
  get domHeight() {
    return this.scaler.toDOM(this.heightMap.height, this.paddingTop);
  }
};
var Viewport = class {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
  eq(b) {
    return this.from == b.from && this.to == b.to;
  }
};
function lineStructure(from, to, state) {
  let ranges = [], pos = from, total = 0;
  RangeSet.spans(state.facet(decorations), from, to, {
    span() {
    },
    point(from2, to2) {
      if (from2 > pos) {
        ranges.push({from: pos, to: from2});
        total += from2 - pos;
      }
      pos = to2;
    }
  }, 20);
  if (pos < to) {
    ranges.push({from: pos, to});
    total += to - pos;
  }
  return {total, ranges};
}
function findPosition({total, ranges}, ratio) {
  if (ratio <= 0)
    return ranges[0].from;
  if (ratio >= 1)
    return ranges[ranges.length - 1].to;
  let dist = Math.floor(total * ratio);
  for (let i = 0; ; i++) {
    let {from, to} = ranges[i], size = to - from;
    if (dist <= size)
      return from + dist;
    dist -= size;
  }
}
function findFraction(structure, pos) {
  let counted = 0;
  for (let {from, to} of structure.ranges) {
    if (pos <= to) {
      counted += pos - from;
      break;
    }
    counted += to - from;
  }
  return counted / structure.total;
}
function find(array, f) {
  for (let val of array)
    if (f(val))
      return val;
  return void 0;
}
var IdScaler = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1
};
var BigScaler = class {
  constructor(doc2, heightMap, viewports) {
    let vpHeight = 0, base2 = 0, domBase = 0;
    this.viewports = viewports.map(({from, to}) => {
      let top2 = heightMap.lineAt(from, QueryType.ByPos, doc2, 0, 0).top;
      let bottom = heightMap.lineAt(to, QueryType.ByPos, doc2, 0, 0).bottom;
      vpHeight += bottom - top2;
      return {from, to, top: top2, bottom, domTop: 0, domBottom: 0};
    });
    this.scale = (7e6 - vpHeight) / (heightMap.height - vpHeight);
    for (let obj of this.viewports) {
      obj.domTop = domBase + (obj.top - base2) * this.scale;
      domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
      base2 = obj.bottom;
    }
  }
  toDOM(n, top2) {
    n -= top2;
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.top)
        return domBase + (n - base2) * this.scale + top2;
      if (n <= vp.bottom)
        return vp.domTop + (n - vp.top) + top2;
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
  fromDOM(n, top2) {
    n -= top2;
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.domTop)
        return base2 + (n - domBase) / this.scale + top2;
      if (n <= vp.domBottom)
        return vp.top + (n - vp.domTop) + top2;
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
};
function scaleBlock(block, scaler, top2) {
  if (scaler.scale == 1)
    return block;
  let bTop = scaler.toDOM(block.top, top2), bBottom = scaler.toDOM(block.bottom, top2);
  return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block.type) ? block.type.map((b) => scaleBlock(b, scaler, top2)) : block.type);
}
var theme = /* @__PURE__ */ Facet.define({combine: (strs) => strs.join(" ")});
var darkTheme = /* @__PURE__ */ Facet.define({combine: (values2) => values2.indexOf(true) > -1});
var baseThemeID = /* @__PURE__ */ StyleModule.newName();
var baseLightID = /* @__PURE__ */ StyleModule.newName();
var baseDarkID = /* @__PURE__ */ StyleModule.newName();
var lightDarkIDs = {"&light": "." + baseLightID, "&dark": "." + baseDarkID};
function buildTheme(main, spec, scopes) {
  return new StyleModule(spec, {
    finish(sel) {
      return /&/.test(sel) ? sel.replace(/&\w*/, (m) => {
        if (m == "&")
          return main;
        if (!scopes || !scopes[m])
          throw new RangeError(`Unsupported selector: ${m}`);
        return scopes[m];
      }) : main + " " + sel;
    }
  });
}
var baseTheme = /* @__PURE__ */ buildTheme("." + baseThemeID, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    minHeight: "100%",
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    boxSizing: "border-box",
    padding: "4px 0",
    outline: "none"
  },
  ".cm-lineWrapping": {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere"
  },
  "&light .cm-content": {caretColor: "black"},
  "&dark .cm-content": {caretColor: "white"},
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 4px"
  },
  ".cm-selectionLayer": {
    zIndex: -1,
    contain: "size style"
  },
  ".cm-selectionBackground": {
    position: "absolute"
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    zIndex: 100,
    contain: "size style",
    pointerEvents: "none"
  },
  "&.cm-focused .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  "@keyframes cm-blink": {"0%": {}, "50%": {visibility: "hidden"}, "100%": {}},
  "@keyframes cm-blink2": {"0%": {}, "50%": {visibility: "hidden"}, "100%": {}},
  ".cm-cursor": {
    position: "absolute",
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none",
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#444"
  },
  "&.cm-focused .cm-cursor": {
    display: "block"
  },
  "&light .cm-activeLine": {backgroundColor: "#f3f9ff"},
  "&dark .cm-activeLine": {backgroundColor: "#223039"},
  "&light .cm-specialChar": {color: "red"},
  "&dark .cm-specialChar": {color: "#f78"},
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "3px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, lightDarkIDs);
var observeOptions = {
  childList: true,
  characterData: true,
  subtree: true,
  characterDataOldValue: true
};
var useCharData = browser.ie && browser.ie_version <= 11;
var DOMObserver = class {
  constructor(view, onChange, onScrollChanged) {
    this.view = view;
    this.onChange = onChange;
    this.onScrollChanged = onScrollChanged;
    this.active = false;
    this.ignoreSelection = new DOMSelection();
    this.delayedFlush = -1;
    this.queue = [];
    this.scrollTargets = [];
    this.intersection = null;
    this.intersecting = false;
    this.parentCheck = -1;
    this.dom = view.contentDOM;
    this.observer = new MutationObserver((mutations) => {
      for (let mut of mutations)
        this.queue.push(mut);
      if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
        this.flushSoon();
      else
        this.flush();
    });
    if (useCharData)
      this.onCharData = (event) => {
        this.queue.push({
          target: event.target,
          type: "characterData",
          oldValue: event.prevValue
        });
        this.flushSoon();
      };
    this.updateSelectionRange();
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.start();
    this.onScroll = this.onScroll.bind(this);
    window.addEventListener("scroll", this.onScroll);
    if (typeof IntersectionObserver == "function") {
      this.intersection = new IntersectionObserver((entries) => {
        if (this.parentCheck < 0)
          this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
        if (entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
          this.intersecting = !this.intersecting;
          if (this.intersecting != this.view.inView)
            this.onScrollChanged(document.createEvent("Event"));
        }
      }, {});
      this.intersection.observe(this.dom);
    }
    this.listenForScroll();
  }
  onScroll(e) {
    if (this.intersecting)
      this.flush();
    this.onScrollChanged(e);
  }
  onSelectionChange(event) {
    this.updateSelectionRange();
    let {view} = this, sel = this.selectionRange;
    if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(view.dom, sel))
      return;
    let context = sel.anchorNode && view.docView.nearest(sel.anchorNode);
    if (context && context.ignoreEvent(event))
      return;
    if (browser.ie && browser.ie_version <= 11 && !view.state.selection.main.empty && sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
      this.flushSoon();
    else
      this.flush();
  }
  updateSelectionRange() {
    let {root} = this.view, sel = getSelection(root);
    if (browser.safari && root.nodeType == 11 && deepActiveElement() == this.view.contentDOM)
      sel = safariSelectionRangeHack(this.view) || sel;
    this.selectionRange = sel;
  }
  listenForScroll() {
    this.parentCheck = -1;
    let i = 0, changed = null;
    for (let dom = this.dom; dom; ) {
      if (dom.nodeType == 1) {
        if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
          i++;
        else if (!changed)
          changed = this.scrollTargets.slice(0, i);
        if (changed)
          changed.push(dom);
        dom = dom.assignedSlot || dom.parentNode;
      } else if (dom.nodeType == 11) {
        dom = dom.host;
      } else {
        break;
      }
    }
    if (i < this.scrollTargets.length && !changed)
      changed = this.scrollTargets.slice(0, i);
    if (changed) {
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      for (let dom of this.scrollTargets = changed)
        dom.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(f) {
    if (!this.active)
      return f();
    try {
      this.stop();
      return f();
    } finally {
      this.start();
      this.clear();
    }
  }
  start() {
    if (this.active)
      return;
    this.observer.observe(this.dom, observeOptions);
    this.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
    if (useCharData)
      this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
    this.active = true;
  }
  stop() {
    if (!this.active)
      return;
    this.active = false;
    this.observer.disconnect();
    this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
    if (useCharData)
      this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
  }
  clearSelection() {
    this.ignoreSelection.set(this.selectionRange);
  }
  clear() {
    this.observer.takeRecords();
    this.queue.length = 0;
    this.clearSelection();
  }
  flushSoon() {
    if (this.delayedFlush < 0)
      this.delayedFlush = window.setTimeout(() => {
        this.delayedFlush = -1;
        this.flush();
      }, 20);
  }
  forceFlush() {
    if (this.delayedFlush >= 0) {
      window.clearTimeout(this.delayedFlush);
      this.delayedFlush = -1;
      this.flush();
    }
  }
  flush() {
    if (this.delayedFlush >= 0)
      return;
    let records = this.queue;
    for (let mut of this.observer.takeRecords())
      records.push(mut);
    if (records.length)
      this.queue = [];
    let selection = this.selectionRange;
    let newSel = !this.ignoreSelection.eq(selection) && hasSelection(this.dom, selection);
    if (records.length == 0 && !newSel)
      return;
    let from = -1, to = -1, typeOver = false;
    for (let record of records) {
      let range = this.readMutation(record);
      if (!range)
        continue;
      if (range.typeOver)
        typeOver = true;
      if (from == -1) {
        ({from, to} = range);
      } else {
        from = Math.min(range.from, from);
        to = Math.max(range.to, to);
      }
    }
    let startState = this.view.state;
    if (from > -1 || newSel)
      this.onChange(from, to, typeOver);
    if (this.view.state == startState) {
      if (this.view.docView.dirty) {
        this.ignore(() => this.view.docView.sync());
        this.view.docView.dirty = 0;
      }
      this.view.docView.updateSelection();
    }
    this.clearSelection();
  }
  readMutation(rec) {
    let cView = this.view.docView.nearest(rec.target);
    if (!cView || cView.ignoreMutation(rec))
      return null;
    cView.markDirty();
    if (rec.type == "childList") {
      let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
      let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
      return {
        from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
        to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd,
        typeOver: false
      };
    } else {
      return {from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue};
    }
  }
  destroy() {
    this.stop();
    if (this.intersection)
      this.intersection.disconnect();
    for (let dom of this.scrollTargets)
      dom.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("scroll", this.onScroll);
    clearTimeout(this.parentCheck);
  }
};
function findChild(cView, dom, dir) {
  while (dom) {
    let curView = ContentView.get(dom);
    if (curView && curView.parent == cView)
      return curView;
    let parent = dom.parentNode;
    dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
  }
  return null;
}
function safariSelectionRangeHack(view) {
  let found = null;
  function read(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    found = event.getTargetRanges()[0];
  }
  view.contentDOM.addEventListener("beforeinput", read, true);
  document.execCommand("indent");
  view.contentDOM.removeEventListener("beforeinput", read, true);
  if (!found)
    return null;
  let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor);
  return isEquivalentPosition(curAnchor.node, curAnchor.offset, found.endContainer, found.endOffset) ? {
    anchorNode: found.endContainer,
    anchorOffset: found.endOffset,
    focusNode: found.startContainer,
    focusOffset: found.startOffset
  } : {
    anchorNode: found.startContainer,
    anchorOffset: found.startOffset,
    focusNode: found.endContainer,
    focusOffset: found.endOffset
  };
}
function applyDOMChange(view, start, end, typeOver) {
  let change, newSel;
  let sel = view.state.selection.main, bounds;
  if (start > -1 && (bounds = view.docView.domBoundsAround(start, end, 0))) {
    let {from, to} = bounds;
    let selPoints = view.docView.impreciseHead || view.docView.impreciseAnchor ? [] : selectionPoints(view);
    let reader = new DOMReader(selPoints, view);
    reader.readRange(bounds.startDOM, bounds.endDOM);
    newSel = selectionFromPoints(selPoints, from);
    let preferredPos = sel.from, preferredSide = null;
    if (view.inputState.lastKeyCode === 8 && view.inputState.lastKeyTime > Date.now() - 100 || browser.android && reader.text.length < to - from) {
      preferredPos = sel.to;
      preferredSide = "end";
    }
    let diff = findDiff(view.state.sliceDoc(from, to), reader.text, preferredPos - from, preferredSide);
    if (diff)
      change = {
        from: from + diff.from,
        to: from + diff.toA,
        insert: view.state.toText(reader.text.slice(diff.from, diff.toB))
      };
  } else if (view.hasFocus || !view.state.facet(editable)) {
    let domSel = view.observer.selectionRange;
    let {impreciseHead: iHead, impreciseAnchor: iAnchor} = view.docView;
    let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !contains(view.contentDOM, domSel.focusNode) ? view.state.selection.main.head : view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
    let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !contains(view.contentDOM, domSel.anchorNode) ? view.state.selection.main.anchor : view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
    if (head != sel.head || anchor != sel.anchor)
      newSel = EditorSelection.single(anchor, head);
  }
  if (!change && !newSel)
    return;
  if (!change && typeOver && !sel.empty && newSel && newSel.main.empty)
    change = {from: sel.from, to: sel.to, insert: view.state.doc.slice(sel.from, sel.to)};
  else if (change && change.from >= sel.from && change.to <= sel.to && (change.from != sel.from || change.to != sel.to) && sel.to - sel.from - (change.to - change.from) <= 4)
    change = {
      from: sel.from,
      to: sel.to,
      insert: view.state.doc.slice(sel.from, change.from).append(change.insert).append(view.state.doc.slice(change.to, sel.to))
    };
  if (change) {
    let startState = view.state;
    if (browser.android && (change.from == sel.from && change.to == sel.to && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view, "Enter", 13) || change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 && dispatchKey(view, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view, "Delete", 46)) || browser.ios && (view.inputState.lastIOSEnter > Date.now() - 225 && change.insert.lines > 1 && dispatchKey(view, "Enter", 13) || view.inputState.lastIOSBackspace > Date.now() - 225 && !change.insert.length && dispatchKey(view, "Backspace", 8)))
      return;
    let text = change.insert.toString();
    if (view.state.facet(inputHandler).some((h) => h(view, change.from, change.to, text)))
      return;
    if (view.inputState.composing >= 0)
      view.inputState.composing++;
    let tr;
    if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 && (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length)) {
      let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
      let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
      tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, void 0, view.state.lineBreak) + after));
    } else {
      let changes = startState.changes(change);
      tr = {
        changes,
        selection: newSel && !startState.selection.main.eq(newSel.main) && newSel.main.to <= changes.newLength ? startState.selection.replaceRange(newSel.main) : void 0
      };
    }
    view.dispatch(tr, {scrollIntoView: true, annotations: Transaction.userEvent.of("input")});
  } else if (newSel && !newSel.main.eq(sel)) {
    let scrollIntoView2 = false, annotations;
    if (view.inputState.lastSelectionTime > Date.now() - 50) {
      if (view.inputState.lastSelectionOrigin == "keyboardselection")
        scrollIntoView2 = true;
      else
        annotations = Transaction.userEvent.of(view.inputState.lastSelectionOrigin);
    }
    view.dispatch({selection: newSel, scrollIntoView: scrollIntoView2, annotations});
  }
}
function findDiff(a, b, preferredPos, preferredSide) {
  let minLen = Math.min(a.length, b.length);
  let from = 0;
  while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
    from++;
  if (from == minLen && a.length == b.length)
    return null;
  let toA = a.length, toB = b.length;
  while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
    toA--;
    toB--;
  }
  if (preferredSide == "end") {
    let adjust = Math.max(0, from - Math.min(toA, toB));
    preferredPos -= toA + adjust - from;
  }
  if (toA < from && a.length < b.length) {
    let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
    from -= move;
    toB = from + (toB - toA);
    toA = from;
  } else if (toB < from) {
    let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
    from -= move;
    toA = from + (toA - toB);
    toB = from;
  }
  return {from, toA, toB};
}
var DOMReader = class {
  constructor(points, view) {
    this.points = points;
    this.view = view;
    this.text = "";
    this.lineBreak = view.state.lineBreak;
  }
  readRange(start, end) {
    if (!start)
      return;
    let parent = start.parentNode;
    for (let cur2 = start; ; ) {
      this.findPointBefore(parent, cur2);
      this.readNode(cur2);
      let next = cur2.nextSibling;
      if (next == end)
        break;
      let view = ContentView.get(cur2), nextView = ContentView.get(next);
      if ((view ? view.breakAfter : isBlockElement(cur2)) || (nextView ? nextView.breakAfter : isBlockElement(next)) && !(cur2.nodeName == "BR" && !cur2.cmIgnore))
        this.text += this.lineBreak;
      cur2 = next;
    }
    this.findPointBefore(parent, end);
  }
  readNode(node) {
    if (node.cmIgnore)
      return;
    let view = ContentView.get(node);
    let fromView = view && view.overrideDOMText;
    let text;
    if (fromView != null)
      text = fromView.sliceString(0, void 0, this.lineBreak);
    else if (node.nodeType == 3)
      text = node.nodeValue;
    else if (node.nodeName == "BR")
      text = node.nextSibling ? this.lineBreak : "";
    else if (node.nodeType == 1)
      this.readRange(node.firstChild, null);
    if (text != null) {
      this.findPointIn(node, text.length);
      this.text += text;
      if (browser.chrome && this.view.inputState.lastKeyCode == 13 && !node.nextSibling && /\n\n$/.test(this.text))
        this.text = this.text.slice(0, -1);
    }
  }
  findPointBefore(node, next) {
    for (let point of this.points)
      if (point.node == node && node.childNodes[point.offset] == next)
        point.pos = this.text.length;
  }
  findPointIn(node, maxLen) {
    for (let point of this.points)
      if (point.node == node)
        point.pos = this.text.length + Math.min(point.offset, maxLen);
  }
};
function isBlockElement(node) {
  return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
}
var DOMPoint = class {
  constructor(node, offset) {
    this.node = node;
    this.offset = offset;
    this.pos = -1;
  }
};
function selectionPoints(view) {
  let result = [];
  if (view.root.activeElement != view.contentDOM)
    return result;
  let {anchorNode, anchorOffset, focusNode, focusOffset} = view.observer.selectionRange;
  if (anchorNode) {
    result.push(new DOMPoint(anchorNode, anchorOffset));
    if (focusNode != anchorNode || focusOffset != anchorOffset)
      result.push(new DOMPoint(focusNode, focusOffset));
  }
  return result;
}
function selectionFromPoints(points, base2) {
  if (points.length == 0)
    return null;
  let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
  return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base2, head + base2) : null;
}
function dispatchKey(view, name2, code) {
  let options = {key: name2, code: name2, keyCode: code, which: code, cancelable: true};
  let down = new KeyboardEvent("keydown", options);
  down.synthetic = true;
  view.contentDOM.dispatchEvent(down);
  let up = new KeyboardEvent("keyup", options);
  up.synthetic = true;
  view.contentDOM.dispatchEvent(up);
  return down.defaultPrevented || up.defaultPrevented;
}
var EditorView = class {
  constructor(config2 = {}) {
    this.plugins = [];
    this.editorAttrs = {};
    this.contentAttrs = {};
    this.bidiCache = [];
    this.updateState = 2;
    this.measureScheduled = -1;
    this.measureRequests = [];
    this.contentDOM = document.createElement("div");
    this.scrollDOM = document.createElement("div");
    this.scrollDOM.tabIndex = -1;
    this.scrollDOM.className = "cm-scroller";
    this.scrollDOM.appendChild(this.contentDOM);
    this.announceDOM = document.createElement("div");
    this.announceDOM.style.cssText = "position: absolute; top: -10000px";
    this.announceDOM.setAttribute("aria-live", "polite");
    this.dom = document.createElement("div");
    this.dom.appendChild(this.announceDOM);
    this.dom.appendChild(this.scrollDOM);
    this._dispatch = config2.dispatch || ((tr) => this.update([tr]));
    this.dispatch = this.dispatch.bind(this);
    this.root = config2.root || document;
    this.viewState = new ViewState(config2.state || EditorState.create());
    this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec).update(this));
    this.observer = new DOMObserver(this, (from, to, typeOver) => {
      applyDOMChange(this, from, to, typeOver);
    }, (event) => {
      this.inputState.runScrollHandlers(this, event);
      if (this.observer.intersecting)
        this.measure();
    });
    this.inputState = new InputState(this);
    this.docView = new DocView(this);
    this.mountStyles();
    this.updateAttrs();
    this.updateState = 0;
    ensureGlobalHandler();
    this.requestMeasure();
    if (config2.parent)
      config2.parent.appendChild(this.dom);
  }
  get state() {
    return this.viewState.state;
  }
  get viewport() {
    return this.viewState.viewport;
  }
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  get inView() {
    return this.viewState.inView;
  }
  get composing() {
    return this.inputState.composing > 0;
  }
  dispatch(...input) {
    this._dispatch(input.length == 1 && input[0] instanceof Transaction ? input[0] : this.state.update(...input));
  }
  update(transactions) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let redrawn = false, update;
    let state = this.state;
    for (let tr of transactions) {
      if (tr.startState != state)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      state = tr.state;
    }
    if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
      return this.setState(state);
    update = new ViewUpdate(this, state, transactions);
    try {
      this.updateState = 2;
      let scrollTo2 = transactions.some((tr) => tr.scrollIntoView) ? state.selection.main : null;
      this.viewState.update(update, scrollTo2);
      this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
      if (!update.empty)
        this.updatePlugins(update);
      redrawn = this.docView.update(update);
      if (this.state.facet(styleModule) != this.styleModules)
        this.mountStyles();
      this.updateAttrs();
      this.showAnnouncements(transactions);
    } finally {
      this.updateState = 0;
    }
    if (redrawn || scrollTo || this.viewState.mustEnforceCursorAssoc)
      this.requestMeasure();
    if (!update.empty)
      for (let listener of this.state.facet(updateListener))
        listener(update);
  }
  setState(newState) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    this.updateState = 2;
    try {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.viewState = new ViewState(newState);
      this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec).update(this));
      this.docView = new DocView(this);
      this.inputState.ensureHandlers(this);
      this.mountStyles();
      this.updateAttrs();
      this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    this.requestMeasure();
  }
  updatePlugins(update) {
    let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
    if (prevSpecs != specs) {
      let newPlugins = [];
      for (let spec of specs) {
        let found = prevSpecs.indexOf(spec);
        if (found < 0) {
          newPlugins.push(new PluginInstance(spec));
        } else {
          let plugin = this.plugins[found];
          plugin.mustUpdate = update;
          newPlugins.push(plugin);
        }
      }
      for (let plugin of this.plugins)
        if (plugin.mustUpdate != update)
          plugin.destroy(this);
      this.plugins = newPlugins;
      this.inputState.ensureHandlers(this);
    } else {
      for (let p of this.plugins)
        p.mustUpdate = update;
    }
    for (let i = 0; i < this.plugins.length; i++)
      this.plugins[i] = this.plugins[i].update(this);
  }
  measure() {
    if (this.measureScheduled > -1)
      cancelAnimationFrame(this.measureScheduled);
    this.measureScheduled = -1;
    let updated = null;
    try {
      for (let i = 0; ; i++) {
        this.updateState = 1;
        let changed = this.viewState.measure(this.docView, i > 0);
        let measuring = this.measureRequests;
        if (!changed && !measuring.length && this.viewState.scrollTo == null)
          break;
        this.measureRequests = [];
        if (i > 5) {
          console.warn("Viewport failed to stabilize");
          break;
        }
        let measured = measuring.map((m) => {
          try {
            return m.read(this);
          } catch (e) {
            logException(this.state, e);
            return BadMeasure;
          }
        });
        let update = new ViewUpdate(this, this.state);
        update.flags |= changed;
        if (!updated)
          updated = update;
        else
          updated.flags |= changed;
        this.updateState = 2;
        if (!update.empty)
          this.updatePlugins(update);
        this.updateAttrs();
        if (changed)
          this.docView.update(update);
        for (let i2 = 0; i2 < measuring.length; i2++)
          if (measured[i2] != BadMeasure) {
            try {
              measuring[i2].write(measured[i2], this);
            } catch (e) {
              logException(this.state, e);
            }
          }
        if (this.viewState.scrollTo) {
          this.docView.scrollPosIntoView(this.viewState.scrollTo.head, this.viewState.scrollTo.assoc);
          this.viewState.scrollTo = null;
        }
        if (!(changed & 4) && this.measureRequests.length == 0)
          break;
      }
    } finally {
      this.updateState = 0;
    }
    this.measureScheduled = -1;
    if (updated && !updated.empty)
      for (let listener of this.state.facet(updateListener))
        listener(updated);
  }
  get themeClasses() {
    return baseThemeID + " " + (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " + this.state.facet(theme);
  }
  updateAttrs() {
    let editorAttrs = combineAttrs(this.state.facet(editorAttributes), {
      class: "cm-editor cm-wrap" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    });
    updateAttrs(this.dom, this.editorAttrs, editorAttrs);
    this.editorAttrs = editorAttrs;
    let contentAttrs = combineAttrs(this.state.facet(contentAttributes), {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      contenteditable: String(this.state.facet(editable)),
      class: "cm-content",
      style: `${browser.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    });
    updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
    this.contentAttrs = contentAttrs;
  }
  showAnnouncements(trs) {
    let first = true;
    for (let tr of trs)
      for (let effect of tr.effects)
        if (effect.is(EditorView.announce)) {
          if (first)
            this.announceDOM.textContent = "";
          first = false;
          let div = this.announceDOM.appendChild(document.createElement("div"));
          div.textContent = effect.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(styleModule);
    StyleModule.mount(this.root, this.styleModules.concat(baseTheme).reverse());
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    if (this.updateState == 0 && this.measureScheduled > -1)
      this.measure();
  }
  requestMeasure(request) {
    if (this.measureScheduled < 0)
      this.measureScheduled = requestAnimationFrame(() => this.measure());
    if (request) {
      if (request.key != null)
        for (let i = 0; i < this.measureRequests.length; i++) {
          if (this.measureRequests[i].key === request.key) {
            this.measureRequests[i] = request;
            return;
          }
        }
      this.measureRequests.push(request);
    }
  }
  pluginField(field) {
    let result = [];
    for (let plugin of this.plugins)
      plugin.update(this).takeField(field, result);
    return result;
  }
  plugin(plugin) {
    for (let inst of this.plugins)
      if (inst.spec == plugin)
        return inst.update(this).value;
    return null;
  }
  blockAtHeight(height, docTop) {
    this.readMeasured();
    return this.viewState.blockAtHeight(height, ensureTop(docTop, this.contentDOM));
  }
  visualLineAtHeight(height, docTop) {
    this.readMeasured();
    return this.viewState.lineAtHeight(height, ensureTop(docTop, this.contentDOM));
  }
  viewportLines(f, docTop) {
    let {from, to} = this.viewport;
    this.viewState.forEachLine(from, to, f, ensureTop(docTop, this.contentDOM));
  }
  visualLineAt(pos, docTop = 0) {
    return this.viewState.lineAt(pos, docTop);
  }
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  moveByChar(start, forward, by) {
    return moveByChar(this, start, forward, by);
  }
  moveByGroup(start, forward) {
    return moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial));
  }
  moveToLineBoundary(start, forward, includeWrap = true) {
    return moveToLineBoundary(this, start, forward, includeWrap);
  }
  moveVertically(start, forward, distance) {
    return moveVertically(this, start, forward, distance);
  }
  scrollPosIntoView(pos) {
    this.viewState.scrollTo = EditorSelection.cursor(pos);
    this.requestMeasure();
  }
  domAtPos(pos) {
    return this.docView.domAtPos(pos);
  }
  posAtDOM(node, offset = 0) {
    return this.docView.posFromDOM(node, offset);
  }
  posAtCoords(coords) {
    this.readMeasured();
    return posAtCoords(this, coords);
  }
  coordsAtPos(pos, side = 1) {
    this.readMeasured();
    let rect = this.docView.coordsAt(pos, side);
    if (!rect || rect.left == rect.right)
      return rect;
    let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
    let span2 = order[BidiSpan.find(order, pos - line.from, -1, side)];
    return flattenRect(rect, span2.dir == Direction.LTR == side > 0);
  }
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  get textDirection() {
    return this.viewState.heightOracle.direction;
  }
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  bidiSpans(line) {
    if (line.length > MaxBidiLine)
      return trivialOrder(line.length);
    let dir = this.textDirection;
    for (let entry of this.bidiCache)
      if (entry.from == line.from && entry.dir == dir)
        return entry.order;
    let order = computeOrder(line.text, this.textDirection);
    this.bidiCache.push(new CachedOrder(line.from, line.to, dir, order));
    return order;
  }
  get hasFocus() {
    var _a;
    return (document.hasFocus() || browser.safari && ((_a = this.inputState) === null || _a === void 0 ? void 0 : _a.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  focus() {
    this.observer.ignore(() => {
      focusPreventScroll(this.contentDOM);
      this.docView.updateSelection();
    });
  }
  destroy() {
    for (let plugin of this.plugins)
      plugin.destroy(this);
    this.inputState.destroy();
    this.dom.remove();
    this.observer.destroy();
    if (this.measureScheduled > -1)
      cancelAnimationFrame(this.measureScheduled);
  }
  static domEventHandlers(handlers2) {
    return ViewPlugin.define(() => ({}), {eventHandlers: handlers2});
  }
  static theme(spec, options) {
    let prefix = StyleModule.newName();
    let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
    if (options && options.dark)
      result.push(darkTheme.of(true));
    return result;
  }
  static baseTheme(spec) {
    return Prec.fallback(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
  }
};
EditorView.styleModule = styleModule;
EditorView.inputHandler = inputHandler;
EditorView.exceptionSink = exceptionSink;
EditorView.updateListener = updateListener;
EditorView.editable = editable;
EditorView.mouseSelectionStyle = mouseSelectionStyle;
EditorView.dragMovesSelection = dragMovesSelection$1;
EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
EditorView.decorations = decorations;
EditorView.contentAttributes = contentAttributes;
EditorView.editorAttributes = editorAttributes;
EditorView.lineWrapping = /* @__PURE__ */ EditorView.contentAttributes.of({class: "cm-lineWrapping"});
EditorView.announce = /* @__PURE__ */ StateEffect.define();
var MaxBidiLine = 4096;
function ensureTop(given, dom) {
  return given == null ? dom.getBoundingClientRect().top : given;
}
var resizeDebounce = -1;
function ensureGlobalHandler() {
  window.addEventListener("resize", () => {
    if (resizeDebounce == -1)
      resizeDebounce = setTimeout(handleResize, 50);
  });
}
function handleResize() {
  resizeDebounce = -1;
  let found = document.querySelectorAll(".cm-content");
  for (let i = 0; i < found.length; i++) {
    let docView = ContentView.get(found[i]);
    if (docView)
      docView.editorView.requestMeasure();
  }
}
var BadMeasure = {};
var CachedOrder = class {
  constructor(from, to, dir, order) {
    this.from = from;
    this.to = to;
    this.dir = dir;
    this.order = order;
  }
  static update(cache, changes) {
    if (changes.empty)
      return cache;
    let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
    for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
      let entry = cache[i];
      if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
        result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.order));
    }
    return result;
  }
};
var currentPlatform = typeof navigator == "undefined" ? "key" : /* @__PURE__ */ /Mac/.test(navigator.platform) ? "mac" : /* @__PURE__ */ /Win/.test(navigator.platform) ? "win" : /* @__PURE__ */ /Linux|X11/.test(navigator.platform) ? "linux" : "key";
function normalizeKeyName(name2, platform) {
  const parts = name2.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result == "Space")
    result = " ";
  let alt, ctrl, shift2, meta2;
  for (let i = 0; i < parts.length - 1; ++i) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod))
      meta2 = true;
    else if (/^a(lt)?$/i.test(mod))
      alt = true;
    else if (/^(c|ctrl|control)$/i.test(mod))
      ctrl = true;
    else if (/^s(hift)?$/i.test(mod))
      shift2 = true;
    else if (/^mod$/i.test(mod)) {
      if (platform == "mac")
        meta2 = true;
      else
        ctrl = true;
    } else
      throw new Error("Unrecognized modifier name: " + mod);
  }
  if (alt)
    result = "Alt-" + result;
  if (ctrl)
    result = "Ctrl-" + result;
  if (meta2)
    result = "Meta-" + result;
  if (shift2)
    result = "Shift-" + result;
  return result;
}
function modifiers(name2, event, shift2) {
  if (event.altKey)
    name2 = "Alt-" + name2;
  if (event.ctrlKey)
    name2 = "Ctrl-" + name2;
  if (event.metaKey)
    name2 = "Meta-" + name2;
  if (shift2 !== false && event.shiftKey)
    name2 = "Shift-" + name2;
  return name2;
}
var handleKeyEvents = /* @__PURE__ */ EditorView.domEventHandlers({
  keydown(event, view) {
    return runHandlers(getKeymap(view.state), event, view, "editor");
  }
});
var keymap = /* @__PURE__ */ Facet.define({enables: handleKeyEvents});
var Keymaps = /* @__PURE__ */ new WeakMap();
function getKeymap(state) {
  let bindings = state.facet(keymap);
  let map = Keymaps.get(bindings);
  if (!map)
    Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
  return map;
}
var storedPrefix = null;
var PrefixTimeout = 4e3;
function buildKeymap(bindings, platform = currentPlatform) {
  let bound = Object.create(null);
  let isPrefix = Object.create(null);
  let checkPrefix = (name2, is) => {
    let current = isPrefix[name2];
    if (current == null)
      isPrefix[name2] = is;
    else if (current != is)
      throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
  };
  let add = (scope, key, command, preventDefault) => {
    let scopeObj = bound[scope] || (bound[scope] = Object.create(null));
    let parts = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
    for (let i = 1; i < parts.length; i++) {
      let prefix = parts.slice(0, i).join(" ");
      checkPrefix(prefix, true);
      if (!scopeObj[prefix])
        scopeObj[prefix] = {
          preventDefault: true,
          commands: [(view) => {
            let ourObj = storedPrefix = {view, prefix, scope};
            setTimeout(() => {
              if (storedPrefix == ourObj)
                storedPrefix = null;
            }, PrefixTimeout);
            return true;
          }]
        };
    }
    let full = parts.join(" ");
    checkPrefix(full, false);
    let binding = scopeObj[full] || (scopeObj[full] = {preventDefault: false, commands: []});
    binding.commands.push(command);
    if (preventDefault)
      binding.preventDefault = true;
  };
  for (let b of bindings) {
    let name2 = b[platform] || b.key;
    if (!name2)
      continue;
    for (let scope of b.scope ? b.scope.split(" ") : ["editor"]) {
      add(scope, name2, b.run, b.preventDefault);
      if (b.shift)
        add(scope, "Shift-" + name2, b.shift, b.preventDefault);
    }
  }
  return bound;
}
function runHandlers(map, event, view, scope) {
  let name2 = keyName(event), isChar = name2.length == 1 && name2 != " ";
  let prefix = "", fallthrough = false;
  if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
    prefix = storedPrefix.prefix + " ";
    if (fallthrough = modifierCodes.indexOf(event.keyCode) < 0)
      storedPrefix = null;
  }
  let runFor = (binding) => {
    if (binding) {
      for (let cmd2 of binding.commands)
        if (cmd2(view))
          return true;
      if (binding.preventDefault)
        fallthrough = true;
    }
    return false;
  };
  let scopeObj = map[scope], baseName;
  if (scopeObj) {
    if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)]))
      return true;
    if (isChar && (event.shiftKey || event.altKey || event.metaKey) && (baseName = base[event.keyCode]) && baseName != name2) {
      if (runFor(scopeObj[prefix + modifiers(baseName, event, true)]))
        return true;
    } else if (isChar && event.shiftKey) {
      if (runFor(scopeObj[prefix + modifiers(name2, event, true)]))
        return true;
    }
  }
  return fallthrough;
}
var CanHidePrimary = !browser.ios;
var themeSpec = {
  ".cm-line": {
    "& ::selection": {backgroundColor: "transparent !important"},
    "&::selection": {backgroundColor: "transparent !important"}
  }
};
if (CanHidePrimary)
  themeSpec[".cm-line"].caretColor = "transparent !important";
var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";

// ../../node_modules/@codemirror/tooltip/dist/index.js
var ios = typeof navigator != "undefined" && !/Edge\/(\d+)/.exec(navigator.userAgent) && /Apple Computer/.test(navigator.vendor) && (/Mobile\/\w+/.test(navigator.userAgent) || navigator.maxTouchPoints > 2);
var Outside = "-10000px";
var tooltipPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.inView = true;
    this.measureReq = {read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this};
    this.input = view.state.facet(showTooltip);
    this.tooltips = this.input.filter((t2) => t2);
    this.tooltipViews = this.tooltips.map((tp) => this.createTooltip(tp));
  }
  update(update) {
    let input = update.state.facet(showTooltip);
    if (input == this.input) {
      for (let t2 of this.tooltipViews)
        if (t2.update)
          t2.update(update);
    } else {
      let tooltips = input.filter((x) => x);
      let views = [];
      for (let i = 0; i < tooltips.length; i++) {
        let tip = tooltips[i], known = -1;
        if (!tip)
          continue;
        for (let i2 = 0; i2 < this.tooltips.length; i2++) {
          let other = this.tooltips[i2];
          if (other && other.create == tip.create)
            known = i2;
        }
        if (known < 0) {
          views[i] = this.createTooltip(tip);
        } else {
          let tooltipView = views[i] = this.tooltipViews[known];
          if (tooltipView.update)
            tooltipView.update(update);
        }
      }
      for (let t2 of this.tooltipViews)
        if (views.indexOf(t2) < 0)
          t2.dom.remove();
      this.input = input;
      this.tooltips = tooltips;
      this.tooltipViews = views;
      this.maybeMeasure();
    }
  }
  createTooltip(tooltip) {
    let tooltipView = tooltip.create(this.view);
    tooltipView.dom.classList.add("cm-tooltip");
    if (tooltip.class)
      tooltipView.dom.classList.add(tooltip.class);
    tooltipView.dom.style.top = Outside;
    this.view.dom.appendChild(tooltipView.dom);
    if (tooltipView.mount)
      tooltipView.mount(this.view);
    return tooltipView;
  }
  destroy() {
    for (let {dom} of this.tooltipViews)
      dom.remove();
  }
  readMeasure() {
    return {
      editor: this.view.dom.getBoundingClientRect(),
      pos: this.tooltips.map((t2) => this.view.coordsAtPos(t2.pos)),
      size: this.tooltipViews.map(({dom}) => dom.getBoundingClientRect()),
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    };
  }
  writeMeasure(measured) {
    let {editor} = measured;
    for (let i = 0; i < this.tooltipViews.length; i++) {
      let tooltip = this.tooltips[i], tView = this.tooltipViews[i], {dom} = tView;
      let pos = measured.pos[i], size = measured.size[i];
      if (!pos || pos.bottom <= editor.top || pos.top >= editor.bottom || pos.right <= editor.left || pos.left >= editor.right) {
        dom.style.top = Outside;
        continue;
      }
      let width = size.right - size.left, height = size.bottom - size.top;
      let left = this.view.textDirection == Direction.LTR ? Math.min(pos.left, measured.innerWidth - width) : Math.max(0, pos.left - width);
      let above = !!tooltip.above;
      if (!tooltip.strictSide && (above ? pos.top - (size.bottom - size.top) < 0 : pos.bottom + (size.bottom - size.top) > measured.innerHeight))
        above = !above;
      if (ios) {
        dom.style.top = (above ? pos.top - height : pos.bottom) - editor.top + "px";
        dom.style.left = left - editor.left + "px";
        dom.style.position = "absolute";
      } else {
        dom.style.top = (above ? pos.top - height : pos.bottom) + "px";
        dom.style.left = left + "px";
      }
      dom.classList.toggle("cm-tooltip-above", above);
      dom.classList.toggle("cm-tooltip-below", !above);
      if (tView.positioned)
        tView.positioned();
    }
  }
  maybeMeasure() {
    if (this.tooltips.length) {
      if (this.view.inView || this.inView)
        this.view.requestMeasure(this.measureReq);
      this.inView = this.view.inView;
    }
  }
}, {
  eventHandlers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
var baseTheme2 = EditorView.baseTheme({
  ".cm-tooltip": {
    position: "fixed",
    zIndex: 100
  },
  "&light .cm-tooltip": {
    border: "1px solid #ddd",
    backgroundColor: "#f5f5f5"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  }
});
var showTooltip = Facet.define({
  enables: [tooltipPlugin, baseTheme2]
});

// ../../node_modules/lezer-tree/dist/tree.es.js
var DefaultBufferLength = 1024;
var nextPropID = 0;
var CachedNode = new WeakMap();
var NodeProp = class {
  constructor({deserialize} = {}) {
    this.id = nextPropID++;
    this.deserialize = deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
  }
  static string() {
    return new NodeProp({deserialize: (str) => str});
  }
  static number() {
    return new NodeProp({deserialize: Number});
  }
  static flag() {
    return new NodeProp({deserialize: () => true});
  }
  set(propObj, value) {
    propObj[this.id] = value;
    return propObj;
  }
  add(match) {
    if (typeof match != "function")
      match = NodeType.match(match);
    return (type) => {
      let result = match(type);
      return result === void 0 ? null : [this, result];
    };
  }
};
NodeProp.closedBy = new NodeProp({deserialize: (str) => str.split(" ")});
NodeProp.openedBy = new NodeProp({deserialize: (str) => str.split(" ")});
NodeProp.group = new NodeProp({deserialize: (str) => str.split(" ")});
var noProps = Object.create(null);
var NodeType = class {
  constructor(name2, props, id2, flags = 0) {
    this.name = name2;
    this.props = props;
    this.id = id2;
    this.flags = flags;
  }
  static define(spec) {
    let props = spec.props && spec.props.length ? Object.create(null) : noProps;
    let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
    let type = new NodeType(spec.name || "", props, spec.id, flags);
    if (spec.props)
      for (let src of spec.props) {
        if (!Array.isArray(src))
          src = src(type);
        if (src)
          src[0].set(props, src[1]);
      }
    return type;
  }
  prop(prop) {
    return this.props[prop.id];
  }
  get isTop() {
    return (this.flags & 1) > 0;
  }
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  get isError() {
    return (this.flags & 4) > 0;
  }
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  is(name2) {
    if (typeof name2 == "string") {
      if (this.name == name2)
        return true;
      let group = this.prop(NodeProp.group);
      return group ? group.indexOf(name2) > -1 : false;
    }
    return this.id == name2;
  }
  static match(map) {
    let direct = Object.create(null);
    for (let prop in map)
      for (let name2 of prop.split(" "))
        direct[name2] = map[prop];
    return (node) => {
      for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
        let found = direct[i < 0 ? node.name : groups[i]];
        if (found)
          return found;
      }
    };
  }
};
NodeType.none = new NodeType("", Object.create(null), 0, 8);
var NodeSet = class {
  constructor(types2) {
    this.types = types2;
    for (let i = 0; i < types2.length; i++)
      if (types2[i].id != i)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  extend(...props) {
    let newTypes = [];
    for (let type of this.types) {
      let newProps = null;
      for (let source of props) {
        let add = source(type);
        if (add) {
          if (!newProps)
            newProps = Object.assign({}, type.props);
          add[0].set(newProps, add[1]);
        }
      }
      newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
    }
    return new NodeSet(newTypes);
  }
};
var Tree = class {
  constructor(type, children, positions, length) {
    this.type = type;
    this.children = children;
    this.positions = positions;
    this.length = length;
  }
  toString() {
    let children = this.children.map((c) => c.toString()).join();
    return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
  }
  cursor(pos, side = 0) {
    let scope = pos != null && CachedNode.get(this) || this.topNode;
    let cursor = new TreeCursor(scope);
    if (pos != null) {
      cursor.moveTo(pos, side);
      CachedNode.set(this, cursor._tree);
    }
    return cursor;
  }
  fullCursor() {
    return new TreeCursor(this.topNode, true);
  }
  get topNode() {
    return new TreeNode(this, 0, 0, null);
  }
  resolve(pos, side = 0) {
    return this.cursor(pos, side).node;
  }
  iterate(spec) {
    let {enter, leave, from = 0, to = this.length} = spec;
    for (let c = this.cursor(); ; ) {
      let mustLeave = false;
      if (c.from <= to && c.to >= from && (c.type.isAnonymous || enter(c.type, c.from, c.to) !== false)) {
        if (c.firstChild())
          continue;
        if (!c.type.isAnonymous)
          mustLeave = true;
      }
      for (; ; ) {
        if (mustLeave && leave)
          leave(c.type, c.from, c.to);
        mustLeave = c.type.isAnonymous;
        if (c.nextSibling())
          break;
        if (!c.parent())
          return;
        mustLeave = true;
      }
    }
  }
  balance(maxBufferLength = DefaultBufferLength) {
    return this.children.length <= BalanceBranchFactor ? this : balanceRange(this.type, NodeType.none, this.children, this.positions, 0, this.children.length, 0, maxBufferLength, this.length, 0);
  }
  static build(data2) {
    return buildTree(data2);
  }
};
Tree.empty = new Tree(NodeType.none, [], [], 0);
function withHash(tree, hash2) {
  if (hash2)
    tree.contextHash = hash2;
  return tree;
}
var TreeBuffer = class {
  constructor(buffer, length, set, type = NodeType.none) {
    this.buffer = buffer;
    this.length = length;
    this.set = set;
    this.type = type;
  }
  toString() {
    let result = [];
    for (let index = 0; index < this.buffer.length; ) {
      result.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result.join(",");
  }
  childString(index) {
    let id2 = this.buffer[index], endIndex = this.buffer[index + 3];
    let type = this.set.types[id2], result = type.name;
    if (/\W/.test(result) && !type.isError)
      result = JSON.stringify(result);
    index += 4;
    if (endIndex == index)
      return result;
    let children = [];
    while (index < endIndex) {
      children.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result + "(" + children.join(",") + ")";
  }
  findChild(startIndex, endIndex, dir, after) {
    let {buffer} = this, pick = -1;
    for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
      if (after != -1e8) {
        let start = buffer[i + 1], end = buffer[i + 2];
        if (dir > 0) {
          if (end > after)
            pick = i;
          if (end > after)
            break;
        } else {
          if (start < after)
            pick = i;
          if (end >= after)
            break;
        }
      } else {
        pick = i;
        if (dir > 0)
          break;
      }
    }
    return pick;
  }
};
var TreeNode = class {
  constructor(node, from, index, _parent) {
    this.node = node;
    this.from = from;
    this.index = index;
    this._parent = _parent;
  }
  get type() {
    return this.node.type;
  }
  get name() {
    return this.node.type.name;
  }
  get to() {
    return this.from + this.node.length;
  }
  nextChild(i, dir, after, full = false) {
    for (let parent = this; ; ) {
      for (let {children, positions} = parent.node, e = dir > 0 ? children.length : -1; i != e; i += dir) {
        let next = children[i], start = positions[i] + parent.from;
        if (after != -1e8 && (dir < 0 ? start >= after : start + next.length <= after))
          continue;
        if (next instanceof TreeBuffer) {
          let index = next.findChild(0, next.buffer.length, dir, after == -1e8 ? -1e8 : after - start);
          if (index > -1)
            return new BufferNode(new BufferContext(parent, next, i, start), null, index);
        } else if (full || (!next.type.isAnonymous || hasChild(next))) {
          let inner = new TreeNode(next, start, i, parent);
          return full || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, after);
        }
      }
      if (full || !parent.type.isAnonymous)
        return null;
      i = parent.index + dir;
      parent = parent._parent;
      if (!parent)
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(0, 1, -1e8);
  }
  get lastChild() {
    return this.nextChild(this.node.children.length - 1, -1, -1e8);
  }
  childAfter(pos) {
    return this.nextChild(0, 1, pos);
  }
  childBefore(pos) {
    return this.nextChild(this.node.children.length - 1, -1, pos);
  }
  nextSignificantParent() {
    let val = this;
    while (val.type.isAnonymous && val._parent)
      val = val._parent;
    return val;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent ? this._parent.nextChild(this.index + 1, 1, -1) : null;
  }
  get prevSibling() {
    return this._parent ? this._parent.nextChild(this.index - 1, -1, -1) : null;
  }
  get cursor() {
    return new TreeCursor(this);
  }
  resolve(pos, side = 0) {
    return this.cursor.moveTo(pos, side).node;
  }
  getChild(type, before = null, after = null) {
    let r = getChildren(this, type, before, after);
    return r.length ? r[0] : null;
  }
  getChildren(type, before = null, after = null) {
    return getChildren(this, type, before, after);
  }
  toString() {
    return this.node.toString();
  }
};
function getChildren(node, type, before, after) {
  let cur2 = node.cursor, result = [];
  if (!cur2.firstChild())
    return result;
  if (before != null) {
    while (!cur2.type.is(before))
      if (!cur2.nextSibling())
        return result;
  }
  for (; ; ) {
    if (after != null && cur2.type.is(after))
      return result;
    if (cur2.type.is(type))
      result.push(cur2.node);
    if (!cur2.nextSibling())
      return after == null ? result : [];
  }
}
var BufferContext = class {
  constructor(parent, buffer, index, start) {
    this.parent = parent;
    this.buffer = buffer;
    this.index = index;
    this.start = start;
  }
};
var BufferNode = class {
  constructor(context, _parent, index) {
    this.context = context;
    this._parent = _parent;
    this.index = index;
    this.type = context.buffer.set.types[context.buffer.buffer[index]];
  }
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  child(dir, after) {
    let {buffer} = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, after == -1e8 ? -1e8 : after - this.context.start);
    return index < 0 ? null : new BufferNode(this.context, this, index);
  }
  get firstChild() {
    return this.child(1, -1e8);
  }
  get lastChild() {
    return this.child(-1, -1e8);
  }
  childAfter(pos) {
    return this.child(1, pos);
  }
  childBefore(pos) {
    return this.child(-1, pos);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(dir) {
    return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, -1);
  }
  get nextSibling() {
    let {buffer} = this.context;
    let after = buffer.buffer[this.index + 3];
    if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
      return new BufferNode(this.context, this._parent, after);
    return this.externalSibling(1);
  }
  get prevSibling() {
    let {buffer} = this.context;
    let parentStart = this._parent ? this._parent.index + 4 : 0;
    if (this.index == parentStart)
      return this.externalSibling(-1);
    return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, -1e8));
  }
  get cursor() {
    return new TreeCursor(this);
  }
  resolve(pos, side = 0) {
    return this.cursor.moveTo(pos, side).node;
  }
  toString() {
    return this.context.buffer.childString(this.index);
  }
  getChild(type, before = null, after = null) {
    let r = getChildren(this, type, before, after);
    return r.length ? r[0] : null;
  }
  getChildren(type, before = null, after = null) {
    return getChildren(this, type, before, after);
  }
};
var TreeCursor = class {
  constructor(node, full = false) {
    this.full = full;
    this.buffer = null;
    this.stack = [];
    this.index = 0;
    this.bufferNode = null;
    if (node instanceof TreeNode) {
      this.yieldNode(node);
    } else {
      this._tree = node.context.parent;
      this.buffer = node.context;
      for (let n = node._parent; n; n = n._parent)
        this.stack.unshift(n.index);
      this.bufferNode = node;
      this.yieldBuf(node.index);
    }
  }
  get name() {
    return this.type.name;
  }
  yieldNode(node) {
    if (!node)
      return false;
    this._tree = node;
    this.type = node.type;
    this.from = node.from;
    this.to = node.to;
    return true;
  }
  yieldBuf(index, type) {
    this.index = index;
    let {start, buffer} = this.buffer;
    this.type = type || buffer.set.types[buffer.buffer[index]];
    this.from = start + buffer.buffer[index + 1];
    this.to = start + buffer.buffer[index + 2];
    return true;
  }
  yield(node) {
    if (!node)
      return false;
    if (node instanceof TreeNode) {
      this.buffer = null;
      return this.yieldNode(node);
    }
    this.buffer = node.context;
    return this.yieldBuf(node.index, node.type);
  }
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  enter(dir, after) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(dir < 0 ? this._tree.node.children.length - 1 : 0, dir, after, this.full));
    let {buffer} = this.buffer;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, after == -1e8 ? -1e8 : after - this.buffer.start);
    if (index < 0)
      return false;
    this.stack.push(this.index);
    return this.yieldBuf(index);
  }
  firstChild() {
    return this.enter(1, -1e8);
  }
  lastChild() {
    return this.enter(-1, -1e8);
  }
  childAfter(pos) {
    return this.enter(1, pos);
  }
  childBefore(pos) {
    return this.enter(-1, pos);
  }
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.full ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let parent = this.full ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    this.buffer = null;
    return this.yieldNode(parent);
  }
  sibling(dir) {
    if (!this.buffer)
      return !this._tree._parent ? false : this.yield(this._tree._parent.nextChild(this._tree.index + dir, dir, -1e8, this.full));
    let {buffer} = this.buffer, d = this.stack.length - 1;
    if (dir < 0) {
      let parentStart = d < 0 ? 0 : this.stack[d] + 4;
      if (this.index != parentStart)
        return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, -1e8));
    } else {
      let after = buffer.buffer[this.index + 3];
      if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
        return this.yieldBuf(after);
    }
    return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, -1e8, this.full)) : false;
  }
  nextSibling() {
    return this.sibling(1);
  }
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(dir) {
    let index, parent, {buffer} = this;
    if (buffer) {
      if (dir > 0) {
        if (this.index < buffer.buffer.buffer.length)
          return false;
      } else {
        for (let i = 0; i < this.index; i++)
          if (buffer.buffer.buffer[i + 3] < this.index)
            return false;
      }
      ({index, parent} = buffer);
    } else {
      ({index, _parent: parent} = this._tree);
    }
    for (; parent; {index, _parent: parent} = parent) {
      for (let i = index + dir, e = dir < 0 ? -1 : parent.node.children.length; i != e; i += dir) {
        let child = parent.node.children[i];
        if (this.full || !child.type.isAnonymous || child instanceof TreeBuffer || hasChild(child))
          return false;
      }
    }
    return true;
  }
  move(dir) {
    if (this.enter(dir, -1e8))
      return true;
    for (; ; ) {
      if (this.sibling(dir))
        return true;
      if (this.atLastNode(dir) || !this.parent())
        return false;
    }
  }
  next() {
    return this.move(1);
  }
  prev() {
    return this.move(-1);
  }
  moveTo(pos, side = 0) {
    while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
      if (!this.parent())
        break;
    for (; ; ) {
      if (side < 0 ? !this.childBefore(pos) : !this.childAfter(pos))
        break;
      if (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos)) {
        this.parent();
        break;
      }
    }
    return this;
  }
  get node() {
    if (!this.buffer)
      return this._tree;
    let cache = this.bufferNode, result = null, depth2 = 0;
    if (cache && cache.context == this.buffer) {
      scan:
        for (let index = this.index, d = this.stack.length; d >= 0; ) {
          for (let c = cache; c; c = c._parent)
            if (c.index == index) {
              if (index == this.index)
                return c;
              result = c;
              depth2 = d + 1;
              break scan;
            }
          index = this.stack[--d];
        }
    }
    for (let i = depth2; i < this.stack.length; i++)
      result = new BufferNode(this.buffer, result, this.stack[i]);
    return this.bufferNode = new BufferNode(this.buffer, result, this.index);
  }
  get tree() {
    return this.buffer ? null : this._tree.node;
  }
};
function hasChild(tree) {
  return tree.children.some((ch) => !ch.type.isAnonymous || ch instanceof TreeBuffer || hasChild(ch));
}
var FlatBufferCursor = class {
  constructor(buffer, index) {
    this.buffer = buffer;
    this.index = index;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new FlatBufferCursor(this.buffer, this.index);
  }
};
var BalanceBranchFactor = 8;
function buildTree(data2) {
  var _a;
  let {buffer, nodeSet, topID = 0, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length} = data2;
  let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
  let types2 = nodeSet.types;
  let contextHash = 0;
  function takeNode(parentStart, minPos, children2, positions2, inRepeat) {
    let {id: id2, start, end, size} = cursor;
    let startPos = start - parentStart;
    if (size < 0) {
      if (size == -1) {
        children2.push(reused[id2]);
        positions2.push(startPos);
      } else {
        contextHash = id2;
      }
      cursor.next();
      return;
    }
    let type = types2[id2], node, buffer2;
    if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
      let data3 = new Uint16Array(buffer2.size - buffer2.skip);
      let endPos = cursor.pos - buffer2.size, index = data3.length;
      while (cursor.pos > endPos)
        index = copyToBuffer(buffer2.start, data3, index, inRepeat);
      node = new TreeBuffer(data3, end - buffer2.start, nodeSet, inRepeat < 0 ? NodeType.none : types2[inRepeat]);
      startPos = buffer2.start - parentStart;
    } else {
      let endPos = cursor.pos - size;
      cursor.next();
      let localChildren = [], localPositions = [];
      let localInRepeat = id2 >= minRepeatType ? id2 : -1;
      while (cursor.pos > endPos) {
        if (cursor.id == localInRepeat)
          cursor.next();
        else
          takeNode(start, endPos, localChildren, localPositions, localInRepeat);
      }
      localChildren.reverse();
      localPositions.reverse();
      if (localInRepeat > -1 && localChildren.length > BalanceBranchFactor)
        node = balanceRange(type, type, localChildren, localPositions, 0, localChildren.length, 0, maxBufferLength, end - start, contextHash);
      else
        node = withHash(new Tree(type, localChildren, localPositions, end - start), contextHash);
    }
    children2.push(node);
    positions2.push(startPos);
  }
  function findBufferSize(maxSize, inRepeat) {
    let fork = cursor.fork();
    let size = 0, start = 0, skip2 = 0, minStart = fork.end - maxBufferLength;
    let result = {size: 0, start: 0, skip: 0};
    scan:
      for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
        if (fork.id == inRepeat) {
          result.size = size;
          result.start = start;
          result.skip = skip2;
          skip2 += 4;
          size += 4;
          fork.next();
          continue;
        }
        let nodeSize = fork.size, startPos = fork.pos - nodeSize;
        if (nodeSize < 0 || startPos < minPos || fork.start < minStart)
          break;
        let localSkipped = fork.id >= minRepeatType ? 4 : 0;
        let nodeStart3 = fork.start;
        fork.next();
        while (fork.pos > startPos) {
          if (fork.size < 0)
            break scan;
          if (fork.id >= minRepeatType)
            localSkipped += 4;
          fork.next();
        }
        start = nodeStart3;
        size += nodeSize;
        skip2 += localSkipped;
      }
    if (inRepeat < 0 || size == maxSize) {
      result.size = size;
      result.start = start;
      result.skip = skip2;
    }
    return result.size > 4 ? result : void 0;
  }
  function copyToBuffer(bufferStart, buffer2, index, inRepeat) {
    let {id: id2, start, end, size} = cursor;
    cursor.next();
    if (id2 == inRepeat)
      return index;
    let startIndex = index;
    if (size > 4) {
      let endPos = cursor.pos - (size - 4);
      while (cursor.pos > endPos)
        index = copyToBuffer(bufferStart, buffer2, index, inRepeat);
    }
    if (id2 < minRepeatType) {
      buffer2[--index] = startIndex;
      buffer2[--index] = end - bufferStart;
      buffer2[--index] = start - bufferStart;
      buffer2[--index] = id2;
    }
    return index;
  }
  let children = [], positions = [];
  while (cursor.pos > 0)
    takeNode(data2.start || 0, 0, children, positions, -1);
  let length = (_a = data2.length) !== null && _a !== void 0 ? _a : children.length ? positions[0] + children[0].length : 0;
  return new Tree(types2[topID], children.reverse(), positions.reverse(), length);
}
function balanceRange(outerType, innerType, children, positions, from, to, start, maxBufferLength, length, contextHash) {
  let localChildren = [], localPositions = [];
  if (length <= maxBufferLength) {
    for (let i = from; i < to; i++) {
      localChildren.push(children[i]);
      localPositions.push(positions[i] - start);
    }
  } else {
    let maxChild = Math.max(maxBufferLength, Math.ceil(length * 1.5 / BalanceBranchFactor));
    for (let i = from; i < to; ) {
      let groupFrom = i, groupStart = positions[i];
      i++;
      for (; i < to; i++) {
        let nextEnd = positions[i] + children[i].length;
        if (nextEnd - groupStart > maxChild)
          break;
      }
      if (i == groupFrom + 1) {
        let only = children[groupFrom];
        if (only instanceof Tree && only.type == innerType && only.length > maxChild << 1) {
          for (let j = 0; j < only.children.length; j++) {
            localChildren.push(only.children[j]);
            localPositions.push(only.positions[j] + groupStart - start);
          }
          continue;
        }
        localChildren.push(only);
      } else if (i == groupFrom + 1) {
        localChildren.push(children[groupFrom]);
      } else {
        let inner = balanceRange(innerType, innerType, children, positions, groupFrom, i, groupStart, maxBufferLength, positions[i - 1] + children[i - 1].length - groupStart, contextHash);
        if (innerType != NodeType.none && !containsType(inner.children, innerType))
          inner = withHash(new Tree(NodeType.none, inner.children, inner.positions, inner.length), contextHash);
        localChildren.push(inner);
      }
      localPositions.push(groupStart - start);
    }
  }
  return withHash(new Tree(outerType, localChildren, localPositions, length), contextHash);
}
function containsType(nodes, type) {
  for (let elt2 of nodes)
    if (elt2.type == type)
      return true;
  return false;
}
var TreeFragment = class {
  constructor(from, to, tree, offset, open) {
    this.from = from;
    this.to = to;
    this.tree = tree;
    this.offset = offset;
    this.open = open;
  }
  get openStart() {
    return (this.open & 1) > 0;
  }
  get openEnd() {
    return (this.open & 2) > 0;
  }
  static applyChanges(fragments, changes, minGap = 128) {
    if (!changes.length)
      return fragments;
    let result = [];
    let fI = 1, nextF = fragments.length ? fragments[0] : null;
    let cI = 0, pos = 0, off = 0;
    for (; ; ) {
      let nextC = cI < changes.length ? changes[cI++] : null;
      let nextPos = nextC ? nextC.fromA : 1e9;
      if (nextPos - pos >= minGap)
        while (nextF && nextF.from < nextPos) {
          let cut = nextF;
          if (pos >= cut.from || nextPos <= cut.to || off) {
            let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
            cut = fFrom >= fTo ? null : new TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, (cI > 0 ? 1 : 0) | (nextC ? 2 : 0));
          }
          if (cut)
            result.push(cut);
          if (nextF.to > nextPos)
            break;
          nextF = fI < fragments.length ? fragments[fI++] : null;
        }
      if (!nextC)
        break;
      pos = nextC.toA;
      off = nextC.toA - nextC.toB;
    }
    return result;
  }
  static addTree(tree, fragments = [], partial = false) {
    let result = [new TreeFragment(0, tree.length, tree, 0, partial ? 2 : 0)];
    for (let f of fragments)
      if (f.to > tree.length)
        result.push(f);
    return result;
  }
};
function stringInput(input) {
  return new StringInput(input);
}
var StringInput = class {
  constructor(string2, length = string2.length) {
    this.string = string2;
    this.length = length;
  }
  get(pos) {
    return pos < 0 || pos >= this.length ? -1 : this.string.charCodeAt(pos);
  }
  lineAfter(pos) {
    if (pos < 0)
      return "";
    let end = this.string.indexOf("\n", pos);
    return this.string.slice(pos, end < 0 ? this.length : Math.min(end, this.length));
  }
  read(from, to) {
    return this.string.slice(from, Math.min(this.length, to));
  }
  clip(at) {
    return new StringInput(this.string, at);
  }
};

// ../../node_modules/@codemirror/language/dist/index.js
var languageDataProp = new NodeProp();
function defineLanguageFacet(baseData) {
  return Facet.define({
    combine: baseData ? (values2) => values2.concat(baseData) : void 0
  });
}
var Language = class {
  constructor(data2, parser5, topNode, extraExtensions = []) {
    this.data = data2;
    this.topNode = topNode;
    if (!EditorState.prototype.hasOwnProperty("tree"))
      Object.defineProperty(EditorState.prototype, "tree", {get() {
        return syntaxTree(this);
      }});
    this.parser = parser5;
    this.extension = [
      language.of(this),
      EditorState.languageData.of((state, pos) => state.facet(languageDataFacetAt(state, pos)))
    ].concat(extraExtensions);
  }
  isActiveAt(state, pos) {
    return languageDataFacetAt(state, pos) == this.data;
  }
  findRegions(state) {
    let lang = state.facet(language);
    if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
      return [{from: 0, to: state.doc.length}];
    if (!lang || !lang.allowsNesting)
      return [];
    let result = [];
    syntaxTree(state).iterate({
      enter: (type, from, to) => {
        if (type.isTop && type.prop(languageDataProp) == this.data) {
          result.push({from, to});
          return false;
        }
        return void 0;
      }
    });
    return result;
  }
  get allowsNesting() {
    return true;
  }
  parseString(code) {
    let doc2 = Text.of(code.split("\n"));
    let parse = this.parser.startParse(new DocInput(doc2), 0, new EditorParseContext(this.parser, EditorState.create({doc: doc2}), [], Tree.empty, {from: 0, to: code.length}, [], null));
    let tree;
    while (!(tree = parse.advance())) {
    }
    return tree;
  }
};
Language.setState = StateEffect.define();
function languageDataFacetAt(state, pos) {
  let topLang = state.facet(language);
  if (!topLang)
    return null;
  if (!topLang.allowsNesting)
    return topLang.data;
  let tree = syntaxTree(state);
  let target = tree.resolve(pos, -1);
  while (target) {
    let facet = target.type.prop(languageDataProp);
    if (facet)
      return facet;
    target = target.parent;
  }
  return topLang.data;
}
var LezerLanguage = class extends Language {
  constructor(data2, parser5) {
    super(data2, parser5, parser5.topNode);
    this.parser = parser5;
  }
  static define(spec) {
    let data2 = defineLanguageFacet(spec.languageData);
    return new LezerLanguage(data2, spec.parser.configure({
      props: [languageDataProp.add((type) => type.isTop ? data2 : void 0)]
    }));
  }
  configure(options) {
    return new LezerLanguage(this.data, this.parser.configure(options));
  }
  get allowsNesting() {
    return this.parser.hasNested;
  }
};
function syntaxTree(state) {
  let field = state.field(Language.state, false);
  return field ? field.tree : Tree.empty;
}
var DocInput = class {
  constructor(doc2, length = doc2.length) {
    this.doc = doc2;
    this.length = length;
    this.cursorPos = 0;
    this.string = "";
    this.prevString = "";
    this.cursor = doc2.iter();
  }
  syncTo(pos) {
    if (pos < this.cursorPos) {
      this.cursor = this.doc.iter();
      this.cursorPos = 0;
    }
    this.prevString = pos == this.cursorPos ? this.string : "";
    this.string = this.cursor.next(pos - this.cursorPos).value;
    this.cursorPos = pos + this.string.length;
    return this.cursorPos - this.string.length;
  }
  get(pos) {
    if (pos >= this.length)
      return -1;
    let stringStart = this.cursorPos - this.string.length;
    if (pos < stringStart || pos >= this.cursorPos) {
      if (pos < stringStart && pos >= stringStart - this.prevString.length)
        return this.prevString.charCodeAt(pos - (stringStart - this.prevString.length));
      stringStart = this.syncTo(pos);
    }
    return this.string.charCodeAt(pos - stringStart);
  }
  lineAfter(pos) {
    if (pos >= this.length || pos < 0)
      return "";
    let stringStart = this.cursorPos - this.string.length;
    if (pos < stringStart || pos >= this.cursorPos)
      stringStart = this.syncTo(pos);
    return this.cursor.lineBreak ? "" : this.string.slice(pos - stringStart, Math.min(this.length - stringStart, this.string.length));
  }
  read(from, to) {
    let stringStart = this.cursorPos - this.string.length;
    if (from < stringStart || to >= this.cursorPos)
      return this.doc.sliceString(from, to);
    else
      return this.string.slice(from - stringStart, to - stringStart);
  }
  clip(at) {
    return new DocInput(this.doc, at);
  }
};
var EditorParseContext = class {
  constructor(parser5, state, fragments = [], tree, viewport, skipped, scheduleOn) {
    this.parser = parser5;
    this.state = state;
    this.fragments = fragments;
    this.tree = tree;
    this.viewport = viewport;
    this.skipped = skipped;
    this.scheduleOn = scheduleOn;
    this.parse = null;
    this.tempSkipped = [];
  }
  work(time, upto) {
    if (this.tree != Tree.empty && (upto == null ? this.tree.length == this.state.doc.length : this.tree.length >= upto)) {
      this.takeTree();
      return true;
    }
    if (!this.parse)
      this.parse = this.parser.startParse(new DocInput(this.state.doc), 0, this);
    let endTime = Date.now() + time;
    for (; ; ) {
      let done = this.parse.advance();
      if (done) {
        this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done));
        this.parse = null;
        this.tree = done;
        return true;
      } else if (upto != null && this.parse.pos >= upto) {
        this.takeTree();
        return true;
      }
      if (Date.now() > endTime)
        return false;
    }
  }
  takeTree() {
    if (this.parse && this.parse.pos > this.tree.length) {
      this.tree = this.parse.forceFinish();
      this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
    }
  }
  withoutTempSkipped(fragments) {
    for (let r; r = this.tempSkipped.pop(); )
      fragments = cutFragments(fragments, r.from, r.to);
    return fragments;
  }
  changes(changes, newState) {
    let {fragments, tree, viewport, skipped} = this;
    this.takeTree();
    if (!changes.empty) {
      let ranges = [];
      changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({fromA, toA, fromB, toB}));
      fragments = TreeFragment.applyChanges(fragments, ranges);
      tree = Tree.empty;
      viewport = {from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1)};
      if (this.skipped.length) {
        skipped = [];
        for (let r of this.skipped) {
          let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
          if (from < to)
            skipped.push({from, to});
        }
      }
    }
    return new EditorParseContext(this.parser, newState, fragments, tree, viewport, skipped, this.scheduleOn);
  }
  updateViewport(viewport) {
    this.viewport = viewport;
    let startLen = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let {from, to} = this.skipped[i];
      if (from < viewport.to && to > viewport.from) {
        this.fragments = cutFragments(this.fragments, from, to);
        this.skipped.splice(i--, 1);
      }
    }
    return this.skipped.length < startLen;
  }
  reset() {
    if (this.parse) {
      this.takeTree();
      this.parse = null;
    }
  }
  skipUntilInView(from, to) {
    this.skipped.push({from, to});
  }
  static getSkippingParser(until) {
    return {
      startParse(input, startPos, context) {
        return {
          pos: startPos,
          advance() {
            let ecx = context;
            ecx.tempSkipped.push({from: startPos, to: input.length});
            if (until)
              ecx.scheduleOn = ecx.scheduleOn ? Promise.all([ecx.scheduleOn, until]) : until;
            this.pos = input.length;
            return new Tree(NodeType.none, [], [], input.length - startPos);
          },
          forceFinish() {
            return this.advance();
          }
        };
      }
    };
  }
  movedPast(pos) {
    return this.tree.length < pos && this.parse && this.parse.pos >= pos;
  }
};
EditorParseContext.skippingParser = EditorParseContext.getSkippingParser();
function cutFragments(fragments, from, to) {
  return TreeFragment.applyChanges(fragments, [{fromA: from, toA: to, fromB: from, toB: to}]);
}
var LanguageState = class {
  constructor(context) {
    this.context = context;
    this.tree = context.tree;
  }
  apply(tr) {
    if (!tr.docChanged)
      return this;
    let newCx = this.context.changes(tr.changes, tr.state);
    let upto = this.context.tree.length == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.tree.length), newCx.viewport.to);
    if (!newCx.work(25, upto))
      newCx.takeTree();
    return new LanguageState(newCx);
  }
  static init(state) {
    let parseState = new EditorParseContext(state.facet(language).parser, state, [], Tree.empty, {from: 0, to: state.doc.length}, [], null);
    if (!parseState.work(25))
      parseState.takeTree();
    return new LanguageState(parseState);
  }
};
Language.state = StateField.define({
  create: LanguageState.init,
  update(value, tr) {
    for (let e of tr.effects)
      if (e.is(Language.setState))
        return e.value;
    if (tr.startState.facet(language) != tr.state.facet(language))
      return LanguageState.init(tr.state);
    return value.apply(tr);
  }
});
var requestIdle = typeof window != "undefined" && window.requestIdleCallback || ((callback, {timeout}) => setTimeout(callback, timeout));
var cancelIdle = typeof window != "undefined" && window.cancelIdleCallback || clearTimeout;
var parseWorker = ViewPlugin.fromClass(class ParseWorker {
  constructor(view) {
    this.view = view;
    this.working = -1;
    this.chunkEnd = -1;
    this.chunkBudget = -1;
    this.work = this.work.bind(this);
    this.scheduleWork();
  }
  update(update) {
    let cx = this.view.state.field(Language.state).context;
    if (update.viewportChanged) {
      if (cx.updateViewport(update.view.viewport))
        cx.reset();
      if (this.view.viewport.to > cx.tree.length)
        this.scheduleWork();
    }
    if (update.docChanged) {
      if (this.view.hasFocus)
        this.chunkBudget += 50;
      this.scheduleWork();
    }
    this.checkAsyncSchedule(cx);
  }
  scheduleWork(force = false) {
    if (this.working > -1)
      return;
    let {state} = this.view, field = state.field(Language.state);
    if (!force && field.tree.length >= state.doc.length)
      return;
    this.working = requestIdle(this.work, {timeout: 500});
  }
  work(deadline) {
    this.working = -1;
    let now = Date.now();
    if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) {
      this.chunkEnd = now + 3e4;
      this.chunkBudget = 3e3;
    }
    if (this.chunkBudget <= 0)
      return;
    let {state, viewport: {to: vpTo}} = this.view, field = state.field(Language.state);
    if (field.tree.length >= vpTo + 1e6)
      return;
    let time = Math.min(this.chunkBudget, deadline ? Math.max(25, deadline.timeRemaining()) : 100);
    let done = field.context.work(time, vpTo + 1e6);
    this.chunkBudget -= Date.now() - now;
    if (done || this.chunkBudget <= 0 || field.context.movedPast(vpTo)) {
      field.context.takeTree();
      this.view.dispatch({effects: Language.setState.of(new LanguageState(field.context))});
    }
    if (!done && this.chunkBudget > 0)
      this.scheduleWork();
    this.checkAsyncSchedule(field.context);
  }
  checkAsyncSchedule(cx) {
    if (cx.scheduleOn) {
      cx.scheduleOn.then(() => this.scheduleWork(true));
      cx.scheduleOn = null;
    }
  }
  destroy() {
    if (this.working >= 0)
      cancelIdle(this.working);
  }
}, {
  eventHandlers: {focus() {
    this.scheduleWork();
  }}
});
var language = Facet.define({
  combine(languages) {
    return languages.length ? languages[0] : null;
  },
  enables: [Language.state, parseWorker]
});
var LanguageSupport = class {
  constructor(language2, support = []) {
    this.language = language2;
    this.support = support;
    this.extension = [language2, support];
  }
};
var LanguageDescription = class {
  constructor(name2, alias, extensions, filename, loadFunc) {
    this.name = name2;
    this.alias = alias;
    this.extensions = extensions;
    this.filename = filename;
    this.loadFunc = loadFunc;
    this.support = void 0;
    this.loading = null;
  }
  load() {
    return this.loading || (this.loading = this.loadFunc().then((support) => this.support = support, (err) => {
      this.loading = null;
      throw err;
    }));
  }
  static of(spec) {
    return new LanguageDescription(spec.name, (spec.alias || []).concat(spec.name).map((s) => s.toLowerCase()), spec.extensions || [], spec.filename, spec.load);
  }
  static matchFilename(descs, filename) {
    for (let d of descs)
      if (d.filename && d.filename.test(filename))
        return d;
    let ext = /\.([^.]+)$/.exec(filename);
    if (ext) {
      for (let d of descs)
        if (d.extensions.indexOf(ext[1]) > -1)
          return d;
    }
    return null;
  }
  static matchLanguageName(descs, name2, fuzzy = true) {
    name2 = name2.toLowerCase();
    for (let d of descs)
      if (d.alias.some((a) => a == name2))
        return d;
    if (fuzzy)
      for (let d of descs)
        for (let a of d.alias) {
          let found = name2.indexOf(a);
          if (found > -1 && (a.length > 2 || !/\w/.test(name2[found - 1]) && !/\w/.test(name2[found + a.length])))
            return d;
        }
    return null;
  }
};
var indentService = Facet.define();
var indentUnit = Facet.define({
  combine: (values2) => {
    if (!values2.length)
      return "  ";
    if (!/^(?: +|\t+)$/.test(values2[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(values2[0]));
    return values2[0];
  }
});
function getIndentUnit(state) {
  let unit = state.facet(indentUnit);
  return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
}
function indentString(state, cols) {
  let result = "", ts = state.tabSize;
  if (state.facet(indentUnit).charCodeAt(0) == 9)
    while (cols >= ts) {
      result += "	";
      cols -= ts;
    }
  for (let i = 0; i < cols; i++)
    result += " ";
  return result;
}
function getIndentation(context, pos) {
  if (context instanceof EditorState)
    context = new IndentContext(context);
  for (let service of context.state.facet(indentService)) {
    let result = service(context, pos);
    if (result != null)
      return result;
  }
  let tree = syntaxTree(context.state);
  return tree ? syntaxIndentation(context, tree, pos) : null;
}
var IndentContext = class {
  constructor(state, options = {}) {
    this.state = state;
    this.options = options;
    this.unit = getIndentUnit(state);
  }
  textAfterPos(pos) {
    var _a, _b;
    let sim = (_a = this.options) === null || _a === void 0 ? void 0 : _a.simulateBreak;
    if (pos == sim && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.simulateDoubleBreak))
      return "";
    return this.state.sliceDoc(pos, Math.min(pos + 100, sim != null && sim > pos ? sim : 1e9, this.state.doc.lineAt(pos).to));
  }
  column(pos) {
    var _a;
    let line = this.state.doc.lineAt(pos), text = line.text.slice(0, pos - line.from);
    let result = this.countColumn(text, pos - line.from);
    let override = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideIndentation) ? this.options.overrideIndentation(line.from) : -1;
    if (override > -1)
      result += override - this.countColumn(text, text.search(/\S/));
    return result;
  }
  countColumn(line, pos) {
    return countColumn(pos < 0 ? line : line.slice(0, pos), 0, this.state.tabSize);
  }
  lineIndent(line) {
    var _a;
    let override = (_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideIndentation;
    if (override) {
      let overriden = override(line.from);
      if (overriden > -1)
        return overriden;
    }
    return this.countColumn(line.text, line.text.search(/\S/));
  }
};
var indentNodeProp = new NodeProp();
function syntaxIndentation(cx, ast, pos) {
  let tree = ast.resolve(pos);
  for (let scan = tree, scanPos = pos; ; ) {
    let last = scan.childBefore(scanPos);
    if (!last)
      break;
    if (last.type.isError && last.from == last.to) {
      tree = scan;
      scanPos = last.from;
    } else {
      scan = last;
      scanPos = scan.to + 1;
    }
  }
  return indentFrom(tree, pos, cx);
}
function ignoreClosed(cx) {
  var _a, _b;
  return cx.pos == ((_a = cx.options) === null || _a === void 0 ? void 0 : _a.simulateBreak) && ((_b = cx.options) === null || _b === void 0 ? void 0 : _b.simulateDoubleBreak);
}
function indentStrategy(tree) {
  let strategy = tree.type.prop(indentNodeProp);
  if (strategy)
    return strategy;
  let first = tree.firstChild, close;
  if (first && (close = first.type.prop(NodeProp.closedBy))) {
    let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
    return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last.from : void 0);
  }
  return tree.parent == null ? topIndent : null;
}
function indentFrom(node, pos, base2) {
  for (; node; node = node.parent) {
    let strategy = indentStrategy(node);
    if (strategy)
      return strategy(new TreeIndentContext(base2, pos, node));
  }
  return null;
}
function topIndent() {
  return 0;
}
var TreeIndentContext = class extends IndentContext {
  constructor(base2, pos, node) {
    super(base2.state, base2.options);
    this.base = base2;
    this.pos = pos;
    this.node = node;
  }
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  get baseIndent() {
    let line = this.state.doc.lineAt(this.node.from);
    for (; ; ) {
      let atBreak = this.node.resolve(line.from);
      while (atBreak.parent && atBreak.parent.from == atBreak.from)
        atBreak = atBreak.parent;
      if (isParent(atBreak, this.node))
        break;
      line = this.state.doc.lineAt(atBreak.from);
    }
    return this.lineIndent(line);
  }
  continue() {
    let parent = this.node.parent;
    return parent ? indentFrom(parent, this.pos, this.base) : 0;
  }
};
function isParent(parent, of) {
  for (let cur2 = of; cur2; cur2 = cur2.parent)
    if (parent == cur2)
      return true;
  return false;
}
function bracketedAligned(context) {
  var _a;
  let tree = context.node;
  let openToken = tree.childAfter(tree.from), last = tree.lastChild;
  if (!openToken)
    return null;
  let sim = (_a = context.options) === null || _a === void 0 ? void 0 : _a.simulateBreak;
  let openLine = context.state.doc.lineAt(openToken.from);
  let lineEnd2 = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
  for (let pos = openToken.to; ; ) {
    let next = tree.childAfter(pos);
    if (!next || next == last)
      return null;
    if (!next.type.isSkipped)
      return next.from < lineEnd2 ? openToken : null;
    pos = next.to;
  }
}
function delimitedIndent({closing: closing2, align = true, units = 1}) {
  return (context) => delimitedStrategy(context, align, units, closing2);
}
function delimitedStrategy(context, align, units, closing2, closedAt) {
  let after = context.textAfter, space4 = after.match(/^\s*/)[0].length;
  let closed = closing2 && after.slice(space4, space4 + closing2.length) == closing2 || closedAt == context.pos + space4;
  let aligned = align ? bracketedAligned(context) : null;
  if (aligned)
    return closed ? context.column(aligned.from) : context.column(aligned.to);
  return context.baseIndent + (closed ? 0 : context.unit * units);
}
var flatIndent = (context) => context.baseIndent;
function continuedIndent({except, units = 1} = {}) {
  return (context) => {
    let matchExcept = except && except.test(context.textAfter);
    return context.baseIndent + (matchExcept ? 0 : units * context.unit);
  };
}
var foldService = Facet.define();
var foldNodeProp = new NodeProp();
function foldInside(node) {
  let first = node.firstChild, last = node.lastChild;
  return first && first.to < last.from ? {from: first.to, to: last.type.isError ? node.to : last.from} : null;
}
function syntaxFolding(state, start, end) {
  let tree = syntaxTree(state);
  if (tree.length == 0)
    return null;
  let inner = tree.resolve(end);
  let found = null;
  for (let cur2 = inner; cur2; cur2 = cur2.parent) {
    if (cur2.to <= end || cur2.from > end)
      continue;
    if (found && cur2.from < start)
      break;
    let prop = cur2.type.prop(foldNodeProp);
    if (prop) {
      let value = prop(cur2, state);
      if (value && value.from <= end && value.from >= start && value.to > end)
        found = value;
    }
  }
  return found;
}
function foldable(state, lineStart, lineEnd2) {
  for (let service of state.facet(foldService)) {
    let result = service(state, lineStart, lineEnd2);
    if (result)
      return result;
  }
  return syntaxFolding(state, lineStart, lineEnd2);
}

// ../../node_modules/@codemirror/autocomplete/dist/index.js
var CompletionContext = class {
  constructor(state, pos, explicit) {
    this.state = state;
    this.pos = pos;
    this.explicit = explicit;
    this.abortListeners = [];
  }
  tokenBefore(types2) {
    let token = syntaxTree(this.state).resolve(this.pos, -1);
    while (token && types2.indexOf(token.name) < 0)
      token = token.parent;
    return token ? {
      from: token.from,
      to: this.pos,
      text: this.state.sliceDoc(token.from, this.pos),
      type: token.type
    } : null;
  }
  matchBefore(expr) {
    let line = this.state.doc.lineAt(this.pos);
    let start = Math.max(line.from, this.pos - 250);
    let str = line.text.slice(start - line.from, this.pos - line.from);
    let found = str.search(ensureAnchor(expr, false));
    return found < 0 ? null : {from: start + found, to: this.pos, text: str.slice(found)};
  }
  get aborted() {
    return this.abortListeners == null;
  }
  addEventListener(type, listener) {
    if (type == "abort" && this.abortListeners)
      this.abortListeners.push(listener);
  }
};
function toSet(chars) {
  let flat = Object.keys(chars).join("");
  let words = /\w/.test(flat);
  if (words)
    flat = flat.replace(/\w/g, "");
  return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
  let first = Object.create(null), rest = Object.create(null);
  for (let {label} of options) {
    first[label[0]] = true;
    for (let i = 1; i < label.length; i++)
      rest[label[i]] = true;
  }
  let source = toSet(first) + toSet(rest) + "*$";
  return [new RegExp("^" + source), new RegExp(source)];
}
function completeFromList(list) {
  let options = list.map((o) => typeof o == "string" ? {label: o} : o);
  let [span2, match] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
  return (context) => {
    let token = context.matchBefore(match);
    return token || context.explicit ? {from: token ? token.from : context.pos, options, span: span2} : null;
  };
}
function ifNotIn(nodes, source) {
  return (context) => {
    for (let pos = syntaxTree(context.state).resolve(context.pos, -1); pos; pos = pos.parent)
      if (nodes.indexOf(pos.name) > -1)
        return null;
    return source(context);
  };
}
var Option = class {
  constructor(completion, source, match) {
    this.completion = completion;
    this.source = source;
    this.match = match;
  }
};
function cur(state) {
  return state.selection.main.head;
}
function ensureAnchor(expr, start) {
  var _a;
  let {source} = expr;
  let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
  if (!addStart && !addEnd)
    return expr;
  return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a = expr.flags) !== null && _a !== void 0 ? _a : expr.ignoreCase ? "i" : "");
}
function applyCompletion(view, option) {
  let apply = option.completion.apply || option.completion.label;
  let result = option.source;
  if (typeof apply == "string") {
    view.dispatch({
      changes: {from: result.from, to: result.to, insert: apply},
      selection: {anchor: result.from + apply.length}
    });
  } else {
    apply(view, option.completion, result.from, result.to);
  }
}
var SourceCache = /* @__PURE__ */ new WeakMap();
function asSource(source) {
  if (!Array.isArray(source))
    return source;
  let known = SourceCache.get(source);
  if (!known)
    SourceCache.set(source, known = completeFromList(source));
  return known;
}
var FuzzyMatcher = class {
  constructor(pattern) {
    this.pattern = pattern;
    this.chars = [];
    this.folded = [];
    this.any = [];
    this.precise = [];
    this.byWord = [];
    for (let p = 0; p < pattern.length; ) {
      let char = codePointAt(pattern, p), size = codePointSize(char);
      this.chars.push(char);
      let part = pattern.slice(p, p + size), upper = part.toUpperCase();
      this.folded.push(codePointAt(upper == part ? part.toLowerCase() : upper, 0));
      p += size;
    }
    this.astral = pattern.length != this.chars.length;
  }
  match(word) {
    if (this.pattern.length == 0)
      return [0];
    if (word.length < this.pattern.length)
      return null;
    let {chars, folded, any, precise, byWord} = this;
    if (chars.length == 1) {
      let first = codePointAt(word, 0);
      return first == chars[0] ? [0, 0, codePointSize(first)] : first == folded[0] ? [-200, 0, codePointSize(first)] : null;
    }
    let direct = word.indexOf(this.pattern);
    if (direct == 0)
      return [0, 0, this.pattern.length];
    let len = chars.length, anyTo = 0;
    if (direct < 0) {
      for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
        let next = codePointAt(word, i);
        if (next == chars[anyTo] || next == folded[anyTo])
          any[anyTo++] = i;
        i += codePointSize(next);
      }
      if (anyTo < len)
        return null;
    }
    let preciseTo = 0;
    let byWordTo = 0, byWordFolded = false;
    let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
    let hasLower = /[a-z]/.test(word);
    for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len; ) {
      let next = codePointAt(word, i);
      if (direct < 0) {
        if (preciseTo < len && next == chars[preciseTo])
          precise[preciseTo++] = i;
        if (adjacentTo < len) {
          if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
            if (adjacentTo == 0)
              adjacentStart = i;
            adjacentEnd = i;
            adjacentTo++;
          } else {
            adjacentTo = 0;
          }
        }
      }
      let ch, type = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
      if ((type == 1 && hasLower || prevType == 0 && type != 0) && (chars[byWordTo] == next || folded[byWordTo] == next && (byWordFolded = true)))
        byWord[byWordTo++] = i;
      prevType = type;
      i += codePointSize(next);
    }
    if (byWordTo == len && byWord[0] == 0)
      return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
    if (adjacentTo == len && adjacentStart == 0)
      return [-200, 0, adjacentEnd];
    if (direct > -1)
      return [-700, direct, direct + this.pattern.length];
    if (adjacentTo == len)
      return [-200 + -700, adjacentStart, adjacentEnd];
    if (byWordTo == len)
      return this.result(-100 + (byWordFolded ? -200 : 0) + -700, byWord, word);
    return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
  }
  result(score2, positions, word) {
    let result = [score2], i = 1;
    for (let pos of positions) {
      let to = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
      if (i > 1 && result[i - 1] == pos)
        result[i - 1] = to;
      else {
        result[i++] = pos;
        result[i++] = to;
      }
    }
    return result;
  }
};
var completionConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      activateOnTyping: true,
      override: null,
      maxRenderedOptions: 100,
      defaultKeymap: true
    }, {
      defaultKeymap: (a, b) => a && b
    });
  }
});
var MaxInfoWidth = 300;
var baseTheme3 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      maxHeight: "10em",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li": {
        cursor: "pointer",
        padding: "1px 1em 1px 3px",
        lineHeight: 1.2
      },
      "& > li[aria-selected]": {
        background_fallback: "#bdf",
        backgroundColor: "Highlight",
        color_fallback: "white",
        color: "HighlightText"
      }
    }
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"\xB7\xB7\xB7"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: MaxInfoWidth + "px"
  },
  ".cm-completionInfo.cm-completionInfo-left": {right: "100%"},
  ".cm-completionInfo.cm-completionInfo-right": {left: "100%"},
  "&light .cm-snippetField": {backgroundColor: "#00000022"},
  "&dark .cm-snippetField": {backgroundColor: "#ffffff22"},
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": {content: "'\u0192'"}
  },
  ".cm-completionIcon-class": {
    "&:after": {content: "'\u25CB'"}
  },
  ".cm-completionIcon-interface": {
    "&:after": {content: "'\u25CC'"}
  },
  ".cm-completionIcon-variable": {
    "&:after": {content: "'\u{1D465}'"}
  },
  ".cm-completionIcon-constant": {
    "&:after": {content: "'\u{1D436}'"}
  },
  ".cm-completionIcon-type": {
    "&:after": {content: "'\u{1D461}'"}
  },
  ".cm-completionIcon-enum": {
    "&:after": {content: "'\u222A'"}
  },
  ".cm-completionIcon-property": {
    "&:after": {content: "'\u25A1'"}
  },
  ".cm-completionIcon-keyword": {
    "&:after": {content: "'\u{1F511}\uFE0E'"}
  },
  ".cm-completionIcon-namespace": {
    "&:after": {content: "'\u25A2'"}
  },
  ".cm-completionIcon-text": {
    "&:after": {content: "'abc'", fontSize: "50%", verticalAlign: "middle"}
  }
});
function createListBox(options, id2, range) {
  const ul = document.createElement("ul");
  ul.id = id2;
  ul.setAttribute("role", "listbox");
  ul.setAttribute("aria-expanded", "true");
  for (let i = range.from; i < range.to; i++) {
    let {completion, match} = options[i];
    const li = ul.appendChild(document.createElement("li"));
    li.id = id2 + "-" + i;
    let icon = li.appendChild(document.createElement("div"));
    icon.classList.add("cm-completionIcon");
    if (completion.type)
      icon.classList.add("cm-completionIcon-" + completion.type);
    icon.setAttribute("aria-hidden", "true");
    let labelElt = li.appendChild(document.createElement("span"));
    labelElt.className = "cm-completionLabel";
    let {label, detail} = completion, off = 0;
    for (let j = 1; j < match.length; ) {
      let from = match[j++], to = match[j++];
      if (from > off)
        labelElt.appendChild(document.createTextNode(label.slice(off, from)));
      let span2 = labelElt.appendChild(document.createElement("span"));
      span2.appendChild(document.createTextNode(label.slice(from, to)));
      span2.className = "cm-completionMatchedText";
      off = to;
    }
    if (off < label.length)
      labelElt.appendChild(document.createTextNode(label.slice(off)));
    if (detail) {
      let detailElt = li.appendChild(document.createElement("span"));
      detailElt.className = "cm-completionDetail";
      detailElt.textContent = detail;
    }
    li.setAttribute("role", "option");
  }
  if (range.from)
    ul.classList.add("cm-completionListIncompleteTop");
  if (range.to < options.length)
    ul.classList.add("cm-completionListIncompleteBottom");
  return ul;
}
function createInfoDialog(option, view) {
  let dom = document.createElement("div");
  dom.className = "cm-tooltip cm-completionInfo";
  let {info} = option.completion;
  if (typeof info == "string") {
    dom.textContent = info;
  } else {
    let content2 = info(option.completion);
    if (content2.then)
      content2.then((node) => dom.appendChild(node), (e) => logException(view.state, e, "completion info"));
    else
      dom.appendChild(content2);
  }
  return dom;
}
function rangeAroundSelected(total, selected, max) {
  if (total <= max)
    return {from: 0, to: total};
  if (selected <= total >> 1) {
    let off2 = Math.floor(selected / max);
    return {from: off2 * max, to: (off2 + 1) * max};
  }
  let off = Math.floor((total - selected) / max);
  return {from: total - (off + 1) * max, to: total - off * max};
}
var CompletionTooltip = class {
  constructor(view, stateField) {
    this.view = view;
    this.stateField = stateField;
    this.info = null;
    this.placeInfo = {
      read: () => this.measureInfo(),
      write: (pos) => this.positionInfo(pos),
      key: this
    };
    let cState = view.state.field(stateField);
    let {options, selected} = cState.open;
    let config2 = view.state.facet(completionConfig);
    this.range = rangeAroundSelected(options.length, selected, config2.maxRenderedOptions);
    this.dom = document.createElement("div");
    this.dom.className = "cm-tooltip-autocomplete";
    this.dom.addEventListener("mousedown", (e) => {
      for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
        if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options.length) {
          applyCompletion(view, options[+match[1]]);
          e.preventDefault();
          return;
        }
      }
    });
    this.list = this.dom.appendChild(createListBox(options, cState.id, this.range));
    this.list.addEventListener("scroll", () => {
      if (this.info)
        this.view.requestMeasure(this.placeInfo);
    });
  }
  mount() {
    this.updateSel();
  }
  update(update) {
    if (update.state.field(this.stateField) != update.startState.field(this.stateField))
      this.updateSel();
  }
  positioned() {
    if (this.info)
      this.view.requestMeasure(this.placeInfo);
  }
  updateSel() {
    let cState = this.view.state.field(this.stateField), open = cState.open;
    if (open.selected < this.range.from || open.selected >= this.range.to) {
      this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
      this.list.remove();
      this.list = this.dom.appendChild(createListBox(open.options, cState.id, this.range));
      this.list.addEventListener("scroll", () => {
        if (this.info)
          this.view.requestMeasure(this.placeInfo);
      });
    }
    if (this.updateSelectedOption(open.selected)) {
      if (this.info) {
        this.info.remove();
        this.info = null;
      }
      let option = open.options[open.selected];
      if (option.completion.info) {
        this.info = this.dom.appendChild(createInfoDialog(option, this.view));
        this.view.requestMeasure(this.placeInfo);
      }
    }
  }
  updateSelectedOption(selected) {
    let set = null;
    for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
      if (i == selected) {
        if (!opt.hasAttribute("aria-selected")) {
          opt.setAttribute("aria-selected", "true");
          set = opt;
        }
      } else {
        if (opt.hasAttribute("aria-selected"))
          opt.removeAttribute("aria-selected");
      }
    }
    if (set)
      scrollIntoView(this.list, set);
    return set;
  }
  measureInfo() {
    let sel = this.dom.querySelector("[aria-selected]");
    if (!sel)
      return null;
    let rect = this.dom.getBoundingClientRect();
    let top2 = sel.getBoundingClientRect().top - rect.top;
    if (top2 < 0 || top2 > this.list.clientHeight - 10)
      return null;
    let left = this.view.textDirection == Direction.RTL;
    let spaceLeft = rect.left, spaceRight = innerWidth - rect.right;
    if (left && spaceLeft < Math.min(MaxInfoWidth, spaceRight))
      left = false;
    else if (!left && spaceRight < Math.min(MaxInfoWidth, spaceLeft))
      left = true;
    return {top: top2, left};
  }
  positionInfo(pos) {
    if (this.info && pos) {
      this.info.style.top = pos.top + "px";
      this.info.classList.toggle("cm-completionInfo-left", pos.left);
      this.info.classList.toggle("cm-completionInfo-right", !pos.left);
    }
  }
};
function completionTooltip(stateField) {
  return (view) => new CompletionTooltip(view, stateField);
}
function scrollIntoView(container, element) {
  let parent = container.getBoundingClientRect();
  let self = element.getBoundingClientRect();
  if (self.top < parent.top)
    container.scrollTop -= parent.top - self.top;
  else if (self.bottom > parent.bottom)
    container.scrollTop += self.bottom - parent.bottom;
}
var MaxOptions = 300;
function score(option) {
  return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) + (option.type ? 1 : 0);
}
function sortOptions(active, state) {
  let options = [];
  for (let a of active)
    if (a.hasResult()) {
      let matcher = new FuzzyMatcher(state.sliceDoc(a.from, a.to)), match;
      for (let option of a.result.options)
        if (match = matcher.match(option.label)) {
          if (option.boost != null)
            match[0] += option.boost;
          options.push(new Option(option, a, match));
        }
    }
  options.sort(cmpOption);
  let result = [], prev = null;
  for (let opt of options.sort(cmpOption)) {
    if (result.length == MaxOptions)
      break;
    if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail)
      result.push(opt);
    else if (score(opt.completion) > score(prev))
      result[result.length - 1] = opt;
    prev = opt.completion;
  }
  return result;
}
var CompletionDialog = class {
  constructor(options, attrs, tooltip, timestamp, selected) {
    this.options = options;
    this.attrs = attrs;
    this.tooltip = tooltip;
    this.timestamp = timestamp;
    this.selected = selected;
  }
  setSelected(selected, id2) {
    return selected == this.selected || selected >= this.options.length ? this : new CompletionDialog(this.options, makeAttrs(id2, selected), this.tooltip, this.timestamp, selected);
  }
  static build(active, state, id2, prev) {
    let options = sortOptions(active, state);
    if (!options.length)
      return null;
    let selected = 0;
    if (prev && prev.selected) {
      let selectedValue = prev.options[prev.selected].completion;
      for (let i = 0; i < options.length && !selected; i++) {
        if (options[i].completion == selectedValue)
          selected = i;
      }
    }
    return new CompletionDialog(options, makeAttrs(id2, selected), {
      pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
      create: completionTooltip(completionState)
    }, prev ? prev.timestamp : Date.now(), selected);
  }
  map(changes) {
    return new CompletionDialog(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), {pos: changes.mapPos(this.tooltip.pos)}), this.timestamp, this.selected);
  }
};
var CompletionState = class {
  constructor(active, id2, open) {
    this.active = active;
    this.id = id2;
    this.open = open;
  }
  static start() {
    return new CompletionState(none3, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(tr) {
    let {state} = tr, conf = state.facet(completionConfig);
    let sources = conf.override || state.languageDataAt("autocomplete", cur(state)).map(asSource);
    let active = sources.map((source) => {
      let value = this.active.find((s) => s.source == source) || new ActiveSource(source, 0, false);
      return value.update(tr, conf);
    });
    if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
      active = this.active;
    let open = tr.selection || active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) || !sameResults(active, this.active) ? CompletionDialog.build(active, state, this.id, this.open) : this.open && tr.docChanged ? this.open.map(tr.changes) : this.open;
    if (!open && active.every((a) => a.state != 1) && active.some((a) => a.hasResult()))
      active = active.map((a) => a.hasResult() ? new ActiveSource(a.source, 0, false) : a);
    for (let effect of tr.effects)
      if (effect.is(setSelectedEffect))
        open = open && open.setSelected(effect.value, this.id);
    return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : baseAttrs;
  }
};
function sameResults(a, b) {
  if (a == b)
    return true;
  for (let iA = 0, iB = 0; ; ) {
    while (iA < a.length && !a[iA].hasResult)
      iA++;
    while (iB < b.length && !b[iB].hasResult)
      iB++;
    let endA = iA == a.length, endB = iB == b.length;
    if (endA || endB)
      return endA == endB;
    if (a[iA++].result != b[iB++].result)
      return false;
  }
}
function makeAttrs(id2, selected) {
  return {
    "aria-autocomplete": "list",
    "aria-activedescendant": id2 + "-" + selected,
    "aria-owns": id2
  };
}
var baseAttrs = {"aria-autocomplete": "list"};
var none3 = [];
function cmpOption(a, b) {
  let dScore = b.match[0] - a.match[0];
  if (dScore)
    return dScore;
  let lA = a.completion.label, lB = b.completion.label;
  return lA < lB ? -1 : lA == lB ? 0 : 1;
}
var ActiveSource = class {
  constructor(source, state, explicit) {
    this.source = source;
    this.state = state;
    this.explicit = explicit;
  }
  hasResult() {
    return false;
  }
  update(tr, conf) {
    let event = tr.annotation(Transaction.userEvent), value = this;
    if (event == "input" || event == "delete")
      value = value.handleUserEvent(tr, event, conf);
    else if (tr.docChanged)
      value = value.handleChange(tr);
    else if (tr.selection && value.state != 0)
      value = new ActiveSource(value.source, 0, false);
    for (let effect of tr.effects) {
      if (effect.is(startCompletionEffect))
        value = new ActiveSource(value.source, 1, effect.value);
      else if (effect.is(closeCompletionEffect))
        value = new ActiveSource(value.source, 0, false);
      else if (effect.is(setActiveEffect)) {
        for (let active of effect.value)
          if (active.source == value.source)
            value = active;
      }
    }
    return value;
  }
  handleUserEvent(_tr, type, conf) {
    return type == "delete" || !conf.activateOnTyping ? this : new ActiveSource(this.source, 1, false);
  }
  handleChange(tr) {
    return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(this.source, 0, false) : this;
  }
};
var ActiveResult = class extends ActiveSource {
  constructor(source, explicit, result, from, to, span2) {
    super(source, 2, explicit);
    this.result = result;
    this.from = from;
    this.to = to;
    this.span = span2;
  }
  hasResult() {
    return true;
  }
  handleUserEvent(tr, type, conf) {
    let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
    let pos = cur(tr.state);
    if ((this.explicit ? pos < from : pos <= from) || pos > to)
      return new ActiveSource(this.source, type == "input" && conf.activateOnTyping ? 1 : 0, false);
    if (this.span && (from == to || this.span.test(tr.state.sliceDoc(from, to))))
      return new ActiveResult(this.source, this.explicit, this.result, from, to, this.span);
    return new ActiveSource(this.source, 1, this.explicit);
  }
  handleChange(tr) {
    return tr.changes.touchesRange(this.from, this.to) ? new ActiveSource(this.source, 0, false) : new ActiveResult(this.source, this.explicit, this.result, tr.changes.mapPos(this.from), tr.changes.mapPos(this.to, 1), this.span);
  }
  map(mapping) {
    return new ActiveResult(this.source, this.explicit, this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1), this.span);
  }
};
var startCompletionEffect = /* @__PURE__ */ StateEffect.define();
var closeCompletionEffect = /* @__PURE__ */ StateEffect.define();
var setActiveEffect = /* @__PURE__ */ StateEffect.define({
  map(sources, mapping) {
    return sources.map((s) => s.hasResult() && !mapping.empty ? s.map(mapping) : s);
  }
});
var setSelectedEffect = /* @__PURE__ */ StateEffect.define();
var completionState = /* @__PURE__ */ StateField.define({
  create() {
    return CompletionState.start();
  },
  update(value, tr) {
    return value.update(tr);
  },
  provide: (f) => [
    showTooltip.from(f, (val) => val.tooltip),
    EditorView.contentAttributes.from(f, (state) => state.attrs)
  ]
});
var CompletionInteractMargin = 75;
function moveCompletionSelection(forward, by = "option") {
  return (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
      return false;
    let step = 1, tooltip;
    if (by == "page" && (tooltip = view.dom.querySelector(".cm-tooltip-autocomplete")))
      step = Math.max(2, Math.floor(tooltip.offsetHeight / tooltip.firstChild.offsetHeight));
    let selected = cState.open.selected + step * (forward ? 1 : -1), {length} = cState.open.options;
    if (selected < 0)
      selected = by == "page" ? 0 : length - 1;
    else if (selected >= length)
      selected = by == "page" ? length - 1 : 0;
    view.dispatch({effects: setSelectedEffect.of(selected)});
    return true;
  };
}
var acceptCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
    return false;
  applyCompletion(view, cState.open.options[cState.open.selected]);
  return true;
};
var startCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState)
    return false;
  view.dispatch({effects: startCompletionEffect.of(true)});
  return true;
};
var closeCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState || !cState.active.some((a) => a.state != 0))
    return false;
  view.dispatch({effects: closeCompletionEffect.of(null)});
  return true;
};
var RunningQuery = class {
  constructor(source, context) {
    this.source = source;
    this.context = context;
    this.time = Date.now();
    this.updates = [];
    this.done = void 0;
  }
};
var DebounceTime = 50;
var MaxUpdateCount = 50;
var MinAbortTime = 1e3;
var completionPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.debounceUpdate = -1;
    this.running = [];
    this.debounceAccept = -1;
    this.composing = 0;
    for (let active of view.state.field(completionState).active)
      if (active.state == 1)
        this.startQuery(active);
  }
  update(update) {
    let cState = update.state.field(completionState);
    if (!update.selectionSet && !update.docChanged && update.startState.field(completionState) == cState)
      return;
    let doesReset = update.transactions.some((tr) => {
      let event = tr.annotation(Transaction.userEvent);
      return (tr.selection || tr.docChanged) && event != "input" && event != "delete";
    });
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (doesReset || query.updates.length + update.transactions.length > MaxUpdateCount && query.time - Date.now() > MinAbortTime) {
        for (let handler of query.context.abortListeners) {
          try {
            handler();
          } catch (e) {
            logException(this.view.state, e);
          }
        }
        query.context.abortListeners = null;
        this.running.splice(i--, 1);
      } else {
        query.updates.push(...update.transactions);
      }
    }
    if (this.debounceUpdate > -1)
      clearTimeout(this.debounceUpdate);
    this.debounceUpdate = cState.active.some((a) => a.state == 1 && !this.running.some((q) => q.source == a.source)) ? setTimeout(() => this.startUpdate(), DebounceTime) : -1;
    if (this.composing != 0)
      for (let tr of update.transactions) {
        if (tr.annotation(Transaction.userEvent) == "input")
          this.composing = 2;
        else if (this.composing == 2 && tr.selection)
          this.composing = 3;
      }
  }
  startUpdate() {
    this.debounceUpdate = -1;
    let {state} = this.view, cState = state.field(completionState);
    for (let active of cState.active) {
      if (active.state == 1 && !this.running.some((r) => r.source == active.source))
        this.startQuery(active);
    }
  }
  startQuery(active) {
    let {state} = this.view, pos = cur(state);
    let context = new CompletionContext(state, pos, active.explicit);
    let pending = new RunningQuery(active.source, context);
    this.running.push(pending);
    Promise.resolve(active.source(context)).then((result) => {
      if (!pending.context.aborted) {
        pending.done = result || null;
        this.scheduleAccept();
      }
    }, (err) => {
      this.view.dispatch({effects: closeCompletionEffect.of(null)});
      logException(this.view.state, err);
    });
  }
  scheduleAccept() {
    if (this.running.every((q) => q.done !== void 0))
      this.accept();
    else if (this.debounceAccept < 0)
      this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
  }
  accept() {
    var _a;
    if (this.debounceAccept > -1)
      clearTimeout(this.debounceAccept);
    this.debounceAccept = -1;
    let updated = [];
    let conf = this.view.state.facet(completionConfig);
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (query.done === void 0)
        continue;
      this.running.splice(i--, 1);
      if (query.done) {
        let active = new ActiveResult(query.source, query.context.explicit, query.done, query.done.from, (_a = query.done.to) !== null && _a !== void 0 ? _a : cur(query.updates.length ? query.updates[0].startState : this.view.state), query.done.span ? ensureAnchor(query.done.span, true) : null);
        for (let tr of query.updates)
          active = active.update(tr, conf);
        if (active.hasResult()) {
          updated.push(active);
          continue;
        }
      }
      let current = this.view.state.field(completionState).active.find((a) => a.source == query.source);
      if (current && current.state == 1) {
        if (query.done == null) {
          let active = new ActiveSource(query.source, 0, false);
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (active.state != 1)
            updated.push(active);
        } else {
          this.startQuery(current);
        }
      }
    }
    if (updated.length)
      this.view.dispatch({effects: setActiveEffect.of(updated)});
  }
}, {
  eventHandlers: {
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      if (this.composing == 3) {
        setTimeout(() => this.view.dispatch({effects: startCompletionEffect.of(false)}), 20);
      }
      this.composing = 0;
    }
  }
});
var FieldPos = class {
  constructor(field, line, from, to) {
    this.field = field;
    this.line = line;
    this.from = from;
    this.to = to;
  }
};
var FieldRange = class {
  constructor(field, from, to) {
    this.field = field;
    this.from = from;
    this.to = to;
  }
  map(changes) {
    return new FieldRange(this.field, changes.mapPos(this.from, -1), changes.mapPos(this.to, 1));
  }
};
var Snippet = class {
  constructor(lines, fieldPositions) {
    this.lines = lines;
    this.fieldPositions = fieldPositions;
  }
  instantiate(state, pos) {
    let text = [], lineStart = [pos];
    let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)[0];
    for (let line of this.lines) {
      if (text.length) {
        let indent = baseIndent, tabs = /^\t*/.exec(line)[0].length;
        for (let i = 0; i < tabs; i++)
          indent += state.facet(indentUnit);
        lineStart.push(pos + indent.length - tabs);
        line = indent + line.slice(tabs);
      }
      text.push(line);
      pos += line.length + 1;
    }
    let ranges = this.fieldPositions.map((pos2) => new FieldRange(pos2.field, lineStart[pos2.line] + pos2.from, lineStart[pos2.line] + pos2.to));
    return {text, ranges};
  }
  static parse(template2) {
    let fields = [];
    let lines = [], positions = [], m;
    for (let line of template2.split(/\r\n?|\n/)) {
      while (m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line)) {
        let seq = m[1] ? +m[1] : null, name2 = m[2] || m[3], found = -1;
        for (let i = 0; i < fields.length; i++) {
          if (seq != null ? fields[i].seq == seq : name2 ? fields[i].name == name2 : false)
            found = i;
        }
        if (found < 0) {
          let i = 0;
          while (i < fields.length && (seq == null || fields[i].seq != null && fields[i].seq < seq))
            i++;
          fields.splice(i, 0, {seq, name: name2 || null});
          found = i;
          for (let pos of positions)
            if (pos.field >= found)
              pos.field++;
        }
        positions.push(new FieldPos(found, lines.length, m.index, m.index + name2.length));
        line = line.slice(0, m.index) + name2 + line.slice(m.index + m[0].length);
      }
      lines.push(line);
    }
    return new Snippet(lines, positions);
  }
};
var fieldMarker = /* @__PURE__ */ Decoration.widget({widget: /* @__PURE__ */ new class extends WidgetType {
  toDOM() {
    let span2 = document.createElement("span");
    span2.className = "cm-snippetFieldPosition";
    return span2;
  }
  ignoreEvent() {
    return false;
  }
}()});
var fieldRange = /* @__PURE__ */ Decoration.mark({class: "cm-snippetField"});
var ActiveSnippet = class {
  constructor(ranges, active) {
    this.ranges = ranges;
    this.active = active;
    this.deco = Decoration.set(ranges.map((r) => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
  }
  map(changes) {
    return new ActiveSnippet(this.ranges.map((r) => r.map(changes)), this.active);
  }
  selectionInsideField(sel) {
    return sel.ranges.every((range) => this.ranges.some((r) => r.field == this.active && r.from <= range.from && r.to >= range.to));
  }
};
var setActive = /* @__PURE__ */ StateEffect.define({
  map(value, changes) {
    return value && value.map(changes);
  }
});
var moveToField = /* @__PURE__ */ StateEffect.define();
var snippetState = /* @__PURE__ */ StateField.define({
  create() {
    return null;
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setActive))
        return effect.value;
      if (effect.is(moveToField) && value)
        return new ActiveSnippet(value.ranges, effect.value);
    }
    if (value && tr.docChanged)
      value = value.map(tr.changes);
    if (value && tr.selection && !value.selectionInsideField(tr.selection))
      value = null;
    return value;
  },
  provide: (f) => EditorView.decorations.from(f, (val) => val ? val.deco : Decoration.none)
});
function fieldSelection(ranges, field) {
  return EditorSelection.create(ranges.filter((r) => r.field == field).map((r) => EditorSelection.range(r.from, r.to)));
}
function snippet(template2) {
  let snippet2 = Snippet.parse(template2);
  return (editor, _completion, from, to) => {
    let {text, ranges} = snippet2.instantiate(editor.state, from);
    let spec = {changes: {from, to, insert: Text.of(text)}};
    if (ranges.length)
      spec.selection = fieldSelection(ranges, 0);
    if (ranges.length > 1) {
      let active = new ActiveSnippet(ranges, 0);
      let effects = spec.effects = [setActive.of(active)];
      if (editor.state.field(snippetState, false) === void 0)
        effects.push(StateEffect.appendConfig.of([
          snippetState.init(() => active),
          addSnippetKeymap,
          snippetPointerHandler,
          baseTheme3
        ]));
    }
    editor.dispatch(editor.state.update(spec));
  };
}
function moveField(dir) {
  return ({state, dispatch}) => {
    let active = state.field(snippetState, false);
    if (!active || dir < 0 && active.active == 0)
      return false;
    let next = active.active + dir, last = dir > 0 && !active.ranges.some((r) => r.field == next + dir);
    dispatch(state.update({
      selection: fieldSelection(active.ranges, next),
      effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
    }));
    return true;
  };
}
var clearSnippet = ({state, dispatch}) => {
  let active = state.field(snippetState, false);
  if (!active)
    return false;
  dispatch(state.update({effects: setActive.of(null)}));
  return true;
};
var nextSnippetField = /* @__PURE__ */ moveField(1);
var prevSnippetField = /* @__PURE__ */ moveField(-1);
var defaultSnippetKeymap = [
  {key: "Tab", run: nextSnippetField, shift: prevSnippetField},
  {key: "Escape", run: clearSnippet}
];
var snippetKeymap = /* @__PURE__ */ Facet.define({
  combine(maps) {
    return maps.length ? maps[0] : defaultSnippetKeymap;
  }
});
var addSnippetKeymap = /* @__PURE__ */ Prec.override(/* @__PURE__ */ keymap.compute([snippetKeymap], (state) => state.facet(snippetKeymap)));
function snippetCompletion(template2, completion) {
  return Object.assign(Object.assign({}, completion), {apply: snippet(template2)});
}
var snippetPointerHandler = /* @__PURE__ */ EditorView.domEventHandlers({
  mousedown(event, view) {
    let active = view.state.field(snippetState, false), pos;
    if (!active || (pos = view.posAtCoords({x: event.clientX, y: event.clientY})) == null)
      return false;
    let match = active.ranges.find((r) => r.from <= pos && r.to >= pos);
    if (!match || match.field == active.active)
      return false;
    view.dispatch({
      selection: fieldSelection(active.ranges, match.field),
      effects: setActive.of(active.ranges.some((r) => r.field > match.field) ? new ActiveSnippet(active.ranges, match.field) : null)
    });
    return true;
  }
});
function autocompletion(config2 = {}) {
  return [
    completionState,
    completionConfig.of(config2),
    completionPlugin,
    completionKeymapExt,
    baseTheme3
  ];
}
var completionKeymap = [
  {key: "Ctrl-Space", run: startCompletion},
  {key: "Escape", run: closeCompletion},
  {key: "ArrowDown", run: /* @__PURE__ */ moveCompletionSelection(true)},
  {key: "ArrowUp", run: /* @__PURE__ */ moveCompletionSelection(false)},
  {key: "PageDown", run: /* @__PURE__ */ moveCompletionSelection(true, "page")},
  {key: "PageUp", run: /* @__PURE__ */ moveCompletionSelection(false, "page")},
  {key: "Enter", run: acceptCompletion}
];
var completionKeymapExt = /* @__PURE__ */ Prec.override(/* @__PURE__ */ keymap.computeN([completionConfig], (state) => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));

// ../../node_modules/@codemirror/closebrackets/dist/index.js
var defaults = {
  brackets: ["(", "[", "{", "'", '"'],
  before: `)]}'":;>`
};
var closeBracketEffect = StateEffect.define({
  map(value, mapping) {
    let mapped = mapping.mapPos(value, -1, MapMode.TrackAfter);
    return mapped == null ? void 0 : mapped;
  }
});
var skipBracketEffect = StateEffect.define({
  map(value, mapping) {
    return mapping.mapPos(value);
  }
});
var closedBracket = new class extends RangeValue {
}();
closedBracket.startSide = 1;
closedBracket.endSide = -1;
var bracketState = StateField.define({
  create() {
    return RangeSet.empty;
  },
  update(value, tr) {
    if (tr.selection) {
      let lineStart = tr.state.doc.lineAt(tr.selection.main.head).from;
      let prevLineStart = tr.startState.doc.lineAt(tr.startState.selection.main.head).from;
      if (lineStart != tr.changes.mapPos(prevLineStart, -1))
        value = RangeSet.empty;
    }
    value = value.map(tr.changes);
    for (let effect of tr.effects) {
      if (effect.is(closeBracketEffect))
        value = value.update({add: [closedBracket.range(effect.value, effect.value + 1)]});
      else if (effect.is(skipBracketEffect))
        value = value.update({filter: (from) => from != effect.value});
    }
    return value;
  }
});
function closeBrackets() {
  return [EditorView.inputHandler.of(handleInput), bracketState];
}
var definedClosing = "()[]{}<>";
function closing(ch) {
  for (let i = 0; i < definedClosing.length; i += 2)
    if (definedClosing.charCodeAt(i) == ch)
      return definedClosing.charAt(i + 1);
  return fromCodePoint(ch < 128 ? ch : ch + 1);
}
function config(state, pos) {
  return state.languageDataAt("closeBrackets", pos)[0] || defaults;
}
function handleInput(view, from, to, insert2) {
  if (view.composing)
    return false;
  let sel = view.state.selection.main;
  if (insert2.length > 2 || insert2.length == 2 && codePointSize(codePointAt(insert2, 0)) == 1 || from != sel.from || to != sel.to)
    return false;
  let tr = insertBracket(view.state, insert2);
  if (!tr)
    return false;
  view.dispatch(tr);
  return true;
}
var deleteBracketPair = ({state, dispatch}) => {
  let conf = config(state, state.selection.main.head);
  let tokens = conf.brackets || defaults.brackets;
  let dont = null, changes = state.changeByRange((range) => {
    if (range.empty) {
      let before = prevChar(state.doc, range.head);
      for (let token of tokens) {
        if (token == before && nextChar(state.doc, range.head) == closing(codePointAt(token, 0)))
          return {
            changes: {from: range.head - token.length, to: range.head + token.length},
            range: EditorSelection.cursor(range.head - token.length),
            annotations: Transaction.userEvent.of("delete")
          };
      }
    }
    return {range: dont = range};
  });
  if (!dont)
    dispatch(state.update(changes, {scrollIntoView: true}));
  return !dont;
};
var closeBracketsKeymap = [
  {key: "Backspace", run: deleteBracketPair}
];
function insertBracket(state, bracket2) {
  let conf = config(state, state.selection.main.head);
  let tokens = conf.brackets || defaults.brackets;
  for (let tok of tokens) {
    let closed = closing(codePointAt(tok, 0));
    if (bracket2 == tok)
      return closed == tok ? handleSame(state, tok, tokens.indexOf(tok + tok + tok) > -1) : handleOpen(state, tok, closed, conf.before || defaults.before);
    if (bracket2 == closed && closedBracketAt(state, state.selection.main.from))
      return handleClose(state, tok, closed);
  }
  return null;
}
function closedBracketAt(state, pos) {
  let found = false;
  state.field(bracketState).between(0, state.doc.length, (from) => {
    if (from == pos)
      found = true;
  });
  return found;
}
function nextChar(doc2, pos) {
  let next = doc2.sliceString(pos, pos + 2);
  return next.slice(0, codePointSize(codePointAt(next, 0)));
}
function prevChar(doc2, pos) {
  let prev = doc2.sliceString(pos - 2, pos);
  return codePointSize(codePointAt(prev, 0)) == prev.length ? prev : prev.slice(1);
}
function handleOpen(state, open, close, closeBefore) {
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty)
      return {
        changes: [{insert: open, from: range.from}, {insert: close, from: range.to}],
        effects: closeBracketEffect.of(range.to + open.length),
        range: EditorSelection.range(range.anchor + open.length, range.head + open.length)
      };
    let next = nextChar(state.doc, range.head);
    if (!next || /\s/.test(next) || closeBefore.indexOf(next) > -1)
      return {
        changes: {insert: open + close, from: range.head},
        effects: closeBracketEffect.of(range.head + open.length),
        range: EditorSelection.cursor(range.head + open.length)
      };
    return {range: dont = range};
  });
  return dont ? null : state.update(changes, {
    scrollIntoView: true,
    annotations: Transaction.userEvent.of("input")
  });
}
function handleClose(state, _open, close) {
  let dont = null, moved = state.selection.ranges.map((range) => {
    if (range.empty && nextChar(state.doc, range.head) == close)
      return EditorSelection.cursor(range.head + close.length);
    return dont = range;
  });
  return dont ? null : state.update({
    selection: EditorSelection.create(moved, state.selection.mainIndex),
    scrollIntoView: true,
    effects: state.selection.ranges.map(({from}) => skipBracketEffect.of(from))
  });
}
function handleSame(state, token, allowTriple) {
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty)
      return {
        changes: [{insert: token, from: range.from}, {insert: token, from: range.to}],
        effects: closeBracketEffect.of(range.to + token.length),
        range: EditorSelection.range(range.anchor + token.length, range.head + token.length)
      };
    let pos = range.head, next = nextChar(state.doc, pos);
    if (next == token) {
      if (nodeStart(state, pos)) {
        return {
          changes: {insert: token + token, from: pos},
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
      } else if (closedBracketAt(state, pos)) {
        let isTriple = allowTriple && state.sliceDoc(pos, pos + token.length * 3) == token + token + token;
        return {
          range: EditorSelection.cursor(pos + token.length * (isTriple ? 3 : 1)),
          effects: skipBracketEffect.of(pos)
        };
      }
    } else if (allowTriple && state.sliceDoc(pos - 2 * token.length, pos) == token + token && nodeStart(state, pos - 2 * token.length)) {
      return {
        changes: {insert: token + token + token + token, from: pos},
        effects: closeBracketEffect.of(pos + token.length),
        range: EditorSelection.cursor(pos + token.length)
      };
    } else if (state.charCategorizer(pos)(next) != CharCategory.Word) {
      let prev = state.sliceDoc(pos - 1, pos);
      if (prev != token && state.charCategorizer(pos)(prev) != CharCategory.Word)
        return {
          changes: {insert: token + token, from: pos},
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
    }
    return {range: dont = range};
  });
  return dont ? null : state.update(changes, {
    scrollIntoView: true,
    annotations: Transaction.userEvent.of("input")
  });
}
function nodeStart(state, pos) {
  let tree = syntaxTree(state).resolve(pos + 1);
  return tree.parent && tree.from == pos;
}

// ../../node_modules/@codemirror/matchbrackets/dist/index.js
var baseTheme4 = EditorView.baseTheme({
  ".cm-matchingBracket": {color: "#0b0"},
  ".cm-nonmatchingBracket": {color: "#a22"}
});
var DefaultScanDist = 1e4;
var DefaultBrackets = "()[]{}";
var bracketMatchingConfig = Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      afterCursor: true,
      brackets: DefaultBrackets,
      maxScanDistance: DefaultScanDist
    });
  }
});
var matchingMark = Decoration.mark({class: "cm-matchingBracket"});
var nonmatchingMark = Decoration.mark({class: "cm-nonmatchingBracket"});
var bracketMatchingState = StateField.define({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    if (!tr.docChanged && !tr.selection)
      return deco;
    let decorations2 = [];
    let config2 = tr.state.facet(bracketMatchingConfig);
    for (let range of tr.state.selection.ranges) {
      if (!range.empty)
        continue;
      let match = matchBrackets(tr.state, range.head, -1, config2) || range.head > 0 && matchBrackets(tr.state, range.head - 1, 1, config2) || config2.afterCursor && (matchBrackets(tr.state, range.head, 1, config2) || range.head < tr.state.doc.length && matchBrackets(tr.state, range.head + 1, -1, config2));
      if (!match)
        continue;
      let mark = match.matched ? matchingMark : nonmatchingMark;
      decorations2.push(mark.range(match.start.from, match.start.to));
      if (match.end)
        decorations2.push(mark.range(match.end.from, match.end.to));
    }
    return Decoration.set(decorations2, true);
  },
  provide: (f) => EditorView.decorations.from(f)
});
var bracketMatchingUnique = [
  bracketMatchingState,
  baseTheme4
];
function bracketMatching(config2 = {}) {
  return [bracketMatchingConfig.of(config2), bracketMatchingUnique];
}
function matchingNodes(node, dir, brackets) {
  let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
  if (byProp)
    return byProp;
  if (node.name.length == 1) {
    let index = brackets.indexOf(node.name);
    if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
      return [brackets[index + dir]];
  }
  return null;
}
function matchBrackets(state, pos, dir, config2 = {}) {
  let maxScanDistance = config2.maxScanDistance || DefaultScanDist, brackets = config2.brackets || DefaultBrackets;
  let tree = syntaxTree(state), sub = tree.resolve(pos, dir), matches;
  if (matches = matchingNodes(sub.type, dir, brackets))
    return matchMarkedBrackets(state, pos, dir, sub, matches, brackets);
  else
    return matchPlainBrackets(state, pos, dir, tree, sub.type, maxScanDistance, brackets);
}
function matchMarkedBrackets(_state, _pos, dir, token, matching, brackets) {
  let parent = token.parent, firstToken = {from: token.from, to: token.to};
  let depth2 = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor;
  if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
    do {
      if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
        if (depth2 == 0 && matching.indexOf(cursor.type.name) > -1) {
          return {start: firstToken, end: {from: cursor.from, to: cursor.to}, matched: true};
        } else if (matchingNodes(cursor.type, dir, brackets)) {
          depth2++;
        } else if (matchingNodes(cursor.type, -dir, brackets)) {
          depth2--;
          if (depth2 == 0)
            return {start: firstToken, end: {from: cursor.from, to: cursor.to}, matched: false};
        }
      }
    } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
  return {start: firstToken, matched: false};
}
function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
  let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
  let bracket2 = brackets.indexOf(startCh);
  if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
    return null;
  let startToken = {from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos};
  let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth2 = 0;
  for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
    let text = iter.value;
    if (dir < 0)
      distance += text.length;
    let basePos = pos + distance * dir;
    for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
      let found = brackets.indexOf(text[pos2]);
      if (found < 0 || tree.resolve(basePos + pos2, 1).type != tokenType)
        continue;
      if (found % 2 == 0 == dir > 0) {
        depth2++;
      } else if (depth2 == 1) {
        return {start: startToken, end: {from: basePos + pos2, to: basePos + pos2 + 1}, matched: found >> 1 == bracket2 >> 1};
      } else {
        depth2--;
      }
    }
    if (dir > 0)
      distance += text.length;
  }
  return iter.done ? {start: startToken, matched: false} : null;
}

// ../../node_modules/@codemirror/commands/dist/index.js
function updateSel(sel, by) {
  return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection) {
  return state.update({selection, scrollIntoView: true, annotations: Transaction.userEvent.of("keyboardselection")});
}
function moveSel({state, dispatch}, how) {
  let selection = updateSel(state.selection, how);
  if (selection.eq(state.selection))
    return false;
  dispatch(setSel(state, selection));
  return true;
}
function rangeEnd(range, forward) {
  return EditorSelection.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
var cursorCharLeft = (view) => cursorByChar(view, view.textDirection != Direction.LTR);
var cursorCharRight = (view) => cursorByChar(view, view.textDirection == Direction.LTR);
function cursorByGroup(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
var cursorGroupLeft = (view) => cursorByGroup(view, view.textDirection != Direction.LTR);
var cursorGroupRight = (view) => cursorByGroup(view, view.textDirection == Direction.LTR);
var cursorGroupForward = (view) => cursorByGroup(view, true);
var cursorGroupBackward = (view) => cursorByGroup(view, false);
function interestingNode(state, node, bracketProp) {
  if (node.type.prop(bracketProp))
    return true;
  let len = node.to - node.from;
  return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
  let pos = syntaxTree(state).resolve(start.head);
  let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
  for (let at = start.head; ; ) {
    let next = forward ? pos.childAfter(at) : pos.childBefore(at);
    if (!next)
      break;
    if (interestingNode(state, next, bracketProp))
      pos = next;
    else
      at = forward ? next.to : next.from;
  }
  let bracket2 = pos.type.prop(bracketProp), match, newPos;
  if (bracket2 && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
    newPos = forward ? match.end.to : match.end.from;
  else
    newPos = forward ? pos.to : pos.from;
  return EditorSelection.cursor(newPos, forward ? -1 : 1);
}
var cursorSyntaxLeft = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, view.textDirection != Direction.LTR));
var cursorSyntaxRight = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, view.textDirection == Direction.LTR));
function cursorByLine(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveVertically(range, forward) : rangeEnd(range, forward));
}
var cursorLineUp = (view) => cursorByLine(view, false);
var cursorLineDown = (view) => cursorByLine(view, true);
function cursorByPage(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveVertically(range, forward, view.dom.clientHeight) : rangeEnd(range, forward));
}
var cursorPageUp = (view) => cursorByPage(view, false);
var cursorPageDown = (view) => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
  let line = view.visualLineAt(start.head), moved = view.moveToLineBoundary(start, forward);
  if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
    moved = view.moveToLineBoundary(start, forward, false);
  if (!forward && moved.head == line.from && line.length) {
    let space4 = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
    if (space4 && start.head != line.from + space4)
      moved = EditorSelection.cursor(line.from + space4);
  }
  return moved;
}
var cursorLineBoundaryForward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, true));
var cursorLineBoundaryBackward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, false));
var cursorLineStart = (view) => moveSel(view, (range) => EditorSelection.cursor(view.visualLineAt(range.head).from, 1));
var cursorLineEnd = (view) => moveSel(view, (range) => EditorSelection.cursor(view.visualLineAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend2) {
  let found = false, selection = updateSel(state.selection, (range) => {
    let matching = matchBrackets(state, range.head, -1) || matchBrackets(state, range.head, 1) || range.head > 0 && matchBrackets(state, range.head - 1, 1) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1);
    if (!matching || !matching.end)
      return range;
    found = true;
    let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
    return extend2 ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
  });
  if (!found)
    return false;
  dispatch(setSel(state, selection));
  return true;
}
var cursorMatchingBracket = ({state, dispatch}) => toMatchingBracket(state, dispatch, false);
function extendSel(view, how) {
  let selection = updateSel(view.state.selection, (range) => {
    let head = how(range);
    return EditorSelection.range(range.anchor, head.head, head.goalColumn);
  });
  if (selection.eq(view.state.selection))
    return false;
  view.dispatch(setSel(view.state, selection));
  return true;
}
function selectByChar(view, forward) {
  return extendSel(view, (range) => view.moveByChar(range, forward));
}
var selectCharLeft = (view) => selectByChar(view, view.textDirection != Direction.LTR);
var selectCharRight = (view) => selectByChar(view, view.textDirection == Direction.LTR);
function selectByGroup(view, forward) {
  return extendSel(view, (range) => view.moveByGroup(range, forward));
}
var selectGroupLeft = (view) => selectByGroup(view, view.textDirection != Direction.LTR);
var selectGroupRight = (view) => selectByGroup(view, view.textDirection == Direction.LTR);
var selectGroupForward = (view) => selectByGroup(view, true);
var selectGroupBackward = (view) => selectByGroup(view, false);
var selectSyntaxLeft = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, view.textDirection != Direction.LTR));
var selectSyntaxRight = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, view.textDirection == Direction.LTR));
function selectByLine(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward));
}
var selectLineUp = (view) => selectByLine(view, false);
var selectLineDown = (view) => selectByLine(view, true);
function selectByPage(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward, view.dom.clientHeight));
}
var selectPageUp = (view) => selectByPage(view, false);
var selectPageDown = (view) => selectByPage(view, true);
var selectLineBoundaryForward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, true));
var selectLineBoundaryBackward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, false));
var selectLineStart = (view) => extendSel(view, (range) => EditorSelection.cursor(view.visualLineAt(range.head).from));
var selectLineEnd = (view) => extendSel(view, (range) => EditorSelection.cursor(view.visualLineAt(range.head).to));
var cursorDocStart = ({state, dispatch}) => {
  dispatch(setSel(state, {anchor: 0}));
  return true;
};
var cursorDocEnd = ({state, dispatch}) => {
  dispatch(setSel(state, {anchor: state.doc.length}));
  return true;
};
var selectDocStart = ({state, dispatch}) => {
  dispatch(setSel(state, {anchor: state.selection.main.anchor, head: 0}));
  return true;
};
var selectDocEnd = ({state, dispatch}) => {
  dispatch(setSel(state, {anchor: state.selection.main.anchor, head: state.doc.length}));
  return true;
};
var selectAll = ({state, dispatch}) => {
  dispatch(state.update({selection: {anchor: 0, head: state.doc.length}, annotations: Transaction.userEvent.of("keyboardselection")}));
  return true;
};
var selectLine = ({state, dispatch}) => {
  let ranges = selectedLineBlocks(state).map(({from, to}) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
  dispatch(state.update({selection: EditorSelection.create(ranges), annotations: Transaction.userEvent.of("keyboardselection")}));
  return true;
};
var selectParentSyntax = ({state, dispatch}) => {
  let selection = updateSel(state.selection, (range) => {
    var _a;
    let context = syntaxTree(state).resolve(range.head, 1);
    while (!(context.from < range.from && context.to >= range.to || context.to > range.to && context.from <= range.from || !((_a = context.parent) === null || _a === void 0 ? void 0 : _a.parent)))
      context = context.parent;
    return EditorSelection.range(context.to, context.from);
  });
  dispatch(setSel(state, selection));
  return true;
};
var simplifySelection = ({state, dispatch}) => {
  let cur2 = state.selection, selection = null;
  if (cur2.ranges.length > 1)
    selection = EditorSelection.create([cur2.main]);
  else if (!cur2.main.empty)
    selection = EditorSelection.create([EditorSelection.cursor(cur2.main.head)]);
  if (!selection)
    return false;
  dispatch(setSel(state, selection));
  return true;
};
function deleteBy({state, dispatch}, by) {
  let changes = state.changeByRange((range) => {
    let {from, to} = range;
    if (from == to) {
      let towards = by(from);
      from = Math.min(from, towards);
      to = Math.max(to, towards);
    }
    return from == to ? {range} : {changes: {from, to}, range: EditorSelection.cursor(from)};
  });
  if (changes.changes.empty)
    return false;
  dispatch(state.update(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of("delete")}));
  return true;
}
var deleteByChar = (target, forward, codePoint) => deleteBy(target, (pos) => {
  let {state} = target, line = state.doc.lineAt(pos), before;
  if (!forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
    if (before[before.length - 1] == "	")
      return pos - 1;
    let col = countColumn(before, 0, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
    for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
      pos--;
    return pos;
  }
  let targetPos;
  if (codePoint) {
    let next = line.text.slice(pos - line.from + (forward ? 0 : -2), pos - line.from + (forward ? 2 : 0));
    let size = next ? codePointSize(codePointAt(next, 0)) : 1;
    targetPos = forward ? Math.min(state.doc.length, pos + size) : Math.max(0, pos - size);
  } else {
    targetPos = findClusterBreak(line.text, pos - line.from, forward) + line.from;
  }
  if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
    targetPos += forward ? 1 : -1;
  return targetPos;
});
var deleteCodePointBackward = (view) => deleteByChar(view, false, true);
var deleteCharBackward = (view) => deleteByChar(view, false, false);
var deleteCharForward = (view) => deleteByChar(view, true, false);
var deleteByGroup = (target, forward) => deleteBy(target, (start) => {
  let pos = start, {state} = target, line = state.doc.lineAt(pos);
  let categorize = state.charCategorizer(pos);
  for (let cat = null; ; ) {
    if (pos == (forward ? line.to : line.from)) {
      if (pos == start && line.number != (forward ? state.doc.lines : 1))
        pos += forward ? 1 : -1;
      break;
    }
    let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
    let nextChar2 = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
    let nextCat = categorize(nextChar2);
    if (cat != null && nextCat != cat)
      break;
    if (nextChar2 != " " || pos != start)
      cat = nextCat;
    pos = next;
  }
  return pos;
});
var deleteGroupBackward = (target) => deleteByGroup(target, false);
var deleteGroupForward = (target) => deleteByGroup(target, true);
var deleteToLineEnd = (view) => deleteBy(view, (pos) => {
  let lineEnd2 = view.visualLineAt(pos).to;
  if (pos < lineEnd2)
    return lineEnd2;
  return Math.min(view.state.doc.length, pos + 1);
});
var deleteToLineStart = (view) => deleteBy(view, (pos) => {
  let lineStart = view.visualLineAt(pos).from;
  if (pos > lineStart)
    return lineStart;
  return Math.max(0, pos - 1);
});
var splitLine = ({state, dispatch}) => {
  let changes = state.changeByRange((range) => {
    return {
      changes: {from: range.from, to: range.to, insert: Text.of(["", ""])},
      range: EditorSelection.cursor(range.from)
    };
  });
  dispatch(state.update(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of("input")}));
  return true;
};
var transposeChars = ({state, dispatch}) => {
  let changes = state.changeByRange((range) => {
    if (!range.empty || range.from == 0 || range.from == state.doc.length)
      return {range};
    let pos = range.from, line = state.doc.lineAt(pos);
    let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
    let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
    return {
      changes: {from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos))},
      range: EditorSelection.cursor(to)
    };
  });
  if (changes.changes.empty)
    return false;
  dispatch(state.update(changes, {scrollIntoView: true}));
  return true;
};
function selectedLineBlocks(state) {
  let blocks = [], upto = -1;
  for (let range of state.selection.ranges) {
    let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
    if (upto == startLine.number)
      blocks[blocks.length - 1].to = endLine.to;
    else
      blocks.push({from: startLine.from, to: endLine.to});
    upto = endLine.number;
  }
  return blocks;
}
function moveLine(state, dispatch, forward) {
  let changes = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward ? block.to == state.doc.length : block.from == 0)
      continue;
    let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
    if (forward)
      changes.push({from: block.to, to: nextLine.to}, {from: block.from, insert: nextLine.text + state.lineBreak});
    else
      changes.push({from: nextLine.from, to: block.from}, {from: block.to, insert: state.lineBreak + nextLine.text});
  }
  if (!changes.length)
    return false;
  dispatch(state.update({changes, scrollIntoView: true}));
  return true;
}
var moveLineUp = ({state, dispatch}) => moveLine(state, dispatch, false);
var moveLineDown = ({state, dispatch}) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
  let changes = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward)
      changes.push({from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak});
    else
      changes.push({from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to)});
  }
  dispatch(state.update({changes, scrollIntoView: true}));
  return true;
}
var copyLineUp = ({state, dispatch}) => copyLine(state, dispatch, false);
var copyLineDown = ({state, dispatch}) => copyLine(state, dispatch, true);
var deleteLine = (view) => {
  let {state} = view, changes = state.changes(selectedLineBlocks(state).map(({from, to}) => {
    if (from > 0)
      from--;
    else if (to < state.doc.length)
      to++;
    return {from, to};
  }));
  let selection = updateSel(state.selection, (range) => view.moveVertically(range, true)).map(changes);
  view.dispatch({changes, selection, scrollIntoView: true});
  return true;
};
function isBetweenBrackets(state, pos) {
  if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
    return {from: pos, to: pos};
  let context = syntaxTree(state).resolve(pos);
  let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
  if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from)
    return {from: before.to, to: after.from};
  return null;
}
var insertNewlineAndIndent = ({state, dispatch}) => {
  let changes = state.changeByRange(({from, to}) => {
    let explode = from == to && isBetweenBrackets(state, from);
    let cx = new IndentContext(state, {simulateBreak: from, simulateDoubleBreak: !!explode});
    let indent = getIndentation(cx, from);
    if (indent == null)
      indent = /^\s*/.exec(state.doc.lineAt(from).text)[0].length;
    let line = state.doc.lineAt(from);
    while (to < line.to && /\s/.test(line.text.slice(to - line.from, to + 1 - line.from)))
      to++;
    if (explode)
      ({from, to} = explode);
    else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
      from = line.from;
    let insert2 = ["", indentString(state, indent)];
    if (explode)
      insert2.push(indentString(state, cx.lineIndent(line)));
    return {
      changes: {from, to, insert: Text.of(insert2)},
      range: EditorSelection.cursor(from + 1 + insert2[1].length)
    };
  });
  dispatch(state.update(changes, {scrollIntoView: true}));
  return true;
};
function changeBySelectedLine(state, f) {
  let atLine = -1;
  return state.changeByRange((range) => {
    let changes = [];
    for (let pos = range.from; pos <= range.to; ) {
      let line = state.doc.lineAt(pos);
      if (line.number > atLine && (range.empty || range.to > line.from)) {
        f(line, changes, range);
        atLine = line.number;
      }
      pos = line.to + 1;
    }
    let changeSet = state.changes(changes);
    return {
      changes,
      range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
    };
  });
}
var indentSelection = ({state, dispatch}) => {
  let updated = Object.create(null);
  let context = new IndentContext(state, {overrideIndentation: (start) => {
    let found = updated[start];
    return found == null ? -1 : found;
  }});
  let changes = changeBySelectedLine(state, (line, changes2, range) => {
    let indent = getIndentation(context, line.from);
    if (indent == null)
      return;
    let cur2 = /^\s*/.exec(line.text)[0];
    let norm = indentString(state, indent);
    if (cur2 != norm || range.from < line.from + cur2.length) {
      updated[line.from] = indent;
      changes2.push({from: line.from, to: line.from + cur2.length, insert: norm});
    }
  });
  if (!changes.changes.empty)
    dispatch(state.update(changes));
  return true;
};
var indentMore = ({state, dispatch}) => {
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    changes.push({from: line.from, insert: state.facet(indentUnit)});
  })));
  return true;
};
var indentLess = ({state, dispatch}) => {
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    let space4 = /^\s*/.exec(line.text)[0];
    if (!space4)
      return;
    let col = countColumn(space4, 0, state.tabSize), keep = 0;
    let insert2 = indentString(state, Math.max(0, col - getIndentUnit(state)));
    while (keep < space4.length && keep < insert2.length && space4.charCodeAt(keep) == insert2.charCodeAt(keep))
      keep++;
    changes.push({from: line.from + keep, to: line.from + space4.length, insert: insert2.slice(keep)});
  })));
  return true;
};
var emacsStyleKeymap = [
  {key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft},
  {key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight},
  {key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp},
  {key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown},
  {key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart},
  {key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd},
  {key: "Ctrl-d", run: deleteCharForward},
  {key: "Ctrl-h", run: deleteCharBackward},
  {key: "Ctrl-k", run: deleteToLineEnd},
  {key: "Alt-d", run: deleteGroupForward},
  {key: "Ctrl-Alt-h", run: deleteGroupBackward},
  {key: "Ctrl-o", run: splitLine},
  {key: "Ctrl-t", run: transposeChars},
  {key: "Alt-f", run: cursorGroupForward, shift: selectGroupForward},
  {key: "Alt-b", run: cursorGroupBackward, shift: selectGroupBackward},
  {key: "Alt-<", run: cursorDocStart},
  {key: "Alt->", run: cursorDocEnd},
  {key: "Ctrl-v", run: cursorPageDown},
  {key: "Alt-v", run: cursorPageUp}
];
var standardKeymap = /* @__PURE__ */ [
  {key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft},
  {key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft},
  {mac: "Cmd-ArrowLeft", run: cursorLineStart, shift: selectLineStart},
  {key: "ArrowRight", run: cursorCharRight, shift: selectCharRight},
  {key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight},
  {mac: "Cmd-ArrowRight", run: cursorLineEnd, shift: selectLineEnd},
  {key: "ArrowUp", run: cursorLineUp, shift: selectLineUp},
  {mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart},
  {mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp},
  {key: "ArrowDown", run: cursorLineDown, shift: selectLineDown},
  {mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd},
  {mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown},
  {key: "PageUp", run: cursorPageUp, shift: selectPageUp},
  {key: "PageDown", run: cursorPageDown, shift: selectPageDown},
  {key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward},
  {key: "Mod-Home", run: cursorDocStart, shift: selectDocStart},
  {key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward},
  {key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd},
  {key: "Enter", run: insertNewlineAndIndent},
  {key: "Mod-a", run: selectAll},
  {key: "Backspace", run: deleteCodePointBackward, shift: deleteCodePointBackward},
  {key: "Delete", run: deleteCharForward, shift: deleteCharForward},
  {key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward},
  {key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward},
  {mac: "Mod-Backspace", run: deleteToLineStart},
  {mac: "Mod-Delete", run: deleteToLineEnd}
].concat(/* @__PURE__ */ emacsStyleKeymap.map((b) => ({mac: b.key, run: b.run, shift: b.shift})));
var defaultKeymap = /* @__PURE__ */ [
  {key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft},
  {key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight},
  {key: "Alt-ArrowUp", run: moveLineUp},
  {key: "Shift-Alt-ArrowUp", run: copyLineUp},
  {key: "Alt-ArrowDown", run: moveLineDown},
  {key: "Shift-Alt-ArrowDown", run: copyLineDown},
  {key: "Escape", run: simplifySelection},
  {key: "Alt-l", run: selectLine},
  {key: "Mod-i", run: selectParentSyntax},
  {key: "Mod-[", run: indentLess},
  {key: "Mod-]", run: indentMore},
  {key: "Mod-Alt-\\", run: indentSelection},
  {key: "Shift-Mod-k", run: deleteLine},
  {key: "Shift-Mod-\\", run: cursorMatchingBracket}
].concat(standardKeymap);

// ../../node_modules/@codemirror/gutter/dist/index.js
var GutterMarker = class extends RangeValue {
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  toDOM(_view) {
    return null;
  }
  at(pos) {
    return this.range(pos);
  }
};
GutterMarker.prototype.elementClass = "";
GutterMarker.prototype.mapMode = MapMode.TrackBefore;
var defaults2 = {
  class: "",
  renderEmptyElements: false,
  elementStyle: "",
  markers: () => RangeSet.empty,
  lineMarker: () => null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
};
var activeGutters = /* @__PURE__ */ Facet.define();
function gutter(config2) {
  return [gutters(), activeGutters.of(Object.assign(Object.assign({}, defaults2), config2))];
}
var baseTheme5 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-gutters": {
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    left: 0,
    zIndex: 200
  },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#999",
    borderRight: "1px solid #ddd"
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    height: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  }
});
var unfixGutters = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.some((x) => x)
});
function gutters(config2) {
  let result = [
    gutterView,
    baseTheme5
  ];
  if (config2 && config2.fixed === false)
    result.push(unfixGutters.of(true));
  return result;
}
var gutterView = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutters";
    this.dom.setAttribute("aria-hidden", "true");
    this.gutters = view.state.facet(activeGutters).map((conf) => new SingleGutterView(view, conf));
    for (let gutter2 of this.gutters)
      this.dom.appendChild(gutter2.dom);
    this.fixed = !view.state.facet(unfixGutters);
    if (this.fixed) {
      this.dom.style.position = "sticky";
    }
    view.scrollDOM.insertBefore(this.dom, view.contentDOM);
    this.syncGutters();
  }
  update(update) {
    if (this.updateGutters(update))
      this.syncGutters();
  }
  syncGutters() {
    let contexts = this.gutters.map((gutter2) => new UpdateContext(gutter2, this.view.viewport));
    this.view.viewportLines((line) => {
      let text;
      if (Array.isArray(line.type)) {
        for (let b of line.type)
          if (b.type == BlockType.Text) {
            text = b;
            break;
          }
      } else {
        text = line.type == BlockType.Text ? line : void 0;
      }
      if (!text)
        return;
      for (let cx of contexts)
        cx.line(this.view, text);
    }, 0);
    for (let cx of contexts)
      cx.finish();
    this.dom.style.minHeight = this.view.contentHeight + "px";
    if (this.view.state.facet(unfixGutters) != !this.fixed) {
      this.fixed = !this.fixed;
      this.dom.style.position = this.fixed ? "sticky" : "";
    }
  }
  updateGutters(update) {
    let prev = update.startState.facet(activeGutters), cur2 = update.state.facet(activeGutters);
    let change = update.docChanged || update.heightChanged || update.viewportChanged;
    if (prev == cur2) {
      for (let gutter2 of this.gutters)
        if (gutter2.update(update))
          change = true;
    } else {
      change = true;
      let gutters2 = [];
      for (let conf of cur2) {
        let known = prev.indexOf(conf);
        if (known < 0) {
          gutters2.push(new SingleGutterView(this.view, conf));
        } else {
          this.gutters[known].update(update);
          gutters2.push(this.gutters[known]);
        }
      }
      for (let g of this.gutters)
        g.dom.remove();
      for (let g of gutters2)
        this.dom.appendChild(g.dom);
      this.gutters = gutters2;
    }
    return change;
  }
  destroy() {
    this.dom.remove();
  }
}, {
  provide: /* @__PURE__ */ PluginField.scrollMargins.from((value) => {
    if (value.gutters.length == 0 || !value.fixed)
      return null;
    return value.view.textDirection == Direction.LTR ? {left: value.dom.offsetWidth} : {right: value.dom.offsetWidth};
  })
});
function asArray2(val) {
  return Array.isArray(val) ? val : [val];
}
var UpdateContext = class {
  constructor(gutter2, viewport) {
    this.gutter = gutter2;
    this.localMarkers = [];
    this.i = 0;
    this.height = 0;
    this.cursor = RangeSet.iter(gutter2.markers, viewport.from);
  }
  line(view, line) {
    if (this.localMarkers.length)
      this.localMarkers = [];
    while (this.cursor.value && this.cursor.from <= line.from) {
      if (this.cursor.from == line.from)
        this.localMarkers.push(this.cursor.value);
      this.cursor.next();
    }
    let forLine = this.gutter.config.lineMarker(view, line, this.localMarkers);
    if (forLine)
      this.localMarkers.unshift(forLine);
    let gutter2 = this.gutter;
    if (this.localMarkers.length == 0 && !gutter2.config.renderEmptyElements)
      return;
    let above = line.top - this.height;
    if (this.i == gutter2.elements.length) {
      let newElt = new GutterElement(view, line.height, above, this.localMarkers);
      gutter2.elements.push(newElt);
      gutter2.dom.appendChild(newElt.dom);
    } else {
      let markers = this.localMarkers, elt2 = gutter2.elements[this.i];
      if (sameMarkers(markers, elt2.markers)) {
        markers = elt2.markers;
        this.localMarkers.length = 0;
      }
      elt2.update(view, line.height, above, markers);
    }
    this.height = line.bottom;
    this.i++;
  }
  finish() {
    let gutter2 = this.gutter;
    while (gutter2.elements.length > this.i)
      gutter2.dom.removeChild(gutter2.elements.pop().dom);
  }
};
var SingleGutterView = class {
  constructor(view, config2) {
    this.view = view;
    this.config = config2;
    this.elements = [];
    this.spacer = null;
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let prop in config2.domEventHandlers) {
      this.dom.addEventListener(prop, (event) => {
        let line = view.visualLineAtHeight(event.clientY, view.contentDOM.getBoundingClientRect().top);
        if (config2.domEventHandlers[prop](view, line, event))
          event.preventDefault();
      });
    }
    this.markers = asArray2(config2.markers(view));
    if (config2.initialSpacer) {
      this.spacer = new GutterElement(view, 0, 0, [config2.initialSpacer(view)]);
      this.dom.appendChild(this.spacer.dom);
      this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
    }
  }
  update(update) {
    let prevMarkers = this.markers;
    this.markers = asArray2(this.config.markers(update.view));
    if (this.spacer && this.config.updateSpacer) {
      let updated = this.config.updateSpacer(this.spacer.markers[0], update);
      if (updated != this.spacer.markers[0])
        this.spacer.update(update.view, 0, 0, [updated]);
    }
    return this.markers != prevMarkers;
  }
};
var GutterElement = class {
  constructor(view, height, above, markers) {
    this.height = -1;
    this.above = 0;
    this.dom = document.createElement("div");
    this.update(view, height, above, markers);
  }
  update(view, height, above, markers) {
    if (this.height != height)
      this.dom.style.height = (this.height = height) + "px";
    if (this.above != above)
      this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
    if (this.markers != markers) {
      this.markers = markers;
      for (let ch; ch = this.dom.lastChild; )
        ch.remove();
      let cls = "cm-gutterElement";
      for (let m of markers) {
        let dom = m.toDOM(view);
        if (dom)
          this.dom.appendChild(dom);
        let c = m.elementClass;
        if (c)
          cls += " " + c;
      }
      this.dom.className = cls;
    }
  }
};
function sameMarkers(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (!a[i].compare(b[i]))
      return false;
  return true;
}

// ../../node_modules/@codemirror/fold/dist/index.js
function mapRange(range, mapping) {
  let from = mapping.mapPos(range.from, 1), to = mapping.mapPos(range.to, -1);
  return from >= to ? void 0 : {from, to};
}
var foldEffect = StateEffect.define({map: mapRange});
var unfoldEffect = StateEffect.define({map: mapRange});
function selectedLines(view) {
  let lines = [];
  for (let {head} of view.state.selection.ranges) {
    if (lines.some((l) => l.from <= head && l.to >= head))
      continue;
    lines.push(view.visualLineAt(head));
  }
  return lines;
}
var foldState = StateField.define({
  create() {
    return Decoration.none;
  },
  update(folded, tr) {
    folded = folded.map(tr.changes);
    for (let e of tr.effects) {
      if (e.is(foldEffect) && !foldExists(folded, e.value.from, e.value.to))
        folded = folded.update({add: [foldWidget.range(e.value.from, e.value.to)]});
      else if (e.is(unfoldEffect)) {
        folded = folded.update({
          filter: (from, to) => e.value.from != from || e.value.to != to,
          filterFrom: e.value.from,
          filterTo: e.value.to
        });
      }
    }
    if (tr.selection) {
      let onSelection = false, {head} = tr.selection.main;
      folded.between(head, head, (a, b) => {
        if (a < head && b > head)
          onSelection = true;
      });
      if (onSelection)
        folded = folded.update({
          filterFrom: head,
          filterTo: head,
          filter: (a, b) => b <= head || a >= head
        });
    }
    return folded;
  },
  provide: (f) => EditorView.decorations.compute([f], (s) => s.field(f))
});
function foldInside2(state, from, to) {
  var _a;
  let found = null;
  (_a = state.field(foldState, false)) === null || _a === void 0 ? void 0 : _a.between(from, to, (from2, to2) => {
    if (!found || found.from > from2)
      found = {from: from2, to: to2};
  });
  return found;
}
function foldExists(folded, from, to) {
  let found = false;
  folded.between(from, from, (a, b) => {
    if (a == from && b == to)
      found = true;
  });
  return found;
}
function maybeEnable(state, other) {
  return state.field(foldState, false) ? other : other.concat(StateEffect.appendConfig.of(codeFolding()));
}
var foldCode = (view) => {
  for (let line of selectedLines(view)) {
    let range = foldable(view.state, line.from, line.to);
    if (range) {
      view.dispatch({effects: maybeEnable(view.state, [foldEffect.of(range), announceFold(view, range)])});
      return true;
    }
  }
  return false;
};
var unfoldCode = (view) => {
  if (!view.state.field(foldState, false))
    return false;
  let effects = [];
  for (let line of selectedLines(view)) {
    let folded = foldInside2(view.state, line.from, line.to);
    if (folded)
      effects.push(unfoldEffect.of(folded), announceFold(view, folded, false));
  }
  if (effects.length)
    view.dispatch({effects});
  return effects.length > 0;
};
function announceFold(view, range, fold = true) {
  let lineFrom = view.state.doc.lineAt(range.from).number, lineTo = view.state.doc.lineAt(range.to).number;
  return EditorView.announce.of(`${view.state.phrase(fold ? "Folded lines" : "Unfolded lines")} ${lineFrom} ${view.state.phrase("to")} ${lineTo}.`);
}
var foldAll = (view) => {
  let {state} = view, effects = [];
  for (let pos = 0; pos < state.doc.length; ) {
    let line = view.visualLineAt(pos), range = foldable(state, line.from, line.to);
    if (range)
      effects.push(foldEffect.of(range));
    pos = (range ? view.visualLineAt(range.to) : line).to + 1;
  }
  if (effects.length)
    view.dispatch({effects: maybeEnable(view.state, effects)});
  return !!effects.length;
};
var unfoldAll = (view) => {
  let field = view.state.field(foldState, false);
  if (!field || !field.size)
    return false;
  let effects = [];
  field.between(0, view.state.doc.length, (from, to) => {
    effects.push(unfoldEffect.of({from, to}));
  });
  view.dispatch({effects});
  return true;
};
var foldKeymap = [
  {key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: foldCode},
  {key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: unfoldCode},
  {key: "Ctrl-Alt-[", run: foldAll},
  {key: "Ctrl-Alt-]", run: unfoldAll}
];
var defaultConfig = {
  placeholderDOM: null,
  placeholderText: "\u2026"
};
var foldConfig = Facet.define({
  combine(values2) {
    return combineConfig(values2, defaultConfig);
  }
});
function codeFolding(config2) {
  let result = [foldState, baseTheme6];
  if (config2)
    result.push(foldConfig.of(config2));
  return result;
}
var foldWidget = Decoration.replace({widget: new class extends WidgetType {
  ignoreEvents() {
    return false;
  }
  toDOM(view) {
    let {state} = view, conf = state.facet(foldConfig);
    if (conf.placeholderDOM)
      return conf.placeholderDOM();
    let element = document.createElement("span");
    element.textContent = conf.placeholderText;
    element.setAttribute("aria-label", state.phrase("folded code"));
    element.title = state.phrase("unfold");
    element.className = "cm-foldPlaceholder";
    element.onclick = (event) => {
      let line = view.visualLineAt(view.posAtDOM(event.target));
      let folded = foldInside2(view.state, line.from, line.to);
      if (folded)
        view.dispatch({effects: unfoldEffect.of(folded)});
      event.preventDefault();
    };
    return element;
  }
}()});
var foldGutterDefaults = {
  openText: "\u2304",
  closedText: "\u203A"
};
var FoldMarker = class extends GutterMarker {
  constructor(config2, open) {
    super();
    this.config = config2;
    this.open = open;
  }
  eq(other) {
    return this.config == other.config && this.open == other.open;
  }
  toDOM(view) {
    let span2 = document.createElement("span");
    span2.textContent = this.open ? this.config.openText : this.config.closedText;
    span2.title = view.state.phrase(this.open ? "Fold line" : "Unfold line");
    return span2;
  }
};
function foldGutter(config2 = {}) {
  let fullConfig = Object.assign(Object.assign({}, foldGutterDefaults), config2);
  let canFold = new FoldMarker(fullConfig, true), canUnfold = new FoldMarker(fullConfig, false);
  let markers = ViewPlugin.fromClass(class {
    constructor(view) {
      this.from = view.viewport.from;
      this.markers = RangeSet.of(this.buildMarkers(view));
    }
    update(update) {
      let firstChange = -1;
      update.changes.iterChangedRanges((from) => {
        if (firstChange < 0)
          firstChange = from;
      });
      let foldChange = update.startState.field(foldState, false) != update.state.field(foldState, false);
      if (!foldChange && update.docChanged && update.view.viewport.from == this.from && firstChange > this.from) {
        let start = update.view.visualLineAt(firstChange).from;
        this.markers = this.markers.update({
          filter: () => false,
          filterFrom: start,
          add: this.buildMarkers(update.view, start)
        });
      } else if (foldChange || update.docChanged || update.viewportChanged) {
        this.from = update.view.viewport.from;
        this.markers = RangeSet.of(this.buildMarkers(update.view));
      }
    }
    buildMarkers(view, from = 0) {
      let ranges = [];
      view.viewportLines((line) => {
        if (line.from >= from) {
          let mark = foldInside2(view.state, line.from, line.to) ? canUnfold : foldable(view.state, line.from, line.to) ? canFold : null;
          if (mark)
            ranges.push(mark.range(line.from));
        }
      });
      return ranges;
    }
  });
  return [
    markers,
    gutter({
      class: "cm-foldGutter",
      markers(view) {
        var _a;
        return ((_a = view.plugin(markers)) === null || _a === void 0 ? void 0 : _a.markers) || RangeSet.empty;
      },
      initialSpacer() {
        return new FoldMarker(fullConfig, false);
      },
      domEventHandlers: {
        click: (view, line) => {
          let folded = foldInside2(view.state, line.from, line.to);
          if (folded) {
            view.dispatch({effects: unfoldEffect.of(folded)});
            return true;
          }
          let range = foldable(view.state, line.from, line.to);
          if (range) {
            view.dispatch({effects: foldEffect.of(range)});
            return true;
          }
          return false;
        }
      }
    }),
    codeFolding()
  ];
}
var baseTheme6 = EditorView.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter .cm-gutterElement": {
    padding: "0 1px",
    cursor: "pointer"
  }
});

// ../../node_modules/@codemirror/history/dist/index.js
var fromHistory = Annotation.define();
var isolateHistory = Annotation.define();
var invertedEffects = Facet.define();
var historyConfig = Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      minDepth: 100,
      newGroupDelay: 500
    }, {minDepth: Math.max, newGroupDelay: Math.min});
  }
});
var historyField_ = StateField.define({
  create() {
    return HistoryState.empty;
  },
  update(state, tr) {
    let config2 = tr.state.facet(historyConfig);
    let fromHist = tr.annotation(fromHistory);
    if (fromHist) {
      let item = HistEvent.fromTransaction(tr), from = fromHist.side;
      let other = from == 0 ? state.undone : state.done;
      if (item)
        other = updateBranch(other, other.length, config2.minDepth, item);
      else
        other = addSelection(other, tr.startState.selection);
      return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
    }
    let isolate = tr.annotation(isolateHistory);
    if (isolate == "full" || isolate == "before")
      state = state.isolate();
    if (tr.annotation(Transaction.addToHistory) === false)
      return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
    let event = HistEvent.fromTransaction(tr);
    let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
    if (event)
      state = state.addChanges(event, time, userEvent, config2.newGroupDelay, config2.minDepth);
    else if (tr.selection)
      state = state.addSelection(tr.startState.selection, time, userEvent, config2.newGroupDelay);
    if (isolate == "full" || isolate == "after")
      state = state.isolate();
    return state;
  },
  toJSON(value) {
    return {done: value.done.map((e) => e.toJSON()), undone: value.undone.map((e) => e.toJSON())};
  },
  fromJSON(json) {
    return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
  }
});
function history(config2 = {}) {
  return [
    historyField_,
    historyConfig.of(config2),
    EditorView.domEventHandlers({
      beforeinput(e, view) {
        if (e.inputType == "historyUndo")
          return undo(view);
        if (e.inputType == "historyRedo")
          return redo(view);
        return false;
      }
    })
  ];
}
function cmd(side, selection) {
  return function({state, dispatch}) {
    let historyState = state.field(historyField_, false);
    if (!historyState)
      return false;
    let tr = historyState.pop(side, state, selection);
    if (!tr)
      return false;
    dispatch(tr);
    return true;
  };
}
var undo = cmd(0, false);
var redo = cmd(1, false);
var undoSelection = cmd(0, true);
var redoSelection = cmd(1, true);
function depth(side) {
  return function(state) {
    let histState = state.field(historyField_, false);
    if (!histState)
      return 0;
    let branch = side == 0 ? histState.done : histState.undone;
    return branch.length - (branch.length && !branch[0].changes ? 1 : 0);
  };
}
var undoDepth = depth(0);
var redoDepth = depth(1);
var HistEvent = class {
  constructor(changes, effects, mapped, startSelection, selectionsAfter) {
    this.changes = changes;
    this.effects = effects;
    this.mapped = mapped;
    this.startSelection = startSelection;
    this.selectionsAfter = selectionsAfter;
  }
  setSelAfter(after) {
    return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
  }
  toJSON() {
    var _a, _b, _c;
    return {
      changes: (_a = this.changes) === null || _a === void 0 ? void 0 : _a.toJSON(),
      mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
      startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(json) {
    return new HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
  }
  static fromTransaction(tr) {
    let effects = none4;
    for (let invert of tr.startState.facet(invertedEffects)) {
      let result = invert(tr);
      if (result.length)
        effects = effects.concat(result);
    }
    if (!effects.length && tr.changes.empty)
      return null;
    return new HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, tr.startState.selection, none4);
  }
  static selection(selections) {
    return new HistEvent(void 0, none4, void 0, void 0, selections);
  }
};
function updateBranch(branch, to, maxLen, newEvent) {
  let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
  let newBranch = branch.slice(start, to);
  newBranch.push(newEvent);
  return newBranch;
}
function isAdjacent(a, b) {
  let ranges = [], isAdjacent2 = false;
  a.iterChangedRanges((f, t2) => ranges.push(f, t2));
  b.iterChangedRanges((_f, _t, f, t2) => {
    for (let i = 0; i < ranges.length; ) {
      let from = ranges[i++], to = ranges[i++];
      if (t2 >= from && f <= to)
        isAdjacent2 = true;
    }
  });
  return isAdjacent2;
}
function eqSelectionShape(a, b) {
  return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
}
function conc(a, b) {
  return !a.length ? b : !b.length ? a : a.concat(b);
}
var none4 = [];
var MaxSelectionsPerEvent = 200;
function addSelection(branch, selection) {
  if (!branch.length) {
    return [HistEvent.selection([selection])];
  } else {
    let lastEvent = branch[branch.length - 1];
    let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
    if (sels.length && sels[sels.length - 1].eq(selection))
      return branch;
    sels.push(selection);
    return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
  }
}
function popSelection(branch) {
  let last = branch[branch.length - 1];
  let newBranch = branch.slice();
  newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
  return newBranch;
}
function addMappingToBranch(branch, mapping) {
  if (!branch.length)
    return branch;
  let length = branch.length, selections = none4;
  while (length) {
    let event = mapEvent(branch[length - 1], mapping, selections);
    if (event.changes && !event.changes.empty || event.effects.length) {
      let result = branch.slice(0, length);
      result[length - 1] = event;
      return result;
    } else {
      mapping = event.mapped;
      length--;
      selections = event.selectionsAfter;
    }
  }
  return selections.length ? [HistEvent.selection(selections)] : none4;
}
function mapEvent(event, mapping, extraSelections) {
  let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none4, extraSelections);
  if (!event.changes)
    return HistEvent.selection(selections);
  let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
  let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
  return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
}
var HistoryState = class {
  constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
    this.done = done;
    this.undone = undone;
    this.prevTime = prevTime;
    this.prevUserEvent = prevUserEvent;
  }
  isolate() {
    return this.prevTime ? new HistoryState(this.done, this.undone) : this;
  }
  addChanges(event, time, userEvent, newGroupDelay, maxLen) {
    let done = this.done, lastEvent = done[done.length - 1];
    if (lastEvent && lastEvent.changes && time - this.prevTime < newGroupDelay && !lastEvent.selectionsAfter.length && !lastEvent.changes.empty && event.changes && isAdjacent(lastEvent.changes, event.changes)) {
      done = updateBranch(done, done.length - 1, maxLen, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none4));
    } else {
      done = updateBranch(done, done.length, maxLen, event);
    }
    return new HistoryState(done, none4, time, userEvent);
  }
  addSelection(selection, time, userEvent, newGroupDelay) {
    let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none4;
    if (last.length > 0 && time - this.prevTime < newGroupDelay && userEvent == "keyboardselection" && this.prevUserEvent == userEvent && eqSelectionShape(last[last.length - 1], selection))
      return this;
    return new HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
  }
  addMapping(mapping) {
    return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
  }
  pop(side, state, selection) {
    let branch = side == 0 ? this.done : this.undone;
    if (branch.length == 0)
      return null;
    let event = branch[branch.length - 1];
    if (selection && event.selectionsAfter.length) {
      return state.update({
        selection: event.selectionsAfter[event.selectionsAfter.length - 1],
        annotations: fromHistory.of({side, rest: popSelection(branch)})
      });
    } else if (!event.changes) {
      return null;
    } else {
      let rest = branch.length == 1 ? none4 : branch.slice(0, branch.length - 1);
      if (event.mapped)
        rest = addMappingToBranch(rest, event.mapped);
      return state.update({
        changes: event.changes,
        selection: event.startSelection,
        effects: event.effects,
        annotations: fromHistory.of({side, rest}),
        filter: false
      });
    }
  }
};
HistoryState.empty = new HistoryState(none4, none4);
var historyKeymap = [
  {key: "Mod-z", run: undo, preventDefault: true},
  {key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true},
  {key: "Mod-u", run: undoSelection, preventDefault: true},
  {key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true}
];

// ../../node_modules/lezer/dist/index.es.js
var Stack = class {
  constructor(p, stack, state, reducePos, pos, score2, buffer, bufferBase, curContext, parent) {
    this.p = p;
    this.stack = stack;
    this.state = state;
    this.reducePos = reducePos;
    this.pos = pos;
    this.score = score2;
    this.buffer = buffer;
    this.bufferBase = bufferBase;
    this.curContext = curContext;
    this.parent = parent;
  }
  toString() {
    return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  static start(p, state, pos = 0) {
    let cx = p.parser.context;
    return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, null);
  }
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  pushState(state, start) {
    this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
    this.state = state;
  }
  reduce(action) {
    let depth2 = action >> 19, type = action & 65535;
    let {parser: parser5} = this.p;
    let dPrec = parser5.dynamicPrecedence(type);
    if (dPrec)
      this.score += dPrec;
    if (depth2 == 0) {
      if (type < parser5.minRepeatTerm)
        this.storeNode(type, this.reducePos, this.reducePos, 4, true);
      this.pushState(parser5.getGoto(this.state, type, true), this.reducePos);
      this.reduceContext(type);
      return;
    }
    let base2 = this.stack.length - (depth2 - 1) * 3 - (action & 262144 ? 6 : 0);
    let start = this.stack[base2 - 2];
    let bufferBase = this.stack[base2 - 1], count = this.bufferBase + this.buffer.length - bufferBase;
    if (type < parser5.minRepeatTerm || action & 131072) {
      let pos = parser5.stateFlag(this.state, 1) ? this.pos : this.reducePos;
      this.storeNode(type, start, pos, count + 4, true);
    }
    if (action & 262144) {
      this.state = this.stack[base2];
    } else {
      let baseStateID = this.stack[base2 - 3];
      this.state = parser5.getGoto(baseStateID, type, true);
    }
    while (this.stack.length > base2)
      this.stack.pop();
    this.reduceContext(type);
  }
  storeNode(term, start, end, size = 4, isReduce = false) {
    if (term == 0) {
      let cur2 = this, top2 = this.buffer.length;
      if (top2 == 0 && cur2.parent) {
        top2 = cur2.bufferBase - cur2.parent.bufferBase;
        cur2 = cur2.parent;
      }
      if (top2 > 0 && cur2.buffer[top2 - 4] == 0 && cur2.buffer[top2 - 1] > -1) {
        if (start == end)
          return;
        if (cur2.buffer[top2 - 2] >= start) {
          cur2.buffer[top2 - 2] = end;
          return;
        }
      }
    }
    if (!isReduce || this.pos == end) {
      this.buffer.push(term, start, end, size);
    } else {
      let index = this.buffer.length;
      if (index > 0 && this.buffer[index - 4] != 0)
        while (index > 0 && this.buffer[index - 2] > end) {
          this.buffer[index] = this.buffer[index - 4];
          this.buffer[index + 1] = this.buffer[index - 3];
          this.buffer[index + 2] = this.buffer[index - 2];
          this.buffer[index + 3] = this.buffer[index - 1];
          index -= 4;
          if (size > 4)
            size -= 4;
        }
      this.buffer[index] = term;
      this.buffer[index + 1] = start;
      this.buffer[index + 2] = end;
      this.buffer[index + 3] = size;
    }
  }
  shift(action, next, nextEnd) {
    if (action & 131072) {
      this.pushState(action & 65535, this.pos);
    } else if ((action & 262144) == 0) {
      let start = this.pos, nextState = action, {parser: parser5} = this.p;
      if (nextEnd > this.pos || next <= parser5.maxNode) {
        this.pos = nextEnd;
        if (!parser5.stateFlag(nextState, 1))
          this.reducePos = nextEnd;
      }
      this.pushState(nextState, start);
      if (next <= parser5.maxNode)
        this.buffer.push(next, start, nextEnd, 4);
      this.shiftContext(next);
    } else {
      if (next <= this.p.parser.maxNode)
        this.buffer.push(next, this.pos, nextEnd, 4);
      this.pos = nextEnd;
    }
  }
  apply(action, next, nextEnd) {
    if (action & 65536)
      this.reduce(action);
    else
      this.shift(action, next, nextEnd);
  }
  useNode(value, next) {
    let index = this.p.reused.length - 1;
    if (index < 0 || this.p.reused[index] != value) {
      this.p.reused.push(value);
      index++;
    }
    let start = this.pos;
    this.reducePos = this.pos = start + value.length;
    this.pushState(next, start);
    this.buffer.push(index, start, this.reducePos, -1);
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this.p.input, this));
  }
  split() {
    let parent = this;
    let off = parent.buffer.length;
    while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
      off -= 4;
    let buffer = parent.buffer.slice(off), base2 = parent.bufferBase + off;
    while (parent && base2 == parent.bufferBase)
      parent = parent.parent;
    return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base2, this.curContext, parent);
  }
  recoverByDelete(next, nextEnd) {
    let isNode = next <= this.p.parser.maxNode;
    if (isNode)
      this.storeNode(next, this.pos, nextEnd);
    this.storeNode(0, this.pos, nextEnd, isNode ? 8 : 4);
    this.pos = this.reducePos = nextEnd;
    this.score -= 200;
  }
  canShift(term) {
    for (let sim = new SimulatedStack(this); ; ) {
      let action = this.p.parser.stateSlot(sim.top, 4) || this.p.parser.hasAction(sim.top, term);
      if ((action & 65536) == 0)
        return true;
      if (action == 0)
        return false;
      sim.reduce(action);
    }
  }
  get ruleStart() {
    for (let state = this.state, base2 = this.stack.length; ; ) {
      let force = this.p.parser.stateSlot(state, 5);
      if (!(force & 65536))
        return 0;
      base2 -= 3 * (force >> 19);
      if ((force & 65535) < this.p.parser.minRepeatTerm)
        return this.stack[base2 + 1];
      state = this.stack[base2];
    }
  }
  startOf(types2, before) {
    let state = this.state, frame = this.stack.length, {parser: parser5} = this.p;
    for (; ; ) {
      let force = parser5.stateSlot(state, 5);
      let depth2 = force >> 19, term = force & 65535;
      if (types2.indexOf(term) > -1) {
        let base2 = frame - 3 * (force >> 19), pos = this.stack[base2 + 1];
        if (before == null || before > pos)
          return pos;
      }
      if (frame == 0)
        return null;
      if (depth2 == 0) {
        frame -= 3;
        state = this.stack[frame];
      } else {
        frame -= 3 * (depth2 - 1);
        state = parser5.getGoto(this.stack[frame - 3], term, true);
      }
    }
  }
  recoverByInsert(next) {
    if (this.stack.length >= 300)
      return [];
    let nextStates = this.p.parser.nextStates(this.state);
    if (nextStates.length > 4 << 1 || this.stack.length >= 120) {
      let best = [];
      for (let i = 0, s; i < nextStates.length; i += 2) {
        if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
          best.push(nextStates[i], s);
      }
      if (this.stack.length < 120)
        for (let i = 0; best.length < 4 << 1 && i < nextStates.length; i += 2) {
          let s = nextStates[i + 1];
          if (!best.some((v, i2) => i2 & 1 && v == s))
            best.push(nextStates[i], s);
        }
      nextStates = best;
    }
    let result = [];
    for (let i = 0; i < nextStates.length && result.length < 4; i += 2) {
      let s = nextStates[i + 1];
      if (s == this.state)
        continue;
      let stack = this.split();
      stack.storeNode(0, stack.pos, stack.pos, 4, true);
      stack.pushState(s, this.pos);
      stack.shiftContext(nextStates[i]);
      stack.score -= 200;
      result.push(stack);
    }
    return result;
  }
  forceReduce() {
    let reduce = this.p.parser.stateSlot(this.state, 5);
    if ((reduce & 65536) == 0)
      return false;
    if (!this.p.parser.validAction(this.state, reduce)) {
      this.storeNode(0, this.reducePos, this.reducePos, 4, true);
      this.score -= 100;
    }
    this.reduce(reduce);
    return true;
  }
  forceAll() {
    while (!this.p.parser.stateFlag(this.state, 2) && this.forceReduce()) {
    }
    return this;
  }
  get deadEnd() {
    if (this.stack.length != 3)
      return false;
    let {parser: parser5} = this.p;
    return parser5.data[parser5.stateSlot(this.state, 1)] == 65535 && !parser5.stateSlot(this.state, 4);
  }
  restart() {
    this.state = this.stack[0];
    this.stack.length = 0;
  }
  sameState(other) {
    if (this.state != other.state || this.stack.length != other.stack.length)
      return false;
    for (let i = 0; i < this.stack.length; i += 3)
      if (this.stack[i] != other.stack[i])
        return false;
    return true;
  }
  get parser() {
    return this.p.parser;
  }
  dialectEnabled(dialectID) {
    return this.p.parser.dialect.flags[dialectID];
  }
  shiftContext(term) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this.p.input, this));
  }
  reduceContext(term) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this.p.input, this));
  }
  emitContext() {
    let cx = this.curContext;
    if (!cx.tracker.strict)
      return;
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -2)
      this.buffer.push(cx.hash, this.reducePos, this.reducePos, -2);
  }
  updateContext(context) {
    if (context != this.curContext.context) {
      let newCx = new StackContext(this.curContext.tracker, context);
      if (newCx.hash != this.curContext.hash)
        this.emitContext();
      this.curContext = newCx;
    }
  }
};
var StackContext = class {
  constructor(tracker, context) {
    this.tracker = tracker;
    this.context = context;
    this.hash = tracker.hash(context);
  }
};
var Recover;
(function(Recover2) {
  Recover2[Recover2["Token"] = 200] = "Token";
  Recover2[Recover2["Reduce"] = 100] = "Reduce";
  Recover2[Recover2["MaxNext"] = 4] = "MaxNext";
  Recover2[Recover2["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
  Recover2[Recover2["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
})(Recover || (Recover = {}));
var SimulatedStack = class {
  constructor(stack) {
    this.stack = stack;
    this.top = stack.state;
    this.rest = stack.stack;
    this.offset = this.rest.length;
  }
  reduce(action) {
    let term = action & 65535, depth2 = action >> 19;
    if (depth2 == 0) {
      if (this.rest == this.stack.stack)
        this.rest = this.rest.slice();
      this.rest.push(this.top, 0, 0);
      this.offset += 3;
    } else {
      this.offset -= (depth2 - 1) * 3;
    }
    let goto = this.stack.p.parser.getGoto(this.rest[this.offset - 3], term, true);
    this.top = goto;
  }
};
var StackBufferCursor = class {
  constructor(stack, pos, index) {
    this.stack = stack;
    this.pos = pos;
    this.index = index;
    this.buffer = stack.buffer;
    if (this.index == 0)
      this.maybeNext();
  }
  static create(stack) {
    return new StackBufferCursor(stack, stack.bufferBase + stack.buffer.length, stack.buffer.length);
  }
  maybeNext() {
    let next = this.stack.parent;
    if (next != null) {
      this.index = this.stack.bufferBase - next.bufferBase;
      this.stack = next;
      this.buffer = next.buffer;
    }
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4;
    this.pos -= 4;
    if (this.index == 0)
      this.maybeNext();
  }
  fork() {
    return new StackBufferCursor(this.stack, this.pos, this.index);
  }
};
var Token = class {
  constructor() {
    this.start = -1;
    this.value = -1;
    this.end = -1;
  }
  accept(value, end) {
    this.value = value;
    this.end = end;
  }
};
var TokenGroup = class {
  constructor(data2, id2) {
    this.data = data2;
    this.id = id2;
  }
  token(input, token, stack) {
    readToken(this.data, input, token, stack, this.id);
  }
};
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
var ExternalTokenizer = class {
  constructor(token, options = {}) {
    this.token = token;
    this.contextual = !!options.contextual;
    this.fallback = !!options.fallback;
    this.extend = !!options.extend;
  }
};
function readToken(data2, input, token, stack, group) {
  let state = 0, groupMask = 1 << group, dialect = stack.p.parser.dialect;
  scan:
    for (let pos = token.start; ; ) {
      if ((groupMask & data2[state]) == 0)
        break;
      let accEnd = data2[state + 1];
      for (let i = state + 3; i < accEnd; i += 2)
        if ((data2[i + 1] & groupMask) > 0) {
          let term = data2[i];
          if (dialect.allows(term) && (token.value == -1 || token.value == term || stack.p.parser.overrides(term, token.value))) {
            token.accept(term, pos);
            break;
          }
        }
      let next = input.get(pos++);
      for (let low = 0, high = data2[state + 2]; low < high; ) {
        let mid = low + high >> 1;
        let index = accEnd + mid + (mid << 1);
        let from = data2[index], to = data2[index + 1];
        if (next < from)
          high = mid;
        else if (next >= to)
          low = mid + 1;
        else {
          state = data2[index + 2];
          continue scan;
        }
      }
      break;
    }
}
function decodeArray(input, Type2 = Uint16Array) {
  if (typeof input != "string")
    return input;
  let array = null;
  for (let pos = 0, out = 0; pos < input.length; ) {
    let value = 0;
    for (; ; ) {
      let next = input.charCodeAt(pos++), stop = false;
      if (next == 126) {
        value = 65535;
        break;
      }
      if (next >= 92)
        next--;
      if (next >= 34)
        next--;
      let digit = next - 32;
      if (digit >= 46) {
        digit -= 46;
        stop = true;
      }
      value += digit;
      if (stop)
        break;
      value *= 46;
    }
    if (array)
      array[out++] = value;
    else
      array = new Type2(value);
  }
  return array;
}
var verbose = typeof process != "undefined" && /\bparse\b/.test(process.env.LOG);
var stackIDs = null;
function cutAt(tree, pos, side) {
  let cursor = tree.cursor(pos);
  for (; ; ) {
    if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
      for (; ; ) {
        if ((side < 0 ? cursor.to <= pos : cursor.from >= pos) && !cursor.type.isError)
          return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 5)) : Math.min(tree.length, Math.max(cursor.from + 1, pos + 5));
        if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
          break;
        if (!cursor.parent())
          return side < 0 ? 0 : tree.length;
      }
  }
}
var FragmentCursor = class {
  constructor(fragments) {
    this.fragments = fragments;
    this.i = 0;
    this.fragment = null;
    this.safeFrom = -1;
    this.safeTo = -1;
    this.trees = [];
    this.start = [];
    this.index = [];
    this.nextFragment();
  }
  nextFragment() {
    let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (fr) {
      this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
      this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
      while (this.trees.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
      }
      this.trees.push(fr.tree);
      this.start.push(-fr.offset);
      this.index.push(0);
      this.nextStart = this.safeFrom;
    } else {
      this.nextStart = 1e9;
    }
  }
  nodeAt(pos) {
    if (pos < this.nextStart)
      return null;
    while (this.fragment && this.safeTo <= pos)
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let last = this.trees.length - 1;
      if (last < 0) {
        this.nextFragment();
        return null;
      }
      let top2 = this.trees[last], index = this.index[last];
      if (index == top2.children.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
        continue;
      }
      let next = top2.children[index];
      let start = this.start[last] + top2.positions[index];
      if (start > pos) {
        this.nextStart = start;
        return null;
      } else if (start == pos && start + next.length <= this.safeTo) {
        return start == pos && start >= this.safeFrom ? next : null;
      }
      if (next instanceof TreeBuffer) {
        this.index[last]++;
        this.nextStart = start + next.length;
      } else {
        this.index[last]++;
        if (start + next.length >= pos) {
          this.trees.push(next);
          this.start.push(start);
          this.index.push(0);
        }
      }
    }
  }
};
var CachedToken = class extends Token {
  constructor() {
    super(...arguments);
    this.extended = -1;
    this.mask = 0;
    this.context = 0;
  }
  clear(start) {
    this.start = start;
    this.value = this.extended = -1;
  }
};
var dummyToken = new Token();
var TokenCache = class {
  constructor(parser5) {
    this.tokens = [];
    this.mainToken = dummyToken;
    this.actions = [];
    this.tokens = parser5.tokenizers.map((_) => new CachedToken());
  }
  getActions(stack, input) {
    let actionIndex = 0;
    let main = null;
    let {parser: parser5} = stack.p, {tokenizers} = parser5;
    let mask = parser5.stateSlot(stack.state, 3);
    let context = stack.curContext ? stack.curContext.hash : 0;
    for (let i = 0; i < tokenizers.length; i++) {
      if ((1 << i & mask) == 0)
        continue;
      let tokenizer = tokenizers[i], token = this.tokens[i];
      if (main && !tokenizer.fallback)
        continue;
      if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
        this.updateCachedToken(token, tokenizer, stack, input);
        token.mask = mask;
        token.context = context;
      }
      if (token.value != 0) {
        let startIndex = actionIndex;
        if (token.extended > -1)
          actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
        actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
        if (!tokenizer.extend) {
          main = token;
          if (actionIndex > startIndex)
            break;
        }
      }
    }
    while (this.actions.length > actionIndex)
      this.actions.pop();
    if (!main) {
      main = dummyToken;
      main.start = stack.pos;
      if (stack.pos == input.length)
        main.accept(stack.p.parser.eofTerm, stack.pos);
      else
        main.accept(0, stack.pos + 1);
    }
    this.mainToken = main;
    return this.actions;
  }
  updateCachedToken(token, tokenizer, stack, input) {
    token.clear(stack.pos);
    tokenizer.token(input, token, stack);
    if (token.value > -1) {
      let {parser: parser5} = stack.p;
      for (let i = 0; i < parser5.specialized.length; i++)
        if (parser5.specialized[i] == token.value) {
          let result = parser5.specializers[i](input.read(token.start, token.end), stack);
          if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
            if ((result & 1) == 0)
              token.value = result >> 1;
            else
              token.extended = result >> 1;
            break;
          }
        }
    } else if (stack.pos == input.length) {
      token.accept(stack.p.parser.eofTerm, stack.pos);
    } else {
      token.accept(0, stack.pos + 1);
    }
  }
  putAction(action, token, end, index) {
    for (let i = 0; i < index; i += 3)
      if (this.actions[i] == action)
        return index;
    this.actions[index++] = action;
    this.actions[index++] = token;
    this.actions[index++] = end;
    return index;
  }
  addActions(stack, token, end, index) {
    let {state} = stack, {parser: parser5} = stack.p, {data: data2} = parser5;
    for (let set = 0; set < 2; set++) {
      for (let i = parser5.stateSlot(state, set ? 2 : 1); ; i += 3) {
        if (data2[i] == 65535) {
          if (data2[i + 1] == 1) {
            i = pair(data2, i + 2);
          } else {
            if (index == 0 && data2[i + 1] == 2)
              index = this.putAction(pair(data2, i + 1), token, end, index);
            break;
          }
        }
        if (data2[i] == token)
          index = this.putAction(pair(data2, i + 1), token, end, index);
      }
    }
    return index;
  }
};
var Rec;
(function(Rec2) {
  Rec2[Rec2["Distance"] = 5] = "Distance";
  Rec2[Rec2["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
  Rec2[Rec2["MinBufferLengthPrune"] = 200] = "MinBufferLengthPrune";
  Rec2[Rec2["ForceReduceLimit"] = 10] = "ForceReduceLimit";
})(Rec || (Rec = {}));
var Parse = class {
  constructor(parser5, input, startPos, context) {
    this.parser = parser5;
    this.input = input;
    this.startPos = startPos;
    this.context = context;
    this.pos = 0;
    this.recovering = 0;
    this.nextStackID = 9812;
    this.nested = null;
    this.nestEnd = 0;
    this.nestWrap = null;
    this.reused = [];
    this.tokens = new TokenCache(parser5);
    this.topTerm = parser5.top[1];
    this.stacks = [Stack.start(this, parser5.top[0], this.startPos)];
    let fragments = context === null || context === void 0 ? void 0 : context.fragments;
    this.fragments = fragments && fragments.length ? new FragmentCursor(fragments) : null;
  }
  advance() {
    if (this.nested) {
      let result = this.nested.advance();
      this.pos = this.nested.pos;
      if (result) {
        this.finishNested(this.stacks[0], result);
        this.nested = null;
      }
      return null;
    }
    let stacks = this.stacks, pos = this.pos;
    let newStacks = this.stacks = [];
    let stopped, stoppedTokens;
    let maybeNest;
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i], nest;
      for (; ; ) {
        if (stack.pos > pos) {
          newStacks.push(stack);
        } else if (nest = this.checkNest(stack)) {
          if (!maybeNest || maybeNest.stack.score < stack.score)
            maybeNest = nest;
        } else if (this.advanceStack(stack, newStacks, stacks)) {
          continue;
        } else {
          if (!stopped) {
            stopped = [];
            stoppedTokens = [];
          }
          stopped.push(stack);
          let tok = this.tokens.mainToken;
          stoppedTokens.push(tok.value, tok.end);
        }
        break;
      }
    }
    if (maybeNest) {
      this.startNested(maybeNest);
      return null;
    }
    if (!newStacks.length) {
      let finished = stopped && findFinished(stopped);
      if (finished)
        return this.stackToTree(finished);
      if (this.parser.strict) {
        if (verbose && stopped)
          console.log("Stuck with token " + this.parser.getName(this.tokens.mainToken.value));
        throw new SyntaxError("No parse at " + pos);
      }
      if (!this.recovering)
        this.recovering = 5;
    }
    if (this.recovering && stopped) {
      let finished = this.runRecovery(stopped, stoppedTokens, newStacks);
      if (finished)
        return this.stackToTree(finished.forceAll());
    }
    if (this.recovering) {
      let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3;
      if (newStacks.length > maxRemaining) {
        newStacks.sort((a, b) => b.score - a.score);
        while (newStacks.length > maxRemaining)
          newStacks.pop();
      }
      if (newStacks.some((s) => s.reducePos > pos))
        this.recovering--;
    } else if (newStacks.length > 1) {
      outer:
        for (let i = 0; i < newStacks.length - 1; i++) {
          let stack = newStacks[i];
          for (let j = i + 1; j < newStacks.length; j++) {
            let other = newStacks[j];
            if (stack.sameState(other) || stack.buffer.length > 200 && other.buffer.length > 200) {
              if ((stack.score - other.score || stack.buffer.length - other.buffer.length) > 0) {
                newStacks.splice(j--, 1);
              } else {
                newStacks.splice(i--, 1);
                continue outer;
              }
            }
          }
        }
    }
    this.pos = newStacks[0].pos;
    for (let i = 1; i < newStacks.length; i++)
      if (newStacks[i].pos < this.pos)
        this.pos = newStacks[i].pos;
    return null;
  }
  advanceStack(stack, stacks, split) {
    let start = stack.pos, {input, parser: parser5} = this;
    let base2 = verbose ? this.stackID(stack) + " -> " : "";
    if (this.fragments) {
      let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
      for (let cached = this.fragments.nodeAt(start); cached; ) {
        let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser5.getGoto(stack.state, cached.type.id) : -1;
        if (match > -1 && cached.length && (!strictCx || (cached.contextHash || 0) == cxHash)) {
          stack.useNode(cached, match);
          if (verbose)
            console.log(base2 + this.stackID(stack) + ` (via reuse of ${parser5.getName(cached.type.id)})`);
          return true;
        }
        if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
          break;
        let inner = cached.children[0];
        if (inner instanceof Tree)
          cached = inner;
        else
          break;
      }
    }
    let defaultReduce = parser5.stateSlot(stack.state, 4);
    if (defaultReduce > 0) {
      stack.reduce(defaultReduce);
      if (verbose)
        console.log(base2 + this.stackID(stack) + ` (via always-reduce ${parser5.getName(defaultReduce & 65535)})`);
      return true;
    }
    let actions = this.tokens.getActions(stack, input);
    for (let i = 0; i < actions.length; ) {
      let action = actions[i++], term = actions[i++], end = actions[i++];
      let last = i == actions.length || !split;
      let localStack = last ? stack : stack.split();
      localStack.apply(action, term, end);
      if (verbose)
        console.log(base2 + this.stackID(localStack) + ` (via ${(action & 65536) == 0 ? "shift" : `reduce of ${parser5.getName(action & 65535)}`} for ${parser5.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
      if (last)
        return true;
      else if (localStack.pos > start)
        stacks.push(localStack);
      else
        split.push(localStack);
    }
    return false;
  }
  advanceFully(stack, newStacks) {
    let pos = stack.pos;
    for (; ; ) {
      let nest = this.checkNest(stack);
      if (nest)
        return nest;
      if (!this.advanceStack(stack, null, null))
        return false;
      if (stack.pos > pos) {
        pushStackDedup(stack, newStacks);
        return true;
      }
    }
  }
  runRecovery(stacks, tokens, newStacks) {
    let finished = null, restarted = false;
    let maybeNest;
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
      let base2 = verbose ? this.stackID(stack) + " -> " : "";
      if (stack.deadEnd) {
        if (restarted)
          continue;
        restarted = true;
        stack.restart();
        if (verbose)
          console.log(base2 + this.stackID(stack) + " (restarted)");
        let done = this.advanceFully(stack, newStacks);
        if (done) {
          if (done !== true)
            maybeNest = done;
          continue;
        }
      }
      let force = stack.split(), forceBase = base2;
      for (let j = 0; force.forceReduce() && j < 10; j++) {
        if (verbose)
          console.log(forceBase + this.stackID(force) + " (via force-reduce)");
        let done = this.advanceFully(force, newStacks);
        if (done) {
          if (done !== true)
            maybeNest = done;
          break;
        }
        if (verbose)
          forceBase = this.stackID(force) + " -> ";
      }
      for (let insert2 of stack.recoverByInsert(token)) {
        if (verbose)
          console.log(base2 + this.stackID(insert2) + " (via recover-insert)");
        this.advanceFully(insert2, newStacks);
      }
      if (this.input.length > stack.pos) {
        if (tokenEnd == stack.pos) {
          tokenEnd++;
          token = 0;
        }
        stack.recoverByDelete(token, tokenEnd);
        if (verbose)
          console.log(base2 + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
        pushStackDedup(stack, newStacks);
      } else if (!finished || finished.score < stack.score) {
        finished = stack;
      }
    }
    if (finished)
      return finished;
    if (maybeNest) {
      for (let s of this.stacks)
        if (s.score > maybeNest.stack.score) {
          maybeNest = void 0;
          break;
        }
    }
    if (maybeNest)
      this.startNested(maybeNest);
    return null;
  }
  forceFinish() {
    let stack = this.stacks[0].split();
    if (this.nested)
      this.finishNested(stack, this.nested.forceFinish());
    return this.stackToTree(stack.forceAll());
  }
  stackToTree(stack, pos = stack.pos) {
    if (this.parser.context)
      stack.emitContext();
    return Tree.build({
      buffer: StackBufferCursor.create(stack),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.startPos,
      length: pos - this.startPos,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  checkNest(stack) {
    let info = this.parser.findNested(stack.state);
    if (!info)
      return null;
    let spec = info.value;
    if (typeof spec == "function")
      spec = spec(this.input, stack);
    return spec ? {stack, info, spec} : null;
  }
  startNested(nest) {
    let {stack, info, spec} = nest;
    this.stacks = [stack];
    this.nestEnd = this.scanForNestEnd(stack, info.end, spec.filterEnd);
    this.nestWrap = typeof spec.wrapType == "number" ? this.parser.nodeSet.types[spec.wrapType] : spec.wrapType || null;
    if (spec.startParse) {
      this.nested = spec.startParse(this.input.clip(this.nestEnd), stack.pos, this.context);
    } else {
      this.finishNested(stack);
    }
  }
  scanForNestEnd(stack, endToken, filter) {
    for (let pos = stack.pos; pos < this.input.length; pos++) {
      dummyToken.start = pos;
      dummyToken.value = -1;
      endToken.token(this.input, dummyToken, stack);
      if (dummyToken.value > -1 && (!filter || filter(this.input.read(pos, dummyToken.end))))
        return pos;
    }
    return this.input.length;
  }
  finishNested(stack, tree) {
    if (this.nestWrap)
      tree = new Tree(this.nestWrap, tree ? [tree] : [], tree ? [0] : [], this.nestEnd - stack.pos);
    else if (!tree)
      tree = new Tree(NodeType.none, [], [], this.nestEnd - stack.pos);
    let info = this.parser.findNested(stack.state);
    stack.useNode(tree, this.parser.getGoto(stack.state, info.placeholder, true));
    if (verbose)
      console.log(this.stackID(stack) + ` (via unnest)`);
  }
  stackID(stack) {
    let id2 = (stackIDs || (stackIDs = new WeakMap())).get(stack);
    if (!id2)
      stackIDs.set(stack, id2 = String.fromCodePoint(this.nextStackID++));
    return id2 + stack;
  }
};
function pushStackDedup(stack, newStacks) {
  for (let i = 0; i < newStacks.length; i++) {
    let other = newStacks[i];
    if (other.pos == stack.pos && other.sameState(stack)) {
      if (newStacks[i].score < stack.score)
        newStacks[i] = stack;
      return;
    }
  }
  newStacks.push(stack);
}
var Dialect = class {
  constructor(source, flags, disabled) {
    this.source = source;
    this.flags = flags;
    this.disabled = disabled;
  }
  allows(term) {
    return !this.disabled || this.disabled[term] == 0;
  }
};
var id = (x) => x;
var ContextTracker = class {
  constructor(spec) {
    this.start = spec.start;
    this.shift = spec.shift || id;
    this.reduce = spec.reduce || id;
    this.reuse = spec.reuse || id;
    this.hash = spec.hash;
    this.strict = spec.strict !== false;
  }
};
var Parser = class {
  constructor(spec) {
    this.bufferLength = DefaultBufferLength;
    this.strict = false;
    this.cachedDialect = null;
    if (spec.version != 13)
      throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${13})`);
    let tokenArray = decodeArray(spec.tokenData);
    let nodeNames = spec.nodeNames.split(" ");
    this.minRepeatTerm = nodeNames.length;
    this.context = spec.context;
    for (let i = 0; i < spec.repeatNodeCount; i++)
      nodeNames.push("");
    let nodeProps = [];
    for (let i = 0; i < nodeNames.length; i++)
      nodeProps.push([]);
    function setProp(nodeID, prop, value) {
      nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
    }
    if (spec.nodeProps)
      for (let propSpec of spec.nodeProps) {
        let prop = propSpec[0];
        for (let i = 1; i < propSpec.length; ) {
          let next = propSpec[i++];
          if (next >= 0) {
            setProp(next, prop, propSpec[i++]);
          } else {
            let value = propSpec[i + -next];
            for (let j = -next; j > 0; j--)
              setProp(propSpec[i++], prop, value);
            i++;
          }
        }
      }
    this.specialized = new Uint16Array(spec.specialized ? spec.specialized.length : 0);
    this.specializers = [];
    if (spec.specialized)
      for (let i = 0; i < spec.specialized.length; i++) {
        this.specialized[i] = spec.specialized[i].term;
        this.specializers[i] = spec.specialized[i].get;
      }
    this.states = decodeArray(spec.states, Uint32Array);
    this.data = decodeArray(spec.stateData);
    this.goto = decodeArray(spec.goto);
    let topTerms = Object.keys(spec.topRules).map((r) => spec.topRules[r][1]);
    this.nodeSet = new NodeSet(nodeNames.map((name2, i) => NodeType.define({
      name: i >= this.minRepeatTerm ? void 0 : name2,
      id: i,
      props: nodeProps[i],
      top: topTerms.indexOf(i) > -1,
      error: i == 0,
      skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
    })));
    this.maxTerm = spec.maxTerm;
    this.tokenizers = spec.tokenizers.map((value) => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
    this.topRules = spec.topRules;
    this.nested = (spec.nested || []).map(([name2, value, endToken, placeholder]) => {
      return {name: name2, value, end: new TokenGroup(decodeArray(endToken), 0), placeholder};
    });
    this.dialects = spec.dialects || {};
    this.dynamicPrecedences = spec.dynamicPrecedences || null;
    this.tokenPrecTable = spec.tokenPrec;
    this.termNames = spec.termNames || null;
    this.maxNode = this.nodeSet.types.length - 1;
    this.dialect = this.parseDialect();
    this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  parse(input, startPos = 0, context = {}) {
    if (typeof input == "string")
      input = stringInput(input);
    let cx = new Parse(this, input, startPos, context);
    for (; ; ) {
      let done = cx.advance();
      if (done)
        return done;
    }
  }
  startParse(input, startPos = 0, context = {}) {
    if (typeof input == "string")
      input = stringInput(input);
    return new Parse(this, input, startPos, context);
  }
  getGoto(state, term, loose = false) {
    let table = this.goto;
    if (term >= table[0])
      return -1;
    for (let pos = table[term + 1]; ; ) {
      let groupTag = table[pos++], last = groupTag & 1;
      let target = table[pos++];
      if (last && loose)
        return target;
      for (let end = pos + (groupTag >> 1); pos < end; pos++)
        if (table[pos] == state)
          return target;
      if (last)
        return -1;
    }
  }
  hasAction(state, terminal) {
    let data2 = this.data;
    for (let set = 0; set < 2; set++) {
      for (let i = this.stateSlot(state, set ? 2 : 1), next; ; i += 3) {
        if ((next = data2[i]) == 65535) {
          if (data2[i + 1] == 1)
            next = data2[i = pair(data2, i + 2)];
          else if (data2[i + 1] == 2)
            return pair(data2, i + 2);
          else
            break;
        }
        if (next == terminal || next == 0)
          return pair(data2, i + 1);
      }
    }
    return 0;
  }
  stateSlot(state, slot) {
    return this.states[state * 6 + slot];
  }
  stateFlag(state, flag) {
    return (this.stateSlot(state, 0) & flag) > 0;
  }
  findNested(state) {
    let flags = this.stateSlot(state, 0);
    return flags & 4 ? this.nested[flags >> 10] : null;
  }
  validAction(state, action) {
    if (action == this.stateSlot(state, 4))
      return true;
    for (let i = this.stateSlot(state, 1); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          return false;
      }
      if (action == pair(this.data, i + 1))
        return true;
    }
  }
  nextStates(state) {
    let result = [];
    for (let i = this.stateSlot(state, 1); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          break;
      }
      if ((this.data[i + 2] & 65536 >> 16) == 0) {
        let value = this.data[i + 1];
        if (!result.some((v, i2) => i2 & 1 && v == value))
          result.push(this.data[i], value);
      }
    }
    return result;
  }
  overrides(token, prev) {
    let iPrev = findOffset(this.data, this.tokenPrecTable, prev);
    return iPrev < 0 || findOffset(this.data, this.tokenPrecTable, token) < iPrev;
  }
  configure(config2) {
    let copy = Object.assign(Object.create(Parser.prototype), this);
    if (config2.props)
      copy.nodeSet = this.nodeSet.extend(...config2.props);
    if (config2.top) {
      let info = this.topRules[config2.top];
      if (!info)
        throw new RangeError(`Invalid top rule name ${config2.top}`);
      copy.top = info;
    }
    if (config2.tokenizers)
      copy.tokenizers = this.tokenizers.map((t2) => {
        let found = config2.tokenizers.find((r) => r.from == t2);
        return found ? found.to : t2;
      });
    if (config2.dialect)
      copy.dialect = this.parseDialect(config2.dialect);
    if (config2.nested)
      copy.nested = this.nested.map((obj) => {
        if (!Object.prototype.hasOwnProperty.call(config2.nested, obj.name))
          return obj;
        return {name: obj.name, value: config2.nested[obj.name], end: obj.end, placeholder: obj.placeholder};
      });
    if (config2.strict != null)
      copy.strict = config2.strict;
    if (config2.bufferLength != null)
      copy.bufferLength = config2.bufferLength;
    return copy;
  }
  getName(term) {
    return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
  }
  get eofTerm() {
    return this.maxNode + 1;
  }
  get hasNested() {
    return this.nested.length > 0;
  }
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  dynamicPrecedence(term) {
    let prec2 = this.dynamicPrecedences;
    return prec2 == null ? 0 : prec2[term] || 0;
  }
  parseDialect(dialect) {
    if (this.cachedDialect && this.cachedDialect.source == dialect)
      return this.cachedDialect;
    let values2 = Object.keys(this.dialects), flags = values2.map(() => false);
    if (dialect)
      for (let part of dialect.split(" ")) {
        let id2 = values2.indexOf(part);
        if (id2 >= 0)
          flags[id2] = true;
      }
    let disabled = null;
    for (let i = 0; i < values2.length; i++)
      if (!flags[i]) {
        for (let j = this.dialects[values2[i]], id2; (id2 = this.data[j++]) != 65535; )
          (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id2] = 1;
      }
    return this.cachedDialect = new Dialect(dialect, flags, disabled);
  }
  static deserialize(spec) {
    return new Parser(spec);
  }
};
function pair(data2, off) {
  return data2[off] | data2[off + 1] << 16;
}
function findOffset(data2, start, term) {
  for (let i = start, next; (next = data2[i]) != 65535; i++)
    if (next == term)
      return i - start;
  return -1;
}
function findFinished(stacks) {
  let best = null;
  for (let stack of stacks) {
    if (stack.pos == stack.p.input.length && stack.p.parser.stateFlag(stack.state, 2) && (!best || best.score < stack.score))
      best = stack;
  }
  return best;
}

// ../../node_modules/lezer-javascript/dist/index.es.js
var noSemi = 269;
var incdec = 1;
var incdecPrefix = 2;
var templateContent = 270;
var templateDollarBrace = 271;
var templateEnd = 272;
var insertSemi = 273;
var TSExtends = 3;
var Dialect_ts = 1;
var newline = [10, 13, 8232, 8233];
var space = [9, 11, 12, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288];
var braceR = 125;
var braceL = 123;
var semicolon = 59;
var slash = 47;
var star = 42;
var plus = 43;
var minus = 45;
var dollar = 36;
var backtick = 96;
var backslash = 92;
function newlineBefore(input, pos) {
  for (let i = pos - 1; i >= 0; i--) {
    let prev = input.get(i);
    if (newline.indexOf(prev) > -1)
      return true;
    if (space.indexOf(prev) < 0)
      break;
  }
  return false;
}
var insertSemicolon = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, next = input.get(pos);
  if ((next == braceR || next == -1 || newlineBefore(input, pos)) && stack.canShift(insertSemi))
    token.accept(insertSemi, token.start);
}, {contextual: true, fallback: true});
var noSemicolon = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, next = input.get(pos++);
  if (space.indexOf(next) > -1 || newline.indexOf(next) > -1)
    return;
  if (next == slash) {
    let after = input.get(pos++);
    if (after == slash || after == star)
      return;
  }
  if (next != braceR && next != semicolon && next != -1 && !newlineBefore(input, token.start) && stack.canShift(noSemi))
    token.accept(noSemi, token.start);
}, {contextual: true});
var incdecToken = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, next = input.get(pos);
  if ((next == plus || next == minus) && next == input.get(pos + 1)) {
    let mayPostfix = !newlineBefore(input, token.start) && stack.canShift(incdec);
    token.accept(mayPostfix ? incdec : incdecPrefix, pos + 2);
  }
}, {contextual: true});
var template = new ExternalTokenizer((input, token) => {
  let pos = token.start, afterDollar = false;
  for (; ; ) {
    let next = input.get(pos++);
    if (next < 0) {
      if (pos - 1 > token.start)
        token.accept(templateContent, pos - 1);
      break;
    } else if (next == backtick) {
      if (pos == token.start + 1)
        token.accept(templateEnd, pos);
      else
        token.accept(templateContent, pos - 1);
      break;
    } else if (next == braceL && afterDollar) {
      if (pos == token.start + 2)
        token.accept(templateDollarBrace, pos);
      else
        token.accept(templateContent, pos - 2);
      break;
    } else if (next == 10 && pos > token.start + 1) {
      token.accept(templateContent, pos);
      break;
    } else if (next == backslash && pos != input.length) {
      pos++;
    }
    afterDollar = next == dollar;
  }
});
function tsExtends(value, stack) {
  return value == "extends" && stack.dialectEnabled(Dialect_ts) ? TSExtends : -1;
}
var spec_identifier = {__proto__: null, export: 16, as: 21, from: 25, default: 30, async: 35, function: 36, this: 46, true: 54, false: 54, void: 58, typeof: 62, null: 76, super: 78, new: 112, await: 129, yield: 131, delete: 132, class: 142, extends: 144, public: 181, private: 181, protected: 181, readonly: 183, in: 202, instanceof: 204, import: 236, keyof: 287, unique: 291, infer: 297, is: 331, abstract: 351, implements: 353, type: 355, let: 358, var: 360, const: 362, interface: 369, enum: 373, namespace: 379, module: 381, declare: 385, global: 389, for: 410, of: 419, while: 422, with: 426, do: 430, if: 434, else: 436, switch: 440, case: 446, try: 452, catch: 454, finally: 456, return: 460, throw: 464, break: 468, continue: 472, debugger: 476};
var spec_word = {__proto__: null, async: 99, get: 101, set: 103, public: 151, private: 151, protected: 151, static: 153, abstract: 155, readonly: 159, new: 335};
var spec_LessThan = {__proto__: null, "<": 119};
var parser = Parser.deserialize({
  version: 13,
  states: "$8xO]QYOOO&zQ!LdO'#CgO'ROSO'#DRO)ZQYO'#DWO)kQYO'#DcO)rQYO'#DmO-iQYO'#DsOOQO'#ET'#ETO-|QWO'#ESO.RQWO'#ESO.ZQ!LdO'#IgO2dQ!LdO'#IhO3QQWO'#EpO3VQpO'#FVOOQ!LS'#Ex'#ExO3_O!bO'#ExO3mQWO'#F^O4wQWO'#F]OOQ!LS'#Ih'#IhOOQ!LS'#Ig'#IgOOQQ'#JR'#JRO4|QWO'#HeO5RQ!LYO'#HfOOQQ'#I['#I[OOQQ'#Hg'#HgQ]QYOOO)rQYO'#DeO5ZQWO'#GQO5`Q#tO'#ClO5nQWO'#ERO5yQ#tO'#EwO6eQWO'#GQO6jQWO'#GUO6uQWO'#GUO7TQWO'#GYO7TQWO'#GZO7TQWO'#G]O5ZQWO'#G`O7tQWO'#GcO9SQWO'#CcO9dQWO'#GpO9lQWO'#GvO9lQWO'#GxO]QYO'#GzO9lQWO'#G|O9lQWO'#HPO9qQWO'#HVO9vQ!LZO'#HZO)rQYO'#H]O:RQ!LZO'#H_O:^Q!LZO'#HaO5RQ!LYO'#HcO)rQYO'#IjOOOS'#Hh'#HhO:iOSO,59mOOQ!LS,59m,59mO<zQbO'#CgO=UQYO'#HiO=cQWO'#IlO?bQbO'#IlO'^QYO'#IlO?iQWO,59rO@PQ&jO'#D]O@xQWO'#ETOAVQWO'#IvOAbQWO'#IuOAjQWO,5:qOAoQWO'#ItOAvQWO'#DtO5`Q#tO'#EROBUQWO'#EROBaQ`O'#EwOOQ!LS,59},59}OBiQYO,59}ODgQ!LdO,5:XOETQWO,5:_OEnQ!LYO'#IsO6jQWO'#IrOEuQWO'#IrOE}QWO,5:pOFSQWO'#IrOFbQYO,5:nOH_QWO'#EPOIfQWO,5:nOJrQWO'#DgOJyQYO'#DlOKTQ&jO,5:wO)rQYO,5:wOOQQ'#Eh'#EhOOQQ'#Ej'#EjO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xOOQQ'#En'#EnOKYQYO,5;XOOQ!LS,5;^,5;^OOQ!LS,5;_,5;_OMVQWO,5;_OOQ!LS,5;`,5;`O)rQYO'#HsOM[Q!LYO,5;yOH_QWO,5:xO)rQYO,5;[ONXQpO'#IzOMvQpO'#IzON`QpO'#IzONqQpO,5;gOOQO,5;q,5;qO!!|QYO'#FXOOOO'#Hr'#HrO3_O!bO,5;dO!#TQpO'#FZOOQ!LS,5;d,5;dO!#qQ,UO'#CqOOQ!LS'#Ct'#CtO!$UQWO'#CtO!$lQ#tO,5;vO!$sQWO,5;xO!%|QWO'#FhO!&ZQWO'#FiO!&`QWO'#FmO!'bQ&jO'#FqO!(TQ,UO'#IeOOQ!LS'#Ie'#IeO!(_QWO'#IdO!(mQWO'#IcOOQ!LS'#Cr'#CrOOQ!LS'#Cx'#CxO!(uQWO'#CzOIkQWO'#F`OIkQWO'#FbO!(zQWO'#FdOIaQWO'#FeO!)PQWO'#FkOIkQWO'#FpO!)UQWO'#EUO!)mQWO,5;wO]QYO,5>POOQQ'#I_'#I_OOQQ,5>Q,5>QOOQQ-E;e-E;eO!+iQ!LdO,5:POOQ!LQ'#Co'#CoO!,YQ#tO,5<lOOQO'#Ce'#CeO!,kQWO'#CpO!,sQ!LYO'#I`O4wQWO'#I`O9qQWO,59WO!-RQpO,59WO!-ZQ#tO,59WO5`Q#tO,59WO!-fQWO,5:nO!-nQWO'#GoO!-vQWO'#JVO!.OQYO,5;aOKTQ&jO,5;cO!/{QWO,5=YO!0QQWO,5=YO!0VQWO,5=YO5RQ!LYO,5=YO5ZQWO,5<lO!0eQWO'#EVO!0vQ&jO'#EWOOQ!LQ'#It'#ItO!1XQ!LYO'#JSO5RQ!LYO,5<pO7TQWO,5<wOOQO'#Cq'#CqO!1dQpO,5<tO!1lQ#tO,5<uO!1wQWO,5<wO!1|Q`O,5<zO9qQWO'#GeO5ZQWO'#GgO!2UQWO'#GgO5`Q#tO'#GjO!2ZQWO'#GjOOQQ,5<},5<}O!2`QWO'#GkO!2hQWO'#ClO!2mQWO,58}O!2wQWO,58}O!4vQYO,58}OOQQ,58},58}O!5TQ!LYO,58}O)rQYO,58}O!5`QYO'#GrOOQQ'#Gs'#GsOOQQ'#Gt'#GtO]QYO,5=[O!5pQWO,5=[O)rQYO'#DsO]QYO,5=bO]QYO,5=dO!5uQWO,5=fO]QYO,5=hO!5zQWO,5=kO!6PQYO,5=qOOQQ,5=u,5=uO)rQYO,5=uO5RQ!LYO,5=wOOQQ,5=y,5=yO!9}QWO,5=yOOQQ,5={,5={O!9}QWO,5={OOQQ,5=},5=}O!:SQ`O,5?UOOOS-E;f-E;fOOQ!LS1G/X1G/XO!:XQbO,5>TO)rQYO,5>TOOQO-E;g-E;gO!:cQWO,5?WO!:kQbO,5?WO!:rQWO,5?aOOQ!LS1G/^1G/^O!:zQpO'#DPOOQO'#In'#InO)rQYO'#InO!;iQpO'#InO!<WQpO'#D^O!<iQ&jO'#D^O!>qQYO'#D^O!>xQWO'#ImO!?QQWO,59wO!?VQWO'#EXO!?eQWO'#IwO!?mQWO,5:rO!@TQ&jO'#D^O)rQYO,5?bO!@_QWO'#HnO!:rQWO,5?aOOQ!LQ1G0]1G0]O!AeQ&jO'#DwOOQ!LS,5:`,5:`O)rQYO,5:`OH_QWO,5:`O!AlQWO,5:`O9qQWO,5:mO!-RQpO,5:mO!-ZQ#tO,5:mO5`Q#tO,5:mOOQ!LS1G/i1G/iOOQ!LS1G/y1G/yOOQ!LQ'#EO'#EOO)rQYO,5?_O!AwQ!LYO,5?_O!BYQ!LYO,5?_O!BaQWO,5?^O!BiQWO'#HpO!BaQWO,5?^OOQ!LQ1G0[1G0[O6jQWO,5?^OOQ!LS1G0Y1G0YO!CTQ!LbO,5:kOOQ!LS'#Fg'#FgO!CqQ!LdO'#IeOFbQYO1G0YO!EpQ#tO'#IoO!EzQWO,5:RO!FPQbO'#IpO)rQYO'#IpO!FZQWO,5:WOOQ!LS'#DP'#DPOOQ!LS1G0c1G0cO!F`QWO1G0cO!HqQ!LdO1G0dO!HxQ!LdO1G0dO!K]Q!LdO1G0dO!KdQ!LdO1G0dO!MkQ!LdO1G0dO!NOQ!LdO1G0dO#!oQ!LdO1G0dO#!vQ!LdO1G0dO#%ZQ!LdO1G0dO#%bQ!LdO1G0dO#'VQ!LdO1G0dO#*PQ7^O'#CgO#+zQ7^O1G0sO#-xQ7^O'#IhOOQ!LS1G0y1G0yO#.SQ!LdO,5>_OOQ!LS-E;q-E;qO#.sQ!LdO1G0dO#0uQ!LdO1G0vO#1fQpO,5;iO#1kQpO,5;jO#1pQpO'#FQO#2UQWO'#FPOOQO'#I{'#I{OOQO'#Hq'#HqO#2ZQpO1G1ROOQ!LS1G1R1G1ROOQO1G1[1G1[O#2iQ7^O'#IgO#4cQWO,5;sO! PQYO,5;sOOOO-E;p-E;pOOQ!LS1G1O1G1OOOQ!LS,5;u,5;uO#4hQpO,5;uOOQ!LS,59`,59`O)rQYO1G1bOKTQ&jO'#HuO#4mQWO,5<ZOOQ!LS,5<W,5<WOOQO'#F{'#F{OIkQWO,5<fOOQO'#F}'#F}OIkQWO,5<hOIkQWO,5<jOOQO1G1d1G1dO#4xQ`O'#CoO#5]Q`O,5<SO#5dQWO'#JOO5ZQWO'#JOO#5rQWO,5<UOIkQWO,5<TO#5wQ`O'#FgO#6UQ`O'#JPO#6`QWO'#JPOH_QWO'#JPO#6eQWO,5<XOOQ!LQ'#Db'#DbO#6jQWO'#FjO#6uQpO'#FrO!']Q&jO'#FrO!']Q&jO'#FtO#7WQWO'#FuO!)PQWO'#FxOOQO'#Hw'#HwO#7]Q&jO,5<]OOQ!LS,5<],5<]O#7dQ&jO'#FrO#7rQ&jO'#FsO#7zQ&jO'#FsOOQ!LS,5<k,5<kOIkQWO,5?OOIkQWO,5?OO#8PQWO'#HxO#8[QWO,5>}OOQ!LS'#Cg'#CgO#9OQ#tO,59fOOQ!LS,59f,59fO#9qQ#tO,5;zO#:dQ#tO,5;|O#:nQWO,5<OOOQ!LS,5<P,5<PO#:sQWO,5<VO#:xQ#tO,5<[OFbQYO1G1cO#;YQWO1G1cOOQQ1G3k1G3kOOQ!LS1G/k1G/kOMVQWO1G/kOOQQ1G2W1G2WOH_QWO1G2WO)rQYO1G2WOH_QWO1G2WO#;_QWO1G2WO#;mQWO,59[O#<sQWO'#EPOOQ!LQ,5>z,5>zO#<}Q!LYO,5>zOOQQ1G.r1G.rO9qQWO1G.rO!-RQpO1G.rO!-ZQ#tO1G.rO#=]QWO1G0YO#=bQWO'#CgO#=mQWO'#JWO#=uQWO,5=ZO#=zQWO'#JWO#>PQWO'#IQO#>_QWO,5?qO#@ZQbO1G0{OOQ!LS1G0}1G0}O5ZQWO1G2tO#@bQWO1G2tO#@gQWO1G2tO#@lQWO1G2tOOQQ1G2t1G2tO#@qQ#tO1G2WO6jQWO'#IuO6jQWO'#EXO6jQWO'#HzO#ASQ!LYO,5?nOOQQ1G2[1G2[O!1wQWO1G2cOH_QWO1G2`O#A_QWO1G2`OOQQ1G2a1G2aOH_QWO1G2aO#AdQWO1G2aO#AlQ&jO'#G_OOQQ1G2c1G2cO!']Q&jO'#H|O!1|Q`O1G2fOOQQ1G2f1G2fOOQQ,5=P,5=PO#AtQ#tO,5=RO5ZQWO,5=RO#7WQWO,5=UO4wQWO,5=UO!-RQpO,5=UO!-ZQ#tO,5=UO5`Q#tO,5=UO#BVQWO'#JUO#BbQWO,5=VOOQQ1G.i1G.iO#BgQ!LYO1G.iO#BrQWO1G.iO!(uQWO1G.iO5RQ!LYO1G.iO#BwQbO,5?sO#CRQWO,5?sO#C^QYO,5=^O#CeQWO,5=^O6jQWO,5?sOOQQ1G2v1G2vO]QYO1G2vOOQQ1G2|1G2|OOQQ1G3O1G3OO9lQWO1G3QO#CjQYO1G3SO#GbQYO'#HROOQQ1G3V1G3VO9qQWO1G3]O#GoQWO1G3]O5RQ!LYO1G3aOOQQ1G3c1G3cOOQ!LQ'#Fn'#FnO5RQ!LYO1G3eO5RQ!LYO1G3gOOOS1G4p1G4pO#IkQ!LdO,5;yO#JOQbO1G3oO#JYQWO1G4rO#JbQWO1G4{O#JjQWO,5?YO! PQYO,5:sO6jQWO,5:sO9qQWO,59xO! PQYO,59xO!-RQpO,59xO#LcQ7^O,59xOOQO,5:s,5:sO#LmQ&jO'#HjO#MTQWO,5?XOOQ!LS1G/c1G/cO#M]Q&jO'#HoO#MqQWO,5?cOOQ!LQ1G0^1G0^O!<iQ&jO,59xO#MyQbO1G4|OOQO,5>Y,5>YO6jQWO,5>YOOQO-E;l-E;lO#NTQ!LrO'#D|O!']Q&jO'#DxOOQO'#Hm'#HmO#NoQ&jO,5:cOOQ!LS,5:c,5:cO#NvQ&jO'#DxO$ UQ&jO'#D|O$ jQ&jO'#D|O!']Q&jO'#D|O$ tQWO1G/zO$ yQ`O1G/zOOQ!LS1G/z1G/zO)rQYO1G/zOH_QWO1G/zOOQ!LS1G0X1G0XO9qQWO1G0XO!-RQpO1G0XO!-ZQ#tO1G0XO$!QQ!LdO1G4yO)rQYO1G4yO$!bQ!LYO1G4yO$!sQWO1G4xO6jQWO,5>[OOQO,5>[,5>[O$!{QWO,5>[OOQO-E;n-E;nO$!sQWO1G4xOOQ!LS,5;y,5;yO$#ZQ!LdO,59fO$%YQ!LdO,5;zO$'[Q!LdO,5;|O$)^Q!LdO,5<[OOQ!LS7+%t7+%tO$+fQWO'#HkO$+pQWO,5?ZOOQ!LS1G/m1G/mO$+xQYO'#HlO$,VQWO,5?[O$,_QbO,5?[OOQ!LS1G/r1G/rOOQ!LS7+%}7+%}O$,iQ7^O,5:XO)rQYO7+&_O$,sQ7^O,5:POOQO1G1T1G1TOOQO1G1U1G1UO$,zQMhO,5;lO! PQYO,5;kOOQO-E;o-E;oOOQ!LS7+&m7+&mOOQO7+&v7+&vOOOO1G1_1G1_O$-VQWO1G1_OOQ!LS1G1a1G1aO$-[Q!LdO7+&|OOQ!LS,5>a,5>aO$-{QWO,5>aOOQ!LS1G1u1G1uP$.QQWO'#HuPOQ!LS-E;s-E;sO$.qQ#tO1G2QO$/dQ#tO1G2SO$/nQ#tO1G2UOOQ!LS1G1n1G1nO$/uQWO'#HtO$0TQWO,5?jO$0TQWO,5?jO$0]QWO,5?jO$0hQWO,5?jOOQO1G1p1G1pO$0vQ#tO1G1oO$1WQWO'#HvO$1hQWO,5?kOH_QWO,5?kO$1pQ`O,5?kOOQ!LS1G1s1G1sO5RQ!LYO,5<^O5RQ!LYO,5<_O$1zQWO,5<_O#7RQWO,5<_O!-RQpO,5<^O$2PQWO,5<`O5RQ!LYO,5<aO$1zQWO,5<dOOQO-E;u-E;uOOQ!LS1G1w1G1wO!']Q&jO,5<^O$2XQWO,5<_O!']Q&jO,5<`O!']Q&jO,5<_O$2dQ#tO1G4jO$2nQ#tO1G4jOOQO,5>d,5>dOOQO-E;v-E;vOKTQ&jO,59hO)rQYO,59hO$2{QWO1G1jOIkQWO1G1qOOQ!LS7+&}7+&}OFbQYO7+&}OOQ!LS7+%V7+%VO$3QQ`O'#JQO$ tQWO7+'rO$3[QWO7+'rO$3dQ`O7+'rOOQQ7+'r7+'rOH_QWO7+'rO)rQYO7+'rOH_QWO7+'rOOQO1G.v1G.vO$3nQ!LbO'#CgO$4OQ!LbO,5<bO$4mQWO,5<bOOQ!LQ1G4f1G4fOOQQ7+$^7+$^O9qQWO7+$^O!-RQpO7+$^OFbQYO7+%tO$4rQWO'#IPO$4}QWO,5?rOOQO1G2u1G2uO5ZQWO,5?rOOQO,5>l,5>lOOQO-E<O-E<OOOQ!LS7+&g7+&gO$5VQWO7+(`O5RQ!LYO7+(`O5ZQWO7+(`O$5[QWO7+(`O$5aQWO7+'rOOQ!LQ,5>f,5>fOOQ!LQ-E;x-E;xOOQQ7+'}7+'}O$5oQ!LbO7+'zOH_QWO7+'zO$5yQ`O7+'{OOQQ7+'{7+'{OH_QWO7+'{O$6QQWO'#JTO$6]QWO,5<yOOQO,5>h,5>hOOQO-E;z-E;zOOQQ7+(Q7+(QO$7SQ&jO'#GhOOQQ1G2m1G2mOH_QWO1G2mO)rQYO1G2mOH_QWO1G2mO$7ZQWO1G2mO$7iQ#tO1G2mO5RQ!LYO1G2pO#7WQWO1G2pO4wQWO1G2pO!-RQpO1G2pO!-ZQ#tO1G2pO$7zQWO'#IOO$8VQWO,5?pO$8_Q&jO,5?pOOQ!LQ1G2q1G2qOOQQ7+$T7+$TO$8dQWO7+$TO5RQ!LYO7+$TO$8iQWO7+$TO)rQYO1G5_O)rQYO1G5`O$8nQYO1G2xO$8uQWO1G2xO$8zQYO1G2xO$9RQ!LYO1G5_OOQQ7+(b7+(bO5RQ!LYO7+(lO]QYO7+(nOOQQ'#JZ'#JZOOQQ'#IR'#IRO$9]QYO,5=mOOQQ,5=m,5=mO)rQYO'#HSO$9jQWO'#HUOOQQ7+(w7+(wO$9oQYO7+(wO6jQWO7+(wOOQQ7+({7+({OOQQ7+)P7+)POOQQ7+)R7+)ROOQO1G4t1G4tO$=jQ7^O1G0_O$=tQWO1G0_OOQO1G/d1G/dO$>PQ7^O1G/dO9qQWO1G/dO! PQYO'#D^OOQO,5>U,5>UOOQO-E;h-E;hOOQO,5>Z,5>ZOOQO-E;m-E;mO!-RQpO1G/dOOQO1G3t1G3tO9qQWO,5:dOOQO,5:h,5:hO!.OQYO,5:hO$>ZQ!LYO,5:hO$>fQ!LYO,5:hO!-RQpO,5:dOOQO-E;k-E;kOOQ!LS1G/}1G/}O!']Q&jO,5:dO$>tQ!LrO,5:hO$?`Q&jO,5:dO!']Q&jO,5:hO$?nQ&jO,5:hO$@SQ!LYO,5:hOOQ!LS7+%f7+%fO$ tQWO7+%fO$ yQ`O7+%fOOQ!LS7+%s7+%sO9qQWO7+%sO!-RQpO7+%sO$@hQ!LdO7+*eO)rQYO7+*eOOQO1G3v1G3vO6jQWO1G3vO$@xQWO7+*dO$AQQ!LdO1G2QO$CSQ!LdO1G2SO$EUQ!LdO1G1oO$G^Q#tO,5>VOOQO-E;i-E;iO$GhQbO,5>WO)rQYO,5>WOOQO-E;j-E;jO$GrQWO1G4vO$ItQ7^O1G0dO$KoQ7^O1G0dO$MjQ7^O1G0dO$MqQ7^O1G0dO% `Q7^O1G0dO% sQ7^O1G0dO%#zQ7^O1G0dO%$RQ7^O1G0dO%%|Q7^O1G0dO%&TQ7^O1G0dO%'xQ7^O1G0dO%(VQ!LdO<<IyO%(vQ7^O1G0dO%*fQ7^O'#IeO%,cQ7^O1G0vO! PQYO'#FSOOQO'#I|'#I|OOQO1G1W1G1WO%,jQWO1G1VO%,oQ7^O,5>_OOOO7+&y7+&yOOQ!LS1G3{1G3{OIkQWO7+'pO%,|QWO,5>`O5ZQWO,5>`OOQO-E;r-E;rO%-[QWO1G5UO%-[QWO1G5UO%-dQWO1G5UO%-oQ`O,5>bO%-yQWO,5>bOH_QWO,5>bOOQO-E;t-E;tO%.OQ`O1G5VO%.YQWO1G5VOOQO1G1x1G1xOOQO1G1y1G1yO5RQ!LYO1G1yO$1zQWO1G1yO5RQ!LYO1G1xO%.bQWO1G1zOH_QWO1G1zOOQO1G1{1G1{O5RQ!LYO1G2OO!-RQpO1G1xO#7RQWO1G1yO%.gQWO1G1zO%.oQWO1G1yOIkQWO7+*UOOQ!LS1G/S1G/SO%.zQWO1G/SOOQ!LS7+'U7+'UO%/PQ#tO7+']OOQ!LS<<Ji<<JiOH_QWO'#HyO%/aQWO,5?lOOQQ<<K^<<K^OH_QWO<<K^O$ tQWO<<K^O%/iQWO<<K^O%/qQ`O<<K^OH_QWO1G1|OOQQ<<Gx<<GxO9qQWO<<GxOOQ!LS<<I`<<I`OOQO,5>k,5>kO%/{QWO,5>kOOQO-E;}-E;}O%0QQWO1G5^O%0YQWO<<KzOOQQ<<Kz<<KzO%0_QWO<<KzO5RQ!LYO<<KzO)rQYO<<K^OH_QWO<<K^OOQQ<<Kf<<KfO$5oQ!LbO<<KfOOQQ<<Kg<<KgO$5yQ`O<<KgO%0dQ&jO'#H{O%0oQWO,5?oO! PQYO,5?oOOQQ1G2e1G2eO#NTQ!LrO'#D|O!']Q&jO'#GiOOQO'#H}'#H}O%0wQ&jO,5=SOOQQ,5=S,5=SO#7rQ&jO'#D|O%1OQ&jO'#D|O%1dQ&jO'#D|O%1nQ&jO'#GiO%1|QWO7+(XO%2RQWO7+(XO%2ZQ`O7+(XOOQQ7+(X7+(XOH_QWO7+(XO)rQYO7+(XOH_QWO7+(XO%2eQWO7+(XOOQQ7+([7+([O5RQ!LYO7+([O#7WQWO7+([O4wQWO7+([O!-RQpO7+([O%2sQWO,5>jOOQO-E;|-E;|OOQO'#Gl'#GlO%3OQWO1G5[O5RQ!LYO<<GoOOQQ<<Go<<GoO%3WQWO<<GoO%3]QWO7+*yO%3bQWO7+*zOOQQ7+(d7+(dO%3gQWO7+(dO%3lQYO7+(dO%3sQWO7+(dO)rQYO7+*yO)rQYO7+*zOOQQ<<LW<<LWOOQQ<<LY<<LYOOQQ-E<P-E<POOQQ1G3X1G3XO%3xQWO,5=nOOQQ,5=p,5=pO9qQWO<<LcO%3}QWO<<LcO! PQYO7+%yOOQO7+%O7+%OO%4SQ7^O1G4|O9qQWO7+%OOOQO1G0O1G0OO%4^Q!LdO1G0SOOQO1G0S1G0SO!.OQYO1G0SO%4hQ!LYO1G0SO9qQWO1G0OO!-RQpO1G0OO%4sQ!LYO1G0SO!']Q&jO1G0OO%5RQ!LYO1G0SO%5gQ!LrO1G0SO%5qQ&jO1G0OO!']Q&jO1G0SOOQ!LS<<IQ<<IQOOQ!LS<<I_<<I_O9qQWO<<I_O%6PQ!LdO<<NPOOQO7+)b7+)bO%6aQ!LdO7+']O%8iQbO1G3rO%8sQ7^O,5;yO%8}Q7^O,59fO%:zQ7^O,5;zO%<wQ7^O,5;|O%>tQ7^O,5<[O%@dQ7^O7+&|O%@kQWO,5;nOOQO7+&q7+&qO%@pQ#tO<<K[OOQO1G3z1G3zO%AQQWO1G3zO%A]QWO1G3zO%AkQWO7+*pO%AkQWO7+*pOH_QWO1G3|O%AsQ`O1G3|O%A}QWO7+*qOOQO7+'e7+'eO5RQ!LYO7+'eOOQO7+'d7+'dO$1zQWO7+'fO%BVQ`O7+'fOOQO7+'j7+'jO5RQ!LYO7+'dO$1zQWO7+'eO%B^QWO7+'fOH_QWO7+'fO#7RQWO7+'eO%BcQ#tO<<MpOOQ!LS7+$n7+$nO%BmQ`O,5>eOOQO-E;w-E;wO$ tQWOAN@xOOQQAN@xAN@xOH_QWOAN@xO%BwQ!LbO7+'hOOQQAN=dAN=dO5ZQWO1G4VO%CUQWO7+*xO5RQ!LYOANAfO%C^QWOANAfOOQQANAfANAfO%CcQWOAN@xO%CkQ`OAN@xOOQQANAQANAQOOQQANARANARO%CuQWO,5>gOOQO-E;y-E;yO%DQQ7^O1G5ZO#7WQWO,5=TO4wQWO,5=TO!-RQpO,5=TOOQO-E;{-E;{OOQQ1G2n1G2nO$>tQ!LrO,5:hO!']Q&jO,5=TO%D[Q&jO,5=TO%DjQ&jO,5:hOOQQ<<Ks<<KsOH_QWO<<KsO%1|QWO<<KsO%EOQWO<<KsO%EWQ`O<<KsO)rQYO<<KsOH_QWO<<KsOOQQ<<Kv<<KvO5RQ!LYO<<KvO#7WQWO<<KvO4wQWO<<KvO%EbQ&jO1G4UO%EgQWO7+*vOOQQAN=ZAN=ZO5RQ!LYOAN=ZOOQQ<<Ne<<NeOOQQ<<Nf<<NfOOQQ<<LO<<LOO%EoQWO<<LOO%EtQYO<<LOO%E{QWO<<NeO%FQQWO<<NfOOQQ1G3Y1G3YOOQQANA}ANA}O9qQWOANA}O%FVQ7^O<<IeOOQO<<Hj<<HjOOQO7+%n7+%nO%4^Q!LdO7+%nO!.OQYO7+%nOOQO7+%j7+%jO9qQWO7+%jO%FaQ!LYO7+%nO!-RQpO7+%jO%FlQ!LYO7+%nO!']Q&jO7+%jO%FzQ!LYO7+%nOOQ!LSAN>yAN>yO%G`Q!LdO<<K[O%IhQ7^O<<IyO%IoQ7^O1G1oO%K_Q7^O1G2QO%M[Q7^O1G2SOOQO1G1Y1G1YOOQO7+)f7+)fO& XQWO7+)fO& dQWO<<N[O& lQ`O7+)hOOQO<<KP<<KPO5RQ!LYO<<KQO$1zQWO<<KQOOQO<<KO<<KOO5RQ!LYO<<KPO& vQ`O<<KQO$1zQWO<<KPOOQQG26dG26dO$ tQWOG26dOOQO7+)q7+)qOOQQG27QG27QO5RQ!LYOG27QOH_QWOG26dO! PQYO1G4RO& }QWO7+*uO5RQ!LYO1G2oO#7WQWO1G2oO4wQWO1G2oO!-RQpO1G2oO!']Q&jO1G2oO%5gQ!LrO1G0SO&!VQ&jO1G2oO%1|QWOANA_OOQQANA_ANA_OH_QWOANA_O&!eQWOANA_O&!mQ`OANA_OOQQANAbANAbO5RQ!LYOANAbO#7WQWOANAbOOQO'#Gm'#GmOOQO7+)p7+)pOOQQG22uG22uOOQQANAjANAjO&!wQWOANAjOOQQANDPANDPOOQQANDQANDQO&!|QYOG27iOOQO<<IY<<IYO%4^Q!LdO<<IYOOQO<<IU<<IUO!.OQYO<<IYO9qQWO<<IUO&&wQ!LYO<<IYO!-RQpO<<IUO&'SQ!LYO<<IYO&'bQ7^O7+']OOQO<<MQ<<MQOOQOAN@lAN@lO5RQ!LYOAN@lOOQOAN@kAN@kO$1zQWOAN@lO5RQ!LYOAN@kOOQQLD,OLD,OOOQQLD,lLD,lO$ tQWOLD,OO&)QQ7^O7+)mOOQO7+(Z7+(ZO5RQ!LYO7+(ZO#7WQWO7+(ZO4wQWO7+(ZO!-RQpO7+(ZO!']Q&jO7+(ZOOQQG26yG26yO%1|QWOG26yOH_QWOG26yOOQQG26|G26|O5RQ!LYOG26|OOQQG27UG27UO9qQWOLD-TOOQOAN>tAN>tO%4^Q!LdOAN>tOOQOAN>pAN>pO!.OQYOAN>tO9qQWOAN>pO&)[Q!LYOAN>tO&)gQ7^O<<K[OOQOG26WG26WO5RQ!LYOG26WOOQOG26VG26VOOQQ!$( j!$( jOOQO<<Ku<<KuO5RQ!LYO<<KuO#7WQWO<<KuO4wQWO<<KuO!-RQpO<<KuOOQQLD,eLD,eO%1|QWOLD,eOOQQLD,hLD,hOOQQ!$(!o!$(!oOOQOG24`G24`O%4^Q!LdOG24`OOQOG24[G24[O!.OQYOG24`OOQOLD+rLD+rOOQOANAaANAaO5RQ!LYOANAaO#7WQWOANAaO4wQWOANAaOOQQ!$(!P!$(!POOQOLD)zLD)zO%4^Q!LdOLD)zOOQOG26{G26{O5RQ!LYOG26{O#7WQWOG26{OOQO!$'Mf!$'MfOOQOLD,gLD,gO5RQ!LYOLD,gOOQO!$(!R!$(!ROKYQYO'#DmO&+VQ!LdO'#IgO&+jQ!LdO'#IgOKYQYO'#DeO&+qQ!LdO'#CgO&,[QbO'#CgO&,lQYO,5:nOFbQYO,5:nOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xO! PQYO'#HsO&.iQWO,5;yO&.qQWO,5:xOKYQYO,5;[O!(uQWO'#CzO!(uQWO'#CzOH_QWO'#F`O&.qQWO'#F`OH_QWO'#FbO&.qQWO'#FbOH_QWO'#FpO&.qQWO'#FpO! PQYO,5?bO&,lQYO1G0YOFbQYO1G0YO&/xQ7^O'#CgO&0SQ7^O'#IgO&0^Q7^O'#IgOKYQYO1G1bOH_QWO,5<fO&.qQWO,5<fOH_QWO,5<hO&.qQWO,5<hOH_QWO,5<TO&.qQWO,5<TO&,lQYO1G1cOFbQYO1G1cO&,lQYO1G1cO&,lQYO1G0YOKYQYO7+&_OH_QWO1G1qO&.qQWO1G1qO&,lQYO7+&}OFbQYO7+&}O&,lQYO7+&}O&,lQYO7+%tOFbQYO7+%tO&,lQYO7+%tOH_QWO7+'pO&.qQWO7+'pO&0eQWO'#ESO&0jQWO'#ESO&0oQWO'#ESO&0wQWO'#ESO&1PQWO'#EpO!.OQYO'#DeO!.OQYO'#DmO&1UQWO'#IvO&1aQWO'#ItO&1lQWO,5:nO&1qQWO,5:nO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5;[O&1vQ#tO,5;vO&1}QWO'#FiO&2SQWO'#FiO&2XQWO,5;wO&2aQWO,5;wO&2iQWO,5;wO&2qQ!LdO,5:PO&3OQWO,5:nO&3TQWO,5:nO&3]QWO,5:nO&3eQWO,5:nO&5aQ!LdO1G0dO&5nQ!LdO1G0dO&7uQ!LdO1G0dO&7|Q!LdO1G0dO&9}Q!LdO1G0dO&:UQ!LdO1G0dO&<VQ!LdO1G0dO&<^Q!LdO1G0dO&>_Q!LdO1G0dO&>fQ!LdO1G0dO&>mQ7^O1G0sO&>tQ!LdO1G0vO!.OQYO1G1bO&?RQWO,5<VO&?WQWO,5<VO&?]QWO1G1cO&?bQWO1G1cO&?gQWO1G1cO&?lQWO1G0YO&?qQWO1G0YO&?vQWO1G0YO!.OQYO7+&_O&?{Q!LdO7+&|O&@YQ#tO1G2UO&@aQ#tO1G2UO&@hQ!LdO<<IyO&,lQYO,5:nO&BiQ!LdO'#IhO&B|QWO'#EpO3mQWO'#F^O4wQWO'#F]O4wQWO'#F]O4wQWO'#F]OBUQWO'#EROBUQWO'#EROBUQWO'#EROKYQYO,5;XO&CRQ#tO,5;vO!)PQWO'#FkO!)PQWO'#FkO&CYQ7^O1G0sOIkQWO,5<jOIkQWO,5<jO! PQYO'#DmO! PQYO'#DeO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5;[O! PQYO1G1bO! PQYO7+&_O&CaQWO'#ESO&CfQWO'#ESO&CnQWO'#EpO&CsQ#tO,5;vO&CzQ7^O1G0sO3mQWO'#F^OKYQYO,5;XO&DRQ7^O'#IhO&DcQ7^O,5:PO&DpQ7^O1G0dO&FqQ7^O1G0dO&FxQ7^O1G0dO&HmQ7^O1G0dO&IQQ7^O1G0dO&K_Q7^O1G0dO&KfQ7^O1G0dO&MgQ7^O1G0dO&MnQ7^O1G0dO' cQ7^O1G0dO' vQ7^O1G0vO'!TQ7^O7+&|O'!bQ7^O<<IyO3mQWO'#F^OKYQYO,5;X",
  stateData: "'#b~O&}OSSOSTOS~OPTOQTOWwO]bO^gOamOblOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!OSO!YjO!_UO!bTO!cTO!dTO!eTO!fTO!ikO#jnO#n]O$uoO$wrO$ypO$zpO${qO%OsO%QtO%TuO%UuO%WvO%exO%kyO%mzO%o{O%q|O%t}O%z!OO&O!PO&Q!QO&S!RO&U!SO&W!TO'PPO']QO'q`O~OPZXYZX^ZXiZXqZXrZXtZX|ZX![ZX!]ZX!_ZX!eZX!tZX#OcX#RZX#SZX#TZX#UZX#VZX#WZX#XZX#YZX#ZZX#]ZX#_ZX#`ZX#eZX&{ZX']ZX'eZX'lZX'mZX~O!W$bX~P$tO&x!VO&y!UO&z!XO~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!O!`O!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O'P!YO']QO'q`O~O{!^O|!ZOy'`Py'iP~P'^O}!jO~P]OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!O!`O!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O'P8ZO']QO'q`O~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!O!`O!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O']QO'q`O~O{!oO!|!rO!}!oO'P8[O!^'fP~P+oO#O!sO~O!W!tO#O!sO~OP#ZOY#aOi#OOq!xOr!xOt!yO|#_O![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO#`#WO']QO'e#XO'l!zO'm!{O^'ZX&{'ZX!^'ZXy'ZX!O'ZX$v'ZX!W'ZX~O!t#bO#e#bOP'[XY'[X^'[Xi'[Xq'[Xr'[Xt'[X|'[X!['[X!]'[X!_'[X!e'[X#R'[X#S'[X#T'[X#U'[X#V'[X#W'[X#Y'[X#Z'[X#]'[X#_'[X#`'[X']'[X'e'[X'l'[X'm'[X~O#X'[X&{'[Xy'[X!^'[X'_'[X!O'[X$v'[X!W'[X~P0gO!t#bO~O#p#cO#w#gO~O!O#hO#n]O#z#iO#|#kO~O]#nOg#zOi#oOj#nOk#nOm#{Oo#|Ot#tO!O#uO!Y$RO!_#rO!}$SO#j$PO$T#}O$V$OO$Y$QO'P#mO'T'VP~O!_$TO~O!W$VO~O^$WO&{$WO~O'P$[O~O!_$TO'P$[O'Q$^O'U$_O~Ob$eO!_$TO'P$[O~O]$nOq$jO!O$gO!_$iO$w$mO'P$[O'Q$^O['yP~O!i$oO~Ot$pO!O$qO'P$[O~Ot$pO!O$qO%Q$uO'P$[O~O'P$vO~O$wrO$ypO$zpO${qO%OsO%QtO%TuO%UuO~Oa%POb%OO!i$|O$u$}O%Y${O~P7YOa%SOblO!O%RO!ikO$uoO$ypO$zpO${qO%OsO%QtO%TuO%UuO%WvO~O_%VO!t%YO$w%TO'Q$^O~P8XO!_%ZO!b%_O~O!_%`O~O!OSO~O^$WO&w%hO&{$WO~O^$WO&w%kO&{$WO~O^$WO&w%mO&{$WO~O&x!VO&y!UO&z%qO~OPZXYZXiZXqZXrZXtZX|ZX|cX![ZX!]ZX!_ZX!eZX!tZX!tcX#OcX#RZX#SZX#TZX#UZX#VZX#WZX#XZX#YZX#ZZX#]ZX#_ZX#`ZX#eZX']ZX'eZX'lZX'mZX~OyZXycX~P:tO{%sOy&]X|&]X~P)rO|!ZOy'`X~OP#ZOY#aOi#OOq!xOr!xOt!yO|!ZO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO#`#WO']QO'e#XO'l!zO'm!{O~Oy'`X~P=kOy%xO~Ot%{O!R&VO!S&OO!T&OO'Q$^O~O]%|Oj%|O{&PO'Y%yO}'aP}'kP~P?nOy'hX|'hX!W'hX!^'hX'e'hX~O!t'hX#O!wX}'hX~P@gO!t&WOy'jX|'jX~O|&XOy'iX~Oy&ZO~O!t#bO~P@gOR&_O!O&[O!j&^O'P$[O~Ob&dO!_$TO'P$[O~Oq$jO!_$iO~O}&eO~P]Oq!xOr!xOt!yO!]!vO!_!wO']QOP!aaY!aai!aa|!aa![!aa!e!aa#R!aa#S!aa#T!aa#U!aa#V!aa#W!aa#X!aa#Y!aa#Z!aa#]!aa#_!aa#`!aa'e!aa'l!aa'm!aa~O^!aa&{!aay!aa!^!aa'_!aa!O!aa$v!aa!W!aa~PBpO!^&fO~O!W!tO!t&hO'e&gO|'gX^'gX&{'gX~O!^'gX~PEYO|&lO!^'fX~O!^&nO~Ot$pO!O$qO!}&oO'P$[O~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!OSO!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O'P8ZO']QO'q`O~O]#nOg#zOi#oOj#nOk#nOm#{Oo8nOt#tO!O#uO!Y;OO!_#rO!}8tO#j$PO$T8pO$V8rO$Y$QO'P&rO~O#O&tO~O]#nOg#zOi#oOj#nOk#nOm#{Oo#|Ot#tO!O#uO!Y$RO!_#rO!}$SO#j$PO$T#}O$V$OO$Y$QO'P&rO~O'T'cP~PIkO{&xO!^'dP~P)rO'Y&zO~OP8VOQ8VO]bOa:yOb!gOgbOi8VOjbOkbOm8VOo8VOtROvbOwbOxbO!O!`O!Y8YO!_UO!b8VO!c8VO!d8VO!e8VO!f8VO!i!fO#j!iO#n]O'P'YO']QO'q:uO~O!_!wO~O|#_O^$Ra&{$Ra!^$Ray$Ra!O$Ra$v$Ra!W$Ra~O!W'bO!O'nX#m'nX#p'nX#w'nX~Oq'cO~PMvOq'cO!O'nX#m'nX#p'nX#w'nX~O!O'eO#m'iO#p'dO#w'jO~OP;TOQ;TO]bOa:{Ob!gOgbOi;TOjbOkbOm;TOo;TOtROvbOwbOxbO!O!`O!Y;UO!_UO!b;TO!c;TO!d;TO!e;TO!f;TO!i!fO#j!iO#n]O'P'YO']QO'q;{O~O{'mO~P! PO#p#cO#w'pO~Oq$ZXt$ZX!]$ZX'e$ZX'l$ZX'm$ZX~OReX|eX!teX'TeX'T$ZX~P!#]Oj'rO~Oq'tOt'uO'e#XO'l'wO'm'yO~O'T'sO~P!$ZO'T'|O~O]#nOg#zOi#oOj#nOk#nOm#{Oo8nOt#tO!O#uO!Y;OO!_#rO!}8tO#j$PO$T8pO$V8rO$Y$QO~O{(QO'P'}O!^'rP~P!$xO#O(SO~O{(WO'P(TOy'sP~P!$xO^(aOi(fOt(^O!R(dO!S(]O!T(]O!_(ZO!q(eO$m(`O'Q$^O'Y(YO~O}(cO~P!&mO!]!vOq'XXt'XX'e'XX'l'XX'm'XX|'XX!t'XX~O'T'XX#c'XX~P!'iOR(iO!t(hO|'WX'T'WX~O|(jO'T'VX~O'P(lO~O!_(qO~O!_(ZO~Ot$pO{!oO!O$qO!|!rO!}!oO'P$[O!^'fP~O!W!tO#O(uO~OP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO#`#WO']QO'e#XO'l!zO'm!{O~O^!Xa|!Xa&{!Xay!Xa!^!Xa'_!Xa!O!Xa$v!Xa!W!Xa~P!)uOR(}O!O&[O!j(|O$v({O'U$_O~O'P$vO'T'VP~O!W)QO!O'SX^'SX&{'SX~O!_$TO'U$_O~O!_$TO'P$[O'U$_O~O!W!tO#O&tO~O'P)YO}'zP~O|)^O['yX~OP9jOQ9jO]bOa:zOb!gOgbOi9jOjbOkbOm9jOo9jOtROvbOwbOxbO!O!`O!Y9iO!_UO!b9jO!c9jO!d9jO!e9jO!f9jO!i!fO#j!iO#n]O'P8ZO']QO'q;jO~OY)bO~O[)cO~O!O$gO'P$[O'Q$^O['yP~Ot$pO{)hO!O$qO'P$[Oy'iP~O]&SOj&SO{)iO'Y&zO}'kP~O|)jO^'vX&{'vX~O!t)nO'U$_O~OR)qO!O#uO'U$_O~O!O)sO~Oq)uO!OSO~O!i)zO~Ob*PO~O'P(lO}'xP~Ob$eO~O$wrO'P$vO~P8XOY*VO[*UO~OPTOQTO]bOamOblOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!YjO!_UO!bTO!cTO!dTO!eTO!fTO!ikO#n]O$uoO']QO'q`O~O!O!`O#j!iO'P8ZO~P!3PO[*UO^$WO&{$WO~O^*ZO$y*]O$z*]O${*]O~P)rO!_%ZO~O%k*bO~O!O*dO~O%{*gO%|*fOP%yaQ%yaW%ya]%ya^%yaa%yab%yag%yai%yaj%yak%yam%yao%yat%yav%yaw%yax%ya!O%ya!Y%ya!_%ya!b%ya!c%ya!d%ya!e%ya!f%ya!i%ya#j%ya#n%ya$u%ya$w%ya$y%ya$z%ya${%ya%O%ya%Q%ya%T%ya%U%ya%W%ya%e%ya%k%ya%m%ya%o%ya%q%ya%t%ya%z%ya&O%ya&Q%ya&S%ya&U%ya&W%ya&v%ya'P%ya']%ya'q%ya}%ya%r%ya_%ya%w%ya~O'P*jO~O'_*mO~Oy&]a|&]a~P!)uO|!ZOy'`a~Oy'`a~P=kO|&XOy'ia~O|sX|!UX}sX}!UX!WsX!W!UX!_!UX!tsX'U!UX~O!W*tO!t*sO|!{X|'bX}!{X}'bX!W'bX!_'bX'U'bX~O!W*vO!_$TO'U$_O|!QX}!QX~O]%zOj%zOt%{O'Y(YO~OP;TOQ;TO]bOa:{Ob!gOgbOi;TOjbOkbOm;TOo;TOtROvbOwbOxbO!O!`O!Y;UO!_UO!b;TO!c;TO!d;TO!e;TO!f;TO!i!fO#j!iO#n]O']QO'q;{O~O'P8yO~P!<wO|*zO}'aX~O}*|O~O!W*tO!t*sO|!{X}!{X~O|*}O}'kX~O}+PO~O]%zOj%zOt%{O'Q$^O'Y(YO~O!S+QO!T+QO~P!?rOt$pO{+TO!O$qO'P$[Oy&bX|&bX~O^+XO!R+[O!S+WO!T+WO!m+^O!n+]O!o+]O!q+_O'Q$^O'Y(YO~O}+ZO~P!@sOR+dO!O&[O!j+cO~O!t+jO|'ga!^'ga^'ga&{'ga~O!W!tO~P!AwO|&lO!^'fa~Ot$pO{+mO!O$qO!|+oO!}+mO'P$[O|&dX!^&dX~O#O!sa|!sa!^!sa!t!sa!O!sa^!sa&{!say!sa~P!$ZO#O'XXP'XXY'XX^'XXi'XXr'XX!['XX!_'XX!e'XX#R'XX#S'XX#T'XX#U'XX#V'XX#W'XX#X'XX#Y'XX#Z'XX#]'XX#_'XX#`'XX&{'XX']'XX!^'XXy'XX!O'XX$v'XX'_'XX!W'XX~P!'iO|+xO'T'cX~P!$ZO'T+zO~O|+{O!^'dX~P!)uO!^,OO~Oy,PO~OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO']QOY#Qi^#Qii#Qi|#Qi![#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'l#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~O#R#Qi~P!FeO#R!|O~P!FeOP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O']QOY#Qi^#Qi|#Qi![#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'l#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~Oi#Qi~P!IPOi#OO~P!IPOP#ZOi#OOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO']QO^#Qi|#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'l#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~OY#Qi![#Qi#W#Qi#X#Qi#Y#Qi~P!KkOY#aO![#QO#W#QO#X#QO#Y#QO~P!KkOP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO']QO^#Qi|#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~O'l#Qi~P!NcO'l!zO~P!NcOP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO']QO'l!zO^#Qi|#Qi#_#Qi#`#Qi&{#Qi'e#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~O'm#Qi~P#!}O'm!{O~P#!}OP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO']QO'l!zO'm!{O~O^#Qi|#Qi#`#Qi&{#Qi'e#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~P#%iOPZXYZXiZXqZXrZXtZX![ZX!]ZX!_ZX!eZX!tZX#OcX#RZX#SZX#TZX#UZX#VZX#WZX#XZX#YZX#ZZX#]ZX#_ZX#`ZX#eZX']ZX'eZX'lZX'mZX|ZX}ZX~O#cZX~P#'|OP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO#]8fO#_8hO#`8iO']QO'e#XO'l!zO'm!{O~O#c,RO~P#*WOP'[XY'[Xi'[Xq'[Xr'[Xt'[X!['[X!]'[X!_'[X!e'[X#R'[X#S'[X#T'[X#U'[X#V'[X#W'[X#X'[X#Y'[X#Z'[X#]'[X#_'[X#`'[X#c'[X']'[X'e'[X'l'[X'm'[X~O!t8mO#e8mO~P#,RO^&ga|&ga&{&ga!^&ga'_&gay&ga!O&ga$v&ga!W&ga~P!)uOP#QiY#Qi^#Qii#Qir#Qi|#Qi![#Qi!]#Qi!_#Qi!e#Qi#R#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi']#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~P!$ZO^#di|#di&{#diy#di!^#di'_#di!O#di$v#di!W#di~P!)uO#p,TO~O#p,UO~O!W'bO!t,VO!O#tX#m#tX#p#tX#w#tX~O{,WO~O!O'eO#m,YO#p'dO#w,ZO~OP#ZOY8lOi;XOq!xOr!xOt!yO|8jO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O#_;`O#`;aO']QO'e#XO'l!zO'm!{O}'ZX~O},[O~O#w,^O~O],aOj,aOy,bO~O|cX!WcX!^cX!^$ZX'ecX~P!#]O!^,hO~P!$ZO|,iO!W!tO'e&gO!^'rX~O!^,nO~Oy$ZX|$ZX!W$bX~P!#]O|,pOy'sX~P!$ZO!W,rO~Oy,tO~O{(QO'P$[O!^'rP~Oi,xO!W!tO!_$TO'U$_O'e&gO~O!W)QO~O}-OO~P!&mO!S-PO!T-PO'Q$^O'Y(YO~Ot-RO'Y(YO~O!q-SO~O'P$vO|&lX'T&lX~O|(jO'T'Va~Oq-XOr-XOt-YO'ena'lna'mna|na!tna~O'Tna#cna~P#8dOq'tOt'uO'e$Sa'l$Sa'm$Sa|$Sa!t$Sa~O'T$Sa#c$Sa~P#9YOq'tOt'uO'e$Ua'l$Ua'm$Ua|$Ua!t$Ua~O'T$Ua#c$Ua~P#9{O]-ZO~O#O-[O~O'T$da|$da#c$da!t$da~P!$ZO#O-^O~OR-gO!O&[O!j-fO$v-eO~O'T-hO~O]#nOi#oOj#nOk#nOm#{Oo8nOt#tO!O#uO!Y;OO!_#rO!}8tO#j$PO$T8pO$V8rO$Y$QO~Og-jO'P-iO~P#;rO!W)QO!O'Sa^'Sa&{'Sa~O#O-pO~OYZX|cX}cX~O|-qO}'zX~O}-sO~OY-tO~O!O$gO'P$[O[&tX|&tX~O|)^O['ya~OP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO#Z9tO#]9vO#_9xO#`9yO']QO'e#XO'l!zO'm!{O~O!^-wO~P#>gO]-yO~OY-zO~O[-{O~OR-gO!O&[O!j-fO$v-eO'U$_O~O|)jO^'va&{'va~O!t.RO~OR.UO!O#uO~O'Y&zO}'wP~OR.`O!O.[O!j._O$v.^O'U$_O~OY.jO|.hO}'xX~O}.kO~O[.mO^$WO&{$WO~O].nO~O#X.pO%i.qO~P0gO!t#bO#X.pO%i.qO~O^.rO~P)rO^.tO~O%r.xOP%piQ%piW%pi]%pi^%pia%pib%pig%pii%pij%pik%pim%pio%pit%piv%piw%pix%pi!O%pi!Y%pi!_%pi!b%pi!c%pi!d%pi!e%pi!f%pi!i%pi#j%pi#n%pi$u%pi$w%pi$y%pi$z%pi${%pi%O%pi%Q%pi%T%pi%U%pi%W%pi%e%pi%k%pi%m%pi%o%pi%q%pi%t%pi%z%pi&O%pi&Q%pi&S%pi&U%pi&W%pi&v%pi'P%pi']%pi'q%pi}%pi_%pi%w%pi~O_/OO}.|O%w.}O~P]O!OSO!_/RO~OP$RaY$Rai$Raq$Rar$Rat$Ra![$Ra!]$Ra!_$Ra!e$Ra#R$Ra#S$Ra#T$Ra#U$Ra#V$Ra#W$Ra#X$Ra#Y$Ra#Z$Ra#]$Ra#_$Ra#`$Ra']$Ra'e$Ra'l$Ra'm$Ra~O|#_O'_$Ra!^$Ra^$Ra&{$Ra~P#GwOy&]i|&]i~P!)uO|!ZOy'`i~O|&XOy'ii~Oy/VO~OP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O#_;`O#`;aO']QO'e#XO'l!zO'm!{O~O|!Qa}!Qa~P#JoO]%zOj%zO{/]O'Y(YO|&^X}&^X~P?nO|*zO}'aa~O]&SOj&SO{)iO'Y&zO|&cX}&cX~O|*}O}'ka~Oy'ji|'ji~P!)uO^$WO!W!tO!_$TO!e/hO!t/fO&{$WO'U$_O'e&gO~O}/kO~P!@sO!S/lO!T/lO'Q$^O'Y(YO~O!R/nO!S/lO!T/lO!q/oO'Q$^O'Y(YO~O!n/pO!o/pO~P$ UO!O&[O~O!O&[O~P!$ZO|'gi!^'gi^'gi&{'gi~P!)uO!t/yO|'gi!^'gi^'gi&{'gi~O|&lO!^'fi~Ot$pO!O$qO!}/{O'P$[O~O#OnaPnaYna^naina![na!]na!_na!ena#Rna#Sna#Tna#Una#Vna#Wna#Xna#Yna#Zna#]na#_na#`na&{na']na!^nayna!Ona$vna'_na!Wna~P#8dO#O$SaP$SaY$Sa^$Sai$Sar$Sa![$Sa!]$Sa!_$Sa!e$Sa#R$Sa#S$Sa#T$Sa#U$Sa#V$Sa#W$Sa#X$Sa#Y$Sa#Z$Sa#]$Sa#_$Sa#`$Sa&{$Sa']$Sa!^$Say$Sa!O$Sa$v$Sa'_$Sa!W$Sa~P#9YO#O$UaP$UaY$Ua^$Uai$Uar$Ua![$Ua!]$Ua!_$Ua!e$Ua#R$Ua#S$Ua#T$Ua#U$Ua#V$Ua#W$Ua#X$Ua#Y$Ua#Z$Ua#]$Ua#_$Ua#`$Ua&{$Ua']$Ua!^$Uay$Ua!O$Ua$v$Ua'_$Ua!W$Ua~P#9{O#O$daP$daY$da^$dai$dar$da|$da![$da!]$da!_$da!e$da#R$da#S$da#T$da#U$da#V$da#W$da#X$da#Y$da#Z$da#]$da#_$da#`$da&{$da']$da!^$day$da!O$da!t$da$v$da'_$da!W$da~P!$ZO|&_X'T&_X~PIkO|+xO'T'ca~O{0TO|&`X!^&`X~P)rO|+{O!^'da~O|+{O!^'da~P!)uO#c!aa}!aa~PBpO#c!Xa~P#*WO!O0gO#n]O#u0hO~O}0lO~O^$Oq|$Oq&{$Oqy$Oq!^$Oq'_$Oq!O$Oq$v$Oq!W$Oq~P!)uOy0mO~O],aOj,aO~Oq'tOt'uO'm'yO'e$ni'l$ni|$ni!t$ni~O'T$ni#c$ni~P$.YOq'tOt'uO'e$pi'l$pi'm$pi|$pi!t$pi~O'T$pi#c$pi~P$.{O#c0nO~P!$ZO{0pO'P$[O|&hX!^&hX~O|,iO!^'ra~O|,iO!W!tO!^'ra~O|,iO!W!tO'e&gO!^'ra~O'T$]i|$]i#c$]i!t$]i~P!$ZO{0wO'P(TOy&jX|&jX~P!$xO|,pOy'sa~O|,pOy'sa~P!$ZO!W!tO~O!W!tO#X1RO~Oi1VO!W!tO'e&gO~O|'Wi'T'Wi~P!$ZO!t1YO|'Wi'T'Wi~P!$ZO!^1]O~O|1`O!O'tX~P!$ZO!O&[O$v1cO~O!O&[O$v1cO~P!$ZO!O$ZX$kZX^$ZX&{$ZX~P!#]O$k1gOqfXtfX!OfX'efX'lfX'mfX^fX&{fX~O$k1gO~O'P)YO|&sX}&sX~O|-qO}'za~O[1oO~O]1rO~OR1tO!O&[O!j1sO$v1cO~O^$WO&{$WO~P!$ZO!O#uO~P!$ZO|1yO!t1{O}'wX~O}1|O~Ot(^O!R2VO!S2OO!T2OO!m2UO!n2TO!o2TO!q2SO'Q$^O'Y(YO~O}2RO~P$6bOR2^O!O.[O!j2]O$v2[O~OR2^O!O.[O!j2]O$v2[O'U$_O~O'P(lO|&rX}&rX~O|.hO}'xa~O'Y2gO~O]2iO~O[2kO~O!^2nO~P)rO^2pO~O^2pO~P)rO#X2rO%i2sO~PEYO_/OO}2wO%w.}O~P]O!W2yO~O%|2zOP%yqQ%yqW%yq]%yq^%yqa%yqb%yqg%yqi%yqj%yqk%yqm%yqo%yqt%yqv%yqw%yqx%yq!O%yq!Y%yq!_%yq!b%yq!c%yq!d%yq!e%yq!f%yq!i%yq#j%yq#n%yq$u%yq$w%yq$y%yq$z%yq${%yq%O%yq%Q%yq%T%yq%U%yq%W%yq%e%yq%k%yq%m%yq%o%yq%q%yq%t%yq%z%yq&O%yq&Q%yq&S%yq&U%yq&W%yq&v%yq'P%yq']%yq'q%yq}%yq%r%yq_%yq%w%yq~O|!{i}!{i~P#JoO!t2|O|!{i}!{i~O|!Qi}!Qi~P#JoO^$WO!t3TO&{$WO~O^$WO!W!tO!t3TO&{$WO~O^$WO!W!tO!_$TO!e3XO!t3TO&{$WO'U$_O'e&gO~O!S3YO!T3YO'Q$^O'Y(YO~O!R3]O!S3YO!T3YO!q3^O'Q$^O'Y(YO~O^$WO!W!tO!e3XO!t3TO&{$WO'e&gO~O|'gq!^'gq^'gq&{'gq~P!)uO|&lO!^'fq~O#O$niP$niY$ni^$nii$nir$ni![$ni!]$ni!_$ni!e$ni#R$ni#S$ni#T$ni#U$ni#V$ni#W$ni#X$ni#Y$ni#Z$ni#]$ni#_$ni#`$ni&{$ni']$ni!^$niy$ni!O$ni$v$ni'_$ni!W$ni~P$.YO#O$piP$piY$pi^$pii$pir$pi![$pi!]$pi!_$pi!e$pi#R$pi#S$pi#T$pi#U$pi#V$pi#W$pi#X$pi#Y$pi#Z$pi#]$pi#_$pi#`$pi&{$pi']$pi!^$piy$pi!O$pi$v$pi'_$pi!W$pi~P$.{O#O$]iP$]iY$]i^$]ii$]ir$]i|$]i![$]i!]$]i!_$]i!e$]i#R$]i#S$]i#T$]i#U$]i#V$]i#W$]i#X$]i#Y$]i#Z$]i#]$]i#_$]i#`$]i&{$]i']$]i!^$]iy$]i!O$]i!t$]i$v$]i'_$]i!W$]i~P!$ZO|&_a'T&_a~P!$ZO|&`a!^&`a~P!)uO|+{O!^'di~OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO']QOY#Qii#Qi![#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi|#Qi}#Qi~O#R#Qi~P$GzOP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO']QOY#Qii#Qi![#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi~O#R8_O~P$I{OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O']QOY#Qi![#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi~Oi#Qi~P$KvOi8aO~P$KvOP#ZOi8aOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO']QO#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi~OY#Qi![#Qi#W#Qi#X#Qi#Y#Qi~P$MxOY8lO![8cO#W8cO#X8cO#Y8cO~P$MxOP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO']QO#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'm#Qi~O'l#Qi~P%!WO'l!zO~P%!WOP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO#]8fO']QO'l!zO#_#Qi#`#Qi#c#Qi'e#Qi~O'm#Qi~P%$YO'm!{O~P%$YOP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO#]8fO#_8hO']QO'l!zO'm!{O~O#`#Qi#c#Qi'e#Qi~P%&[O^#ay|#ay&{#ayy#ay!^#ay'_#ay!O#ay$v#ay!W#ay~P!)uOP#QiY#Qii#Qir#Qi![#Qi!]#Qi!_#Qi!e#Qi#R#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi']#Qi|#Qi}#Qi~P!$ZO!]!vOP'XXY'XXi'XXq'XXr'XXt'XX!['XX!_'XX!e'XX#R'XX#S'XX#T'XX#U'XX#V'XX#W'XX#X'XX#Y'XX#Z'XX#]'XX#_'XX#`'XX#c'XX']'XX'e'XX'l'XX'm'XX|'XX}'XX~O#c#di~P#*WO}3mO~O|&ga}&ga#c&ga~P#JoO!W!tO'e&gO|&ha!^&ha~O|,iO!^'ri~O|,iO!W!tO!^'ri~Oy&ja|&ja~P!$ZO!W3tO~O|,pOy'si~P!$ZO|,pOy'si~Oy3zO~O!W!tO#X4QO~Oi4RO!W!tO'e&gO~Oy4TO~O'T$_q|$_q#c$_q!t$_q~P!$ZO|1`O!O'ta~O!O&[O$v4YO~O!O&[O$v4YO~P!$ZOY4]O~O|-qO}'zi~O]4_O~O[4`O~O'Y&zO|&oX}&oX~O|1yO}'wa~O}4mO~P$6bO!R4pO!S4oO!T4oO!q/oO'Q$^O'Y(YO~O!n4qO!o4qO~P%1OO!S4oO!T4oO'Q$^O'Y(YO~O!O.[O~O!O.[O$v4sO~O!O.[O$v4sO~P!$ZOR4xO!O.[O!j4wO$v4sO~OY4}O|&ra}&ra~O|.hO}'xi~O]5QO~O!^5RO~O!^5SO~O!^5TO~O!^5TO~P)rO^5VO~O!W5YO~O!^5[O~O|'ji}'ji~P#JoO^$WO&{$WO~P#>gO^$WO!t5aO&{$WO~O^$WO!W!tO!t5aO&{$WO~O^$WO!W!tO!e5fO!t5aO&{$WO'e&gO~O!_$TO'U$_O~P%5RO!S5gO!T5gO'Q$^O'Y(YO~O|'gy!^'gy^'gy&{'gy~P!)uO#O$_qP$_qY$_q^$_qi$_qr$_q|$_q![$_q!]$_q!_$_q!e$_q#R$_q#S$_q#T$_q#U$_q#V$_q#W$_q#X$_q#Y$_q#Z$_q#]$_q#_$_q#`$_q&{$_q']$_q!^$_qy$_q!O$_q!t$_q$v$_q'_$_q!W$_q~P!$ZO|&`i!^&`i~P!)uO|8jO#c$Ra~P#GwOq-XOr-XOt-YOPnaYnaina![na!]na!_na!ena#Rna#Sna#Tna#Una#Vna#Wna#Xna#Yna#Zna#]na#_na#`na#cna']na'ena'lna'mna|na}na~Oq'tOt'uOP$SaY$Sai$Sar$Sa![$Sa!]$Sa!_$Sa!e$Sa#R$Sa#S$Sa#T$Sa#U$Sa#V$Sa#W$Sa#X$Sa#Y$Sa#Z$Sa#]$Sa#_$Sa#`$Sa#c$Sa']$Sa'e$Sa'l$Sa'm$Sa|$Sa}$Sa~Oq'tOt'uOP$UaY$Uai$Uar$Ua![$Ua!]$Ua!_$Ua!e$Ua#R$Ua#S$Ua#T$Ua#U$Ua#V$Ua#W$Ua#X$Ua#Y$Ua#Z$Ua#]$Ua#_$Ua#`$Ua#c$Ua']$Ua'e$Ua'l$Ua'm$Ua|$Ua}$Ua~OP$daY$dai$dar$da![$da!]$da!_$da!e$da#R$da#S$da#T$da#U$da#V$da#W$da#X$da#Y$da#Z$da#]$da#_$da#`$da#c$da']$da|$da}$da~P!$ZO#c$Oq~P#*WO}5oO~O'T$ry|$ry#c$ry!t$ry~P!$ZO!W!tO|&hi!^&hi~O!W!tO'e&gO|&hi!^&hi~O|,iO!^'rq~Oy&ji|&ji~P!$ZO|,pOy'sq~Oy5vO~P!$ZOy5vO~O|'Wy'T'Wy~P!$ZO|&ma!O&ma~P!$ZO!O$jq^$jq&{$jq~P!$ZO|-qO}'zq~O]6PO~O!O&[O$v6QO~O!O&[O$v6QO~P!$ZO!t6RO|&oa}&oa~O|1yO}'wi~P#JoO!S6XO!T6XO'Q$^O'Y(YO~O!R6ZO!S6XO!T6XO!q3^O'Q$^O'Y(YO~O!O.[O$v6^O~O!O.[O$v6^O~P!$ZO'Y6dO~O|.hO}'xq~O!^6gO~O!^6gO~P)rO!^6iO~O!^6jO~O|!{y}!{y~P#JoO^$WO!t6oO&{$WO~O^$WO!W!tO!t6oO&{$WO~O^$WO!W!tO!e6sO!t6oO&{$WO'e&gO~O#O$ryP$ryY$ry^$ryi$ryr$ry|$ry![$ry!]$ry!_$ry!e$ry#R$ry#S$ry#T$ry#U$ry#V$ry#W$ry#X$ry#Y$ry#Z$ry#]$ry#_$ry#`$ry&{$ry']$ry!^$ryy$ry!O$ry!t$ry$v$ry'_$ry!W$ry~P!$ZO#c#ay~P#*WOP$]iY$]ii$]ir$]i![$]i!]$]i!_$]i!e$]i#R$]i#S$]i#T$]i#U$]i#V$]i#W$]i#X$]i#Y$]i#Z$]i#]$]i#_$]i#`$]i#c$]i']$]i|$]i}$]i~P!$ZOq'tOt'uO'm'yOP$niY$nii$nir$ni![$ni!]$ni!_$ni!e$ni#R$ni#S$ni#T$ni#U$ni#V$ni#W$ni#X$ni#Y$ni#Z$ni#]$ni#_$ni#`$ni#c$ni']$ni'e$ni'l$ni|$ni}$ni~Oq'tOt'uOP$piY$pii$pir$pi![$pi!]$pi!_$pi!e$pi#R$pi#S$pi#T$pi#U$pi#V$pi#W$pi#X$pi#Y$pi#Z$pi#]$pi#_$pi#`$pi#c$pi']$pi'e$pi'l$pi'm$pi|$pi}$pi~O!W!tO|&hq!^&hq~O|,iO!^'ry~Oy&jq|&jq~P!$ZOy6yO~P!$ZO|1yO}'wq~O!S7UO!T7UO'Q$^O'Y(YO~O!O.[O$v7XO~O!O.[O$v7XO~P!$ZO!^7[O~O%|7]OP%y!ZQ%y!ZW%y!Z]%y!Z^%y!Za%y!Zb%y!Zg%y!Zi%y!Zj%y!Zk%y!Zm%y!Zo%y!Zt%y!Zv%y!Zw%y!Zx%y!Z!O%y!Z!Y%y!Z!_%y!Z!b%y!Z!c%y!Z!d%y!Z!e%y!Z!f%y!Z!i%y!Z#j%y!Z#n%y!Z$u%y!Z$w%y!Z$y%y!Z$z%y!Z${%y!Z%O%y!Z%Q%y!Z%T%y!Z%U%y!Z%W%y!Z%e%y!Z%k%y!Z%m%y!Z%o%y!Z%q%y!Z%t%y!Z%z%y!Z&O%y!Z&Q%y!Z&S%y!Z&U%y!Z&W%y!Z&v%y!Z'P%y!Z']%y!Z'q%y!Z}%y!Z%r%y!Z_%y!Z%w%y!Z~O^$WO!t7aO&{$WO~O^$WO!W!tO!t7aO&{$WO~OP$_qY$_qi$_qr$_q![$_q!]$_q!_$_q!e$_q#R$_q#S$_q#T$_q#U$_q#V$_q#W$_q#X$_q#Y$_q#Z$_q#]$_q#_$_q#`$_q#c$_q']$_q|$_q}$_q~P!$ZO|&oq}&oq~P#JoO^$WO!t7uO&{$WO~OP$ryY$ryi$ryr$ry![$ry!]$ry!_$ry!e$ry#R$ry#S$ry#T$ry#U$ry#V$ry#W$ry#X$ry#Y$ry#Z$ry#]$ry#_$ry#`$ry#c$ry']$ry|$ry}$ry~P!$ZO|#_O'_'ZX!^'ZX^'ZX&{'ZX~P!)uO'_'ZX~P.ZO'_ZXyZX!^ZX%iZX!OZX$vZX!WZX~P$tO!WcX!^ZX!^cX'ecX~P:tOP;TOQ;TO]bOa:{Ob!gOgbOi;TOjbOkbOm;TOo;TOtROvbOwbOxbO!OSO!Y;UO!_UO!b;TO!c;TO!d;TO!e;TO!f;TO!i!fO#j!iO#n]O'P'YO']QO'q;{O~O|8jO}$Ra~O]#nOg#zOi#oOj#nOk#nOm#{Oo8oOt#tO!O#uO!Y;PO!_#rO!}8uO#j$PO$T8qO$V8sO$Y$QO'P&rO~O}ZX}cX~P:tO|8jO#c'ZX~P#JoO#c'ZX~P#2iO#O8]O~O#O8^O~O!W!tO#O8]O~O!W!tO#O8^O~O!t8mO~O!t8vO|'jX}'jX~O!t;bO|'hX}'hX~O#O8wO~O#O8xO~O'T8|O~P!$ZO#O9RO~O#O9SO~O!W!tO#O9TO~O!W!tO#O9UO~O!W!tO#O9VO~O!^!Xa^!Xa&{!Xa~P#>gO#O9WO~O!W!tO#O8wO~O!W!tO#O8xO~O!W!tO#O9WO~OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R9oO']QOY#Qii#Qi![#Qi!^#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi^#Qi&{#Qi~O#S#Qi#T#Qi#U#Qi~P&3mO#S9pO#T9pO#U9pO~P&3mOP#ZOi9qOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO']QOY#Qi![#Qi!^#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi^#Qi&{#Qi~O#V#Qi~P&5{O#V9rO~P&5{OP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO']QO!^#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi^#Qi&{#Qi~O#Z#Qi~P&8TO#Z9tO~P&8TOP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO#Z9tO']QO'l!zO!^#Qi#_#Qi#`#Qi'e#Qi'm#Qi^#Qi&{#Qi~O#]#Qi~P&:]O#]9vO~P&:]OP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO#Z9tO#]9vO']QO'l!zO'm!{O!^#Qi#`#Qi'e#Qi^#Qi&{#Qi~O#_#Qi~P&<eO#_9xO~P&<eO#c9XO~P#*WO!^#di^#di&{#di~P#>gO#O9YO~O#O9ZO~O#O9[O~O#O9]O~O#O9^O~O#O9_O~O#O9`O~O#O9aO~O!^$Oq^$Oq&{$Oq~P#>gO#c9bO~P!$ZO#c9cO~P!$ZO!^#ay^#ay&{#ay~P#>gOP'[XY'[Xi'[Xq'[Xr'[Xt'[X!['[X!]'[X!_'[X!e'[X#R'[X#S'[X#T'[X#U'[X#V'[X#W'[X#X'[X#Y'[X#Z'[X#]'[X#_'[X#`'[X']'[X'e'[X'l'[X'm'[X~O!t9zO#e9zO!^'[X^'[X&{'[X~P&@uO!t9zO~O'T:dO~P!$ZO#c:mO~P#*WO#O:rO~O!W!tO#O:rO~O!t;bO~O'T;cO~P!$ZO#c;dO~P#*WO!t;bO#e;bO|'[X}'[X~P#,RO|!Xa}!Xa#c!Xa~P#JoO#R;VO~P$GzOP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO']QOY#Qi|#Qi}#Qi![#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi#c#Qi~Oi#Qi~P&DwOi;XO~P&DwOP#ZOi;XOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO']QO|#Qi}#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi#c#Qi~OY#Qi![#Qi#W#Qi#X#Qi#Y#Qi~P&GPOY8lO![;ZO#W;ZO#X;ZO#Y;ZO~P&GPOP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O']QO|#Qi}#Qi#]#Qi#_#Qi#`#Qi'e#Qi'm#Qi#c#Qi~O'l#Qi~P&IeO'l!zO~P&IeOP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O']QO'l!zO|#Qi}#Qi#_#Qi#`#Qi'e#Qi#c#Qi~O'm#Qi~P&KmO'm!{O~P&KmOP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O#_;`O']QO'l!zO'm!{O~O|#Qi}#Qi#`#Qi'e#Qi#c#Qi~P&MuO|#di}#di#c#di~P#JoO|$Oq}$Oq#c$Oq~P#JoO|#ay}#ay#c#ay~P#JoO#n~!]!m!o!|!}'q$T$V$Y$k$u$v$w%O%Q%T%U%W%Y~TS#n'q#p'Y'P&}#Sx~",
  goto: "$!x(OPPPPPPP(PP(aP)|PPPP._PP.t4x6k7QP7QPPP7QP7QP8oPP8tP9]PPPP?RPPPP?RBoPPPBuDxP?RPGgPPPPIv?RPPPPPLW?RPP!!T!#QPPP!#UP!#^!$_P?R?R!'x!+y!1w!1w!6WPPP!6_?RPPPPPPPPP!:TP!;uPP?R!=_P?RP?R?R?R?RP?R!?zPP!CoP!G`!Gh!Gl!GlP!ClP!Gp!GpP!KaP!Ke?R?R!Kk# _7QP7QP7Q7QP#!v7Q7Q#$l7Q7Q7Q#&o7Q7Q#']#)W#)W#)[#)W#)dP#)WP7Q#*`7Q#+k7Q7Q._PPP#,yPPP#-c#-cP#-cP#-x#-cPP#.OP#-uP#-u#.b!#Y#-u#/P#/V#/Y(P#/](PP#/d#/d#/dP(PP(PP(PP(PPP(PP#/j#/mP#/m(PPPP(PP(PP(PP(PP(PP(P(P#/q#/{#0R#0a#0g#0m#0w#0}#1X#1_#1m#1s#1y#2a#2v#4Z#4i#4o#4u#4{#5R#5]#5c#5i#5s#5}#6TPPPPPPPP#6ZPP#6}#:{PP#<`#<i#<sP#AS#DVP#K}P#LR#LU#LX#Ld#LgP#Lj#Ln#M]#NQ#NU#NhPP#Nl#Nr#NvP#Ny#N}$ Q$ p$!W$!]$!`$!c$!i$!l$!p$!tmgOSi{!k$V%^%a%b%d*_*d.x.{Q$dlQ$knQ%UwS&O!`*zQ&c!gS(]#u(bQ)W$eQ)d$mQ*O%OQ+Q&VS+W&[+YQ+h&dQ-P(dQ.g*PU/l+[+]+^S2O.[2QS3Y/n/pU4o2T2U2VQ5g3]S6X4p4qR7U6Z$hZORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`x'[#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|Q(m#|Q)]$gQ*Q%RQ*X%ZQ+s8nQ-k)QQ.o*VQ1l-qQ2e.hQ3g8o!O:s$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!q;l#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;dpdOSiw{!k$V%T%^%a%b%d*_*d.x.{R*S%V(WVOSTijm{!Q!U!Z!h!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:y:z:{:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|W!aRU!^&PQ$]kQ$clS$hn$mv$rpq!o!r$T$p&X&l&o)h)i)j*]*t+T+m+o/R/{Q$zuQ&`!fQ&b!gS(P#r(ZS)V$d$eQ)Z$gQ)g$oQ)y$|Q)}%OS+g&c&dQ,m(QQ-o)WQ-u)^Q-x)bQ.b)zS.f*O*PQ/w+hQ0o,iQ1k-qQ1n-tQ1q-zQ2d.gQ3q0pR5}4]!W$al!g$c$d$e%}&b&c&d([)V)W*w+V+g+h,y-o/b/i/m/w1U3W3[5e6rQ)O$]Q)o$wQ)r$xQ)|%OQ-|)gQ.a)yU.e)}*O*PQ2_.bS2c.f.gQ4j1}Q4|2dS6V4k4nS7S6W6YQ7l7TR7z7m[#x`$_(j:u;j;{S$wr%TQ$xsQ$ytR)m$u$X#w`!t!v#a#r#t#}$O$S&_'x'z'{(S(W(h(i({(})Q)n)q+d+x,p,r-[-e-g.R.U.^.`0n0w1R1Y1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8l8p8q8r8s8t8u8}9O9P9Q9R9S9Y9Z9b9c:u;R;S;j;{V(n#|8n8oU&S!`$q*}Q&{!xQ)a$jQ,`'tQ.V)sQ1Z-XR4f1y(UbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|%]#^Y!]!l$Z%r%v&w&}'O'P'Q'R'S'T'U'V'W'X'Z'^'a'k)`*o*x+R+i+},Q,S,_/W/Z/x0S0W0X0Y0Z0[0]0^0_0`0a0b0c0f0k3O3R3b3e3k4h5]5`5k6m7O7_7s7}8W8X8z8{:R:W:X:Y:Z:[:]:^:_:`:a:b:c:n:q;Q;i;m;n;o;p;q;r;s;t;u;v;w;x;y;z(VbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|Q&Q!`R/^*zY%z!`&O&V*z+QS([#u(bS+V&[+YS,y(](dQ,z(^Q-Q(eQ.X)uS/i+W+[S/m+]+^S/q+_2SQ1U-PQ1W-RQ1X-SS1}.[2QS3W/l/nQ3Z/oQ3[/pS4k2O2VS4n2T2US5e3Y3]Q5h3^S6W4o4pQ6Y4qQ6r5gS7T6X6ZR7m7UlgOSi{!k$V%^%a%b%d*_*d.x.{Q%f!OW&p!s8]8^:rQ)T$bQ)w$zQ)x${Q+e&aW+w&t8w8x9WW-](u9T9U9VQ-m)UQ.Z)vQ/P*fQ/Q*gQ/Y*uQ/u+fW1_-^9[9]9^Q1h-nW1j-p9_9`9aQ2}/[Q3Q/dQ3`/vQ4[1iQ5Z2zQ5^3PQ5b3VQ5i3aQ6k5[Q6n5cQ7`6pQ7q7]R7t7b%S#]Y!]!l%r%v&w&}'O'P'Q'R'S'T'U'V'W'X'Z'^'a'k)`*o*x+R+i+},Q,_/W/Z/x0S0W0X0Y0Z0[0]0^0_0`0a0b0c0f0k3O3R3b3e3k4h5]5`5k6m7O7_7s7}8W8X8z8{:W:X:Y:Z:[:]:^:_:`:a:b:c:n:q;Q;i;n;o;p;q;r;s;t;u;v;w;x;y;zU(g#v&s0eX(y$Z,S:R;m%S#[Y!]!l%r%v&w&}'O'P'Q'R'S'T'U'V'W'X'Z'^'a'k)`*o*x+R+i+},Q,_/W/Z/x0S0W0X0Y0Z0[0]0^0_0`0a0b0c0f0k3O3R3b3e3k4h5]5`5k6m7O7_7s7}8W8X8z8{:W:X:Y:Z:[:]:^:_:`:a:b:c:n:q;Q;i;n;o;p;q;r;s;t;u;v;w;x;y;zQ']#]W(x$Z,S:R;mR-_(y(UbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|Q%ayQ%bzQ%d|Q%e}R.w*bQ&]!fQ(z$]Q+b&`S-d)O)gS/r+`+aW1b-a-b-c-|S3_/s/tU4X1d1e1fU5{4W4b4cQ6{5|R7h6}T+X&[+YS+X&[+YT2P.[2QS&j!n.uQ,l(PQ,w([S/h+V1}Q0t,mS1O,x-QU3X/m/q4nQ3p0oS4O1V1XU5f3Z3[6YQ5q3qQ5z4RR6s5hQ!uXS&i!n.uQ(v$UQ)R$`Q)X$fQ+k&jQ,k(PQ,v([Q,{(_Q-l)SQ.c){S/g+V1}S0s,l,mS0},w-QQ1Q,zQ1T,|Q2a.dW3U/h/m/q4nQ3o0oQ3s0tS3x1O1XQ4P1WQ4z2bW5d3X3Z3[6YS5p3p3qQ5u3zQ5x4OQ6T4iQ6b4{S6q5f5hQ6u5qQ6w5vQ6z5zQ7Q6UQ7Z6cQ7c6sQ7f6yQ7j7RQ7x7kQ8P7yQ8T8QQ9m9fQ9n9gQ:S;fQ:g:OQ:h:PQ:i:QQ:j:TQ:k:UR:l:V$jWORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`S!um!hx9d#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|!O9e$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:mQ9m:yQ9n:zQ:S:{!q;e#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d$jXORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`Q$Ua!W$`l!g$c$d$e%}&b&c&d([)V)W*w+V+g+h,y-o/b/i/m/w1U3W3[5e6rS$fm!hQ)S$aQ){%OW.d)|)}*O*PU2b.e.f.gQ4i1}S4{2c2dU6U4j4k4nQ6c4|U7R6V6W6YS7k7S7TS7y7l7mQ8Q7zx9f#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|!O9g$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:mQ:O:vQ:P:wQ:Q:xQ:T:yQ:U:zQ:V:{!q;f#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d$b[OSTij{!Q!U!Z!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`U!eRU!^v$rpq!o!r$T$p&X&l&o)h)i)j*]*t+T+m+o/R/{Q*Y%Zx9h#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|Q9l&P!O:t$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!o;g#h'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;dS&T!`$qR/`*}$hZORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`x'[#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|Q*X%Z!O:s$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!q;l#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d!Q#SY!]$Z%r%v&w'U'V'W'X'^'a*o+R+i+},_/x0S0c3b3e8W8Xh8e'Z,S0_0`0a0b0f3k5k:b;Q;in9u)`3R5`6m7_7s7}:R:^:_:`:a:c:n:qw;]'k*x/W/Z0k3O4h5]7O8z8{;m;t;u;v;w;x;y;z|#UY!]$Z%r%v&w'W'X'^'a*o+R+i+},_/x0S0c3b3e8W8Xd8g'Z,S0a0b0f3k5k:b;Q;ij9w)`3R5`6m7_7s7}:R:`:a:c:n:qs;_'k*x/W/Z0k3O4h5]7O8z8{;m;v;w;x;y;zx#YY!]$Z%r%v&w'^'a*o+R+i+},_/x0S0c3b3e8W8Xp'{#p&u(t,g,o-T-U0Q1^3n4S9{:o:p:};h`:|'Z,S0f3k5k:b;Q;i!^;R&q'`(O(U+a+v,s-`-c.Q.S/t0P0u0y1f1v1x2Y3d3u3{4U4Z4c4v5j5s5y6`Y;S0d3j5l6t7df;k)`3R5`6m7_7s7}:R:c:n:qo;|'k*x/W/Z0k3O4h5]7O8z8{;m;x;y;z(UbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|S#i_#jR0h,V(]^ORSTU_ij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h#j$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,V,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|S#d]#kT'd#f'hT#e]#kT'f#f'h(]_ORSTU_ij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h#j$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,V,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|T#i_#jQ#l_R'o#j$jaORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`x:v#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|!O:w$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!q:x#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d#{cOSUi{!Q!U!k!s!y#h$V%V%Y%Z%^%`%a%b%d%h%{&^&t'm(u(|*Z*_*d+c,W-Y-^-f-p._.p.q.r.t.x.{.}0g1s2]2p2r2s4w5V8]8^8w8x9T9U9V9W9[9]9^9_9`9a:rx#v`!v#}$O$S'x'z'{(S(h(i+x-[0n1Y:u;R;S;j;{!z&s!t#a#r#t&_(W({(})Q)n)q+d,p,r-e-g.R.U.^.`0w1R1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8p8r8t8}9P9R9Y9bQ(r$Qc0e8l8q8s8u9O9Q9S9Z9cx#s`!v#}$O$S'x'z'{(S(h(i+x-[0n1Y:u;R;S;j;{S(_#u(bQ(s$RQ,|(`!z9|!t#a#r#t&_(W({(})Q)n)q+d,p,r-e-g.R.U.^.`0w1R1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8p8r8t8}9P9R9Y9bb9}8l8q8s8u9O9Q9S9Z9cQ:e;OR:f;PleOSi{!k$V%^%a%b%d*_*d.x.{Q(V#tQ*k%kQ*l%mR0v,p$W#w`!t!v#a#r#t#}$O$S&_'x'z'{(S(W(h(i({(})Q)n)q+d+x,p,r-[-e-g.R.U.^.`0n0w1R1Y1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8l8p8q8r8s8t8u8}9O9P9Q9R9S9Y9Z9b9c:u;R;S;j;{Q)p$xQ.T)rQ1w.SR4e1xT(a#u(bS(a#u(bT2P.[2QQ)R$`Q,{(_Q-l)SQ.c){Q2a.dQ4z2bQ6T4iQ6b4{Q7Q6UQ7Z6cQ7j7RQ7x7kQ8P7yR8T8Qp'x#p&u(t,g,o-T-U0Q1^3n4S9{:o:p:};h!^8}&q'`(O(U+a+v,s-`-c.Q.S/t0P0u0y1f1v1x2Y3d3u3{4U4Z4c4v5j5s5y6`Z9O0d3j5l6t7dr'z#p&u(t,e,g,o-T-U0Q1^3n4S9{:o:p:};h!`9P&q'`(O(U+a+v,s-`-c.Q.S/t/}0P0u0y1f1v1x2Y3d3u3{4U4Z4c4v5j5s5y6`]9Q0d3j5l5m6t7dpdOSiw{!k$V%T%^%a%b%d*_*d.x.{Q%QvR*Z%ZpdOSiw{!k$V%T%^%a%b%d*_*d.x.{R%QvQ)t$yR.P)mqdOSiw{!k$V%T%^%a%b%d*_*d.x.{Q.])yS2Z.a.bW4r2W2X2Y2_U6]4t4u4vU7V6[6_6`Q7n7WR7{7oQ%XwR*T%TR2h.jR6e4}S$hn$mR-u)^Q%^xR*_%_R*e%eT.y*d.{QiOQ!kST$Yi!kQ!WQR%p!WQ![RU%t![%u*pQ%u!]R*p%vQ*{&QR/_*{Q+y&uR0R+yQ+|&wS0U+|0VR0V+}Q+Y&[R/j+YQ&Y!cQ*q%wT+U&Y*qQ+O&TR/a+OQ&m!pQ+l&kU+p&m+l/|R/|+qQ'h#fR,X'hQ#j_R'n#jQ#`YW'_#`*n3f8kQ*n8WS+r8X8{Q3f8zR8k'kQ,j(PW0q,j0r3r5rU0r,k,l,mS3r0s0tR5r3s#s'v#p&q&u'`(O(U(o(p(t+a+t+u+v,e,f,g,o,s-T-U-`-c.Q.S/t/}0O0P0Q0d0u0y1^1f1v1x2Y3d3h3i3j3n3u3{4S4U4Z4c4v5j5l5m5n5s5y6`6t7d9{:o:p:};hQ,q(UU0x,q0z3vQ0z,sR3v0yQ(b#uR,}(bQ(k#yR-W(kQ1a-`R4V1aQ)k$sR.O)kQ1z.VS4g1z6SR6S4hQ)v$zR.Y)vQ2Q.[R4l2QQ.i*QS2f.i5OR5O2hQ-r)ZS1m-r4^R4^1nQ)_$hR-v)_Q.{*dR2v.{WhOSi!kQ%c{Q(w$VQ*^%^Q*`%aQ*a%bQ*c%dQ.v*_S.y*d.{R2u.xQ$XfQ%g!PQ%j!RQ%l!SQ%n!TQ)f$nQ)l$tQ*S%XQ*i%iS.l*T*WQ/S*hQ/T*kQ/U*lS/e+V1}Q0{,uQ0|,vQ1S,{Q1p-yQ1u.QQ2`.cQ2j.nQ2t.wY3S/g/h/m/q4nQ3w0}Q3y1PQ3|1TQ4a1rQ4d1vQ4y2aQ5P2i[5_3R3U3X3Z3[6YQ5t3xQ5w3}Q6O4_Q6a4zQ6f5QW6l5`5d5f5hQ6v5uQ6x5xQ6|6PQ7P6TQ7Y6bU7^6m6q6sQ7e6wQ7g6zQ7i7QQ7p7ZS7r7_7cQ7v7fQ7w7jQ7|7sQ8O7xQ8R7}Q8S8PR8U8TQ$blQ&a!gU)U$c$d$eQ*u%}U+f&b&c&dQ,u([S-n)V)WQ/[*wQ/d+VS/v+g+hQ1P,yQ1i-oQ3P/bS3V/i/mQ3a/wQ3}1US5c3W3[Q6p5eR7b6rW#q`:u;j;{R)P$_Y#y`$_:u;j;{R-V(jQ#p`S&q!t)QQ&u!vQ'`#aQ(O#rQ(U#tQ(o#}Q(p$OQ(t$SQ+a&_Q+t8pQ+u8rQ+v8tQ,e'xQ,f'zQ,g'{Q,o(SQ,s(WQ-T(hQ-U(id-`({-e.^1c2[4Y4s6Q6^7XQ-c(}Q.Q)nQ.S)qQ/t+dQ/}8}Q0O9PQ0P9RQ0Q+xQ0d8lQ0u,pQ0y,rQ1^-[Q1f-gQ1v.RQ1x.UQ2Y.`Q3d9YQ3h8qQ3i8sQ3j8uQ3n0nQ3u0wQ3{1RQ4S1YQ4U1`Q4Z1gQ4c1tQ4v2^Q5j9bQ5l9SQ5m9OQ5n9QQ5s3tQ5y4QQ6`4xQ6t9ZQ7d9cQ9{:uQ:o;RQ:p;SQ:};jR;h;{lfOSi{!k$V%^%a%b%d*_*d.x.{S!mU%`Q%i!QQ%o!UW&p!s8]8^:rQ&|!yQ'l#hS*W%V%YQ*[%ZQ*h%hQ*r%{Q+`&^W+w&t8w8x9WQ,]'mW-](u9T9U9VQ-b(|Q.s*ZQ/s+cQ0j,WQ1[-YW1_-^9[9]9^Q1e-fW1j-p9_9`9aQ2X._Q2l.pQ2m.qQ2o.rQ2q.tQ2x.}Q3l0gQ4b1sQ4u2]Q5U2pQ5W2rQ5X2sQ6_4wR6h5V!vYOSUi{!Q!k!y$V%V%Y%Z%^%`%a%b%d%h%{&^(|*Z*_*d+c-Y-f._.p.q.r.t.x.{.}1s2]2p2r2s4w5VQ!]RS!lT9jQ$ZjQ%r!ZQ%v!^Q&w!wS&}!|9oQ'O!}Q'P#OQ'Q#PQ'R#QQ'S#RQ'T#SQ'U#TQ'V#UQ'W#VQ'X#WQ'Z#YQ'^#_Q'a#bW'k#h'm,W0gQ)`$iQ*o%sS*x&P/]Q+R&WQ+i&hQ+}&xS,Q8V;TQ,S8YQ,_'sQ/W*sQ/Z*vQ/x+jQ0S+{S0W8_;VQ0X8`Q0Y8aQ0Z8bQ0[8cQ0]8dQ0^8eQ0_8fQ0`8gQ0a8hQ0b8iQ0c,RQ0f8mQ0k8jQ3O8vQ3R/fQ3b/yQ3e0TQ3k8|Q4h1{Q5]2|Q5`3TQ5k9XQ6m5aQ7O6RQ7_6oQ7s7aQ7}7u[8W!U8^8x9U9]9`Y8X!s&t(u-^-pY8z8]8w9T9[9_Y8{9V9W9^9a:rQ:R9iQ:W9pQ:X9qQ:Y9rQ:Z9sQ:[9tQ:]9uQ:^9vQ:_9wQ:`9xQ:a9yQ:b:|Q:c9zQ:n:dQ:q:mQ;Q;kQ;i;|Q;m;UQ;n;WQ;o;XQ;p;YQ;q;ZQ;r;[Q;s;]Q;t;^Q;u;_Q;v;`Q;w;aQ;x;bQ;y;cR;z;dT!VQ!WR!_RR&R!`S%}!`*zS*w&O&VR/b+QR&v!vR&y!wT!qU$TS!pU$TU$spq*]S&k!o!rQ+n&lQ+q&oQ-})jS/z+m+oR3c/{[!bR!^$p&X)h+Th!nUpq!o!r$T&l&o)j+m+o/{Q.u*]Q/X*tQ2{/RT9k&P)iT!dR$pS!cR$pS%w!^)hS*y&P)iQ+S&XR/c+TT&U!`$qQ#f]R'q#kT'g#f'hR0i,VT(R#r(ZR(X#tQ-a({Q1d-eQ2W.^Q4W1cQ4t2[Q5|4YQ6[4sQ6}6QQ7W6^R7o7XlgOSi{!k$V%^%a%b%d*_*d.x.{Q%WwR*S%TV$tpq*]R.W)sR*R%RQ$lnR)e$mR)[$gT%[x%_T%]x%_T.z*d.{",
  nodeNames: "\u26A0 ArithOp ArithOp extends LineComment BlockComment Script ExportDeclaration export Star as VariableName from String ; default FunctionDeclaration async function VariableDefinition TypeParamList TypeDefinition ThisType this LiteralType ArithOp Number BooleanLiteral VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString null super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyNameDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression await yield delete LogicOp BitOp ParenthesizedExpression ClassExpression class extends ClassBody MethodDeclaration Privacy static abstract PropertyDeclaration readonly Optional TypeAnnotation Equals FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp in instanceof CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplatExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var const TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try catch finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement",
  maxTerm: 321,
  nodeProps: [
    [NodeProp.group, -26, 7, 14, 16, 53, 174, 178, 182, 183, 185, 188, 191, 202, 204, 210, 212, 214, 216, 219, 225, 229, 231, 233, 235, 237, 239, 240, "Statement", -30, 11, 13, 23, 26, 27, 37, 38, 39, 40, 42, 47, 55, 63, 69, 70, 83, 84, 93, 94, 109, 112, 114, 115, 116, 117, 119, 120, 138, 139, 141, "Expression", -21, 22, 24, 28, 30, 142, 144, 146, 147, 149, 150, 151, 153, 154, 155, 157, 158, 159, 168, 170, 172, 173, "Type", -2, 74, 78, "ClassItem"],
    [NodeProp.closedBy, 36, "]", 46, "}", 61, ")", 122, "JSXSelfCloseEndTag JSXEndTag", 136, "JSXEndTag"],
    [NodeProp.openedBy, 41, "[", 45, "{", 60, "(", 121, "JSXStartTag", 131, "JSXStartTag JSXStartCloseTag"]
  ],
  skippedNodes: [0, 4, 5],
  repeatNodeCount: 27,
  tokenData: "!Ck~R!ZOX$tX^%S^p$tpq%Sqr&rrs'zst$ttu/wuv2Xvw2|wx3zxy:byz:rz{;S{|<S|}<g}!O<S!O!P<w!P!QAT!Q!R!0Z!R![!2j![!]!8Y!]!^!8l!^!_!8|!_!`!9y!`!a!;U!a!b!<{!b!c$t!c!}/w!}#O!>^#O#P$t#P#Q!>n#Q#R!?O#R#S/w#S#T!?c#T#o/w#o#p!?s#p#q!?x#q#r!@`#r#s!@r#s#y$t#y#z%S#z$f$t$f$g%S$g#BY/w#BY#BZ!AS#BZ$IS/w$IS$I_!AS$I_$I|/w$I|$JO!AS$JO$JT/w$JT$JU!AS$JU$KV/w$KV$KW!AS$KW&FU/w&FU&FV!AS&FV~/wW$yR#zWO!^$t!_#o$t#p~$t,T%Zg#zW&}+{OX$tX^%S^p$tpq%Sq!^$t!_#o$t#p#y$t#y#z%S#z$f$t$f$g%S$g#BY$t#BY#BZ%S#BZ$IS$t$IS$I_%S$I_$I|$t$I|$JO%S$JO$JT$t$JT$JU%S$JU$KV$t$KV$KW%S$KW&FU$t&FU&FV%S&FV~$t$T&yS#zW!e#{O!^$t!_!`'V!`#o$t#p~$t$O'^S#Z#v#zWO!^$t!_!`'j!`#o$t#p~$t$O'qR#Z#v#zWO!^$t!_#o$t#p~$t'u(RZ#zW]!ROY'zYZ(tZr'zrs*Rs!^'z!^!_*e!_#O'z#O#P,q#P#o'z#o#p*e#p~'z&r(yV#zWOr(trs)`s!^(t!^!_)p!_#o(t#o#p)p#p~(t&r)gR#u&j#zWO!^$t!_#o$t#p~$t&j)sROr)prs)|s~)p&j*RO#u&j'u*[R#u&j#zW]!RO!^$t!_#o$t#p~$t'm*jV]!ROY*eYZ)pZr*ers+Ps#O*e#O#P+W#P~*e'm+WO#u&j]!R'm+ZROr*ers+ds~*e'm+kU#u&j]!ROY+}Zr+}rs,fs#O+}#O#P,k#P~+}!R,SU]!ROY+}Zr+}rs,fs#O+}#O#P,k#P~+}!R,kO]!R!R,nPO~+}'u,vV#zWOr'zrs-]s!^'z!^!_*e!_#o'z#o#p*e#p~'z'u-fZ#u&j#zW]!ROY.XYZ$tZr.Xrs/Rs!^.X!^!_+}!_#O.X#O#P/c#P#o.X#o#p+}#p~.X!Z.`Z#zW]!ROY.XYZ$tZr.Xrs/Rs!^.X!^!_+}!_#O.X#O#P/c#P#o.X#o#p+}#p~.X!Z/YR#zW]!RO!^$t!_#o$t#p~$t!Z/hT#zWO!^.X!^!_+}!_#o.X#o#p+}#p~.X&i0S_#zW#pS'Yp'P%kOt$ttu/wu}$t}!O1R!O!Q$t!Q![/w![!^$t!_!c$t!c!}/w!}#R$t#R#S/w#S#T$t#T#o/w#p$g$t$g~/w[1Y_#zW#pSOt$ttu1Ru}$t}!O1R!O!Q$t!Q![1R![!^$t!_!c$t!c!}1R!}#R$t#R#S1R#S#T$t#T#o1R#p$g$t$g~1R$O2`S#T#v#zWO!^$t!_!`2l!`#o$t#p~$t$O2sR#zW#e#vO!^$t!_#o$t#p~$t%r3TU'm%j#zWOv$tvw3gw!^$t!_!`2l!`#o$t#p~$t$O3nS#zW#_#vO!^$t!_!`2l!`#o$t#p~$t'u4RZ#zW]!ROY3zYZ4tZw3zwx*Rx!^3z!^!_5l!_#O3z#O#P7l#P#o3z#o#p5l#p~3z&r4yV#zWOw4twx)`x!^4t!^!_5`!_#o4t#o#p5`#p~4t&j5cROw5`wx)|x~5`'m5qV]!ROY5lYZ5`Zw5lwx+Px#O5l#O#P6W#P~5l'm6ZROw5lwx6dx~5l'm6kU#u&j]!ROY6}Zw6}wx,fx#O6}#O#P7f#P~6}!R7SU]!ROY6}Zw6}wx,fx#O6}#O#P7f#P~6}!R7iPO~6}'u7qV#zWOw3zwx8Wx!^3z!^!_5l!_#o3z#o#p5l#p~3z'u8aZ#u&j#zW]!ROY9SYZ$tZw9Swx/Rx!^9S!^!_6}!_#O9S#O#P9|#P#o9S#o#p6}#p~9S!Z9ZZ#zW]!ROY9SYZ$tZw9Swx/Rx!^9S!^!_6}!_#O9S#O#P9|#P#o9S#o#p6}#p~9S!Z:RT#zWO!^9S!^!_6}!_#o9S#o#p6}#p~9S%V:iR!_$}#zWO!^$t!_#o$t#p~$tZ:yR!^R#zWO!^$t!_#o$t#p~$t%R;]U'Q!R#U#v#zWOz$tz{;o{!^$t!_!`2l!`#o$t#p~$t$O;vS#R#v#zWO!^$t!_!`2l!`#o$t#p~$t$u<ZSi$m#zWO!^$t!_!`2l!`#o$t#p~$t&i<nR|&a#zWO!^$t!_#o$t#p~$t&i=OVq%n#zWO!O$t!O!P=e!P!Q$t!Q![>Z![!^$t!_#o$t#p~$ty=jT#zWO!O$t!O!P=y!P!^$t!_#o$t#p~$ty>QR{q#zWO!^$t!_#o$t#p~$ty>bZ#zWjqO!Q$t!Q![>Z![!^$t!_!g$t!g!h?T!h#R$t#R#S>Z#S#X$t#X#Y?T#Y#o$t#p~$ty?YZ#zWO{$t{|?{|}$t}!O?{!O!Q$t!Q![@g![!^$t!_#R$t#R#S@g#S#o$t#p~$ty@QV#zWO!Q$t!Q![@g![!^$t!_#R$t#R#S@g#S#o$t#p~$ty@nV#zWjqO!Q$t!Q![@g![!^$t!_#R$t#R#S@g#S#o$t#p~$t,TA[`#zW#S#vOYB^YZ$tZzB^z{HT{!PB^!P!Q!*|!Q!^B^!^!_Da!_!`!+u!`!a!,t!a!}B^!}#O!-s#O#P!/o#P#oB^#o#pDa#p~B^XBe[#zWxPOYB^YZ$tZ!PB^!P!QCZ!Q!^B^!^!_Da!_!}B^!}#OFY#O#PGi#P#oB^#o#pDa#p~B^XCb_#zWxPO!^$t!_#Z$t#Z#[CZ#[#]$t#]#^CZ#^#a$t#a#bCZ#b#g$t#g#hCZ#h#i$t#i#jCZ#j#m$t#m#nCZ#n#o$t#p~$tPDfVxPOYDaZ!PDa!P!QD{!Q!}Da!}#OEd#O#PFP#P~DaPEQUxP#Z#[D{#]#^D{#a#bD{#g#hD{#i#jD{#m#nD{PEgTOYEdZ#OEd#O#PEv#P#QDa#Q~EdPEyQOYEdZ~EdPFSQOYDaZ~DaXF_Y#zWOYFYYZ$tZ!^FY!^!_Ed!_#OFY#O#PF}#P#QB^#Q#oFY#o#pEd#p~FYXGSV#zWOYFYYZ$tZ!^FY!^!_Ed!_#oFY#o#pEd#p~FYXGnV#zWOYB^YZ$tZ!^B^!^!_Da!_#oB^#o#pDa#p~B^,TH[^#zWxPOYHTYZIWZzHTz{Ki{!PHT!P!Q!)j!Q!^HT!^!_Mt!_!}HT!}#O!%e#O#P!(x#P#oHT#o#pMt#p~HT,TI]V#zWOzIWz{Ir{!^IW!^!_Jt!_#oIW#o#pJt#p~IW,TIwX#zWOzIWz{Ir{!PIW!P!QJd!Q!^IW!^!_Jt!_#oIW#o#pJt#p~IW,TJkR#zWT+{O!^$t!_#o$t#p~$t+{JwROzJtz{KQ{~Jt+{KTTOzJtz{KQ{!PJt!P!QKd!Q~Jt+{KiOT+{,TKp^#zWxPOYHTYZIWZzHTz{Ki{!PHT!P!QLl!Q!^HT!^!_Mt!_!}HT!}#O!%e#O#P!(x#P#oHT#o#pMt#p~HT,TLu_#zWT+{xPO!^$t!_#Z$t#Z#[CZ#[#]$t#]#^CZ#^#a$t#a#bCZ#b#g$t#g#hCZ#h#i$t#i#jCZ#j#m$t#m#nCZ#n#o$t#p~$t+{MyYxPOYMtYZJtZzMtz{Ni{!PMt!P!Q!$a!Q!}Mt!}#O! w#O#P!#}#P~Mt+{NnYxPOYMtYZJtZzMtz{Ni{!PMt!P!Q! ^!Q!}Mt!}#O! w#O#P!#}#P~Mt+{! eUT+{xP#Z#[D{#]#^D{#a#bD{#g#hD{#i#jD{#m#nD{+{! zWOY! wYZJtZz! wz{!!d{#O! w#O#P!#k#P#QMt#Q~! w+{!!gYOY! wYZJtZz! wz{!!d{!P! w!P!Q!#V!Q#O! w#O#P!#k#P#QMt#Q~! w+{!#[TT+{OYEdZ#OEd#O#PEv#P#QDa#Q~Ed+{!#nTOY! wYZJtZz! wz{!!d{~! w+{!$QTOYMtYZJtZzMtz{Ni{~Mt+{!$f_xPOzJtz{KQ{#ZJt#Z#[!$a#[#]Jt#]#^!$a#^#aJt#a#b!$a#b#gJt#g#h!$a#h#iJt#i#j!$a#j#mJt#m#n!$a#n~Jt,T!%j[#zWOY!%eYZIWZz!%ez{!&`{!^!%e!^!_! w!_#O!%e#O#P!(W#P#QHT#Q#o!%e#o#p! w#p~!%e,T!&e^#zWOY!%eYZIWZz!%ez{!&`{!P!%e!P!Q!'a!Q!^!%e!^!_! w!_#O!%e#O#P!(W#P#QHT#Q#o!%e#o#p! w#p~!%e,T!'hY#zWT+{OYFYYZ$tZ!^FY!^!_Ed!_#OFY#O#PF}#P#QB^#Q#oFY#o#pEd#p~FY,T!(]X#zWOY!%eYZIWZz!%ez{!&`{!^!%e!^!_! w!_#o!%e#o#p! w#p~!%e,T!(}X#zWOYHTYZIWZzHTz{Ki{!^HT!^!_Mt!_#oHT#o#pMt#p~HT,T!)qc#zWxPOzIWz{Ir{!^IW!^!_Jt!_#ZIW#Z#[!)j#[#]IW#]#^!)j#^#aIW#a#b!)j#b#gIW#g#h!)j#h#iIW#i#j!)j#j#mIW#m#n!)j#n#oIW#o#pJt#p~IW,T!+TV#zWS+{OY!*|YZ$tZ!^!*|!^!_!+j!_#o!*|#o#p!+j#p~!*|+{!+oQS+{OY!+jZ~!+j$P!,O[#zW#e#vxPOYB^YZ$tZ!PB^!P!QCZ!Q!^B^!^!_Da!_!}B^!}#OFY#O#PGi#P#oB^#o#pDa#p~B^]!,}[#mS#zWxPOYB^YZ$tZ!PB^!P!QCZ!Q!^B^!^!_Da!_!}B^!}#OFY#O#PGi#P#oB^#o#pDa#p~B^X!-xY#zWOY!-sYZ$tZ!^!-s!^!_!.h!_#O!-s#O#P!/T#P#QB^#Q#o!-s#o#p!.h#p~!-sP!.kTOY!.hZ#O!.h#O#P!.z#P#QDa#Q~!.hP!.}QOY!.hZ~!.hX!/YV#zWOY!-sYZ$tZ!^!-s!^!_!.h!_#o!-s#o#p!.h#p~!-sX!/tV#zWOYB^YZ$tZ!^B^!^!_Da!_#oB^#o#pDa#p~B^y!0bd#zWjqO!O$t!O!P!1p!P!Q$t!Q![!2j![!^$t!_!g$t!g!h?T!h#R$t#R#S!2j#S#U$t#U#V!4Q#V#X$t#X#Y?T#Y#b$t#b#c!3p#c#d!5`#d#l$t#l#m!6h#m#o$t#p~$ty!1wZ#zWjqO!Q$t!Q![!1p![!^$t!_!g$t!g!h?T!h#R$t#R#S!1p#S#X$t#X#Y?T#Y#o$t#p~$ty!2q_#zWjqO!O$t!O!P!1p!P!Q$t!Q![!2j![!^$t!_!g$t!g!h?T!h#R$t#R#S!2j#S#X$t#X#Y?T#Y#b$t#b#c!3p#c#o$t#p~$ty!3wR#zWjqO!^$t!_#o$t#p~$ty!4VW#zWO!Q$t!Q!R!4o!R!S!4o!S!^$t!_#R$t#R#S!4o#S#o$t#p~$ty!4vW#zWjqO!Q$t!Q!R!4o!R!S!4o!S!^$t!_#R$t#R#S!4o#S#o$t#p~$ty!5eV#zWO!Q$t!Q!Y!5z!Y!^$t!_#R$t#R#S!5z#S#o$t#p~$ty!6RV#zWjqO!Q$t!Q!Y!5z!Y!^$t!_#R$t#R#S!5z#S#o$t#p~$ty!6mZ#zWO!Q$t!Q![!7`![!^$t!_!c$t!c!i!7`!i#R$t#R#S!7`#S#T$t#T#Z!7`#Z#o$t#p~$ty!7gZ#zWjqO!Q$t!Q![!7`![!^$t!_!c$t!c!i!7`!i#R$t#R#S!7`#S#T$t#T#Z!7`#Z#o$t#p~$t%w!8cR!WV#zW#c%hO!^$t!_#o$t#p~$t!P!8sR^w#zWO!^$t!_#o$t#p~$t+c!9XR'Ud![%Y#n&s'qP!P!Q!9b!^!_!9g!_!`!9tW!9gO#|W#v!9lP#V#v!_!`!9o#v!9tO#e#v#v!9yO#W#v%w!:QT!t%o#zWO!^$t!_!`!:a!`!a!:t!a#o$t#p~$t$O!:hS#Z#v#zWO!^$t!_!`'j!`#o$t#p~$t$P!:{R#O#w#zWO!^$t!_#o$t#p~$t%w!;aT'T!s#W#v#wS#zWO!^$t!_!`!;p!`!a!<Q!a#o$t#p~$t$O!;wR#W#v#zWO!^$t!_#o$t#p~$t$O!<XT#V#v#zWO!^$t!_!`2l!`!a!<h!a#o$t#p~$t$O!<oS#V#v#zWO!^$t!_!`2l!`#o$t#p~$t%w!=SV'e%o#zWO!O$t!O!P!=i!P!^$t!_!a$t!a!b!=y!b#o$t#p~$t$`!=pRr$W#zWO!^$t!_#o$t#p~$t$O!>QS#zW#`#vO!^$t!_!`2l!`#o$t#p~$t&e!>eRt&]#zWO!^$t!_#o$t#p~$tZ!>uRyR#zWO!^$t!_#o$t#p~$t$O!?VS#]#v#zWO!^$t!_!`2l!`#o$t#p~$t$P!?jR#zW']#wO!^$t!_#o$t#p~$t~!?xO!O~%r!@PT'l%j#zWO!^$t!_!`2l!`#o$t#p#q!=y#q~$t$u!@iR}$k#zW'_QO!^$t!_#o$t#p~$tX!@yR!fP#zWO!^$t!_#o$t#p~$t,T!Aar#zW#pS'Yp'P%k&}+{OX$tX^%S^p$tpq%Sqt$ttu/wu}$t}!O1R!O!Q$t!Q![/w![!^$t!_!c$t!c!}/w!}#R$t#R#S/w#S#T$t#T#o/w#p#y$t#y#z%S#z$f$t$f$g%S$g#BY/w#BY#BZ!AS#BZ$IS/w$IS$I_!AS$I_$I|/w$I|$JO!AS$JO$JT/w$JT$JU!AS$JU$KV/w$KV$KW!AS$KW&FU/w&FU&FV!AS&FV~/w",
  tokenizers: [noSemicolon, incdecToken, template, 0, 1, 2, 3, 4, 5, 6, 7, 8, insertSemicolon],
  topRules: {Script: [0, 6]},
  dialects: {jsx: 12773, ts: 12775},
  dynamicPrecedences: {"139": 1, "166": 1},
  specialized: [{term: 277, get: (value, stack) => tsExtends(value, stack) << 1 | 1}, {term: 277, get: (value) => spec_identifier[value] || -1}, {term: 286, get: (value) => spec_word[value] || -1}, {term: 58, get: (value) => spec_LessThan[value] || -1}],
  tokenPrec: 12795
});

// ../../node_modules/@codemirror/highlight/dist/index.js
var nextTagID = 0;
var Tag = class {
  constructor(set, base2, modified) {
    this.set = set;
    this.base = base2;
    this.modified = modified;
    this.id = nextTagID++;
  }
  static define(parent) {
    if (parent === null || parent === void 0 ? void 0 : parent.base)
      throw new Error("Can not derive from a modified tag");
    let tag = new Tag([], null, []);
    tag.set.push(tag);
    if (parent)
      for (let t2 of parent.set)
        tag.set.push(t2);
    return tag;
  }
  static defineModifier() {
    let mod = new Modifier();
    return (tag) => {
      if (tag.modified.indexOf(mod) > -1)
        return tag;
      return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
    };
  }
};
var nextModifierID = 0;
var Modifier = class {
  constructor() {
    this.instances = [];
    this.id = nextModifierID++;
  }
  static get(base2, mods) {
    if (!mods.length)
      return base2;
    let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
    if (exists)
      return exists;
    let set = [], tag = new Tag(set, base2, mods);
    for (let m of mods)
      m.instances.push(tag);
    let configs = permute(mods);
    for (let parent of base2.set)
      for (let config2 of configs)
        set.push(Modifier.get(parent, config2));
    return tag;
  }
};
function sameArray2(a, b) {
  return a.length == b.length && a.every((x, i) => x == b[i]);
}
function permute(array) {
  let result = [array];
  for (let i = 0; i < array.length; i++) {
    for (let a of permute(array.slice(0, i).concat(array.slice(i + 1))))
      result.push(a);
  }
  return result;
}
function styleTags(spec) {
  let byName = Object.create(null);
  for (let prop in spec) {
    let tags3 = spec[prop];
    if (!Array.isArray(tags3))
      tags3 = [tags3];
    for (let part of prop.split(" "))
      if (part) {
        let pieces = [], mode = 2, rest = part;
        for (let pos = 0; ; ) {
          if (rest == "..." && pos > 0 && pos + 3 == part.length) {
            mode = 1;
            break;
          }
          let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
          if (!m)
            throw new RangeError("Invalid path: " + part);
          pieces.push(m[0] == "*" ? null : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
          pos += m[0].length;
          if (pos == part.length)
            break;
          let next = part[pos++];
          if (pos == part.length && next == "!") {
            mode = 0;
            break;
          }
          if (next != "/")
            throw new RangeError("Invalid path: " + part);
          rest = part.slice(pos);
        }
        let last = pieces.length - 1, inner = pieces[last];
        if (!inner)
          throw new RangeError("Invalid path: " + part);
        let rule = new Rule(tags3, mode, last > 0 ? pieces.slice(0, last) : null);
        byName[inner] = rule.sort(byName[inner]);
      }
  }
  return ruleNodeProp.add(byName);
}
var ruleNodeProp = new NodeProp();
var highlightStyle = Facet.define({
  combine(stylings) {
    return stylings.length ? HighlightStyle.combinedMatch(stylings) : null;
  }
});
var fallbackHighlightStyle = Facet.define({
  combine(values2) {
    return values2.length ? values2[0].match : null;
  }
});
function noHighlight() {
  return null;
}
function getHighlightStyle(state) {
  return state.facet(highlightStyle) || state.facet(fallbackHighlightStyle) || noHighlight;
}
var Rule = class {
  constructor(tags3, mode, context, next) {
    this.tags = tags3;
    this.mode = mode;
    this.context = context;
    this.next = next;
  }
  sort(other) {
    if (!other || other.depth < this.depth) {
      this.next = other;
      return this;
    }
    other.next = this.sort(other.next);
    return other;
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
};
var HighlightStyle = class {
  constructor(spec, options) {
    this.map = Object.create(null);
    let modSpec;
    function def(spec2) {
      let cls = StyleModule.newName();
      (modSpec || (modSpec = Object.create(null)))["." + cls] = spec2;
      return cls;
    }
    this.all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : null;
    for (let style of spec) {
      let cls = (style.class || def(Object.assign({}, style, {tag: null}))) + (this.all ? " " + this.all : "");
      let tags3 = style.tag;
      if (!Array.isArray(tags3))
        this.map[tags3.id] = cls;
      else
        for (let tag of tags3)
          this.map[tag.id] = cls;
    }
    this.module = modSpec ? new StyleModule(modSpec) : null;
    this.scope = options.scope || null;
    this.match = this.match.bind(this);
    let ext = [treeHighlighter];
    if (this.module)
      ext.push(EditorView.styleModule.of(this.module));
    this.extension = ext.concat(highlightStyle.of(this));
    this.fallback = ext.concat(fallbackHighlightStyle.of(this));
  }
  match(tag, scope) {
    if (this.scope && scope != this.scope)
      return null;
    for (let t2 of tag.set) {
      let match = this.map[t2.id];
      if (match !== void 0) {
        if (t2 != tag)
          this.map[tag.id] = match;
        return match;
      }
    }
    return this.map[tag.id] = this.all;
  }
  static combinedMatch(styles) {
    if (styles.length == 1)
      return styles[0].match;
    let cache = styles.some((s) => s.scope) ? void 0 : Object.create(null);
    return (tag, scope) => {
      let cached = cache && cache[tag.id];
      if (cached !== void 0)
        return cached;
      let result = null;
      for (let style of styles) {
        let value = style.match(tag, scope);
        if (value)
          result = result ? result + " " + value : value;
      }
      if (cache)
        cache[tag.id] = result;
      return result;
    };
  }
  static define(specs, options) {
    return new HighlightStyle(specs, options || {});
  }
  static get(state, tag, scope) {
    return getHighlightStyle(state)(tag, scope || NodeType.none);
  }
};
var TreeHighlighter = class {
  constructor(view) {
    this.markCache = Object.create(null);
    this.tree = syntaxTree(view.state);
    this.decorations = this.buildDeco(view, getHighlightStyle(view.state));
  }
  update(update) {
    let tree = syntaxTree(update.state), style = getHighlightStyle(update.state);
    let styleChange = style != update.startState.facet(highlightStyle);
    if (tree.length < update.view.viewport.to && !styleChange) {
      this.decorations = this.decorations.map(update.changes);
    } else if (tree != this.tree || update.viewportChanged || styleChange) {
      this.tree = tree;
      this.decorations = this.buildDeco(update.view, style);
    }
  }
  buildDeco(view, match) {
    if (match == noHighlight || !this.tree.length)
      return Decoration.none;
    let builder = new RangeSetBuilder();
    for (let {from, to} of view.visibleRanges) {
      highlightTreeRange(this.tree, from, to, match, (from2, to2, style) => {
        builder.add(from2, to2, this.markCache[style] || (this.markCache[style] = Decoration.mark({class: style})));
      });
    }
    return builder.finish();
  }
};
var treeHighlighter = Prec.fallback(ViewPlugin.fromClass(TreeHighlighter, {
  decorations: (v) => v.decorations
}));
var nodeStack = [""];
function highlightTreeRange(tree, from, to, style, span2) {
  let spanStart = from, spanClass = "";
  let cursor = tree.topNode.cursor;
  function node(inheritedClass, depth2, scope) {
    let {type, from: start, to: end} = cursor;
    if (start >= to || end <= from)
      return;
    nodeStack[depth2] = type.name;
    if (type.isTop)
      scope = type;
    let cls = inheritedClass;
    let rule = type.prop(ruleNodeProp), opaque = false;
    while (rule) {
      if (!rule.context || matchContext(rule.context, nodeStack, depth2)) {
        for (let tag of rule.tags) {
          let st = style(tag, scope);
          if (st) {
            if (cls)
              cls += " ";
            cls += st;
            if (rule.mode == 1)
              inheritedClass += (inheritedClass ? " " : "") + st;
            else if (rule.mode == 0)
              opaque = true;
          }
        }
        break;
      }
      rule = rule.next;
    }
    if (cls != spanClass) {
      if (start > spanStart && spanClass)
        span2(spanStart, cursor.from, spanClass);
      spanStart = start;
      spanClass = cls;
    }
    if (!opaque && cursor.firstChild()) {
      do {
        let end2 = cursor.to;
        node(inheritedClass, depth2 + 1, scope);
        if (spanClass != cls) {
          let pos = Math.min(to, end2);
          if (pos > spanStart && spanClass)
            span2(spanStart, pos, spanClass);
          spanStart = pos;
          spanClass = cls;
        }
      } while (cursor.nextSibling());
      cursor.parent();
    }
  }
  node("", 0, tree.type);
}
function matchContext(context, stack, depth2) {
  if (context.length > depth2 - 1)
    return false;
  for (let d = depth2 - 1, i = context.length - 1; i >= 0; i--, d--) {
    let check = context[i];
    if (check && check != stack[d])
      return false;
  }
  return true;
}
var t = Tag.define;
var comment = t();
var name = t();
var typeName = t(name);
var literal = t();
var string = t(literal);
var number = t(literal);
var content = t();
var heading = t(content);
var keyword = t();
var operator = t();
var punctuation = t();
var bracket = t(punctuation);
var meta = t();
var tags = {
  comment,
  lineComment: t(comment),
  blockComment: t(comment),
  docComment: t(comment),
  name,
  variableName: t(name),
  typeName,
  tagName: t(typeName),
  propertyName: t(name),
  className: t(name),
  labelName: t(name),
  namespace: t(name),
  macroName: t(name),
  literal,
  string,
  docString: t(string),
  character: t(string),
  number,
  integer: t(number),
  float: t(number),
  bool: t(literal),
  regexp: t(literal),
  escape: t(literal),
  color: t(literal),
  url: t(literal),
  keyword,
  self: t(keyword),
  null: t(keyword),
  atom: t(keyword),
  unit: t(keyword),
  modifier: t(keyword),
  operatorKeyword: t(keyword),
  controlKeyword: t(keyword),
  definitionKeyword: t(keyword),
  operator,
  derefOperator: t(operator),
  arithmeticOperator: t(operator),
  logicOperator: t(operator),
  bitwiseOperator: t(operator),
  compareOperator: t(operator),
  updateOperator: t(operator),
  definitionOperator: t(operator),
  typeOperator: t(operator),
  controlOperator: t(operator),
  punctuation,
  separator: t(punctuation),
  bracket,
  angleBracket: t(bracket),
  squareBracket: t(bracket),
  paren: t(bracket),
  brace: t(bracket),
  content,
  heading,
  heading1: t(heading),
  heading2: t(heading),
  heading3: t(heading),
  heading4: t(heading),
  heading5: t(heading),
  heading6: t(heading),
  contentSeparator: t(content),
  list: t(content),
  quote: t(content),
  emphasis: t(content),
  strong: t(content),
  link: t(content),
  monospace: t(content),
  inserted: t(),
  deleted: t(),
  changed: t(),
  invalid: t(),
  meta,
  documentMeta: t(meta),
  annotation: t(meta),
  processingInstruction: t(meta),
  definition: Tag.defineModifier(),
  constant: Tag.defineModifier(),
  function: Tag.defineModifier(),
  standard: Tag.defineModifier(),
  local: Tag.defineModifier(),
  special: Tag.defineModifier()
};
var defaultHighlightStyle = HighlightStyle.define([
  {
    tag: tags.link,
    textDecoration: "underline"
  },
  {
    tag: tags.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic"
  },
  {
    tag: tags.strong,
    fontWeight: "bold"
  },
  {
    tag: tags.keyword,
    color: "#708"
  },
  {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: "#219"
  },
  {
    tag: [tags.literal, tags.inserted],
    color: "#164"
  },
  {
    tag: [tags.string, tags.deleted],
    color: "#a11"
  },
  {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: "#e40"
  },
  {
    tag: tags.definition(tags.variableName),
    color: "#00f"
  },
  {
    tag: tags.local(tags.variableName),
    color: "#30a"
  },
  {
    tag: [tags.typeName, tags.namespace],
    color: "#085"
  },
  {
    tag: tags.className,
    color: "#167"
  },
  {
    tag: [tags.special(tags.variableName), tags.macroName],
    color: "#256"
  },
  {
    tag: tags.definition(tags.propertyName),
    color: "#00c"
  },
  {
    tag: tags.comment,
    color: "#940"
  },
  {
    tag: tags.meta,
    color: "#7a757a"
  },
  {
    tag: tags.invalid,
    color: "#f00"
  }
]);
var classHighlightStyle = HighlightStyle.define([
  {tag: tags.link, class: "cmt-link"},
  {tag: tags.heading, class: "cmt-heading"},
  {tag: tags.emphasis, class: "cmt-emphasis"},
  {tag: tags.strong, class: "cmt-strong"},
  {tag: tags.keyword, class: "cmt-keyword"},
  {tag: tags.atom, class: "cmt-atom"},
  {tag: tags.bool, class: "cmt-bool"},
  {tag: tags.url, class: "cmt-url"},
  {tag: tags.labelName, class: "cmt-labelName"},
  {tag: tags.inserted, class: "cmt-inserted"},
  {tag: tags.deleted, class: "cmt-deleted"},
  {tag: tags.literal, class: "cmt-literal"},
  {tag: tags.string, class: "cmt-string"},
  {tag: tags.number, class: "cmt-number"},
  {tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "cmt-string2"},
  {tag: tags.variableName, class: "cmt-variableName"},
  {tag: tags.local(tags.variableName), class: "cmt-variableName cmt-local"},
  {tag: tags.definition(tags.variableName), class: "cmt-variableName cmt-definition"},
  {tag: tags.special(tags.variableName), class: "cmt-variableName2"},
  {tag: tags.typeName, class: "cmt-typeName"},
  {tag: tags.namespace, class: "cmt-namespace"},
  {tag: tags.macroName, class: "cmt-macroName"},
  {tag: tags.propertyName, class: "cmt-propertyName"},
  {tag: tags.operator, class: "cmt-operator"},
  {tag: tags.comment, class: "cmt-comment"},
  {tag: tags.meta, class: "cmt-meta"},
  {tag: tags.invalid, class: "cmt-invalid"},
  {tag: tags.punctuation, class: "cmt-punctuation"}
]);

// ../../node_modules/@codemirror/lang-javascript/dist/index.js
var snippets = [
  snippetCompletion("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  snippetCompletion("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  snippetCompletion("try {\n	${}\n} catch (${error}) {\n	${}\n}", {
    label: "try",
    detail: "block",
    type: "keyword"
  }),
  snippetCompletion("class ${name} {\n	constructor(${params}) {\n		${}\n	}\n}", {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  snippetCompletion('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  snippetCompletion('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
];
var javascriptLanguage = LezerLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        IfStatement: continuedIndent({except: /^\s*({|else\b)/}),
        TryStatement: continuedIndent({except: /^\s*({|catch|finally)\b/}),
        LabeledStatement: flatIndent,
        SwitchBody: (context) => {
          let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
          return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
        },
        Block: delimitedIndent({closing: "}"}),
        ArrowFunction: (cx) => cx.baseIndent + cx.unit,
        "TemplateString BlockComment": () => -1,
        "Statement Property": continuedIndent({except: /^{/}),
        JSXElement(context) {
          let closed = /^\s*<\//.test(context.textAfter);
          return context.lineIndent(context.state.doc.lineAt(context.node.from)) + (closed ? 0 : context.unit);
        },
        JSXEscape(context) {
          let closed = /\s*\}/.test(context.textAfter);
          return context.lineIndent(context.state.doc.lineAt(context.node.from)) + (closed ? 0 : context.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        }
      }),
      foldNodeProp.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": foldInside,
        BlockComment(tree) {
          return {from: tree.from + 2, to: tree.to - 2};
        }
      }),
      styleTags({
        "get set async static": tags.modifier,
        "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
        "in of await yield void typeof delete instanceof": tags.operatorKeyword,
        "export import let var const function class extends": tags.definitionKeyword,
        "with debugger from as new": tags.keyword,
        TemplateString: tags.special(tags.string),
        Super: tags.atom,
        BooleanLiteral: tags.bool,
        this: tags.self,
        null: tags.null,
        Star: tags.modifier,
        VariableName: tags.variableName,
        "CallExpression/VariableName": tags.function(tags.variableName),
        VariableDefinition: tags.definition(tags.variableName),
        Label: tags.labelName,
        PropertyName: tags.propertyName,
        "CallExpression/MemberExpression/PropertyName": tags.function(tags.propertyName),
        "FunctionDeclaration/VariableDefinition": tags.function(tags.definition(tags.variableName)),
        "ClassDeclaration/VariableDefinition": tags.definition(tags.className),
        PropertyNameDefinition: tags.definition(tags.propertyName),
        UpdateOp: tags.updateOperator,
        LineComment: tags.lineComment,
        BlockComment: tags.blockComment,
        Number: tags.number,
        String: tags.string,
        ArithOp: tags.arithmeticOperator,
        LogicOp: tags.logicOperator,
        BitOp: tags.bitwiseOperator,
        CompareOp: tags.compareOperator,
        RegExp: tags.regexp,
        Equals: tags.definitionOperator,
        "Arrow : Spread": tags.punctuation,
        "( )": tags.paren,
        "[ ]": tags.squareBracket,
        "{ }": tags.brace,
        ".": tags.derefOperator,
        ", ;": tags.separator,
        TypeName: tags.typeName,
        TypeDefinition: tags.definition(tags.typeName),
        "type enum interface implements namespace module declare": tags.definitionKeyword,
        "abstract global privacy readonly": tags.modifier,
        "is keyof unique infer": tags.operatorKeyword,
        JSXAttributeValue: tags.string,
        JSXText: tags.content,
        "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
        "JSXIdentifier JSXNameSpacedName": tags.tagName,
        "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.propertyName
      })
    ]
  }),
  languageData: {
    closeBrackets: {brackets: ["(", "[", "{", "'", '"', "`"]},
    commentTokens: {line: "//", block: {open: "/*", close: "*/"}},
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
});
var typescriptLanguage = javascriptLanguage.configure({dialect: "ts"});
var jsxLanguage = javascriptLanguage.configure({dialect: "jsx"});
var tsxLanguage = javascriptLanguage.configure({dialect: "jsx ts"});
function javascript(config2 = {}) {
  let lang = config2.jsx ? config2.typescript ? tsxLanguage : jsxLanguage : config2.typescript ? typescriptLanguage : javascriptLanguage;
  return new LanguageSupport(lang, javascriptLanguage.data.of({
    autocomplete: ifNotIn(["LineComment", "BlockComment", "String"], completeFromList(snippets))
  }));
}

// ../../node_modules/lezer-markdown/dist/index.es.js
var CompositeBlock = class {
  constructor(type, value, from, hash2, end, children, positions) {
    this.type = type;
    this.value = value;
    this.from = from;
    this.hash = hash2;
    this.end = end;
    this.children = children;
    this.positions = positions;
  }
  static create(type, value, from, parentHash, end) {
    let hash2 = parentHash + (parentHash << 8) + type + (value << 4) | 0;
    return new CompositeBlock(type, value, from, hash2, end, [], []);
  }
  toTree(nodeSet, end = this.end) {
    let last = this.children.length - 1;
    if (last >= 0)
      end = Math.max(end, this.positions[last] + this.children[last].length + this.from);
    let tree = new Tree(nodeSet.types[this.type], this.children, this.positions, end - this.from).balance(2048);
    stampContext(tree.children, this.hash);
    return tree;
  }
  copy() {
    return new CompositeBlock(this.type, this.value, this.from, this.hash, this.end, this.children.slice(), this.positions.slice());
  }
};
var Type;
(function(Type2) {
  Type2[Type2["Document"] = 1] = "Document";
  Type2[Type2["CodeBlock"] = 2] = "CodeBlock";
  Type2[Type2["FencedCode"] = 3] = "FencedCode";
  Type2[Type2["Blockquote"] = 4] = "Blockquote";
  Type2[Type2["HorizontalRule"] = 5] = "HorizontalRule";
  Type2[Type2["BulletList"] = 6] = "BulletList";
  Type2[Type2["OrderedList"] = 7] = "OrderedList";
  Type2[Type2["ListItem"] = 8] = "ListItem";
  Type2[Type2["ATXHeading1"] = 9] = "ATXHeading1";
  Type2[Type2["ATXHeading2"] = 10] = "ATXHeading2";
  Type2[Type2["ATXHeading3"] = 11] = "ATXHeading3";
  Type2[Type2["ATXHeading4"] = 12] = "ATXHeading4";
  Type2[Type2["ATXHeading5"] = 13] = "ATXHeading5";
  Type2[Type2["ATXHeading6"] = 14] = "ATXHeading6";
  Type2[Type2["SetextHeading1"] = 15] = "SetextHeading1";
  Type2[Type2["SetextHeading2"] = 16] = "SetextHeading2";
  Type2[Type2["HTMLBlock"] = 17] = "HTMLBlock";
  Type2[Type2["LinkReference"] = 18] = "LinkReference";
  Type2[Type2["Paragraph"] = 19] = "Paragraph";
  Type2[Type2["CommentBlock"] = 20] = "CommentBlock";
  Type2[Type2["ProcessingInstructionBlock"] = 21] = "ProcessingInstructionBlock";
  Type2[Type2["Escape"] = 22] = "Escape";
  Type2[Type2["Entity"] = 23] = "Entity";
  Type2[Type2["HardBreak"] = 24] = "HardBreak";
  Type2[Type2["Emphasis"] = 25] = "Emphasis";
  Type2[Type2["StrongEmphasis"] = 26] = "StrongEmphasis";
  Type2[Type2["Link"] = 27] = "Link";
  Type2[Type2["Image"] = 28] = "Image";
  Type2[Type2["InlineCode"] = 29] = "InlineCode";
  Type2[Type2["HTMLTag"] = 30] = "HTMLTag";
  Type2[Type2["Comment"] = 31] = "Comment";
  Type2[Type2["ProcessingInstruction"] = 32] = "ProcessingInstruction";
  Type2[Type2["URL"] = 33] = "URL";
  Type2[Type2["HeaderMark"] = 34] = "HeaderMark";
  Type2[Type2["QuoteMark"] = 35] = "QuoteMark";
  Type2[Type2["ListMark"] = 36] = "ListMark";
  Type2[Type2["LinkMark"] = 37] = "LinkMark";
  Type2[Type2["EmphasisMark"] = 38] = "EmphasisMark";
  Type2[Type2["CodeMark"] = 39] = "CodeMark";
  Type2[Type2["CodeInfo"] = 40] = "CodeInfo";
  Type2[Type2["LinkTitle"] = 41] = "LinkTitle";
  Type2[Type2["LinkLabel"] = 42] = "LinkLabel";
})(Type || (Type = {}));
var LeafBlock = class {
  constructor(start, content2) {
    this.start = start;
    this.content = content2;
    this.marks = [];
    this.parsers = [];
  }
};
var Line2 = class {
  constructor() {
    this.text = "";
    this.baseIndent = 0;
    this.basePos = 0;
    this.depth = 0;
    this.markers = [];
    this.pos = 0;
    this.indent = 0;
    this.next = -1;
  }
  forward() {
    if (this.basePos > this.pos)
      this.forwardInner();
  }
  forwardInner() {
    let newPos = this.skipSpace(this.basePos);
    this.indent = this.countIndent(newPos, this.pos, this.indent);
    this.pos = newPos;
    this.next = newPos == this.text.length ? -1 : this.text.charCodeAt(newPos);
  }
  skipSpace(from) {
    return skipSpace(this.text, from);
  }
  reset(text) {
    this.text = text;
    this.baseIndent = this.basePos = this.pos = this.indent = 0;
    this.forwardInner();
    this.depth = 1;
    while (this.markers.length)
      this.markers.pop();
  }
  moveBase(to) {
    this.basePos = to;
    this.baseIndent = this.countIndent(to, this.pos, this.indent);
  }
  moveBaseColumn(indent) {
    this.baseIndent = indent;
    this.basePos = this.findColumn(indent);
  }
  addMarker(elt2) {
    this.markers.push(elt2);
  }
  countIndent(to, from = 0, indent = 0) {
    for (let i = from; i < to; i++)
      indent += this.text.charCodeAt(i) == 9 ? 4 - indent % 4 : 1;
    return indent;
  }
  findColumn(goal) {
    let i = 0;
    for (let indent = 0; i < this.text.length && indent < goal; i++)
      indent += this.text.charCodeAt(i) == 9 ? 4 - indent % 4 : 1;
    return i;
  }
  scrub() {
    if (!this.baseIndent)
      return this.text;
    let result = "";
    for (let i = 0; i < this.baseIndent; i++)
      result += " ";
    return result + this.text.slice(this.basePos);
  }
};
function skipForList(bl, cx, line) {
  if (line.pos == line.text.length || bl != cx.block && line.indent >= cx.stack[line.depth + 1].value + line.baseIndent)
    return true;
  if (line.indent >= line.baseIndent + 4)
    return false;
  let size = (bl.type == Type.OrderedList ? isOrderedList : isBulletList)(line, cx, false);
  return size > 0 && (bl.type != Type.BulletList || isHorizontalRule(line, cx, false) < 0) && line.text.charCodeAt(line.pos + size - 1) == bl.value;
}
var DefaultSkipMarkup = {
  [Type.Blockquote](bl, cx, line) {
    if (line.next != 62)
      return false;
    line.markers.push(elt(Type.QuoteMark, cx.lineStart + line.pos, cx.lineStart + line.pos + 1));
    line.moveBase(line.pos + 1);
    bl.end = cx.lineStart + line.text.length;
    return true;
  },
  [Type.ListItem](bl, _cx, line) {
    if (line.indent < line.baseIndent + bl.value && line.next > -1)
      return false;
    line.moveBaseColumn(line.baseIndent + bl.value);
    return true;
  },
  [Type.OrderedList]: skipForList,
  [Type.BulletList]: skipForList,
  [Type.Document]() {
    return true;
  }
};
function space2(ch) {
  return ch == 32 || ch == 9 || ch == 10 || ch == 13;
}
function skipSpace(line, i = 0) {
  while (i < line.length && space2(line.charCodeAt(i)))
    i++;
  return i;
}
function skipSpaceBack(line, i, to) {
  while (i > to && space2(line.charCodeAt(i - 1)))
    i--;
  return i;
}
function isFencedCode(line) {
  if (line.next != 96 && line.next != 126)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == line.next)
    pos++;
  if (pos < line.pos + 3)
    return -1;
  if (line.next == 96) {
    for (let i = pos; i < line.text.length; i++)
      if (line.text.charCodeAt(i) == 96)
        return -1;
  }
  return pos;
}
function isBlockquote(line) {
  return line.next != 62 ? -1 : line.text.charCodeAt(line.pos + 1) == 32 ? 2 : 1;
}
function isHorizontalRule(line, cx, breaking) {
  if (line.next != 42 && line.next != 45 && line.next != 95)
    return -1;
  let count = 1;
  for (let pos = line.pos + 1; pos < line.text.length; pos++) {
    let ch = line.text.charCodeAt(pos);
    if (ch == line.next)
      count++;
    else if (!space2(ch))
      return -1;
  }
  if (breaking && line.next == 45 && isSetextUnderline(line) > -1 && line.depth == cx.stack.length)
    return -1;
  return count < 3 ? -1 : 1;
}
function inList(cx, type) {
  return cx.block.type == type || cx.stack.length > 1 && cx.stack[cx.stack.length - 2].type == type;
}
function isBulletList(line, cx, breaking) {
  return (line.next == 45 || line.next == 43 || line.next == 42) && (line.pos == line.text.length - 1 || space2(line.text.charCodeAt(line.pos + 1))) && (!breaking || inList(cx, Type.BulletList) || line.skipSpace(line.pos + 2) < line.text.length) ? 1 : -1;
}
function isOrderedList(line, cx, breaking) {
  let pos = line.pos, next = line.next;
  for (; ; ) {
    if (next >= 48 && next <= 57)
      pos++;
    else
      break;
    if (pos == line.text.length)
      return -1;
    next = line.text.charCodeAt(pos);
  }
  if (pos == line.pos || pos > line.pos + 9 || next != 46 && next != 41 || pos < line.text.length - 1 && !space2(line.text.charCodeAt(pos + 1)) || breaking && !inList(cx, Type.OrderedList) && (line.skipSpace(pos + 1) == line.text.length || pos > line.pos + 1 || line.next != 49))
    return -1;
  return pos + 1 - line.pos;
}
function isAtxHeading(line) {
  if (line.next != 35)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == 35)
    pos++;
  if (pos < line.text.length && line.text.charCodeAt(pos) != 32)
    return -1;
  let size = pos - line.pos;
  return size > 6 ? -1 : size;
}
function isSetextUnderline(line) {
  if (line.next != 45 && line.next != 61 || line.indent >= line.baseIndent + 4)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == line.next)
    pos++;
  let end = pos;
  while (pos < line.text.length && space2(line.text.charCodeAt(pos)))
    pos++;
  return pos == line.text.length ? end : -1;
}
var EmptyLine = /^[ \t]*$/;
var CommentEnd = /-->/;
var ProcessingEnd = /\?>/;
var HTMLBlockStyle = [
  [/^<(?:script|pre|style)(?:\s|>|$)/i, /<\/(?:script|pre|style)>/i],
  [/^\s*<!--/, CommentEnd],
  [/^\s*<\?/, ProcessingEnd],
  [/^\s*<![A-Z]/, />/],
  [/^\s*<!\[CDATA\[/, /\]\]>/],
  [/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i, EmptyLine],
  [/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i, EmptyLine]
];
function isHTMLBlock(line, _cx, breaking) {
  if (line.next != 60)
    return -1;
  let rest = line.text.slice(line.pos);
  for (let i = 0, e = HTMLBlockStyle.length - (breaking ? 1 : 0); i < e; i++)
    if (HTMLBlockStyle[i][0].test(rest))
      return i;
  return -1;
}
function getListIndent(line, pos) {
  let indentAfter = line.countIndent(pos, line.pos, line.indent);
  let indented = line.countIndent(line.skipSpace(pos), pos, indentAfter);
  return indented >= indentAfter + 5 ? indentAfter + 1 : indented;
}
var DefaultBlockParsers = {
  LinkReference: void 0,
  IndentedCode(cx, line) {
    let base2 = line.baseIndent + 4;
    if (line.indent < base2)
      return false;
    let start = line.findColumn(base2);
    let from = cx.lineStart + start, end = cx.lineStart + line.text.length;
    let marks = [], pendingMarks = [];
    for (; cx.nextLine(); ) {
      if (line.depth < cx.stack.length)
        break;
      if (line.pos == line.text.length) {
        for (let m of line.markers)
          pendingMarks.push(m);
      } else if (line.indent < base2) {
        break;
      } else {
        if (pendingMarks.length) {
          for (let m of pendingMarks)
            marks.push(m);
          pendingMarks = [];
        }
        for (let m of line.markers)
          marks.push(m);
        end = cx.lineStart + line.text.length;
      }
    }
    if (pendingMarks.length)
      line.markers = pendingMarks.concat(line.markers);
    let nest = !marks.length && cx.parser.codeParser && cx.parser.codeParser("");
    if (nest)
      cx.startNested(from, nest.startParse(cx.input.clip(end), from, cx.parseContext), (tree) => new Tree(cx.parser.nodeSet.types[Type.CodeBlock], [tree], [0], end - from));
    else
      cx.addNode(cx.buffer.writeElements(marks, -from).finish(Type.CodeBlock, end - from), from);
    return true;
  },
  FencedCode(cx, line) {
    let fenceEnd = isFencedCode(line);
    if (fenceEnd < 0)
      return false;
    let from = cx.lineStart + line.pos, ch = line.next, len = fenceEnd - line.pos;
    let infoFrom = line.skipSpace(fenceEnd), infoTo = skipSpaceBack(line.text, line.text.length, infoFrom);
    let marks = [elt(Type.CodeMark, from, from + len)], info = "";
    if (infoFrom < infoTo) {
      marks.push(elt(Type.CodeInfo, cx.lineStart + infoFrom, cx.lineStart + infoTo));
      info = line.text.slice(infoFrom, infoTo);
    }
    let ownMarks = marks.length, startMarks = ownMarks;
    let codeStart = cx.lineStart + line.text.length + 1, codeEnd = -1;
    for (; cx.nextLine(); ) {
      if (line.depth < cx.stack.length)
        break;
      for (let m of line.markers)
        marks.push(m);
      let i = line.pos;
      if (line.indent - line.baseIndent < 4)
        while (i < line.text.length && line.text.charCodeAt(i) == ch)
          i++;
      if (i - line.pos >= len && line.skipSpace(i) == line.text.length) {
        marks.push(elt(Type.CodeMark, cx.lineStart + line.pos, cx.lineStart + i));
        ownMarks++;
        codeEnd = cx.lineStart - 1;
        cx.nextLine();
        break;
      }
    }
    let to = cx.prevLineEnd();
    if (codeEnd < 0)
      codeEnd = to;
    let nest = marks.length == ownMarks && cx.parser.codeParser && cx.parser.codeParser(info);
    if (nest && codeStart < codeEnd) {
      cx.startNested(from, nest.startParse(cx.input.clip(codeEnd), codeStart, cx.parseContext), (tree) => {
        marks.splice(startMarks, 0, new TreeElement(tree, codeStart));
        return elt(Type.FencedCode, from, to, marks);
      });
    } else {
      cx.addNode(cx.buffer.writeElements(marks, -from).finish(Type.FencedCode, cx.prevLineEnd() - from), from);
    }
    return true;
  },
  Blockquote(cx, line) {
    let size = isBlockquote(line);
    if (size < 0)
      return false;
    cx.startContext(Type.Blockquote, line.pos);
    cx.addNode(Type.QuoteMark, cx.lineStart + line.pos, cx.lineStart + line.pos + 1);
    line.moveBase(line.pos + size);
    return null;
  },
  HorizontalRule(cx, line) {
    if (isHorizontalRule(line, cx, false) < 0)
      return false;
    let from = cx.lineStart + line.pos;
    cx.nextLine();
    cx.addNode(Type.HorizontalRule, from);
    return true;
  },
  BulletList(cx, line) {
    let size = isBulletList(line, cx, false);
    if (size < 0)
      return false;
    if (cx.block.type != Type.BulletList)
      cx.startContext(Type.BulletList, line.basePos, line.next);
    let newBase = getListIndent(line, line.pos + 1);
    cx.startContext(Type.ListItem, line.basePos, newBase - line.baseIndent);
    cx.addNode(Type.ListMark, cx.lineStart + line.pos, cx.lineStart + line.pos + size);
    line.moveBaseColumn(newBase);
    return null;
  },
  OrderedList(cx, line) {
    let size = isOrderedList(line, cx, false);
    if (size < 0)
      return false;
    if (cx.block.type != Type.OrderedList)
      cx.startContext(Type.OrderedList, line.basePos, line.text.charCodeAt(line.pos + size - 1));
    let newBase = getListIndent(line, line.pos + size);
    cx.startContext(Type.ListItem, line.basePos, newBase - line.baseIndent);
    cx.addNode(Type.ListMark, cx.lineStart + line.pos, cx.lineStart + line.pos + size);
    line.moveBaseColumn(newBase);
    return null;
  },
  ATXHeading(cx, line) {
    let size = isAtxHeading(line);
    if (size < 0)
      return false;
    let off = line.pos, from = cx.lineStart + off;
    let endOfSpace = skipSpaceBack(line.text, line.text.length, off), after = endOfSpace;
    while (after > off && line.text.charCodeAt(after - 1) == line.next)
      after--;
    if (after == endOfSpace || after == off || !space2(line.text.charCodeAt(after - 1)))
      after = line.text.length;
    let buf = cx.buffer.write(Type.HeaderMark, 0, size).writeElements(cx.parser.parseInline(line.text.slice(off + size + 1, after), from + size + 1), -from);
    if (after < line.text.length)
      buf.write(Type.HeaderMark, after - off, endOfSpace - off);
    let node = buf.finish(Type.ATXHeading1 - 1 + size, line.text.length - off);
    cx.nextLine();
    cx.addNode(node, from);
    return true;
  },
  HTMLBlock(cx, line) {
    let type = isHTMLBlock(line, cx, false);
    if (type < 0)
      return false;
    let from = cx.lineStart + line.pos, end = HTMLBlockStyle[type][1];
    let marks = [], trailing = end != EmptyLine;
    while (!end.test(line.text) && cx.nextLine()) {
      if (line.depth < cx.stack.length) {
        trailing = false;
        break;
      }
      for (let m of line.markers)
        marks.push(m);
    }
    if (trailing)
      cx.nextLine();
    let nodeType = end == CommentEnd ? Type.CommentBlock : end == ProcessingEnd ? Type.ProcessingInstructionBlock : Type.HTMLBlock;
    let to = cx.prevLineEnd();
    if (!marks.length && nodeType == Type.HTMLBlock && cx.parser.htmlParser) {
      cx.startNested(from, cx.parser.htmlParser.startParse(cx.input.clip(to), from, cx.parseContext), (tree) => new Tree(cx.parser.nodeSet.types[nodeType], [tree], [0], to - from));
    } else {
      cx.addNode(cx.buffer.writeElements(marks, -from).finish(nodeType, to - from), from);
    }
    return true;
  },
  SetextHeading: void 0
};
var LinkReferenceParser = class {
  constructor(leaf) {
    this.stage = 0;
    this.elts = [];
    this.pos = 0;
    this.start = leaf.start;
    this.advance(leaf.content);
  }
  nextLine(cx, line, leaf) {
    if (this.stage == -1)
      return false;
    let content2 = leaf.content + "\n" + line.scrub();
    let finish = this.advance(content2);
    if (finish > -1 && finish < content2.length)
      return this.complete(cx, leaf, finish);
    return false;
  }
  finish(cx, leaf) {
    if ((this.stage == 2 || this.stage == 3) && skipSpace(leaf.content, this.pos) == leaf.content.length)
      return this.complete(cx, leaf, leaf.content.length);
    return false;
  }
  complete(cx, leaf, len) {
    cx.addLeafElement(leaf, elt(Type.LinkReference, this.start, this.start + len, this.elts));
    return true;
  }
  nextStage(elt2) {
    if (elt2) {
      this.pos = elt2.to - this.start;
      this.elts.push(elt2);
      this.stage++;
      return true;
    }
    if (elt2 === false)
      this.stage = -1;
    return false;
  }
  advance(content2) {
    for (; ; ) {
      if (this.stage == -1) {
        return -1;
      } else if (this.stage == 0) {
        if (!this.nextStage(parseLinkLabel(content2, this.pos, this.start, true)))
          return -1;
        if (content2.charCodeAt(this.pos) != 58)
          return this.stage = -1;
        this.elts.push(elt(Type.LinkMark, this.pos + this.start, this.pos + this.start + 1));
        this.pos++;
      } else if (this.stage == 1) {
        if (!this.nextStage(parseURL(content2, skipSpace(content2, this.pos), this.start)))
          return -1;
      } else if (this.stage == 2) {
        let skip2 = skipSpace(content2, this.pos), end = 0;
        if (skip2 > this.pos) {
          let title = parseLinkTitle(content2, skip2, this.start);
          if (title) {
            let titleEnd = lineEnd(content2, title.to - this.start);
            if (titleEnd > 0) {
              this.nextStage(title);
              end = titleEnd;
            }
          }
        }
        if (!end)
          end = lineEnd(content2, this.pos);
        return end > 0 && end < content2.length ? end : -1;
      } else {
        return lineEnd(content2, this.pos);
      }
    }
  }
};
function lineEnd(text, pos) {
  for (; pos < text.length; pos++) {
    let next = text.charCodeAt(pos);
    if (next == 10)
      break;
    if (!space2(next))
      return -1;
  }
  return pos;
}
var SetextHeadingParser = class {
  nextLine(cx, line, leaf) {
    let underline = line.depth < cx.stack.length ? -1 : isSetextUnderline(line);
    let next = line.next;
    if (underline < 0)
      return false;
    let underlineMark = elt(Type.HeaderMark, cx.lineStart + line.pos, cx.lineStart + underline);
    cx.nextLine();
    cx.addLeafElement(leaf, elt(next == 61 ? Type.SetextHeading1 : Type.SetextHeading2, leaf.start, cx.prevLineEnd(), [
      ...cx.parser.parseInline(leaf.content, leaf.start),
      underlineMark
    ]));
    return true;
  }
  finish() {
    return false;
  }
};
var DefaultLeafBlocks = {
  LinkReference(_, leaf) {
    return leaf.content.charCodeAt(0) == 91 ? new LinkReferenceParser(leaf) : null;
  },
  SetextHeading() {
    return new SetextHeadingParser();
  }
};
var DefaultEndLeaf = [
  (_, line) => isAtxHeading(line) >= 0,
  (_, line) => isFencedCode(line) >= 0,
  (_, line) => isBlockquote(line) >= 0,
  (p, line) => isBulletList(line, p, true) >= 0,
  (p, line) => isOrderedList(line, p, true) >= 0,
  (p, line) => isHorizontalRule(line, p, true) >= 0,
  (p, line) => isHTMLBlock(line, p, true) >= 0
];
var NestedParse = class {
  constructor(from, parse, finish) {
    this.from = from;
    this.parse = parse;
    this.finish = finish;
  }
};
var BlockContext = class {
  constructor(parser5, input, startPos, parseContext) {
    this.parser = parser5;
    this.input = input;
    this.parseContext = parseContext;
    this.line = new Line2();
    this.atEnd = false;
    this.nested = null;
    this.lineStart = startPos;
    this.block = CompositeBlock.create(Type.Document, 0, this.lineStart, 0, 0);
    this.stack = [this.block];
    this.fragments = (parseContext === null || parseContext === void 0 ? void 0 : parseContext.fragments) ? new FragmentCursor2(parseContext.fragments, input) : null;
    this.updateLine(input.lineAfter(this.lineStart));
  }
  get pos() {
    return this.nested ? this.nested.parse.pos : this.lineStart;
  }
  advance() {
    if (this.nested) {
      let done = this.nested.parse.advance();
      if (done) {
        let node = this.nested.finish(done);
        if (node instanceof Element)
          node = node.toTree(this.parser.nodeSet);
        this.addNode(node, this.nested.from);
        this.nested = null;
      }
      return null;
    }
    let {line} = this;
    for (; ; ) {
      while (line.depth < this.stack.length)
        this.finishContext();
      for (let mark of line.markers)
        this.addNode(mark.type, mark.from, mark.to);
      if (line.pos < line.text.length)
        break;
      if (!this.nextLine())
        return this.finish();
    }
    if (this.fragments && this.reuseFragment(line.basePos))
      return null;
    start:
      for (; ; ) {
        for (let type of this.parser.blockParsers)
          if (type) {
            let result = type(this, line);
            if (result != false) {
              if (result == true)
                return null;
              line.forward();
              continue start;
            }
          }
        break;
      }
    let leaf = new LeafBlock(this.lineStart + line.pos, line.text.slice(line.pos));
    for (let parse of this.parser.leafBlockParsers)
      if (parse) {
        let parser5 = parse(this, leaf);
        if (parser5)
          leaf.parsers.push(parser5);
      }
    lines:
      while (this.nextLine()) {
        if (line.pos == line.text.length)
          break;
        if (line.indent < line.baseIndent + 4) {
          for (let stop of parser2.endLeafBlock)
            if (stop(this, line))
              break lines;
        }
        for (let parser5 of leaf.parsers)
          if (parser5.nextLine(this, line, leaf))
            return null;
        leaf.content += "\n" + line.scrub();
        for (let m of line.markers)
          leaf.marks.push(m);
      }
    this.finishLeaf(leaf);
    return null;
  }
  reuseFragment(start) {
    if (!this.fragments.moveTo(this.lineStart + start, this.lineStart) || !this.fragments.matches(this.block.hash))
      return false;
    let taken = this.fragments.takeNodes(this);
    if (!taken)
      return false;
    this.lineStart += taken;
    if (this.lineStart < this.input.length) {
      this.lineStart++;
      this.updateLine(this.input.lineAfter(this.lineStart));
    } else {
      this.atEnd = true;
      this.updateLine("");
    }
    return true;
  }
  nextLine() {
    this.lineStart += this.line.text.length;
    if (this.lineStart >= this.input.length) {
      this.atEnd = true;
      this.updateLine("");
      return false;
    } else {
      this.lineStart++;
      this.updateLine(this.input.lineAfter(this.lineStart));
      return true;
    }
  }
  updateLine(text) {
    let {line} = this;
    line.reset(text);
    for (; line.depth < this.stack.length; line.depth++) {
      let cx = this.stack[line.depth], handler = this.parser.skipContextMarkup[cx.type];
      if (!handler)
        throw new Error("Unhandled block context " + Type[cx.type]);
      if (!handler(cx, this, line))
        break;
      line.forward();
    }
  }
  prevLineEnd() {
    return this.atEnd ? this.lineStart : this.lineStart - 1;
  }
  startContext(type, start, value = 0) {
    this.block = CompositeBlock.create(type, value, this.lineStart + start, this.block.hash, this.lineStart + this.line.text.length);
    this.stack.push(this.block);
  }
  startComposite(type, start, value = 0) {
    this.startContext(this.parser.getNodeType(type), start, value);
  }
  addNode(block, from, to) {
    if (typeof block == "number")
      block = new Tree(this.parser.nodeSet.types[block], none5, none5, (to !== null && to !== void 0 ? to : this.prevLineEnd()) - from);
    this.block.children.push(block);
    this.block.positions.push(from - this.block.from);
  }
  addElement(elt2) {
    this.block.children.push(elt2.toTree(this.parser.nodeSet));
    this.block.positions.push(elt2.from - this.block.from);
  }
  addLeafElement(leaf, elt2) {
    this.addNode(this.buffer.writeElements(injectMarks(elt2.children, leaf.marks), -elt2.from).finish(elt2.type, elt2.to - elt2.from), elt2.from);
  }
  startNested(from, parse, finish) {
    this.nested = new NestedParse(from, parse, finish);
  }
  finishContext() {
    this.block = finishContext(this.stack, this.parser.nodeSet);
  }
  finish() {
    while (this.stack.length > 1)
      this.finishContext();
    return this.block.toTree(this.parser.nodeSet, this.lineStart);
  }
  forceFinish() {
    let cx = this.stack.map((cx2) => cx2.copy()), pos = this.lineStart;
    if (this.nested) {
      let inner = cx[cx.length - 1];
      let result = this.nested.finish(this.nested.parse.forceFinish());
      if (result instanceof Element)
        result = result.toTree(this.parser.nodeSet);
      let len = pos - this.nested.from;
      if (result.length > len)
        result = new Tree(result.type, result.children.filter((_, i) => result.positions[i] <= len), result.positions.filter((p) => p <= len), len);
      inner.children.push(result);
      inner.positions.push(this.nested.from);
    }
    while (cx.length > 1)
      finishContext(cx, this.parser.nodeSet);
    return cx[0].toTree(this.parser.nodeSet, pos);
  }
  finishLeaf(leaf) {
    for (let parser5 of leaf.parsers)
      if (parser5.finish(this, leaf))
        return;
    let inline = injectMarks(this.parser.parseInline(leaf.content, leaf.start), leaf.marks);
    this.addNode(this.buffer.writeElements(inline, -leaf.start).finish(Type.Paragraph, leaf.content.length), leaf.start);
  }
  elt(type, from, to, children) {
    if (typeof type == "string")
      return elt(this.parser.getNodeType(type), from, to, children);
    return new TreeElement(type, from);
  }
  get buffer() {
    return new Buffer(this.parser.nodeSet);
  }
};
var MarkdownParser = class {
  constructor(nodeSet, codeParser, htmlParser, blockParsers, leafBlockParsers, blockNames, endLeafBlock, skipContextMarkup, inlineParsers, inlineNames) {
    this.nodeSet = nodeSet;
    this.codeParser = codeParser;
    this.htmlParser = htmlParser;
    this.blockParsers = blockParsers;
    this.leafBlockParsers = leafBlockParsers;
    this.blockNames = blockNames;
    this.endLeafBlock = endLeafBlock;
    this.skipContextMarkup = skipContextMarkup;
    this.inlineParsers = inlineParsers;
    this.inlineNames = inlineNames;
    this.nodeTypes = Object.create(null);
    for (let t2 of nodeSet.types)
      this.nodeTypes[t2.name] = t2.id;
  }
  startParse(input, startPos = 0, parseContext = {}) {
    return new BlockContext(this, input, startPos, parseContext);
  }
  configure(spec) {
    let config2 = resolveConfig(spec);
    if (!config2)
      return this;
    let {nodeSet, skipContextMarkup} = this;
    let blockParsers = this.blockParsers.slice(), leafBlockParsers = this.leafBlockParsers.slice(), blockNames = this.blockNames.slice(), inlineParsers = this.inlineParsers.slice(), inlineNames = this.inlineNames.slice(), endLeafBlock = this.endLeafBlock.slice();
    if (nonEmpty(config2.defineNodes)) {
      skipContextMarkup = Object.assign({}, skipContextMarkup);
      let nodeTypes2 = nodeSet.types.slice();
      for (let s of config2.defineNodes) {
        let {name: name2, block, composite} = typeof s == "string" ? {name: s} : s;
        if (nodeTypes2.some((t2) => t2.name == name2))
          continue;
        if (composite)
          skipContextMarkup[nodeTypes2.length] = (bl, cx, line) => composite(cx, line, bl.value);
        let id2 = nodeTypes2.length;
        let group = composite ? ["Block", "BlockContext"] : !block ? void 0 : id2 >= Type.ATXHeading1 && id2 <= Type.SetextHeading2 ? ["Block", "LeafBlock", "Heading"] : ["Block", "LeafBlock"];
        nodeTypes2.push(NodeType.define({
          id: id2,
          name: name2,
          props: group && [[NodeProp.group, group]]
        }));
      }
      nodeSet = new NodeSet(nodeTypes2);
    }
    if (nonEmpty(config2.props))
      nodeSet = nodeSet.extend(...config2.props);
    if (nonEmpty(config2.remove)) {
      for (let rm2 of config2.remove) {
        let block = this.blockNames.indexOf(rm2), inline = this.inlineNames.indexOf(rm2);
        if (block > -1)
          blockParsers[block] = leafBlockParsers[block] = void 0;
        if (inline > -1)
          inlineParsers[inline] = void 0;
      }
    }
    if (nonEmpty(config2.parseBlock)) {
      for (let spec2 of config2.parseBlock) {
        let found = blockNames.indexOf(spec2.name);
        if (found > -1) {
          blockParsers[found] = spec2.parse;
          leafBlockParsers[found] = spec2.leaf;
        } else {
          let pos = spec2.before ? findName(blockNames, spec2.before) : spec2.after ? findName(blockNames, spec2.after) + 1 : blockNames.length - 1;
          blockParsers.splice(pos, 0, spec2.parse);
          leafBlockParsers.splice(pos, 0, spec2.leaf);
          blockNames.splice(pos, 0, spec2.name);
        }
        if (spec2.endLeaf)
          endLeafBlock.push(spec2.endLeaf);
      }
    }
    if (nonEmpty(config2.parseInline)) {
      for (let spec2 of config2.parseInline) {
        let found = inlineNames.indexOf(spec2.name);
        if (found > -1) {
          inlineParsers[found] = spec2.parse;
        } else {
          let pos = spec2.before ? findName(inlineNames, spec2.before) : spec2.after ? findName(inlineNames, spec2.after) + 1 : inlineNames.length - 1;
          inlineParsers.splice(pos, 0, spec2.parse);
          inlineNames.splice(pos, 0, spec2.name);
        }
      }
    }
    return new MarkdownParser(nodeSet, config2.codeParser || this.codeParser, config2.htmlParser || this.htmlParser, blockParsers, leafBlockParsers, blockNames, endLeafBlock, skipContextMarkup, inlineParsers, inlineNames);
  }
  getNodeType(name2) {
    let found = this.nodeTypes[name2];
    if (found == null)
      throw new RangeError(`Unknown node type '${name2}'`);
    return found;
  }
  parseInline(text, offset) {
    let cx = new InlineContext(this, text, offset);
    outer:
      for (let pos = offset; pos < cx.end; ) {
        let next = cx.char(pos);
        for (let token of this.inlineParsers)
          if (token) {
            let result = token(cx, next, pos);
            if (result >= 0) {
              pos = result;
              continue outer;
            }
          }
        pos++;
      }
    return cx.resolveMarkers(0);
  }
};
function nonEmpty(a) {
  return a != null && a.length > 0;
}
function resolveConfig(spec) {
  if (!Array.isArray(spec))
    return spec;
  if (spec.length == 0)
    return null;
  let conf = resolveConfig(spec[0]);
  if (spec.length == 1)
    return conf;
  let rest = resolveConfig(spec.slice(1));
  if (!rest || !conf)
    return conf || rest;
  let conc2 = (a, b) => (a || none5).concat(b || none5);
  return {
    props: conc2(conf.props, rest.props),
    codeParser: rest.codeParser || conf.codeParser,
    htmlParser: rest.htmlParser || conf.htmlParser,
    defineNodes: conc2(conf.defineNodes, rest.defineNodes),
    parseBlock: conc2(conf.parseBlock, rest.parseBlock),
    parseInline: conc2(conf.parseInline, rest.parseInline),
    remove: conc2(conf.remove, rest.remove)
  };
}
function findName(names, name2) {
  let found = names.indexOf(name2);
  if (found < 0)
    throw new RangeError(`Position specified relative to unknown parser ${name2}`);
  return found;
}
var nodeTypes = [NodeType.none];
for (let i = 1, name2; name2 = Type[i]; i++) {
  nodeTypes[i] = NodeType.define({
    id: i,
    name: name2,
    props: i >= Type.Escape ? [] : [[NodeProp.group, i in DefaultSkipMarkup ? ["Block", "BlockContext"] : ["Block", "LeafBlock"]]]
  });
}
function finishContext(stack, nodeSet) {
  let cx = stack.pop();
  let top2 = stack[stack.length - 1];
  top2.children.push(cx.toTree(nodeSet));
  top2.positions.push(cx.from - top2.from);
  return top2;
}
var none5 = [];
var Buffer = class {
  constructor(nodeSet) {
    this.nodeSet = nodeSet;
    this.content = [];
    this.nodes = [];
  }
  write(type, from, to, children = 0) {
    this.content.push(type, from, to, 4 + children * 4);
    return this;
  }
  writeElements(elts, offset = 0) {
    for (let e of elts)
      e.writeTo(this, offset);
    return this;
  }
  finish(type, length) {
    return Tree.build({
      buffer: this.content,
      nodeSet: this.nodeSet,
      reused: this.nodes,
      topID: type,
      length
    });
  }
};
var Element = class {
  constructor(type, from, to, children = none5) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.children = children;
  }
  writeTo(buf, offset) {
    let startOff = buf.content.length;
    buf.writeElements(this.children, offset);
    buf.content.push(this.type, this.from + offset, this.to + offset, buf.content.length + 4 - startOff);
  }
  toTree(nodeSet) {
    return new Buffer(nodeSet).writeElements(this.children, -this.from).finish(this.type, this.to - this.from);
  }
};
var TreeElement = class {
  constructor(tree, from) {
    this.tree = tree;
    this.from = from;
  }
  get to() {
    return this.from + this.tree.length;
  }
  get type() {
    return this.tree.type.id;
  }
  get children() {
    return none5;
  }
  writeTo(buf, offset) {
    buf.nodes.push(this.tree);
    buf.content.push(buf.nodes.length - 1, this.from + offset, this.to + offset, -1);
  }
  toTree() {
    return this.tree;
  }
};
function elt(type, from, to, children) {
  return new Element(type, from, to, children);
}
var EmphasisUnderscore = {resolve: "Emphasis", mark: "EmphasisMark"};
var EmphasisAsterisk = {resolve: "Emphasis", mark: "EmphasisMark"};
var LinkStart = {};
var ImageStart = {};
var InlineDelimiter = class {
  constructor(type, from, to, side) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.side = side;
  }
};
var Escapable = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
var Punctuation = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  Punctuation = /[\p{Pc}|\p{Pd}|\p{Pe}|\p{Pf}|\p{Pi}|\p{Po}|\p{Ps}]/u;
} catch (_) {
}
var DefaultInline = {
  Escape(cx, next, start) {
    if (next != 92 || start == cx.end - 1)
      return -1;
    let escaped = cx.char(start + 1);
    for (let i = 0; i < Escapable.length; i++)
      if (Escapable.charCodeAt(i) == escaped)
        return cx.append(elt(Type.Escape, start, start + 2));
    return -1;
  },
  Entity(cx, next, start) {
    if (next != 38)
      return -1;
    let m = /^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(cx.slice(start + 1, start + 31));
    return m ? cx.append(elt(Type.Entity, start, start + 1 + m[0].length)) : -1;
  },
  InlineCode(cx, next, start) {
    if (next != 96 || start && cx.char(start - 1) == 96)
      return -1;
    let pos = start + 1;
    while (pos < cx.end && cx.char(pos) == 96)
      pos++;
    let size = pos - start, curSize = 0;
    for (; pos < cx.end; pos++) {
      if (cx.char(pos) == 96) {
        curSize++;
        if (curSize == size && cx.char(pos + 1) != 96)
          return cx.append(elt(Type.InlineCode, start, pos + 1, [
            elt(Type.CodeMark, start, start + size),
            elt(Type.CodeMark, pos + 1 - size, pos + 1)
          ]));
      } else {
        curSize = 0;
      }
    }
    return -1;
  },
  HTMLTag(cx, next, start) {
    if (next != 60 || start == cx.end - 1)
      return -1;
    let after = cx.slice(start + 1, cx.end);
    let url = /^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(after);
    if (url)
      return cx.append(elt(Type.URL, start, start + 1 + url[0].length));
    let comment2 = /^!--[^>](?:-[^-]|[^-])*?-->/i.exec(after);
    if (comment2)
      return cx.append(elt(Type.Comment, start, start + 1 + comment2[0].length));
    let procInst = /^\?[^]*?\?>/.exec(after);
    if (procInst)
      return cx.append(elt(Type.ProcessingInstruction, start, start + 1 + procInst[0].length));
    let m = /^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(after);
    if (!m)
      return -1;
    let children = [];
    if (cx.parser.htmlParser) {
      let p = cx.parser.htmlParser.startParse(stringInput(cx.slice(start, start + 1 + m[0].length)), 0, {}), tree;
      while (!(tree = p.advance())) {
      }
      children = tree.children.map((ch, i) => new TreeElement(ch, start + tree.positions[i]));
    }
    return cx.append(elt(Type.HTMLTag, start, start + 1 + m[0].length, children));
  },
  Emphasis(cx, next, start) {
    if (next != 95 && next != 42)
      return -1;
    let pos = start + 1;
    while (cx.char(pos) == next)
      pos++;
    let before = cx.slice(start - 1, start), after = cx.slice(pos, pos + 1);
    let pBefore = Punctuation.test(before), pAfter = Punctuation.test(after);
    let sBefore = /\s|^$/.test(before), sAfter = /\s|^$/.test(after);
    let leftFlanking = !sAfter && (!pAfter || sBefore || pBefore);
    let rightFlanking = !sBefore && (!pBefore || sAfter || pAfter);
    let canOpen = leftFlanking && (next == 42 || !rightFlanking || pBefore);
    let canClose = rightFlanking && (next == 42 || !leftFlanking || pAfter);
    return cx.append(new InlineDelimiter(next == 95 ? EmphasisUnderscore : EmphasisAsterisk, start, pos, (canOpen ? 1 : 0) | (canClose ? 2 : 0)));
  },
  HardBreak(cx, next, start) {
    if (next == 92 && cx.char(start + 1) == 10)
      return cx.append(elt(Type.HardBreak, start, start + 2));
    if (next == 32) {
      let pos = start + 1;
      while (cx.char(pos) == 32)
        pos++;
      if (cx.char(pos) == 10 && pos >= start + 2)
        return cx.append(elt(Type.HardBreak, start, pos + 1));
    }
    return -1;
  },
  Link(cx, next, start) {
    return next == 91 ? cx.append(new InlineDelimiter(LinkStart, start, start + 1, 1)) : -1;
  },
  Image(cx, next, start) {
    return next == 33 && cx.char(start + 1) == 91 ? cx.append(new InlineDelimiter(ImageStart, start, start + 2, 1)) : -1;
  },
  LinkEnd(cx, next, start) {
    if (next != 93)
      return -1;
    for (let i = cx.parts.length - 1; i >= 0; i--) {
      let part = cx.parts[i];
      if (part instanceof InlineDelimiter && (part.type == LinkStart || part.type == ImageStart)) {
        if (!part.side || cx.skipSpace(part.to) == start && !/[(\[]/.test(cx.slice(start + 1, start + 2))) {
          cx.parts[i] = null;
          return -1;
        }
        let content2 = cx.takeContent(i);
        let link = cx.parts[i] = finishLink(cx, content2, part.type == LinkStart ? Type.Link : Type.Image, part.from, start + 1);
        if (part.type == LinkStart)
          for (let j = 0; j < i; j++) {
            let p = cx.parts[j];
            if (p instanceof InlineDelimiter && p.type == LinkStart)
              p.side = 0;
          }
        return link.to;
      }
    }
    return -1;
  }
};
function finishLink(cx, content2, type, start, startPos) {
  let {text} = cx, next = cx.char(startPos), endPos = startPos;
  content2.unshift(elt(Type.LinkMark, start, start + (type == Type.Image ? 2 : 1)));
  content2.push(elt(Type.LinkMark, startPos - 1, startPos));
  if (next == 40) {
    let pos = cx.skipSpace(startPos + 1);
    let dest = parseURL(text, pos - cx.offset, cx.offset), title;
    if (dest) {
      pos = cx.skipSpace(dest.to);
      title = parseLinkTitle(text, pos - cx.offset, cx.offset);
      if (title)
        pos = cx.skipSpace(title.to);
    }
    if (cx.char(pos) == 41) {
      content2.push(elt(Type.LinkMark, startPos, startPos + 1));
      endPos = pos + 1;
      if (dest)
        content2.push(dest);
      if (title)
        content2.push(title);
      content2.push(elt(Type.LinkMark, pos, endPos));
    }
  } else if (next == 91) {
    let label = parseLinkLabel(text, startPos - cx.offset, cx.offset, false);
    if (label) {
      content2.push(label);
      endPos = label.to;
    }
  }
  return elt(type, start, endPos, content2);
}
function parseURL(text, start, offset) {
  let next = text.charCodeAt(start);
  if (next == 60) {
    for (let pos = start + 1; pos < text.length; pos++) {
      let ch = text.charCodeAt(pos);
      if (ch == 62)
        return elt(Type.URL, start + offset, pos + 1 + offset);
      if (ch == 60 || ch == 10)
        return false;
    }
    return null;
  } else {
    let depth2 = 0, pos = start;
    for (let escaped = false; pos < text.length; pos++) {
      let ch = text.charCodeAt(pos);
      if (space2(ch)) {
        break;
      } else if (escaped) {
        escaped = false;
      } else if (ch == 40) {
        depth2++;
      } else if (ch == 41) {
        if (!depth2)
          break;
        depth2--;
      } else if (ch == 92) {
        escaped = true;
      }
    }
    return pos > start ? elt(Type.URL, start + offset, pos + offset) : pos == text.length ? null : false;
  }
}
function parseLinkTitle(text, start, offset) {
  let next = text.charCodeAt(start);
  if (next != 39 && next != 34 && next != 40)
    return false;
  let end = next == 40 ? 41 : next;
  for (let pos = start + 1, escaped = false; pos < text.length; pos++) {
    let ch = text.charCodeAt(pos);
    if (escaped)
      escaped = false;
    else if (ch == end)
      return elt(Type.LinkTitle, start + offset, pos + 1 + offset);
    else if (ch == 92)
      escaped = true;
  }
  return null;
}
function parseLinkLabel(text, start, offset, requireNonWS) {
  for (let escaped = false, pos = start + 1, end = Math.min(text.length, pos + 999); pos < end; pos++) {
    let ch = text.charCodeAt(pos);
    if (escaped)
      escaped = false;
    else if (ch == 93)
      return requireNonWS ? false : elt(Type.LinkLabel, start + offset, pos + 1 + offset);
    else {
      if (requireNonWS && !space2(ch))
        requireNonWS = false;
      if (ch == 91)
        return false;
      else if (ch == 92)
        escaped = true;
    }
  }
  return null;
}
var InlineContext = class {
  constructor(parser5, text, offset) {
    this.parser = parser5;
    this.text = text;
    this.offset = offset;
    this.parts = [];
  }
  char(pos) {
    return pos >= this.end ? -1 : this.text.charCodeAt(pos - this.offset);
  }
  get end() {
    return this.offset + this.text.length;
  }
  slice(from, to) {
    return this.text.slice(from - this.offset, to - this.offset);
  }
  append(elt2) {
    this.parts.push(elt2);
    return elt2.to;
  }
  addDelimiter(type, from, to, open, close) {
    return this.append(new InlineDelimiter(type, from, to, (open ? 1 : 0) | (close ? 2 : 0)));
  }
  addElement(elt2) {
    return this.append(elt2);
  }
  resolveMarkers(from) {
    for (let i = from; i < this.parts.length; i++) {
      let close = this.parts[i];
      if (!(close instanceof InlineDelimiter && close.type.resolve && close.side & 2))
        continue;
      let emp = close.type == EmphasisUnderscore || close.type == EmphasisAsterisk;
      let closeSize = close.to - close.from;
      let open, j = i - 1;
      for (; j >= from; j--) {
        let part = this.parts[j];
        if (!(part instanceof InlineDelimiter && part.side & 1 && part.type == close.type) || emp && (close.side & 1 || part.side & 2) && (part.to - part.from + closeSize) % 3 == 0 && ((part.to - part.from) % 3 || closeSize % 3))
          continue;
        open = part;
        break;
      }
      if (!open)
        continue;
      let type = close.type.resolve, content2 = [];
      let start = open.from, end = close.to;
      if (emp) {
        let size = Math.min(2, open.to - open.from, closeSize);
        start = open.to - size;
        end = close.from + size;
        type = size == 1 ? "Emphasis" : "StrongEmphasis";
      }
      if (open.type.mark)
        content2.push(this.elt(open.type.mark, start, open.to));
      for (let k = j + 1; k < i; k++) {
        if (this.parts[k] instanceof Element)
          content2.push(this.parts[k]);
        this.parts[k] = null;
      }
      if (close.type.mark)
        content2.push(this.elt(close.type.mark, close.from, end));
      let element = this.elt(type, start, end, content2);
      this.parts[j] = emp && open.from != start ? new InlineDelimiter(open.type, open.from, start, open.side) : null;
      let keep = this.parts[i] = emp && close.to != end ? new InlineDelimiter(close.type, end, close.to, close.side) : null;
      if (keep)
        this.parts.splice(i, 0, element);
      else
        this.parts[i] = element;
    }
    let result = [];
    for (let i = from; i < this.parts.length; i++) {
      let part = this.parts[i];
      if (part instanceof Element)
        result.push(part);
    }
    return result;
  }
  findOpeningDelimiter(type) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      let part = this.parts[i];
      if (part instanceof InlineDelimiter && part.type == type)
        return i;
    }
    return null;
  }
  takeContent(startIndex) {
    let content2 = this.resolveMarkers(startIndex);
    this.parts.length = startIndex;
    return content2;
  }
  skipSpace(from) {
    return skipSpace(this.text, from - this.offset) + this.offset;
  }
  elt(type, from, to, children) {
    if (typeof type == "string")
      return elt(this.parser.getNodeType(type), from, to, children);
    return new TreeElement(type, from);
  }
};
function injectMarks(elements, marks) {
  if (!marks.length)
    return elements;
  if (!elements.length)
    return marks;
  let elts = elements.slice(), eI = 0;
  for (let mark of marks) {
    while (eI < elts.length && elts[eI].to < mark.to)
      eI++;
    if (eI < elts.length && elts[eI].from < mark.from) {
      let e = elts[eI];
      if (e instanceof Element)
        elts[eI] = new Element(e.type, e.from, e.to, injectMarks(e.children, [mark]));
    } else {
      elts.splice(eI++, 0, mark);
    }
  }
  return elts;
}
var ContextHash = new WeakMap();
function stampContext(nodes, hash2) {
  for (let n of nodes) {
    ContextHash.set(n, hash2);
    if (n instanceof Tree && n.type.isAnonymous)
      stampContext(n.children, hash2);
  }
}
var NotLast = [Type.CodeBlock, Type.ListItem, Type.OrderedList, Type.BulletList];
var FragmentCursor2 = class {
  constructor(fragments, input) {
    this.fragments = fragments;
    this.input = input;
    this.i = 0;
    this.fragment = null;
    this.fragmentEnd = -1;
    this.cursor = null;
    if (fragments.length)
      this.fragment = fragments[this.i++];
  }
  nextFragment() {
    this.fragment = this.i < this.fragments.length ? this.fragments[this.i++] : null;
    this.cursor = null;
    this.fragmentEnd = -1;
  }
  moveTo(pos, lineStart) {
    while (this.fragment && this.fragment.to <= pos)
      this.nextFragment();
    if (!this.fragment || this.fragment.from > (pos ? pos - 1 : 0))
      return false;
    if (this.fragmentEnd < 0) {
      let end = this.fragment.to;
      while (end > 0 && this.input.get(end - 1) != 10)
        end--;
      this.fragmentEnd = end ? end - 1 : 0;
    }
    let c = this.cursor;
    if (!c) {
      c = this.cursor = this.fragment.tree.cursor();
      c.firstChild();
    }
    let rPos = pos + this.fragment.offset;
    while (c.to <= rPos)
      if (!c.parent())
        return false;
    for (; ; ) {
      if (c.from >= rPos)
        return this.fragment.from <= lineStart;
      if (!c.childAfter(rPos))
        return false;
    }
  }
  matches(hash2) {
    let tree = this.cursor.tree;
    return tree && ContextHash.get(tree) == hash2;
  }
  takeNodes(cx) {
    let cur2 = this.cursor, off = this.fragment.offset;
    let start = cx.lineStart, end = start, blockI = cx.block.children.length;
    let prevEnd = end, prevI = blockI;
    for (; ; ) {
      if (cur2.to - off >= this.fragmentEnd) {
        if (cur2.type.isAnonymous && cur2.firstChild())
          continue;
        break;
      }
      cx.addNode(cur2.tree, cur2.from - off);
      if (cur2.type.is("Block")) {
        if (NotLast.indexOf(cur2.type.id) < 0) {
          end = cur2.to - off;
          blockI = cx.block.children.length;
        } else {
          end = prevEnd;
          blockI = prevI;
          prevEnd = cur2.to - off;
          prevI = cx.block.children.length;
        }
      }
      if (!cur2.nextSibling())
        break;
    }
    while (cx.block.children.length > blockI) {
      cx.block.children.pop();
      cx.block.positions.pop();
    }
    return end - start;
  }
};
var parser2 = new MarkdownParser(new NodeSet(nodeTypes), null, null, Object.keys(DefaultBlockParsers).map((n) => DefaultBlockParsers[n]), Object.keys(DefaultBlockParsers).map((n) => DefaultLeafBlocks[n]), Object.keys(DefaultBlockParsers), DefaultEndLeaf, DefaultSkipMarkup, Object.keys(DefaultInline).map((n) => DefaultInline[n]), Object.keys(DefaultInline));
var StrikethroughDelim = {resolve: "Strikethrough", mark: "StrikethroughMark"};
var Strikethrough = {
  defineNodes: ["Strikethrough", "StrikethroughMark"],
  parseInline: [{
    name: "Strikethrough",
    parse(cx, next, pos) {
      if (next != 126 || cx.char(pos + 1) != 126)
        return -1;
      return cx.addDelimiter(StrikethroughDelim, pos, pos + 2, true, true);
    },
    after: "Emphasis"
  }]
};
function parseRow(cx, line, startI = 0, elts, offset = 0) {
  let count = 0, first = true, cellStart = -1, cellEnd = -1, esc = false;
  let parseCell = () => {
    elts.push(cx.elt("TableCell", offset + cellStart, offset + cellEnd, cx.parser.parseInline(line.slice(cellStart, cellEnd), offset + cellStart)));
  };
  for (let i = startI; i < line.length; i++) {
    let next = line.charCodeAt(i);
    if (next == 124 && !esc) {
      if (!first || cellStart > -1)
        count++;
      first = false;
      if (elts) {
        if (cellStart > -1)
          parseCell();
        elts.push(cx.elt("TableDelimiter", i + offset, i + offset + 1));
      }
      cellStart = cellEnd = -1;
    } else if (esc || next != 32 && next != 9) {
      if (cellStart < 0)
        cellStart = i;
      cellEnd = i + 1;
    }
    esc = !esc && next == 92;
  }
  if (cellStart > -1) {
    count++;
    if (elts)
      parseCell();
  }
  return count;
}
function hasPipe(str, start) {
  for (let i = start; i < str.length; i++) {
    let next = str.charCodeAt(i);
    if (next == 124)
      return true;
    if (next == 92)
      i++;
  }
  return false;
}
var TableParser = class {
  constructor() {
    this.rows = null;
  }
  nextLine(cx, line, leaf) {
    if (this.rows == null) {
      this.rows = false;
      let lineText;
      if ((line.next == 45 || line.next == 58 || line.next == 124) && /^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/.test(lineText = line.text.slice(line.pos))) {
        let firstRow = [], firstCount = parseRow(cx, leaf.content, 0, firstRow, leaf.start);
        if (firstCount == parseRow(cx, lineText, line.pos))
          this.rows = [
            cx.elt("TableHeader", leaf.start, leaf.start + leaf.content.length, firstRow),
            cx.elt("TableDelimiter", cx.lineStart + line.pos, cx.lineStart + line.text.length)
          ];
      }
    } else if (this.rows) {
      let content2 = [];
      parseRow(cx, line.text, line.pos, content2, cx.lineStart);
      this.rows.push(cx.elt("TableRow", cx.lineStart + line.pos, cx.lineStart + line.text.length, content2));
    }
    return false;
  }
  finish(cx, leaf) {
    if (this.rows) {
      this.emit(cx, leaf);
      return true;
    }
    return false;
  }
  emit(cx, leaf) {
    cx.addLeafElement(leaf, cx.elt("Table", leaf.start, leaf.start + leaf.content.length, this.rows));
  }
};
var Table = {
  defineNodes: [
    {name: "Table", block: true},
    "TableHeader",
    "TableRow",
    "TableCell",
    "TableDelimiter"
  ],
  parseBlock: [{
    name: "Table",
    leaf(_, leaf) {
      return hasPipe(leaf.content, 0) ? new TableParser() : null;
    },
    before: "SetextHeading"
  }]
};
var TaskParser = class {
  nextLine() {
    return false;
  }
  finish(cx, leaf) {
    cx.addLeafElement(leaf, cx.elt("Task", leaf.start, leaf.start + leaf.content.length, [
      cx.elt("TaskMarker", leaf.start, leaf.start + 3),
      ...cx.parser.parseInline(leaf.content.slice(3), leaf.start + 3)
    ]));
    return true;
  }
};
var TaskList = {
  defineNodes: [
    {name: "Task", block: true},
    "TaskMarker"
  ],
  parseBlock: [{
    name: "TaskList",
    leaf(cx, leaf) {
      return /^\[[ xX]\]/.test(leaf.content) && cx.parser.nodeSet.types[cx.block.type].name == "ListItem" ? new TaskParser() : null;
    },
    after: "SetextHeading"
  }]
};
var GFM = [Table, TaskList, Strikethrough];
function parseSubSuper(ch, node, mark) {
  return (cx, next, pos) => {
    if (next != ch || cx.char(pos + 1) == ch)
      return -1;
    let elts = [cx.elt(mark, pos, pos + 1)];
    for (let i = pos + 1; i < cx.end; i++) {
      let next2 = cx.char(i);
      if (next2 == ch)
        return cx.addElement(cx.elt(node, pos, i + 1, elts.concat(cx.elt(mark, i, i + 1))));
      if (next2 == 92)
        elts.push(cx.elt("Escape", i, i++ + 2));
      if (space2(next2))
        break;
    }
    return -1;
  };
}
var Superscript = {
  defineNodes: ["Superscript", "SuperscriptMark"],
  parseInline: [{
    name: "Superscript",
    parse: parseSubSuper(94, "Superscript", "SuperscriptMark")
  }]
};
var Subscript = {
  defineNodes: ["Subscript", "SubscriptMark"],
  parseInline: [{
    name: "Subscript",
    parse: parseSubSuper(126, "Subscript", "SubscriptMark")
  }]
};
var Emoji = {
  defineNodes: ["Emoji"],
  parseInline: [{
    name: "Emoji",
    parse(cx, next, pos) {
      let match;
      if (next != 58 || !(match = /^[a-zA-Z_0-9]+:/.exec(cx.slice(pos + 1, cx.end))))
        return -1;
      return cx.addElement(cx.elt("Emoji", pos, pos + 1 + match[0].length));
    }
  }]
};

// ../../node_modules/lezer-html/dist/index.es.js
var StartTag = 1;
var StartCloseTag = 2;
var MismatchedStartCloseTag = 3;
var missingCloseTag = 34;
var IncompleteCloseTag = 4;
var SelfCloseEndTag = 5;
var commentContent = 35;
var Element2 = 10;
var OpenTag = 11;
var RawText = 25;
var Dialect_noMatch = 0;
var selfClosers = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
  menuitem: true
};
var implicitlyClosed = {
  dd: true,
  li: true,
  optgroup: true,
  option: true,
  p: true,
  rp: true,
  rt: true,
  tbody: true,
  td: true,
  tfoot: true,
  th: true,
  tr: true
};
var closeOnOpen = {
  dd: {dd: true, dt: true},
  dt: {dd: true, dt: true},
  li: {li: true},
  option: {option: true, optgroup: true},
  optgroup: {optgroup: true},
  p: {
    address: true,
    article: true,
    aside: true,
    blockquote: true,
    dir: true,
    div: true,
    dl: true,
    fieldset: true,
    footer: true,
    form: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    header: true,
    hgroup: true,
    hr: true,
    menu: true,
    nav: true,
    ol: true,
    p: true,
    pre: true,
    section: true,
    table: true,
    ul: true
  },
  rp: {rp: true, rt: true},
  rt: {rp: true, rt: true},
  tbody: {tbody: true, tfoot: true},
  td: {td: true, th: true},
  tfoot: {tbody: true},
  th: {td: true, th: true},
  thead: {tbody: true, tfoot: true},
  tr: {tr: true}
};
function nameChar(ch) {
  return ch == 45 || ch == 46 || ch == 58 || ch >= 65 && ch <= 90 || ch == 95 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isSpace(ch) {
  return ch == 9 || ch == 10 || ch == 13 || ch == 32;
}
var cachedName = null;
var cachedInput = null;
var cachedPos = 0;
function tagNameAfter(input, pos) {
  if (cachedPos == pos && cachedInput == input)
    return cachedName;
  let next = input.get(pos);
  while (isSpace(next))
    next = input.get(++pos);
  let start = pos;
  while (nameChar(next))
    next = input.get(++pos);
  cachedInput = input;
  cachedPos = pos;
  return cachedName = pos > start ? input.read(start, pos).toLowerCase() : next == question || next == bang ? void 0 : null;
}
var lessThan = 60;
var greaterThan = 62;
var slash2 = 47;
var question = 63;
var bang = 33;
function ElementContext(name2, parent) {
  this.name = name2;
  this.parent = parent;
  this.hash = parent ? parent.hash : 0;
  for (let i = 0; i < name2.length; i++)
    this.hash += (this.hash << 4) + name2.charCodeAt(i) + (name2.charCodeAt(i) << 8);
}
var elementContext = new ContextTracker({
  start: null,
  shift(context, term, input, stack) {
    return term == StartTag ? new ElementContext(tagNameAfter(input, stack.pos) || "", context) : context;
  },
  reduce(context, term) {
    return term == Element2 && context ? context.parent : context;
  },
  reuse(context, node, input, stack) {
    let type = node.type.id;
    return type == StartTag || type == OpenTag ? new ElementContext(tagNameAfter(input, stack.pos - node.length + 1) || "", context) : context;
  },
  hash(context) {
    return context ? context.hash : 0;
  },
  strict: false
});
var tagStart = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, first = input.get(pos), close;
  if (first < 0 && stack.context)
    token.accept(missingCloseTag, token.start);
  if (first != lessThan)
    return;
  pos++;
  if (close = input.get(pos) == slash2)
    pos++;
  let name2 = tagNameAfter(input, pos);
  if (name2 === void 0)
    return;
  if (!name2)
    return token.accept(close ? IncompleteCloseTag : StartTag, pos);
  let parent = stack.context ? stack.context.name : null;
  if (close) {
    if (name2 == parent)
      return token.accept(StartCloseTag, pos);
    if (parent && implicitlyClosed[parent])
      return token.accept(missingCloseTag, token.start);
    if (stack.dialectEnabled(Dialect_noMatch))
      return token.accept(StartCloseTag, pos);
    for (let cx = stack.context; cx; cx = cx.parent)
      if (cx.name == name2)
        return;
    token.accept(MismatchedStartCloseTag, pos);
  } else {
    if (parent && closeOnOpen[parent] && closeOnOpen[parent][name2])
      token.accept(missingCloseTag, token.start);
    else
      token.accept(StartTag, pos);
  }
});
var selfClosed = new ExternalTokenizer((input, token, stack) => {
  let next = input.get(token.start), end = token.start + 1;
  if (next == slash2) {
    if (input.get(end) != greaterThan)
      return;
    end++;
  } else if (next != greaterThan) {
    return;
  }
  if (stack.context && selfClosers[stack.context.name])
    token.accept(SelfCloseEndTag, end);
});
var commentContent$1 = new ExternalTokenizer((input, token) => {
  let pos = token.start, endPos = 0;
  for (; ; ) {
    let next = input.get(pos);
    if (next < 0)
      break;
    pos++;
    if (next == "-->".charCodeAt(endPos)) {
      endPos++;
      if (endPos == 3) {
        pos -= 3;
        break;
      }
    } else {
      endPos = 0;
    }
  }
  if (pos > token.start)
    token.accept(commentContent, pos);
});
var openTag = /^<\/?\s*([\.\-\:\w\xa1-\uffff]+)/;
function tagName(tag) {
  let m = openTag.exec(tag);
  return m ? m[1].toLowerCase() : null;
}
function attributes(tag) {
  let open = openTag.exec(tag), attrs = {};
  if (open) {
    let attr = /\s*([\.\-\:\w\xa1-\uffff]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s=<>"'/]+)))?/g, m;
    attr.lastIndex = open.index + open[0].length;
    while (m = attr.exec(tag))
      attrs[m[1]] = m[4] || m[3] || m[2] || m[1];
  }
  return attrs;
}
function skip(name2) {
  return (token) => tagName(token) == name2;
}
function resolveContent(tags3) {
  let tagMap = null;
  for (let tag of tags3) {
    if (!tagMap)
      tagMap = Object.create(null);
    (tagMap[tag.tag] || (tagMap[tag.tag] = [])).push({
      attrs: tag.attrs,
      value: {
        filterEnd: skip(tag.tag),
        startParse: tag.parser.startParse.bind(tag.parser)
      }
    });
  }
  return function(input, stack) {
    let openTag2 = input.read(stack.ruleStart, stack.pos);
    let name2 = tagName(openTag2), matches, attrs;
    if (!name2)
      return null;
    if (tagMap && (matches = tagMap[name2])) {
      for (let match of matches) {
        if (!match.attrs || match.attrs(attrs || (attrs = attributes(openTag2))))
          return match.value;
      }
    }
    if (name2 == "script" || name2 == "textarea" || name2 == "style")
      return {
        filterEnd: skip(name2),
        wrapType: RawText
      };
    return null;
  };
}
var elementContent = resolveContent([]);
function configureNesting(tags3) {
  return {elementContent: resolveContent(tags3)};
}
var parser3 = Parser.deserialize({
  version: 13,
  states: "+^OQOXOOOoO`O'#CgS!cOXO'#CfOOOP'#Cf'#CfO!mOdO'#CqO!uO`O'#CsOOOP'#DQ'#DQOOOP'#Cv'#CvQQOXOOOOOQ'#Cw'#CwO!}O`O,59RO#VOrO,59ROOOP'#C{'#C{O#eOXO'#DWO#oOPO,59QOOOS'#C|'#C|O#wOdO,59]OOOP,59],59]O$PO`O,59_O$XO`O,59_OOOP-E6t-E6tOOOQ-E6u-E6uO$aOrO1G.mO$aOrO1G.mO$oOrO'#CiOOOQ'#Cx'#CxO%QOrO1G.mOOOP1G.m1G.mOOOP1G.v1G.vOOOP-E6y-E6yO%]O`O'#CoOOOP1G.l1G.lOOOS-E6z-E6zOOOP1G.w1G.wO%eO`O1G.yO%eO`O1G.yOOOP1G.y1G.yO%mOrO7+$XO%{OrO7+$XOOOP7+$X7+$XOOOP7+$b7+$bO&WOrO,59TO&iO!bO,59TOOOQ-E6v-E6vO&wO`O,59ZO'PO`O,59ZO'XO`O7+$eOOOP7+$e7+$eO'aOrO<<GsOOOP<<Gs<<GsOOOP<<G|<<G|O'lO!bO1G.oO'lO!bO1G.oO'zO#tO'#ClO(YO&jO'#ClO(hOrO1G.oO(vO`O1G.uO(vO`O1G.uOOOP1G.u1G.uOOOP<<HP<<HPOOOPAN=_AN=_OOOPAN=hAN=hO)OO!bO7+$ZO)^OrO7+$ZOOOO'#Cy'#CyO)lO#tO,59WOOOQ,59W,59WOOOO'#Cz'#CzO)zO&jO,59WO)^OrO7+$ZO*YO`O7+$aOOOP7+$a7+$aO*bOrO<<GuO*bOrO<<GuOOOO-E6w-E6wOOOQ1G.r1G.rOOOO-E6x-E6xOOOP<<G{<<G{O*pOrOAN=a",
  stateData: "+T~OPPORTOSUOVUOWUOXUOfUOhVO{SO~O[ZOuXO~OPPORTOSUOVUOWUOXUOfUO{SO~OQzPrzP~PwOs_O|aO~O[cOuXO~O[fOuXO~OTlO^hObkOuXO~OQzXrzX~PwOQnOroO~Os_O|qO~O[rOuXO~ObtOuXO~OTxO^hObwOuXO~O_zOuXOT]X^]Xb]X~OTxO^hObwO~O[}OuXO~Ob!POuXO~OT!SO^hOb!ROuXO~OT!SO^hOb!RO~O_!TOuXOT]a^]ab]a~Oa!XOuXOv!VOx!WO~O[!YOuXO~Ob![OuXO~Ob!]OuXO~OT!_O^hOb!^O~Oa!aOuXOv!VOx!WO~OW!bOX!bOv!dOw!bO~OW!eOX!eOx!dOy!eO~OuXOT]i^]ib]i~Ob!iOuXO~Oa!jOuXOv!VOx!WO~OuXOT]q^]qb]q~OW!bOX!bOv!mOw!bO~OW!eOX!eOx!mOy!eO~Ob!oOuXO~OuXOT]y^]yb]y~OuXOT]!R^]!Rb]!R~O{fhf~",
  goto: "%b{PPPPPPPPPP|!SP!YPP!cPP!m!p|P|PP!v!|$^$m$s$y%PPPP%VPPPPP%_XUOQW]XQOQW]_iZfgjuv!QQ!XzS!a!T!UR!j!`Ro^XROQW]QWORdWQYPQbTneYbgsuy|!O!U!Z!`!g!h!k!pQgZQscQufQyhQ|nQ!OrQ!UzQ!Z}Q!`!TQ!g!XQ!h!YQ!k!aR!p!jQjZSvfgU{jv!QR!QuQ!c!VR!l!cQ!f!WR!n!fQ]QRm]Q`SRp`SVOWT[Q]R^Q",
  nodeNames: "\u26A0 StartTag StartCloseTag StartCloseTag IncompleteCloseTag SelfCloseEndTag Document Text EntityReference CharacterReference Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue EndTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag DoctypeDecl RawText",
  maxTerm: 44,
  context: elementContext,
  nodeProps: [
    [NodeProp.closedBy, -2, 1, 2, "EndTag SelfCloseEndTag", 11, "CloseTag"],
    [NodeProp.openedBy, 5, "StartTag", 18, "StartTag StartCloseTag", 19, "OpenTag"]
  ],
  skippedNodes: [0, 25],
  repeatNodeCount: 7,
  tokenData: "!$|!aR!WOX$kXY)sYZ)sZ]$k]^)s^p$kpq)sqr$krs*zsv$kvw+dwx2wx}$k}!O3d!O!P$k!P!Q7]!Q![$k![!]8s!]!^$k!^!_>`!_!`!!n!`!a8R!a!c$k!c!}8s!}#R$k#R#S8s#S#T$k#T#o8s#o$f$k$f$g&R$g%W$k%W%o8s%o%p$k%p&a8s&a&b$k&b1p8s1p4U$k4U4d8s4d4e$k4e$IS8s$IS$I`$k$I`$Ib8s$Ib$Kh$k$Kh%#t8s%#t&/x$k&/x&Et8s&Et&FV$k&FV;'S8s;'S;:j!#`;:j?&r$k?&r?Ah8s?Ah?BY$k?BY?Mn8s?Mn~$k!Z$vcVPaWw`ypOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx!P$k!P!Q&R!Q!^$k!^!_(k!_!a&R!a$f$k$f$g&R$g~$k!R&[VVPw`ypOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&Rq&xTVPypOv&qwx'Xx!^&q!^!_'g!_~&qP'^RVPOv'Xw!^'X!_~'Xp'lQypOv'gx~'ga'yUVPw`Or'rrs'Xsv'rw!^'r!^!_(]!_~'r`(bRw`Or(]sv(]w~(]!Q(rTw`ypOr(krs'gsv(kwx(]x~(kW)WXaWOX)RZ])R^p)Rqr)Rsw)Rx!P)R!Q!^)R!a$f)R$g~)R!a*O^VPw`ypu^OX&RXY)sYZ)sZ]&R]^)s^p&Rpq)sqr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R!Z+TTvhVPypOv&qwx'Xx!^&q!^!_'g!_~&q!Z+ibaWOX,qXZ.OZ],q]^.O^p,qqr,qrs.Ost/Ztw,qwx.Ox!P,q!P!Q.O!Q!],q!]!^)R!^!a.O!a$f,q$f$g.O$g~,q!Z,vbaWOX,qXZ.OZ],q]^.O^p,qqr,qrs.Ost)Rtw,qwx.Ox!P,q!P!Q.O!Q!],q!]!^.g!^!a.O!a$f,q$f$g.O$g~,q!R.RTOp.Oqs.Ot!].O!]!^.b!^~.O!R.gOW!R!Z.nXW!RaWOX)RZ])R^p)Rqr)Rsw)Rx!P)R!Q!^)R!a$f)R$g~)R!Z/`aaWOX0eXZ1oZ]0e]^1o^p0eqr0ers1osw0ewx1ox!P0e!P!Q1o!Q!]0e!]!^)R!^!a1o!a$f0e$f$g1o$g~0e!Z0jaaWOX0eXZ1oZ]0e]^1o^p0eqr0ers1osw0ewx1ox!P0e!P!Q1o!Q!]0e!]!^2T!^!a1o!a$f0e$f$g1o$g~0e!R1rSOp1oq!]1o!]!^2O!^~1o!R2TOX!R!Z2[XX!RaWOX)RZ])R^p)Rqr)Rsw)Rx!P)R!Q!^)R!a$f)R$g~)R!Z3QUxxVPw`Or'rrs'Xsv'rw!^'r!^!_(]!_~'r!]3oeVPaWw`ypOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx}$k}!O5Q!O!P$k!P!Q&R!Q!^$k!^!_(k!_!a&R!a$f$k$f$g&R$g~$k!]5]dVPaWw`ypOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx!P$k!P!Q&R!Q!^$k!^!_(k!_!`&R!`!a6k!a$f$k$f$g&R$g~$k!T6vVVPw`yp|QOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R!X7fXVPw`ypOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_!`&R!`!a8R!a~&R!X8^VbUVPw`ypOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R!a9S!Y^S[QVPaWw`ypOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx}$k}!O8s!O!P8s!P!Q&R!Q![8s![!]8s!]!^$k!^!_(k!_!a&R!a!c$k!c!}8s!}#R$k#R#S8s#S#T$k#T#o8s#o$f$k$f$g&R$g$}$k$}%O8s%O%W$k%W%o8s%o%p$k%p&a8s&a&b$k&b1p8s1p4U8s4U4d8s4d4e$k4e$IS8s$IS$I`$k$I`$Ib8s$Ib$Je$k$Je$Jg8s$Jg$Kh$k$Kh%#t8s%#t&/x$k&/x&Et8s&Et&FV$k&FV;'S8s;'S;:j<r;:j?&r$k?&r?Ah8s?Ah?BY$k?BY?Mn8s?Mn~$k!a<}eVPaWw`ypOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx!P$k!P!Q&R!Q!^$k!^!_(k!_!a&R!a$f$k$f$g&R$g;=`$k;=`<%l8s<%l~$k!R>gWw`ypOq(kqr?Prs'gsv(kwx(]x!a(k!a!bKh!b~(k!R?WZw`ypOr(krs'gsv(kwx(]x}(k}!O?y!O!f(k!f!gAP!g#W(k#W#XGx#X~(k!R@QVw`ypOr(krs'gsv(kwx(]x}(k}!O@g!O~(k!R@pTw`yp{POr(krs'gsv(kwx(]x~(k!RAWVw`ypOr(krs'gsv(kwx(]x!q(k!q!rAm!r~(k!RAtVw`ypOr(krs'gsv(kwx(]x!e(k!e!fBZ!f~(k!RBbVw`ypOr(krs'gsv(kwx(]x!v(k!v!wBw!w~(k!RCOVw`ypOr(krs'gsv(kwx(]x!{(k!{!|Ce!|~(k!RClVw`ypOr(krs'gsv(kwx(]x!r(k!r!sDR!s~(k!RDYVw`ypOr(krs'gsv(kwx(]x!g(k!g!hDo!h~(k!RDvWw`ypOrDorsE`svDovwEtwxFdx!`Do!`!aG`!a~DoqEeTypOvE`vxEtx!`E`!`!aFV!a~E`PEwRO!`Et!`!aFQ!a~EtPFVOhPqF^QyphPOv'gx~'gaFiVw`OrFdrsEtsvFdvwEtw!`Fd!`!aGO!a~FdaGVRw`hPOr(]sv(]w~(]!RGiTw`yphPOr(krs'gsv(kwx(]x~(k!RHPVw`ypOr(krs'gsv(kwx(]x#c(k#c#dHf#d~(k!RHmVw`ypOr(krs'gsv(kwx(]x#V(k#V#WIS#W~(k!RIZVw`ypOr(krs'gsv(kwx(]x#h(k#h#iIp#i~(k!RIwVw`ypOr(krs'gsv(kwx(]x#m(k#m#nJ^#n~(k!RJeVw`ypOr(krs'gsv(kwx(]x#d(k#d#eJz#e~(k!RKRVw`ypOr(krs'gsv(kwx(]x#X(k#X#YDo#Y~(k!RKoWw`ypOrKhrsLXsvKhvwLmwxM}x!aKh!a!b! e!b~KhqL^TypOvLXvxLmx!aLX!a!bM[!b~LXPLpRO!aLm!a!bLy!b~LmPL|RO!`Lm!`!aMV!a~LmPM[OfPqMaTypOvLXvxLmx!`LX!`!aMp!a~LXqMwQypfPOv'gx~'gaNSVw`OrM}rsLmsvM}vwLmw!aM}!a!bNi!b~M}aNnVw`OrM}rsLmsvM}vwLmw!`M}!`!a! T!a~M}a! [Rw`fPOr(]sv(]w~(]!R! lWw`ypOrKhrsLXsvKhvwLmwxM}x!`Kh!`!a!!U!a~Kh!R!!_Tw`ypfPOr(krs'gsv(kwx(]x~(k!V!!yV_SVPw`ypOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R!a!#keVPaWw`ypOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx!P$k!P!Q&R!Q!^$k!^!_(k!_!a&R!a$f$k$f$g&R$g;=`$k;=`<%l8s<%l~$k",
  tokenizers: [tagStart, selfClosed, commentContent$1, 0, 1, 2, 3, 4, 5],
  topRules: {Document: [0, 6]},
  nested: [["elementContent", elementContent, "&k~RP!^!_U~XP!P!Q[~_dXY!mYZ!m]^!mpq!m![!]$O!c!}$O#R#S$O#T#o$O%W%o$O%p&a$O&b1p$O4U4d$O4e$IS$O$I`$Ib$O$Kh%#t$O&/x&Et$O&FV;'S$O;'S;:j&e?&r?Ah$O?BY?Mn$O~!pdXY!mYZ!m]^!mpq!m![!]$O!c!}$O#R#S$O#T#o$O%W%o$O%p&a$O&b1p$O4U4d$O4e$IS$O$I`$Ib$O$Kh%#t$O&/x&Et$O&FV;'S$O;'S;:j&e?&r?Ah$O?BY?Mn$O~$RkXY%vYZ%v]^%vpq%v}!O$O!O!P$O!Q![$O![!]$O!`!a&Y!c!}$O#R#S$O#T#o$O$}%O$O%W%o$O%p&a$O&b1p$O1p4U$O4U4d$O4e$IS$O$I`$Ib$O$Je$Jg$O$Kh%#t$O&/x&Et$O&FV;'S$O;'S;:j&_?&r?Ah$O?BY?Mn$O~%yTXY%vYZ%v]^%vpq%v!`!a&Y~&_Oq~~&bP;=`<%l$O~&hP;=`<%l$O", 42]],
  dialects: {noMatch: 0},
  tokenPrec: 460
});

// ../../node_modules/lezer-css/dist/index.es.js
var descendantOp = 92;
var Unit = 1;
var callee = 93;
var identifier = 94;
var space3 = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
var colon = 58;
var parenL = 40;
var underscore = 95;
var bracketL = 91;
var dash = 45;
var period = 46;
var hash = 35;
var percent = 37;
function isAlpha(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var identifiers = new ExternalTokenizer((input, token) => {
  let start = token.start, pos = start, inside2 = false;
  for (; ; ) {
    let next = input.get(pos);
    if (isAlpha(next) || next == dash || next == underscore || inside2 && isDigit(next)) {
      if (!inside2 && (next != dash || pos > start))
        inside2 = true;
      pos++;
      continue;
    }
    if (inside2)
      token.accept(next == parenL ? callee : identifier, pos);
    break;
  }
});
var descendant = new ExternalTokenizer((input, token) => {
  if (space3.includes(input.get(token.start - 1))) {
    let next = input.get(token.start);
    if (isAlpha(next) || next == underscore || next == hash || next == period || next == bracketL || next == colon || next == dash)
      token.accept(descendantOp, token.start);
  }
});
var unitToken = new ExternalTokenizer((input, token) => {
  let {start} = token;
  if (!space3.includes(input.get(start - 1))) {
    let next = input.get(start);
    if (next == percent)
      token.accept(Unit, start + 1);
    if (isAlpha(next)) {
      let pos = start + 1;
      while (isAlpha(input.get(pos)))
        pos++;
      token.accept(Unit, pos);
    }
  }
});
var spec_callee = {__proto__: null, not: 30, url: 64, "url-prefix": 64, domain: 64, regexp: 64, selector: 132};
var spec_AtKeyword = {__proto__: null, "@import": 112, "@media": 136, "@charset": 140, "@namespace": 144, "@keyframes": 150, "@supports": 162};
var spec_identifier2 = {__proto__: null, not: 126, only: 126, from: 156, to: 158};
var parser4 = Parser.deserialize({
  version: 13,
  states: "7WOYQ[OOOOQP'#Cc'#CcOOQP'#Cb'#CbO!ZQ[O'#CeO!}QXO'#C`O#UQ[O'#CgO#aQ[O'#DOO#fQ[O'#DSOOQP'#Eb'#EbO#kQdO'#DdO$SQ[O'#DqO#kQdO'#DsO$eQ[O'#DuO$pQ[O'#DxO$uQ[O'#EOO%TQ[O'#EQOOQS'#Ea'#EaOOQS'#ER'#ERQYQ[OOOOQP'#Cf'#CfOOQP,59P,59PO!ZQ[O,59PO%[Q[O'#ESO%vQWO,58zO&OQ[O,59RO#aQ[O,59jO#fQ[O,59nO%[Q[O,59rO%[Q[O,59tO%[Q[O,59uO'[Q[O'#D_OOQS,58z,58zOOQP'#Cj'#CjOOQO'#Cp'#CpOOQP,59R,59RO'cQWO,59RO'hQWO,59ROOQP'#DQ'#DQOOQP,59j,59jOOQO'#DU'#DUO'mQ`O,59nOOQS'#Cr'#CrO#kQdO'#CsO'uQvO'#CuO(|QtO,5:OOOQO'#Cz'#CzO'hQWO'#CyO)bQWO'#C{OOQS'#Ef'#EfOOQO'#Dg'#DgO)gQ[O'#DnO)uQWO'#EhO$uQ[O'#DlO*TQWO'#DoOOQO'#Ei'#EiO%yQWO,5:]O*YQpO,5:_OOQS'#Dw'#DwO*bQWO,5:aO*gQ[O,5:aOOQO'#Dz'#DzO*oQWO,5:dO*tQWO,5:jO*|QWO,5:lOOQS-E8P-E8POOQP1G.k1G.kO+pQXO,5:nOOQO-E8Q-E8QOOQS1G.f1G.fOOQP1G.m1G.mO'cQWO1G.mO'hQWO1G.mOOQP1G/U1G/UO+}Q`O1G/YO,hQXO1G/^O-OQXO1G/`O-fQXO1G/aO-|QXO'#CcO.qQWO'#D`OOQS,59y,59yO.vQWO,59yO/OQ[O,59yO/VQ[O'#CnO/^QdO'#CqOOQP1G/Y1G/YO#kQdO1G/YO/eQpO,59_OOQS,59a,59aO#kQdO,59cO/mQWO1G/jOOQS,59e,59eO/rQ!bO,59gO/zQWO'#DgO0VQWO,5:SO0[QWO,5:YO$uQ[O,5:UO$uQ[O'#EXO0dQWO,5;SO0oQWO,5:WO%[Q[O,5:ZOOQS1G/w1G/wOOQS1G/y1G/yOOQS1G/{1G/{O1QQWO1G/{O1VQdO'#D{OOQS1G0O1G0OOOQS1G0U1G0UOOQS1G0W1G0WOOQP7+$X7+$XOOQP7+$t7+$tO#kQdO7+$tO#kQdO,59zO1eQ[O'#EWO1oQWO1G/eOOQS1G/e1G/eO1oQWO1G/eO1wQXO'#EdO2OQWO,59YO2TQtO'#ETO2uQdO'#EeO3PQWO,59]O3UQpO7+$tOOQS1G.y1G.yOOQS1G.}1G.}OOQS7+%U7+%UO3^QWO1G/RO#kQdO1G/nOOQO1G/t1G/tOOQO1G/p1G/pO3cQWO,5:sOOQO-E8V-E8VO3qQXO1G/uOOQS7+%g7+%gO3xQYO'#CuO%yQWO'#EYO4QQdO,5:gOOQS,5:g,5:gO4`QpO<<H`O4hQtO1G/fOOQO,5:r,5:rO4{Q[O,5:rOOQO-E8U-E8UOOQS7+%P7+%PO5VQWO7+%PO5_QWO,5;OOOQP1G.t1G.tOOQS-E8R-E8RO#kQdO'#EUO5gQWO,5;POOQT1G.w1G.wOOQP<<H`<<H`OOQS7+$m7+$mO5oQdO7+%YOOQO7+%a7+%aOOQS,5:t,5:tOOQS-E8W-E8WOOQS1G0R1G0ROOQPAN=zAN=zO5vQtO'#EVO#kQdO'#EVO6nQdO7+%QOOQO7+%Q7+%QOOQO1G0^1G0^OOQS<<Hk<<HkO7OQdO,5:pOOQO-E8S-E8SOOQO<<Ht<<HtO7YQtO,5:qOOQS-E8T-E8TOOQO<<Hl<<Hl",
  stateData: "8W~O#SOSQOS~OTWOWWO[TO]TOsUOwVO!X_O!YXO!fYO!hZO!j[O!m]O!s^O#QPO#VRO~O#QcO~O[hO]hOcfOsiOwjO{kO!OmO#OlO#VeO~O!QnO~P!`O_sO#PqO#QpO~O#QuO~O#QwO~OazOh!QOj!QOp!PO#P}O#QyO#Z{O~Oa!SO!a!UO!d!VO#Q!RO!Q#[P~Oj![Op!PO#Q!ZO~O#Q!^O~Oa!SO!a!UO!d!VO#Q!RO~O!V#[P~P$SOTWOWWO[TO]TOsUOwVO#QPO#VRO~OcfO!QnO~O_!hO#PqO#QpO~OTWOWWO[TO]TOsUOwVO!X_O!YXO!fYO!hZO!j[O!m]O!s^O#Q!oO#VRO~O!P!qO~P&ZOa!tO~Oa!uO~Ou!vOy!wO~OP!yOaiXliX!ViX!aiX!diX#QiX`iXciXhiXjiXpiX#PiX#ZiXuiX!PiX!UiX~Oa!SOl!zO!a!UO!d!VO#Q!RO!V#[P~Oa!}O~Oa!SO!a!UO!d!VO#Q#OO~Oc#SO!_#RO!Q#[X!V#[X~Oa#VO~Ol!zO!V#XO~O!V#YO~Oj#ZOp!PO~O!Q#[O~O!QnO!_#RO~O!QnO!V#_O~O[hO]hOsiOwjO{kO!OmO#OlO#VeO~Oc!va!Q!va`!va~P+UOu#aOy#bO~O[hO]hOsiOwjO#VeO~Oczi{zi!Ozi!Qzi#Ozi`zi~P,VOc|i{|i!O|i!Q|i#O|i`|i~P,VOc}i{}i!O}i!Q}i#O}i`}i~P,VO[VX[!TX]VXcVXsVXwVX{VX!OVX!QVX#OVX#VVX~O[#cO~O!P#fO!V#dO~O!P#fO~P&ZO`#WP~P%[O`#XP~P#kO`#nOl!zO~O!V#pO~Oj#qOq#qO~O[!]X`!ZX!_!ZX~O[#rO~O`#sO!_#RO~Oc#SO!Q#[a!V#[a~O!_#ROc!`a!Q!`a!V!`a`!`a~O!V#xO~O!P#|O!p#zO!q#zO#Z#yO~O!P!zX!V!zX~P&ZO!P$SO!V#dO~O`#WX~P!`O`$VO~Ol!zO`!wXa!wXc!wXh!wXj!wXp!wX#P!wX#Q!wX#Z!wX~Oc$XO`#XX~P#kO`$ZO~Ol!zOu$[O~O`$]O~O!_#ROc!{a!Q!{a!V!{a~O`$_O~P+UOP!yO!QiX~O!P$bO!p#zO!q#zO#Z#yO~Ol!zOu$cO~Oc$eOl!zO!U$gO!P!Si!V!Si~P#kO!P!za!V!za~P&ZO!P$iO!V#dO~OcfO`#Wa~Oc$XO`#Xa~O`$lO~P#kOl!zOa!yXc!yXh!yXj!yXp!yX!P!yX!U!yX!V!yX#P!yX#Q!yX#Z!yX~Oc$eO!U$oO!P!Sq!V!Sq~P#kO`!xac!xa~P#kOl!zOa!yac!yah!yaj!yap!ya!P!ya!U!ya!V!ya#P!ya#Q!ya#Z!ya~Oq#Zl!Ol~",
  goto: "+}#^PPPP#_P#g#uP#g$T#gPP$ZPPP$aP$g$m$v$vP%YP$vP$v%p&SPP#gP&lP#gP&rP#gP#g#gPPP&x'['hPP#_PP'n'n'x'nP'nP'n'nP#_P#_P#_P'{#_P(O(RPP#_P#_(U(d(n(|)S)Y)d)jPPPPPP)p)xP*d*g*jP+`+i]`Obn!s#d$QiWObfklmn!s!t#V#d$QiQObfklmn!s!t#V#d$QQdRR!ceQrTR!ghQ!gsR#`!hQtTR!ihQ!gtQ!|!OR#`!iq!QXZz!u!w!z#b#c#k#r$O$X$^$e$f$jp!QXZz!u!w!z#b#c#k#r$O$X$^$e$f$jT#z#[#{q!OXZz!u!w!z#b#c#k#r$O$X$^$e$f$jp!QXZz!u!w!z#b#c#k#r$O$X$^$e$f$jQ![[R#Z!]QvUR!jiQxVR!kjQoSQ!fgQ#W!XQ#^!`Q#_!aR$`#zQ!rnQ#g!sQ$P#dR$h$QX!pn!s#d$Qa!WY^_|!S!U#R#SR#P!SR!][R!_]R#]!_QbOU!bb!s$QQ!snR$Q#dQgSS!eg$UR$U#hQ#k!uU$W#k$^$jQ$^#rR$j$XQ$Y#kR$k$YQ$f$OR$n$fQ#e!rS$R#e$TR$T#gQ#T!TR#v#TQ#{#[R$a#{]aObn!s#d$Q[SObn!s#d$QQ!dfQ!lkQ!mlQ!nmQ#h!tR#w#VR#i!tR#l!uQ|XQ!YZQ!xz[#j!u#k#r$X$^$jQ#m!wQ#o!zQ#}#bQ$O#cS$d$O$fR$m$eQ!XYQ!a_R!{|U!TY_|Q!`^Q#Q!SQ#U!UQ#t#RR#u#S",
  nodeNames: "\u26A0 Unit Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector ClassSelector ClassName PseudoClassSelector : :: PseudoClassName not ) ( ArgList , PseudoClassName ArgList ValueName ParenthesizedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee CallLiteral CallTag ParenthesizedContent IdSelector # IdName ] AttributeSelector [ AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp } { Block Declaration PropertyName Important ; ImportStatement AtKeyword import KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery callee MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList from to SupportsStatement supports AtRule",
  maxTerm: 105,
  nodeProps: [
    [NodeProp.openedBy, 16, "(", 47, "{"],
    [NodeProp.closedBy, 17, ")", 48, "}"]
  ],
  skippedNodes: [0, 2],
  repeatNodeCount: 8,
  tokenData: "Bj~R![OX$wX^%]^p$wpq%]qr(crs+}st,otu2Uuv$wvw2rwx2}xy3jyz3uz{3z{|4_|}8u}!O9Q!O!P9i!P!Q9z!Q![<U![!]<y!]!^=i!^!_$w!_!`=t!`!a>P!a!b$w!b!c>o!c!}$w!}#O?{#O#P$w#P#Q@W#Q#R2U#R#T$w#T#U@c#U#c$w#c#dAb#d#o$w#o#pAq#p#q2U#q#rA|#r#sBX#s#y$w#y#z%]#z$f$w$f$g%]$g#BY$w#BY#BZ%]#BZ$IS$w$IS$I_%]$I_$I|$w$I|$JO%]$JO$JT$w$JT$JU%]$JU$KV$w$KV$KW%]$KW&FU$w&FU&FV%]&FV~$wW$zQOy%Qz~%QW%VQqWOy%Qz~%Q~%bf#S~OX%QX^&v^p%Qpq&vqy%Qz#y%Q#y#z&v#z$f%Q$f$g&v$g#BY%Q#BY#BZ&v#BZ$IS%Q$IS$I_&v$I_$I|%Q$I|$JO&v$JO$JT%Q$JT$JU&v$JU$KV%Q$KV$KW&v$KW&FU%Q&FU&FV&v&FV~%Q~&}f#S~qWOX%QX^&v^p%Qpq&vqy%Qz#y%Q#y#z&v#z$f%Q$f$g&v$g#BY%Q#BY#BZ&v#BZ$IS%Q$IS$I_&v$I_$I|%Q$I|$JO&v$JO$JT%Q$JT$JU&v$JU$KV%Q$KV$KW&v$KW&FU%Q&FU&FV&v&FV~%Q^(fSOy%Qz#]%Q#]#^(r#^~%Q^(wSqWOy%Qz#a%Q#a#b)T#b~%Q^)YSqWOy%Qz#d%Q#d#e)f#e~%Q^)kSqWOy%Qz#c%Q#c#d)w#d~%Q^)|SqWOy%Qz#f%Q#f#g*Y#g~%Q^*_SqWOy%Qz#h%Q#h#i*k#i~%Q^*pSqWOy%Qz#T%Q#T#U*|#U~%Q^+RSqWOy%Qz#b%Q#b#c+_#c~%Q^+dSqWOy%Qz#h%Q#h#i+p#i~%Q^+wQ!UUqWOy%Qz~%Q~,QUOY+}Zr+}rs,ds#O+}#O#P,i#P~+}~,iOj~~,lPO~+}_,tWsPOy%Qz!Q%Q!Q![-^![!c%Q!c!i-^!i#T%Q#T#Z-^#Z~%Q^-cWqWOy%Qz!Q%Q!Q![-{![!c%Q!c!i-{!i#T%Q#T#Z-{#Z~%Q^.QWqWOy%Qz!Q%Q!Q![.j![!c%Q!c!i.j!i#T%Q#T#Z.j#Z~%Q^.qWhUqWOy%Qz!Q%Q!Q![/Z![!c%Q!c!i/Z!i#T%Q#T#Z/Z#Z~%Q^/bWhUqWOy%Qz!Q%Q!Q![/z![!c%Q!c!i/z!i#T%Q#T#Z/z#Z~%Q^0PWqWOy%Qz!Q%Q!Q![0i![!c%Q!c!i0i!i#T%Q#T#Z0i#Z~%Q^0pWhUqWOy%Qz!Q%Q!Q![1Y![!c%Q!c!i1Y!i#T%Q#T#Z1Y#Z~%Q^1_WqWOy%Qz!Q%Q!Q![1w![!c%Q!c!i1w!i#T%Q#T#Z1w#Z~%Q^2OQhUqWOy%Qz~%QY2XSOy%Qz!_%Q!_!`2e!`~%QY2lQyQqWOy%Qz~%QX2wQWPOy%Qz~%Q~3QUOY2}Zw2}wx,dx#O2}#O#P3d#P~2}~3gPO~2}_3oQaVOy%Qz~%Q~3zO`~_4RSTPlSOy%Qz!_%Q!_!`2e!`~%Q_4fUlS!OPOy%Qz!O%Q!O!P4x!P!Q%Q!Q![7_![~%Q^4}SqWOy%Qz!Q%Q!Q![5Z![~%Q^5bWqW#ZUOy%Qz!Q%Q!Q![5Z![!g%Q!g!h5z!h#X%Q#X#Y5z#Y~%Q^6PWqWOy%Qz{%Q{|6i|}%Q}!O6i!O!Q%Q!Q![6z![~%Q^6nSqWOy%Qz!Q%Q!Q![6z![~%Q^7RSqW#ZUOy%Qz!Q%Q!Q![6z![~%Q^7fYqW#ZUOy%Qz!O%Q!O!P8U!P!Q%Q!Q![7_![!g%Q!g!h5z!h#X%Q#X#Y5z#Y~%Q^8]WqW#ZUOy%Qz!Q%Q!Q![8U![!g%Q!g!h5z!h#X%Q#X#Y5z#Y~%Q_8zQcVOy%Qz~%Q^9VUlSOy%Qz!O%Q!O!P4x!P!Q%Q!Q![7_![~%Q_9nS#VPOy%Qz!Q%Q!Q![5Z![~%Q~:PRlSOy%Qz{:Y{~%Q~:_SqWOy:Yyz:kz{;`{~:Y~:nROz:kz{:w{~:k~:zTOz:kz{:w{!P:k!P!Q;Z!Q~:k~;`OQ~~;eUqWOy:Yyz:kz{;`{!P:Y!P!Q;w!Q~:Y~<OQQ~qWOy%Qz~%Q^<ZY#ZUOy%Qz!O%Q!O!P8U!P!Q%Q!Q![7_![!g%Q!g!h5z!h#X%Q#X#Y5z#Y~%QX=OS[POy%Qz![%Q![!]=[!]~%QX=cQ]PqWOy%Qz~%Q_=nQ!VVOy%Qz~%QY=yQyQOy%Qz~%QX>US{POy%Qz!`%Q!`!a>b!a~%QX>iQ{PqWOy%Qz~%QX>rUOy%Qz!c%Q!c!}?U!}#T%Q#T#o?U#o~%QX?]Y!XPqWOy%Qz}%Q}!O?U!O!Q%Q!Q![?U![!c%Q!c!}?U!}#T%Q#T#o?U#o~%QX@QQwPOy%Qz~%Q^@]QuUOy%Qz~%QX@fSOy%Qz#b%Q#b#c@r#c~%QX@wSqWOy%Qz#W%Q#W#XAT#X~%QXA[Q!_PqWOy%Qz~%QXAeSOy%Qz#f%Q#f#gAT#g~%QXAvQ!QPOy%Qz~%Q_BRQ!PVOy%Qz~%QZB^S!OPOy%Qz!_%Q!_!`2e!`~%Q",
  tokenizers: [descendant, unitToken, identifiers, 0, 1, 2, 3],
  topRules: {StyleSheet: [0, 3]},
  specialized: [{term: 93, get: (value) => spec_callee[value] || -1}, {term: 55, get: (value) => spec_AtKeyword[value] || -1}, {term: 94, get: (value) => spec_identifier2[value] || -1}],
  tokenPrec: 1060
});

// ../../node_modules/@codemirror/lang-css/dist/index.js
var _properties = null;
function properties() {
  if (!_properties && typeof document == "object" && document.body) {
    let names = [];
    for (let prop in document.body.style) {
      if (!/[A-Z]|^-|^(item|length)$/.test(prop))
        names.push(prop);
    }
    _properties = names.sort().map((name2) => ({type: "property", label: name2}));
  }
  return _properties || [];
}
var pseudoClasses = [
  "active",
  "after",
  "before",
  "checked",
  "default",
  "disabled",
  "empty",
  "enabled",
  "first-child",
  "first-letter",
  "first-line",
  "first-of-type",
  "focus",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "lang",
  "last-child",
  "last-of-type",
  "link",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-of-type",
  "only-child",
  "optional",
  "out-of-range",
  "placeholder",
  "read-only",
  "read-write",
  "required",
  "root",
  "selection",
  "target",
  "valid",
  "visited"
].map((name2) => ({type: "class", label: name2}));
var values = [
  "above",
  "absolute",
  "activeborder",
  "additive",
  "activecaption",
  "after-white-space",
  "ahead",
  "alias",
  "all",
  "all-scroll",
  "alphabetic",
  "alternate",
  "always",
  "antialiased",
  "appworkspace",
  "asterisks",
  "attr",
  "auto",
  "auto-flow",
  "avoid",
  "avoid-column",
  "avoid-page",
  "avoid-region",
  "axis-pan",
  "background",
  "backwards",
  "baseline",
  "below",
  "bidi-override",
  "blink",
  "block",
  "block-axis",
  "bold",
  "bolder",
  "border",
  "border-box",
  "both",
  "bottom",
  "break",
  "break-all",
  "break-word",
  "bullets",
  "button",
  "button-bevel",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "calc",
  "capitalize",
  "caps-lock-indicator",
  "caption",
  "captiontext",
  "caret",
  "cell",
  "center",
  "checkbox",
  "circle",
  "cjk-decimal",
  "clear",
  "clip",
  "close-quote",
  "col-resize",
  "collapse",
  "color",
  "color-burn",
  "color-dodge",
  "column",
  "column-reverse",
  "compact",
  "condensed",
  "contain",
  "content",
  "contents",
  "content-box",
  "context-menu",
  "continuous",
  "copy",
  "counter",
  "counters",
  "cover",
  "crop",
  "cross",
  "crosshair",
  "currentcolor",
  "cursive",
  "cyclic",
  "darken",
  "dashed",
  "decimal",
  "decimal-leading-zero",
  "default",
  "default-button",
  "dense",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "disc",
  "discard",
  "disclosure-closed",
  "disclosure-open",
  "document",
  "dot-dash",
  "dot-dot-dash",
  "dotted",
  "double",
  "down",
  "e-resize",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "element",
  "ellipse",
  "ellipsis",
  "embed",
  "end",
  "ethiopic-abegede-gez",
  "ethiopic-halehame-aa-er",
  "ethiopic-halehame-gez",
  "ew-resize",
  "exclusion",
  "expanded",
  "extends",
  "extra-condensed",
  "extra-expanded",
  "fantasy",
  "fast",
  "fill",
  "fill-box",
  "fixed",
  "flat",
  "flex",
  "flex-end",
  "flex-start",
  "footnotes",
  "forwards",
  "from",
  "geometricPrecision",
  "graytext",
  "grid",
  "groove",
  "hand",
  "hard-light",
  "help",
  "hidden",
  "hide",
  "higher",
  "highlight",
  "highlighttext",
  "horizontal",
  "hsl",
  "hsla",
  "hue",
  "icon",
  "ignore",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infinite",
  "infobackground",
  "infotext",
  "inherit",
  "initial",
  "inline",
  "inline-axis",
  "inline-block",
  "inline-flex",
  "inline-grid",
  "inline-table",
  "inset",
  "inside",
  "intrinsic",
  "invert",
  "italic",
  "justify",
  "keep-all",
  "landscape",
  "large",
  "larger",
  "left",
  "level",
  "lighter",
  "lighten",
  "line-through",
  "linear",
  "linear-gradient",
  "lines",
  "list-item",
  "listbox",
  "listitem",
  "local",
  "logical",
  "loud",
  "lower",
  "lower-hexadecimal",
  "lower-latin",
  "lower-norwegian",
  "lowercase",
  "ltr",
  "luminosity",
  "manipulation",
  "match",
  "matrix",
  "matrix3d",
  "medium",
  "menu",
  "menutext",
  "message-box",
  "middle",
  "min-intrinsic",
  "mix",
  "monospace",
  "move",
  "multiple",
  "multiple_mask_images",
  "multiply",
  "n-resize",
  "narrower",
  "ne-resize",
  "nesw-resize",
  "no-close-quote",
  "no-drop",
  "no-open-quote",
  "no-repeat",
  "none",
  "normal",
  "not-allowed",
  "nowrap",
  "ns-resize",
  "numbers",
  "numeric",
  "nw-resize",
  "nwse-resize",
  "oblique",
  "opacity",
  "open-quote",
  "optimizeLegibility",
  "optimizeSpeed",
  "outset",
  "outside",
  "outside-shape",
  "overlay",
  "overline",
  "padding",
  "padding-box",
  "painted",
  "page",
  "paused",
  "perspective",
  "pinch-zoom",
  "plus-darker",
  "plus-lighter",
  "pointer",
  "polygon",
  "portrait",
  "pre",
  "pre-line",
  "pre-wrap",
  "preserve-3d",
  "progress",
  "push-button",
  "radial-gradient",
  "radio",
  "read-only",
  "read-write",
  "read-write-plaintext-only",
  "rectangle",
  "region",
  "relative",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeat-x",
  "repeat-y",
  "reset",
  "reverse",
  "rgb",
  "rgba",
  "ridge",
  "right",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "row",
  "row-resize",
  "row-reverse",
  "rtl",
  "run-in",
  "running",
  "s-resize",
  "sans-serif",
  "saturation",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "screen",
  "scroll",
  "scrollbar",
  "scroll-position",
  "se-resize",
  "self-start",
  "self-end",
  "semi-condensed",
  "semi-expanded",
  "separate",
  "serif",
  "show",
  "single",
  "skew",
  "skewX",
  "skewY",
  "skip-white-space",
  "slide",
  "slider-horizontal",
  "slider-vertical",
  "sliderthumb-horizontal",
  "sliderthumb-vertical",
  "slow",
  "small",
  "small-caps",
  "small-caption",
  "smaller",
  "soft-light",
  "solid",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "space",
  "space-around",
  "space-between",
  "space-evenly",
  "spell-out",
  "square",
  "start",
  "static",
  "status-bar",
  "stretch",
  "stroke",
  "stroke-box",
  "sub",
  "subpixel-antialiased",
  "svg_masks",
  "super",
  "sw-resize",
  "symbolic",
  "symbols",
  "system-ui",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row",
  "table-row-group",
  "text",
  "text-bottom",
  "text-top",
  "textarea",
  "textfield",
  "thick",
  "thin",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "to",
  "top",
  "transform",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "transparent",
  "ultra-condensed",
  "ultra-expanded",
  "underline",
  "unidirectional-pan",
  "unset",
  "up",
  "upper-latin",
  "uppercase",
  "url",
  "var",
  "vertical",
  "vertical-text",
  "view-box",
  "visible",
  "visibleFill",
  "visiblePainted",
  "visibleStroke",
  "visual",
  "w-resize",
  "wait",
  "wave",
  "wider",
  "window",
  "windowframe",
  "windowtext",
  "words",
  "wrap",
  "wrap-reverse",
  "x-large",
  "x-small",
  "xor",
  "xx-large",
  "xx-small"
].map((name2) => ({type: "keyword", label: name2})).concat([
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
].map((name2) => ({type: "constant", label: name2})));
var tags2 = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "meter",
  "nav",
  "ol",
  "output",
  "p",
  "pre",
  "ruby",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
].map((name2) => ({type: "type", label: name2}));
var span = /^[\w-]*/;
var completeCSS = (context) => {
  let {state, pos} = context, node = syntaxTree(state).resolve(pos, -1);
  if (node.name == "PropertyName")
    return {from: node.from, options: properties(), span};
  if (node.name == "ValueName")
    return {from: node.from, options: values, span};
  if (node.name == "PseudoClassName")
    return {from: node.from, options: pseudoClasses, span};
  if (node.name == "TagName") {
    for (let {parent} = node; parent; parent = parent.parent)
      if (parent.name == "Block")
        return {from: node.from, options: properties(), span};
    return {from: node.from, options: tags2, span};
  }
  if (!context.explicit)
    return null;
  let above = node.resolve(pos), before = above.childBefore(pos);
  if (before && before.name == ":" && above.name == "PseudoClassSelector")
    return {from: pos, options: pseudoClasses, span};
  if (before && before.name == ":" && above.name == "Declaration" || above.name == "ArgList")
    return {from: pos, options: values, span};
  if (above.name == "Block")
    return {from: pos, options: properties(), span};
  return null;
};
var cssLanguage = LezerLanguage.define({
  parser: parser4.configure({
    props: [
      indentNodeProp.add({
        Declaration: continuedIndent()
      }),
      foldNodeProp.add({
        Block: foldInside
      }),
      styleTags({
        "import charset namespace keyframes": tags.definitionKeyword,
        "media supports": tags.controlKeyword,
        "from to": tags.keyword,
        NamespaceName: tags.namespace,
        KeyframeName: tags.labelName,
        TagName: tags.typeName,
        ClassName: tags.className,
        PseudoClassName: tags.constant(tags.className),
        not: tags.operatorKeyword,
        IdName: tags.labelName,
        "FeatureName PropertyName AttributeName": tags.propertyName,
        NumberLiteral: tags.number,
        KeywordQuery: tags.keyword,
        UnaryQueryOp: tags.operatorKeyword,
        callee: tags.keyword,
        "CallTag ValueName": tags.atom,
        Callee: tags.variableName,
        Unit: tags.unit,
        "UniversalSelector NestingSelector": tags.definitionOperator,
        AtKeyword: tags.keyword,
        MatchOp: tags.compareOperator,
        "ChildOp SiblingOp, LogicOp": tags.logicOperator,
        BinOp: tags.arithmeticOperator,
        Important: tags.modifier,
        Comment: tags.blockComment,
        ParenthesizedContent: tags.special(tags.name),
        ColorLiteral: tags.color,
        StringLiteral: tags.string,
        ":": tags.punctuation,
        "PseudoOp #": tags.derefOperator,
        "; ,": tags.separator,
        "( )": tags.paren,
        "[ ]": tags.squareBracket,
        "{ }": tags.brace
      })
    ]
  }),
  languageData: {
    commentTokens: {block: {open: "/*", close: "*/"}},
    indentOnInput: /^\s*\}$/
  }
});
var cssCompletion = cssLanguage.data.of({autocomplete: completeCSS});

// ../../node_modules/@codemirror/lang-html/dist/index.js
var Targets = ["_blank", "_self", "_top", "_parent"];
var Charsets = ["ascii", "utf-8", "utf-16", "latin1", "latin1"];
var Methods = ["get", "post", "put", "delete"];
var Encs = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"];
var Bool = ["true", "false"];
var S = {};
var Tags = {
  a: {
    attrs: {
      href: null,
      ping: null,
      type: null,
      media: null,
      target: Targets,
      hreflang: null
    }
  },
  abbr: S,
  acronym: S,
  address: S,
  applet: S,
  area: {
    attrs: {
      alt: null,
      coords: null,
      href: null,
      target: null,
      ping: null,
      media: null,
      hreflang: null,
      type: null,
      shape: ["default", "rect", "circle", "poly"]
    }
  },
  article: S,
  aside: S,
  audio: {
    attrs: {
      src: null,
      mediagroup: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["none", "metadata", "auto"],
      autoplay: ["autoplay"],
      loop: ["loop"],
      controls: ["controls"]
    }
  },
  b: S,
  base: {attrs: {href: null, target: Targets}},
  basefont: S,
  bdi: S,
  bdo: S,
  big: S,
  blockquote: {attrs: {cite: null}},
  body: S,
  br: S,
  button: {
    attrs: {
      form: null,
      formaction: null,
      name: null,
      value: null,
      autofocus: ["autofocus"],
      disabled: ["autofocus"],
      formenctype: Encs,
      formmethod: Methods,
      formnovalidate: ["novalidate"],
      formtarget: Targets,
      type: ["submit", "reset", "button"]
    }
  },
  canvas: {attrs: {width: null, height: null}},
  caption: S,
  center: S,
  cite: S,
  code: S,
  col: {attrs: {span: null}},
  colgroup: {attrs: {span: null}},
  command: {
    attrs: {
      type: ["command", "checkbox", "radio"],
      label: null,
      icon: null,
      radiogroup: null,
      command: null,
      title: null,
      disabled: ["disabled"],
      checked: ["checked"]
    }
  },
  data: {attrs: {value: null}},
  datagrid: {attrs: {disabled: ["disabled"], multiple: ["multiple"]}},
  datalist: {attrs: {data: null}},
  dd: S,
  del: {attrs: {cite: null, datetime: null}},
  details: {attrs: {open: ["open"]}},
  dfn: S,
  dir: S,
  div: S,
  dl: S,
  dt: S,
  em: S,
  embed: {attrs: {src: null, type: null, width: null, height: null}},
  eventsource: {attrs: {src: null}},
  fieldset: {attrs: {disabled: ["disabled"], form: null, name: null}},
  figcaption: S,
  figure: S,
  font: S,
  footer: S,
  form: {
    attrs: {
      action: null,
      name: null,
      "accept-charset": Charsets,
      autocomplete: ["on", "off"],
      enctype: Encs,
      method: Methods,
      novalidate: ["novalidate"],
      target: Targets
    }
  },
  frame: S,
  frameset: S,
  h1: S,
  h2: S,
  h3: S,
  h4: S,
  h5: S,
  h6: S,
  head: {
    children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
  },
  header: S,
  hgroup: S,
  hr: S,
  html: {
    attrs: {manifest: null},
    children: ["head", "body"]
  },
  i: S,
  iframe: {
    attrs: {
      src: null,
      srcdoc: null,
      name: null,
      width: null,
      height: null,
      sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
      seamless: ["seamless"]
    }
  },
  img: {
    attrs: {
      alt: null,
      src: null,
      ismap: null,
      usemap: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"]
    }
  },
  input: {
    attrs: {
      alt: null,
      dirname: null,
      form: null,
      formaction: null,
      height: null,
      list: null,
      max: null,
      maxlength: null,
      min: null,
      name: null,
      pattern: null,
      placeholder: null,
      size: null,
      src: null,
      step: null,
      value: null,
      width: null,
      accept: ["audio/*", "video/*", "image/*"],
      autocomplete: ["on", "off"],
      autofocus: ["autofocus"],
      checked: ["checked"],
      disabled: ["disabled"],
      formenctype: Encs,
      formmethod: Methods,
      formnovalidate: ["novalidate"],
      formtarget: Targets,
      multiple: ["multiple"],
      readonly: ["readonly"],
      required: ["required"],
      type: [
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "datetime",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button"
      ]
    }
  },
  ins: {attrs: {cite: null, datetime: null}},
  kbd: S,
  keygen: {
    attrs: {
      challenge: null,
      form: null,
      name: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      keytype: ["RSA"]
    }
  },
  label: {attrs: {for: null, form: null}},
  legend: S,
  li: {attrs: {value: null}},
  link: {
    attrs: {
      href: null,
      type: null,
      hreflang: null,
      media: null,
      sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
    }
  },
  map: {attrs: {name: null}},
  mark: S,
  menu: {attrs: {label: null, type: ["list", "context", "toolbar"]}},
  meta: {
    attrs: {
      content: null,
      charset: Charsets,
      name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
      "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
    }
  },
  meter: {attrs: {value: null, min: null, low: null, high: null, max: null, optimum: null}},
  nav: S,
  noframes: S,
  noscript: S,
  object: {
    attrs: {
      data: null,
      type: null,
      name: null,
      usemap: null,
      form: null,
      width: null,
      height: null,
      typemustmatch: ["typemustmatch"]
    }
  },
  ol: {
    attrs: {reversed: ["reversed"], start: null, type: ["1", "a", "A", "i", "I"]},
    children: ["li", "script", "template", "ul", "ol"]
  },
  optgroup: {attrs: {disabled: ["disabled"], label: null}},
  option: {attrs: {disabled: ["disabled"], label: null, selected: ["selected"], value: null}},
  output: {attrs: {for: null, form: null, name: null}},
  p: S,
  param: {attrs: {name: null, value: null}},
  pre: S,
  progress: {attrs: {value: null, max: null}},
  q: {attrs: {cite: null}},
  rp: S,
  rt: S,
  ruby: S,
  s: S,
  samp: S,
  script: {
    attrs: {
      type: ["text/javascript"],
      src: null,
      async: ["async"],
      defer: ["defer"],
      charset: Charsets
    }
  },
  section: S,
  select: {
    attrs: {
      form: null,
      name: null,
      size: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      multiple: ["multiple"]
    }
  },
  small: S,
  source: {attrs: {src: null, type: null, media: null}},
  span: S,
  strike: S,
  strong: S,
  style: {
    attrs: {
      type: ["text/css"],
      media: null,
      scoped: null
    }
  },
  sub: S,
  summary: S,
  sup: S,
  table: S,
  tbody: S,
  td: {attrs: {colspan: null, rowspan: null, headers: null}},
  textarea: {
    attrs: {
      dirname: null,
      form: null,
      maxlength: null,
      name: null,
      placeholder: null,
      rows: null,
      cols: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      readonly: ["readonly"],
      required: ["required"],
      wrap: ["soft", "hard"]
    }
  },
  tfoot: S,
  th: {attrs: {colspan: null, rowspan: null, headers: null, scope: ["row", "col", "rowgroup", "colgroup"]}},
  thead: S,
  time: {attrs: {datetime: null}},
  title: S,
  tr: S,
  track: {
    attrs: {
      src: null,
      label: null,
      default: null,
      kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
      srclang: null
    }
  },
  tt: S,
  u: S,
  ul: {children: ["li", "script", "template", "ul", "ol"]},
  var: S,
  video: {
    attrs: {
      src: null,
      poster: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["auto", "metadata", "none"],
      autoplay: ["autoplay"],
      mediagroup: ["movie"],
      muted: ["muted"],
      controls: ["controls"]
    }
  },
  wbr: S
};
var GlobalAttrs = {
  accesskey: null,
  class: null,
  contenteditable: Bool,
  contextmenu: null,
  dir: ["ltr", "rtl", "auto"],
  draggable: ["true", "false", "auto"],
  dropzone: ["copy", "move", "link", "string:", "file:"],
  hidden: ["hidden"],
  id: null,
  inert: ["inert"],
  itemid: null,
  itemprop: null,
  itemref: null,
  itemscope: ["itemscope"],
  itemtype: null,
  lang: ["ar", "bn", "de", "en-GB", "en-US", "es", "fr", "hi", "id", "ja", "pa", "pt", "ru", "tr", "zh"],
  spellcheck: Bool,
  autocorrect: Bool,
  autocapitalize: Bool,
  style: null,
  tabindex: null,
  title: null,
  translate: ["yes", "no"],
  onclick: null,
  rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"],
  role: "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),
  "aria-activedescendant": null,
  "aria-atomic": Bool,
  "aria-autocomplete": ["inline", "list", "both", "none"],
  "aria-busy": Bool,
  "aria-checked": ["true", "false", "mixed", "undefined"],
  "aria-controls": null,
  "aria-describedby": null,
  "aria-disabled": Bool,
  "aria-dropeffect": null,
  "aria-expanded": ["true", "false", "undefined"],
  "aria-flowto": null,
  "aria-grabbed": ["true", "false", "undefined"],
  "aria-haspopup": Bool,
  "aria-hidden": Bool,
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-label": null,
  "aria-labelledby": null,
  "aria-level": null,
  "aria-live": ["off", "polite", "assertive"],
  "aria-multiline": Bool,
  "aria-multiselectable": Bool,
  "aria-owns": null,
  "aria-posinset": null,
  "aria-pressed": ["true", "false", "mixed", "undefined"],
  "aria-readonly": Bool,
  "aria-relevant": null,
  "aria-required": Bool,
  "aria-selected": ["true", "false", "undefined"],
  "aria-setsize": null,
  "aria-sort": ["ascending", "descending", "none", "other"],
  "aria-valuemax": null,
  "aria-valuemin": null,
  "aria-valuenow": null,
  "aria-valuetext": null
};
var AllTags = Object.keys(Tags);
var GlobalAttrNames = Object.keys(GlobalAttrs);
function elementName(doc2, tree) {
  let tag = tree.firstChild;
  if (!tag || tag.name != "OpenTag")
    return "";
  let name2 = tag.getChild("TagName");
  return name2 ? doc2.sliceString(name2.from, name2.to) : "";
}
function findParentElement(tree, skip2 = false) {
  for (let cur2 = tree.parent; cur2; cur2 = cur2.parent)
    if (cur2.name == "Element") {
      if (skip2)
        skip2 = false;
      else
        return cur2;
    }
  return null;
}
function allowedChildren(doc2, tree) {
  let parent = findParentElement(tree, true);
  let parentInfo = parent ? Tags[elementName(doc2, parent)] : null;
  return (parentInfo === null || parentInfo === void 0 ? void 0 : parentInfo.children) || AllTags;
}
function openTags(doc2, tree) {
  let open = [];
  for (let parent = tree; parent = findParentElement(parent); ) {
    let tagName2 = elementName(doc2, parent);
    if (tagName2 && parent.lastChild.name == "CloseTag")
      break;
    if (tagName2 && open.indexOf(tagName2) < 0)
      open.push(tagName2);
  }
  return open;
}
var identifier2 = /^[:\-\.\w\u00b7-\uffff]+$/;
function completeTag(state, tree, from, to) {
  let end = /\s*>/.test(state.sliceDoc(to, to + 5)) ? "" : ">";
  return {
    from,
    to,
    options: allowedChildren(state.doc, tree).map((tagName2) => ({label: tagName2, type: "type"})).concat(openTags(state.doc, tree).map((tag, i) => ({label: "/" + tag, apply: "/" + tag + end, type: "type", boost: 99 - i}))),
    span: /^\/?[:\-\.\w\u00b7-\uffff]*$/
  };
}
function completeCloseTag(state, tree, from, to) {
  let end = /\s*>/.test(state.sliceDoc(to, to + 5)) ? "" : ">";
  return {
    from,
    to,
    options: openTags(state.doc, tree).map((tag, i) => ({label: tag, apply: tag + end, type: "type", boost: 99 - i})),
    span: identifier2
  };
}
function completeStartTag(state, tree, pos) {
  let options = [], level = 0;
  for (let tagName2 of allowedChildren(state.doc, tree))
    options.push({label: "<" + tagName2, type: "type"});
  for (let open of openTags(state.doc, tree))
    options.push({label: "</" + open + ">", type: "type", boost: 99 - level++});
  return {from: pos, to: pos, options, span: /^<\/?[:\-\.\w\u00b7-\uffff]*$/};
}
function completeAttrName(state, tree, from, to) {
  let elt2 = findParentElement(tree), info = elt2 ? Tags[elementName(state.doc, elt2)] : null;
  let names = info && info.attrs ? Object.keys(info.attrs).concat(GlobalAttrNames) : GlobalAttrNames;
  return {
    from,
    to,
    options: names.map((attrName) => ({label: attrName, type: "property"})),
    span: identifier2
  };
}
function completeAttrValue(state, tree, from, to) {
  var _a;
  let nameNode = (_a = tree.parent) === null || _a === void 0 ? void 0 : _a.getChild("AttributeName");
  let options = [], span2 = void 0;
  if (nameNode) {
    let attrName = state.sliceDoc(nameNode.from, nameNode.to);
    let attrs = GlobalAttrs[attrName];
    if (!attrs) {
      let elt2 = findParentElement(tree), info = elt2 ? Tags[elementName(state.doc, elt2)] : null;
      attrs = (info === null || info === void 0 ? void 0 : info.attrs) && info.attrs[attrName];
    }
    if (attrs) {
      let base2 = state.sliceDoc(from, to).toLowerCase(), quoteStart = '"', quoteEnd = '"';
      if (/^['"]/.test(base2)) {
        span2 = base2[0] == '"' ? /^[^"]*$/ : /^[^']*$/;
        quoteStart = "";
        quoteEnd = state.sliceDoc(to, to + 1) == base2[0] ? "" : base2[0];
        base2 = base2.slice(1);
        from++;
      } else {
        span2 = /^[^\s<>='"]*$/;
      }
      for (let value of attrs)
        options.push({label: value, apply: quoteStart + value + quoteEnd, type: "constant"});
    }
  }
  return {from, to, options, span: span2};
}
function completeHTML(context) {
  let {state, pos} = context, around = syntaxTree(state).resolve(pos), tree = around.resolve(pos, -1);
  if (tree.name == "TagName") {
    return tree.parent && /CloseTag$/.test(tree.parent.name) ? completeCloseTag(state, tree, tree.from, pos) : completeTag(state, tree, tree.from, pos);
  } else if (tree.name == "StartTag") {
    return completeTag(state, tree, pos, pos);
  } else if (tree.name == "StartCloseTag" || tree.name == "IncompleteCloseTag") {
    return completeCloseTag(state, tree, pos, pos);
  } else if (context.explicit && (tree.name == "OpenTag" || tree.name == "SelfClosingTag") || tree.name == "AttributeName") {
    return completeAttrName(state, tree, tree.name == "AttributeName" ? tree.from : pos, pos);
  } else if (tree.name == "Is" || tree.name == "AttributeValue" || tree.name == "UnquotedAttributeValue") {
    return completeAttrValue(state, tree, tree.name == "Is" ? pos : tree.from, pos);
  } else if (context.explicit && (around.name == "Element" || around.name == "Text" || around.name == "Document")) {
    return completeStartTag(state, tree, pos);
  } else {
    return null;
  }
}
var htmlLanguage = LezerLanguage.define({
  parser: parser3.configure({
    props: [
      indentNodeProp.add({
        Element(context) {
          let after = /^(\s*)(<\/)?/.exec(context.textAfter);
          if (context.node.to <= context.pos + after[0].length)
            return context.continue();
          return context.lineIndent(context.state.doc.lineAt(context.node.from)) + (after[1] ? 0 : context.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        },
        Document(context) {
          if (context.pos + /\s*/.exec(context.textAfter)[0].length < context.node.to)
            return context.continue();
          let endElt = null, close;
          for (let cur2 = context.node; ; ) {
            let last = cur2.lastChild;
            if (!last || last.name != "Element" || last.to != cur2.to)
              break;
            endElt = cur2 = last;
          }
          if (endElt && !((close = endElt.lastChild) && (close.name == "CloseTag" || close.name == "SelfClosingTag")))
            return context.lineIndent(context.state.doc.lineAt(endElt.from)) + context.unit;
          return null;
        }
      }),
      foldNodeProp.add({
        Element(node) {
          let first = node.firstChild, last = node.lastChild;
          if (!first || first.name != "OpenTag")
            return null;
          return {from: first.to, to: last.name == "CloseTag" ? last.from : node.to};
        }
      }),
      styleTags({
        AttributeValue: tags.string,
        "Text RawText": tags.content,
        "StartTag StartCloseTag SelfCloserEndTag EndTag SelfCloseEndTag": tags.angleBracket,
        TagName: tags.tagName,
        "MismatchedCloseTag/TagName": [tags.tagName, tags.invalid],
        AttributeName: tags.propertyName,
        UnquotedAttributeValue: tags.string,
        Is: tags.definitionOperator,
        "EntityReference CharacterReference": tags.character,
        Comment: tags.blockComment,
        ProcessingInst: tags.processingInstruction,
        DoctypeDecl: tags.documentMeta
      })
    ],
    nested: configureNesting([
      {
        tag: "script",
        attrs(attrs) {
          return !attrs.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(attrs.type);
        },
        parser: javascriptLanguage.parser
      },
      {
        tag: "style",
        attrs(attrs) {
          return (!attrs.lang || attrs.lang == "css") && (!attrs.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(attrs.type));
        },
        parser: cssLanguage.parser
      }
    ])
  }),
  languageData: {
    commentTokens: {block: {open: "<!--", close: "-->"}},
    indentOnInput: /^\s*<\/$/
  }
});
var htmlCompletion = htmlLanguage.data.of({autocomplete: completeHTML});

// ../../node_modules/@codemirror/lang-markdown/dist/index.js
var data = defineLanguageFacet({block: {open: "<!--", close: "-->"}});
var commonmark = parser2.configure({
  props: [
    styleTags({
      "Blockquote/...": tags.quote,
      HorizontalRule: tags.contentSeparator,
      "ATXHeading1/... SetextHeading1/...": tags.heading1,
      "ATXHeading2/... SetextHeading2/...": tags.heading2,
      "ATXHeading3/...": tags.heading3,
      "ATXHeading4/...": tags.heading4,
      "ATXHeading5/...": tags.heading5,
      "ATXHeading6/...": tags.heading6,
      "Comment CommentBlock": tags.comment,
      Escape: tags.escape,
      Entity: tags.character,
      "Emphasis/...": tags.emphasis,
      "StrongEmphasis/...": tags.strong,
      "Link/... Image/...": tags.link,
      "OrderedList/... BulletList/...": tags.list,
      "BlockQuote/...": tags.quote,
      "InlineCode/...": tags.monospace,
      URL: tags.url,
      "HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark": tags.processingInstruction,
      "CodeInfo LinkLabel": tags.labelName,
      LinkTitle: tags.string,
      Paragraph: tags.content
    }),
    foldNodeProp.add((type) => {
      if (!type.is("Block") || type.is("Document"))
        return void 0;
      return (tree, state) => ({from: state.doc.lineAt(tree.from).to, to: tree.to});
    }),
    indentNodeProp.add({
      Document: () => null
    }),
    languageDataProp.add({
      Document: data
    })
  ],
  htmlParser: htmlLanguage.parser.configure({dialect: "noMatch"})
});
var commonmarkLanguage = mkLang(commonmark);
var extended = commonmark.configure([GFM, Subscript, Superscript, Emoji, {
  props: [
    styleTags({
      "TableDelimiter SubscriptMark SuperscriptMark StrikethroughMark": tags.processingInstruction,
      "TableHeader/...": tags.heading,
      "Strikethrough/...": tags.deleted,
      TaskMarker: tags.atom,
      Task: tags.list,
      Emoji: tags.character,
      "Subscript Superscript": tags.special(tags.content),
      TableCell: tags.content
    })
  ]
}]);
var markdownLanguage = mkLang(extended);
function mkLang(parser5) {
  return new Language(data, parser5, parser5.nodeSet.types.find((t2) => t2.name == "Document"));
}
function addCodeLanguages(languages, defaultLanguage) {
  return {
    codeParser(info) {
      let found = info && LanguageDescription.matchLanguageName(languages, info, true);
      if (!found)
        return defaultLanguage ? defaultLanguage.parser : null;
      if (found.support)
        return found.support.language.parser;
      return EditorParseContext.getSkippingParser(found.load());
    }
  };
}
function nodeStart2(node, doc2) {
  return doc2.sliceString(node.from, node.from + 50);
}
function gatherMarkup(node, line, doc2) {
  let nodes = [];
  for (let cur2 = node; cur2 && cur2.name != "Document"; cur2 = cur2.parent) {
    if (cur2.name == "ListItem" || cur2.name == "Blockquote")
      nodes.push(cur2);
  }
  let markup = [], pos = 0;
  for (let i = nodes.length - 1; i >= 0; i--) {
    let node2 = nodes[i], match;
    if (node2.name == "Blockquote" && (match = /^\s*> ?/.exec(line.slice(pos)))) {
      markup.push({from: pos, string: match[0], node: node2});
      pos += match[0].length;
    } else if (node2.name == "ListItem" && node2.parent.name == "OrderedList" && (match = /^\s*\d+([.)])\s*/.exec(nodeStart2(node2, doc2)))) {
      let len = match[1].length >= 4 ? match[0].length - match[1].length + 1 : match[0].length;
      markup.push({from: pos, string: line.slice(pos, pos + len).replace(/\S/g, " "), node: node2});
      pos += len;
    } else if (node2.name == "ListItem" && node2.parent.name == "BulletList" && (match = /^\s*[-+*] (\s*)/.exec(nodeStart2(node2, doc2)))) {
      let len = match[1].length >= 4 ? match[0].length - match[1].length : match[0].length;
      markup.push({from: pos, string: line.slice(pos, pos + len).replace(/\S/g, " "), node: node2});
      pos += len;
    }
  }
  return markup;
}
function renumberList(after, doc2, changes) {
  for (let prev = -1, node = after; ; ) {
    if (node.name == "ListItem") {
      let m = /^(\s*)(\d+)(?=[.)])/.exec(doc2.sliceString(node.from, node.from + 10));
      if (!m)
        return;
      let number2 = +m[2];
      if (prev >= 0) {
        if (number2 != prev + 1)
          return;
        changes.push({from: node.from + m[1].length, to: node.from + m[0].length, insert: String(prev + 2)});
      }
      prev = number2;
    }
    let next = node.nextSibling;
    if (!next)
      break;
    node = next;
  }
}
var insertNewlineContinueMarkup = ({state, dispatch}) => {
  let tree = syntaxTree(state);
  let dont = null, changes = state.changeByRange((range) => {
    if (range.empty && markdownLanguage.isActiveAt(state, range.from)) {
      let line = state.doc.lineAt(range.from);
      let markup = gatherMarkup(tree.resolve(range.from, -1), line.text, state.doc);
      let from = range.from, changes2 = [];
      if (markup.length) {
        let inner = markup[markup.length - 1], innerEnd = inner.from + inner.string.length;
        if (range.from - line.from >= innerEnd && !/\S/.test(line.text.slice(innerEnd, range.from - line.from))) {
          let start = /List/.test(inner.node.name) ? inner.from : innerEnd;
          while (start > 0 && /\s/.test(line.text[start - 1]))
            start--;
          from = line.from + start;
        }
        if (inner.node.name == "ListItem") {
          if (from < range.from && inner.node.parent.from == inner.node.from) {
            inner.string = "";
          } else {
            inner.string = line.text.slice(inner.from, inner.from + inner.string.length);
            if (inner.node.parent.name == "OrderedList" && from == range.from) {
              inner.string = inner.string.replace(/\d+/, (m) => +m + 1);
              renumberList(inner.node, state.doc, changes2);
            }
          }
        }
      }
      let insert2 = markup.map((m) => m.string).join("");
      if (range.from - line.from < insert2.length)
        insert2 = "";
      changes2.push({from, to: range.from, insert: Text.of(["", insert2])});
      return {range: EditorSelection.cursor(from + 1 + insert2.length), changes: changes2};
    }
    return dont = {range};
  });
  if (dont)
    return false;
  dispatch(state.update(changes, {scrollIntoView: true}));
  return true;
};
var deleteMarkupBackward = ({state, dispatch}) => {
  let tree = syntaxTree(state);
  let dont = null, changes = state.changeByRange((range) => {
    if (range.empty && markdownLanguage.isActiveAt(state, range.from)) {
      let line = state.doc.lineAt(range.from);
      let markup = gatherMarkup(tree.resolve(range.from, -1), line.text, state.doc);
      if (markup.length) {
        let inner = markup[markup.length - 1], innerEnd = inner.from + inner.string.length;
        if (range.from > innerEnd + line.from && !/\S/.test(line.text.slice(innerEnd, range.from - line.from)))
          return {
            range: EditorSelection.cursor(innerEnd + line.from),
            changes: {from: innerEnd + line.from, to: range.from}
          };
        if (range.from - line.from == innerEnd) {
          let start = line.from + inner.from;
          if (inner.node.name == "ListItem" && inner.node.parent.from < inner.node.from && /\S/.test(line.text.slice(inner.from, innerEnd)))
            return {range, changes: {from: start, to: start + inner.string.length, insert: inner.string}};
          return {range: EditorSelection.cursor(start), changes: {from: start, to: range.from}};
        }
      }
    }
    return dont = {range};
  });
  if (dont)
    return false;
  dispatch(state.update(changes, {scrollIntoView: true}));
  return true;
};
var markdownKeymap = [
  {key: "Enter", run: insertNewlineContinueMarkup},
  {key: "Backspace", run: deleteMarkupBackward}
];
function markdown(config2 = {}) {
  let {codeLanguages, defaultCodeLanguage, addKeymap = true, base: {parser: parser5} = commonmarkLanguage} = config2;
  let extensions = config2.extensions ? [config2.extensions] : [];
  if (!(parser5 instanceof MarkdownParser))
    throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");
  if (codeLanguages || defaultCodeLanguage)
    extensions.push(addCodeLanguages(codeLanguages || [], defaultCodeLanguage));
  return new LanguageSupport(mkLang(parser5.configure(extensions)), addKeymap ? Prec.extend(keymap.of(markdownKeymap)) : []);
}

// ../../node_modules/@codemirror/rectangular-selection/dist/index.js
var MaxOff = 2e3;
function rectangleFor(state, a, b) {
  let startLine = Math.min(a.line, b.line), endLine = Math.max(a.line, b.line);
  let ranges = [];
  if (a.off > MaxOff || b.off > MaxOff || a.col < 0 || b.col < 0) {
    let startOff = Math.min(a.off, b.off), endOff = Math.max(a.off, b.off);
    for (let i = startLine; i <= endLine; i++) {
      let line = state.doc.line(i);
      if (line.length <= endOff)
        ranges.push(EditorSelection.range(line.from + startOff, line.to + endOff));
    }
  } else {
    let startCol = Math.min(a.col, b.col), endCol = Math.max(a.col, b.col);
    for (let i = startLine; i <= endLine; i++) {
      let line = state.doc.line(i), str = line.length > MaxOff ? line.text.slice(0, 2 * endCol) : line.text;
      let start = findColumn(str, 0, startCol, state.tabSize), end = findColumn(str, 0, endCol, state.tabSize);
      if (!start.leftOver)
        ranges.push(EditorSelection.range(line.from + start.offset, line.from + end.offset));
    }
  }
  return ranges;
}
function absoluteColumn(view, x) {
  let ref = view.coordsAtPos(view.viewport.from);
  return ref ? Math.round(Math.abs((ref.left - x) / view.defaultCharacterWidth)) : -1;
}
function getPos(view, event) {
  let offset = view.posAtCoords({x: event.clientX, y: event.clientY});
  if (offset == null)
    return null;
  let line = view.state.doc.lineAt(offset), off = offset - line.from;
  let col = off > MaxOff ? -1 : off == line.length ? absoluteColumn(view, event.clientX) : countColumn(line.text.slice(0, offset - line.from), 0, view.state.tabSize);
  return {line: line.number, col, off};
}
function rectangleSelectionStyle(view, event) {
  let start = getPos(view, event), startSel = view.state.selection;
  if (!start)
    return null;
  return {
    update(update) {
      if (update.docChanged) {
        let newStart = update.changes.mapPos(update.startState.doc.line(start.line).from);
        let newLine = update.state.doc.lineAt(newStart);
        start = {line: newLine.number, col: start.col, off: Math.min(start.off, newLine.length)};
        startSel = startSel.map(update.changes);
      }
    },
    get(event2, _extend, multiple) {
      let cur2 = getPos(view, event2);
      if (!cur2)
        return startSel;
      let ranges = rectangleFor(view.state, start, cur2);
      if (!ranges.length)
        return startSel;
      if (multiple)
        return EditorSelection.create(ranges.concat(startSel.ranges));
      else
        return EditorSelection.create(ranges);
    }
  };
}
function rectangularSelection(options) {
  let filter = (options === null || options === void 0 ? void 0 : options.eventFilter) || ((e) => e.altKey && e.button == 0);
  return EditorView.mouseSelectionStyle.of((view, event) => filter(event) ? rectangleSelectionStyle(view, event) : null);
}

// ../horizon-theme/dist/index.js
var syntax = {
  lavender: "#B877DB",
  cranberry: "#E95678",
  turquoise: "#25B0BC",
  apricot: "#F09483",
  rosebud: "#FAB795",
  tacao: "#FAC29A",
  gray: "#BBBBBB"
};
var ui = {
  shadow: "#161e2b",
  border: "#1a2332",
  background: "#27272a",
  backgroundAlt: "#252f41",
  accent: "#323c4d",
  accentAlt: "#4d5664",
  secondaryAccent: "#E9436D",
  secondaryAccentAlt: "#E95378",
  tertiaryAccent: "#FAB38E",
  positive: "#09F7A0",
  negative: "#F43E5C",
  warning: "#27D797",
  modified: "#21BFC2",
  lightText: "#D5D8DA",
  darkText: "#06060C"
};
var alpha = {
  high: "E6",
  highMed: "B3",
  med: "80",
  medLow: "4D",
  low: "1A",
  none: "00"
};

// preconfigured/horizon-syntax-theme.ts
var HorizonSyntaxTheme = HighlightStyle.define([
  {tag: [tags.meta, tags.comment], color: `${syntax.gray}${alpha.medLow}`},
  {tag: tags.number, color: `${syntax.apricot}${alpha.high}`},
  {tag: tags.string, color: `${syntax.rosebud}${alpha.high}`},
  {tag: tags.regexp, color: `${syntax.apricot}${alpha.high}`},
  {tag: tags.constant(tags.name), color: `${syntax.apricot}${alpha.high}`},
  {tag: tags.keyword, color: `${syntax.lavender}${alpha.high}`, fontStyle: "italic"},
  {tag: tags.link, textDecoration: "underline"},
  {tag: tags.strong, fontWeight: "bold"},
  {tag: tags.emphasis, fontStyle: "italic"},
  {tag: tags.heading, color: `${syntax.lavender}${alpha.high}`, fontWeight: "bold"},
  {tag: tags.definition(tags.name), color: `${syntax.cranberry}${alpha.high}`},
  {tag: tags.className, color: `${syntax.cranberry}${alpha.high}`},
  {tag: tags.typeName, color: `${syntax.cranberry}${alpha.high}`},
  {tag: tags.propertyName, color: `${syntax.apricot}${alpha.high}`, fontStyle: "italic"},
  {tag: tags.function(tags.variableName), color: `${syntax.turquoise}${alpha.high}`},
  {tag: tags.labelName, color: `${syntax.rosebud}${alpha.high}`},
  {tag: tags.self, color: `${syntax.cranberry}${alpha.high}`},
  {tag: tags.namespace, color: `${syntax.cranberry}${alpha.high}`},
  {tag: tags.separator, color: `${syntax.gray}${alpha.medLow}`},
  {tag: tags.changed, color: syntax.tacao},
  {tag: tags.annotation, color: syntax.gray},
  {tag: tags.operator, color: `${syntax.apricot}${alpha.high}`},
  {tag: tags.operatorKeyword, color: `${syntax.apricot}${alpha.high}`},
  {tag: tags.special(tags.string), color: syntax.turquoise},
  {tag: tags.processingInstruction, color: syntax.rosebud},
  {tag: [tags.name, tags.character, tags.macroName], color: syntax.lavender},
  {tag: tags.deleted, color: ui.lightText, backgroundColor: ui.negative},
  {tag: tags.inserted, color: ui.darkText, backgroundColor: ui.positive},
  {tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: syntax.apricot},
  {tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: syntax.lavender},
  {tag: tags.invalid, color: syntax.cranberry}
]);

// preconfigured/horizon-ui-theme.ts
var HorizonTheme = EditorView.theme({
  "&": {
    color: ui.lightText,
    backgroundColor: ui.background
  },
  ".cm-content": {
    caretColor: ui.secondaryAccent,
    fontFamily: "inherit",
    fontWeight: "normal",
    fontSize: "16px",
    fontFeatureSettings: `"liga" 0, "calt" 0`,
    lineHeight: "24px",
    letterSpacing: "0px"
  },
  ".cm-scroller": {
    fontFamily: "inherit"
  },
  "&.cm-focused .cm-cursor": {borderLeftColor: ui.lightText},
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: ui.background
  },
  ".cm-panels": {backgroundColor: ui.shadow, color: syntax.gray},
  ".cm-panels.cm-panels-top": {borderBottom: "2px solid black"},
  ".cm-panels.cm-panels-bottom": {borderTop: "2px solid black"},
  ".cm-searchMatch": {
    backgroundColor: "#72a1ff59",
    outline: "1px solid #457dff"
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "#6199ff2f"
  },
  ".cm-activeLine": {backgroundColor: ui.backgroundAlt},
  ".cm-selectionMatch": {backgroundColor: ui.shadow},
  ".cm-matchingBracket, .cm-nonmatchingBracket": {
    backgroundColor: syntax.apricot,
    outline: `1px solid ${syntax.tacao}`
  },
  ".cm-gutters": {
    backgroundColor: ui.border,
    color: syntax.gray,
    border: "none"
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "#ddd"
  },
  ".cm-tooltip": {
    border: `1px solid ${ui.border}`,
    backgroundColor: ui.backgroundAlt
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: ui.shadow,
      color: ui.accent
    }
  }
}, {dark: true});

// preconfigured/index.ts
function newEditor(element, value, updateText) {
  let updateListener2 = EditorView.updateListener.of(({state, docChanged}) => {
    if (docChanged) {
      updateText(state.doc.toString());
    }
  });
  let view = new EditorView({
    parent: element,
    state: EditorState.create({
      doc: value,
      extensions: [
        updateListener2,
        foldGutter(),
        history(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...closeBracketsKeymap,
          ...completionKeymap
        ]),
        HorizonTheme,
        HorizonSyntaxTheme,
        markdown(),
        javascript()
      ]
    })
  });
  return view;
}
export {
  newEditor as default
};
