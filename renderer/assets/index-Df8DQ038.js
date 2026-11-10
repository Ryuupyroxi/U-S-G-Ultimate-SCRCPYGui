// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};
const camelizeRE = /-\w/g;
const camelize = cacheStringFunction(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction(
  (str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  }
);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, (match) => match.startsWith("/*") ? "" : match).split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function looseCompareArrays(a, b, seen) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i], seen);
  }
  return equal;
}
function looseCompareCollections(a, b, seen) {
  if (a.size !== b.size) return false;
  const candidates = Array.from(b);
  const matched = new Uint8Array(candidates.length);
  for (const item of a) {
    let index = -1;
    for (let i = 0; i < candidates.length; i++) {
      if (!matched[i] && looseEqual(item, candidates[i], seen)) {
        index = i;
        break;
      }
    }
    if (index < 0) return false;
    matched[index] = 1;
  }
  return true;
}
function looseCompareObjects(a, b, seen) {
  let aValidType = isMap(a);
  let bValidType = isMap(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
  }
  aValidType = isSet(a);
  bValidType = isSet(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
  }
  const aKeysCount = Object.keys(a).length;
  const bKeysCount = Object.keys(b).length;
  if (aKeysCount !== bKeysCount) {
    return false;
  }
  for (const key in a) {
    const aHasKey = a.hasOwnProperty(key);
    const bHasKey = b.hasOwnProperty(key);
    if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key], seen)) {
      return false;
    }
  }
  return String(a) === String(b);
}
function looseCompareNested(a, b, seen, compare) {
  if (!seen) {
    seen = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
  }
  const [seenA, seenB] = seen;
  if (seenA.has(a) || seenB.has(b)) {
    return seenA.get(a) === b && seenB.get(b) === a;
  }
  seenA.set(a, b);
  seenB.set(b, a);
  const equal = compare(a, b, seen);
  seenA.delete(a);
  seenB.delete(b);
  return equal;
}
function looseEqual(a, b, seen) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareNested(a, b, seen, looseCompareArrays) : false;
  }
  aValidType = isObject(a);
  bValidType = isObject(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    return looseCompareNested(a, b, seen, looseCompareObjects);
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const isRef$1 = (val) => {
  return !!(val && val["__v_isRef"] === true);
};
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (isRef$1(val)) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
  );
};
let activeEffectScope;
class EffectScope {
  // TODO isolatedDeclarations "__v_skip"
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this._on = 0;
    this.effects = [];
    this.cleanups = [];
    this._isPaused = false;
    this._warnOnRun = true;
    this.__v_skip = true;
    if (!detached && activeEffectScope) {
      if (activeEffectScope.active) {
        this.parent = activeEffectScope;
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      } else {
        this._active = false;
        this._warnOnRun = false;
      }
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].pause();
        }
      }
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l;
        if (this.scopes) {
          const scopes = this.scopes.slice();
          for (i = 0, l = scopes.length; i < l; i++) {
            scopes[i].resume();
          }
        }
        const effects = this.effects.slice();
        for (i = 0, l = effects.length; i < l; i++) {
          effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (activeEffectScope === this) {
        activeEffectScope = this.prevScope;
      } else {
        let current = activeEffectScope;
        while (current) {
          if (current.prevScope === this) {
            current.prevScope = this.prevScope;
            break;
          }
          current = current.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
let activeSub;
const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 1 | 4;
    this.next = void 0;
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope) {
      if (activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      } else {
        this.flags &= -2;
      }
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
}
let batchDepth = 0;
let batchedSub;
let batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed2) {
  if (computed2.flags & 4 && !(computed2.flags & 16)) {
    return;
  }
  computed2.flags &= -17;
  if (computed2.globalVersion === globalVersion) {
    return;
  }
  computed2.globalVersion = globalVersion;
  if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
    return;
  }
  computed2.flags |= 2;
  const dep = computed2.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed2;
  shouldTrack = true;
  try {
    prepareDeps(computed2);
    const value = computed2.fn(computed2._value);
    if (dep.version === 0 || hasChanged(value, computed2._value)) {
      computed2.flags |= 128;
      computed2._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed2);
    computed2.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps; l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}
let globalVersion = 0;
class Link {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed2) {
    this.computed = computed2;
    this.version = 0;
    this.activeLink = void 0;
    this.subs = void 0;
    this.map = void 0;
    this.key = void 0;
    this.sc = 0;
    this.__v_skip = true;
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (false) ;
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed2 = link.dep.computed;
    if (computed2 && !link.dep.subs) {
      computed2.flags |= 4 | 16;
      for (let l = computed2.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track();
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger();
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function reactiveReadArray(array) {
  const raw = /* @__PURE__ */ toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  if (/* @__PURE__ */ isShallow(array)) return raw;
  if (!/* @__PURE__ */ isReadonly(array)) return raw.map(toReactive);
  return /* @__PURE__ */ isReactive(array) ? raw.map((item) => toReadonly(toReactive(item))) : raw.map(toReadonly);
}
function shallowReadArray(arr) {
  track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(
      this,
      "filter",
      fn,
      thisArg,
      (v) => v.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const methodFn = arr[method];
  const iter = methodFn.call(arr);
  if (arr !== self2 && !/* @__PURE__ */ isShallow(self2)) {
    if (iter[Symbol.toStringTag] === "Array Iterator") {
      const wrapped = Object.create(Object.getPrototypeOf(iter));
      wrapped.next = () => wrapResult(iter.next(), wrapValue);
      if (methodFn !== arrayProto[method]) {
        Object.defineProperties(wrapped, {
          return: {
            get() {
              const fn = iter.return;
              return typeof fn === "function" ? fn.bind(iter) : fn;
            }
          },
          throw: {
            get() {
              const fn = iter.throw;
              return typeof fn === "function" ? fn.bind(iter) : fn;
            }
          }
        });
      }
      return wrapped;
    }
    iter._next = iter.next;
    iter.next = () => wrapResult(iter._next(), wrapValue);
  }
  return iter;
}
function wrapResult(result, wrapValue) {
  if (!result.done) {
    result.value = wrapValue(result.value);
  }
  return result;
}
const arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  let wrappedFn = fn;
  let wrapInitialAccumulator = false;
  if (arr !== self2) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self2, acc);
        }
        return fn.call(this, acc, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self2, result) : result;
}
function searchProxy(self2, method, args) {
  const arr = /* @__PURE__ */ toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
    args[0] = /* @__PURE__ */ toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = (/* @__PURE__ */ toRaw(self2))[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = /* @__PURE__ */ toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (/* @__PURE__ */ isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
    }
    if (isObject(res)) {
      return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
      if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
        oldValue = /* @__PURE__ */ toRaw(oldValue);
        value = /* @__PURE__ */ toRaw(value);
      }
      if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
        if (isOldValueReadonly) {
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (target === /* @__PURE__ */ toRaw(receiver) && result) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = /* @__PURE__ */ toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return extend(
      // inheriting all iterator properties
      Object.create(innerIterator),
      {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        }
      }
    );
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        const target = /* @__PURE__ */ toRaw(this);
        const proto = getProto(target);
        const rawValue = /* @__PURE__ */ toRaw(value);
        const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
        const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
        if (!hadKey) {
          target.add(valueToAdd);
          trigger(target, "add", valueToAdd, valueToAdd);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
          value = /* @__PURE__ */ toRaw(value);
        }
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
        return this;
      },
      delete(key) {
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0);
        }
        return result;
      },
      clear() {
        const target = /* @__PURE__ */ toRaw(this);
        const hadItems = target.size !== 0;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  if (target["__v_skip"] || !Object.isExtensible(target)) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = targetTypeMap(toRawType(target));
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
const toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
// @__NO_SIDE_EFFECTS__
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
// @__NO_SIDE_EFFECTS__
function ref(value) {
  return createRef(value, false);
}
function createRef(rawValue, shallow) {
  if (/* @__PURE__ */ isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, isShallow2) {
    this.dep = new Dep();
    this["__v_isRef"] = true;
    this["__v_isShallow"] = false;
    this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
    this._value = isShallow2 ? value : toReactive(value);
    this["__v_isShallow"] = isShallow2;
  }
  get value() {
    {
      this.dep.track();
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
    newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive(newValue);
      {
        this.dep.trigger();
      }
    }
  }
}
function unref(ref2) {
  return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class ComputedRefImpl {
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.dep = new Dep(this);
    this.__v_isRef = true;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 16;
    this.globalVersion = globalVersion - 1;
    this.next = void 0;
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track();
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    }
  }
}
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
const INITIAL_WATCHER_VALUE = {};
const cleanupMap = /* @__PURE__ */ new WeakMap();
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  }
}
function watch$1(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const reactiveGetter = (source2) => {
    if (deep) return source2;
    if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  };
  let effect2;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (/* @__PURE__ */ isRef(source)) {
    getter = () => source.value;
    forceTrigger = /* @__PURE__ */ isShallow(source);
  } else if (/* @__PURE__ */ isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
    getter = () => source.map((s) => {
      if (/* @__PURE__ */ isRef(s)) {
        return s.value;
      } else if (/* @__PURE__ */ isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction(s)) {
        return call ? call(s, 2) : s();
      } else ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = () => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect2;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }
  const scope = getCurrentScope();
  const watchHandle = () => {
    effect2.stop();
    if (scope && scope.active) {
      remove(scope.effects, effect2);
    }
  };
  if (once && cb) {
    const _cb = cb;
    cb = (...args) => {
      try {
        return _cb(...args);
      } finally {
        watchHandle();
      }
    };
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = (immediateFirstRun) => {
    if (!(effect2.flags & 1) || !effect2.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
        const currentWatcher = activeWatcher;
        pauseTracking();
        try {
          if (cleanup) {
            cleanup();
          }
          activeWatcher = effect2;
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
          resetTracking();
        }
      }
    } else {
      effect2.run();
    }
  };
  if (augmentJob) {
    augmentJob(job);
  }
  effect2 = new ReactiveEffect(getter);
  effect2.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = (fn) => onWatcherCleanup(fn, false, effect2);
  cleanup = effect2.onStop = () => {
    const cleanups = cleanupMap.get(effect2);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect2.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect2.run();
  }
  watchHandle.pause = effect2.pause.bind(effect2);
  watchHandle.resume = effect2.resume.bind(effect2);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) {
    return value;
  }
  seen.set(value, depth);
  depth--;
  if (/* @__PURE__ */ isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}
const stack = [];
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (/* @__PURE__ */ isRef(value)) {
    value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = /* @__PURE__ */ toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  if (throwInProd) {
    throw err;
  } else {
    console.error(err);
  }
}
const queue = [];
let flushIndex = -1;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    for (let i = 0; i < cb.length; i++) {
      pendingPostFlushCbs.push(cb[i]);
    }
  }
  queueFlush();
}
function flushPreFlushCbs(instance, minUid, seen, i = flushIndex + 1) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid || minUid !== void 0 && !(cb.id >= minUid)) {
        continue;
      }
      queue.splice(i, 1);
      i = instance ? i - 1 : flushIndex;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
function flushPostFlushCbs(seen, skip, minUid = 0) {
  if (pendingPostFlushCbs.length) {
    let cbs = pendingPostFlushCbs;
    let kept = 0;
    if (skip) {
      cbs = [];
      for (let i = 0; i < pendingPostFlushCbs.length; i++) {
        const cb = pendingPostFlushCbs[i];
        if (cb.i !== void 0 ? !cb.i || cb.i.uid < minUid : skip.has(cb)) {
          pendingPostFlushCbs[kept++] = cb;
        } else {
          cbs.push(cb);
        }
      }
    }
    const deduped = [...new Set(cbs)].sort((a, b) => getId(a) - getId(b));
    pendingPostFlushCbs.length = kept;
    if (activePostFlushCbs) {
      for (let i = 0; i < deduped.length; i++) {
        activePostFlushCbs.push(deduped[i]);
      }
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
let isFlushing = false;
function flushOnAppMount(fn, minUid) {
  if (isFlushing) {
    fn();
    return;
  }
  const queued = minUid === void 0 ? void 0 : new Set(pendingPostFlushCbs);
  fn();
  isFlushing = true;
  try {
    flushPreFlushCbs(void 0, minUid);
    flushPostFlushCbs(void 0, queued, minUid);
  } finally {
    isFlushing = false;
  }
}
const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (false) ;
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs();
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    const prevStackSize = blockStack.length;
    let res;
    try {
      res = fn(...args);
    } finally {
      for (let i = blockStack.length; i > prevStackSize; i--) closeBlock();
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    return vnode;
  }
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
function provide(key, value) {
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}
const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  const baseWatchOptions = extend({}, options);
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      job.i = instance;
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;
const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
function findNonCommentChild(children) {
  let child = children[0];
  if (children.length > 1) {
    for (const c of children) {
      if (c.type !== Comment) {
        child = c;
        break;
      }
    }
  }
  return child;
}
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) {
      return findNonCommentChild(vnode.children);
    }
    return vnode;
  }
  if (vnode.component) {
    return vnode.component.subTree;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction(children.default)) {
      return children.default();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    const subTree = vnode.component.subTree;
    setTransitionHooks(
      isTeleport(subTree.type) ? getInnerChild$1(subTree) || subTree : subTree,
      hooks
    );
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
    if (vnode.type === Fragment && isArray(vnode.children)) {
      const child = filterSingleRoot(vnode.children, false);
      if (child) {
        setTransitionHooks(child, hooks);
      }
    }
  }
}
function getTransitionRoot(vnode) {
  if (vnode.component) {
    return getTransitionRoot(vnode.component.subTree);
  }
  if (vnode.type === Fragment) {
    const child = isArray(vnode.children) && filterSingleRoot(vnode.children, false);
    return child ? getTransitionRoot(child) : void 0;
  }
  if (vnode.type !== Comment) {
    return vnode;
  }
}
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction(options) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = /* @__PURE__ */ toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    if (isTemplateRefKey(refs, key)) {
      return false;
    }
    return hasOwn(rawSetupState, key);
  };
  const canSetRef = (ref22, key) => {
    if (key && isTemplateRefKey(refs, key)) {
      return false;
    }
    return true;
  };
  if (oldRef != null && oldRef !== ref3) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (/* @__PURE__ */ isRef(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) {
        oldRef.value = null;
      }
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref3);
    const _isRef = /* @__PURE__ */ isRef(ref3);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref3) ? setupState[ref3] : refs[ref3] : canSetRef() || !rawRef.k ? ref3.value : refs[rawRef.k];
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (canSetSetupRef(ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                const newVal = [refValue];
                if (canSetRef(ref3, rawRef.k)) {
                  ref3.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (canSetSetupRef(ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          if (canSetRef(ref3, rawRef.k)) {
            ref3.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    }
  }
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}
getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook(
  "bu"
);
const onUpdated = createHook("u");
const onBeforeUnmount = createHook(
  "bum"
);
const onUnmounted = createHook("um");
const onServerPrefetch = createHook(
  "sp"
);
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache;
  const sourceIsArray = isArray(source);
  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
    let needsWrap = false;
    let isReadonlySource = false;
    if (sourceIsReactiveArray) {
      needsWrap = !/* @__PURE__ */ isShallow(source);
      isReadonlySource = /* @__PURE__ */ isReadonly(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(
        needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i],
        i,
        void 0,
        cached
      );
    }
  } else if (typeof source === "number") {
    if (!Number.isInteger(source) || source < 0) {
      ret = [];
    } else {
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached);
      }
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached)
      );
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject(data)) ;
    else {
      instance.data = /* @__PURE__ */ reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get,
        set
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (/* @__PURE__ */ isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      {
        watch(getter, handler);
      }
    }
  } else if (isFunction(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject(raw)) {
    if (isArray(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getComponentPublicInstance(vnode.component);
        }
      },
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = args.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2);
  key = key === "Once" ? key : key.replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
        render.call(
          thisProxy,
          proxyToUse,
          renderCache,
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false) ;
      result = normalizeVNode(
        render2.length > 1 ? render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return /* @__PURE__ */ shallowReadonly(attrs);
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    const child = isTeleport(root.type) ? getInnerChild$1(root) || root : root;
    setTransitionHooks(child, vnode.transition);
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
function filterSingleRoot(children, recurse = true) {
  let singleRoot;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isVNode(child)) {
      if (child.type !== Comment || child.children === "v-if") {
        if (singleRoot) {
          return;
        } else {
          singleRoot = child;
        }
      }
    } else {
      return;
    }
  }
  return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (!hasOwn(prevProps, key) || hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject(nextProp) && isObject(prevProp)) {
    return !looseEqual(nextProp, prevProp);
  }
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.suspense.vnode.el = root.el = el;
      vnode = root;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
  if (suspense && suspense.activeBranch === vnode) {
    suspense.vnode.el = el;
  }
}
const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = /* @__PURE__ */ toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = /* @__PURE__ */ toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction(propType) && propType.name === "Boolean";
        }
        prop[
          0
          /* shouldCast */
        ] = shouldCast;
        prop[
          1
          /* shouldCastTrue */
        ] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    if (n2.dynamicChildren && n1 && n1.dynamicChildren && n1.dynamicChildren.hasOnce) {
      if (n2.dynamicChildren === EMPTY_ARR) {
        n2.dynamicChildren = [];
      }
      n2.dynamicChildren.hasOnce = true;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref3 == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        try {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        } finally {
        }
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (
      // #6385 the old vnode may be a user-wrapped non-isomorphic block
      // Force full diff when block metadata is unstable.
      dynamicChildren && (!n1.dynamicChildren || n1.dynamicChildren.length !== dynamicChildren.length)
    ) {
      patchFlag = 0;
      optimized = false;
      dynamicChildren = null;
    }
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const oldEl = oldVNode.el || resolveAsyncComponentPlaceholder(oldVNode);
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldEl && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldEl) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(
        instance,
        setupRenderEffect,
        optimized,
        namespace
      );
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        n2.el = n1.el;
        n2.placeholder = n1.placeholder;
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      n2.placeholder = n1.placeholder;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        {
          if (root.ce && root.ce._hasShadowRoot()) {
            root.ce._injectChildStyle(
              type,
              instance.parent ? instance.parent.type : void 0
            );
          }
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) update();
              }, parentSuspense);
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    };
    instance.scope.on();
    const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect2.run.bind(effect2);
    const job = instance.job = effect2.runIfDirty.bind(effect2);
    job.i = instance;
    job.id = instance.uid;
    effect2.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        if (transition.persisted && !el[leaveCbKey]) {
          hostInsert(el, container, anchor);
        } else {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        }
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        };
        const performLeave = () => {
          const wasLeaving = el._isLeaving || !!el[leaveCbKey];
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          if (transition.persisted && !wasLeaving) {
            remove22();
          } else {
            leave(el, () => {
              remove22();
              afterLeave && afterLeave();
            });
          }
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex,
      memo
    } = vnode;
    if (patchFlag === -2 || dynamicChildren && dynamicChildren.hasOnce) {
      optimized = false;
    }
    if (ref3 != null) {
      pauseTracking();
      setRef(ref3, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null && (!vnode.ctx || vnode.ctx === parentComponent)) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    const shouldInvalidateMemo = memo != null && cacheIndex == null;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        if (shouldInvalidateMemo) {
          vnode.el = null;
        }
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    const isFragment = type === Fragment;
    if (isFragment && !transition) {
      removeFragment(el, anchor);
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
      return;
    }
    const leavingNode = isFragment ? getTransitionRoot(vnode) : vnode;
    const performRemove = () => {
      if (isFragment) {
        if (hostParentNode(el)) {
          removeFragment(el, anchor);
        }
      } else {
        hostRemove(el);
      }
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (leavingNode && leavingNode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const leavingEl = leavingNode.el;
      const performLeave = () => leave(leavingEl, performRemove);
      if (delayLeave) {
        delayLeave(leavingEl, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, job, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    } else if (instance.vnode.el && subTree) {
      subTree.transition = instance.vnode.transition;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  const render = (vnode, container, namespace) => {
    const minUid = vnode && container._vnode ? void 0 : vnode && vnode.component ? vnode.component.uid : getNextUid();
    flushOnAppMount(() => {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode, null, null, true);
        }
      } else {
        patch(
          container._vnode || null,
          vnode,
          container,
          null,
          null,
          null,
          namespace
        );
      }
      container._vnode = vnode;
    }, minUid);
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  return {
    render,
    hydrate,
    createApp: createAppAPI(render)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, job }, allowed) {
  if (allowed) {
    effect2.flags |= 32;
    job.flags |= 4;
  } else {
    effect2.flags &= -33;
    job.flags &= -5;
  }
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        if (c2.patchFlag === -1) {
          c2 = ch2[i] = cloneIfMounted(c2);
        }
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) {
    return anchorVnode.placeholder;
  }
  const instance = anchorVnode.component;
  if (instance) {
    return resolveAsyncComponentPlaceholder(instance.subTree);
  }
  return null;
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
const Text = /* @__PURE__ */ Symbol.for("v-txt");
const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
const Static = /* @__PURE__ */ Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref3,
  ref_key,
  ref_for
}) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString(ref3) || /* @__PURE__ */ isRef(ref3) || isFunction(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style)) {
      if (/* @__PURE__ */ isProxy(style) && !isArray(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref3, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref3 ? isArray(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce,
    cacheIndex: vnode.cacheIndex
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
  const vnode = createVNode(Static, null, content);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    if (shapeFlag & (1 | 64)) {
      normalizeChildren(vnode, { default: children });
      return;
    }
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        } else if (incoming == null && existing == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !isModelListener(key)) {
          ret[key] = incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function getNextUid() {
  return uid;
}
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          setInSSRSetupState(true);
          try {
            handleSetupResult(instance, resolvedResult, isSSR);
          } finally {
            setInSSRSetupState(false);
          }
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult);
    }
  } else {
    finishComponentSetup(instance);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance);
}
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])\w/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
      instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
};
const version = "3.5.44";
let policy = void 0;
const tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
  }
}
const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const vtcKey = /* @__PURE__ */ Symbol("_vtc");
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
const vShowHidden = /* @__PURE__ */ Symbol("_vsh");
const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
const displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      const value = next[key];
      if (value != null) {
        if (!shouldPreserveTextareaResizeStyle(
          el,
          key,
          !isString(prev) && prev ? prev[key] : void 0,
          value
        )) {
          setStyle(style, key, value);
        }
      } else {
        setStyle(style, key, "");
      }
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    if (!isCssString || prev !== next) {
      el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    }
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      if (importantRE.test(val)) {
        style.setProperty(name, val.replace(importantRE, ""), "important");
      } else {
        style.setProperty(name, val);
      }
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
  return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean ? "" : isSymbol(value) ? String(value) : value
      );
    }
  }
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(Once|Passive|Capture)$/;
const optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  let m;
  while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
    if (!options) options = {};
    name = name.slice(0, name.length - m[1].length);
    options[m[1].toLowerCase()] = true;
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    const value = invoker.value;
    if (isArray(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      const handlers = value.slice();
      const args = [e];
      for (let i = 0; i < handlers.length; i++) {
        if (e._stopped) {
          break;
        }
        const handler = handlers[i];
        if (handler) {
          callWithAsyncErrorHandling(
            handler,
            instance,
            5,
            args
          );
        }
      }
    } else {
      callWithAsyncErrorHandling(
        value,
        instance,
        5,
        [e]
      );
    }
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && // #12408 check if it's declared prop or it's async custom element
    (shouldSetAsPropForVueCE(el, key) || // @ts-expect-error _def is private
    el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
  const props = (
    // @ts-expect-error _def is private
    el._def.props
  );
  if (!props) {
    return false;
  }
  const camelKey = camelize(key);
  return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = /* @__PURE__ */ Symbol("_assign");
const initialValueKey = /* @__PURE__ */ Symbol("_initialValue");
function castValue(value, trim, number) {
  if (trim) value = value.trim();
  if (number) value = looseToNumber(value);
  return value;
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    if (el.parentNode) {
      if (el.type === "text") {
        el[initialValueKey] = el.defaultValue.replace(/[\r\n]/g, "");
      } else if (el.type === "textarea") {
        el[initialValueKey] = el.defaultValue.replace(/\r\n?/g, "\n");
      }
    }
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing) return;
      el[assignKey](castValue(el.value, trim, castToNumber));
    });
    if (trim || castToNumber) {
      addEventListener(el, "change", () => {
        el.value = castValue(el.value, trim, castToNumber);
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value, modifiers: { trim, number } }) {
    const newValue = value == null ? "" : value;
    const initialValue = el[initialValueKey];
    delete el[initialValueKey];
    if (initialValue !== void 0 && (el.type === "text" || el.type === "textarea") && el.value !== initialValue) {
      el[assignKey](castValue(el.value, trim, number));
    } else {
      el.value = newValue;
    }
  },
  beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing) return;
    const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
    const newValue = value == null ? "" : value;
    if (elValue === newValue) {
      return;
    }
    const rootNode = el.getRootNode();
    if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
      if (lazy && value === oldValue) {
        return;
      }
      if (trim && el.value.trim() === newValue) {
        return;
      }
    }
    el.value = newValue;
  }
};
const vModelCheckbox = {
  // #4096 array checkboxes need to be deep traversed
  deep: true,
  created(el, _, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign = el[assignKey];
      if (isArray(modelValue)) {
        const index = looseIndexOf(modelValue, elementValue);
        const found = index !== -1;
        if (checked && !found) {
          assign(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index, 1);
          assign(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign(cloned);
      } else {
        assign(getCheckboxValue(el, checked));
      }
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  let checked;
  if (isArray(value)) {
    checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    checked = value.has(vnode.props.value);
  } else {
    if (value === oldValue) return;
    checked = looseEqual(value, getCheckboxValue(el, true));
  }
  if (el.checked !== checked) {
    el.checked = checked;
  }
}
const vModelRadio = {
  created(el, { value }, vnode) {
    el.checked = looseEqual(value, vnode.props.value);
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      el[assignKey](getValue(el));
    });
  },
  beforeUpdate(el, { value, oldValue }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (value !== oldValue) {
      el.checked = looseEqual(value, vnode.props.value);
    }
  }
};
const vModelSelect = {
  // <select multiple> value need to be deep traversed
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    el._modelValue = value;
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map(
        (o) => number ? looseToNumber(getValue(o)) : getValue(o)
      );
      const multiple = el.multiple;
      const assignedValue = multiple ? isSet(el._modelValue) ? new Set(selectedVal) : selectedVal : selectedVal[0];
      const pending = el._pendingValue = [
        multiple,
        multiple ? isArray(assignedValue) ? selectedVal.slice() : selectedVal : assignedValue
      ];
      try {
        el[assignKey](assignedValue);
      } finally {
        nextTick(() => {
          if (el._pendingValue === pending) {
            el._pendingValue = void 0;
          }
        });
      }
    });
    el[assignKey] = getModelAssigner(vnode);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, { value }, vnode) {
    el._modelValue = value;
    el[assignKey] = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    const pending = el._pendingValue;
    el._pendingValue = void 0;
    if (!pending || pending[0] !== el.multiple || !isSameSelectValue(value, pending[1], pending[0])) {
      setSelected(el, value);
    }
  }
};
function isSameSelectValue(value, assignedValue, multiple) {
  if (!multiple) return looseEqual(value, assignedValue);
  if (isArray(value)) return looseEqual(value, assignedValue);
  if (isSet(value)) {
    if (value.size !== assignedValue.length) return false;
    for (const item of assignedValue) {
      if (!value.has(item)) return false;
    }
    return true;
  }
  return false;
}
function setSelected(el, value) {
  const isMultiple = el.multiple;
  const isArrayValue = isArray(value);
  if (isMultiple && !isArrayValue && !isSet(value)) {
    return;
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i];
    const optionValue = getValue(option);
    if (isMultiple) {
      if (isArrayValue) {
        const optionType = typeof optionValue;
        if (optionType === "string" || optionType === "number") {
          option.selected = value.some((v) => String(v) === String(optionValue));
        } else {
          option.selected = looseIndexOf(value, optionValue) > -1;
        }
      } else {
        option.selected = value.has(optionValue);
      }
    } else if (looseEqual(getValue(option), value)) {
      if (el.selectedIndex !== i) el.selectedIndex = i;
      return;
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
});
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
const SCENE_MANAGED_FLAGS = [
  ["--video-source", "scene"],
  ["--new-display", "scene"],
  ["--no-video", "scene"],
  ["--otg", "scene"],
  ["--video-encoder", "videoEncoder"],
  ["--audio-codec", "audioCodec"],
  ["--audio-encoder", "audioEncoder"],
  ["--audio-source", "audioSource"],
  ["--time-limit", "timeLimit"],
  ["--record-format", "recordFormat"],
  ["--record-orientation", "recordOrientation"],
  ["--camera-id", "cameraId"],
  ["--camera-facing", "cameraFacing"],
  ["--camera-size", "cameraSize"],
  ["--camera-fps", "cameraFps"],
  ["--camera-high-speed", "cameraHighSpeed"],
  ["--camera-torch", "cameraTorch"],
  ["--camera-zoom", "cameraZoom"],
  ["--v4l2-sink", "v4l2Sink"],
  ["--v4l2-buffer", "v4l2Buffer"],
  ["--no-video-playback", "v4l2Playback"],
  ["--no-vd-system-decorations", "virtualDisplayDecorations"],
  ["--no-vd-destroy-content", "virtualDisplayDestroy"],
  ["--flex-display", "flexDisplay"],
  ["-x", "flexDisplay"],
  ["--start-app", "startApp"],
  ["--keep-active", "keepActive"],
  ["--display-ime-policy", "displayImePolicy"]
];
const validPort = (value) => /^\d{1,5}$/.test(value) && Number(value) >= 1 && Number(value) <= 65535;
function validatePortRange(value) {
  const ports = value.trim().split(":");
  if (ports.length < 1 || ports.length > 2 || ports.some((port) => !validPort(port))) return false;
  return ports.length === 1 || Number(ports[0]) <= Number(ports[1]);
}
function validPair(name, width, height) {
  return width > 0 === height > 0 ? void 0 : `${name} width and height must either both be zero or both be greater than zero.`;
}
const ok = () => void 0;
const screen = ["screen"];
const visual = ["screen", "camera", "virtual-display", "record-only"];
const visualPlayback = ["screen", "camera", "virtual-display"];
const windowed = ["screen", "camera", "virtual-display"];
const input = ["screen", "virtual-display", "control-only", "otg"];
const adbScenes = ["screen", "camera", "virtual-display", "record-only", "control-only"];
const screenVirtualRecord = ["screen", "virtual-display", "record-only"];
const screenVirtual = ["screen", "virtual-display"];
const OPTION_DESCRIPTORS = [
  { key: "windowTitle", flag: "--window-title", category: "general", valueType: "string", defaultValue: "", helpKey: "windowTitle", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.windowTitle.trim() ? [`--window-title=${c.windowTitle.trim()}`] : [], validate: ok },
  { key: "shortcutModifier", flag: "--shortcut-mod", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "shortcutModifier", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.shortcutModifier === "default" ? [] : [`--shortcut-mod=${c.shortcutModifier}`], validate: ok },
  { key: "keyboardMode", flag: "--keyboard", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "keyboardMode", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.keyboardMode === "default" ? [] : [`--keyboard=${c.keyboardMode}`], validate: ok },
  { key: "mouseMode", flag: "--mouse", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "mouseMode", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.mouseMode === "default" ? [] : [`--mouse=${c.mouseMode}`], validate: ok },
  { key: "gamepadMode", flag: "--gamepad", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "gamepadMode", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.gamepadMode === "default" ? [] : [`--gamepad=${c.gamepadMode}`], validate: ok },
  { key: "videoCodec", flag: "--video-codec", category: "video", valueType: "enum", defaultValue: "default", helpKey: "codec", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.videoCodec === "default" ? [] : [`--video-codec=${c.videoCodec}`], validate: ok },
  { key: "videoBitRate", flag: "--video-bit-rate", aliases: ["-b"], category: "video", valueType: "number", defaultValue: 8, helpKey: "bitRate", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.videoBitRate <= 0 || c.videoBitRate === 8 ? [] : [`--video-bit-rate=${c.videoBitRate}M`], validate: ok },
  { key: "videoBuffer", flag: "--video-buffer", category: "video", valueType: "number", defaultValue: 0, helpKey: "videoBuffer", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.videoBuffer > 0 ? [`--video-buffer=${Math.trunc(c.videoBuffer)}`] : [], validate: ok },
  { key: "audioBuffer", flag: "--audio-buffer", category: "video", valueType: "number", defaultValue: 0, helpKey: "audioBuffer", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordAudio || c.audioBuffer <= 0 ? [] : [`--audio-buffer=${Math.trunc(c.audioBuffer)}`], validate: ok },
  { key: "maxSize", flag: "--max-size", aliases: ["-m"], category: "video", valueType: "number", defaultValue: 0, helpKey: "maxSize", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.maxSize <= 0 ? [] : [`--max-size=${Math.trunc(c.maxSize)}`], validate: ok },
  { key: "maxFps", flag: "--max-fps", category: "video", valueType: "number", defaultValue: 0, helpKey: "maxFps", minScrcpyVersion: "4.0", scenes: screenVirtualRecord, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.maxFps <= 0 ? [] : [`--max-fps=${Math.trunc(c.maxFps)}`], validate: ok },
  { key: "displayId", flag: "--display-id", category: "video", valueType: "number", defaultValue: 0, helpKey: "displayId", minScrcpyVersion: "4.0", scenes: screen, conflictsWith: ["newDisplay", "camera"], serialize: (c) => c.displayId > 0 ? [`--display-id=${Math.trunc(c.displayId)}`] : [], validate: ok },
  { key: "orientation", flag: "--orientation", category: "video", valueType: "enum", defaultValue: "0", helpKey: "orientation", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.orientation === "0" ? [] : [`--orientation=${c.orientation}`], validate: ok },
  { key: "recording", flag: "--record", aliases: ["-r"], category: "recording", valueType: "path", defaultValue: false, helpKey: "recordEnabled", minScrcpyVersion: "4.0", scenes: visual, requires: ["recordPath"], serialize: (c) => c.recordEnabled ? [`--record=${c.recordPath.trim()}`, ...c.noPlayback && c.scene !== "record-only" ? ["--no-playback", "--no-window"] : []] : [], validate: (c) => c.recordEnabled && !c.recordPath.trim() ? "Choose a recording file before starting scrcpy." : void 0 },
  { key: "alwaysOnTop", flag: "--always-on-top", category: "general", valueType: "boolean", defaultValue: false, helpKey: "alwaysOnTop", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.alwaysOnTop ? ["--always-on-top"] : [], validate: ok },
  { key: "control", flag: "--no-control", aliases: ["-n"], category: "controls", valueType: "boolean", defaultValue: true, helpKey: "control", minScrcpyVersion: "4.0", scenes: screenVirtual, serialize: (c) => c.control ? [] : ["--no-control"], validate: ok },
  { key: "audio", flag: "--no-audio", category: "video", valueType: "boolean", defaultValue: true, helpKey: "audio", minScrcpyVersion: "4.0", scenes: visualPlayback, serialize: (c) => c.audio ? [] : ["--no-audio"], validate: ok },
  { key: "turnScreenOff", flag: "--turn-screen-off", aliases: ["-S"], category: "controls", valueType: "boolean", defaultValue: false, helpKey: "turnScreenOff", minScrcpyVersion: "4.0", scenes: screen, serialize: (c) => c.turnScreenOff ? ["--turn-screen-off"] : [], validate: ok },
  { key: "stayAwake", flag: "--stay-awake", aliases: ["-w"], category: "controls", valueType: "boolean", defaultValue: false, helpKey: "stayAwake", minScrcpyVersion: "4.0", scenes: screen, serialize: (c) => c.stayAwake ? ["--stay-awake"] : [], validate: ok },
  { key: "showTouches", flag: "--show-touches", aliases: ["-t"], category: "controls", valueType: "boolean", defaultValue: false, helpKey: "showTouches", minScrcpyVersion: "4.0", scenes: screen, serialize: (c) => c.showTouches ? ["--show-touches"] : [], validate: ok },
  { key: "fullscreen", flag: "--fullscreen", aliases: ["-f"], category: "general", valueType: "boolean", defaultValue: false, helpKey: "fullscreen", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.fullscreen ? ["--fullscreen"] : [], validate: ok },
  { key: "borderless", flag: "--window-borderless", category: "general", valueType: "boolean", defaultValue: false, helpKey: "borderless", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.borderless ? ["--window-borderless"] : [], validate: ok },
  { key: "windowAspectRatioLock", flag: "--no-window-aspect-ratio-lock", category: "geometry", valueType: "boolean", defaultValue: true, helpKey: "aspectRatioLock", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.windowAspectRatioLock ? [] : ["--no-window-aspect-ratio-lock"], validate: ok },
  { key: "pushTarget", flag: "--push-target", category: "advanced", valueType: "path", defaultValue: "", helpKey: "pushTarget", minScrcpyVersion: "4.0", scenes: screenVirtual, serialize: (c) => c.pushTarget.trim() ? [`--push-target=${c.pushTarget.trim()}`] : [], validate: (c) => c.pushTarget.includes("\0") ? "Push target may not contain null bytes." : void 0 },
  { key: "tunnelPort", flag: "--port", category: "advanced", valueType: "string", defaultValue: "", helpKey: "tunnelPort", minScrcpyVersion: "4.0", scenes: adbScenes, serialize: (c) => c.tunnelPort.trim() ? [`--port=${c.tunnelPort.trim()}`] : [], validate: (c) => c.tunnelPort.trim() && !validatePortRange(c.tunnelPort) ? "Tunnel port must be a port or ascending port range from 1 to 65535." : void 0 },
  { key: "crop", flag: "--crop", category: "geometry", valueType: "composite", defaultValue: { x: 0, y: 0, width: 0, height: 0 }, helpKey: "crop", minScrcpyVersion: "4.0", scenes: screen, conflictsWith: ["camera"], serialize: (c) => c.crop.width > 0 ? [`--crop=${Math.trunc(c.crop.width)}:${Math.trunc(c.crop.height)}:${Math.trunc(c.crop.x)}:${Math.trunc(c.crop.y)}`] : [], validate: (c) => validPair("Crop", c.crop.width, c.crop.height) },
  { key: "windowPosition", flag: "--window-x", category: "geometry", valueType: "composite", defaultValue: { x: 0, y: 0 }, helpKey: "initialWindow", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => [...c.window.x !== 0 ? [`--window-x=${Math.trunc(c.window.x)}`] : [], ...c.window.y !== 0 ? [`--window-y=${Math.trunc(c.window.y)}`] : []], validate: ok },
  { key: "windowSize", flag: "--window-width", category: "geometry", valueType: "composite", defaultValue: { width: 0, height: 0 }, helpKey: "initialWindow", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.window.width > 0 ? [`--window-width=${Math.trunc(c.window.width)}`, `--window-height=${Math.trunc(c.window.height)}`] : [], validate: (c) => validPair("Window", c.window.width, c.window.height) }
];
function optionDefault(key) {
  const descriptor = OPTION_DESCRIPTORS.find((item) => item.key === key);
  if (!descriptor) throw new Error(`Unknown option descriptor: ${key}.`);
  return structuredClone(descriptor.defaultValue);
}
const managedFlags = /* @__PURE__ */ new Map();
for (const descriptor of OPTION_DESCRIPTORS) {
  managedFlags.set(descriptor.flag, descriptor.key);
  for (const alias of descriptor.aliases || []) managedFlags.set(alias, descriptor.key);
}
for (const [flag, key] of SCENE_MANAGED_FLAGS) managedFlags.set(flag, key);
managedFlags.set("--serial", "serial");
managedFlags.set("-s", "serial");
managedFlags.set("--no-playback", "recording");
managedFlags.set("--no-window", "recording");
managedFlags.set("--window-y", "windowPosition");
managedFlags.set("--window-height", "windowSize");
function defaultLaunchConfig() {
  return {
    scene: "screen",
    windowTitle: optionDefault("windowTitle"),
    videoBitRate: optionDefault("videoBitRate"),
    videoBuffer: optionDefault("videoBuffer"),
    audioBuffer: optionDefault("audioBuffer"),
    maxSize: optionDefault("maxSize"),
    maxFps: optionDefault("maxFps"),
    displayId: optionDefault("displayId"),
    orientation: optionDefault("orientation"),
    videoCodec: optionDefault("videoCodec"),
    videoEncoder: "",
    audioCodec: "default",
    audioEncoder: "",
    audioSource: "default",
    shortcutModifier: optionDefault("shortcutModifier"),
    keyboardMode: optionDefault("keyboardMode"),
    mouseMode: optionDefault("mouseMode"),
    gamepadMode: optionDefault("gamepadMode"),
    alwaysOnTop: optionDefault("alwaysOnTop"),
    control: optionDefault("control"),
    audio: optionDefault("audio"),
    turnScreenOff: optionDefault("turnScreenOff"),
    stayAwake: optionDefault("stayAwake"),
    showTouches: optionDefault("showTouches"),
    fullscreen: optionDefault("fullscreen"),
    borderless: optionDefault("borderless"),
    windowAspectRatioLock: optionDefault("windowAspectRatioLock"),
    pushTarget: optionDefault("pushTarget"),
    tunnelPort: optionDefault("tunnelPort"),
    recordEnabled: optionDefault("recording"),
    recordPath: "",
    autoRecordName: false,
    recordDirectory: "",
    noPlayback: false,
    recordFormat: "default",
    recordOrientation: "default",
    timeLimit: 0,
    recordVideo: true,
    recordAudio: true,
    cameraId: "",
    cameraFacing: "default",
    cameraSize: { width: 0, height: 0 },
    cameraFps: 0,
    cameraHighSpeed: false,
    cameraTorch: false,
    cameraZoom: 1,
    virtualDisplay: {
      width: 0,
      height: 0,
      dpi: 0,
      systemDecorations: true,
      destroyContent: true,
      flexDisplay: false,
      startApp: "",
      keepActive: false,
      imePolicy: "default"
    },
    v4l2Sink: "",
    v4l2Buffer: 0,
    v4l2Playback: true,
    crop: optionDefault("crop"),
    window: { ...optionDefault("windowPosition"), ...optionDefault("windowSize") },
    extraArgs: ""
  };
}
function selectLaunchScene(config, scene) {
  const previousScene = config.scene;
  config.scene = scene;
  if (scene === "record-only") {
    config.recordEnabled = true;
    config.noPlayback = true;
    if (!config.recordVideo && !config.recordAudio) config.recordVideo = true;
  } else if (previousScene === "record-only") {
    config.recordEnabled = false;
    config.noPlayback = false;
  }
  if (scene === "control-only" && config.mouseMode === "sdk") config.mouseMode = "default";
  if (scene === "otg") {
    if (config.keyboardMode === "sdk" || config.keyboardMode === "uhid") config.keyboardMode = "default";
    if (config.mouseMode === "sdk" || config.mouseMode === "uhid") config.mouseMode = "default";
    if (config.gamepadMode === "uhid") config.gamepadMode = "default";
  }
}
function normalizedLaunch(stored) {
  const defaults = defaultLaunchConfig();
  return {
    ...defaults,
    ...stored,
    crop: { ...defaults.crop, ...stored?.crop },
    window: { ...defaults.window, ...stored?.window },
    cameraSize: { ...defaults.cameraSize, ...stored?.cameraSize },
    virtualDisplay: { ...defaults.virtualDisplay, ...stored?.virtualDisplay }
  };
}
function defaultPersistedConfig(locale) {
  return {
    runtime: { scrcpyPath: "" },
    locale,
    theme: "light",
    accentScheme: "default",
    accentReversed: false,
    swipePanel: false,
    navBar: false,
    qrPairing: false,
    scripts: {},
    muteNotifications: false,
    update: { checkOnStartup: false, autoUpdateOnStartup: false, skipConfirmation: false },
    toolkit: { sshEnabled: false, sshHost: "", sshLocalPort: 5555, sshRemotePort: 5555, perInstanceTerminal: false, recentCommands: [], commandUsage: {} },
    minimizeToTray: false,
    killAdbOnQuit: false,
    bossKeyEnabled: false,
    bossKeyAccelerator: "CommandOrControl+Shift+B",
    autoSelectFirstDevice: true,
    autoLaunchDevices: {},
    launch: defaultLaunchConfig(),
    profiles: [],
    deviceProfiles: {},
    deviceAliases: {},
    wirelessTargets: [],
    automations: [],
    groups: []
  };
}
function legacyConfigView(value, locale) {
  const defaults = defaultPersistedConfig(locale);
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  const stored = value;
  const profiles = Array.isArray(stored.profiles) ? stored.profiles.map((profile) => {
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return profile;
    return { ...profile, launch: normalizedLaunch(profile.launch) };
  }) : [];
  return {
    ...defaults,
    ...stored,
    runtime: { ...defaults.runtime, ...stored.runtime },
    launch: normalizedLaunch(stored.launch),
    profiles,
    deviceProfiles: stored.deviceProfiles || {},
    deviceAliases: stored.deviceAliases || {},
    autoLaunchDevices: stored.autoLaunchDevices || {},
    wirelessTargets: Array.isArray(stored.wirelessTargets) ? stored.wirelessTargets : [],
    automations: Array.isArray(stored.automations) ? stored.automations : [],
    groups: Array.isArray(stored.groups) ? stored.groups : []
  };
}
function previousRecordingDirectory(launch = {}) {
  return launch.recordDirectory?.trim() || launch.recordPath?.trim().replace(/[^/\\]*$/, "") || "";
}
function backgroundRecordingLaunch(launch) {
  const previousFormat = launch.recordPath.trim().match(/\.([a-z0-9]+)$/i)?.[1].toLowerCase();
  const recordFormat = launch.recordFormat === "default" && previousFormat && ["mp4", "mkv", "m4a", "mka", "opus", "aac", "flac", "wav"].includes(previousFormat) ? previousFormat : launch.recordFormat;
  return { ...launch, recordEnabled: true, autoRecordName: true, recordDirectory: previousRecordingDirectory(launch), recordFormat };
}
const SCRCPY_SCRIPTS = [
  { id: "gaming", label: "Gaming", args: "--no-mipmaps --no-mouse-hover --raw-key-events --disable-screensaver" },
  { id: "battery-saver", label: "Battery saver", args: "--disable-screensaver --no-clipboard-autosync --no-terminal-title --no-cleanup" },
  { id: "presentation", label: "Presentation", args: "--print-fps --disable-screensaver --no-cleanup" },
  { id: "compatibility", label: "Compatibility", args: "--no-mipmaps --legacy-paste --prefer-text --no-mouse-hover --no-key-repeat" },
  { id: "safe-exit", label: "Safe exit", args: "--pause-on-exit --power-off-on-close" },
  { id: "no-cleanup", label: "No cleanup", args: "--no-cleanup --no-clipboard-autosync" },
  { id: "low-latency", label: "Low latency", args: "--no-mipmaps --no-mouse-hover --raw-key-events --no-downsize-on-error --min-size-alignment=1" },
  { id: "screen-off-timeout", label: "Long screen-off timeout", args: "--screen-off-timeout=1800" },
  { id: "fill-display", label: "Fill display", args: "--render-fit=fill" },
  { id: "black-background", label: "Black background", args: "--background-color=#000000" },
  { id: "rotate-90", label: "Rotate 90 degrees", args: "--angle=90" },
  { id: "force-adb-forward", label: "Force ADB forward", args: "--force-adb-forward" },
  { id: "kill-adb-on-close", label: "Kill ADB on close", args: "--kill-adb-on-close" },
  { id: "no-terminal-title", label: "No terminal title", args: "--no-terminal-title" },
  { id: "print-fps", label: "Print FPS", args: "--print-fps" },
  { id: "require-audio", label: "Require audio", args: "--require-audio" },
  { id: "audio-dup", label: "Duplicate audio", args: "--audio-dup" },
  { id: "no-key-repeat", label: "No key repeat", args: "--no-key-repeat" },
  { id: "no-mouse-hover", label: "No mouse hover", args: "--no-mouse-hover" },
  { id: "raw-key-events", label: "Raw key events", args: "--raw-key-events" },
  { id: "prefer-text", label: "Prefer text", args: "--prefer-text" },
  { id: "legacy-paste", label: "Legacy paste", args: "--legacy-paste" },
  { id: "no-downsize-on-error", label: "No downsize on error", args: "--no-downsize-on-error" },
  { id: "no-clipboard-autosync", label: "No clipboard sync", args: "--no-clipboard-autosync" },
  { id: "disable-screensaver", label: "Disable screensaver", args: "--disable-screensaver" },
  { id: "no-mipmaps", label: "No mipmaps", args: "--no-mipmaps" },
  { id: "no-power-on", label: "No power on", args: "--no-power-on" }
];
function enabledScriptArgs(config) {
  const enabled = config.scripts || {};
  return SCRCPY_SCRIPTS.filter((script) => enabled[script.id]).map((script) => script.args).join(" ");
}
function launchForDevice(config, serial) {
  const profileId = serial ? config.deviceProfiles[serial] : "";
  const profile = profileId ? config.profiles.find((item) => item.id === profileId) : void 0;
  const folderRecording = config.launch.scene === "record-only";
  let launch = structuredClone(folderRecording ? config.launch : profile?.launch || config.launch);
  if (folderRecording) launch = backgroundRecordingLaunch(launch);
  const alias = serial ? config.deviceAliases[serial]?.trim() : "";
  if (alias && !launch.windowTitle.trim()) launch.windowTitle = alias;
  const scriptArgs = enabledScriptArgs(config);
  if (scriptArgs) launch.extraArgs = [launch.extraArgs.trim(), scriptArgs].filter(Boolean).join("\n");
  return launch;
}
function operationErrorMessage(result, fallback) {
  return result.error?.message || fallback;
}
const en = {
  devices: "Devices",
  device: "Device",
  settings: "Settings",
  settingsSection_general: "General",
  settingsSection_video: "Video",
  settingsSection_controls: "Controls",
  settingsSection_recording: "Recording",
  settingsSection_geometry: "Window",
  settingsSection_advanced: "Advanced",
  logs: "Logs",
  artifacts: "Artifacts",
  artifactLibrary: "Artifact library",
  artifactsHint: "Screenshots, recordings, transfer reports, and diagnostics indexed by the main process.",
  filterArtifactKind: "Filter artifacts by kind",
  filterArtifactDevice: "Filter artifacts by device",
  allArtifactKinds: "All kinds",
  allDevices: "All devices",
  "artifactKind_screenshot": "Screenshot",
  "artifactKind_recording": "Recording",
  "artifactKind_transfer-report": "Transfer report",
  "artifactKind_diagnostic": "Diagnostic",
  artifactStatus_available: "Available",
  artifactStatus_missing: "Missing",
  artifactStatus_incomplete: "Incomplete",
  loadingArtifacts: "Loading artifacts…",
  noArtifacts: "No artifacts match these filters.",
  open: "Open",
  reveal: "Show in folder",
  copyPath: "Copy path",
  removeIndex: "Remove from library",
  deleteFile: "Delete file",
  artifactListFailed: "Could not load the artifact library.",
  artifactOpenFailed: "Could not open the artifact.",
  artifactRevealFailed: "Could not show the artifact in its folder.",
  artifactCopyFailed: "Could not copy the artifact path.",
  artifactDeleteFailed: "Could not delete the artifact.",
  artifactPathCopied: "Artifact path copied.",
  artifactFileDeleted: "Artifact file deleted.",
  artifactIndexDeleted: "Artifact removed from the library; the file was kept.",
  notApplicable: "Not device-specific",
  prepareDiagnostics: "Prepare diagnostics",
  diagnosticPreview: "Diagnostic preview",
  diagnosticPrivacyHint: "Review this manifest before export. Paths, device identifiers, addresses, and pairing-code patterns are redacted by default.",
  includedFiles: "Included files",
  redactionsApplied: "Redactions applied",
  noSensitiveValuesFound: "No matching sensitive values were present.",
  recentEventsIncluded: "recent events included.",
  exportDiagnosticBundle: "Export ZIP",
  openIssueHelper: "Open issue helper",
  reportIssue: "Report issue",
  diagnosticPreviewFailed: "Could not prepare diagnostics.",
  diagnosticExportFailed: "Could not export diagnostics.",
  diagnosticExported: "Diagnostic bundle exported locally.",
  issueHelperFailed: "Could not open the issue helper.",
  sessions: "Sessions",
  sessionCenter: "Session center",
  sessionsHint: "Every launch has its own identity and verified lifecycle; a spawned process is not reported as running until it survives the startup window.",
  noSessions: "No scrcpy sessions have been launched in this app run.",
  stopAllSessions: "Stop all active",
  sessionsStopFailed: "sessions could not be stopped.",
  sessionState_queued: "Queued",
  sessionState_preflighting: "Preflight",
  sessionState_launching: "Launching",
  sessionState_running: "Running",
  sessionState_stopping: "Stopping",
  sessionState_stopped: "Stopped",
  sessionState_failed: "Failed",
  runtimeSetup: "Runtime setup",
  runtimeHint: "Bundled scrcpy and adb are ready to use.",
  runtimeCapabilities: "Detected",
  capabilitiesUnavailable: "No optional capabilities detected.",
  capabilityProbeFailed: "scrcpy is usable, but its optional capabilities could not be detected.",
  capability_screen: "Screen",
  capability_camera: "Camera",
  capability_virtualDisplay: "Virtual display",
  capability_recordOnly: "Record only",
  capability_controlOnly: "Control only",
  capability_otg: "OTG",
  capability_v4l2: "V4L2",
  capability_appLaunch: "App launch",
  sceneBuilder: "Launch scene",
  chooseScene: "Choose a launch scene",
  sceneReviewHint: "Select → inspect → configure → preview",
  scene_screen: "Screen",
  scene_camera: "Camera",
  "scene_virtual-display": "Virtual display",
  "scene_record-only": "Record only",
  "scene_control-only": "Control only",
  scene_otg: "OTG",
  sceneHint_screen: "Mirror and control a physical Android display.",
  sceneHint_camera: "Preview or record an Android 12+ camera source.",
  "sceneHint_virtual-display": "Create an independent Android display and launch one app.",
  "sceneHint_record-only": "Capture in the background without a playback window.",
  "sceneHint_control-only": "Send keyboard, mouse, and gamepad input without video or audio.",
  sceneHint_otg: "Use USB HID control without ADB or USB debugging.",
  sceneShort_screen: "Physical display",
  sceneShort_camera: "Android 12+",
  "sceneShort_virtual-display": "App workspace",
  "sceneShort_record-only": "No window",
  "sceneShort_control-only": "ADB input",
  sceneShort_otg: "USB, no ADB",
  unsupportedByRuntime: "Unavailable in this runtime",
  deviceCapabilities: "Device capabilities",
  deviceCapabilitiesHint: "Inspect the device before choosing encoders, displays, cameras, sizes, or high-speed modes.",
  probing: "Inspecting…",
  refreshCapabilities: "Inspect again",
  inspectDevice: "Inspect device",
  cachedResult: "Cached",
  liveResult: "Fresh probe",
  screenSource: "Physical display source",
  screenSourceHint: "Detected display IDs are safer than guessing secondary-display numbers.",
  unknownSize: "size unknown",
  cameraSource: "Camera source",
  cameraSourceHint: "Declared sizes and frame rates come from Android and may still fail on misreporting devices.",
  camera: "Camera",
  cameraId: "Camera ID",
  cameraFacing: "Camera facing",
  cameraSize: "Camera size",
  cameraFps: "Camera FPS",
  cameraZoom: "Camera zoom",
  cameraHighSpeed: "Constrained high-speed capture",
  cameraFacing_front: "Front",
  cameraFacing_back: "Back",
  cameraFacing_external: "External",
  cameraFacing_unknown: "Unknown",
  cameraMicrophoneDefault: "Camera microphone (default)",
  audioSource: "Audio source",
  audioSource_mic: "Microphone",
  audioSource_camcorder: "Camcorder microphone",
  audioSource_output: "Device output",
  audioSource_playback: "App playback",
  v4l2Sink: "V4L2 loopback device",
  v4l2Buffer: "V4L2 buffer (ms)",
  v4l2Playback: "Keep preview window",
  virtualDisplay: "Virtual display lifecycle",
  virtualDisplayHint: "The app target and close behavior are fixed before launch.",
  presetPresentation: "Presentation",
  presetDesktop: "Desktop / Flex",
  presetIsolated: "App-isolated",
  startAppPackage: "App package to launch",
  width: "Width",
  height: "Height",
  systemDecorations: "System decorations",
  destroyContent: "Destroy content on close",
  flexDisplay: "Resize with window",
  keepActive: "Keep display active",
  displayImePolicy: "IME display policy",
  defaultDisplay: "Default display",
  localDisplay: "Local virtual display",
  recordOnlySetup: "Background recording",
  recordOnlyHint: "Choose a folder and at least one stream. Each start creates a new file in the selected format. Stop recording ends all background recordings.",
  startRecording: "Start recording",
  stopRecording: "Stop recording",
  activeRecordings: "Active recordings",
  recordingInProgress: "Recording",
  recordingDuration: "Recording duration",
  recordFormat: "Container format",
  timeLimit: "Time limit (seconds, 0 = unlimited)",
  recordVideo: "Record video",
  recordAudio: "Record audio",
  controlOnlyInput: "ADB control-only input",
  controlOnlyInputHint: "UHID works wirelessly; SDK mouse needs a playback window and is not offered here.",
  otgInput: "OTG USB input",
  otgInputHint: "OTG accepts AOA or disabled input modes and opens the USB device directly.",
  optionalUsbSerial: "USB serial (optional)",
  singleUsbAutomatic: "Automatic when exactly one USB device is connected",
  otgNoAdbHint: "USB debugging is not required. Enter a serial only when more than one USB device is attached.",
  disabled: "Disabled",
  launchOtg: "Start OTG",
  otgProfileLaunchHint: "Apply the OTG Profile in the launch scene and use Start OTG; OTG is not an ADB device assignment.",
  mediaEncoding: "Media encoding",
  mediaEncodingHint: "Leave encoders automatic unless the device default fails or a tested codec is required.",
  videoEncoder: "Video encoder",
  audioCodec: "Audio codec",
  audioEncoder: "Audio encoder",
  selectedTargets: "Selected targets",
  automaticUsbTarget: "USB target: automatic unless a serial is entered",
  sceneCamera: "Camera scene",
  sceneVirtualDisplay: "Virtual display scene",
  sceneRecordOnly: "Record-only scene",
  sceneControlOnly: "Control-only scene",
  sceneOtg: "OTG scene",
  virtualDisplayDecorations: "Virtual display decorations",
  virtualDisplayDestroy: "Virtual display close behavior",
  chooseScrcpy: "Choose scrcpy",
  recheck: "Recheck",
  ready: "Ready",
  notFound: "Not found",
  refresh: "Refresh",
  connectedDevices: "Connected devices",
  noDevices: "No devices detected. Connect USB debugging or use wireless pairing below.",
  tracker_starting: "Starting tracker",
  tracker_tracking: "Tracking devices",
  tracker_restarting: "Restarting tracker",
  tracker_error: "Tracker unavailable",
  tracker_stopped: "Tracker stopped",
  trackerLive: "live ADB stream",
  trackerPolling: "safe polling fallback",
  trackerFailed: "Could not start device tracking.",
  previewCommand: "Preview command",
  commandPreview: "Command preview",
  commandPreviewHint: "Exact argv generated for each selected device, shown as a JSON array and never executed through a shell.",
  commandPreviewFailed: "Could not build the command preview.",
  close: "Close",
  source_session: "Session managed",
  "source_scene-default": "Scene default",
  source_global: "Global settings",
  source_profile: "Profile",
  sourceProfile: "Profile",
  "source_device-override": "Device override",
  source_generated: "Generated",
  source_expert: "Expert arg",
  launchSelected: "Launch selected",
  stop: "Stop",
  disconnect: "Disconnect",
  unauthorized: "Authorize debugging on the device, then refresh.",
  wireless: "Wireless debugging",
  wirelessHint: "Android 11+: pair with the address, port and six-digit code shown on the device, then connect using its connection port.",
  address: "Host or host:port",
  pairAddress: "Pairing host:port",
  pairingCode: "6-digit pairing code",
  connect: "Connect",
  pair: "Pair",
  legacyWirelessEyebrow: "Android 10 and below",
  legacyWirelessLabel: "Enable wireless ADB over the USB connection.",
  legacyWirelessReadyHint: "Ready — Android {version} over USB.",
  enableLegacyWireless: "Enable wireless ADB",
  legacyWirelessEnabled: "Wireless ADB enabled",
  legacyWirelessSelectHint: "Select an Android 10 or below device over USB to enable wireless ADB.",
  legacyWirelessUsbHint: "The selected device is not connected over USB.",
  legacyWirelessTooNewHint: "Android {version} detected \u2014 use Pair above instead.",
  general: "General",
  windowTitle: "Window title",
  shortcutModifier: "Shortcut modifier",
  shortcutHint: "System default avoids hijacking normal Ctrl+X/C/V shortcuts.",
  keyboardMode: "Keyboard mode",
  mouseMode: "Mouse mode",
  gamepadMode: "Gamepad mode",
  video: "Video",
  bitRate: "Bit rate (Mbps)",
  videoBuffer: "Video buffer (ms)",
  audioBuffer: "Audio buffer (ms)",
  maxSize: "Max size (0 = automatic)",
  maxFps: "Max FPS (0 = automatic)",
  displayId: "Android display ID",
  displayIdHint: "Use 0 for the main screen or a secondary display ID for desktop modes such as DeX.",
  orientation: "Orientation",
  codec: "Video codec",
  behavior: "Window & device",
  alwaysOnTop: "Always on top",
  control: "Control device",
  audio: "Forward audio",
  turnScreenOff: "Turn device screen off",
  stayAwake: "Keep device awake",
  showTouches: "Show touches",
  fullscreen: "Fullscreen",
  borderless: "Borderless window",
  aspectRatioLock: "Lock window aspect ratio",
  recording: "Recording",
  recordEnabled: "Record session",
  recordPath: "Recording file",
  autoRecordName: "Create a timestamped filename for every launch",
  recordDirectory: "Recording folder",
  chooseFolder: "Choose folder",
  chooseFile: "Choose file",
  noPlayback: "Record without playback window",
  geometry: "Geometry",
  crop: "Crop (x / y / width / height)",
  initialWindow: "Initial window (x / y / width / height)",
  advanced: "Advanced",
  accentScheme: "Accent colors",
  accentSchemeHint: "Pick the accent and success color pair used across the app.",
  accentReversed: "Reverse order (swap primary and secondary)",
  extraArgs: "Additional scrcpy arguments (one argument per line)",
  extraArgsHint: "Arguments are passed directly without a shell. Flags already managed by the GUI are rejected; unknown flags are preserved with a warning.",
  toggleSidebar: "Collapse / expand the sidebar",
  boot: "Boot",
  toolkit: "Toolkit",
  restartAdbServer: "Restart ADB server",
  stopAdbServer: "Stop ADB server",
  listDevices: "List devices",
  androidVersion: "Android version",
  bootHint: "Reboot the device or switch its boot mode. These use adb and take effect immediately.",
  bootDevice: "Device",
  bootReboot: "Reboot",
  bootRecovery: "Reboot to recovery",
  bootBootloader: "Reboot to bootloader",
  bootSafeMode: "Safe mode",
  bootWake: "Wake up",
  bootSleep: "Sleep",
  bootPowerOff: "Power off",
  bootSafeModeHint: "Safe mode uses the documented REBOOT intent and may not work on every manufacturer build.",
  toolkitHint: "Extra tools, scripts and commands. Optional integrations stay off until you enable them.",
  toolkitAdbTitle: "ADB quick actions",
  toolkitShizukuTitle: "Shizuku",
  toolkitCommandTitle: "Run a command",
  toolkitCommandPlaceholder: "shell getprop ro.product.model",
  toolkitRun: "Run",
  toolkitRecent: "Recent",
  toolkitMostUsed: "Most used",
  toolkitNoCommands: "No commands yet.",
  toolkitSshTitle: "SSH tunnel",
  toolkitSshHint: "Forwards a local port to the device over SSH, then scrcpy connects to it.",
  toolkitTerminalTitle: "Per-instance terminal",
  toolkitTerminalHint: "Opens a terminal running adb shell for the selected device.",
  toolkitTerminalOpen: "Open terminal for device",
  toolkitEnableSsh: "Enable SSH tunnel",
  toolkitEnableTerminal: "Per-instance terminal",
  toolkitSshHost: "user@host",
  toolkitStart: "Start tunnel",
  toolkitStop: "Stop",
  toolkitStatus: "Status",
  toolkitShizukuStart: "Start Shizuku",
  toolkitShizukuStop: "Stop Shizuku",
  toolkitShizukuStatus: "Shizuku status",
  toolkitShizukuHint: "Requires Shizuku to have been started via adb at least once.",
  toolkitNoOutput: "(no output)",
  swipePanelLabel: "Swipe",
  navBarLabel: "Navigation",
  dropHint: "Drag and drop files anywhere in this window to copy them to the device.",
  filesPushed: "{count} file(s) copied to the device.",
  pushFailed: "Could not copy the file to the device.",
  showSwipePanel: "Show swipe panel (on-screen swipe buttons)",
  showSwipePanelHint: "Adds a floating panel with horizontal and vertical swipe buttons.",
  showNavBar: "Show Android navigation bar",
  showNavBarHint: "Adds a floating back / home / recents bar for devices without on-screen navigation.",
  showQrPairing: "Show QR code pairing",
  showQrPairingHint: "Adds a QR option under Android 11+. The code is generated in this app and scanned with the device camera \u2014 your manual address/code fields above stay exactly as they are.",
  qrPair: "Pair with QR code",
  qrWaiting: "Waiting\u2026",
  qrTitle: "Scan with your device",
  qrSubtitle: "On the device: Settings \u2192 Developer options \u2192 Wireless debugging \u2192 Pair device with QR code, then scan the code below.",
  qrWaitingDevice: "Waiting for the device to scan the code\u2026",
  qrSuccess: "Paired with the device.",
  qrFailed: "QR pairing failed.",
  scripts: "Scripts",
  scriptsHint: "Toggle preset argument packs. Enabled scripts are appended to the launch command, after the additional arguments above.",
  muteNotifications: "Mute popup notifications",
  minimizeToTray: "Minimize to tray when closing the window",
  killAdbOnQuit: "Stop the shared ADB server when quitting",
  checkUpdatesOnStartup: "Check for updates on startup",
  autoUpdateOnStartup: "Auto update on startup",
  skipUpdateConfirmation: "Don't ask for confirmation before updating",
  updateAvailable: "Update available",
  checkingUpdates: "Checking...",
  updating: "Updating...",
  updatesAvailable: "Updates are available.",
  noUpdates: "Everything is up to date.",
  updateCheckFailed: "Update check failed.",
  updateFailed: "Update failed.",
  updatesApplied: "Updates applied.",
  appUpdateDownloaded: "New UltimateSCRCPYGui downloaded to {path}.",
  updateConfirmTitle: "Updates available",
  updateConfirmHint: "The following components have newer versions. Update them now?",
  dontShowAgain: "Don't show this again.",
  resetSettings: "Reset settings",
  savedAutomatically: "Settings save automatically.",
  clearLogs: "Clear logs",
  structuredEvents: "Structured application events",
  noLogs: "No structured events match these filters.",
  filterByLevel: "Filter events by level",
  filterByDomain: "Filter events by domain",
  allLevels: "All levels",
  allDomains: "All domains",
  errorDetails: "Error details",
  retryable: "Retryable",
  yes: "Yes",
  no: "No",
  openGithub: "GitHub",
  running: "Running",
  offline: "Offline",
  usb: "USB",
  selectAll: "Select all",
  deviceAlias: "Device alias",
  launchProfile: "Launch profile",
  globalSettings: "Global settings",
  autoLaunchDevice: "Launch automatically when this device connects",
  autoSelectFirst: "Select the first available device automatically",
  controlPanel: "Device control panel",
  controlPanelHint: "Click familiar controls, save or copy a PNG screenshot, or record the actions as a reusable ADB automation.",
  deviceWorkspace: "Device workspace",
  deviceWorkspaceHint: "Inspect one device, control it, launch apps, or run reviewed file operations across the selected devices.",
  workspace_overview: "Overview",
  workspace_control: "Control",
  workspace_apps: "Apps",
  workspace_files: "Files & APK",
  loadingDeviceDetails: "Loading device details…",
  deviceOverviewFailed: "Could not read device details.",
  manufacturer: "Manufacturer",
  model: "Model",
  display: "Display",
  battery: "Battery",
  refreshDetails: "Refresh details",
  searchApps: "Search launchable apps by package id",
  showSystemApps: "Include system apps",
  loadingApps: "Loading applications…",
  appListFailed: "Could not list installed applications.",
  appStartFailed: "Could not start the application.",
  appStarted: "Application started:",
  systemApp: "System",
  startApp: "Start",
  noApps: "No launchable applications match this filter.",
  batchTargets: "Target devices",
  selectedDevicesTakePriority: "selected device cards are used; otherwise the workspace device is used",
  pushFiles: "Push files",
  pushFilesHint: "Choose up to 50 local files. Transfers run two at a time and return a result for every device/file pair.",
  targetDirectory: "Android target directory",
  existingFile: "If a target exists",
  replace: "Replace",
  skip: "Skip",
  chooseAndPush: "Choose files and push",
  installApk: "Install APK",
  installApkHint: "Choose one .apk. Runtime permissions are never granted automatically.",
  replaceExistingApp: "Replace existing application",
  allowDowngrade: "Allow version downgrade",
  chooseAndInstall: "Choose APK and install",
  filePushFailed: "Could not prepare the file transfer.",
  apkInstallFailed: "Could not prepare APK installation.",
  confirmDowngrade: "Allow Android to install an older application version on the selected devices? This may discard app data or be rejected by the device.",
  batchItemsFailed: "batch items failed.",
  batchItemsCompleted: "batch items completed.",
  skipped: "skipped",
  skippedExisting: "Skipped because the target already exists.",
  completed: "Completed.",
  chooseDevice: "Choose a device",
  actionBack: "Back",
  actionHome: "Home",
  actionAppSwitch: "Recent apps",
  actionMenu: "Menu",
  actionVolumeUp: "Volume +",
  actionVolumeDown: "Volume −",
  actionPower: "Power",
  actionScreenOn: "Screen on",
  actionScreenOff: "Screen off",
  actionRotate: "Rotate",
  actionAutoRotate: "Auto rotate",
  actionTouchesOn: "Touches on",
  actionTouchesOff: "Touches off",
  screenshot: "Screenshot",
  saveScreenshot: "Save screenshot",
  copyScreenshot: "Copy screenshot",
  screenshotSaved: "Screenshot saved:",
  screenshotCopied: "Screenshot copied to the system clipboard.",
  automation: "Automation",
  automationHint: "Recording stores control actions and their timing; replay is limited to safe, predefined ADB actions.",
  startRecordingActions: "Record actions",
  stopRecordingActions: "Stop recording",
  automationName: "Automation name",
  automationEmpty: "Record at least one action first.",
  automationSaved: "Automation saved.",
  automationComplete: "Automation replay completed.",
  save: "Save",
  discard: "Discard",
  actions: "actions",
  replay: "Replay",
  replaying: "Replaying…",
  delete: "Delete",
  savedAddressName: "Saved address name",
  autoConnect: "Connect at startup",
  profiles: "Launch profiles",
  profilesHint: "Save the current settings, then assign a different profile to each device card.",
  profileName: "Profile name",
  saveCurrentProfile: "Save current settings",
  globalProfile: "Global settings",
  automatic: "automatic",
  load: "Load",
  update: "Update",
  profileNameRequired: "Enter a profile name.",
  profileSaved: "Profile saved.",
  profileApplied: "Profile loaded into the editor.",
  profileUpdated: "Profile updated.",
  profileNameUnique: "Profile names must be unique and contain at most 80 characters.",
  importProfile: "Import profile",
  export: "Export",
  cancel: "Cancel",
  compatible: "Compatible",
  newerRuntimeRequired: "Newer scrcpy required",
  unknownFields: "unknown fields will be ignored",
  machineLocalPaths: "Machine-local paths",
  keepMachineLocalPaths: "Keep these paths on this computer",
  profileNameConflict: "A profile with this name already exists",
  keepExistingProfile: "Keep the existing profile",
  importAsCopy: "Import as a uniquely named copy",
  replaceExistingProfile: "Replace the existing profile",
  profileExportFailed: "Could not export the profile.",
  profileExported: "Profile exported.",
  profileImportFailed: "Could not import the profile.",
  profileImported: "Profile imported.",
  profileKeptExisting: "The existing profile was kept unchanged.",
  confirmDeleteReferencedProfile: "device assignments use this profile. Delete it and clear those assignments?",
  pushTarget: "Drag-and-drop target",
  pushTargetHint: "Android directory used by scrcpy when files are dropped into the mirror.",
  tunnelPort: "Tunnel port or range",
  tunnelPortHint: "Leave empty for scrcpy default (27183:27199).",
  bossKey: "Enable boss key",
  bossKeyShortcut: "Global shortcut",
  bossKeyHint: "Emergency privacy action: closes every active mirror and hides UltimateSCRCPYGui. Restore the app from its tray icon.",
  operationFailed: "Operation failed",
  configMigrated: "Configuration migrated to secure V3 storage (imported/skipped/invalid):",
  configLoadFailed: "Could not load the main-process configuration.",
  configSaveFailed: "Could not save configuration.",
  exportConfig: "Export configuration",
  exportConfigHint: "Save the app settings as JSON, or export the current launch command as a shell / batch script.",
  exportJson: "Export as JSON",
  exportShell: "Export as .sh",
  exportBatch: "Export as .bat",
  exportCommand: "Export as .command",
  configExported: "Configuration exported to {path}.",
  configExportFailed: "Could not export the configuration.",
  environmentReady: "scrcpy and adb are ready.",
  launched: "scrcpy started.",
  stopped: "scrcpy stopped.",
  paired: "Device paired.",
  connected: "Device connected.",
  disconnected: "Device disconnected.",
  automations: "Automations",
  safeAutomation: "Safe automation",
  automationsHintV2: "Build bounded, normalized device actions; every batch is inspected before it runs and raw shell is never accepted.",
  deviceGroups: "Device groups",
  deviceGroupsHint: "Save the currently selected devices with a default profile and an explicit concurrency limit.",
  selected: "selected",
  groupName: "Group name",
  description: "Description",
  defaultProfile: "Default profile",
  perDeviceOrGlobal: "Per-device profile or global settings",
  concurrencyLimit: "Concurrency limit",
  concurrency: "concurrency",
  saveGroup: "Save group",
  updateGroup: "Update group",
  useGroup: "Use group",
  edit: "Edit",
  groupNameAndDevicesRequired: "Enter a group name and select at least one connected device.",
  groupSaved: "Device group saved.",
  import: "Import",
  newAutomation: "New automation",
  untrustedImport: "Untrusted import preview",
  reviewRequired: "Review required",
  steps: "steps",
  inputSteps: "input steps",
  automationImportConfirmation: "I reviewed every step and understand that importing does not run it.",
  importReviewedAutomation: "Import reviewed automation",
  automationImported: "Automation imported.",
  automationImportFailed: "Could not import the automation.",
  automationExportFailed: "Could not export the automation.",
  copy: "copy",
  automationEditor: "Automation editor",
  editAutomation: "Edit automation",
  designOrientation: "Design orientation",
  designAspectRatio: "Design aspect ratio",
  any: "Any",
  portrait: "Portrait",
  landscape: "Landscape",
  zeroMeansUnknown: "0 means unspecified",
  delay: "Delay",
  tap: "Tap",
  swipe: "Swipe",
  textInput: "Text input",
  assertDevice: "Assert device",
  nonSensitiveText: "Non-sensitive text only",
  optionalLabel: "Optional label",
  addStep: "Add step",
  stepValueRequired: "Enter a value for this step.",
  automationTooLarge: "An automation may contain at most 200 steps.",
  automationNameAndStepsRequired: "Enter a name and add at least one step.",
  saveAutomation: "Save automation",
  clearEditor: "Clear editor",
  noAutomationSteps: "Add a bounded step to begin.",
  automationLibrary: "Automation library",
  noAutomations: "No saved automations.",
  batchPreflight: "Batch preflight",
  groupBatchRun: "Group batch run",
  batchRunHint: "Online state, authorization, capabilities, scene conflicts, and target geometry are checked before execution.",
  targets: "targets",
  targetGroup: "Target group",
  currentlySelectedDevices: "Currently selected devices",
  batchAction: "Batch action",
  controlAction: "Control action",
  packageId: "Package ID",
  chooseAutomation: "Choose an automation",
  inspectBatch: "Inspect batch",
  online: "Online",
  authorized: "Authorized",
  capability: "Capability",
  sessionConflict: "Session conflict",
  estimatedAction: "Estimated action",
  runPassingOnly: "Run passing targets only",
  confirmInputBatch: "I confirm this automation may tap, swipe, or enter text on every passing device.",
  confirmBatch_input: "I confirm this automation may tap, swipe, or enter text on every passing device.",
  confirmBatch_overwrite: "I confirm existing remote files may be replaced on every passing device.",
  confirmBatch_downgrade: "I confirm an older APK may be installed and application data could be lost.",
  runBatch: "Run batch",
  batchRunning: "Batch is running",
  cancelRun: "Cancel run",
  runReport: "Run report",
  succeeded: "succeeded",
  runEvents: "run events",
  chooseBatchTargets: "Choose a group or select devices first.",
  batchPreflightFailed: "Batch preflight failed.",
  batchStartFailed: "Could not start the batch.",
  batchCancelFailed: "Could not cancel the batch.",
  packageIdRequired: "Enter an Android package ID.",
  targetDirectoryRequired: "Enter a safe absolute Android target directory.",
  batchOtgUnsupported: "OTG is a separate USB workflow and cannot be launched through an ADB device group."
};
const zhCN = {
  devices: "设备",
  device: "设备",
  sessions: "会话",
  artifacts: "产物",
  settings: "设置",
  logs: "日志",
  settingsSection_general: "常规",
  settingsSection_video: "视频",
  artifactLibrary: "产物库",
  artifactsHint: "由主进程统一索引截图、录像、传输报告和诊断包。",
  filterArtifactKind: "按产物类型筛选",
  filterArtifactDevice: "按设备筛选",
  allArtifactKinds: "全部类型",
  allDevices: "全部设备",
  "artifactKind_screenshot": "截图",
  "artifactKind_recording": "录像",
  "artifactKind_transfer-report": "传输报告",
  "artifactKind_diagnostic": "诊断包",
  artifactStatus_available: "可用",
  artifactStatus_missing: "文件缺失",
  artifactStatus_incomplete: "不完整",
  loadingArtifacts: "正在加载产物…",
  noArtifacts: "没有符合筛选条件的产物。",
  open: "打开",
  reveal: "在文件夹中显示",
  copyPath: "复制路径",
  removeIndex: "仅移出产物库",
  deleteFile: "删除文件",
  artifactListFailed: "无法加载产物库。",
  artifactOpenFailed: "无法打开产物。",
  artifactRevealFailed: "无法在文件夹中显示产物。",
  artifactCopyFailed: "无法复制产物路径。",
  artifactDeleteFailed: "无法删除产物。",
  artifactPathCopied: "已复制产物路径。",
  artifactFileDeleted: "产物文件已删除。",
  artifactIndexDeleted: "已移出产物库，原文件仍保留。",
  notApplicable: "不针对具体设备",
  prepareDiagnostics: "准备诊断",
  diagnosticPreview: "诊断包预览",
  diagnosticPrivacyHint: "导出前请检查清单；默认会脱敏路径、设备标识、地址和疑似配对码。",
  includedFiles: "包含的文件",
  redactionsApplied: "已执行脱敏",
  noSensitiveValuesFound: "没有发现匹配的敏感值。",
  recentEventsIncluded: "条近期事件已包含。",
  exportDiagnosticBundle: "导出 ZIP",
  openIssueHelper: "打开 Issue 助手",
  reportIssue: "报告问题",
  diagnosticPreviewFailed: "无法准备诊断信息。",
  diagnosticExportFailed: "无法导出诊断包。",
  diagnosticExported: "诊断包已导出到本地。",
  issueHelperFailed: "无法打开 Issue 助手。",
  sessionCenter: "会话中心",
  sessionsHint: "每次启动都有独立身份和经过验证的生命周期；进程只有通过启动观察窗口后才会显示为运行中。",
  noSessions: "本次运行尚未启动 scrcpy 会话。",
  stopAllSessions: "停止全部活动会话",
  sessionsStopFailed: "个会话无法停止。",
  sessionState_queued: "排队中",
  sessionState_preflighting: "预检中",
  sessionState_launching: "启动中",
  sessionState_running: "运行中",
  sessionState_stopping: "停止中",
  sessionState_stopped: "已停止",
  sessionState_failed: "失败",
  settingsSection_controls: "控制",
  settingsSection_recording: "录制",
  settingsSection_geometry: "窗口",
  settingsSection_advanced: "高级",
  runtimeSetup: "运行环境",
  runtimeHint: "已内置 scrcpy 与 adb，可以直接使用。",
  chooseScrcpy: "选择其他 scrcpy",
  runtimeCapabilities: "已检测能力",
  capabilitiesUnavailable: "未检测到可选能力。",
  capabilityProbeFailed: "scrcpy 可以使用，但无法检测其可选能力。",
  capability_screen: "屏幕",
  capability_camera: "相机",
  capability_virtualDisplay: "虚拟显示器",
  capability_recordOnly: "仅录制",
  capability_controlOnly: "仅控制",
  capability_otg: "OTG",
  capability_v4l2: "V4L2",
  capability_appLaunch: "启动应用",
  sceneBuilder: "启动场景",
  chooseScene: "选择启动场景",
  sceneReviewHint: "选择 → 探测 → 配置 → 预览",
  scene_screen: "屏幕",
  scene_camera: "相机",
  "scene_virtual-display": "虚拟显示器",
  "scene_record-only": "仅录制",
  "scene_control-only": "仅控制",
  scene_otg: "OTG",
  sceneHint_screen: "镜像并控制 Android 物理显示器。",
  sceneHint_camera: "预览或录制 Android 12+ 相机画面。",
  "sceneHint_virtual-display": "创建独立 Android 显示器并启动一个应用。",
  "sceneHint_record-only": "在后台录制，不显示播放窗口。",
  "sceneHint_control-only": "不传输视频和音频，仅发送键鼠与手柄输入。",
  sceneHint_otg: "不依赖 ADB 或 USB 调试，通过 USB HID 控制。",
  sceneShort_screen: "物理显示器",
  sceneShort_camera: "Android 12+",
  "sceneShort_virtual-display": "应用工作区",
  "sceneShort_record-only": "无窗口",
  "sceneShort_control-only": "ADB 输入",
  sceneShort_otg: "USB，无 ADB",
  unsupportedByRuntime: "当前运行时不支持",
  deviceCapabilities: "设备能力",
  deviceCapabilitiesHint: "选择编码器、显示器、相机、尺寸或高速模式前先探测设备。",
  probing: "探测中…",
  refreshCapabilities: "重新探测",
  inspectDevice: "探测设备",
  cachedResult: "缓存结果",
  liveResult: "最新探测",
  screenSource: "物理显示器来源",
  screenSourceHint: "使用探测到的显示器 ID 比猜测副屏编号更可靠。",
  unknownSize: "尺寸未知",
  cameraSource: "相机来源",
  cameraSourceHint: "尺寸与帧率由 Android 声明；设备上报错误时仍可能启动失败。",
  camera: "相机",
  cameraId: "相机 ID",
  cameraFacing: "相机朝向",
  cameraSize: "相机尺寸",
  cameraFps: "相机帧率",
  cameraZoom: "相机变焦",
  cameraHighSpeed: "受限高速拍摄",
  cameraFacing_front: "前置",
  cameraFacing_back: "后置",
  cameraFacing_external: "外接",
  cameraFacing_unknown: "未知",
  cameraMicrophoneDefault: "相机麦克风（默认）",
  audioSource: "音频来源",
  audioSource_mic: "麦克风",
  audioSource_camcorder: "摄像麦克风",
  audioSource_output: "设备输出",
  audioSource_playback: "应用播放",
  v4l2Sink: "V4L2 回环设备",
  v4l2Buffer: "V4L2 缓冲（毫秒）",
  v4l2Playback: "保留预览窗口",
  virtualDisplay: "虚拟显示器生命周期",
  virtualDisplayHint: "启动前明确应用目标和关闭时的内容处理。",
  presetPresentation: "演示",
  presetDesktop: "桌面 / Flex",
  presetIsolated: "应用隔离",
  startAppPackage: "要启动的应用包名",
  width: "宽度",
  height: "高度",
  systemDecorations: "系统装饰",
  destroyContent: "关闭时销毁内容",
  flexDisplay: "随窗口调整尺寸",
  keepActive: "保持显示器活跃",
  displayImePolicy: "输入法显示策略",
  defaultDisplay: "默认显示器",
  localDisplay: "本地虚拟显示器",
  recordOnlySetup: "后台录制",
  recordOnlyHint: "选择保存文件夹并启用至少一种媒体流。每次开始按所选格式自动创建文件，停止录制将结束所有后台录制。",
  startRecording: "开始录制",
  stopRecording: "停止录制",
  activeRecordings: "后台录制会话",
  recordingInProgress: "正在录制",
  recordingDuration: "录制时长",
  recordFormat: "封装格式",
  timeLimit: "时间限制（秒，0 表示不限）",
  recordVideo: "录制视频",
  recordAudio: "录制音频",
  controlOnlyInput: "仅 ADB 控制输入",
  controlOnlyInputHint: "UHID 支持无线；SDK 鼠标依赖播放窗口，因此此处不提供。",
  otgInput: "OTG USB 输入",
  otgInputHint: "OTG 仅接受 AOA、禁用或 OTG 默认输入模式，并直接打开 USB 设备。",
  optionalUsbSerial: "USB 序列号（可选）",
  singleUsbAutomatic: "仅连接一个 USB 设备时自动选择",
  otgNoAdbHint: "无需 USB 调试；只有连接多个 USB 设备时才需要填写序列号。",
  disabled: "禁用",
  launchOtg: "启动 OTG",
  otgProfileLaunchHint: "请先把 OTG 配置载入启动场景，再使用“启动 OTG”；OTG 不属于 ADB 设备分配。",
  mediaEncoding: "媒体编码",
  mediaEncodingHint: "除非设备默认编码器失败或需要已验证的特定编码器，否则保持自动。",
  videoEncoder: "视频编码器",
  audioCodec: "音频编码",
  audioEncoder: "音频编码器",
  selectedTargets: "所选目标",
  automaticUsbTarget: "USB 目标：未填写序列号时自动选择",
  sceneCamera: "相机场景",
  sceneVirtualDisplay: "虚拟显示器场景",
  sceneRecordOnly: "仅录制场景",
  sceneControlOnly: "仅控制场景",
  sceneOtg: "OTG 场景",
  virtualDisplayDecorations: "虚拟显示器系统装饰",
  virtualDisplayDestroy: "虚拟显示器关闭行为",
  recheck: "重新检测",
  ready: "可用",
  notFound: "未找到",
  refresh: "刷新",
  connectedDevices: "已连接设备",
  noDevices: "未检测到设备。请连接 USB 调试，或在下方使用无线配对。",
  launchSelected: "打开所选设备",
  stop: "停止",
  tracker_starting: "正在启动追踪",
  tracker_tracking: "正在追踪设备",
  tracker_restarting: "正在重启追踪",
  tracker_error: "设备追踪不可用",
  tracker_stopped: "设备追踪已停止",
  trackerLive: "ADB 实时流",
  trackerPolling: "安全轮询回退",
  trackerFailed: "无法启动设备追踪。",
  previewCommand: "预览命令",
  commandPreview: "命令预览",
  commandPreviewHint: "显示每台所选设备最终生成的 argv；结果以 JSON 数组表示，不经过 shell 执行。",
  commandPreviewFailed: "无法生成命令预览。",
  close: "关闭",
  source_session: "会话管理",
  "source_scene-default": "场景默认",
  source_global: "全局设置",
  source_profile: "配置",
  sourceProfile: "配置",
  "source_device-override": "设备覆盖",
  source_generated: "自动生成",
  source_expert: "专家参数",
  disconnect: "断开",
  unauthorized: "请在设备上允许调试，然后刷新。",
  wireless: "无线调试",
  wirelessHint: "Android 11+：先使用设备显示的地址、端口和六位验证码配对，再使用连接端口连接。",
  address: "主机或主机:端口",
  pairAddress: "配对主机:端口",
  pairingCode: "六位配对码",
  connect: "连接",
  pair: "配对",
  general: "常规",
  windowTitle: "窗口标题",
  shortcutModifier: "快捷键修饰键",
  shortcutHint: "使用系统默认值可避免占用普通的 Ctrl+X/C/V 快捷键。",
  keyboardMode: "键盘模式",
  video: "视频",
  mouseMode: "鼠标模式",
  gamepadMode: "游戏手柄模式",
  bitRate: "码率（Mbps）",
  videoBuffer: "视频缓冲（毫秒）",
  audioBuffer: "音频缓冲（毫秒）",
  maxSize: "最大尺寸（0 = 自动）",
  maxFps: "最大 FPS（0 = 自动）",
  displayId: "Android 显示 ID",
  displayIdHint: "主屏幕使用 0；DeX 等桌面模式可填写对应的副屏显示 ID。",
  orientation: "方向",
  codec: "视频编码",
  behavior: "窗口与设备",
  alwaysOnTop: "窗口置顶",
  control: "控制设备",
  audio: "转发音频",
  turnScreenOff: "关闭设备屏幕",
  stayAwake: "保持设备唤醒",
  showTouches: "显示触摸位置",
  fullscreen: "全屏",
  borderless: "无边框窗口",
  aspectRatioLock: "锁定窗口宽高比",
  recording: "录制",
  recordEnabled: "录制会话",
  recordPath: "录制文件",
  autoRecordName: "每次启动自动生成时间文件名",
  recordDirectory: "录制目录",
  chooseFolder: "选择目录",
  chooseFile: "选择文件",
  noPlayback: "仅录制，不显示投屏窗口",
  geometry: "位置与裁剪",
  crop: "裁剪（x / y / 宽 / 高）",
  initialWindow: "初始窗口（x / y / 宽 / 高）",
  advanced: "高级",
  extraArgs: "附加 scrcpy 参数（每行一个）",
  extraArgsHint: "参数不经过 shell；GUI 已管理的参数会被拒绝，未知参数会保留并给出警告。",
  muteNotifications: "关闭弹出通知",
  resetSettings: "恢复默认设置",
  savedAutomatically: "设置会自动保存。",
  clearLogs: "清空日志",
  minimizeToTray: "关闭窗口时最小化到系统托盘",
  killAdbOnQuit: "退出时停止共享的 ADB 服务",
  noLogs: "没有符合当前筛选条件的结构化事件。",
  structuredEvents: "结构化应用事件",
  filterByLevel: "按级别筛选事件",
  filterByDomain: "按领域筛选事件",
  allLevels: "全部级别",
  allDomains: "全部领域",
  errorDetails: "错误详情",
  retryable: "可重试",
  yes: "是",
  no: "否",
  openGithub: "GitHub",
  running: "运行中",
  offline: "离线",
  usb: "USB",
  selectAll: "全选",
  deviceAlias: "设备别名",
  launchProfile: "启动配置",
  globalSettings: "全局设置",
  autoLaunchDevice: "此设备连接后自动启动",
  autoSelectFirst: "自动选中第一台可用设备",
  controlPanel: "设备控制面板",
  controlPanelHint: "通过鼠标点击常用按键、保存或复制 PNG 截图，或把操作录制成可复用的 ADB 自动化。",
  deviceWorkspace: "设备工作区",
  deviceWorkspaceHint: "查看单台设备信息、控制设备、启动应用，或对所选设备执行经过确认的文件操作。",
  workspace_overview: "概览",
  workspace_control: "控制",
  workspace_apps: "应用",
  workspace_files: "文件与 APK",
  loadingDeviceDetails: "正在读取设备信息…",
  deviceOverviewFailed: "无法读取设备信息。",
  manufacturer: "制造商",
  model: "型号",
  display: "显示尺寸",
  battery: "电量",
  refreshDetails: "刷新信息",
  searchApps: "按包名搜索可启动应用",
  showSystemApps: "包含系统应用",
  loadingApps: "正在读取应用列表…",
  appListFailed: "无法读取已安装应用。",
  appStartFailed: "无法启动应用。",
  appStarted: "已启动应用：",
  systemApp: "系统",
  startApp: "启动",
  noApps: "没有符合筛选条件的可启动应用。",
  batchTargets: "目标设备",
  selectedDevicesTakePriority: "优先使用已勾选的设备，否则使用当前工作区设备",
  pushFiles: "推送文件",
  pushFilesHint: "一次可选择最多 50 个本地文件；全局并发为 2，并返回每个设备/文件组合的结果。",
  targetDirectory: "Android 目标目录",
  existingFile: "目标已存在时",
  replace: "替换",
  skip: "跳过",
  chooseAndPush: "选择文件并推送",
  installApk: "安装 APK",
  installApkHint: "选择一个 .apk；不会自动授予运行时权限。",
  replaceExistingApp: "替换已安装应用",
  allowDowngrade: "允许版本降级",
  chooseAndInstall: "选择 APK 并安装",
  filePushFailed: "无法准备文件传输。",
  apkInstallFailed: "无法准备 APK 安装。",
  confirmDowngrade: "允许 Android 在所选设备上安装较旧版本吗？这可能导致应用数据丢失，也可能被设备拒绝。",
  batchItemsFailed: "个批量项目失败。",
  batchItemsCompleted: "个批量项目已完成。",
  skipped: "已跳过",
  skippedExisting: "目标已存在，已跳过。",
  completed: "已完成。",
  chooseDevice: "选择设备",
  actionBack: "返回",
  actionHome: "主页",
  actionAppSwitch: "最近任务",
  actionMenu: "菜单",
  actionVolumeUp: "音量 +",
  actionVolumeDown: "音量 −",
  actionPower: "电源",
  actionScreenOn: "点亮屏幕",
  actionScreenOff: "关闭屏幕",
  actionRotate: "旋转",
  actionAutoRotate: "自动旋转",
  screenshot: "截图",
  saveScreenshot: "保存截图",
  copyScreenshot: "复制截图",
  screenshotSaved: "截图已保存：",
  screenshotCopied: "截图已复制到系统剪贴板。",
  automation: "自动化",
  actionTouchesOn: "显示触摸",
  actionTouchesOff: "关闭触摸显示",
  automationHint: "录制会保留控制动作和间隔；回放仅执行预定义的安全 ADB 动作。",
  startRecordingActions: "录制动作",
  stopRecordingActions: "停止录制",
  automationName: "自动化名称",
  automationEmpty: "请先录制至少一个动作。",
  automationSaved: "自动化已保存。",
  automationComplete: "自动化回放完成。",
  save: "保存",
  discard: "丢弃",
  actions: "个动作",
  replay: "回放",
  replaying: "回放中…",
  delete: "删除",
  savedAddressName: "已保存地址名称",
  autoConnect: "启动时自动连接",
  profiles: "启动配置",
  profilesHint: "保存当前设置，然后可以在每张设备卡片上指定不同配置。",
  profileName: "配置名称",
  saveCurrentProfile: "保存当前设置",
  automatic: "自动",
  load: "载入",
  update: "更新",
  profileNameRequired: "请输入配置名称。",
  profileSaved: "配置已保存。",
  profileApplied: "配置已载入编辑区。",
  profileUpdated: "配置已更新。",
  profileNameUnique: "配置名称必须唯一，且最多 80 个字符。",
  importProfile: "导入配置",
  export: "导出",
  cancel: "取消",
  compatible: "兼容",
  newerRuntimeRequired: "需要更新的 scrcpy",
  unknownFields: "个未知字段将被忽略",
  machineLocalPaths: "本机路径",
  keepMachineLocalPaths: "在这台电脑上保留这些路径",
  profileNameConflict: "已存在同名配置",
  keepExistingProfile: "保留现有配置",
  importAsCopy: "以唯一名称创建副本",
  replaceExistingProfile: "替换现有配置",
  profileExportFailed: "无法导出配置。",
  profileExported: "配置已导出。",
  profileImportFailed: "无法导入配置。",
  profileImported: "配置已导入。",
  profileKeptExisting: "已保留现有配置，未作更改。",
  confirmDeleteReferencedProfile: "个设备分配正在使用此配置。删除并清除这些分配吗？",
  bossKey: "启用 Boss 键",
  bossKeyShortcut: "全局快捷键",
  pushTarget: "拖放文件目标目录",
  pushTargetHint: "把文件拖入投屏窗口时，scrcpy 使用的 Android 目录。",
  tunnelPort: "隧道端口或范围",
  tunnelPortHint: "留空使用 scrcpy 默认值（27183:27199）。",
  bossKeyHint: "紧急隐私操作：关闭全部投屏并隐藏 UltimateSCRCPYGui；可通过托盘图标恢复主界面。",
  operationFailed: "操作失败",
  environmentReady: "scrcpy 与 adb 已就绪。",
  launched: "scrcpy 已启动。",
  stopped: "scrcpy 已停止。",
  configMigrated: "配置已迁移到安全的 V3 存储（导入/跳过/无效）：",
  configLoadFailed: "无法加载主进程配置。",
  configSaveFailed: "无法保存配置。",
  paired: "设备配对成功。",
  connected: "设备连接成功。",
  disconnected: "设备已断开。",
  automations: "自动化",
  safeAutomation: "安全自动化",
  automationsHintV2: "通过有上限的归一化动作编排设备；每次批量运行前都必须预检，绝不接受任意 shell。",
  deviceGroups: "设备组",
  deviceGroupsHint: "把当前选中的设备、默认配置和明确的并发上限保存为一组。",
  selected: "已选择",
  groupName: "设备组名称",
  description: "说明",
  defaultProfile: "默认配置",
  perDeviceOrGlobal: "使用逐设备配置或全局设置",
  concurrencyLimit: "并发上限",
  concurrency: "并发",
  saveGroup: "保存设备组",
  updateGroup: "更新设备组",
  useGroup: "使用该组",
  edit: "编辑",
  groupNameAndDevicesRequired: "请输入设备组名称并选择至少一台已连接设备。",
  groupSaved: "设备组已保存。",
  import: "导入",
  newAutomation: "新建自动化",
  untrustedImport: "未信任导入预览",
  reviewRequired: "必须检查",
  steps: "个步骤",
  inputSteps: "个输入步骤",
  automationImportConfirmation: "我已逐项检查；导入本身不会执行这些动作。",
  importReviewedAutomation: "导入已检查的自动化",
  automationImported: "自动化已导入。",
  automationImportFailed: "无法导入自动化。",
  automationExportFailed: "无法导出自动化。",
  copy: "副本",
  automationEditor: "自动化编辑器",
  editAutomation: "编辑自动化",
  designOrientation: "设计方向",
  designAspectRatio: "设计宽高比",
  any: "任意",
  portrait: "竖屏",
  landscape: "横屏",
  zeroMeansUnknown: "0 表示未指定",
  delay: "等待",
  tap: "点击",
  swipe: "滑动",
  textInput: "输入文本",
  assertDevice: "断言设备状态",
  nonSensitiveText: "只能填写非敏感文本",
  optionalLabel: "可选标签",
  addStep: "添加步骤",
  stepValueRequired: "请填写该步骤需要的值。",
  automationTooLarge: "自动化最多包含 200 个步骤。",
  automationNameAndStepsRequired: "请输入名称并添加至少一个步骤。",
  saveAutomation: "保存自动化",
  clearEditor: "清空编辑器",
  noAutomationSteps: "添加一个受控步骤以开始。",
  automationLibrary: "自动化库",
  noAutomations: "尚未保存自动化。",
  batchPreflight: "批量预检",
  groupBatchRun: "设备组批量运行",
  batchRunHint: "执行前检查在线状态、授权、能力、会话冲突和目标几何信息。",
  targets: "个目标",
  targetGroup: "目标设备组",
  currentlySelectedDevices: "当前勾选的设备",
  batchAction: "批量动作",
  controlAction: "控制动作",
  packageId: "应用包名",
  chooseAutomation: "选择自动化",
  inspectBatch: "预检批量计划",
  online: "在线",
  authorized: "已授权",
  capability: "能力",
  sessionConflict: "会话冲突",
  estimatedAction: "预计动作",
  runPassingOnly: "仅执行通过项",
  confirmInputBatch: "我确认该自动化可能在所有通过预检的设备上点击、滑动或输入文本。",
  confirmBatch_input: "我确认该自动化可能在所有通过预检的设备上点击、滑动或输入文本。",
  confirmBatch_overwrite: "我确认所有通过预检的设备上已有的远程文件可能被替换。",
  confirmBatch_downgrade: "我确认可能安装较旧 APK，并可能导致应用数据丢失。",
  runBatch: "运行批量任务",
  batchRunning: "批量任务运行中",
  cancelRun: "取消运行",
  runReport: "运行报告",
  succeeded: "成功",
  runEvents: "条运行事件",
  chooseBatchTargets: "请先选择设备组或勾选设备。",
  batchPreflightFailed: "批量预检失败。",
  batchStartFailed: "无法启动批量任务。",
  batchCancelFailed: "无法取消批量任务。",
  packageIdRequired: "请输入 Android 应用包名。",
  targetDirectoryRequired: "请输入安全的 Android 绝对目标目录。",
  batchOtgUnsupported: "OTG 是独立 USB 流程，不能通过 ADB 设备组批量启动。"
};
const zhTW = {
  ...zhCN,
  devices: "裝置",
  device: "裝置",
  sessions: "工作階段",
  settings: "設定",
  logs: "日誌",
  runtimeSetup: "執行環境",
  sessionCenter: "工作階段中心",
  sessionsHint: "每次啟動都有獨立身分與經驗證的生命週期；程序通過啟動觀察視窗後才會顯示為執行中。",
  noSessions: "本次執行尚未啟動 scrcpy 工作階段。",
  stopAllSessions: "停止全部作用中工作階段",
  sessionsStopFailed: "個工作階段無法停止。",
  sessionState_queued: "排隊中",
  sessionState_preflighting: "預檢中",
  sessionState_launching: "啟動中",
  sessionState_running: "執行中",
  sessionState_stopping: "停止中",
  sessionState_stopped: "已停止",
  sessionState_failed: "失敗",
  runtimeHint: "已內建 scrcpy 與 adb，可以直接使用。",
  chooseScrcpy: "選擇其他 scrcpy",
  runtimeCapabilities: "已偵測能力",
  capabilitiesUnavailable: "未偵測到選用能力。",
  capabilityProbeFailed: "scrcpy 可以使用，但無法偵測其選用能力。",
  capability_screen: "螢幕",
  capability_camera: "相機",
  capability_virtualDisplay: "虛擬顯示器",
  capability_recordOnly: "僅錄製",
  capability_controlOnly: "僅控制",
  capability_otg: "OTG",
  capability_v4l2: "V4L2",
  capability_appLaunch: "啟動應用程式",
  recheck: "重新偵測",
  ready: "可用",
  notFound: "未找到",
  refresh: "重新整理",
  connectedDevices: "已連接裝置",
  noDevices: "未偵測到裝置。請連接 USB 偵錯，或在下方使用無線配對。",
  launchSelected: "開啟所選裝置",
  stop: "停止",
  tracker_starting: "正在啟動追蹤",
  tracker_tracking: "正在追蹤裝置",
  tracker_restarting: "正在重新啟動追蹤",
  tracker_error: "裝置追蹤無法使用",
  tracker_stopped: "裝置追蹤已停止",
  trackerLive: "ADB 即時串流",
  trackerPolling: "安全輪詢備援",
  trackerFailed: "無法啟動裝置追蹤。",
  previewCommand: "預覽命令",
  commandPreview: "命令預覽",
  commandPreviewHint: "顯示每台所選裝置最終產生的 argv；結果以 JSON 陣列表示，不經過 shell 執行。",
  commandPreviewFailed: "無法產生命令預覽。",
  close: "關閉",
  source_session: "工作階段管理",
  source_global: "全域設定",
  source_profile: "設定檔",
  sourceProfile: "設定檔",
  "source_device-override": "裝置覆寫",
  source_generated: "自動產生",
  source_expert: "專家參數",
  disconnect: "中斷",
  unauthorized: "請在裝置上允許偵錯，然後重新整理。",
  wireless: "無線偵錯",
  general: "一般",
  windowTitle: "視窗標題",
  shortcutModifier: "快捷鍵修飾鍵",
  video: "影片",
  behavior: "視窗與裝置",
  recording: "錄製",
  recordEnabled: "錄製工作階段",
  recordPath: "錄製檔案",
  chooseFile: "選擇檔案",
  geometry: "位置與裁剪",
  advanced: "進階",
  muteNotifications: "關閉彈出通知",
  resetSettings: "恢復預設設定",
  savedAutomatically: "設定會自動儲存。",
  minimizeToTray: "關閉視窗時最小化到系統匣",
  clearLogs: "清除日誌",
  noLogs: "沒有符合目前篩選條件的結構化事件。",
  running: "執行中",
  offline: "離線",
  selectAll: "全選",
  structuredEvents: "結構化應用程式事件",
  filterByLevel: "依層級篩選事件",
  filterByDomain: "依領域篩選事件",
  allLevels: "全部層級",
  allDomains: "全部領域",
  errorDetails: "錯誤詳情",
  retryable: "可重試",
  yes: "是",
  no: "否",
  operationFailed: "操作失敗",
  environmentReady: "scrcpy 與 adb 已就緒。",
  launched: "scrcpy 已啟動。",
  stopped: "scrcpy 已停止。",
  configMigrated: "設定已遷移到安全的 V3 儲存（匯入/略過/無效）：",
  configLoadFailed: "無法載入主程序設定。",
  configSaveFailed: "無法儲存設定。",
  paired: "裝置配對成功。",
  connected: "裝置連接成功。",
  disconnected: "裝置已中斷。"
};
const ru = {
  devices: "Устройства",
  device: "Устройство",
  sessions: "Сеансы",
  settings: "Настройки",
  logs: "Журнал",
  runtimeSetup: "Среда выполнения",
  sessionCenter: "Центр сеансов",
  sessionsHint: "Каждый запуск имеет отдельный идентификатор и проверяемый жизненный цикл.",
  noSessions: "В этом запуске приложения ещё не было сеансов scrcpy.",
  stopAllSessions: "Остановить активные",
  sessionsStopFailed: "сеансов не удалось остановить.",
  sessionState_queued: "В очереди",
  sessionState_preflighting: "Проверка",
  sessionState_launching: "Запуск",
  sessionState_running: "Работает",
  sessionState_stopping: "Остановка",
  sessionState_stopped: "Остановлен",
  sessionState_failed: "Ошибка",
  runtimeHint: "Встроенные scrcpy и adb готовы к работе.",
  runtimeCapabilities: "Обнаружено",
  capabilitiesUnavailable: "Дополнительные возможности не обнаружены.",
  capabilityProbeFailed: "scrcpy доступен, но дополнительные возможности определить не удалось.",
  capability_screen: "Экран",
  capability_camera: "Камера",
  capability_virtualDisplay: "Виртуальный дисплей",
  capability_recordOnly: "Только запись",
  capability_controlOnly: "Только управление",
  capability_otg: "OTG",
  capability_v4l2: "V4L2",
  capability_appLaunch: "Запуск приложений",
  chooseScrcpy: "Выбрать scrcpy",
  recheck: "Проверить",
  ready: "Готово",
  notFound: "Не найдено",
  refresh: "Обновить",
  connectedDevices: "Подключённые устройства",
  noDevices: "Устройства не найдены. Подключите USB-отладку или используйте беспроводное сопряжение ниже.",
  tracker_starting: "Запуск отслеживания",
  tracker_tracking: "Устройства отслеживаются",
  tracker_restarting: "Перезапуск отслеживания",
  tracker_error: "Отслеживание недоступно",
  tracker_stopped: "Отслеживание остановлено",
  trackerLive: "поток ADB",
  trackerPolling: "резервный опрос",
  trackerFailed: "Не удалось запустить отслеживание устройств.",
  launchSelected: "Открыть выбранные",
  stop: "Остановить",
  disconnect: "Отключить",
  previewCommand: "Показать команду",
  commandPreview: "Предпросмотр команды",
  commandPreviewHint: "Точный argv для каждого выбранного устройства; аргументы не выполняются через shell.",
  commandPreviewFailed: "Не удалось создать предпросмотр команды.",
  close: "Закрыть",
  source_session: "Управляется сеансом",
  source_global: "Общие настройки",
  source_profile: "Профиль",
  sourceProfile: "Профиль",
  "source_device-override": "Настройка устройства",
  source_generated: "Создано автоматически",
  source_expert: "Экспертный аргумент",
  unauthorized: "Разрешите отладку на устройстве, затем обновите список.",
  wireless: "Беспроводная отладка",
  wirelessHint: "Android 11+: выполните сопряжение по адресу, порту и шестизначному коду с устройства, затем подключитесь через порт подключения.",
  address: "Хост или хост:порт",
  pairAddress: "Адрес сопряжения хост:порт",
  pairingCode: "6-значный код",
  connect: "Подключить",
  pair: "Сопрячь",
  general: "Общие",
  windowTitle: "Заголовок окна",
  shortcutModifier: "Модификатор сочетаний",
  shortcutHint: "Системное значение не перехватывает обычные Ctrl+X/C/V.",
  keyboardMode: "Режим клавиатуры",
  video: "Видео",
  bitRate: "Битрейт (Мбит/с)",
  maxSize: "Макс. размер (0 = авто)",
  maxFps: "Макс. FPS (0 = авто)",
  orientation: "Ориентация",
  codec: "Видеокодек",
  behavior: "Окно и устройство",
  alwaysOnTop: "Поверх других окон",
  control: "Управлять устройством",
  audio: "Передавать звук",
  turnScreenOff: "Выключить экран устройства",
  stayAwake: "Не выключать устройство",
  showTouches: "Показывать касания",
  fullscreen: "Полный экран",
  borderless: "Окно без рамки",
  recording: "Запись",
  recordEnabled: "Записывать сеанс",
  recordPath: "Файл записи",
  chooseFile: "Выбрать файл",
  noPlayback: "Записывать без окна просмотра",
  geometry: "Положение и обрезка",
  crop: "Обрезка (x / y / ширина / высота)",
  initialWindow: "Начальное окно (x / y / ширина / высота)",
  advanced: "Дополнительно",
  extraArgs: "Дополнительные аргументы scrcpy (один на строку)",
  extraArgsHint: "Аргументы передаются без оболочки. Управляемые GUI параметры запрещены, неизвестные сохраняются с предупреждением.",
  muteNotifications: "Отключить всплывающие уведомления",
  resetSettings: "Сбросить настройки",
  savedAutomatically: "Настройки сохраняются автоматически.",
  minimizeToTray: "Сворачивать в трей при закрытии окна",
  clearLogs: "Очистить журнал",
  noLogs: "Нет структурированных событий для выбранных фильтров.",
  openGithub: "GitHub",
  running: "Запущено",
  offline: "Не в сети",
  structuredEvents: "Структурированные события приложения",
  filterByLevel: "Фильтр по уровню",
  filterByDomain: "Фильтр по области",
  allLevels: "Все уровни",
  allDomains: "Все области",
  errorDetails: "Сведения об ошибке",
  retryable: "Можно повторить",
  yes: "Да",
  no: "Нет",
  usb: "USB",
  selectAll: "Выбрать все",
  operationFailed: "Операция не выполнена",
  environmentReady: "scrcpy и adb готовы.",
  configMigrated: "Настройки перенесены в защищённое хранилище V3 (импорт/пропуск/ошибка):",
  configLoadFailed: "Не удалось загрузить настройки.",
  configSaveFailed: "Не удалось сохранить настройки.",
  launched: "scrcpy запущен.",
  stopped: "scrcpy остановлен.",
  paired: "Устройство сопряжено.",
  connected: "Устройство подключено.",
  disconnected: "Устройство отключено."
};
const messages = { en, "zh-CN": zhCN, "zh-TW": zhTW, ru };
function translate(locale, key) {
  return messages[locale][key] || en[key] || key;
}
const _hoisted_1 = { class: "app-shell" };
const _hoisted_2 = { class: "topbar" };
const _hoisted_3 = {
  class: "tabs",
  "aria-label": "Main navigation"
};
const _hoisted_4 = ["onClick"];
const _hoisted_5 = {
  key: 0,
  class: "count"
};
const _hoisted_6 = {
  key: 1,
  class: "count"
};
const _hoisted_7 = { class: "top-actions" };
const _hoisted_8 = {
  key: 0,
  class: "runtime-card"
};
const _hoisted_9 = { class: "runtime-copy" };
const _hoisted_10 = { class: "eyebrow" };
const _hoisted_11 = { class: "muted" };
const _hoisted_12 = { class: "runtime-actions button-row nowrap" };
const _hoisted_13 = ["disabled"];
const _hoisted_14 = { class: "runtime-statuses" };
const _hoisted_15 = ["title"];
const _hoisted_16 = ["title"];
const _hoisted_17 = {
  key: 0,
  class: "runtime-capabilities"
};
const _hoisted_18 = { class: "runtime-capabilities-label" };
const _hoisted_19 = {
  key: 0,
  class: "muted"
};
const _hoisted_20 = {
  key: 1,
  class: "inline-warning runtime-capability-error"
};
const _hoisted_21 = { class: "section-heading" };
const _hoisted_22 = { class: "eyebrow" };
const _hoisted_23 = { class: "tracker-summary" };
const _hoisted_24 = { class: "button-row" };
const _hoisted_25 = ["disabled"];
const _hoisted_26 = ["disabled"];
const _hoisted_27 = ["disabled"];
const _hoisted_28 = ["disabled"];
const _hoisted_29 = { class: "panel scene-builder" };
const _hoisted_30 = { class: "panel-title scene-builder-title" };
const _hoisted_31 = { class: "eyebrow" };
const _hoisted_32 = { class: "muted" };
const _hoisted_33 = { class: "scene-step" };
const _hoisted_34 = ["aria-label"];
const _hoisted_35 = ["disabled", "onClick"];
const _hoisted_36 = {
  key: 0,
  class: "scene-probe"
};
const _hoisted_37 = { value: "" };
const _hoisted_38 = ["value"];
const _hoisted_39 = ["disabled"];
const _hoisted_40 = {
  key: 0,
  class: "capability-cache"
};
const _hoisted_41 = {
  key: 1,
  class: "probe-errors"
};
const _hoisted_42 = { class: "scene-form" };
const _hoisted_43 = {
  key: 0,
  class: "scene-form-card"
};
const _hoisted_44 = ["value"];
const _hoisted_45 = { class: "field-pair" };
const _hoisted_46 = {
  key: 1,
  class: "scene-form-card camera-wizard"
};
const _hoisted_47 = { key: 0 };
const _hoisted_48 = ["value"];
const _hoisted_49 = { value: "" };
const _hoisted_50 = ["value"];
const _hoisted_51 = {
  key: 1,
  class: "field-pair"
};
const _hoisted_52 = { value: "default" };
const _hoisted_53 = { value: "front" };
const _hoisted_54 = { value: "back" };
const _hoisted_55 = { value: "external" };
const _hoisted_56 = { class: "field-pair" };
const _hoisted_57 = { value: "" };
const _hoisted_58 = ["value"];
const _hoisted_59 = {
  key: 1,
  class: "number-row two"
};
const _hoisted_60 = { value: 0 };
const _hoisted_61 = ["value"];
const _hoisted_62 = { class: "field-pair" };
const _hoisted_63 = ["max"];
const _hoisted_64 = { key: 0 };
const _hoisted_65 = { value: "default" };
const _hoisted_66 = { value: "mic" };
const _hoisted_67 = { value: "mic-camcorder" };
const _hoisted_68 = { value: "output" };
const _hoisted_69 = { value: "playback" };
const _hoisted_70 = {
  key: 2,
  class: "toggle"
};
const _hoisted_71 = {
  key: 3,
  class: "v4l2-fields"
};
const _hoisted_72 = { class: "toggle" };
const _hoisted_73 = {
  key: 2,
  class: "scene-form-card"
};
const _hoisted_74 = { class: "preset-row" };
const _hoisted_75 = { id: "launchable-apps" };
const _hoisted_76 = ["value"];
const _hoisted_77 = { class: "field-triple" };
const _hoisted_78 = { class: "toggle-grid compact-grid" };
const _hoisted_79 = { class: "toggle" };
const _hoisted_80 = { class: "toggle" };
const _hoisted_81 = { class: "toggle" };
const _hoisted_82 = { class: "toggle" };
const _hoisted_83 = { value: "default" };
const _hoisted_84 = { value: "local" };
const _hoisted_85 = {
  key: 3,
  class: "scene-form-card"
};
const _hoisted_86 = { class: "recording-heading" };
const _hoisted_87 = { class: "button-row nowrap" };
const _hoisted_88 = ["disabled"];
const _hoisted_89 = ["disabled"];
const _hoisted_90 = {
  key: 0,
  class: "recording-status-list"
};
const _hoisted_91 = {
  class: "recording-status-label",
  role: "status"
};
const _hoisted_92 = ["title"];
const _hoisted_93 = ["aria-label"];
const _hoisted_94 = { class: "input-action" };
const _hoisted_95 = { class: "field-pair" };
const _hoisted_96 = { value: "default" };
const _hoisted_97 = { class: "toggle-grid compact-grid" };
const _hoisted_98 = { class: "toggle" };
const _hoisted_99 = { class: "toggle" };
const _hoisted_100 = {
  key: 4,
  class: "scene-form-card"
};
const _hoisted_101 = { key: 0 };
const _hoisted_102 = ["placeholder"];
const _hoisted_103 = { class: "field-triple" };
const _hoisted_104 = { value: "default" };
const _hoisted_105 = {
  key: 0,
  value: "sdk"
};
const _hoisted_106 = {
  key: 1,
  value: "uhid"
};
const _hoisted_107 = { value: "disabled" };
const _hoisted_108 = { value: "default" };
const _hoisted_109 = {
  key: 0,
  value: "sdk"
};
const _hoisted_110 = {
  key: 1,
  value: "uhid"
};
const _hoisted_111 = { value: "disabled" };
const _hoisted_112 = { value: "default" };
const _hoisted_113 = {
  key: 0,
  value: "uhid"
};
const _hoisted_114 = {
  key: 5,
  class: "scene-form-card media-options"
};
const _hoisted_115 = { class: "field-pair" };
const _hoisted_116 = { value: "default" };
const _hoisted_117 = { value: "" };
const _hoisted_118 = ["value"];
const _hoisted_119 = ["placeholder"];
const _hoisted_120 = { class: "field-pair" };
const _hoisted_121 = { value: "default" };
const _hoisted_122 = { value: "" };
const _hoisted_123 = ["value"];
const _hoisted_124 = ["placeholder"];
const _hoisted_125 = { class: "scene-builder-actions" };
const _hoisted_126 = { class: "button-row" };
const _hoisted_127 = ["disabled"];
const _hoisted_128 = ["disabled"];
const _hoisted_129 = {
  key: 0,
  class: "device-grid"
};
const _hoisted_130 = { class: "device-select" };
const _hoisted_131 = ["value", "disabled"];
const _hoisted_132 = { class: "device-copy" };
const _hoisted_133 = { class: "device-options" };
const _hoisted_134 = ["onUpdate:modelValue", "placeholder"];
const _hoisted_135 = ["value", "onChange"];
const _hoisted_136 = { value: "" };
const _hoisted_137 = ["value"];
const _hoisted_138 = { class: "device-auto" };
const _hoisted_139 = ["onUpdate:modelValue"];
const _hoisted_140 = { class: "device-footer" };
const _hoisted_141 = { class: "button-row nowrap" };
const _hoisted_142 = ["onClick"];
const _hoisted_143 = ["onClick"];
const _hoisted_144 = {
  key: 0,
  class: "inline-warning"
};
const _hoisted_145 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_146 = {
  key: 2,
  class: "panel command-preview"
};
const _hoisted_147 = { class: "panel-title" };
const _hoisted_148 = { class: "eyebrow" };
const _hoisted_149 = { class: "muted" };
const _hoisted_150 = { class: "command-preview-list" };
const _hoisted_151 = { class: "command-detail-list" };
const _hoisted_152 = {
  key: 3,
  class: "panel control-panel device-workspace"
};
const _hoisted_153 = { class: "panel-title" };
const _hoisted_154 = { class: "eyebrow" };
const _hoisted_155 = { class: "muted" };
const _hoisted_156 = ["disabled"];
const _hoisted_157 = { value: "" };
const _hoisted_158 = ["value"];
const _hoisted_159 = ["aria-label"];
const _hoisted_160 = ["disabled", "onClick"];
const _hoisted_161 = {
  key: 0,
  class: "workspace-pane overview-pane"
};
const _hoisted_162 = {
  key: 0,
  class: "muted"
};
const _hoisted_163 = { class: "overview-grid" };
const _hoisted_164 = { key: 0 };
const _hoisted_165 = {
  key: 1,
  class: "workspace-pane"
};
const _hoisted_166 = { class: "control-actions" };
const _hoisted_167 = ["disabled", "onClick"];
const _hoisted_168 = ["disabled"];
const _hoisted_169 = { key: 0 };
const _hoisted_170 = ["disabled"];
const _hoisted_171 = { key: 0 };
const _hoisted_172 = { class: "automation-bar" };
const _hoisted_173 = { class: "button-row nowrap" };
const _hoisted_174 = ["disabled"];
const _hoisted_175 = {
  key: 0,
  class: "inline-form automation-save"
};
const _hoisted_176 = ["placeholder"];
const _hoisted_177 = {
  key: 1,
  class: "saved-list"
};
const _hoisted_178 = { class: "button-row nowrap" };
const _hoisted_179 = ["disabled", "onClick"];
const _hoisted_180 = ["disabled", "onClick"];
const _hoisted_181 = {
  key: 2,
  class: "workspace-pane"
};
const _hoisted_182 = { class: "workspace-toolbar" };
const _hoisted_183 = ["placeholder"];
const _hoisted_184 = { class: "inline-check" };
const _hoisted_185 = ["disabled"];
const _hoisted_186 = {
  key: 0,
  class: "muted"
};
const _hoisted_187 = {
  key: 1,
  class: "app-list"
};
const _hoisted_188 = {
  key: 0,
  class: "app-badge"
};
const _hoisted_189 = ["onClick"];
const _hoisted_190 = {
  key: 2,
  class: "muted"
};
const _hoisted_191 = {
  key: 3,
  class: "workspace-pane"
};
const _hoisted_192 = { class: "workspace-target-summary" };
const _hoisted_193 = { class: "file-actions-grid" };
const _hoisted_194 = { class: "file-action-card" };
const _hoisted_195 = { value: "replace" };
const _hoisted_196 = { value: "skip" };
const _hoisted_197 = ["disabled"];
const _hoisted_198 = { class: "file-action-card" };
const _hoisted_199 = { class: "toggle" };
const _hoisted_200 = { class: "toggle warning-toggle" };
const _hoisted_201 = ["disabled"];
const _hoisted_202 = {
  key: 0,
  class: "batch-results"
};
const _hoisted_203 = { key: 0 };
const _hoisted_204 = { key: 0 };
const _hoisted_205 = {
  key: 1,
  class: "batch-results",
  "aria-live": "polite"
};
const _hoisted_206 = { key: 0 };
const _hoisted_207 = { class: "panel groups-panel" };
const _hoisted_208 = { class: "panel-title" };
const _hoisted_209 = { class: "muted" };
const _hoisted_210 = { class: "group-selection-count" };
const _hoisted_211 = { class: "group-editor" };
const _hoisted_212 = { value: "" };
const _hoisted_213 = ["value"];
const _hoisted_214 = { class: "button-row" };
const _hoisted_215 = {
  key: 0,
  class: "group-list"
};
const _hoisted_216 = { key: 0 };
const _hoisted_217 = { class: "group-serials" };
const _hoisted_218 = ["aria-label", "onClick"];
const _hoisted_219 = { class: "button-row" };
const _hoisted_220 = ["onClick"];
const _hoisted_221 = ["onClick"];
const _hoisted_222 = ["onClick"];
const _hoisted_223 = { class: "panel wireless-panel" };
const _hoisted_224 = { class: "panel-title" };
const _hoisted_225 = { class: "eyebrow" };
const _hoisted_226 = { class: "muted" };
const _hoisted_227 = { class: "wireless-grid" };
const _hoisted_228 = { class: "inline-form" };
const _hoisted_229 = ["placeholder"];
const _hoisted_230 = ["disabled"];
const _hoisted_231 = { class: "inline-form pair-form" };
const _hoisted_232 = ["placeholder"];
const _hoisted_233 = ["placeholder"];
const _hoisted_234 = ["disabled"];
const _hoisted_235 = {
  key: 0,
  class: "saved-targets"
};
const _hoisted_236 = ["onUpdate:modelValue", "aria-label"];
const _hoisted_237 = { class: "inline-check" };
const _hoisted_238 = ["onUpdate:modelValue"];
const _hoisted_239 = { class: "button-row nowrap" };
const _hoisted_240 = ["disabled", "onClick"];
const _hoisted_241 = ["onClick"];
const _hoisted_242 = { class: "automations-header" };
const _hoisted_243 = { class: "eyebrow" };
const _hoisted_244 = { class: "muted" };
const _hoisted_245 = { class: "button-row" };
const _hoisted_246 = ["disabled"];
const _hoisted_247 = {
  key: 0,
  class: "panel automation-import-preview"
};
const _hoisted_248 = { class: "panel-title" };
const _hoisted_249 = { class: "eyebrow" };
const _hoisted_250 = { class: "muted" };
const _hoisted_251 = { class: "compatibility-badge warn" };
const _hoisted_252 = { class: "import-step-list" };
const _hoisted_253 = { class: "toggle warning-toggle" };
const _hoisted_254 = { class: "button-row" };
const _hoisted_255 = ["disabled"];
const _hoisted_256 = { class: "automation-layout" };
const _hoisted_257 = { class: "panel automation-editor" };
const _hoisted_258 = { class: "panel-title" };
const _hoisted_259 = { class: "eyebrow" };
const _hoisted_260 = { class: "field-pair" };
const _hoisted_261 = { value: "any" };
const _hoisted_262 = { value: "portrait" };
const _hoisted_263 = { value: "landscape" };
const _hoisted_264 = { class: "step-builder" };
const _hoisted_265 = { value: "control" };
const _hoisted_266 = { value: "delay" };
const _hoisted_267 = { value: "tap" };
const _hoisted_268 = { value: "swipe" };
const _hoisted_269 = { value: "text" };
const _hoisted_270 = { value: "start-app" };
const _hoisted_271 = { value: "screenshot" };
const _hoisted_272 = { value: "assert-device" };
const _hoisted_273 = ["value"];
const _hoisted_274 = { value: "portrait" };
const _hoisted_275 = { value: "landscape" };
const _hoisted_276 = ["placeholder"];
const _hoisted_277 = {
  key: 0,
  class: "automation-step-list"
};
const _hoisted_278 = { class: "step-index" };
const _hoisted_279 = { class: "step-copy" };
const _hoisted_280 = { class: "step-inline-fields" };
const _hoisted_281 = ["onUpdate:modelValue"];
const _hoisted_282 = ["value"];
const _hoisted_283 = ["onUpdate:modelValue"];
const _hoisted_284 = ["onUpdate:modelValue"];
const _hoisted_285 = ["onUpdate:modelValue"];
const _hoisted_286 = ["onUpdate:modelValue"];
const _hoisted_287 = ["onUpdate:modelValue"];
const _hoisted_288 = ["onUpdate:modelValue"];
const _hoisted_289 = ["onUpdate:modelValue"];
const _hoisted_290 = ["onUpdate:modelValue"];
const _hoisted_291 = ["onUpdate:modelValue", "placeholder"];
const _hoisted_292 = ["onUpdate:modelValue"];
const _hoisted_293 = ["onUpdate:modelValue", "placeholder"];
const _hoisted_294 = ["onUpdate:modelValue"];
const _hoisted_295 = { value: "portrait" };
const _hoisted_296 = { value: "landscape" };
const _hoisted_297 = ["onUpdate:modelValue"];
const _hoisted_298 = ["onUpdate:modelValue"];
const _hoisted_299 = { class: "button-row nowrap" };
const _hoisted_300 = ["disabled", "onClick"];
const _hoisted_301 = ["disabled", "onClick"];
const _hoisted_302 = ["onClick"];
const _hoisted_303 = {
  key: 1,
  class: "muted"
};
const _hoisted_304 = { class: "button-row" };
const _hoisted_305 = { class: "panel automation-library" };
const _hoisted_306 = { class: "panel-title" };
const _hoisted_307 = { class: "eyebrow" };
const _hoisted_308 = {
  key: 0,
  class: "saved-list"
};
const _hoisted_309 = { key: 0 };
const _hoisted_310 = { class: "button-row" };
const _hoisted_311 = ["onClick"];
const _hoisted_312 = ["disabled", "onClick"];
const _hoisted_313 = ["onClick"];
const _hoisted_314 = {
  key: 1,
  class: "muted"
};
const _hoisted_315 = { class: "panel batch-console" };
const _hoisted_316 = { class: "panel-title" };
const _hoisted_317 = { class: "eyebrow" };
const _hoisted_318 = { class: "muted" };
const _hoisted_319 = { class: "batch-plan-controls" };
const _hoisted_320 = { value: "" };
const _hoisted_321 = ["value"];
const _hoisted_322 = { value: "launch" };
const _hoisted_323 = { value: "screenshot" };
const _hoisted_324 = { value: "start-app" };
const _hoisted_325 = { value: "control" };
const _hoisted_326 = { value: "automation" };
const _hoisted_327 = { value: "file-push" };
const _hoisted_328 = { value: "apk-install" };
const _hoisted_329 = { key: 0 };
const _hoisted_330 = ["value"];
const _hoisted_331 = { key: 1 };
const _hoisted_332 = { key: 2 };
const _hoisted_333 = { value: "" };
const _hoisted_334 = ["value"];
const _hoisted_335 = { value: "replace" };
const _hoisted_336 = { value: "skip" };
const _hoisted_337 = { class: "toggle" };
const _hoisted_338 = { class: "toggle warning-toggle" };
const _hoisted_339 = ["disabled"];
const _hoisted_340 = {
  key: 0,
  class: "preflight-table-wrap"
};
const _hoisted_341 = { class: "preflight-table" };
const _hoisted_342 = { class: "batch-confirmation" };
const _hoisted_343 = { class: "toggle" };
const _hoisted_344 = {
  key: 0,
  class: "toggle warning-toggle"
};
const _hoisted_345 = { class: "button-row" };
const _hoisted_346 = ["disabled"];
const _hoisted_347 = {
  key: 1,
  class: "active-batch"
};
const _hoisted_348 = {
  key: 2,
  class: "batch-report"
};
const _hoisted_349 = { class: "batch-report-summary" };
const _hoisted_350 = { class: "batch-results" };
const _hoisted_351 = { key: 0 };
const _hoisted_352 = {
  key: 3,
  class: "batch-event-log"
};
const _hoisted_353 = { class: "sessions-header" };
const _hoisted_354 = { class: "eyebrow" };
const _hoisted_355 = { class: "muted" };
const _hoisted_356 = ["disabled"];
const _hoisted_357 = {
  key: 0,
  class: "session-list"
};
const _hoisted_358 = { class: "session-summary" };
const _hoisted_359 = { class: "session-device" };
const _hoisted_360 = { class: "session-meta" };
const _hoisted_361 = { key: 0 };
const _hoisted_362 = ["disabled", "onClick"];
const _hoisted_363 = { class: "session-command" };
const _hoisted_364 = {
  key: 0,
  class: "session-error"
};
const _hoisted_365 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_366 = { class: "artifacts-header" };
const _hoisted_367 = { class: "eyebrow" };
const _hoisted_368 = { class: "muted" };
const _hoisted_369 = { class: "artifact-filters" };
const _hoisted_370 = ["aria-label"];
const _hoisted_371 = { value: "all" };
const _hoisted_372 = ["value"];
const _hoisted_373 = ["aria-label"];
const _hoisted_374 = { value: "all" };
const _hoisted_375 = ["value"];
const _hoisted_376 = ["disabled"];
const _hoisted_377 = {
  key: 0,
  class: "artifact-list"
};
const _hoisted_378 = { class: "artifact-icon" };
const _hoisted_379 = { class: "artifact-copy" };
const _hoisted_380 = { class: "artifact-title" };
const _hoisted_381 = { class: "artifact-actions" };
const _hoisted_382 = ["disabled", "onClick"];
const _hoisted_383 = ["disabled", "onClick"];
const _hoisted_384 = ["disabled", "onClick"];
const _hoisted_385 = ["disabled", "onClick"];
const _hoisted_386 = ["onClick"];
const _hoisted_387 = ["disabled", "onClick"];
const _hoisted_388 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_389 = { class: "settings-header" };
const _hoisted_390 = { class: "muted" };
const _hoisted_391 = ["aria-label"];
const _hoisted_392 = ["onClick"];
const _hoisted_393 = { class: "settings-grid" };
const _hoisted_394 = {
  key: 0,
  class: "panel settings-section wide profiles-section"
};
const _hoisted_395 = { class: "profile-section-heading" };
const _hoisted_396 = ["disabled"];
const _hoisted_397 = { class: "muted" };
const _hoisted_398 = { class: "inline-form" };
const _hoisted_399 = ["placeholder"];
const _hoisted_400 = {
  key: 0,
  class: "profile-import-preview"
};
const _hoisted_401 = { class: "profile-import-title" };
const _hoisted_402 = { key: 0 };
const _hoisted_403 = {
  key: 1,
  class: "machine-paths"
};
const _hoisted_404 = { class: "toggle warning-toggle" };
const _hoisted_405 = {
  key: 2,
  class: "import-conflict"
};
const _hoisted_406 = { class: "button-row" };
const _hoisted_407 = ["disabled"];
const _hoisted_408 = {
  key: 1,
  class: "saved-list"
};
const _hoisted_409 = ["value", "aria-label", "onChange"];
const _hoisted_410 = { class: "profile-summary" };
const _hoisted_411 = { key: 0 };
const _hoisted_412 = { class: "button-row profile-actions" };
const _hoisted_413 = ["onClick"];
const _hoisted_414 = ["onClick"];
const _hoisted_415 = ["disabled", "onClick"];
const _hoisted_416 = ["onClick"];
const _hoisted_417 = {
  key: 1,
  class: "panel settings-section wide"
};
const _hoisted_418 = { class: "field-pair" };
const _hoisted_419 = {
  key: 2,
  class: "panel settings-section wide"
};
const _hoisted_420 = { class: "field-pair" };
const _hoisted_421 = { class: "field-pair" };
const _hoisted_422 = { class: "field-pair" };
const _hoisted_423 = {
  key: 3,
  class: "panel settings-section wide"
};
const _hoisted_424 = { class: "toggle-grid" };
const _hoisted_425 = { class: "toggle" };
const _hoisted_426 = { class: "toggle" };
const _hoisted_427 = { class: "toggle" };
const _hoisted_428 = { class: "toggle" };
const _hoisted_429 = { class: "toggle" };
const _hoisted_430 = { class: "toggle" };
const _hoisted_431 = { class: "toggle" };
const _hoisted_432 = { class: "toggle" };
const _hoisted_433 = { class: "toggle" };
const _hoisted_434 = { class: "toggle" };
const _hoisted_435 = {
  key: 4,
  class: "panel settings-section wide"
};
const _hoisted_436 = { class: "toggle" };
const _hoisted_437 = { class: "toggle" };
const _hoisted_438 = ["disabled"];
const _hoisted_439 = { key: 0 };
const _hoisted_440 = { class: "input-action" };
const _hoisted_441 = ["disabled"];
const _hoisted_442 = ["disabled"];
const _hoisted_443 = { key: 1 };
const _hoisted_444 = { class: "input-action" };
const _hoisted_445 = ["disabled"];
const _hoisted_446 = ["disabled"];
const _hoisted_447 = { class: "toggle" };
const _hoisted_448 = ["disabled"];
const _hoisted_449 = {
  key: 5,
  class: "panel settings-section wide"
};
const _hoisted_450 = { class: "number-row" };
const _hoisted_451 = { class: "number-row" };
const _hoisted_452 = {
  key: 6,
  class: "panel settings-section wide"
};
const _hoisted_453 = { class: "field-pair" };
const _hoisted_454 = { class: "toggle" };
const _hoisted_455 = { class: "toggle" };
const _hoisted_456 = { class: "toggle" };
const _hoisted_457 = { class: "boss-key-row" };
const _hoisted_458 = { class: "toggle" };
const _hoisted_459 = ["disabled"];
const _hoisted_460 = { class: "logs-header" };
const _hoisted_461 = { class: "eyebrow" };
const _hoisted_462 = { class: "logs-actions" };
const _hoisted_463 = ["aria-label"];
const _hoisted_464 = { value: "all" };
const _hoisted_465 = ["value"];
const _hoisted_466 = ["aria-label"];
const _hoisted_467 = { value: "all" };
const _hoisted_468 = ["value"];
const _hoisted_469 = ["disabled"];
const _hoisted_470 = {
  key: 0,
  class: "panel diagnostic-preview"
};
const _hoisted_471 = { class: "panel-title" };
const _hoisted_472 = { class: "eyebrow" };
const _hoisted_473 = { class: "muted" };
const _hoisted_474 = { class: "diagnostic-size" };
const _hoisted_475 = { class: "diagnostic-grid" };
const _hoisted_476 = { class: "diagnostic-files" };
const _hoisted_477 = { class: "diagnostic-redactions" };
const _hoisted_478 = {
  key: 0,
  class: "redaction-pills"
};
const _hoisted_479 = {
  key: 1,
  class: "muted"
};
const _hoisted_480 = { class: "diagnostic-actions" };
const _hoisted_481 = ["disabled"];
const _hoisted_482 = {
  key: 1,
  class: "muted"
};
const _hoisted_483 = { class: "terminal" };
const _hoisted_484 = {
  key: 0,
  class: "muted"
};
const _hoisted_485 = { class: "log-entry" };
const _hoisted_486 = {
  key: 0,
  class: "log-context"
};
const _hoisted_487 = {
  key: 1,
  class: "error-details"
};
const _hoisted_488 = { key: 0 };
const _hoisted_489 = { key: 1 };
const _hoisted_490 = {
  class: "toast-stack",
  "aria-live": "polite"
};
const STORAGE_KEY = "ultimate-scrcpy:config:v2";
const MIGRATION_KEY = "ultimate-scrcpy:config:v3-migrated";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppV2",
  setup(__props) {
    const controlActions = [
      "back",
      "home",
      "app-switch",
      "menu",
      "volume-down",
      "volume-up",
      "power",
      "screen-off",
      "screen-on",
      "rotate",
      "auto-rotate",
      "show-touches-on",
      "show-touches-off"
    ];
    function detectedLocale() {
      const locale = navigator.language.toLowerCase();
      if (locale.includes("zh-tw") || locale.includes("zh-hk")) return "zh-TW";
      if (locale.startsWith("ru")) return "ru";
      return locale.startsWith("zh") ? "zh-CN" : "en";
    }
    function loadLegacyConfig() {
      try {
        return legacyConfigView(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"), detectedLocale());
      } catch {
        return defaultPersistedConfig(detectedLocale());
      }
    }
    const config = /* @__PURE__ */ reactive(loadLegacyConfig());
    const activeTab = /* @__PURE__ */ ref("devices");
    const sidebarCollapsed = /* @__PURE__ */ ref(false);
    const dragActive = /* @__PURE__ */ ref(false);
    const qrModal = /* @__PURE__ */ ref(false);
    const qrInfo = /* @__PURE__ */ ref(null);
    const qrBusy = /* @__PURE__ */ ref(false);
    const qrStatus = /* @__PURE__ */ ref("");
    const activeSettingsSection = /* @__PURE__ */ ref("general");
    const version2 = /* @__PURE__ */ ref("1.0.0-alpha");
    const environment = /* @__PURE__ */ ref(null);
    const updateInfo = /* @__PURE__ */ ref({ checking: false, applying: false, items: [], lastCheck: null, error: "" });
    const updateConfirmOpen = /* @__PURE__ */ ref(false);
    const updateDontShowAgain = /* @__PURE__ */ ref(false);
    const updatesAvailable = computed(() => updateInfo.value.items.some((item) => item.available));
    const devices = /* @__PURE__ */ ref([]);
    const selectedSerials = /* @__PURE__ */ ref([]);
    const commandPreviews = /* @__PURE__ */ ref([]);
    const sessions = /* @__PURE__ */ ref([]);
    const recordingBusy = /* @__PURE__ */ ref(false);
    const recordingClock = /* @__PURE__ */ ref(Date.now());
    let recordingTimer;
    const backgroundRecordings = computed(() => sessions.value.filter((session) => session.scene === "record-only" && sessionIsActive(session)));
    const canStartRecording = computed(() => Boolean(environment.value?.scrcpy.ok && selectedSerials.value.length && config.launch.recordDirectory.trim() && (config.launch.recordVideo || config.launch.recordAudio) && !recordingBusy.value && !backgroundRecordings.value.some((session) => selectedSerials.value.includes(session.serialAtLaunch))));
    const artifacts = /* @__PURE__ */ ref([]);
    const artifactKind = /* @__PURE__ */ ref("all");
    const artifactDevice = /* @__PURE__ */ ref("all");
    const loadingArtifacts = /* @__PURE__ */ ref(false);
    const diagnosticPreview = /* @__PURE__ */ ref(null);
    const preparingDiagnostics = /* @__PURE__ */ ref(false);
    const diagnosticArtifact = /* @__PURE__ */ ref(null);
    const activeSerials = /* @__PURE__ */ ref(/* @__PURE__ */ new Set());
    const loadingEnvironment = /* @__PURE__ */ ref(false);
    const loadingDevices = /* @__PURE__ */ ref(false);
    const wirelessTarget = /* @__PURE__ */ ref(config.wirelessTargets[0]?.address || "");
    const pairTarget = /* @__PURE__ */ ref("");
    const pairingCode = /* @__PURE__ */ ref("");
    const profileName = /* @__PURE__ */ ref("");
    const profileImportPreview = /* @__PURE__ */ ref(null);
    const profileImportStrategy = /* @__PURE__ */ ref("duplicate");
    const keepImportedPaths = /* @__PURE__ */ ref(false);
    const profileTransferBusy = /* @__PURE__ */ ref(false);
    const probeSerial = /* @__PURE__ */ ref("");
    const deviceCapabilities = /* @__PURE__ */ ref(null);
    const deviceSdkVersions = /* @__PURE__ */ ref({});
    const probingCapabilities = /* @__PURE__ */ ref(false);
    const otgUsbSerial = /* @__PURE__ */ ref("");
    const controlSerial = /* @__PURE__ */ ref("");
    const workspaceSection = /* @__PURE__ */ ref("overview");
    const deviceOverview = /* @__PURE__ */ ref(null);
    const loadingOverview = /* @__PURE__ */ ref(false);
    const installedApps = /* @__PURE__ */ ref([]);
    const loadingApps = /* @__PURE__ */ ref(false);
    const appSearch = /* @__PURE__ */ ref("");
    const showSystemApps = /* @__PURE__ */ ref(false);
    const fileTarget = /* @__PURE__ */ ref(config.launch.pushTarget || "/sdcard/Download/");
    const fileConflict = /* @__PURE__ */ ref("replace");
    const installReplace = /* @__PURE__ */ ref(true);
    const installDowngrade = /* @__PURE__ */ ref(false);
    const workspaceBusy = /* @__PURE__ */ ref(false);
    const workspaceResults = /* @__PURE__ */ ref([]);
    const workspaceProgress = /* @__PURE__ */ ref([]);
    const recordingAutomation = /* @__PURE__ */ ref(false);
    const recordedSteps = /* @__PURE__ */ ref([]);
    const automationName = /* @__PURE__ */ ref("");
    const replayingAutomation = /* @__PURE__ */ ref("");
    const groupName = /* @__PURE__ */ ref("");
    const groupDescription = /* @__PURE__ */ ref("");
    const groupProfileId = /* @__PURE__ */ ref("");
    const groupConcurrency = /* @__PURE__ */ ref(3);
    const editingGroupId = /* @__PURE__ */ ref("");
    const selectedGroupId = /* @__PURE__ */ ref("");
    const batchActionType = /* @__PURE__ */ ref("launch");
    const batchControlAction = /* @__PURE__ */ ref("home");
    const batchPackageId = /* @__PURE__ */ ref("");
    const batchAutomationId = /* @__PURE__ */ ref("");
    const batchPreflight = /* @__PURE__ */ ref(null);
    const batchPassingOnly = /* @__PURE__ */ ref(true);
    const batchDangerousConfirmed = /* @__PURE__ */ ref(false);
    const batchBusy = /* @__PURE__ */ ref(false);
    const activeBatchRunId = /* @__PURE__ */ ref("");
    const batchRunEvents = /* @__PURE__ */ ref([]);
    const batchRunReport = /* @__PURE__ */ ref(null);
    const automationImportPreview = /* @__PURE__ */ ref(null);
    const automationImportConfirmed = /* @__PURE__ */ ref(false);
    const automationTransferBusy = /* @__PURE__ */ ref(false);
    const automationDraft = /* @__PURE__ */ ref({
      id: "",
      name: "",
      description: "",
      schemaVersion: 2,
      design: { orientation: "any", aspectRatio: 0 },
      steps: []
    });
    const newStepType = /* @__PURE__ */ ref("control");
    const newStepControl = /* @__PURE__ */ ref("home");
    const newStepNumberA = /* @__PURE__ */ ref(0.5);
    const newStepNumberB = /* @__PURE__ */ ref(0.5);
    const newStepNumberC = /* @__PURE__ */ ref(0.8);
    const newStepNumberD = /* @__PURE__ */ ref(0.8);
    const newStepDuration = /* @__PURE__ */ ref(300);
    const newStepText = /* @__PURE__ */ ref("");
    const bootSerial = /* @__PURE__ */ ref("");
    const toolkitSerial = /* @__PURE__ */ ref("");
    const toolkitCommand = /* @__PURE__ */ ref("");
    const toolkitOutput = /* @__PURE__ */ ref("");
    const toolkitBusy = /* @__PURE__ */ ref(false);
    const logs = /* @__PURE__ */ ref([]);
    const logLevel = /* @__PURE__ */ ref("all");
    const logDomain = /* @__PURE__ */ ref("all");
    const toasts = /* @__PURE__ */ ref([]);
    let toastId = 0;
    let removeStatusListener;
    let removeSessionListener;
    let removeDeviceListener;
    let removeAppEventListener;
    let removeBatchProgressListener;
    let removeBatchRunListener;
    let removeScreenshotShortcutListener;
    let removeControlShortcutListener;
    let removeTrayStartListener;
    let lastRecordedActionAt = 0;
    let configRevision = 0;
    let configReady = false;
    let configSaveInFlight = false;
    let configSavePending = false;
    const autoLaunchAttempted = /* @__PURE__ */ new Set();
    const trackerStatus = /* @__PURE__ */ ref("stopped");
    const trackerSource = /* @__PURE__ */ ref("track");
    const t = (key) => translate(config.locale, key);
    watch(() => config.theme, (theme) => {
      document.documentElement.dataset.theme = theme || "light";
    }, { immediate: true });
    watch(() => config.accentScheme, (scheme) => {
      if (scheme) document.documentElement.dataset.accent = scheme;
    }, { immediate: true });
    watch(() => config.accentReversed, (reversed) => {
      if (reversed) document.documentElement.dataset.accentReversed = "true";
      else delete document.documentElement.dataset.accentReversed;
    }, { immediate: true });
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const runtimeVersion = (binary) => {
      const value = environment.value?.[binary].version || "";
      const match = binary === "scrcpy" ? value.match(/^scrcpy\s+([^\s]+)/i) : value.match(/\bversion\s+([^\s]+)/i);
      return match?.[1] || value || t("notFound");
    };
    const usableDevices = computed(() => devices.value.filter((device) => device.state === "device"));
    const legacyWirelessDevice = computed(() => {
      const selected = selectedSerials.value
        .map((serial) => devices.value.find((item) => item.serial === serial))
        .filter((device) => device && device.state === "device" && device.connection === "usb");
      for (const device of selected) {
        const entry = deviceSdkVersions.value[device.serial];
        if (entry && Number.isFinite(entry.sdk) && entry.sdk <= 29) return device;
      }
      return null;
    });
    const legacyWirelessHintText = computed(() => {
      if (legacyWirelessDevice.value) {
        const entry = deviceSdkVersions.value[legacyWirelessDevice.value.serial];
        const version = entry?.release ? `${entry.release} (API ${entry.sdk})` : entry ? String(entry.sdk) : "10-";
        return t("legacyWirelessReadyHint").replace("{version}", version);
      }
      if (selectedSerials.value.length === 0) return t("legacyWirelessSelectHint");
      const selectedDevices = selectedSerials.value
        .map((serial) => devices.value.find((item) => item.serial === serial))
        .filter((device) => device && device.state === "device");
      if (selectedDevices.length === 0) return t("legacyWirelessSelectHint");
      if (selectedDevices.some((device) => device.connection !== "usb")) return t("legacyWirelessUsbHint");
      const tooNew = selectedDevices.find((device) => {
        const entry = deviceSdkVersions.value[device.serial];
        return entry && Number.isFinite(entry.sdk) && entry.sdk > 29;
      });
      if (tooNew) {
        const entry = deviceSdkVersions.value[tooNew.serial];
        const version = entry.release ? `${entry.release} (API ${entry.sdk})` : String(entry.sdk);
        return t("legacyWirelessTooNewHint").replace("{version}", version);
      }
      return t("legacyWirelessSelectHint");
    });
    const allSelected = computed(
      () => usableDevices.value.length > 0 && usableDevices.value.every((device) => selectedSerials.value.includes(device.serial))
    );
    const controlDevice = computed(() => devices.value.find((device) => device.serial === controlSerial.value));
    const workspaceTargets = computed(() => {
      const available = new Set(usableDevices.value.map((device) => device.serial));
      const selected = selectedSerials.value.filter((serial) => available.has(serial));
      return selected.length ? selected : controlSerial.value ? [controlSerial.value] : [];
    });
    const selectedGroup = computed(() => config.groups.find((group) => group.id === selectedGroupId.value));
    const batchTargetSerials = computed(() => {
      const group = selectedGroup.value;
      return group ? [...group.serials] : [...selectedSerials.value];
    });
    const batchAutomation = computed(() => config.automations.find((automation) => automation.id === batchAutomationId.value));
    const passingBatchTargets = computed(() => batchPreflight.value?.items.filter((item) => item.eligible).length || 0);
    const visibleApps = computed(() => {
      const query = appSearch.value.trim().toLocaleLowerCase();
      return installedApps.value.filter((item) => item.launchable && (showSystemApps.value || !item.system) && (!query || item.packageId.toLocaleLowerCase().includes(query) || item.label.toLocaleLowerCase().includes(query)));
    });
    const settingsSections = ["general", "video", "controls", "recording", "geometry", "advanced"];
    const capabilityFeatureKeys = [
      "screen",
      "camera",
      "virtualDisplay",
      "recordOnly",
      "controlOnly",
      "otg",
      "v4l2",
      "appLaunch"
    ];
    const availableCapabilities = computed(() => {
      const features = environment.value?.scrcpy.capabilities?.features;
      return features ? capabilityFeatureKeys.filter((feature) => features[feature]) : [];
    });
    const sceneKinds = ["screen", "camera", "virtual-display", "record-only", "control-only", "otg"];
    const sceneFeature = {
      screen: "screen",
      camera: "camera",
      "virtual-display": "virtualDisplay",
      "record-only": "recordOnly",
      "control-only": "controlOnly",
      otg: "otg"
    };
    const selectedCamera = computed(
      () => deviceCapabilities.value?.cameras.find((camera) => camera.id === config.launch.cameraId)
    );
    const cameraSizes = computed(() => selectedCamera.value?.sizes.filter(
      (size) => size.highSpeed === config.launch.cameraHighSpeed
    ) || []);
    const cameraFpsOptions = computed(() => {
      const selectedSize = cameraSizes.value.find(
        (size) => size.width === config.launch.cameraSize.width && size.height === config.launch.cameraSize.height
      );
      return selectedSize?.fps.length ? selectedSize.fps : selectedCamera.value?.fps || [];
    });
    const cameraSizeValue = computed({
      get: () => config.launch.cameraSize.width ? `${config.launch.cameraSize.width}x${config.launch.cameraSize.height}` : "",
      set: (value) => {
        const match = value.match(/^(\d+)x(\d+)$/);
        config.launch.cameraSize = match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 0, height: 0 };
      }
    });
    const visualScene = computed(() => ["screen", "camera", "virtual-display", "record-only"].includes(config.launch.scene));
    const visibleLogs = computed(() => logs.value.filter(
      (event) => (logLevel.value === "all" || event.level === logLevel.value) && (logDomain.value === "all" || event.domain === logDomain.value)
    ));
    const visibleArtifacts = computed(() => artifacts.value.filter(
      (artifact) => (artifactKind.value === "all" || artifact.kind === artifactKind.value) && (artifactDevice.value === "all" || artifact.deviceId === artifactDevice.value)
    ));
    const artifactKinds = ["screenshot", "recording", "transfer-report", "diagnostic"];
    const artifactDevices = computed(() => [...new Set(artifacts.value.map((artifact) => artifact.deviceId).filter(Boolean))]);
    const eventLevels = ["debug", "info", "warn", "error"];
    const eventDomains = ["runtime", "device", "session", "config", "automation", "artifact", "update"];
    const runtimeSnapshot = () => ({ scrcpyPath: config.runtime.scrcpyPath });
    const launchSnapshot = (serial) => launchForDevice(/* @__PURE__ */ toRaw(config), serial);
    async function persistConfig() {
      if (!configReady) return;
      if (configSaveInFlight) {
        configSavePending = true;
        return;
      }
      configSaveInFlight = true;
      const snapshot = structuredClone(/* @__PURE__ */ toRaw(config));
      const result = await window.scrcpy.saveConfig(configRevision, snapshot);
      if (result.ok && result.data) configRevision = result.data.revision;
      else toast("error", operationErrorMessage(result, t("configSaveFailed")));
      configSaveInFlight = false;
      if (configSavePending) {
        configSavePending = false;
        await persistConfig();
      }
    }
    watch(
      config,
      () => void persistConfig(),
      { deep: true }
    );
    watch(
      [selectedSerials, () => config.launch, () => config.profiles, () => config.deviceProfiles, () => config.deviceAliases],
      () => {
        commandPreviews.value = [];
      },
      { deep: true }
    );
    watch(
      [selectedGroupId, batchActionType, batchControlAction, batchPackageId, batchAutomationId, () => config.groups, () => config.automations],
      () => {
        batchPreflight.value = null;
        batchDangerousConfirmed.value = false;
      },
      { deep: true }
    );
    watch(
      () => config.minimizeToTray,
      (enabled) => {
        if (configReady) void window.scrcpy.setMinimizeToTray(enabled);
      }
    );
    watch(
      [() => config.killAdbOnQuit, () => config.runtime.scrcpyPath],
      () => {
        if (configReady) void window.scrcpy.setQuitBehavior(runtimeSnapshot(), config.killAdbOnQuit);
      }
    );
    watch(
      () => config.bossKeyEnabled,
      () => {
        if (configReady) void applyBossKey(true);
      }
    );
    watch(usableDevices, (nextDevices) => {
      if (!nextDevices.some((device) => device.serial === controlSerial.value)) {
        controlSerial.value = nextDevices[0]?.serial || "";
      }
    });
    watch([selectedSerials, usableDevices], () => {
      const available = new Set(usableDevices.value.map((device) => device.serial));
      if (!available.has(probeSerial.value)) {
        probeSerial.value = selectedSerials.value.find((serial) => available.has(serial)) || usableDevices.value[0]?.serial || "";
      }
    });
    watch([selectedSerials, devices], async () => {
      for (const serial of selectedSerials.value) {
        if (deviceSdkVersions.value[serial] != null) continue;
        const device = devices.value.find((item) => item.serial === serial);
        if (!device || device.connection !== "usb") continue;
        const result = await window.scrcpy.deviceSdk(runtimeSnapshot(), serial);
        if (result.ok && result.data && Number.isFinite(Number(result.data.sdk))) {
          deviceSdkVersions.value[serial] = { sdk: Number(result.data.sdk), release: String(result.data.release || "") };
        }
      }
    }, { immediate: true });
    watch(probeSerial, () => {
      deviceCapabilities.value = null;
    });
    watch(() => config.launch.cameraHighSpeed, () => {
      config.launch.cameraSize = { width: 0, height: 0 };
      config.launch.cameraFps = 0;
    });
    watch(() => config.launch.recordVideo, (enabled) => {
      if (enabled && !["default", "mp4", "mkv"].includes(config.launch.recordFormat)) config.launch.recordFormat = "default";
    });
    watch(controlSerial, () => {
      deviceOverview.value = null;
      installedApps.value = [];
      workspaceResults.value = [];
      if (controlSerial.value) void loadDeviceOverview();
    });
    watch(activeTab, (tab) => {
      if (tab === "artifacts") void loadArtifacts();
    });
    function toast(kind, message) {
      if (config.muteNotifications) return;
      const id = ++toastId;
      toasts.value.push({ id, kind, message });
      window.setTimeout(() => {
        toasts.value = toasts.value.filter((item) => item.id !== id);
      }, kind === "error" ? 6e3 : 2800);
    }
    async function refreshEnvironment(notify = false) {
      loadingEnvironment.value = true;
      environment.value = await window.scrcpy.getEnvironment(runtimeSnapshot());
      loadingEnvironment.value = false;
      if (notify && environment.value.scrcpy.ok && environment.value.adb.ok) toast("success", t("environmentReady"));
    }
    async function checkForUpdates(manual = true) {
      if (updateInfo.value.checking) return;
      updateInfo.value.checking = true;
      updateInfo.value.error = "";
      try {
        const result = await window.scrcpy.checkForUpdates(runtimeSnapshot());
        if (!result?.ok) throw new Error(result?.error || "Update check failed.");
        updateInfo.value.items = result.data || [];
        updateInfo.value.lastCheck = Date.now();
        if (manual) toast("success", updatesAvailable.value ? t("updatesAvailable") : t("noUpdates"));
      } catch (error) {
        updateInfo.value.error = error instanceof Error ? error.message : String(error);
        if (manual) toast("error", `${t("updateCheckFailed")} ${updateInfo.value.error}`);
      } finally {
        updateInfo.value.checking = false;
      }
    }
    function onUpdateClick() {
      if (updateInfo.value.checking || updateInfo.value.applying) return;
      if (updatesAvailable.value) {
        if (config.update.skipConfirmation) void applyUpdates();
        else {
          updateDontShowAgain.value = config.update.skipConfirmation;
          updateConfirmOpen.value = true;
        }
      } else {
        void checkForUpdates(true);
      }
    }
    async function applyUpdates() {
      if (updateInfo.value.applying) return;
      updateInfo.value.applying = true;
      updateConfirmOpen.value = false;
      try {
        const items = updateInfo.value.items.filter((item) => item.available).map((item) => ({
          id: item.id,
          name: item.name,
          installed: item.installed,
          latest: item.latest,
          available: item.available,
          url: item.url,
          assetUrl: item.assetUrl
        }));
        const result = await window.scrcpy.applyUpdates(runtimeSnapshot(), items);
        if (!result?.ok) throw new Error(result?.error || "Update failed.");
        if (config.update.skipConfirmation !== updateDontShowAgain.value) config.update.skipConfirmation = updateDontShowAgain.value;
        const results = result.data || [];
        const failures = results.filter((item) => !item.ok);
        const appPath = results.find((item) => item.id === "app" && item.path)?.path || "";
        if (failures.length) toast("error", `${t("updateFailed")} ${failures.map((item) => `${item.id}: ${item.error || "failed"}`).join("; ")}`);
        else if (appPath) toast("success", t("appUpdateDownloaded").replace("{path}", appPath));
        else toast("success", t("updatesApplied"));
        await refreshEnvironment();
        await checkForUpdates(false);
      } catch (error) {
        toast("error", `${t("updateFailed")} ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        updateInfo.value.applying = false;
      }
    }
    async function chooseScrcpy() {
      const path = await window.scrcpy.chooseScrcpy();
      if (!path) return;
      config.runtime.scrcpyPath = path;
      await refreshEnvironment(true);
      await refreshDevices();
      await startTrackingDevices();
    }
    async function refreshDevices(notifyError = false) {
      if (loadingDevices.value) return;
      loadingDevices.value = true;
      const result = await window.scrcpy.listDevices(runtimeSnapshot());
      loadingDevices.value = false;
      if (!result.ok) {
        devices.value = [];
        if (notifyError) toast("error", operationErrorMessage(result, t("operationFailed")));
        return;
      }
      await applyDeviceSnapshot(result.data || []);
    }
    async function applyDeviceSnapshot(nextDevices) {
      devices.value = [...new Map(nextDevices.map((device) => [device.serial, device])).values()];
      const available = new Set(devices.value.map((device) => device.serial));
      selectedSerials.value = selectedSerials.value.filter((serial) => available.has(serial));
      for (const serial of autoLaunchAttempted) {
        if (!available.has(serial)) autoLaunchAttempted.delete(serial);
      }
      if (config.autoSelectFirstDevice && !selectedSerials.value.length) {
        const first = devices.value.find((device) => device.state === "device");
        if (first) selectedSerials.value = [first.serial];
      }
      if (environment.value?.scrcpy.ok) {
        for (const device of devices.value.filter((item) => item.state === "device" && config.autoLaunchDevices[item.serial])) {
          if (autoLaunchAttempted.has(device.serial) || activeSerials.value.has(device.serial)) continue;
          const launch = launchSnapshot(device.serial);
          if (launch.scene === "otg") continue;
          autoLaunchAttempted.add(device.serial);
          const startResult = await window.scrcpy.start(runtimeSnapshot(), [{ serial: device.serial, launch }]);
          if (!startResult.ok) toast("error", operationErrorMessage(startResult, t("operationFailed")));
        }
      }
    }
    async function handleDeviceEvent(event) {
      trackerStatus.value = event.status;
      trackerSource.value = event.source;
      if (event.status === "tracking" && event.revision > 0) await applyDeviceSnapshot(event.devices);
    }
    async function startTrackingDevices() {
      const result = await window.scrcpy.trackDevices(runtimeSnapshot());
      if (!result.ok) {
        trackerStatus.value = "error";
        toast("error", operationErrorMessage(result, t("trackerFailed")));
        return;
      }
      await applyDeviceSnapshot(result.data || []);
    }
    function handleVisibilityChange() {
      void window.scrcpy.setDeviceTrackerVisibility(!document.hidden);
    }
    function toggleSelectAll() {
      selectedSerials.value = allSelected.value ? [] : usableDevices.value.map((device) => device.serial);
    }
    watch(() => backgroundRecordings.value.length, (count) => {
      recordingClock.value = Date.now();
      if (count && !recordingTimer) {
        recordingTimer = setInterval(() => {
          recordingClock.value = Date.now();
        }, 1e3);
      } else if (!count && recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = void 0;
      }
    });
    function recordingDuration(session) {
      const started = Date.parse(session.startedAt || session.createdAt);
      const seconds = Number.isFinite(started) ? Math.max(0, Math.floor((recordingClock.value - started) / 1e3)) : 0;
      return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((value) => String(value).padStart(2, "0")).join(":");
    }
    async function startRecording() {
      if (!canStartRecording.value) return;
      recordingBusy.value = true;
      try {
        const launches = selectedSerials.value.map((serial) => ({ serial, launch: launchSnapshot(serial) }));
        const result = await window.scrcpy.start(runtimeSnapshot(), launches);
        if (!result.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
      } catch (error) {
        toast("error", String(error));
      } finally {
        recordingBusy.value = false;
      }
    }
    async function stopRecording() {
      recordingBusy.value = true;
      try {
        await Promise.all(backgroundRecordings.value.filter((session) => session.state !== "stopping").map((session) => stopSession(session.id)));
      } catch (error) {
        toast("error", String(error));
      } finally {
        recordingBusy.value = false;
      }
    }
    async function launchSelected() {
      if (config.launch.scene === "record-only") return startRecording();
      if (config.launch.scene === "otg") {
        const result2 = await window.scrcpy.startOtg(runtimeSnapshot(), launchSnapshot(), otgUsbSerial.value.trim());
        if (!result2.ok) toast("error", operationErrorMessage(result2, t("operationFailed")));
        return;
      }
      const launches = selectedSerials.value.map((serial) => ({ serial, launch: launchSnapshot(serial) }));
      if (launches.some((item) => item.launch.scene === "otg")) {
        toast("error", t("otgProfileLaunchHint"));
        return;
      }
      const result = await window.scrcpy.start(runtimeSnapshot(), launches);
      if (!result.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
    }
    async function previewSelected() {
      if (config.launch.scene === "otg") {
        const result2 = await window.scrcpy.previewOtg(launchSnapshot(), otgUsbSerial.value.trim());
        if (!result2.ok || !result2.data) {
          toast("error", operationErrorMessage(result2, t("commandPreviewFailed")));
          return;
        }
        commandPreviews.value = [result2.data];
        return;
      }
      const launches = selectedSerials.value.map((serial) => {
        const profileId = config.deviceProfiles[serial];
        const profile = profileId ? config.profiles.find((item) => item.id === profileId) : void 0;
        const baseLaunch = config.launch.scene === "record-only" ? config.launch : profile?.launch || config.launch;
        return {
          serial,
          launch: launchSnapshot(serial),
          source: profile && config.launch.scene !== "record-only" ? "profile" : "global",
          profileName: profile?.name,
          deviceWindowTitleOverride: Boolean(config.deviceAliases[serial]?.trim() && !baseLaunch.windowTitle.trim())
        };
      });
      if (launches.some((item) => item.launch.scene === "otg")) {
        toast("error", t("otgProfileLaunchHint"));
        return;
      }
      const result = await window.scrcpy.preview(launches);
      if (!result.ok) {
        toast("error", operationErrorMessage(result, t("commandPreviewFailed")));
        return;
      }
      commandPreviews.value = result.data || [];
    }
    const toolkitDevice = () => toolkitSerial.value || bootSerial.value || controlSerial.value || selectedSerials.value[0] || "";
    const recentCommands = computed(() => config.toolkit.recentCommands || []);
    const mostUsedCommands = computed(() => Object.entries(config.toolkit.commandUsage || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cmd]) => cmd));
    watch(usableDevices, (list) => {
      const serials = list.map((device) => device.serial);
      if (!serials.includes(toolkitSerial.value)) toolkitSerial.value = serials[0] || "";
      if (!serials.includes(bootSerial.value)) bootSerial.value = serials[0] || "";
    }, { immediate: true });
    function rememberCommand(command) {
      const trimmed = command.trim();
      if (!trimmed) return;
      const recent = [trimmed, ...(config.toolkit.recentCommands || []).filter((entry) => entry !== trimmed)].slice(0, 12);
      config.toolkit.recentCommands = recent;
      config.toolkit.commandUsage = { ...(config.toolkit.commandUsage || {}), [trimmed]: (config.toolkit.commandUsage?.[trimmed] || 0) + 1 };
    }
    async function runToolkitAdb(args) {
      const serial = toolkitDevice();
      if (!serial) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      toolkitBusy.value = true;
      try {
        const result = await window.scrcpy.runToolkitCommand(runtimeSnapshot(), serial, args);
        if (!result?.ok) {
          toast("error", operationErrorMessage(result, t("operationFailed")));
          return;
        }
        toolkitOutput.value = result.data.output || t("toolkitNoOutput");
        rememberCommand(args.join(" "));
      } catch (error) {
        toast("error", String(error));
      } finally {
        toolkitBusy.value = false;
      }
    }
    async function bootAction(action) {
      const commands = {
        reboot: ["reboot"],
        recovery: ["reboot", "recovery"],
        bootloader: ["reboot", "bootloader"],
        "safe-mode": ["shell", "am", "start", "-a", "android.intent.action.REBOOT", "--ez", "safe_mode", "true"],
        wake: ["shell", "input", "keyevent", "224"],
        sleep: ["shell", "input", "keyevent", "223"],
        "power-off": ["shell", "reboot", "-p"]
      };
      await runToolkitAdb(commands[action] || []);
    }
    async function shizukuAction(action) {
      const serial = toolkitDevice();
      if (!serial) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      toolkitBusy.value = true;
      try {
        const result = await window.scrcpy.shizuku(runtimeSnapshot(), serial, action);
        if (!result?.ok) {
          toast("error", operationErrorMessage(result, t("operationFailed")));
          return;
        }
        toolkitOutput.value = result.data.output || (result.data.running ? `Shizuku is running (pid ${result.data.pid})` : "Shizuku is not running.");
        rememberCommand(`shizuku ${action}`);
      } catch (error) {
        toast("error", String(error));
      } finally {
        toolkitBusy.value = false;
      }
    }
    async function runToolkitCommand() {
      const parts = toolkitCommand.value.trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return;
      await runToolkitAdb(parts);
    }
    async function runRecent(command) {
      toolkitCommand.value = command;
      await runToolkitAdb(command.split(/\s+/).filter(Boolean));
    }
    async function sshTunnelAction(action) {
      try {
        const result = await window.scrcpy.sshTunnel(runtimeSnapshot(), action, config.toolkit.sshHost.trim(), config.toolkit.sshLocalPort, config.toolkit.sshRemotePort);
        if (!result?.ok) {
          toast("error", operationErrorMessage(result, t("operationFailed")));
          return;
        }
        toolkitOutput.value = action === "status" ? `Tunnel ${result.data.running ? "running" : "stopped"}${result.data.pid ? ` (pid ${result.data.pid})` : ""}` : `Tunnel ${action} requested.`;
      } catch (error) {
        toast("error", String(error));
      }
    }
    async function openDeviceTerminal(serial) {
      const target = serial || toolkitDevice();
      if (!target) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      try {
        const result = await window.scrcpy.openTerminal(runtimeSnapshot(), target);
        if (!result?.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
      } catch (error) {
        toast("error", String(error));
      }
    }
    async function adbServerAction(action) {
      try {
        const result = await window.scrcpy.adbServer(runtimeSnapshot(), action);
        if (!result?.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
        else toast("success", `ADB server ${action}`);
      } catch (error) {
        toast("error", String(error));
      }
    }
    async function exportConfigAs(format) {
      try {
        const base = selectedSerials.value.length ? selectedSerials.value : controlSerial.value ? [controlSerial.value] : [];
        const launches = base.map((serial) => {
          const profileId = config.deviceProfiles[serial];
          const profile = profileId ? config.profiles.find((item) => item.id === profileId) : void 0;
          const baseLaunch = config.launch.scene === "record-only" ? config.launch : profile?.launch || config.launch;
          return {
            serial,
            launch: launchSnapshot(serial),
            source: profile && config.launch.scene !== "record-only" ? "profile" : "global",
            profileName: profile?.name,
            deviceWindowTitleOverride: Boolean(config.deviceAliases[serial]?.trim() && !baseLaunch.windowTitle.trim())
          };
        });
        const result = await window.scrcpy.exportConfig(format, structuredClone(/* @__PURE__ */ toRaw(config)), launches);
        if (!result?.ok) {
          toast("error", `${t("configExportFailed")} ${result?.error?.message || ""}`);
          return;
        }
        toast("success", t("configExported").replace("{path}", result.data.path));
      } catch (error) {
        toast("error", `${t("configExportFailed")} ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    function sceneSupported(scene) {
      const features = environment.value?.scrcpy.capabilities?.features;
      return features ? features[sceneFeature[scene]] : true;
    }
    function selectScene(scene) {
      if (!sceneSupported(scene)) return;
      selectLaunchScene(config.launch, scene);
      commandPreviews.value = [];
    }
    async function probeCapabilities(refresh = false) {
      if (!probeSerial.value || probingCapabilities.value) return;
      probingCapabilities.value = true;
      const result = await window.scrcpy.probeDeviceCapabilities(runtimeSnapshot(), probeSerial.value, refresh);
      probingCapabilities.value = false;
      if (!result.ok || !result.data) {
        toast("error", operationErrorMessage(result, t("capabilityProbeFailed")));
        return;
      }
      deviceCapabilities.value = result.data;
    }
    function selectCamera(event) {
      config.launch.cameraId = event.target.value;
      if (config.launch.cameraId) config.launch.cameraFacing = "default";
      config.launch.cameraSize = { width: 0, height: 0 };
      config.launch.cameraHighSpeed = false;
      config.launch.cameraFps = 0;
    }
    function applyVirtualDisplayPreset(preset) {
      const startApp = config.launch.virtualDisplay.startApp || (preset === "desktop" ? "com.android.settings" : "");
      if (preset === "presentation") {
        Object.assign(config.launch.virtualDisplay, {
          width: 1920,
          height: 1080,
          dpi: 240,
          systemDecorations: true,
          destroyContent: true,
          flexDisplay: false,
          keepActive: true,
          imePolicy: "default",
          startApp
        });
      } else if (preset === "desktop") {
        Object.assign(config.launch.virtualDisplay, {
          width: 1280,
          height: 960,
          dpi: 160,
          systemDecorations: true,
          destroyContent: false,
          flexDisplay: true,
          keepActive: true,
          imePolicy: "local",
          startApp
        });
      } else {
        Object.assign(config.launch.virtualDisplay, {
          width: 1280,
          height: 720,
          dpi: 240,
          systemDecorations: false,
          destroyContent: true,
          flexDisplay: false,
          keepActive: true,
          imePolicy: "local",
          startApp
        });
      }
    }
    function previewLabel(serial) {
      return config.deviceAliases[serial]?.trim() || devices.value.find((device) => device.serial === serial)?.model || serial;
    }
    function previewArgv(preview) {
      return JSON.stringify(["scrcpy", ...preview.args]);
    }
    function previewSource(detail) {
      if (detail.source === "profile" && detail.sourceLabel) return `${t("sourceProfile")}: ${detail.sourceLabel}`;
      return t(`source_${detail.source}`);
    }
    async function stop(serial) {
      const result = await window.scrcpy.stop(serial);
      if (!result.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
    }
    function newId() {
      return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    function rememberWirelessTarget(address) {
      const normalized = address.trim();
      if (!normalized || config.wirelessTargets.some((target) => target.address === normalized)) return;
      config.wirelessTargets.push({ id: newId(), name: normalized, address: normalized, autoConnect: false });
    }
    async function connect(address = wirelessTarget.value, notify = true) {
      const target = address.trim();
      const result = await window.scrcpy.connect(runtimeSnapshot(), target);
      if (!result.ok) {
        if (notify) toast("error", operationErrorMessage(result, t("operationFailed")));
        return false;
      }
      wirelessTarget.value = target;
      rememberWirelessTarget(target);
      if (notify) toast("success", t("connected"));
      await refreshDevices();
      return true;
    }
    async function connectSaved(target) {
      await connect(target.address);
    }
    function forgetWirelessTarget(id) {
      const index = config.wirelessTargets.findIndex((target) => target.id === id);
      if (index >= 0) config.wirelessTargets.splice(index, 1);
    }
    async function pair() {
      const result = await window.scrcpy.pair(runtimeSnapshot(), pairTarget.value, pairingCode.value);
      if (!result.ok) {
        toast("error", operationErrorMessage(result, t("operationFailed")));
        return;
      }
      pairingCode.value = "";
      toast("success", t("paired"));
    }
    let legacyWirelessBusy = false;
    async function enableLegacyWireless() {
      if (legacyWirelessBusy) return;
      const device = legacyWirelessDevice.value;
      if (!device) return;
      legacyWirelessBusy = true;
      try {
        const result = await window.scrcpy.enableLegacyWireless(runtimeSnapshot(), device.serial);
        if (!result.ok) {
          toast("error", operationErrorMessage(result, t("operationFailed")));
          return;
        }
        const address = `${result.data.ip}:${result.data.port}`;
        wirelessTarget.value = address;
        rememberWirelessTarget(address);
        toast("success", `${t("legacyWirelessEnabled")} (${address})`);
        await refreshDevices();
      } finally {
        legacyWirelessBusy = false;
      }
    }
    async function disconnect(serial) {
      const result = await window.scrcpy.disconnect(runtimeSnapshot(), serial);
      if (!result.ok) {
        toast("error", operationErrorMessage(result, t("operationFailed")));
        return;
      }
      toast("success", t("disconnected"));
      await refreshDevices();
    }
    async function setWorkspaceSection(section) {
      workspaceSection.value = section;
      workspaceResults.value = [];
      if (section === "overview" && !deviceOverview.value) await loadDeviceOverview();
      if (section === "apps" && !installedApps.value.length) await loadInstalledApps();
    }
    async function loadDeviceOverview() {
      if (!controlSerial.value || loadingOverview.value) return;
      loadingOverview.value = true;
      const result = await window.scrcpy.getDeviceOverview(runtimeSnapshot(), controlSerial.value);
      loadingOverview.value = false;
      if (result.ok) deviceOverview.value = result.data || null;
      else toast("error", operationErrorMessage(result, t("deviceOverviewFailed")));
    }
    async function loadInstalledApps(refresh = false) {
      if (!controlSerial.value || loadingApps.value) return;
      loadingApps.value = true;
      const result = await window.scrcpy.listApps(runtimeSnapshot(), controlSerial.value, refresh);
      loadingApps.value = false;
      if (result.ok) installedApps.value = result.data || [];
      else toast("error", operationErrorMessage(result, t("appListFailed")));
    }
    async function startInstalledApp(app) {
      if (!controlSerial.value) return;
      const result = await window.scrcpy.startApp(runtimeSnapshot(), controlSerial.value, app.packageId);
      if (result.ok) toast("success", `${t("appStarted")} ${app.packageId}`);
      else toast("error", operationErrorMessage(result, t("appStartFailed")));
    }
    function summarizeWorkspaceResults() {
      const failed = workspaceResults.value.filter((result) => !result.ok).length;
      const skipped = workspaceResults.value.filter(
        (result) => result.ok && result.data && "skipped" in result.data && result.data.skipped
      ).length;
      if (failed) toast("error", `${failed} ${t("batchItemsFailed")}`);
      else toast("success", `${workspaceResults.value.length - skipped} ${t("batchItemsCompleted")}${skipped ? ` · ${skipped} ${t("skipped")}` : ""}`);
    }
    async function pushSelectedFiles() {
      if (!workspaceTargets.value.length || workspaceBusy.value) return;
      workspaceResults.value = [];
      workspaceProgress.value = [];
      workspaceBusy.value = true;
      const result = await window.scrcpy.pushFiles(runtimeSnapshot(), workspaceTargets.value, fileTarget.value, fileConflict.value);
      workspaceBusy.value = false;
      if (!result.ok) {
        if (result.error?.code !== "FILE_SELECTION_CANCELED") toast("error", operationErrorMessage(result, t("filePushFailed")));
        return;
      }
      config.launch.pushTarget = fileTarget.value;
      workspaceResults.value = result.data?.results || [];
      summarizeWorkspaceResults();
    }
    async function installSelectedApk() {
      if (!workspaceTargets.value.length || workspaceBusy.value) return;
      if (installDowngrade.value && !window.confirm(t("confirmDowngrade"))) return;
      workspaceResults.value = [];
      workspaceProgress.value = [];
      workspaceBusy.value = true;
      const result = await window.scrcpy.installApk(
        runtimeSnapshot(),
        workspaceTargets.value,
        installReplace.value,
        installDowngrade.value
      );
      workspaceBusy.value = false;
      if (!result.ok) {
        if (result.error?.code !== "APK_SELECTION_CANCELED") toast("error", operationErrorMessage(result, t("apkInstallFailed")));
        return;
      }
      workspaceResults.value = result.data?.results || [];
      summarizeWorkspaceResults();
    }
    function workspaceResultMessage(result) {
      if (!result.ok) return result.error?.message || t("operationFailed");
      if (result.data && "skipped" in result.data && result.data.skipped) return t("skippedExisting");
      return result.data?.output || t("completed");
    }
    function handleBatchProgress(event) {
      if (workspaceProgress.value.length && workspaceProgress.value[0].batchId !== event.batchId) workspaceProgress.value = [];
      const index = workspaceProgress.value.findIndex((item) => item.targetId === event.targetId);
      if (index >= 0) workspaceProgress.value[index] = event;
      else workspaceProgress.value.push(event);
    }
    function formatBytes(size) {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KiB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MiB`;
    }
    async function loadArtifacts() {
      if (loadingArtifacts.value) return;
      loadingArtifacts.value = true;
      const result = await window.scrcpy.listArtifacts({ limit: 5e3 });
      loadingArtifacts.value = false;
      if (result.ok) artifacts.value = result.data || [];
      else toast("error", operationErrorMessage(result, t("artifactListFailed")));
    }
    function artifactDeviceLabel(artifact) {
      if (!artifact.deviceId) return t("notApplicable");
      return config.deviceAliases[artifact.deviceId]?.trim() || artifact.deviceId;
    }
    async function openArtifact(artifact) {
      const result = await window.scrcpy.openArtifact(artifact.id);
      if (!result.ok) toast("error", operationErrorMessage(result, t("artifactOpenFailed")));
    }
    async function revealArtifact(artifact) {
      const result = await window.scrcpy.revealArtifact(artifact.id);
      if (!result.ok) toast("error", operationErrorMessage(result, t("artifactRevealFailed")));
    }
    async function copyArtifactPath(artifact) {
      const result = await window.scrcpy.copyArtifactPath(artifact.id);
      if (result.ok) toast("success", t("artifactPathCopied"));
      else toast("error", operationErrorMessage(result, t("artifactCopyFailed")));
    }
    async function deleteArtifact(artifact, deleteFile) {
      const result = await window.scrcpy.deleteArtifact(artifact.id, deleteFile);
      if (!result.ok) {
        if (result.error?.code === "ARTIFACT_DELETE_CANCELED") return;
        toast("error", operationErrorMessage(result, t("artifactDeleteFailed")));
        return;
      }
      artifacts.value = artifacts.value.filter((item) => item.id !== artifact.id);
      toast("success", deleteFile ? t("artifactFileDeleted") : t("artifactIndexDeleted"));
    }
    async function previewDiagnostics() {
      if (preparingDiagnostics.value) return;
      preparingDiagnostics.value = true;
      const result = await window.scrcpy.previewDiagnostics(runtimeSnapshot());
      preparingDiagnostics.value = false;
      if (result.ok) diagnosticPreview.value = result.data || null;
      else toast("error", operationErrorMessage(result, t("diagnosticPreviewFailed")));
    }
    async function exportDiagnostics() {
      if (!diagnosticPreview.value || preparingDiagnostics.value) return;
      preparingDiagnostics.value = true;
      const result = await window.scrcpy.exportDiagnostics(runtimeSnapshot());
      preparingDiagnostics.value = false;
      if (!result.ok) {
        if (result.error?.code !== "DIAGNOSTIC_EXPORT_CANCELED") toast("error", operationErrorMessage(result, t("diagnosticExportFailed")));
        return;
      }
      diagnosticArtifact.value = result.data || null;
      if (result.data) artifacts.value = [result.data, ...artifacts.value.filter((item) => item.id !== result.data?.id)];
      toast("success", t("diagnosticExported"));
    }
    async function openIssueHelper(artifact = diagnosticArtifact.value) {
      const result = await window.scrcpy.openIssueHelper(artifact?.id);
      if (!result.ok) toast("error", operationErrorMessage(result, t("issueHelperFailed")));
    }
    async function chooseRecordPath() {
      const path = await window.scrcpy.chooseRecordPath();
      if (path) config.launch.recordPath = path;
    }
    async function chooseRecordDirectory() {
      const path = await window.scrcpy.chooseRecordDirectory();
      if (path) config.launch.recordDirectory = path;
    }
    function saveProfile() {
      const name = profileName.value.trim();
      if (!name) {
        toast("error", t("profileNameRequired"));
        return;
      }
      if (name.length > 80 || profileNameExists(name)) {
        toast("error", t("profileNameUnique"));
        return;
      }
      config.profiles.push({ id: newId(), name, launch: launchSnapshot() });
      profileName.value = "";
      toast("success", t("profileSaved"));
    }
    function profileNameKey(name) {
      return name.trim().toLocaleLowerCase(config.locale);
    }
    function profileNameExists(name, excludingId = "") {
      const key = profileNameKey(name);
      return config.profiles.some((profile) => profile.id !== excludingId && profileNameKey(profile.name) === key);
    }
    function renameProfile(profile, event) {
      const input2 = event.target;
      const name = input2.value.trim();
      if (!name || name.length > 80 || profileNameExists(name, profile.id)) {
        input2.value = profile.name;
        toast("error", t("profileNameUnique"));
        return;
      }
      profile.name = name;
    }
    function applyProfile(profile) {
      Object.assign(config.launch, structuredClone(/* @__PURE__ */ toRaw(profile.launch)));
      toast("success", t("profileApplied"));
    }
    function updateProfile(profile) {
      profile.launch = launchSnapshot();
      toast("success", t("profileUpdated"));
    }
    function deleteProfile(id) {
      const references = Object.values(config.deviceProfiles).filter((profileId) => profileId === id).length + config.groups.filter((group) => group.defaultProfileId === id).length;
      if (references && !window.confirm(`${references} ${t("confirmDeleteReferencedProfile")}`)) return;
      const index = config.profiles.findIndex((profile) => profile.id === id);
      if (index >= 0) config.profiles.splice(index, 1);
      for (const [serial, profileId] of Object.entries(config.deviceProfiles)) {
        if (profileId === id) delete config.deviceProfiles[serial];
      }
      for (const group of config.groups) {
        if (group.defaultProfileId === id) group.defaultProfileId = void 0;
      }
    }
    async function exportProfile(profile) {
      if (profileTransferBusy.value) return;
      profileTransferBusy.value = true;
      const result = await window.scrcpy.exportProfile(structuredClone(/* @__PURE__ */ toRaw(profile)));
      profileTransferBusy.value = false;
      if (!result.ok) {
        if (result.error?.code !== "PROFILE_EXPORT_CANCELED") toast("error", operationErrorMessage(result, t("profileExportFailed")));
        return;
      }
      toast("success", t("profileExported"));
    }
    async function previewProfileImport() {
      if (profileTransferBusy.value) return;
      profileTransferBusy.value = true;
      const result = await window.scrcpy.previewProfileImport(runtimeSnapshot());
      profileTransferBusy.value = false;
      if (!result.ok) {
        if (result.error?.code !== "PROFILE_IMPORT_CANCELED") toast("error", operationErrorMessage(result, t("profileImportFailed")));
        return;
      }
      profileImportPreview.value = result.data || null;
      profileImportStrategy.value = "duplicate";
      keepImportedPaths.value = false;
    }
    async function commitProfileImport() {
      if (!profileImportPreview.value || profileTransferBusy.value) return;
      profileTransferBusy.value = true;
      const result = await window.scrcpy.commitProfileImport(
        profileImportPreview.value.token,
        profileImportStrategy.value,
        keepImportedPaths.value
      );
      profileTransferBusy.value = false;
      if (!result.ok || !result.data) {
        toast("error", operationErrorMessage(result, t("profileImportFailed")));
        return;
      }
      const commit = result.data;
      if (commit.keptExisting) {
        profileImportPreview.value = null;
        toast("info", t("profileKeptExisting"));
        return;
      }
      const importedProfile = commit.profile;
      const index = commit.replacedProfileId ? config.profiles.findIndex((profile) => profile.id === commit.replacedProfileId) : -1;
      if (index >= 0) config.profiles[index] = importedProfile;
      else config.profiles.push(importedProfile);
      profileImportPreview.value = null;
      toast("success", t("profileImported"));
    }
    function assignProfile(serial, event) {
      const profileId = event.target.value;
      if (profileId) config.deviceProfiles[serial] = profileId;
      else delete config.deviceProfiles[serial];
    }
    function actionLabel(action) {
      const keys = {
        back: "actionBack",
        home: "actionHome",
        "app-switch": "actionAppSwitch",
        menu: "actionMenu",
        "volume-up": "actionVolumeUp",
        "volume-down": "actionVolumeDown",
        power: "actionPower",
        "screen-on": "actionScreenOn",
        "screen-off": "actionScreenOff",
        rotate: "actionRotate",
        "auto-rotate": "actionAutoRotate",
        "show-touches-on": "actionTouchesOn",
        "show-touches-off": "actionTouchesOff"
      };
      return t(keys[action]);
    }
    const shortcutModifierLabel = computed(() => {
      const profileId = config.deviceProfiles[controlSerial.value];
      const profile = config.profiles.find((item) => item.id === profileId);
      const runningSession = [...sessions.value].reverse().find((session) => session.serialAtLaunch === controlSerial.value && sessionIsActive(session));
      const modifier = runningSession?.args.find((arg) => arg.startsWith("--shortcut-mod="))?.split("=")[1] || (profile?.launch || config.launch).shortcutModifier;
      if (modifier === "default") return isMac ? "⌘" : "MOD";
      if (modifier.endsWith("super")) return isMac ? "⌘" : "Super";
      if (modifier.endsWith("alt")) return isMac ? "⌥" : "Alt";
      return "Ctrl";
    });
    function actionShortcut(action) {
      if (isMac) {
        if (action === "auto-rotate") return "⌘⌥R";
        if (action === "show-touches-on") return "⌘⌥T";
        if (action === "show-touches-off") return "⌘⌥⇧T";
      }
      const key = {
        back: "B",
        home: "H",
        "app-switch": "S",
        menu: "M",
        "volume-down": "↓",
        "volume-up": "↑",
        power: "P",
        "screen-off": "O",
        "screen-on": "⇧O",
        rotate: "R"
      };
      return key[action] ? `${shortcutModifierLabel.value}${key[action]}` : "—";
    }
    async function handleWindowDrop(event) {
      const files = [...(event.dataTransfer?.files || [])].map((file) => file.path || "").filter(Boolean);
      if (!files.length) return;
      event.preventDefault();
      dragActive.value = false;
      const target = config.launch.pushTarget.trim() || "/sdcard/Download";
      const serials = workspaceTargets.value.length ? workspaceTargets.value : controlSerial.value ? [controlSerial.value] : [];
      if (!serials.length) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      const result = await window.scrcpy.pushPaths(runtimeSnapshot(), serials, target, "replace", files);
      if (!result?.ok) {
        toast("error", `${t("pushFailed")} ${operationErrorMessage(result, "")}`);
        return;
      }
      toast("success", t("filesPushed").replace("{count}", String(files.length)));
    }
    function drawQrCode(payload) {
      const canvas = document.querySelector(".qr-canvas");
      if (!canvas || !window.qrcode) return;
      const qr = window.qrcode(0, "M");
      qr.addData(payload);
      qr.make();
      const count = qr.getModuleCount();
      const cell = Math.max(2, Math.floor(320 / (count + 8)));
      canvas.width = cell * (count + 8);
      canvas.height = cell * (count + 8);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
          if (qr.isDark(row, col)) ctx.fillRect((col + 4) * cell, (row + 4) * cell, cell, cell);
        }
      }
    }
    async function startQrPairing() {
      if (qrBusy.value) return;
      const serial = controlSerial.value || selectedSerials.value[0] || "";
      if (!serial) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      qrBusy.value = true;
      qrStatus.value = "waiting";
      try {
        const result = await window.scrcpy.startQrPairing(runtimeSnapshot(), serial);
        if (!result?.ok) throw new Error(result?.error?.message || "Unable to start QR pairing.");
        qrInfo.value = result.data;
        qrModal.value = true;
        await nextTick();
        drawQrCode(result.data.payload);
        const waitResult = await window.scrcpy.waitQrPairing(runtimeSnapshot(), serial, result.data.name, result.data.password, 120000);
        if (waitResult?.ok && waitResult?.data?.cancelled) {
          closeQrModal();
          return;
        }
        if (waitResult?.ok) {
          qrStatus.value = "done";
          toast("success", t("qrSuccess"));
          await refreshDevices();
          await startTrackingDevices();
        } else {
          qrStatus.value = "failed";
          toast("error", `${t("qrFailed")} ${waitResult?.error?.message || ""}`);
        }
      } catch (error) {
        qrStatus.value = "failed";
        toast("error", `${t("qrFailed")} ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        qrBusy.value = false;
      }
    }
    function closeQrModal() {
      const name = qrInfo.value?.name;
      qrModal.value = false;
      qrInfo.value = null;
      qrStatus.value = "";
      if (name) void window.scrcpy.cancelQrPairing(name);
    }
    function swipeAction(direction) {
      void sendControlAction(`swipe-${direction}`);
    }
    async function sendControlAction(action) {
      if (!controlSerial.value) return;
      const actionAt = Date.now();
      const result = await window.scrcpy.control(runtimeSnapshot(), controlSerial.value, action);
      if (!result.ok) {
        toast("error", operationErrorMessage(result, t("operationFailed")));
        return;
      }
      if (recordingAutomation.value) {
        const delayMs = lastRecordedActionAt ? Math.min(6e4, actionAt - lastRecordedActionAt) : 0;
        if (delayMs) recordedSteps.value.push({ type: "delay", durationMs: delayMs });
        recordedSteps.value.push({ type: "control", action });
        lastRecordedActionAt = actionAt;
      }
    }
    async function takeScreenshot() {
      if (!controlSerial.value) return;
      const result = await window.scrcpy.screenshot(runtimeSnapshot(), controlSerial.value);
      if (!result.ok) {
        if (result.error?.code !== "SCREENSHOT_CANCELED") toast("error", operationErrorMessage(result, t("operationFailed")));
        return;
      }
      toast("success", `${t("screenshotSaved")} ${result.data}`);
    }
    async function copyScreenshot() {
      if (!controlSerial.value) return;
      const result = await window.scrcpy.copyScreenshot(runtimeSnapshot(), controlSerial.value);
      if (!result.ok) {
        toast("error", operationErrorMessage(result, t("operationFailed")));
        return;
      }
      toast("success", t("screenshotCopied"));
    }
    function startAutomationRecording() {
      recordedSteps.value = [];
      automationName.value = "";
      lastRecordedActionAt = 0;
      recordingAutomation.value = true;
    }
    function stopAutomationRecording() {
      recordingAutomation.value = false;
    }
    function saveAutomation() {
      const name = automationName.value.trim() || `${t("automation")} ${config.automations.length + 1}`;
      if (!recordedSteps.value.length) {
        toast("error", t("automationEmpty"));
        return;
      }
      const macro = {
        id: newId(),
        name,
        description: "",
        schemaVersion: 2,
        design: { orientation: "any", aspectRatio: 0 },
        steps: structuredClone(/* @__PURE__ */ toRaw(recordedSteps.value))
      };
      config.automations.push(macro);
      recordedSteps.value = [];
      automationName.value = "";
      toast("success", t("automationSaved"));
    }
    async function replayAutomation(macro) {
      if (!controlSerial.value || replayingAutomation.value) return;
      selectedSerials.value = [controlSerial.value];
      selectedGroupId.value = "";
      batchActionType.value = "automation";
      batchAutomationId.value = macro.id;
      activeTab.value = "automations";
      await inspectBatch();
    }
    function deleteAutomation(id) {
      const index = config.automations.findIndex((macro) => macro.id === id);
      if (index >= 0) config.automations.splice(index, 1);
    }
    function resetGroupForm() {
      editingGroupId.value = "";
      groupName.value = "";
      groupDescription.value = "";
      groupProfileId.value = "";
      groupConcurrency.value = 3;
    }
    function saveGroup() {
      const name = groupName.value.trim();
      const existing = config.groups.find((group2) => group2.id === editingGroupId.value);
      const connected = new Set(devices.value.map((device) => device.serial));
      const unavailableMembers = existing?.serials.filter((serial) => !connected.has(serial)) || [];
      const members = [.../* @__PURE__ */ new Set([...selectedSerials.value, ...unavailableMembers])];
      if (!name || !members.length) {
        toast("error", t("groupNameAndDevicesRequired"));
        return;
      }
      const group = {
        id: editingGroupId.value || newId(),
        name,
        description: groupDescription.value.trim(),
        serials: members,
        defaultProfileId: groupProfileId.value || void 0,
        concurrencyLimit: Math.max(1, Math.min(8, Math.trunc(groupConcurrency.value || 3)))
      };
      const index = config.groups.findIndex((item) => item.id === group.id);
      if (index >= 0) config.groups[index] = group;
      else config.groups.push(group);
      selectedGroupId.value = group.id;
      resetGroupForm();
      toast("success", t("groupSaved"));
    }
    function editGroup(group) {
      editingGroupId.value = group.id;
      groupName.value = group.name;
      groupDescription.value = group.description;
      groupProfileId.value = group.defaultProfileId || "";
      groupConcurrency.value = group.concurrencyLimit;
      selectedSerials.value = group.serials.filter((serial) => devices.value.some((device) => device.serial === serial));
    }
    function selectGroup(group) {
      selectedGroupId.value = group.id;
      const online = new Set(devices.value.map((device) => device.serial));
      selectedSerials.value = group.serials.filter((serial) => online.has(serial));
      const first = group.serials.find((serial) => online.has(serial));
      if (first) controlSerial.value = first;
    }
    function deleteGroup(id) {
      const index = config.groups.findIndex((group) => group.id === id);
      if (index >= 0) config.groups.splice(index, 1);
      if (selectedGroupId.value === id) selectedGroupId.value = "";
      if (editingGroupId.value === id) resetGroupForm();
    }
    function removeGroupMember(group, serial) {
      const index = group.serials.indexOf(serial);
      if (index >= 0) group.serials.splice(index, 1);
      if (selectedGroupId.value === group.id) selectedSerials.value = selectedSerials.value.filter((item) => item !== serial);
    }
    function createAutomation() {
      automationDraft.value = {
        id: "",
        name: "",
        description: "",
        schemaVersion: 2,
        design: { orientation: "any", aspectRatio: 0 },
        steps: []
      };
    }
    function editAutomation(macro) {
      automationDraft.value = structuredClone(/* @__PURE__ */ toRaw(macro));
      activeTab.value = "automations";
    }
    function automationStepLabel(step) {
      if (step.type === "control") return actionLabel(step.action);
      if (step.type === "delay") return `${t("delay")} · ${step.durationMs} ms`;
      if (step.type === "tap") return `${t("tap")} · ${step.x.toFixed(2)}, ${step.y.toFixed(2)}`;
      if (step.type === "swipe") return `${t("swipe")} · ${step.from.x.toFixed(2)},${step.from.y.toFixed(2)} → ${step.to.x.toFixed(2)},${step.to.y.toFixed(2)}`;
      if (step.type === "text") return `${t("textInput")} · ${step.value}`;
      if (step.type === "start-app") return `${t("startApp")} · ${step.packageId}`;
      if (step.type === "screenshot") return `${t("screenshot")} · ${step.label || t("automatic")}`;
      return `${t("assertDevice")} · ${step.condition.type}`;
    }
    function addAutomationStep() {
      let step;
      if (newStepType.value === "control") step = { type: "control", action: newStepControl.value };
      else if (newStepType.value === "delay") step = { type: "delay", durationMs: Math.max(0, Math.min(6e4, Math.trunc(newStepDuration.value))) };
      else if (newStepType.value === "tap") step = {
        type: "tap",
        x: Math.max(0, Math.min(1, newStepNumberA.value)),
        y: Math.max(0, Math.min(1, newStepNumberB.value)),
        coordinateSpace: "normalized"
      };
      else if (newStepType.value === "swipe") step = {
        type: "swipe",
        from: { x: Math.max(0, Math.min(1, newStepNumberA.value)), y: Math.max(0, Math.min(1, newStepNumberB.value)) },
        to: { x: Math.max(0, Math.min(1, newStepNumberC.value)), y: Math.max(0, Math.min(1, newStepNumberD.value)) },
        durationMs: Math.max(1, Math.min(1e4, Math.trunc(newStepDuration.value || 300))),
        coordinateSpace: "normalized"
      };
      else if (newStepType.value === "text") {
        if (!newStepText.value.trim()) return toast("error", t("stepValueRequired"));
        step = { type: "text", value: newStepText.value, sensitive: false };
      } else if (newStepType.value === "start-app") {
        if (!newStepText.value.trim()) return toast("error", t("stepValueRequired"));
        step = { type: "start-app", packageId: newStepText.value.trim() };
      } else if (newStepType.value === "screenshot") {
        step = { type: "screenshot", label: newStepText.value.trim() || void 0 };
      } else {
        step = {
          type: "assert-device",
          condition: { type: "orientation", value: newStepText.value === "landscape" ? "landscape" : "portrait" }
        };
      }
      if (automationDraft.value.steps.length >= 200) return toast("error", t("automationTooLarge"));
      automationDraft.value.steps.push(step);
      newStepText.value = "";
    }
    function moveAutomationStep(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= automationDraft.value.steps.length) return;
      const [step] = automationDraft.value.steps.splice(index, 1);
      automationDraft.value.steps.splice(target, 0, step);
    }
    function removeAutomationStep(index) {
      automationDraft.value.steps.splice(index, 1);
    }
    function saveAutomationDraft() {
      const draft = structuredClone(/* @__PURE__ */ toRaw(automationDraft.value));
      draft.name = draft.name.trim();
      draft.description = draft.description.trim();
      if (!draft.name || !draft.steps.length) return toast("error", t("automationNameAndStepsRequired"));
      draft.id ||= newId();
      draft.schemaVersion = 2;
      const index = config.automations.findIndex((item) => item.id === draft.id);
      if (index >= 0) config.automations[index] = draft;
      else config.automations.push(draft);
      automationDraft.value = structuredClone(draft);
      toast("success", t("automationSaved"));
    }
    async function previewAutomationImport() {
      automationTransferBusy.value = true;
      const result = await window.scrcpy.previewAutomationImport();
      automationTransferBusy.value = false;
      if (!result.ok || !result.data) {
        if (result.error?.code !== "AUTOMATION_IMPORT_CANCELED") toast("error", operationErrorMessage(result, t("automationImportFailed")));
        return;
      }
      automationImportPreview.value = result.data;
      automationImportConfirmed.value = false;
    }
    async function commitAutomationImport() {
      if (!automationImportPreview.value || !automationImportConfirmed.value) return;
      automationTransferBusy.value = true;
      const result = await window.scrcpy.commitAutomationImport(automationImportPreview.value.token);
      automationTransferBusy.value = false;
      if (!result.ok || !result.data) return toast("error", operationErrorMessage(result, t("automationImportFailed")));
      const imported = structuredClone(result.data);
      if (config.automations.some((item) => item.id === imported.id)) {
        imported.id = newId();
        imported.name = `${imported.name} (${t("copy")})`;
      }
      config.automations.push(imported);
      automationImportPreview.value = null;
      automationImportConfirmed.value = false;
      toast("success", t("automationImported"));
    }
    async function exportAutomation(macro) {
      automationTransferBusy.value = true;
      const result = await window.scrcpy.exportAutomation(structuredClone(/* @__PURE__ */ toRaw(macro)));
      automationTransferBusy.value = false;
      if (!result.ok && result.error?.code !== "AUTOMATION_EXPORT_CANCELED") toast("error", operationErrorMessage(result, t("automationExportFailed")));
    }
    function launchForBatch(serial) {
      const group = selectedGroup.value;
      const profile = group?.defaultProfileId ? config.profiles.find((item) => item.id === group.defaultProfileId) : void 0;
      if (!profile) return launchSnapshot(serial);
      const launch = structuredClone(/* @__PURE__ */ toRaw(profile.launch));
      const alias = config.deviceAliases[serial]?.trim();
      if (alias && !launch.windowTitle.trim()) launch.windowTitle = alias;
      return launch;
    }
    function buildBatchAction() {
      if (batchActionType.value === "launch") {
        const launches = batchTargetSerials.value.map((serial) => ({ serial, launch: launchForBatch(serial) }));
        if (launches.some((item) => item.launch.scene === "otg")) {
          toast("error", t("batchOtgUnsupported"));
          return;
        }
        return { type: "launch", launches };
      }
      if (batchActionType.value === "control") return { type: "control", action: batchControlAction.value };
      if (batchActionType.value === "screenshot") return { type: "screenshot" };
      if (batchActionType.value === "file-push") {
        if (!fileTarget.value.trim()) {
          toast("error", t("targetDirectoryRequired"));
          return;
        }
        return { type: "file-push", target: fileTarget.value.trim(), conflict: fileConflict.value };
      }
      if (batchActionType.value === "apk-install") {
        return { type: "apk-install", replace: installReplace.value, downgrade: installDowngrade.value };
      }
      if (batchActionType.value === "start-app") {
        if (!batchPackageId.value.trim()) {
          toast("error", t("packageIdRequired"));
          return;
        }
        return { type: "start-app", packageId: batchPackageId.value.trim() };
      }
      if (!batchAutomation.value) {
        toast("error", t("chooseAutomation"));
        return;
      }
      return { type: "automation", automation: structuredClone(/* @__PURE__ */ toRaw(batchAutomation.value)) };
    }
    async function inspectBatch() {
      if (!batchTargetSerials.value.length) return toast("error", t("chooseBatchTargets"));
      const action = buildBatchAction();
      if (!action) return;
      batchBusy.value = true;
      batchRunReport.value = null;
      batchRunEvents.value = [];
      const result = await window.scrcpy.preflightBatch(runtimeSnapshot(), {
        serials: batchTargetSerials.value,
        action,
        concurrencyLimit: selectedGroup.value?.concurrencyLimit || 3
      });
      batchBusy.value = false;
      if (!result.ok || !result.data) return toast("error", operationErrorMessage(result, t("batchPreflightFailed")));
      batchPreflight.value = result.data;
      batchDangerousConfirmed.value = false;
    }
    async function runBatch() {
      if (!batchPreflight.value || activeBatchRunId.value) return;
      batchBusy.value = true;
      const result = await window.scrcpy.startBatch(
        runtimeSnapshot(),
        batchPreflight.value.token,
        batchPassingOnly.value,
        batchDangerousConfirmed.value
      );
      batchBusy.value = false;
      if (!result.ok || !result.data) return toast("error", operationErrorMessage(result, t("batchStartFailed")));
      activeBatchRunId.value = result.data;
      batchPreflight.value = null;
    }
    async function cancelBatch() {
      if (!activeBatchRunId.value) return;
      const result = await window.scrcpy.cancelBatch(activeBatchRunId.value);
      if (!result.ok) toast("error", operationErrorMessage(result, t("batchCancelFailed")));
    }
    function handleBatchRun(event) {
      batchRunEvents.value.push(event);
      if (batchRunEvents.value.length > 500) batchRunEvents.value.splice(0, batchRunEvents.value.length - 500);
      if (event.report) {
        batchRunReport.value = event.report;
        activeBatchRunId.value = "";
        toast(event.report.state === "completed" ? "success" : "info", event.message);
      }
    }
    async function applyBossKey(notify = false) {
      const result = await window.scrcpy.setBossKey(config.bossKeyEnabled, config.bossKeyAccelerator);
      if (notify && !result.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
    }
    function resetSettings() {
      const defaults = defaultPersistedConfig(config.locale);
      Object.assign(config.launch, defaults.launch);
      config.muteNotifications = defaults.muteNotifications;
      config.minimizeToTray = defaults.minimizeToTray;
      config.killAdbOnQuit = defaults.killAdbOnQuit;
      config.bossKeyEnabled = defaults.bossKeyEnabled;
      config.bossKeyAccelerator = defaults.bossKeyAccelerator;
      config.autoSelectFirstDevice = defaults.autoSelectFirstDevice;
    }
    function openGithub() {
      void window.scrcpy.openExternal("https://github.com/Ryuupyroxi/U-S-G-Ultimate-SCRCPYGui");
    }
    function handleStatus(event) {
      if (event.status === "running") toast("success", `${event.serial}: ${t("launched")}`);
      if (event.status === "stopped") toast("info", `${event.serial}: ${t("stopped")}`);
      if (event.status === "error") toast("error", `${event.serial}: ${event.message}`);
    }
    function handleAppEvent(event) {
      if (!logs.value.some((item) => item.id === event.id)) logs.value.push(event);
      if (logs.value.length > 1e3) logs.value.splice(0, logs.value.length - 1e3);
    }
    function eventError(event) {
      const value = event.data?.error;
      if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
      const candidate = value;
      return typeof candidate.code === "string" && typeof candidate.stage === "string" && typeof candidate.message === "string" && typeof candidate.retryable === "boolean" && Array.isArray(candidate.suggestedActions) ? candidate : void 0;
    }
    async function clearLogs() {
      await window.scrcpy.clearEvents();
      logs.value = [];
    }
    function sessionIsActive(session) {
      return ["queued", "preflighting", "launching", "running", "stopping"].includes(session.state);
    }
    function syncActiveSerials() {
      activeSerials.value = new Set(sessions.value.filter(sessionIsActive).map((session) => session.serialAtLaunch));
    }
    function handleSession(event) {
      const index = sessions.value.findIndex((session) => session.id === event.session.id);
      if (index >= 0) sessions.value[index] = event.session;
      else sessions.value.unshift(event.session);
      syncActiveSerials();
    }
    async function stopSession(id) {
      const result = await window.scrcpy.stopSession(id);
      if (!result.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
    }
    async function stopAllSessions() {
      const results = await Promise.all(sessions.value.filter(sessionIsActive).map((session) => window.scrcpy.stopSession(session.id)));
      const failed = results.filter((result) => !result.ok);
      if (failed.length) toast("error", `${failed.length} ${t("sessionsStopFailed")}`);
    }
    function sessionDeviceLabel(session) {
      return config.deviceAliases[session.serialAtLaunch]?.trim() || session.serialAtLaunch;
    }
    function sessionArgv(session) {
      return JSON.stringify(["scrcpy", ...session.args]);
    }
    function deviceSessionState(serial) {
      return sessions.value.find((session) => session.serialAtLaunch === serial && sessionIsActive(session))?.state;
    }
    function statusLabel(device) {
      const sessionState = deviceSessionState(device.serial);
      if (sessionState) return t(`sessionState_${sessionState}`);
      if (device.state === "device") return device.connection === "usb" ? t("usb") : t("wireless");
      if (device.state === "offline") return t("offline");
      return device.state;
    }
    watch(sidebarCollapsed, (value) => {
      document.querySelector(".app-shell")?.classList.toggle("sidebar-collapsed", value);
    }, { immediate: true, flush: "post" });
    watch(() => config.navBar, (value) => {
      const el = document.querySelector(".float-nav-bar");
      if (el) el.style.display = value ? "flex" : "none";
    }, { immediate: true, flush: "post" });
    watch(() => config.swipePanel, (value) => {
      const el = document.querySelector(".float-swipe");
      if (el) el.style.display = value ? "grid" : "none";
    }, { immediate: true, flush: "post" });
    watch(qrModal, (value) => {
      const el = document.querySelector(".qr-backdrop");
      if (el) el.style.display = value ? "flex" : "none";
    }, { immediate: true, flush: "post" });
    watch(dragActive, (value) => {
      const el = document.querySelector(".drop-overlay");
      if (el) el.style.display = value ? "grid" : "none";
    }, { immediate: true, flush: "post" });
    onMounted(async () => {
      try {
        const loaded = await window.scrcpy.loadConfig(localStorage.getItem(STORAGE_KEY) || "", detectedLocale());
        Object.assign(config, loaded.config);
        configRevision = loaded.revision;
        localStorage.setItem(MIGRATION_KEY, JSON.stringify({ schemaVersion: 3, ...loaded.migration }));
        await nextTick();
        configReady = true;
        if (loaded.migration.source === "legacy-v2") {
          toast("success", `${t("configMigrated")} ${loaded.migration.imported}/${loaded.migration.skipped}/${loaded.migration.invalid}`);
        }
      } catch (error) {
        toast("error", `${t("configLoadFailed")} ${error instanceof Error ? error.message : String(error)}`);
      }
      version2.value = await window.scrcpy.getVersion();
      removeStatusListener = window.scrcpy.onStatus(handleStatus);
      removeSessionListener = window.scrcpy.onSession(handleSession);
      removeDeviceListener = window.scrcpy.onDevices((event) => void handleDeviceEvent(event));
      removeAppEventListener = window.scrcpy.onEvent(handleAppEvent);
      removeBatchProgressListener = window.scrcpy.onBatchProgress(handleBatchProgress);
      removeBatchRunListener = window.scrcpy.onBatchRun(handleBatchRun);
      removeScreenshotShortcutListener = window.scrcpy.onScreenshotShortcut((action) => {
        if (action === "save") void takeScreenshot();
        else void copyScreenshot();
      });
      removeControlShortcutListener = window.scrcpy.onControlShortcut((action) => void sendControlAction(action));
      removeTrayStartListener = window.scrcpy.onTrayStartDevice((serial) => {
        selectedSerials.value = [serial];
        void launchSelected();
      });
      const historicalEvents = await window.scrcpy.listEvents({ limit: 1e3 });
      const liveEventIds = new Set(logs.value.map((event) => event.id));
      logs.value.unshift(...historicalEvents.filter((event) => !liveEventIds.has(event.id)));
      logs.value.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
      document.addEventListener("visibilitychange", handleVisibilityChange);
      handleVisibilityChange();
      document.addEventListener("dragover", (event) => {
        event.preventDefault();
        dragActive.value = true;
      });
      document.addEventListener("dragleave", (event) => {
        if (event.relatedTarget === null) dragActive.value = false;
      });
      document.addEventListener("drop", handleWindowDrop);
      const listedSessions = await window.scrcpy.listSessions();
      const liveIds = new Set(sessions.value.map((session) => session.id));
      sessions.value.push(...listedSessions.filter((session) => !liveIds.has(session.id)));
      syncActiveSerials();
      await window.scrcpy.setMinimizeToTray(config.minimizeToTray);
      await window.scrcpy.setQuitBehavior(runtimeSnapshot(), config.killAdbOnQuit);
      await applyBossKey();
      await refreshEnvironment();
      if (config.update.checkOnStartup || config.update.autoUpdateOnStartup) {
        await checkForUpdates(false);
        if (config.update.autoUpdateOnStartup && updatesAvailable.value) await applyUpdates();
      }
      if (environment.value?.adb.ok) {
        for (const target of config.wirelessTargets.filter((item) => item.autoConnect)) {
          await connect(target.address, false);
        }
      }
      await refreshDevices();
      await startTrackingDevices();
    });
    onBeforeUnmount(() => {
      if (recordingTimer) clearInterval(recordingTimer);
      removeStatusListener?.();
      removeSessionListener?.();
      removeDeviceListener?.();
      removeAppEventListener?.();
      removeBatchProgressListener?.();
      removeBatchRunListener?.();
      removeScreenshotShortcutListener?.();
      removeControlShortcutListener?.();
      removeTrayStartListener?.();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", { class: normalizeClass(["app-shell", { "sidebar-collapsed": sidebarCollapsed.value }]) }, [
        createBaseVNode("header", { class: "app-header" }, [
          createBaseVNode("div", { class: "brand" }, [
            createBaseVNode("img", { class: "brand-logo", src: "./assets/logo.png", alt: "", draggable: false }),
            createBaseVNode("small", { class: "brand-version" }, "v" + toDisplayString(version2.value), 1)
          ]),
          createBaseVNode("img", { class: "brand-title", src: "./assets/title.png", alt: "UltimateSCRCPYGui", draggable: false }),
          createBaseVNode("div", _hoisted_7, [
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": ($event) => config.theme = $event,
              "aria-label": "Theme"
            }, [
              createBaseVNode("option", { value: "light" }, "Light", -1),
              createBaseVNode("option", { value: "dark" }, "Dark", -1),
              createBaseVNode("option", { value: "oled" }, "OLED", -1)
            ], 512), [
              [vModelSelect, config.theme]
            ]),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => config.locale = $event),
              "aria-label": "Language"
            }, [..._cache[158] || (_cache[158] = [
              createBaseVNode("option", { value: "en" }, "English", -1),
              createBaseVNode("option", { value: "zh-CN" }, "简体中文", -1),
              createBaseVNode("option", { value: "zh-TW" }, "繁體中文", -1),
              createBaseVNode("option", { value: "ru" }, "Русский", -1)
            ])], 512), [
              [vModelSelect, config.locale]
            ]),
            createBaseVNode("button", {
              class: "secondary compact",
              onClick: openGithub
            }, toDisplayString(t("openGithub")), 1)
          ]),
          createBaseVNode("button", {
            class: "icon-button sidebar-toggle",
            type: "button",
            title: t("toggleSidebar"),
            onClick: () => sidebarCollapsed.value = !sidebarCollapsed.value
          }, toDisplayString(sidebarCollapsed.value ? "❯" : "❮"), 1)
        ]),
        createBaseVNode("aside", _hoisted_2, [
          createBaseVNode("nav", _hoisted_3, [
            (openBlock(), createElementBlock(Fragment, null, renderList(["devices", "boot", "toolkit", "automations", "sessions", "artifacts", "settings", "logs"], (tab) => {
              return createBaseVNode("button", {
                key: tab,
                class: normalizeClass({ active: activeTab.value === tab }),
                onClick: ($event) => activeTab.value = tab
              }, [
                createTextVNode(toDisplayString(t(tab)) + " ", 1),
                tab === "logs" && logs.value.length ? (openBlock(), createElementBlock("span", _hoisted_5, toDisplayString(logs.value.length), 1)) : tab === "sessions" && sessions.value.filter(sessionIsActive).length ? (openBlock(), createElementBlock("span", _hoisted_6, toDisplayString(sessions.value.filter(sessionIsActive).length), 1)) : createCommentVNode("", true)
              ], 10, _hoisted_4);
            }), 64))
          ]),
        ]),
        createBaseVNode("main", null, [
          activeTab.value === "devices" ? (openBlock(), createElementBlock("section", _hoisted_8, [
            createBaseVNode("div", _hoisted_9, [
              createBaseVNode("p", _hoisted_10, toDisplayString(t("runtimeSetup")), 1),
              createBaseVNode("p", _hoisted_11, toDisplayString(t("runtimeHint")), 1)
            ]),
            createBaseVNode("div", _hoisted_12, [
              createBaseVNode("button", {
                class: "secondary compact",
                onClick: chooseScrcpy
              }, toDisplayString(t("chooseScrcpy")), 1),
              createBaseVNode("button", {
                class: normalizeClass(["ghost", "compact", { "update-available": updatesAvailable.value }]),
                disabled: updateInfo.value.checking || updateInfo.value.applying,
                title: updateInfo.value.error || void 0,
                onClick: onUpdateClick
              }, toDisplayString(updateInfo.value.checking ? t("checkingUpdates") : updateInfo.value.applying ? t("updating") : updatesAvailable.value ? t("updateAvailable") : t("update")), 11, ["disabled", "title"]),
              createBaseVNode("button", {
                class: "ghost compact",
                disabled: loadingEnvironment.value,
                onClick: _cache[2] || (_cache[2] = ($event) => refreshEnvironment(true))
              }, toDisplayString(t("recheck")), 9, _hoisted_13)
            ]),
            createBaseVNode("div", _hoisted_14, [
              createBaseVNode("div", {
                class: normalizeClass(["runtime-status", environment.value?.scrcpy.ok ? "ok" : "bad"])
              }, [
                _cache[159] || (_cache[159] = createBaseVNode("span", { class: "runtime-status-name" }, [
                  createBaseVNode("i"),
                  createTextVNode("scrcpy")
                ], -1)),
                createBaseVNode("code", {
                  title: environment.value?.scrcpy.version
                }, toDisplayString(runtimeVersion("scrcpy")), 9, _hoisted_15)
              ], 2),
              createBaseVNode("div", {
                class: normalizeClass(["runtime-status", environment.value?.adb.ok ? "ok" : "bad"])
              }, [
                _cache[160] || (_cache[160] = createBaseVNode("span", { class: "runtime-status-name" }, [
                  createBaseVNode("i"),
                  createTextVNode("adb")
                ], -1)),
                createBaseVNode("code", {
                  title: environment.value?.adb.version
                }, toDisplayString(runtimeVersion("adb")), 9, _hoisted_16)
              ], 2)
            ]),
            environment.value?.scrcpy.ok ? (openBlock(), createElementBlock("div", _hoisted_17, [
              createBaseVNode("span", _hoisted_18, toDisplayString(t("runtimeCapabilities")), 1),
              (openBlock(true), createElementBlock(Fragment, null, renderList(availableCapabilities.value, (feature) => {
                return openBlock(), createElementBlock("span", {
                  key: feature,
                  class: "capability-pill"
                }, toDisplayString(t(`capability_${feature}`)), 1);
              }), 128)),
              !availableCapabilities.value.length ? (openBlock(), createElementBlock("span", _hoisted_19, toDisplayString(t("capabilitiesUnavailable")), 1)) : createCommentVNode("", true)
            ])) : createCommentVNode("", true),
            environment.value?.scrcpy.capabilityError ? (openBlock(), createElementBlock("p", _hoisted_20, toDisplayString(t("capabilityProbeFailed")), 1)) : createCommentVNode("", true)
          ])) : createCommentVNode("", true),
          activeTab.value === "devices" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            createBaseVNode("section", _hoisted_21, [
              createBaseVNode("div", null, [
                createBaseVNode("p", _hoisted_22, toDisplayString(t("connectedDevices")), 1),
                createBaseVNode("h1", null, toDisplayString(devices.value.length) + " " + toDisplayString(t("devices").toLowerCase()), 1),
                createBaseVNode("p", _hoisted_23, toDisplayString(t(`tracker_${trackerStatus.value}`)) + " · " + toDisplayString(trackerSource.value === "track" ? t("trackerLive") : t("trackerPolling")), 1)
              ]),
              createBaseVNode("div", _hoisted_24, [
                createBaseVNode("button", {
                  class: "ghost",
                  disabled: loadingDevices.value,
                  onClick: _cache[3] || (_cache[3] = ($event) => refreshDevices(true))
                }, toDisplayString(t("refresh")), 9, _hoisted_25),
                createBaseVNode("button", {
                  class: "ghost",
                  disabled: !usableDevices.value.length,
                  onClick: toggleSelectAll
                }, toDisplayString(t("selectAll")), 9, _hoisted_26),
                createBaseVNode("button", {
                  class: "ghost",
                  disabled: config.launch.scene !== "otg" && !selectedSerials.value.length,
                  onClick: previewSelected
                }, toDisplayString(t("previewCommand")), 9, _hoisted_27),
                createBaseVNode("button", {
                  class: "primary",
                  disabled: config.launch.scene === "record-only" ? !canStartRecording.value : !environment.value?.scrcpy.ok || config.launch.scene !== "otg" && !selectedSerials.value.length,
                  onClick: launchSelected
                }, toDisplayString(config.launch.scene === "record-only" ? t("startRecording") : config.launch.scene === "otg" ? t("launchOtg") : t("launchSelected")), 9, _hoisted_28)
              ])
            ]),
            createBaseVNode("section", _hoisted_29, [
              createBaseVNode("div", _hoisted_30, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", _hoisted_31, toDisplayString(t("sceneBuilder")), 1),
                  createBaseVNode("h2", null, toDisplayString(t(`scene_${config.launch.scene}`)), 1),
                  createBaseVNode("p", _hoisted_32, toDisplayString(t(`sceneHint_${config.launch.scene}`)), 1)
                ]),
                createBaseVNode("span", _hoisted_33, toDisplayString(t("sceneReviewHint")), 1)
              ]),
              createBaseVNode("div", {
                class: "scene-picker",
                role: "list",
                "aria-label": t("chooseScene")
              }, [
                (openBlock(), createElementBlock(Fragment, null, renderList(sceneKinds, (scene) => {
                  return createBaseVNode("button", {
                    key: scene,
                    class: normalizeClass(["scene-choice", { active: config.launch.scene === scene }]),
                    disabled: !sceneSupported(scene),
                    onClick: ($event) => selectScene(scene)
                  }, [
                    createBaseVNode("strong", null, toDisplayString(t(`scene_${scene}`)), 1),
                    createBaseVNode("small", null, toDisplayString(sceneSupported(scene) ? t(`sceneShort_${scene}`) : t("unsupportedByRuntime")), 1)
                  ], 10, _hoisted_35);
                }), 64))
              ], 8, _hoisted_34),
              config.launch.scene !== "otg" ? (openBlock(), createElementBlock("div", _hoisted_36, [
                createBaseVNode("div", null, [
                  createBaseVNode("strong", null, toDisplayString(t("deviceCapabilities")), 1),
                  createBaseVNode("small", null, toDisplayString(t("deviceCapabilitiesHint")), 1)
                ]),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => probeSerial.value = $event)
                }, [
                  createBaseVNode("option", _hoisted_37, toDisplayString(t("chooseDevice")), 1),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(usableDevices.value, (device) => {
                    return openBlock(), createElementBlock("option", {
                      key: device.serial,
                      value: device.serial
                    }, toDisplayString(config.deviceAliases[device.serial] || device.model) + " · " + toDisplayString(device.serial), 9, _hoisted_38);
                  }), 128))
                ], 512), [
                  [vModelSelect, probeSerial.value]
                ]),
                createBaseVNode("button", {
                  class: "secondary compact",
                  disabled: !probeSerial.value || probingCapabilities.value,
                  onClick: _cache[5] || (_cache[5] = ($event) => probeCapabilities(Boolean(deviceCapabilities.value)))
                }, toDisplayString(probingCapabilities.value ? t("probing") : deviceCapabilities.value ? t("refreshCapabilities") : t("inspectDevice")), 9, _hoisted_39),
                deviceCapabilities.value ? (openBlock(), createElementBlock("span", _hoisted_40, toDisplayString(deviceCapabilities.value.cached ? t("cachedResult") : t("liveResult")) + " · " + toDisplayString(new Date(deviceCapabilities.value.capturedAt).toLocaleTimeString()), 1)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              deviceCapabilities.value && Object.keys(deviceCapabilities.value.errors).length ? (openBlock(), createElementBlock("div", _hoisted_41, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(deviceCapabilities.value.errors, (error, probe) => {
                  return openBlock(), createElementBlock("span", { key: probe }, [
                    createBaseVNode("strong", null, toDisplayString(probe), 1),
                    createTextVNode(toDisplayString(error), 1)
                  ]);
                }), 128))
              ])) : createCommentVNode("", true),
              createBaseVNode("div", _hoisted_42, [
                config.launch.scene === "screen" ? (openBlock(), createElementBlock("section", _hoisted_43, [
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(t("screenSource")), 1),
                    createBaseVNode("small", null, toDisplayString(t("screenSourceHint")), 1)
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("displayId")), 1),
                    deviceCapabilities.value?.displays.length ? withDirectives((openBlock(), createElementBlock("select", {
                      key: 0,
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => config.launch.displayId = $event)
                    }, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(deviceCapabilities.value.displays, (display) => {
                        return openBlock(), createElementBlock("option", {
                          key: display.id,
                          value: display.id
                        }, "#" + toDisplayString(display.id) + " · " + toDisplayString(display.width ? `${display.width}×${display.height}` : t("unknownSize")), 9, _hoisted_44);
                      }), 128))
                    ], 512)), [
                      [
                        vModelSelect,
                        config.launch.displayId,
                        void 0,
                        { number: true }
                      ]
                    ]) : withDirectives((openBlock(), createElementBlock("input", {
                      key: 1,
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => config.launch.displayId = $event),
                      type: "number",
                      min: "0"
                    }, null, 512)), [
                      [
                        vModelText,
                        config.launch.displayId,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_45, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("maxSize")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => config.launch.maxSize = $event),
                        type: "number",
                        min: "0"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.maxSize,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("maxFps")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => config.launch.maxFps = $event),
                        type: "number",
                        min: "0"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.maxFps,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ])
                ])) : createCommentVNode("", true),
                config.launch.scene === "camera" ? (openBlock(), createElementBlock("section", _hoisted_46, [
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(t("cameraSource")), 1),
                    createBaseVNode("small", null, toDisplayString(t("cameraSourceHint")), 1)
                  ]),
                  deviceCapabilities.value?.cameras.length ? (openBlock(), createElementBlock("label", _hoisted_47, [
                    createBaseVNode("span", null, toDisplayString(t("camera")), 1),
                    createBaseVNode("select", {
                      value: config.launch.cameraId,
                      onChange: selectCamera
                    }, [
                      createBaseVNode("option", _hoisted_49, toDisplayString(t("automatic")), 1),
                      (openBlock(true), createElementBlock(Fragment, null, renderList(deviceCapabilities.value.cameras, (camera) => {
                        return openBlock(), createElementBlock("option", {
                          key: camera.id,
                          value: camera.id
                        }, "#" + toDisplayString(camera.id) + " · " + toDisplayString(t(`cameraFacing_${camera.facing}`)) + " · " + toDisplayString(camera.sensorWidth) + "×" + toDisplayString(camera.sensorHeight), 9, _hoisted_50);
                      }), 128))
                    ], 40, _hoisted_48)
                  ])) : (openBlock(), createElementBlock("div", _hoisted_51, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("cameraId")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => config.launch.cameraId = $event),
                        placeholder: "0"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.cameraId,
                          void 0,
                          { trim: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("cameraFacing")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => config.launch.cameraFacing = $event)
                      }, [
                        createBaseVNode("option", _hoisted_52, toDisplayString(t("automatic")), 1),
                        createBaseVNode("option", _hoisted_53, toDisplayString(t("cameraFacing_front")), 1),
                        createBaseVNode("option", _hoisted_54, toDisplayString(t("cameraFacing_back")), 1),
                        createBaseVNode("option", _hoisted_55, toDisplayString(t("cameraFacing_external")), 1)
                      ], 512), [
                        [vModelSelect, config.launch.cameraFacing]
                      ])
                    ])
                  ])),
                  createBaseVNode("div", _hoisted_56, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("cameraSize")), 1),
                      cameraSizes.value.length ? withDirectives((openBlock(), createElementBlock("select", {
                        key: 0,
                        "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => cameraSizeValue.value = $event)
                      }, [
                        createBaseVNode("option", _hoisted_57, toDisplayString(t("automatic")), 1),
                        (openBlock(true), createElementBlock(Fragment, null, renderList(cameraSizes.value, (size) => {
                          return openBlock(), createElementBlock("option", {
                            key: `${size.width}x${size.height}-${size.highSpeed}`,
                            value: `${size.width}x${size.height}`
                          }, [
                            createTextVNode(toDisplayString(size.width) + "×" + toDisplayString(size.height), 1),
                            size.fps.length ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                              createTextVNode(" · " + toDisplayString(size.fps.join("/")) + " fps", 1)
                            ], 64)) : createCommentVNode("", true)
                          ], 8, _hoisted_58);
                        }), 128))
                      ], 512)), [
                        [vModelSelect, cameraSizeValue.value]
                      ]) : (openBlock(), createElementBlock("div", _hoisted_59, [
                        withDirectives(createBaseVNode("input", {
                          "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => config.launch.cameraSize.width = $event),
                          type: "number",
                          min: "0",
                          placeholder: "1920"
                        }, null, 512), [
                          [
                            vModelText,
                            config.launch.cameraSize.width,
                            void 0,
                            { number: true }
                          ]
                        ]),
                        withDirectives(createBaseVNode("input", {
                          "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => config.launch.cameraSize.height = $event),
                          type: "number",
                          min: "0",
                          placeholder: "1080"
                        }, null, 512), [
                          [
                            vModelText,
                            config.launch.cameraSize.height,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ]))
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("cameraFps")), 1),
                      cameraFpsOptions.value.length ? withDirectives((openBlock(), createElementBlock("select", {
                        key: 0,
                        "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => config.launch.cameraFps = $event)
                      }, [
                        createBaseVNode("option", _hoisted_60, toDisplayString(t("automatic")), 1),
                        (openBlock(true), createElementBlock(Fragment, null, renderList(cameraFpsOptions.value, (fps) => {
                          return openBlock(), createElementBlock("option", {
                            key: fps,
                            value: fps
                          }, toDisplayString(fps) + " fps", 9, _hoisted_61);
                        }), 128))
                      ], 512)), [
                        [
                          vModelSelect,
                          config.launch.cameraFps,
                          void 0,
                          { number: true }
                        ]
                      ]) : withDirectives((openBlock(), createElementBlock("input", {
                        key: 1,
                        "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => config.launch.cameraFps = $event),
                        type: "number",
                        min: "0"
                      }, null, 512)), [
                        [
                          vModelText,
                          config.launch.cameraFps,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_62, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("cameraZoom")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => config.launch.cameraZoom = $event),
                        type: "number",
                        min: "1",
                        max: selectedCamera.value?.zoomRange?.max || 100,
                        step: "0.1"
                      }, null, 8, _hoisted_63), [
                        [
                          vModelText,
                          config.launch.cameraZoom,
                          void 0,
                          { number: true }
                        ]
                      ]),
                      selectedCamera.value?.zoomRange ? (openBlock(), createElementBlock("small", _hoisted_64, toDisplayString(selectedCamera.value.zoomRange.min) + "–" + toDisplayString(selectedCamera.value.zoomRange.max) + "×", 1)) : createCommentVNode("", true)
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("audioSource")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => config.launch.audioSource = $event)
                      }, [
                        createBaseVNode("option", _hoisted_65, toDisplayString(t("cameraMicrophoneDefault")), 1),
                        createBaseVNode("option", _hoisted_66, toDisplayString(t("audioSource_mic")), 1),
                        createBaseVNode("option", _hoisted_67, toDisplayString(t("audioSource_camcorder")), 1),
                        createBaseVNode("option", _hoisted_68, toDisplayString(t("audioSource_output")), 1),
                        createBaseVNode("option", _hoisted_69, toDisplayString(t("audioSource_playback")), 1)
                      ], 512), [
                        [vModelSelect, config.launch.audioSource]
                      ])
                    ])
                  ]),
                  selectedCamera.value?.sizes.some((size) => size.highSpeed) ? (openBlock(), createElementBlock("label", _hoisted_70, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => config.launch.cameraHighSpeed = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.cameraHighSpeed]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("cameraHighSpeed")), 1)
                  ])) : createCommentVNode("", true),
                  environment.value?.scrcpy.capabilities?.features.v4l2 ? (openBlock(), createElementBlock("div", _hoisted_71, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("v4l2Sink")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => config.launch.v4l2Sink = $event),
                        placeholder: "/dev/video2"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.v4l2Sink,
                          void 0,
                          { trim: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("v4l2Buffer")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => config.launch.v4l2Buffer = $event),
                        type: "number",
                        min: "0"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.v4l2Buffer,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", _hoisted_72, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => config.launch.v4l2Playback = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.launch.v4l2Playback]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("v4l2Playback")), 1)
                    ])
                  ])) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                config.launch.scene === "virtual-display" ? (openBlock(), createElementBlock("section", _hoisted_73, [
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(t("virtualDisplay")), 1),
                    createBaseVNode("small", null, toDisplayString(t("virtualDisplayHint")), 1)
                  ]),
                  createBaseVNode("div", _hoisted_74, [
                    createBaseVNode("button", {
                      class: "ghost compact",
                      onClick: _cache[23] || (_cache[23] = ($event) => applyVirtualDisplayPreset("presentation"))
                    }, toDisplayString(t("presetPresentation")), 1),
                    createBaseVNode("button", {
                      class: "ghost compact",
                      onClick: _cache[24] || (_cache[24] = ($event) => applyVirtualDisplayPreset("desktop"))
                    }, toDisplayString(t("presetDesktop")), 1),
                    createBaseVNode("button", {
                      class: "ghost compact",
                      onClick: _cache[25] || (_cache[25] = ($event) => applyVirtualDisplayPreset("isolated"))
                    }, toDisplayString(t("presetIsolated")), 1)
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("startAppPackage")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => config.launch.virtualDisplay.startApp = $event),
                      list: "launchable-apps",
                      placeholder: "com.android.settings"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.virtualDisplay.startApp,
                        void 0,
                        { trim: true }
                      ]
                    ]),
                    createBaseVNode("datalist", _hoisted_75, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(visibleApps.value, (app) => {
                        return openBlock(), createElementBlock("option", {
                          key: app.packageId,
                          value: app.packageId
                        }, toDisplayString(app.label), 9, _hoisted_76);
                      }), 128))
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_77, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("width")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => config.launch.virtualDisplay.width = $event),
                        type: "number",
                        min: "0"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.virtualDisplay.width,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("height")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => config.launch.virtualDisplay.height = $event),
                        type: "number",
                        min: "0"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.virtualDisplay.height,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      _cache[161] || (_cache[161] = createBaseVNode("span", null, "DPI", -1)),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => config.launch.virtualDisplay.dpi = $event),
                        type: "number",
                        min: "0"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.virtualDisplay.dpi,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_78, [
                    createBaseVNode("label", _hoisted_79, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => config.launch.virtualDisplay.systemDecorations = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.launch.virtualDisplay.systemDecorations]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("systemDecorations")), 1)
                    ]),
                    createBaseVNode("label", _hoisted_80, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => config.launch.virtualDisplay.destroyContent = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.launch.virtualDisplay.destroyContent]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("destroyContent")), 1)
                    ]),
                    createBaseVNode("label", _hoisted_81, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => config.launch.virtualDisplay.flexDisplay = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.launch.virtualDisplay.flexDisplay]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("flexDisplay")), 1)
                    ]),
                    createBaseVNode("label", _hoisted_82, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => config.launch.virtualDisplay.keepActive = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.launch.virtualDisplay.keepActive]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("keepActive")), 1)
                    ])
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("displayImePolicy")), 1),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => config.launch.virtualDisplay.imePolicy = $event)
                    }, [
                      createBaseVNode("option", _hoisted_83, toDisplayString(t("defaultDisplay")), 1),
                      createBaseVNode("option", _hoisted_84, toDisplayString(t("localDisplay")), 1)
                    ], 512), [
                      [vModelSelect, config.launch.virtualDisplay.imePolicy]
                    ])
                  ])
                ])) : createCommentVNode("", true),
                config.launch.scene === "record-only" ? (openBlock(), createElementBlock("section", _hoisted_85, [
                  createBaseVNode("div", null, [
                    createBaseVNode("div", _hoisted_86, [
                      createBaseVNode("strong", null, toDisplayString(t("recordOnlySetup")), 1),
                      createBaseVNode("div", _hoisted_87, [
                        createBaseVNode("button", {
                          class: "primary compact",
                          disabled: !canStartRecording.value,
                          onClick: startRecording
                        }, toDisplayString(t("startRecording")), 9, _hoisted_88),
                        createBaseVNode("button", {
                          class: "danger compact",
                          disabled: recordingBusy.value || !backgroundRecordings.value.some((session) => session.state !== "stopping"),
                          onClick: stopRecording
                        }, toDisplayString(t("stopRecording")), 9, _hoisted_89)
                      ])
                    ]),
                    backgroundRecordings.value.length ? (openBlock(), createElementBlock("div", _hoisted_90, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(backgroundRecordings.value, (session) => {
                        return openBlock(), createElementBlock("div", {
                          key: session.id,
                          class: normalizeClass(["recording-status-bar", { running: session.state === "running" }])
                        }, [
                          createBaseVNode("span", _hoisted_91, [
                            _cache[162] || (_cache[162] = createBaseVNode("i", { "aria-hidden": "true" }, null, -1)),
                            createTextVNode(toDisplayString(session.state === "running" ? t("recordingInProgress") : t(`sessionState_${session.state}`)), 1)
                          ]),
                          backgroundRecordings.value.length > 1 ? (openBlock(), createElementBlock("span", {
                            key: 0,
                            class: "recording-status-device",
                            title: sessionDeviceLabel(session)
                          }, toDisplayString(sessionDeviceLabel(session)), 9, _hoisted_92)) : createCommentVNode("", true),
                          createBaseVNode("time", {
                            class: "recording-duration",
                            "aria-label": t("recordingDuration")
                          }, toDisplayString(recordingDuration(session)), 9, _hoisted_93)
                        ], 2);
                      }), 128))
                    ])) : createCommentVNode("", true),
                    createBaseVNode("small", null, toDisplayString(t("recordOnlyHint")), 1)
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("recordDirectory")), 1),
                    createBaseVNode("div", _hoisted_94, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => config.launch.recordDirectory = $event)
                      }, null, 512), [
                        [vModelText, config.launch.recordDirectory]
                      ]),
                      createBaseVNode("button", {
                        class: "ghost compact",
                        onClick: chooseRecordDirectory
                      }, toDisplayString(t("chooseFolder")), 1)
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_95, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("recordFormat")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => config.launch.recordFormat = $event)
                      }, [
                        createBaseVNode("option", _hoisted_96, toDisplayString(t("automatic")), 1),
                        _cache[164] || (_cache[164] = createBaseVNode("option", { value: "mp4" }, "MP4", -1)),
                        _cache[165] || (_cache[165] = createBaseVNode("option", { value: "mkv" }, "MKV", -1)),
                        !config.launch.recordVideo ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                          _cache[163] || (_cache[163] = createStaticVNode('<option value="m4a">M4A</option><option value="mka">MKA</option><option value="opus">Opus</option><option value="aac">AAC</option><option value="flac">FLAC</option><option value="wav">WAV</option>', 6))
                        ], 64)) : createCommentVNode("", true)
                      ], 512), [
                        [vModelSelect, config.launch.recordFormat]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("timeLimit")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => config.launch.timeLimit = $event),
                        type: "number",
                        min: "0",
                        max: "86400"
                      }, null, 512), [
                        [
                          vModelText,
                          config.launch.timeLimit,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_97, [
                    createBaseVNode("label", _hoisted_98, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => config.launch.recordVideo = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.launch.recordVideo]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("recordVideo")), 1)
                    ]),
                    createBaseVNode("label", _hoisted_99, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => config.launch.recordAudio = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.launch.recordAudio]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("recordAudio")), 1)
                    ])
                  ])
                ])) : createCommentVNode("", true),
                config.launch.scene === "control-only" || config.launch.scene === "otg" ? (openBlock(), createElementBlock("section", _hoisted_100, [
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(config.launch.scene === "otg" ? t("otgInput") : t("controlOnlyInput")), 1),
                    createBaseVNode("small", null, toDisplayString(t(config.launch.scene === "otg" ? "otgInputHint" : "controlOnlyInputHint")), 1)
                  ]),
                  config.launch.scene === "otg" ? (openBlock(), createElementBlock("label", _hoisted_101, [
                    createBaseVNode("span", null, toDisplayString(t("optionalUsbSerial")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => otgUsbSerial.value = $event),
                      placeholder: t("singleUsbAutomatic")
                    }, null, 8, _hoisted_102), [
                      [
                        vModelText,
                        otgUsbSerial.value,
                        void 0,
                        { trim: true }
                      ]
                    ]),
                    createBaseVNode("small", null, toDisplayString(t("otgNoAdbHint")), 1)
                  ])) : createCommentVNode("", true),
                  createBaseVNode("div", _hoisted_103, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("keyboardMode")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => config.launch.keyboardMode = $event)
                      }, [
                        createBaseVNode("option", _hoisted_104, toDisplayString(t("automatic")), 1),
                        config.launch.scene !== "otg" ? (openBlock(), createElementBlock("option", _hoisted_105, "SDK")) : createCommentVNode("", true),
                        config.launch.scene !== "otg" ? (openBlock(), createElementBlock("option", _hoisted_106, "UHID")) : createCommentVNode("", true),
                        _cache[166] || (_cache[166] = createBaseVNode("option", { value: "aoa" }, "AOA", -1)),
                        createBaseVNode("option", _hoisted_107, toDisplayString(t("disabled")), 1)
                      ], 512), [
                        [vModelSelect, config.launch.keyboardMode]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("mouseMode")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[42] || (_cache[42] = ($event) => config.launch.mouseMode = $event)
                      }, [
                        createBaseVNode("option", _hoisted_108, toDisplayString(t("automatic")), 1),
                        config.launch.scene !== "otg" ? (openBlock(), createElementBlock("option", _hoisted_109, "SDK")) : createCommentVNode("", true),
                        config.launch.scene !== "otg" ? (openBlock(), createElementBlock("option", _hoisted_110, "UHID")) : createCommentVNode("", true),
                        _cache[167] || (_cache[167] = createBaseVNode("option", { value: "aoa" }, "AOA", -1)),
                        createBaseVNode("option", _hoisted_111, toDisplayString(t("disabled")), 1)
                      ], 512), [
                        [vModelSelect, config.launch.mouseMode]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("gamepadMode")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => config.launch.gamepadMode = $event)
                      }, [
                        createBaseVNode("option", _hoisted_112, toDisplayString(t("disabled")), 1),
                        config.launch.scene !== "otg" ? (openBlock(), createElementBlock("option", _hoisted_113, "UHID")) : createCommentVNode("", true),
                        _cache[168] || (_cache[168] = createBaseVNode("option", { value: "aoa" }, "AOA", -1))
                      ], 512), [
                        [vModelSelect, config.launch.gamepadMode]
                      ])
                    ])
                  ])
                ])) : createCommentVNode("", true),
                visualScene.value ? (openBlock(), createElementBlock("section", _hoisted_114, [
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(t("mediaEncoding")), 1),
                    createBaseVNode("small", null, toDisplayString(t("mediaEncodingHint")), 1)
                  ]),
                  createBaseVNode("div", _hoisted_115, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("codec")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => config.launch.videoCodec = $event)
                      }, [
                        createBaseVNode("option", _hoisted_116, toDisplayString(t("automatic")), 1),
                        _cache[169] || (_cache[169] = createStaticVNode('<option value="h264">H.264</option><option value="h265">H.265</option><option value="av1">AV1</option><option value="vp8">VP8</option><option value="vp9">VP9</option>', 5))
                      ], 512), [
                        [vModelSelect, config.launch.videoCodec]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("videoEncoder")), 1),
                      deviceCapabilities.value?.videoEncoders.length ? withDirectives((openBlock(), createElementBlock("select", {
                        key: 0,
                        "onUpdate:modelValue": _cache[45] || (_cache[45] = ($event) => config.launch.videoEncoder = $event)
                      }, [
                        createBaseVNode("option", _hoisted_117, toDisplayString(t("automatic")), 1),
                        (openBlock(true), createElementBlock(Fragment, null, renderList(deviceCapabilities.value.videoEncoders, (encoder) => {
                          return openBlock(), createElementBlock("option", {
                            key: `${encoder.codec}-${encoder.name}`,
                            value: encoder.name
                          }, toDisplayString(encoder.codec) + " · " + toDisplayString(encoder.name) + " · " + toDisplayString(encoder.implementation), 9, _hoisted_118);
                        }), 128))
                      ], 512)), [
                        [vModelSelect, config.launch.videoEncoder]
                      ]) : withDirectives((openBlock(), createElementBlock("input", {
                        key: 1,
                        "onUpdate:modelValue": _cache[46] || (_cache[46] = ($event) => config.launch.videoEncoder = $event),
                        placeholder: t("automatic")
                      }, null, 8, _hoisted_119)), [
                        [
                          vModelText,
                          config.launch.videoEncoder,
                          void 0,
                          { trim: true }
                        ]
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_120, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("audioCodec")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[47] || (_cache[47] = ($event) => config.launch.audioCodec = $event)
                      }, [
                        createBaseVNode("option", _hoisted_121, toDisplayString(t("automatic")), 1),
                        _cache[170] || (_cache[170] = createBaseVNode("option", { value: "opus" }, "Opus", -1)),
                        _cache[171] || (_cache[171] = createBaseVNode("option", { value: "aac" }, "AAC", -1)),
                        _cache[172] || (_cache[172] = createBaseVNode("option", { value: "flac" }, "FLAC", -1)),
                        _cache[173] || (_cache[173] = createBaseVNode("option", { value: "raw" }, "RAW", -1))
                      ], 512), [
                        [vModelSelect, config.launch.audioCodec]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("audioEncoder")), 1),
                      deviceCapabilities.value?.audioEncoders.length ? withDirectives((openBlock(), createElementBlock("select", {
                        key: 0,
                        "onUpdate:modelValue": _cache[48] || (_cache[48] = ($event) => config.launch.audioEncoder = $event)
                      }, [
                        createBaseVNode("option", _hoisted_122, toDisplayString(t("automatic")), 1),
                        (openBlock(true), createElementBlock(Fragment, null, renderList(deviceCapabilities.value.audioEncoders, (encoder) => {
                          return openBlock(), createElementBlock("option", {
                            key: `${encoder.codec}-${encoder.name}`,
                            value: encoder.name
                          }, toDisplayString(encoder.codec) + " · " + toDisplayString(encoder.name) + " · " + toDisplayString(encoder.implementation), 9, _hoisted_123);
                        }), 128))
                      ], 512)), [
                        [vModelSelect, config.launch.audioEncoder]
                      ]) : withDirectives((openBlock(), createElementBlock("input", {
                        key: 1,
                        "onUpdate:modelValue": _cache[49] || (_cache[49] = ($event) => config.launch.audioEncoder = $event),
                        placeholder: t("automatic")
                      }, null, 8, _hoisted_124)), [
                        [
                          vModelText,
                          config.launch.audioEncoder,
                          void 0,
                          { trim: true }
                        ]
                      ])
                    ])
                  ])
                ])) : createCommentVNode("", true)
              ]),
              createBaseVNode("div", _hoisted_125, [
                createBaseVNode("span", null, toDisplayString(config.launch.scene === "otg" ? t("automaticUsbTarget") : `${t("selectedTargets")}: ${selectedSerials.value.length}`), 1),
                createBaseVNode("div", _hoisted_126, [
                  createBaseVNode("button", {
                    class: "ghost",
                    disabled: config.launch.scene !== "otg" && !selectedSerials.value.length,
                    onClick: previewSelected
                  }, toDisplayString(t("previewCommand")), 9, _hoisted_127),
                  createBaseVNode("button", {
                    class: "primary",
                    disabled: config.launch.scene === "record-only" ? !canStartRecording.value : !environment.value?.scrcpy.ok || config.launch.scene !== "otg" && !selectedSerials.value.length,
                    onClick: launchSelected
                  }, toDisplayString(config.launch.scene === "record-only" ? t("startRecording") : config.launch.scene === "otg" ? t("launchOtg") : t("launchSelected")), 9, _hoisted_128)
                ])
              ])
            ]),
            devices.value.length ? (openBlock(), createElementBlock("section", _hoisted_129, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(devices.value, (device) => {
                return openBlock(), createElementBlock("article", {
                  key: device.serial,
                  class: normalizeClass(["device-card", { selected: selectedSerials.value.includes(device.serial) }])
                }, [
                  createBaseVNode("label", _hoisted_130, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[50] || (_cache[50] = ($event) => selectedSerials.value = $event),
                      type: "checkbox",
                      value: device.serial,
                      disabled: device.state !== "device"
                    }, null, 8, _hoisted_131), [
                      [vModelCheckbox, selectedSerials.value]
                    ]),
                    _cache[174] || (_cache[174] = createBaseVNode("span", { class: "phone-icon" }, "▯", -1)),
                    createBaseVNode("span", _hoisted_132, [
                      createBaseVNode("strong", null, toDisplayString(config.deviceAliases[device.serial] || device.model), 1),
                      createBaseVNode("code", null, toDisplayString(device.serial), 1)
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_133, [
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("deviceAlias")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": ($event) => config.deviceAliases[device.serial] = $event,
                        placeholder: device.model
                      }, null, 8, _hoisted_134), [
                        [
                          vModelText,
                          config.deviceAliases[device.serial],
                          void 0,
                          { trim: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("launchProfile")), 1),
                      createBaseVNode("select", {
                        value: config.deviceProfiles[device.serial] || "",
                        onChange: ($event) => assignProfile(device.serial, $event)
                      }, [
                        createBaseVNode("option", _hoisted_136, toDisplayString(t("globalSettings")), 1),
                        (openBlock(true), createElementBlock(Fragment, null, renderList(config.profiles, (profile) => {
                          return openBlock(), createElementBlock("option", {
                            key: profile.id,
                            value: profile.id
                          }, toDisplayString(profile.name), 9, _hoisted_137);
                        }), 128))
                      ], 40, _hoisted_135)
                    ])
                  ]),
                  createBaseVNode("label", _hoisted_138, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.autoLaunchDevices[device.serial] = $event,
                      type: "checkbox"
                    }, null, 8, _hoisted_139), [
                      [vModelCheckbox, config.autoLaunchDevices[device.serial]]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("autoLaunchDevice")), 1)
                  ]),
                  createBaseVNode("div", _hoisted_140, [
                    createBaseVNode("span", {
                      class: normalizeClass(["status-dot", device.state, deviceSessionState(device.serial)])
                    }, toDisplayString(statusLabel(device)), 3),
                    createBaseVNode("div", _hoisted_141, [
                      activeSerials.value.has(device.serial) ? (openBlock(), createElementBlock("button", {
                        key: 0,
                        class: "danger compact",
                        onClick: ($event) => stop(device.serial)
                      }, toDisplayString(t("stop")), 9, _hoisted_142)) : createCommentVNode("", true),
                      device.connection === "wireless" ? (openBlock(), createElementBlock("button", {
                        key: 1,
                        class: "ghost compact",
                        onClick: ($event) => disconnect(device.serial)
                      }, toDisplayString(t("disconnect")), 9, _hoisted_143)) : createCommentVNode("", true)
                    ])
                  ]),
                  device.state === "unauthorized" ? (openBlock(), createElementBlock("p", _hoisted_144, toDisplayString(t("unauthorized")), 1)) : createCommentVNode("", true)
                ], 2);
              }), 128))
            ])) : (openBlock(), createElementBlock("section", _hoisted_145, [
              _cache[175] || (_cache[175] = createBaseVNode("span", { class: "empty-icon" }, "⌁", -1)),
              createBaseVNode("p", null, toDisplayString(t("noDevices")), 1)
            ])),
            commandPreviews.value.length ? (openBlock(), createElementBlock("section", _hoisted_146, [
              createBaseVNode("div", _hoisted_147, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", _hoisted_148, toDisplayString(t("commandPreview")), 1),
                  createBaseVNode("p", _hoisted_149, toDisplayString(t("commandPreviewHint")), 1)
                ]),
                createBaseVNode("button", {
                  class: "ghost compact",
                  onClick: _cache[51] || (_cache[51] = ($event) => commandPreviews.value = [])
                }, toDisplayString(t("close")), 1)
              ]),
              createBaseVNode("div", _hoisted_150, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(commandPreviews.value, (preview) => {
                  return openBlock(), createElementBlock("article", {
                    key: preview.serial
                  }, [
                    createBaseVNode("strong", null, toDisplayString(previewLabel(preview.serial)), 1),
                    createBaseVNode("code", null, toDisplayString(previewArgv(preview)), 1),
                    createBaseVNode("div", _hoisted_151, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(preview.details, (detail, index) => {
                        return openBlock(), createElementBlock("div", {
                          key: `${detail.arg}-${index}`
                        }, [
                          createBaseVNode("code", null, toDisplayString(detail.arg), 1),
                          createBaseVNode("span", null, toDisplayString(previewSource(detail)), 1),
                          createBaseVNode("small", null, toDisplayString(t(detail.helpKey)), 1)
                        ]);
                      }), 128))
                    ]),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(preview.warnings, (warning) => {
                      return openBlock(), createElementBlock("p", {
                        key: warning,
                        class: "inline-warning"
                      }, toDisplayString(warning), 1);
                    }), 128))
                  ]);
                }), 128))
              ])
            ])) : createCommentVNode("", true),
            usableDevices.value.length ? (openBlock(), createElementBlock("section", _hoisted_152, [
              createBaseVNode("div", _hoisted_153, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", _hoisted_154, toDisplayString(t("deviceWorkspace")), 1),
                  createBaseVNode("p", _hoisted_155, toDisplayString(t("deviceWorkspaceHint")), 1)
                ]),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[52] || (_cache[52] = ($event) => controlSerial.value = $event),
                  disabled: !usableDevices.value.length
                }, [
                  createBaseVNode("option", _hoisted_157, toDisplayString(t("chooseDevice")), 1),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(usableDevices.value, (device) => {
                    return openBlock(), createElementBlock("option", {
                      key: device.serial,
                      value: device.serial
                    }, toDisplayString(config.deviceAliases[device.serial] || device.model) + " · " + toDisplayString(device.serial), 9, _hoisted_158);
                  }), 128))
                ], 8, _hoisted_156), [
                  [vModelSelect, controlSerial.value]
                ])
              ]),
              createBaseVNode("nav", {
                class: "workspace-tabs",
                "aria-label": t("deviceWorkspace")
              }, [
                (openBlock(), createElementBlock(Fragment, null, renderList(["overview", "control", "apps", "files"], (section) => {
                  return createBaseVNode("button", {
                    key: section,
                    class: normalizeClass({ active: workspaceSection.value === section }),
                    disabled: !controlDevice.value,
                    onClick: ($event) => setWorkspaceSection(section)
                  }, toDisplayString(t(`workspace_${section}`)), 11, _hoisted_160);
                }), 64))
              ], 8, _hoisted_159),
              workspaceSection.value === "overview" ? (openBlock(), createElementBlock("div", _hoisted_161, [
                loadingOverview.value ? (openBlock(), createElementBlock("p", _hoisted_162, toDisplayString(t("loadingDeviceDetails")), 1)) : deviceOverview.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  createBaseVNode("div", _hoisted_163, [
                    createBaseVNode("div", null, [
                      createBaseVNode("span", null, toDisplayString(t("manufacturer")), 1),
                      createBaseVNode("strong", null, toDisplayString(deviceOverview.value.manufacturer || "—"), 1)
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode("span", null, toDisplayString(t("model")), 1),
                      createBaseVNode("strong", null, toDisplayString(deviceOverview.value.model || "—"), 1)
                    ]),
                    createBaseVNode("div", null, [
                      _cache[176] || (_cache[176] = createBaseVNode("span", null, "Android", -1)),
                      createBaseVNode("strong", null, [
                        createTextVNode(toDisplayString(deviceOverview.value.androidVersion || "—") + " ", 1),
                        deviceOverview.value.sdk ? (openBlock(), createElementBlock("small", _hoisted_164, "API " + toDisplayString(deviceOverview.value.sdk), 1)) : createCommentVNode("", true)
                      ])
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode("span", null, toDisplayString(t("display")), 1),
                      createBaseVNode("strong", null, toDisplayString(deviceOverview.value.displaySize || "—"), 1)
                    ]),
                    createBaseVNode("div", null, [
                      _cache[177] || (_cache[177] = createBaseVNode("span", null, "ABI", -1)),
                      createBaseVNode("strong", null, toDisplayString(deviceOverview.value.abi || "—"), 1)
                    ]),
                    createBaseVNode("div", null, [
                      createBaseVNode("span", null, toDisplayString(t("battery")), 1),
                      createBaseVNode("strong", null, toDisplayString(deviceOverview.value.batteryLevel === void 0 ? "—" : `${deviceOverview.value.batteryLevel}%`), 1)
                    ])
                  ]),
                  createBaseVNode("button", {
                    class: "ghost compact",
                    onClick: loadDeviceOverview
                  }, toDisplayString(t("refreshDetails")), 1)
                ], 64)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              workspaceSection.value === "control" ? (openBlock(), createElementBlock("div", _hoisted_165, [
                createBaseVNode("div", _hoisted_166, [
                  (openBlock(), createElementBlock(Fragment, null, renderList(controlActions, (action) => {
                    return createBaseVNode("button", {
                      key: action,
                      class: "ghost",
                      disabled: !controlDevice.value || recordingAutomation.value && !!replayingAutomation.value,
                      onClick: ($event) => sendControlAction(action)
                    }, [
                      createBaseVNode("span", null, toDisplayString(actionLabel(action)), 1),
                      createBaseVNode("kbd", null, toDisplayString(actionShortcut(action)), 1)
                    ], 8, _hoisted_167);
                  }), 64)),
                  createBaseVNode("button", {
                    class: "secondary",
                    disabled: !controlDevice.value,
                    onClick: takeScreenshot
                  }, [
                    createBaseVNode("span", null, toDisplayString(t("saveScreenshot")), 1),
                    unref(isMac) ? (openBlock(), createElementBlock("kbd", _hoisted_169, "⌘⇧S")) : createCommentVNode("", true)
                  ], 8, _hoisted_168),
                  createBaseVNode("button", {
                    class: "secondary",
                    disabled: !controlDevice.value,
                    onClick: copyScreenshot
                  }, [
                    createBaseVNode("span", null, toDisplayString(t("copyScreenshot")), 1),
                    unref(isMac) ? (openBlock(), createElementBlock("kbd", _hoisted_171, "⌘⇧C")) : createCommentVNode("", true)
                  ], 8, _hoisted_170)
                ]),
                createBaseVNode("div", _hoisted_172, [
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(t("automation")), 1),
                    createBaseVNode("small", null, toDisplayString(t("automationHint")), 1)
                  ]),
                  createBaseVNode("div", _hoisted_173, [
                    !recordingAutomation.value ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: "secondary compact",
                      disabled: !controlDevice.value || !!replayingAutomation.value,
                      onClick: startAutomationRecording
                    }, toDisplayString(t("startRecordingActions")), 9, _hoisted_174)) : (openBlock(), createElementBlock("button", {
                      key: 1,
                      class: "danger compact recording",
                      onClick: stopAutomationRecording
                    }, toDisplayString(t("stopRecordingActions")) + " · " + toDisplayString(recordedSteps.value.length), 1))
                  ])
                ]),
                recordedSteps.value.length && !recordingAutomation.value ? (openBlock(), createElementBlock("div", _hoisted_175, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[53] || (_cache[53] = ($event) => automationName.value = $event),
                    placeholder: t("automationName")
                  }, null, 8, _hoisted_176), [
                    [
                      vModelText,
                      automationName.value,
                      void 0,
                      { trim: true }
                    ]
                  ]),
                  createBaseVNode("button", {
                    class: "secondary",
                    onClick: saveAutomation
                  }, toDisplayString(t("save")), 1),
                  createBaseVNode("button", {
                    class: "ghost",
                    onClick: _cache[54] || (_cache[54] = ($event) => recordedSteps.value = [])
                  }, toDisplayString(t("discard")), 1)
                ])) : createCommentVNode("", true),
                config.automations.length ? (openBlock(), createElementBlock("div", _hoisted_177, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(config.automations, (macro) => {
                    return openBlock(), createElementBlock("div", {
                      key: macro.id,
                      class: "saved-row"
                    }, [
                      createBaseVNode("span", null, [
                        createBaseVNode("strong", null, toDisplayString(macro.name), 1),
                        createBaseVNode("small", null, toDisplayString(macro.steps.length) + " " + toDisplayString(t("actions")), 1)
                      ]),
                      createBaseVNode("div", _hoisted_178, [
                        createBaseVNode("button", {
                          class: "secondary compact",
                          disabled: !controlDevice.value || !!replayingAutomation.value,
                          onClick: ($event) => replayAutomation(macro)
                        }, toDisplayString(replayingAutomation.value === macro.id ? t("replaying") : t("replay")), 9, _hoisted_179),
                        createBaseVNode("button", {
                          class: "ghost compact",
                          disabled: !!replayingAutomation.value,
                          onClick: ($event) => deleteAutomation(macro.id)
                        }, toDisplayString(t("delete")), 9, _hoisted_180)
                      ])
                    ]);
                  }), 128))
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              workspaceSection.value === "apps" ? (openBlock(), createElementBlock("div", _hoisted_181, [
                createBaseVNode("div", _hoisted_182, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[55] || (_cache[55] = ($event) => appSearch.value = $event),
                    type: "search",
                    placeholder: t("searchApps")
                  }, null, 8, _hoisted_183), [
                    [
                      vModelText,
                      appSearch.value,
                      void 0,
                      { trim: true }
                    ]
                  ]),
                  createBaseVNode("label", _hoisted_184, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[56] || (_cache[56] = ($event) => showSystemApps.value = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, showSystemApps.value]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showSystemApps")), 1)
                  ]),
                  createBaseVNode("button", {
                    class: "ghost",
                    disabled: loadingApps.value,
                    onClick: _cache[57] || (_cache[57] = ($event) => loadInstalledApps(true))
                  }, toDisplayString(t("refresh")), 9, _hoisted_185)
                ]),
                loadingApps.value ? (openBlock(), createElementBlock("p", _hoisted_186, toDisplayString(t("loadingApps")), 1)) : visibleApps.value.length ? (openBlock(), createElementBlock("div", _hoisted_187, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(visibleApps.value, (app) => {
                    return openBlock(), createElementBlock("div", {
                      key: app.packageId,
                      class: "app-row"
                    }, [
                      createBaseVNode("span", null, [
                        createBaseVNode("strong", null, toDisplayString(app.label), 1),
                        createTextVNode(" "),
                        createBaseVNode("code", null, toDisplayString(app.packageId), 1)
                      ]),
                      app.system ? (openBlock(), createElementBlock("span", _hoisted_188, toDisplayString(t("systemApp")), 1)) : createCommentVNode("", true),
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: ($event) => startInstalledApp(app)
                      }, toDisplayString(t("startApp")), 9, _hoisted_189)
                    ]);
                  }), 128))
                ])) : (openBlock(), createElementBlock("p", _hoisted_190, toDisplayString(t("noApps")), 1))
              ])) : createCommentVNode("", true),
              workspaceSection.value === "files" ? (openBlock(), createElementBlock("div", _hoisted_191, [
                createBaseVNode("p", _hoisted_192, [
                  createTextVNode(toDisplayString(t("batchTargets")) + ": ", 1),
                  createBaseVNode("strong", null, toDisplayString(workspaceTargets.value.length), 1),
                  createTextVNode(" · " + toDisplayString(t("selectedDevicesTakePriority")), 1)
                ]),
                createBaseVNode("div", _hoisted_193, [
                  createBaseVNode("div", _hoisted_194, [
                    createBaseVNode("div", null, [
                      createBaseVNode("strong", null, toDisplayString(t("pushFiles")), 1),
                      createBaseVNode("small", null, toDisplayString(t("pushFilesHint")), 1)
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("targetDirectory")), 1),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[58] || (_cache[58] = ($event) => fileTarget.value = $event),
                        placeholder: "/sdcard/Download/"
                      }, null, 512), [
                        [
                          vModelText,
                          fileTarget.value,
                          void 0,
                          { trim: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("label", null, [
                      createBaseVNode("span", null, toDisplayString(t("existingFile")), 1),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[59] || (_cache[59] = ($event) => fileConflict.value = $event)
                      }, [
                        createBaseVNode("option", _hoisted_195, toDisplayString(t("replace")), 1),
                        createBaseVNode("option", _hoisted_196, toDisplayString(t("skip")), 1)
                      ], 512), [
                        [vModelSelect, fileConflict.value]
                      ])
                    ]),
                    createBaseVNode("button", {
                      class: "secondary",
                      disabled: workspaceBusy.value || !workspaceTargets.value.length || !fileTarget.value,
                      onClick: pushSelectedFiles
                    }, toDisplayString(t("chooseAndPush")), 9, _hoisted_197)
                  ]),
                  createBaseVNode("div", _hoisted_198, [
                    createBaseVNode("div", null, [
                      createBaseVNode("strong", null, toDisplayString(t("installApk")), 1),
                      createBaseVNode("small", null, toDisplayString(t("installApkHint")), 1)
                    ]),
                    createBaseVNode("label", _hoisted_199, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[60] || (_cache[60] = ($event) => installReplace.value = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, installReplace.value]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("replaceExistingApp")), 1)
                    ]),
                    createBaseVNode("label", _hoisted_200, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[61] || (_cache[61] = ($event) => installDowngrade.value = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, installDowngrade.value]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("allowDowngrade")), 1)
                    ]),
                    createBaseVNode("button", {
                      class: "secondary",
                      disabled: workspaceBusy.value || !workspaceTargets.value.length,
                      onClick: installSelectedApk
                    }, toDisplayString(t("chooseAndInstall")), 9, _hoisted_201)
                  ])
                ]),
                workspaceResults.value.length ? (openBlock(), createElementBlock("div", _hoisted_202, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(workspaceResults.value, (result) => {
                    return openBlock(), createElementBlock("div", {
                      key: result.targetId,
                      class: normalizeClass(["batch-result", result.ok ? "ok" : "failed"])
                    }, [
                      createBaseVNode("span", null, [
                        createBaseVNode("strong", null, toDisplayString(result.targetId), 1),
                        result.data ? (openBlock(), createElementBlock("small", _hoisted_203, toDisplayString(formatBytes(result.data.size)), 1)) : createCommentVNode("", true)
                      ]),
                      createBaseVNode("p", null, toDisplayString(workspaceResultMessage(result)), 1),
                      result.error?.detail ? (openBlock(), createElementBlock("details", _hoisted_204, [
                        createBaseVNode("summary", null, toDisplayString(t("errorDetails")), 1),
                        createBaseVNode("code", null, toDisplayString(result.error.detail), 1)
                      ])) : createCommentVNode("", true)
                    ], 2);
                  }), 128))
                ])) : workspaceProgress.value.length ? (openBlock(), createElementBlock("div", _hoisted_205, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(workspaceProgress.value, (progress) => {
                    return openBlock(), createElementBlock("div", {
                      key: progress.targetId,
                      class: normalizeClass(["batch-result", progress.status === "failed" ? "failed" : "ok"])
                    }, [
                      createBaseVNode("span", null, [
                        createBaseVNode("strong", null, toDisplayString(progress.targetId), 1),
                        progress.size !== void 0 ? (openBlock(), createElementBlock("small", _hoisted_206, toDisplayString(formatBytes(progress.size)), 1)) : createCommentVNode("", true)
                      ]),
                      createBaseVNode("p", null, toDisplayString(progress.status) + " · " + toDisplayString(progress.message), 1)
                    ], 2);
                  }), 128))
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
            ])) : createCommentVNode("", true),
            createBaseVNode("section", _hoisted_207, [
              createBaseVNode("div", _hoisted_208, [
                createBaseVNode("div", null, [
                  _cache[178] || (_cache[178] = createBaseVNode("p", { class: "eyebrow" }, "M4", -1)),
                  createBaseVNode("h2", null, toDisplayString(t("deviceGroups")), 1),
                  createBaseVNode("p", _hoisted_209, toDisplayString(t("deviceGroupsHint")), 1)
                ]),
                createBaseVNode("span", _hoisted_210, toDisplayString(selectedSerials.value.length) + " " + toDisplayString(t("selected")), 1)
              ]),
              createBaseVNode("div", _hoisted_211, [
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("groupName")), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[62] || (_cache[62] = ($event) => groupName.value = $event),
                    maxlength: "128"
                  }, null, 512), [
                    [
                      vModelText,
                      groupName.value,
                      void 0,
                      { trim: true }
                    ]
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("description")), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[63] || (_cache[63] = ($event) => groupDescription.value = $event),
                    maxlength: "1024"
                  }, null, 512), [
                    [
                      vModelText,
                      groupDescription.value,
                      void 0,
                      { trim: true }
                    ]
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("defaultProfile")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[64] || (_cache[64] = ($event) => groupProfileId.value = $event)
                  }, [
                    createBaseVNode("option", _hoisted_212, toDisplayString(t("perDeviceOrGlobal")), 1),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(config.profiles, (profile) => {
                      return openBlock(), createElementBlock("option", {
                        key: profile.id,
                        value: profile.id
                      }, toDisplayString(profile.name) + " · " + toDisplayString(t(`scene_${profile.launch.scene}`)), 9, _hoisted_213);
                    }), 128))
                  ], 512), [
                    [vModelSelect, groupProfileId.value]
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("concurrencyLimit")), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[65] || (_cache[65] = ($event) => groupConcurrency.value = $event),
                    type: "number",
                    min: "1",
                    max: "8"
                  }, null, 512), [
                    [
                      vModelText,
                      groupConcurrency.value,
                      void 0,
                      { number: true }
                    ]
                  ])
                ]),
                createBaseVNode("div", _hoisted_214, [
                  createBaseVNode("button", {
                    class: "secondary",
                    onClick: saveGroup
                  }, toDisplayString(editingGroupId.value ? t("updateGroup") : t("saveGroup")), 1),
                  editingGroupId.value ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "ghost",
                    onClick: resetGroupForm
                  }, toDisplayString(t("cancel")), 1)) : createCommentVNode("", true)
                ])
              ]),
              config.groups.length ? (openBlock(), createElementBlock("div", _hoisted_215, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(config.groups, (group) => {
                  return openBlock(), createElementBlock("article", {
                    key: group.id,
                    class: normalizeClass(["group-card", { active: selectedGroupId.value === group.id }])
                  }, [
                    createBaseVNode("div", null, [
                      createBaseVNode("strong", null, toDisplayString(group.name), 1),
                      createBaseVNode("small", null, [
                        createTextVNode(toDisplayString(group.serials.length) + " " + toDisplayString(t("devices").toLowerCase()) + " · " + toDisplayString(t("concurrency")) + " " + toDisplayString(group.concurrencyLimit), 1),
                        group.defaultProfileId ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                          createTextVNode(" · " + toDisplayString(config.profiles.find((profile) => profile.id === group.defaultProfileId)?.name), 1)
                        ], 64)) : createCommentVNode("", true)
                      ]),
                      group.description ? (openBlock(), createElementBlock("p", _hoisted_216, toDisplayString(group.description), 1)) : createCommentVNode("", true)
                    ]),
                    createBaseVNode("div", _hoisted_217, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(group.serials, (serial) => {
                        return openBlock(), createElementBlock("span", { key: serial }, [
                          createBaseVNode("code", null, toDisplayString(config.deviceAliases[serial] || serial), 1),
                          createBaseVNode("button", {
                            type: "button",
                            "aria-label": `${t("delete")} ${serial}`,
                            onClick: ($event) => removeGroupMember(group, serial)
                          }, "×", 8, _hoisted_218)
                        ]);
                      }), 128))
                    ]),
                    createBaseVNode("div", _hoisted_219, [
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: ($event) => selectGroup(group)
                      }, toDisplayString(t("useGroup")), 9, _hoisted_220),
                      createBaseVNode("button", {
                        class: "ghost compact",
                        onClick: ($event) => editGroup(group)
                      }, toDisplayString(t("edit")), 9, _hoisted_221),
                      createBaseVNode("button", {
                        class: "ghost compact",
                        onClick: ($event) => deleteGroup(group.id)
                      }, toDisplayString(t("delete")), 9, _hoisted_222)
                    ])
                  ], 2);
                }), 128))
              ])) : createCommentVNode("", true)
            ]),
            createBaseVNode("section", _hoisted_223, [
              createBaseVNode("div", _hoisted_224, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", _hoisted_225, toDisplayString(t("wireless")), 1),
                  createBaseVNode("p", _hoisted_226, toDisplayString(t("wirelessHint")), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_227, [
                createBaseVNode("div", _hoisted_228, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[66] || (_cache[66] = ($event) => wirelessTarget.value = $event),
                    placeholder: t("address")
                  }, null, 8, _hoisted_229), [
                    [
                      vModelText,
                      wirelessTarget.value,
                      void 0,
                      { trim: true }
                    ]
                  ]),
                  createBaseVNode("button", {
                    class: "secondary",
                    disabled: !wirelessTarget.value || !environment.value?.adb.ok,
                    onClick: _cache[67] || (_cache[67] = ($event) => connect())
                  }, toDisplayString(t("connect")), 9, _hoisted_230)
                ]),
                createBaseVNode("div", _hoisted_231, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[68] || (_cache[68] = ($event) => pairTarget.value = $event),
                    placeholder: t("pairAddress")
                  }, null, 8, _hoisted_232), [
                    [
                      vModelText,
                      pairTarget.value,
                      void 0,
                      { trim: true }
                    ]
                  ]),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[69] || (_cache[69] = ($event) => pairingCode.value = $event),
                    inputmode: "numeric",
                    maxlength: "6",
                    placeholder: t("pairingCode")
                  }, null, 8, _hoisted_233), [
                    [
                      vModelText,
                      pairingCode.value,
                      void 0,
                      { trim: true }
                    ]
                  ]),
                  createBaseVNode("button", {
                    class: "secondary",
                    disabled: !pairTarget.value || pairingCode.value.length !== 6 || !environment.value?.adb.ok,
                    onClick: pair
                  }, toDisplayString(t("pair")), 9, _hoisted_234)
                ]),
                createBaseVNode("div", { class: "qr-pair" }, [
                  createBaseVNode("label", { class: "inline-check" }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.qrPairing = $event,
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.qrPairing]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showQrPairing")), 1)
                  ]),
                  createBaseVNode("small", { class: "muted qr-hint" }, toDisplayString(t("showQrPairingHint")), 1),
                  config.qrPairing ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "secondary compact",
                    disabled: qrBusy.value || !environment.value?.adb.ok,
                    onClick: startQrPairing
                  }, toDisplayString(qrBusy.value ? t("qrWaiting") : t("qrPair")), 9)) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", { class: "legacy-wireless" }, [
                  createBaseVNode("div", { class: "panel-title" }, [
                    createBaseVNode("div", null, [
                      createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("legacyWirelessEyebrow")), 1),
                      createBaseVNode("p", { class: "muted" }, toDisplayString(t("legacyWirelessLabel")), 1)
                    ])
                  ]),
                  createBaseVNode("div", { class: "legacy-wireless-row" }, [
                    createBaseVNode("button", {
                      class: "secondary",
                      disabled: !legacyWirelessDevice.value,
                      onClick: enableLegacyWireless
                    }, toDisplayString(t("enableLegacyWireless")), 9, ["disabled"]),
                    createBaseVNode("p", { class: "muted legacy-wireless-status" }, toDisplayString(legacyWirelessHintText.value), 1)
                  ])
                ])
              ]),
              config.wirelessTargets.length ? (openBlock(), createElementBlock("div", _hoisted_235, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(config.wirelessTargets, (target) => {
                  return openBlock(), createElementBlock("div", {
                    key: target.id,
                    class: "saved-row wireless-target"
                  }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => target.name = $event,
                      "aria-label": t("savedAddressName")
                    }, null, 8, _hoisted_236), [
                      [
                        vModelText,
                        target.name,
                        void 0,
                        { trim: true }
                      ]
                    ]),
                    createBaseVNode("code", null, toDisplayString(target.address), 1),
                    createBaseVNode("label", _hoisted_237, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": ($event) => target.autoConnect = $event,
                        type: "checkbox"
                      }, null, 8, _hoisted_238), [
                        [vModelCheckbox, target.autoConnect]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("autoConnect")), 1)
                    ]),
                    createBaseVNode("div", _hoisted_239, [
                      createBaseVNode("button", {
                        class: "secondary compact",
                        disabled: !environment.value?.adb.ok,
                        onClick: ($event) => connectSaved(target)
                      }, toDisplayString(t("connect")), 9, _hoisted_240),
                      createBaseVNode("button", {
                        class: "ghost compact",
                        onClick: ($event) => forgetWirelessTarget(target.id)
                      }, toDisplayString(t("delete")), 9, _hoisted_241)
                    ])
                  ]);
                }), 128))
              ])) : createCommentVNode("", true)
            ])
          ], 64)) : activeTab.value === "automations" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
            createBaseVNode("section", _hoisted_242, [
              createBaseVNode("div", null, [
                createBaseVNode("p", _hoisted_243, "M4 · " + toDisplayString(t("safeAutomation")), 1),
                createBaseVNode("h1", null, toDisplayString(t("automations")), 1),
                createBaseVNode("p", _hoisted_244, toDisplayString(t("automationsHintV2")), 1)
              ]),
              createBaseVNode("div", _hoisted_245, [
                createBaseVNode("button", {
                  class: "secondary",
                  disabled: automationTransferBusy.value,
                  onClick: previewAutomationImport
                }, toDisplayString(t("import")), 9, _hoisted_246),
                createBaseVNode("button", {
                  class: "ghost",
                  onClick: createAutomation
                }, toDisplayString(t("newAutomation")), 1)
              ])
            ]),
            automationImportPreview.value ? (openBlock(), createElementBlock("section", _hoisted_247, [
              createBaseVNode("div", _hoisted_248, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", _hoisted_249, toDisplayString(t("untrustedImport")), 1),
                  createBaseVNode("h2", null, toDisplayString(automationImportPreview.value.automation.name), 1),
                  createBaseVNode("p", _hoisted_250, toDisplayString(automationImportPreview.value.automation.steps.length) + " " + toDisplayString(t("steps")) + " · " + toDisplayString(automationImportPreview.value.dangerousStepCount) + " " + toDisplayString(t("inputSteps")), 1)
                ]),
                createBaseVNode("span", _hoisted_251, toDisplayString(t("reviewRequired")), 1)
              ]),
              (openBlock(true), createElementBlock(Fragment, null, renderList(automationImportPreview.value.warnings, (warning) => {
                return openBlock(), createElementBlock("p", {
                  key: warning,
                  class: "inline-warning"
                }, toDisplayString(warning), 1);
              }), 128)),
              createBaseVNode("ol", _hoisted_252, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(automationImportPreview.value.automation.steps, (step, index) => {
                  return openBlock(), createElementBlock("li", { key: index }, [
                    createBaseVNode("code", null, toDisplayString(index + 1), 1),
                    createBaseVNode("span", null, toDisplayString(automationStepLabel(step)), 1)
                  ]);
                }), 128))
              ]),
              createBaseVNode("label", _hoisted_253, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[70] || (_cache[70] = ($event) => automationImportConfirmed.value = $event),
                  type: "checkbox"
                }, null, 512), [
                  [vModelCheckbox, automationImportConfirmed.value]
                ]),
                createBaseVNode("span", null, toDisplayString(t("automationImportConfirmation")), 1)
              ]),
              createBaseVNode("div", _hoisted_254, [
                createBaseVNode("button", {
                  class: "primary",
                  disabled: !automationImportConfirmed.value || automationTransferBusy.value,
                  onClick: commitAutomationImport
                }, toDisplayString(t("importReviewedAutomation")), 9, _hoisted_255),
                createBaseVNode("button", {
                  class: "ghost",
                  onClick: _cache[71] || (_cache[71] = ($event) => automationImportPreview.value = null)
                }, toDisplayString(t("cancel")), 1)
              ])
            ])) : createCommentVNode("", true),
            createBaseVNode("div", _hoisted_256, [
              createBaseVNode("section", _hoisted_257, [
                createBaseVNode("div", _hoisted_258, [
                  createBaseVNode("div", null, [
                    createBaseVNode("p", _hoisted_259, toDisplayString(t("automationEditor")), 1),
                    createBaseVNode("h2", null, toDisplayString(automationDraft.value.id ? t("editAutomation") : t("newAutomation")), 1)
                  ]),
                  createBaseVNode("span", null, toDisplayString(automationDraft.value.steps.length) + "/200", 1)
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("automationName")), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[72] || (_cache[72] = ($event) => automationDraft.value.name = $event),
                    maxlength: "128"
                  }, null, 512), [
                    [
                      vModelText,
                      automationDraft.value.name,
                      void 0,
                      { trim: true }
                    ]
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("description")), 1),
                  withDirectives(createBaseVNode("textarea", {
                    "onUpdate:modelValue": _cache[73] || (_cache[73] = ($event) => automationDraft.value.description = $event),
                    rows: "2",
                    maxlength: "1024"
                  }, null, 512), [
                    [
                      vModelText,
                      automationDraft.value.description,
                      void 0,
                      { trim: true }
                    ]
                  ])
                ]),
                createBaseVNode("div", _hoisted_260, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("designOrientation")), 1),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[74] || (_cache[74] = ($event) => automationDraft.value.design.orientation = $event)
                    }, [
                      createBaseVNode("option", _hoisted_261, toDisplayString(t("any")), 1),
                      createBaseVNode("option", _hoisted_262, toDisplayString(t("portrait")), 1),
                      createBaseVNode("option", _hoisted_263, toDisplayString(t("landscape")), 1)
                    ], 512), [
                      [vModelSelect, automationDraft.value.design.orientation]
                    ])
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("designAspectRatio")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[75] || (_cache[75] = ($event) => automationDraft.value.design.aspectRatio = $event),
                      type: "number",
                      min: "0",
                      max: "10",
                      step: "0.001"
                    }, null, 512), [
                      [
                        vModelText,
                        automationDraft.value.design.aspectRatio,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    createBaseVNode("small", null, toDisplayString(t("zeroMeansUnknown")), 1)
                  ])
                ]),
                createBaseVNode("div", _hoisted_264, [
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[76] || (_cache[76] = ($event) => newStepType.value = $event)
                  }, [
                    createBaseVNode("option", _hoisted_265, toDisplayString(t("control")), 1),
                    createBaseVNode("option", _hoisted_266, toDisplayString(t("delay")), 1),
                    createBaseVNode("option", _hoisted_267, toDisplayString(t("tap")), 1),
                    createBaseVNode("option", _hoisted_268, toDisplayString(t("swipe")), 1),
                    createBaseVNode("option", _hoisted_269, toDisplayString(t("textInput")), 1),
                    createBaseVNode("option", _hoisted_270, toDisplayString(t("startApp")), 1),
                    createBaseVNode("option", _hoisted_271, toDisplayString(t("screenshot")), 1),
                    createBaseVNode("option", _hoisted_272, toDisplayString(t("assertDevice")), 1)
                  ], 512), [
                    [vModelSelect, newStepType.value]
                  ]),
                  newStepType.value === "control" ? withDirectives((openBlock(), createElementBlock("select", {
                    key: 0,
                    "onUpdate:modelValue": _cache[77] || (_cache[77] = ($event) => newStepControl.value = $event)
                  }, [
                    (openBlock(), createElementBlock(Fragment, null, renderList(controlActions, (action) => {
                      return createBaseVNode("option", {
                        key: action,
                        value: action
                      }, toDisplayString(actionLabel(action)), 9, _hoisted_273);
                    }), 64))
                  ], 512)), [
                    [vModelSelect, newStepControl.value]
                  ]) : newStepType.value === "delay" ? withDirectives((openBlock(), createElementBlock("input", {
                    key: 1,
                    "onUpdate:modelValue": _cache[78] || (_cache[78] = ($event) => newStepDuration.value = $event),
                    type: "number",
                    min: "0",
                    max: "60000",
                    placeholder: "ms"
                  }, null, 512)), [
                    [
                      vModelText,
                      newStepDuration.value,
                      void 0,
                      { number: true }
                    ]
                  ]) : newStepType.value === "tap" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[79] || (_cache[79] = ($event) => newStepNumberA.value = $event),
                      type: "number",
                      min: "0",
                      max: "1",
                      step: "0.01",
                      placeholder: "x 0..1"
                    }, null, 512), [
                      [
                        vModelText,
                        newStepNumberA.value,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[80] || (_cache[80] = ($event) => newStepNumberB.value = $event),
                      type: "number",
                      min: "0",
                      max: "1",
                      step: "0.01",
                      placeholder: "y 0..1"
                    }, null, 512), [
                      [
                        vModelText,
                        newStepNumberB.value,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ], 64)) : newStepType.value === "swipe" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[81] || (_cache[81] = ($event) => newStepNumberA.value = $event),
                      type: "number",
                      min: "0",
                      max: "1",
                      step: "0.01",
                      placeholder: "from x"
                    }, null, 512), [
                      [
                        vModelText,
                        newStepNumberA.value,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[82] || (_cache[82] = ($event) => newStepNumberB.value = $event),
                      type: "number",
                      min: "0",
                      max: "1",
                      step: "0.01",
                      placeholder: "from y"
                    }, null, 512), [
                      [
                        vModelText,
                        newStepNumberB.value,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[83] || (_cache[83] = ($event) => newStepNumberC.value = $event),
                      type: "number",
                      min: "0",
                      max: "1",
                      step: "0.01",
                      placeholder: "to x"
                    }, null, 512), [
                      [
                        vModelText,
                        newStepNumberC.value,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[84] || (_cache[84] = ($event) => newStepNumberD.value = $event),
                      type: "number",
                      min: "0",
                      max: "1",
                      step: "0.01",
                      placeholder: "to y"
                    }, null, 512), [
                      [
                        vModelText,
                        newStepNumberD.value,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[85] || (_cache[85] = ($event) => newStepDuration.value = $event),
                      type: "number",
                      min: "1",
                      max: "10000",
                      placeholder: "ms"
                    }, null, 512), [
                      [
                        vModelText,
                        newStepDuration.value,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ], 64)) : newStepType.value === "assert-device" ? withDirectives((openBlock(), createElementBlock("select", {
                    key: 4,
                    "onUpdate:modelValue": _cache[86] || (_cache[86] = ($event) => newStepText.value = $event)
                  }, [
                    createBaseVNode("option", _hoisted_274, toDisplayString(t("portrait")), 1),
                    createBaseVNode("option", _hoisted_275, toDisplayString(t("landscape")), 1)
                  ], 512)), [
                    [vModelSelect, newStepText.value]
                  ]) : withDirectives((openBlock(), createElementBlock("input", {
                    key: 5,
                    "onUpdate:modelValue": _cache[87] || (_cache[87] = ($event) => newStepText.value = $event),
                    placeholder: newStepType.value === "start-app" ? "com.example.app" : newStepType.value === "text" ? t("nonSensitiveText") : t("optionalLabel")
                  }, null, 8, _hoisted_276)), [
                    [vModelText, newStepText.value]
                  ]),
                  createBaseVNode("button", {
                    class: "secondary compact",
                    onClick: addAutomationStep
                  }, toDisplayString(t("addStep")), 1)
                ]),
                automationDraft.value.steps.length ? (openBlock(), createElementBlock("div", _hoisted_277, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(automationDraft.value.steps, (step, index) => {
                    return openBlock(), createElementBlock("div", {
                      key: index,
                      class: "automation-step-row"
                    }, [
                      createBaseVNode("span", _hoisted_278, toDisplayString(index + 1), 1),
                      createBaseVNode("div", _hoisted_279, [
                        createBaseVNode("strong", null, toDisplayString(step.type), 1),
                        createBaseVNode("small", null, toDisplayString(automationStepLabel(step)), 1),
                        createBaseVNode("div", _hoisted_280, [
                          step.type === "control" ? withDirectives((openBlock(), createElementBlock("select", {
                            key: 0,
                            "onUpdate:modelValue": ($event) => step.action = $event
                          }, [
                            (openBlock(), createElementBlock(Fragment, null, renderList(controlActions, (action) => {
                              return createBaseVNode("option", {
                                key: action,
                                value: action
                              }, toDisplayString(actionLabel(action)), 9, _hoisted_282);
                            }), 64))
                          ], 8, _hoisted_281)), [
                            [vModelSelect, step.action]
                          ]) : step.type === "delay" ? withDirectives((openBlock(), createElementBlock("input", {
                            key: 1,
                            "onUpdate:modelValue": ($event) => step.durationMs = $event,
                            type: "number",
                            min: "0",
                            max: "60000"
                          }, null, 8, _hoisted_283)), [
                            [
                              vModelText,
                              step.durationMs,
                              void 0,
                              { number: true }
                            ]
                          ]) : step.type === "tap" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.x = $event,
                              type: "number",
                              min: "0",
                              max: "1",
                              step: "0.01"
                            }, null, 8, _hoisted_284), [
                              [
                                vModelText,
                                step.x,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.y = $event,
                              type: "number",
                              min: "0",
                              max: "1",
                              step: "0.01"
                            }, null, 8, _hoisted_285), [
                              [
                                vModelText,
                                step.y,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ], 64)) : step.type === "swipe" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.from.x = $event,
                              type: "number",
                              min: "0",
                              max: "1",
                              step: "0.01"
                            }, null, 8, _hoisted_286), [
                              [
                                vModelText,
                                step.from.x,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.from.y = $event,
                              type: "number",
                              min: "0",
                              max: "1",
                              step: "0.01"
                            }, null, 8, _hoisted_287), [
                              [
                                vModelText,
                                step.from.y,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.to.x = $event,
                              type: "number",
                              min: "0",
                              max: "1",
                              step: "0.01"
                            }, null, 8, _hoisted_288), [
                              [
                                vModelText,
                                step.to.x,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.to.y = $event,
                              type: "number",
                              min: "0",
                              max: "1",
                              step: "0.01"
                            }, null, 8, _hoisted_289), [
                              [
                                vModelText,
                                step.to.y,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.durationMs = $event,
                              type: "number",
                              min: "1",
                              max: "10000"
                            }, null, 8, _hoisted_290), [
                              [
                                vModelText,
                                step.durationMs,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ], 64)) : step.type === "text" ? withDirectives((openBlock(), createElementBlock("input", {
                            key: 4,
                            "onUpdate:modelValue": ($event) => step.value = $event,
                            placeholder: t("nonSensitiveText")
                          }, null, 8, _hoisted_291)), [
                            [vModelText, step.value]
                          ]) : step.type === "start-app" ? withDirectives((openBlock(), createElementBlock("input", {
                            key: 5,
                            "onUpdate:modelValue": ($event) => step.packageId = $event,
                            placeholder: "com.example.app"
                          }, null, 8, _hoisted_292)), [
                            [
                              vModelText,
                              step.packageId,
                              void 0,
                              { trim: true }
                            ]
                          ]) : step.type === "screenshot" ? withDirectives((openBlock(), createElementBlock("input", {
                            key: 6,
                            "onUpdate:modelValue": ($event) => step.label = $event,
                            placeholder: t("optionalLabel")
                          }, null, 8, _hoisted_293)), [
                            [
                              vModelText,
                              step.label,
                              void 0,
                              { trim: true }
                            ]
                          ]) : step.condition.type === "orientation" ? withDirectives((openBlock(), createElementBlock("select", {
                            key: 7,
                            "onUpdate:modelValue": ($event) => step.condition.value = $event
                          }, [
                            createBaseVNode("option", _hoisted_295, toDisplayString(t("portrait")), 1),
                            createBaseVNode("option", _hoisted_296, toDisplayString(t("landscape")), 1)
                          ], 8, _hoisted_294)), [
                            [vModelSelect, step.condition.value]
                          ]) : (openBlock(), createElementBlock(Fragment, { key: 8 }, [
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.condition.value = $event,
                              type: "number",
                              min: "0.1",
                              max: "10",
                              step: "0.001"
                            }, null, 8, _hoisted_297), [
                              [
                                vModelText,
                                step.condition.value,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => step.condition.tolerance = $event,
                              type: "number",
                              min: "0",
                              max: "1",
                              step: "0.01"
                            }, null, 8, _hoisted_298), [
                              [
                                vModelText,
                                step.condition.tolerance,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ], 64))
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_299, [
                        createBaseVNode("button", {
                          class: "ghost compact",
                          disabled: index === 0,
                          onClick: ($event) => moveAutomationStep(index, -1)
                        }, "↑", 8, _hoisted_300),
                        createBaseVNode("button", {
                          class: "ghost compact",
                          disabled: index === automationDraft.value.steps.length - 1,
                          onClick: ($event) => moveAutomationStep(index, 1)
                        }, "↓", 8, _hoisted_301),
                        createBaseVNode("button", {
                          class: "ghost compact",
                          onClick: ($event) => removeAutomationStep(index)
                        }, toDisplayString(t("delete")), 9, _hoisted_302)
                      ])
                    ]);
                  }), 128))
                ])) : (openBlock(), createElementBlock("p", _hoisted_303, toDisplayString(t("noAutomationSteps")), 1)),
                createBaseVNode("div", _hoisted_304, [
                  createBaseVNode("button", {
                    class: "primary",
                    onClick: saveAutomationDraft
                  }, toDisplayString(t("saveAutomation")), 1),
                  createBaseVNode("button", {
                    class: "ghost",
                    onClick: createAutomation
                  }, toDisplayString(t("clearEditor")), 1)
                ])
              ]),
              createBaseVNode("section", _hoisted_305, [
                createBaseVNode("div", _hoisted_306, [
                  createBaseVNode("div", null, [
                    createBaseVNode("p", _hoisted_307, toDisplayString(t("automationLibrary")), 1),
                    createBaseVNode("h2", null, toDisplayString(config.automations.length), 1)
                  ])
                ]),
                config.automations.length ? (openBlock(), createElementBlock("div", _hoisted_308, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(config.automations, (macro) => {
                    return openBlock(), createElementBlock("article", {
                      key: macro.id,
                      class: "saved-row automation-library-row"
                    }, [
                      createBaseVNode("div", null, [
                        createBaseVNode("strong", null, toDisplayString(macro.name), 1),
                        createBaseVNode("small", null, [
                          createTextVNode(toDisplayString(macro.steps.length) + " " + toDisplayString(t("steps")) + " · " + toDisplayString(macro.design.orientation), 1),
                          macro.design.aspectRatio ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                            createTextVNode(" · " + toDisplayString(macro.design.aspectRatio.toFixed(3)), 1)
                          ], 64)) : createCommentVNode("", true)
                        ]),
                        macro.description ? (openBlock(), createElementBlock("p", _hoisted_309, toDisplayString(macro.description), 1)) : createCommentVNode("", true)
                      ]),
                      createBaseVNode("div", _hoisted_310, [
                        createBaseVNode("button", {
                          class: "secondary compact",
                          onClick: ($event) => editAutomation(macro)
                        }, toDisplayString(t("edit")), 9, _hoisted_311),
                        createBaseVNode("button", {
                          class: "ghost compact",
                          disabled: automationTransferBusy.value,
                          onClick: ($event) => exportAutomation(macro)
                        }, toDisplayString(t("export")), 9, _hoisted_312),
                        createBaseVNode("button", {
                          class: "ghost compact",
                          onClick: ($event) => deleteAutomation(macro.id)
                        }, toDisplayString(t("delete")), 9, _hoisted_313)
                      ])
                    ]);
                  }), 128))
                ])) : (openBlock(), createElementBlock("p", _hoisted_314, toDisplayString(t("noAutomations")), 1))
              ])
            ]),
            createBaseVNode("section", _hoisted_315, [
              createBaseVNode("div", _hoisted_316, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", _hoisted_317, toDisplayString(t("batchPreflight")), 1),
                  createBaseVNode("h2", null, toDisplayString(t("groupBatchRun")), 1),
                  createBaseVNode("p", _hoisted_318, toDisplayString(t("batchRunHint")), 1)
                ]),
                createBaseVNode("span", null, toDisplayString(batchTargetSerials.value.length) + " " + toDisplayString(t("targets")), 1)
              ]),
              createBaseVNode("div", _hoisted_319, [
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("targetGroup")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[88] || (_cache[88] = ($event) => selectedGroupId.value = $event)
                  }, [
                    createBaseVNode("option", _hoisted_320, toDisplayString(t("currentlySelectedDevices")), 1),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(config.groups, (group) => {
                      return openBlock(), createElementBlock("option", {
                        key: group.id,
                        value: group.id
                      }, toDisplayString(group.name) + " · " + toDisplayString(group.serials.length), 9, _hoisted_321);
                    }), 128))
                  ], 512), [
                    [vModelSelect, selectedGroupId.value]
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("batchAction")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[89] || (_cache[89] = ($event) => batchActionType.value = $event)
                  }, [
                    createBaseVNode("option", _hoisted_322, toDisplayString(t("launchSelected")), 1),
                    createBaseVNode("option", _hoisted_323, toDisplayString(t("screenshot")), 1),
                    createBaseVNode("option", _hoisted_324, toDisplayString(t("startApp")), 1),
                    createBaseVNode("option", _hoisted_325, toDisplayString(t("control")), 1),
                    createBaseVNode("option", _hoisted_326, toDisplayString(t("automation")), 1),
                    createBaseVNode("option", _hoisted_327, toDisplayString(t("pushFiles")), 1),
                    createBaseVNode("option", _hoisted_328, toDisplayString(t("installApk")), 1)
                  ], 512), [
                    [vModelSelect, batchActionType.value]
                  ])
                ]),
                batchActionType.value === "control" ? (openBlock(), createElementBlock("label", _hoisted_329, [
                  createBaseVNode("span", null, toDisplayString(t("controlAction")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[90] || (_cache[90] = ($event) => batchControlAction.value = $event)
                  }, [
                    (openBlock(), createElementBlock(Fragment, null, renderList(controlActions, (action) => {
                      return createBaseVNode("option", {
                        key: action,
                        value: action
                      }, toDisplayString(actionLabel(action)), 9, _hoisted_330);
                    }), 64))
                  ], 512), [
                    [vModelSelect, batchControlAction.value]
                  ])
                ])) : batchActionType.value === "start-app" ? (openBlock(), createElementBlock("label", _hoisted_331, [
                  createBaseVNode("span", null, toDisplayString(t("packageId")), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[91] || (_cache[91] = ($event) => batchPackageId.value = $event),
                    placeholder: "com.example.app"
                  }, null, 512), [
                    [
                      vModelText,
                      batchPackageId.value,
                      void 0,
                      { trim: true }
                    ]
                  ])
                ])) : batchActionType.value === "automation" ? (openBlock(), createElementBlock("label", _hoisted_332, [
                  createBaseVNode("span", null, toDisplayString(t("automation")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[92] || (_cache[92] = ($event) => batchAutomationId.value = $event)
                  }, [
                    createBaseVNode("option", _hoisted_333, toDisplayString(t("chooseAutomation")), 1),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(config.automations, (macro) => {
                      return openBlock(), createElementBlock("option", {
                        key: macro.id,
                        value: macro.id
                      }, toDisplayString(macro.name) + " · " + toDisplayString(macro.steps.length), 9, _hoisted_334);
                    }), 128))
                  ], 512), [
                    [vModelSelect, batchAutomationId.value]
                  ])
                ])) : batchActionType.value === "file-push" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("targetDirectory")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[93] || (_cache[93] = ($event) => fileTarget.value = $event),
                      placeholder: "/sdcard/Download/"
                    }, null, 512), [
                      [
                        vModelText,
                        fileTarget.value,
                        void 0,
                        { trim: true }
                      ]
                    ])
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("existingFile")), 1),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[94] || (_cache[94] = ($event) => fileConflict.value = $event)
                    }, [
                      createBaseVNode("option", _hoisted_335, toDisplayString(t("replace")), 1),
                      createBaseVNode("option", _hoisted_336, toDisplayString(t("skip")), 1)
                    ], 512), [
                      [vModelSelect, fileConflict.value]
                    ])
                  ])
                ], 64)) : batchActionType.value === "apk-install" ? (openBlock(), createElementBlock(Fragment, { key: 4 }, [
                  createBaseVNode("label", _hoisted_337, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[95] || (_cache[95] = ($event) => installReplace.value = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, installReplace.value]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("replaceExistingApp")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_338, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[96] || (_cache[96] = ($event) => installDowngrade.value = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, installDowngrade.value]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("allowDowngrade")), 1)
                  ])
                ], 64)) : createCommentVNode("", true),
                createBaseVNode("button", {
                  class: "secondary",
                  disabled: batchBusy.value || !!activeBatchRunId.value,
                  onClick: inspectBatch
                }, toDisplayString(t("inspectBatch")), 9, _hoisted_339)
              ]),
              batchPreflight.value ? (openBlock(), createElementBlock("div", _hoisted_340, [
                createBaseVNode("table", _hoisted_341, [
                  createBaseVNode("thead", null, [
                    createBaseVNode("tr", null, [
                      createBaseVNode("th", null, toDisplayString(t("device")), 1),
                      createBaseVNode("th", null, toDisplayString(t("online")), 1),
                      createBaseVNode("th", null, toDisplayString(t("authorized")), 1),
                      createBaseVNode("th", null, toDisplayString(t("capability")), 1),
                      createBaseVNode("th", null, toDisplayString(t("sessionConflict")), 1),
                      createBaseVNode("th", null, toDisplayString(t("estimatedAction")), 1)
                    ])
                  ]),
                  createBaseVNode("tbody", null, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(batchPreflight.value.items, (item) => {
                      return openBlock(), createElementBlock("tr", {
                        key: item.serial,
                        class: normalizeClass({ failed: !item.eligible })
                      }, [
                        createBaseVNode("td", null, [
                          createBaseVNode("strong", null, toDisplayString(config.deviceAliases[item.serial] || item.serial), 1),
                          (openBlock(true), createElementBlock(Fragment, null, renderList(item.reasons, (reason) => {
                            return openBlock(), createElementBlock("small", { key: reason }, toDisplayString(reason), 1);
                          }), 128))
                        ]),
                        createBaseVNode("td", null, toDisplayString(item.online ? t("yes") : t("no")), 1),
                        createBaseVNode("td", null, toDisplayString(item.authorized ? t("yes") : t("no")), 1),
                        createBaseVNode("td", null, [
                          createBaseVNode("span", {
                            class: normalizeClass(["preflight-status", item.capability])
                          }, toDisplayString(item.capability), 3)
                        ]),
                        createBaseVNode("td", null, toDisplayString(item.sessionConflict ? t("yes") : t("no")), 1),
                        createBaseVNode("td", null, toDisplayString(item.estimatedAction), 1)
                      ], 2);
                    }), 128))
                  ])
                ]),
                createBaseVNode("div", _hoisted_342, [
                  createBaseVNode("label", _hoisted_343, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[97] || (_cache[97] = ($event) => batchPassingOnly.value = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, batchPassingOnly.value]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("runPassingOnly")) + " · " + toDisplayString(passingBatchTargets.value) + "/" + toDisplayString(batchPreflight.value.items.length), 1)
                  ]),
                  batchPreflight.value.confirmationRequired ? (openBlock(), createElementBlock("label", _hoisted_344, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[98] || (_cache[98] = ($event) => batchDangerousConfirmed.value = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, batchDangerousConfirmed.value]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t(`confirmBatch_${batchPreflight.value.confirmationKind || "input"}`)), 1)
                  ])) : createCommentVNode("", true),
                  createBaseVNode("div", _hoisted_345, [
                    createBaseVNode("button", {
                      class: "primary",
                      disabled: batchBusy.value || !passingBatchTargets.value || batchPreflight.value.confirmationRequired && !batchDangerousConfirmed.value,
                      onClick: runBatch
                    }, toDisplayString(t("runBatch")), 9, _hoisted_346),
                    createBaseVNode("button", {
                      class: "ghost",
                      onClick: _cache[99] || (_cache[99] = ($event) => batchPreflight.value = null)
                    }, toDisplayString(t("cancel")), 1)
                  ])
                ])
              ])) : createCommentVNode("", true),
              activeBatchRunId.value ? (openBlock(), createElementBlock("div", _hoisted_347, [
                _cache[179] || (_cache[179] = createBaseVNode("span", { class: "recording-dot" }, null, -1)),
                createBaseVNode("strong", null, toDisplayString(t("batchRunning")), 1),
                createBaseVNode("code", null, toDisplayString(activeBatchRunId.value), 1),
                createBaseVNode("button", {
                  class: "danger compact",
                  onClick: cancelBatch
                }, toDisplayString(t("cancelRun")), 1)
              ])) : createCommentVNode("", true),
              batchRunReport.value ? (openBlock(), createElementBlock("div", _hoisted_348, [
                createBaseVNode("div", _hoisted_349, [
                  createBaseVNode("strong", null, toDisplayString(t("runReport")), 1),
                  createBaseVNode("span", {
                    class: normalizeClass(["preflight-status", batchRunReport.value.state === "completed" ? "pass" : "warning"])
                  }, toDisplayString(batchRunReport.value.state), 3),
                  createBaseVNode("small", null, toDisplayString(batchRunReport.value.results.filter((result) => result.ok).length) + "/" + toDisplayString(batchRunReport.value.results.length) + " " + toDisplayString(t("succeeded")), 1)
                ]),
                createBaseVNode("div", _hoisted_350, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(batchRunReport.value.results, (result) => {
                    return openBlock(), createElementBlock("div", {
                      key: result.targetId,
                      class: normalizeClass(["batch-result", result.ok ? "ok" : "failed"])
                    }, [
                      createBaseVNode("span", null, [
                        createBaseVNode("strong", null, toDisplayString(config.deviceAliases[result.targetId] || result.targetId), 1),
                        createBaseVNode("small", null, toDisplayString(result.data?.actionType || batchRunReport.value.actionType), 1)
                      ]),
                      createBaseVNode("p", null, toDisplayString(result.data?.message || result.error?.message), 1),
                      result.error?.detail ? (openBlock(), createElementBlock("details", _hoisted_351, [
                        createBaseVNode("summary", null, toDisplayString(t("errorDetails")), 1),
                        createBaseVNode("code", null, toDisplayString(result.error.detail), 1)
                      ])) : createCommentVNode("", true)
                    ], 2);
                  }), 128))
                ])
              ])) : createCommentVNode("", true),
              batchRunEvents.value.length ? (openBlock(), createElementBlock("details", _hoisted_352, [
                createBaseVNode("summary", null, toDisplayString(batchRunEvents.value.length) + " " + toDisplayString(t("runEvents")), 1),
                (openBlock(true), createElementBlock(Fragment, null, renderList(batchRunEvents.value, (event, index) => {
                  return openBlock(), createElementBlock("div", {
                    key: `${event.runId}-${index}`
                  }, [
                    createBaseVNode("time", null, toDisplayString(new Date(event.timestamp).toLocaleTimeString()), 1),
                    createBaseVNode("code", null, toDisplayString(event.targetId || event.runId) + " · " + toDisplayString(event.status) + " · " + toDisplayString(event.message), 1)
                  ]);
                }), 128))
              ])) : createCommentVNode("", true)
            ])
          ], 64)) : activeTab.value === "sessions" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [
            createBaseVNode("section", _hoisted_353, [
              createBaseVNode("div", null, [
                createBaseVNode("p", _hoisted_354, toDisplayString(t("sessionCenter")), 1),
                createBaseVNode("h1", null, toDisplayString(t("sessions")), 1),
                createBaseVNode("p", _hoisted_355, toDisplayString(t("sessionsHint")), 1)
              ]),
              createBaseVNode("button", {
                class: "danger",
                disabled: !sessions.value.some(sessionIsActive),
                onClick: stopAllSessions
              }, toDisplayString(t("stopAllSessions")), 9, _hoisted_356)
            ]),
            sessions.value.length ? (openBlock(), createElementBlock("section", _hoisted_357, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(sessions.value, (session) => {
                return openBlock(), createElementBlock("article", {
                  key: session.id,
                  class: "panel session-card"
                }, [
                  createBaseVNode("div", _hoisted_358, [
                    createBaseVNode("span", {
                      class: normalizeClass(["session-state", session.state])
                    }, toDisplayString(t(`sessionState_${session.state}`)), 3),
                    createBaseVNode("div", _hoisted_359, [
                      createBaseVNode("strong", null, toDisplayString(sessionDeviceLabel(session)), 1),
                      createBaseVNode("code", null, toDisplayString(session.serialAtLaunch) + " · " + toDisplayString(session.scene), 1)
                    ]),
                    createBaseVNode("div", _hoisted_360, [
                      createBaseVNode("span", null, toDisplayString(new Date(session.createdAt).toLocaleString()), 1),
                      session.pid ? (openBlock(), createElementBlock("code", _hoisted_361, "PID " + toDisplayString(session.pid), 1)) : createCommentVNode("", true)
                    ]),
                    sessionIsActive(session) ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: "danger compact",
                      disabled: session.state === "stopping",
                      onClick: ($event) => stopSession(session.id)
                    }, toDisplayString(t("stop")), 9, _hoisted_362)) : createCommentVNode("", true)
                  ]),
                  createBaseVNode("code", _hoisted_363, toDisplayString(sessionArgv(session)), 1),
                  session.error ? (openBlock(), createElementBlock("p", _hoisted_364, toDisplayString(session.error), 1)) : createCommentVNode("", true)
                ]);
              }), 128))
            ])) : (openBlock(), createElementBlock("section", _hoisted_365, [
              _cache[180] || (_cache[180] = createBaseVNode("span", { class: "empty-icon" }, "◷", -1)),
              createBaseVNode("p", null, toDisplayString(t("noSessions")), 1)
            ]))
          ], 64)) : activeTab.value === "artifacts" ? (openBlock(), createElementBlock(Fragment, { key: 4 }, [
            createBaseVNode("section", _hoisted_366, [
              createBaseVNode("div", null, [
                createBaseVNode("p", _hoisted_367, toDisplayString(t("artifactLibrary")), 1),
                createBaseVNode("h1", null, toDisplayString(t("artifacts")), 1),
                createBaseVNode("p", _hoisted_368, toDisplayString(t("artifactsHint")), 1)
              ]),
              createBaseVNode("div", _hoisted_369, [
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[100] || (_cache[100] = ($event) => artifactKind.value = $event),
                  "aria-label": t("filterArtifactKind")
                }, [
                  createBaseVNode("option", _hoisted_371, toDisplayString(t("allArtifactKinds")), 1),
                  (openBlock(), createElementBlock(Fragment, null, renderList(artifactKinds, (kind) => {
                    return createBaseVNode("option", {
                      key: kind,
                      value: kind
                    }, toDisplayString(t(`artifactKind_${kind}`)), 9, _hoisted_372);
                  }), 64))
                ], 8, _hoisted_370), [
                  [vModelSelect, artifactKind.value]
                ]),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[101] || (_cache[101] = ($event) => artifactDevice.value = $event),
                  "aria-label": t("filterArtifactDevice")
                }, [
                  createBaseVNode("option", _hoisted_374, toDisplayString(t("allDevices")), 1),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(artifactDevices.value, (serial) => {
                    return openBlock(), createElementBlock("option", {
                      key: serial,
                      value: serial
                    }, toDisplayString(config.deviceAliases[serial] || serial), 9, _hoisted_375);
                  }), 128))
                ], 8, _hoisted_373), [
                  [vModelSelect, artifactDevice.value]
                ]),
                createBaseVNode("button", {
                  class: "ghost",
                  disabled: loadingArtifacts.value,
                  onClick: loadArtifacts
                }, toDisplayString(t("refresh")), 9, _hoisted_376)
              ])
            ]),
            visibleArtifacts.value.length ? (openBlock(), createElementBlock("section", _hoisted_377, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(visibleArtifacts.value, (artifact) => {
                return openBlock(), createElementBlock("article", {
                  key: artifact.id,
                  class: "panel artifact-card"
                }, [
                  createBaseVNode("div", _hoisted_378, toDisplayString(artifact.kind === "screenshot" ? "▧" : artifact.kind === "recording" ? "▶" : artifact.kind === "diagnostic" ? "⌁" : "⇄"), 1),
                  createBaseVNode("div", _hoisted_379, [
                    createBaseVNode("div", _hoisted_380, [
                      createBaseVNode("strong", null, toDisplayString(artifact.name), 1),
                      createBaseVNode("span", {
                        class: normalizeClass(["artifact-status", artifact.status])
                      }, toDisplayString(t(`artifactStatus_${artifact.status}`)), 3)
                    ]),
                    createBaseVNode("code", null, toDisplayString(artifact.path), 1),
                    createBaseVNode("small", null, toDisplayString(t(`artifactKind_${artifact.kind}`)) + " · " + toDisplayString(artifactDeviceLabel(artifact)) + " · " + toDisplayString(new Date(artifact.createdAt).toLocaleString()) + " · " + toDisplayString(formatBytes(artifact.size)), 1)
                  ]),
                  createBaseVNode("div", _hoisted_381, [
                    createBaseVNode("button", {
                      class: "secondary compact",
                      disabled: artifact.status === "missing",
                      onClick: ($event) => openArtifact(artifact)
                    }, toDisplayString(t("open")), 9, _hoisted_382),
                    createBaseVNode("button", {
                      class: "ghost compact",
                      disabled: artifact.status === "missing",
                      onClick: ($event) => revealArtifact(artifact)
                    }, toDisplayString(t("reveal")), 9, _hoisted_383),
                    createBaseVNode("button", {
                      class: "ghost compact",
                      disabled: artifact.status === "missing",
                      onClick: ($event) => copyArtifactPath(artifact)
                    }, toDisplayString(t("copyPath")), 9, _hoisted_384),
                    artifact.kind === "diagnostic" ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: "secondary compact",
                      disabled: artifact.status === "missing",
                      onClick: ($event) => openIssueHelper(artifact)
                    }, toDisplayString(t("reportIssue")), 9, _hoisted_385)) : createCommentVNode("", true),
                    createBaseVNode("button", {
                      class: "ghost compact",
                      onClick: ($event) => deleteArtifact(artifact, false)
                    }, toDisplayString(t("removeIndex")), 9, _hoisted_386),
                    createBaseVNode("button", {
                      class: "danger compact",
                      disabled: artifact.status === "missing",
                      onClick: ($event) => deleteArtifact(artifact, true)
                    }, toDisplayString(t("deleteFile")), 9, _hoisted_387)
                  ])
                ]);
              }), 128))
            ])) : (openBlock(), createElementBlock("section", _hoisted_388, [
              _cache[181] || (_cache[181] = createBaseVNode("span", { class: "empty-icon" }, "▧", -1)),
              createBaseVNode("p", null, toDisplayString(loadingArtifacts.value ? t("loadingArtifacts") : t("noArtifacts")), 1)
            ]))
          ], 64)) : activeTab.value === "settings" ? (openBlock(), createElementBlock(Fragment, { key: 5 }, [
            createBaseVNode("section", _hoisted_389, [
              createBaseVNode("div", null, [
                _cache[182] || (_cache[182] = createBaseVNode("p", { class: "eyebrow" }, "UltimateSCRCPYGui", -1)),
                createBaseVNode("h1", null, toDisplayString(t("settings")), 1),
                createBaseVNode("p", _hoisted_390, toDisplayString(t("savedAutomatically")), 1)
              ]),
              createBaseVNode("button", {
                class: "ghost",
                onClick: resetSettings
              }, toDisplayString(t("resetSettings")), 1)
            ]),
            createBaseVNode("nav", {
              class: "settings-tabs",
              "aria-label": t("settings")
            }, [
              (openBlock(), createElementBlock(Fragment, null, renderList(settingsSections, (section) => {
                return createBaseVNode("button", {
                  key: section,
                  class: normalizeClass({ active: activeSettingsSection.value === section }),
                  onClick: ($event) => activeSettingsSection.value = section
                }, toDisplayString(t(`settingsSection_${section}`)), 11, _hoisted_392);
              }), 64))
            ], 8, _hoisted_391),
            createBaseVNode("div", _hoisted_393, [
              activeSettingsSection.value === "general" ? (openBlock(), createElementBlock("section", _hoisted_394, [
                createBaseVNode("div", _hoisted_395, [
                  createBaseVNode("h2", null, toDisplayString(t("profiles")), 1),
                  createBaseVNode("button", {
                    class: "ghost compact",
                    disabled: profileTransferBusy.value,
                    onClick: previewProfileImport
                  }, toDisplayString(t("importProfile")), 9, _hoisted_396)
                ]),
                createBaseVNode("p", _hoisted_397, toDisplayString(t("profilesHint")), 1),
                createBaseVNode("div", _hoisted_398, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[102] || (_cache[102] = ($event) => profileName.value = $event),
                    maxlength: "80",
                    placeholder: t("profileName")
                  }, null, 8, _hoisted_399), [
                    [
                      vModelText,
                      profileName.value,
                      void 0,
                      { trim: true }
                    ]
                  ]),
                  createBaseVNode("button", {
                    class: "secondary",
                    onClick: saveProfile
                  }, toDisplayString(t("saveCurrentProfile")), 1)
                ]),
                profileImportPreview.value ? (openBlock(), createElementBlock("div", _hoisted_400, [
                  createBaseVNode("div", _hoisted_401, [
                    createBaseVNode("span", null, [
                      createBaseVNode("strong", null, toDisplayString(profileImportPreview.value.name), 1),
                      createBaseVNode("small", null, toDisplayString(profileImportPreview.value.scene) + " · scrcpy ≥ " + toDisplayString(profileImportPreview.value.minScrcpyVersion) + " · UltimateSCRCPYGui " + toDisplayString(profileImportPreview.value.appVersion), 1),
                    ]),
                    createBaseVNode("span", {
                      class: normalizeClass(["compatibility-badge", profileImportPreview.value.compatible ? "ok" : "warn"])
                    }, toDisplayString(profileImportPreview.value.compatible ? t("compatible") : t("newerRuntimeRequired")), 3)
                  ]),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(profileImportPreview.value.warnings, (warning) => {
                    return openBlock(), createElementBlock("p", {
                      key: warning,
                      class: "inline-warning"
                    }, toDisplayString(warning), 1);
                  }), 128)),
                  profileImportPreview.value.unknownFields.length ? (openBlock(), createElementBlock("details", _hoisted_402, [
                    createBaseVNode("summary", null, toDisplayString(profileImportPreview.value.unknownFields.length) + " " + toDisplayString(t("unknownFields")), 1),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(profileImportPreview.value.unknownFields, (field) => {
                      return openBlock(), createElementBlock("code", { key: field }, toDisplayString(field), 1);
                    }), 128))
                  ])) : createCommentVNode("", true),
                  profileImportPreview.value.machineLocalPaths.length ? (openBlock(), createElementBlock("div", _hoisted_403, [
                    createBaseVNode("strong", null, toDisplayString(t("machineLocalPaths")), 1),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(profileImportPreview.value.machineLocalPaths, (path) => {
                      return openBlock(), createElementBlock("code", {
                        key: path.field
                      }, toDisplayString(path.field) + " = " + toDisplayString(path.value), 1);
                    }), 128)),
                    createBaseVNode("label", _hoisted_404, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[103] || (_cache[103] = ($event) => keepImportedPaths.value = $event),
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, keepImportedPaths.value]
                      ]),
                      createBaseVNode("span", null, toDisplayString(t("keepMachineLocalPaths")), 1)
                    ])
                  ])) : createCommentVNode("", true),
                  profileImportPreview.value.conflict ? (openBlock(), createElementBlock("div", _hoisted_405, [
                    createBaseVNode("strong", null, toDisplayString(t("profileNameConflict")) + ": " + toDisplayString(profileImportPreview.value.conflict.name), 1),
                    createBaseVNode("label", null, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[104] || (_cache[104] = ($event) => profileImportStrategy.value = $event),
                        type: "radio",
                        value: "keep"
                      }, null, 512), [
                        [vModelRadio, profileImportStrategy.value]
                      ]),
                      createTextVNode(toDisplayString(t("keepExistingProfile")), 1)
                    ]),
                    createBaseVNode("label", null, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[105] || (_cache[105] = ($event) => profileImportStrategy.value = $event),
                        type: "radio",
                        value: "duplicate"
                      }, null, 512), [
                        [vModelRadio, profileImportStrategy.value]
                      ]),
                      createTextVNode(toDisplayString(t("importAsCopy")), 1)
                    ]),
                    createBaseVNode("label", null, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[106] || (_cache[106] = ($event) => profileImportStrategy.value = $event),
                        type: "radio",
                        value: "replace"
                      }, null, 512), [
                        [vModelRadio, profileImportStrategy.value]
                      ]),
                      createTextVNode(toDisplayString(t("replaceExistingProfile")), 1)
                    ])
                  ])) : createCommentVNode("", true),
                  createBaseVNode("div", _hoisted_406, [
                    createBaseVNode("button", {
                      class: "primary",
                      disabled: profileTransferBusy.value,
                      onClick: commitProfileImport
                    }, toDisplayString(t("importProfile")), 9, _hoisted_407),
                    createBaseVNode("button", {
                      class: "ghost",
                      onClick: _cache[107] || (_cache[107] = ($event) => profileImportPreview.value = null)
                    }, toDisplayString(t("cancel")), 1)
                  ])
                ])) : createCommentVNode("", true),
                config.profiles.length ? (openBlock(), createElementBlock("div", _hoisted_408, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(config.profiles, (profile) => {
                    return openBlock(), createElementBlock("div", {
                      key: profile.id,
                      class: "saved-row"
                    }, [
                      createBaseVNode("input", {
                        value: profile.name,
                        "aria-label": t("profileName"),
                        maxlength: "80",
                        onChange: ($event) => renameProfile(profile, $event)
                      }, null, 40, _hoisted_409),
                      createBaseVNode("div", _hoisted_410, [
                        createTextVNode(toDisplayString(t(`scene_${profile.launch.scene}`)) + " · " + toDisplayString(profile.launch.maxSize || t("automatic")) + " px · " + toDisplayString(profile.launch.videoBitRate) + " Mbps", 1),
                        profile.launch.crop.width ? (openBlock(), createElementBlock("span", _hoisted_411, " · " + toDisplayString(profile.launch.crop.width) + "×" + toDisplayString(profile.launch.crop.height), 1)) : createCommentVNode("", true)
                      ]),
                      createBaseVNode("div", _hoisted_412, [
                        createBaseVNode("button", {
                          class: "ghost compact",
                          onClick: ($event) => applyProfile(profile)
                        }, toDisplayString(t("load")), 9, _hoisted_413),
                        createBaseVNode("button", {
                          class: "secondary compact",
                          onClick: ($event) => updateProfile(profile)
                        }, toDisplayString(t("update")), 9, _hoisted_414),
                        createBaseVNode("button", {
                          class: "ghost compact",
                          disabled: profileTransferBusy.value,
                          onClick: ($event) => exportProfile(profile)
                        }, toDisplayString(t("export")), 9, _hoisted_415),
                        createBaseVNode("button", {
                          class: "ghost compact",
                          onClick: ($event) => deleteProfile(profile.id)
                        }, toDisplayString(t("delete")), 9, _hoisted_416)
                      ])
                    ]);
                  }), 128))
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "general" ? (openBlock(), createElementBlock("section", _hoisted_417, [
                createBaseVNode("h2", null, toDisplayString(t("general")), 1),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("windowTitle")), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[108] || (_cache[108] = ($event) => config.launch.windowTitle = $event),
                    placeholder: "Android"
                  }, null, 512), [
                    [vModelText, config.launch.windowTitle]
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("shortcutModifier")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[109] || (_cache[109] = ($event) => config.launch.shortcutModifier = $event)
                  }, [..._cache[183] || (_cache[183] = [
                    createStaticVNode('<option value="default">System default</option><option value="lctrl">Left Ctrl</option><option value="rctrl">Right Ctrl</option><option value="lalt">Left Alt</option><option value="ralt">Right Alt</option><option value="lsuper">Left Super</option><option value="rsuper">Right Super</option>', 7)
                  ])], 512), [
                    [vModelSelect, config.launch.shortcutModifier]
                  ]),
                  createBaseVNode("small", null, toDisplayString(t("shortcutHint")), 1)
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("keyboardMode")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[110] || (_cache[110] = ($event) => config.launch.keyboardMode = $event)
                  }, [..._cache[184] || (_cache[184] = [
                    createStaticVNode('<option value="default">Default</option><option value="sdk">SDK</option><option value="uhid">UHID</option><option value="aoa">AOA</option><option value="disabled">Disabled</option>', 5)
                  ])], 512), [
                    [vModelSelect, config.launch.keyboardMode]
                  ])
                ]),
                createBaseVNode("div", _hoisted_418, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("mouseMode")), 1),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[111] || (_cache[111] = ($event) => config.launch.mouseMode = $event)
                    }, [..._cache[185] || (_cache[185] = [
                      createStaticVNode('<option value="default">Default</option><option value="sdk">SDK</option><option value="uhid">UHID</option><option value="aoa">AOA</option><option value="disabled">Disabled</option>', 5)
                    ])], 512), [
                      [vModelSelect, config.launch.mouseMode]
                    ])
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("gamepadMode")), 1),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[112] || (_cache[112] = ($event) => config.launch.gamepadMode = $event)
                    }, [..._cache[186] || (_cache[186] = [
                      createBaseVNode("option", { value: "default" }, "Disabled", -1),
                      createBaseVNode("option", { value: "uhid" }, "UHID", -1),
                      createBaseVNode("option", { value: "aoa" }, "AOA", -1)
                    ])], 512), [
                      [vModelSelect, config.launch.gamepadMode]
                    ])
                  ])
                ]),
                createBaseVNode("div", { class: "panel settings-section wide export-section" }, [
                  createBaseVNode("div", { class: "panel-title" }, [
                    createBaseVNode("div", null, [
                      createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("exportConfig")), 1),
                      createBaseVNode("p", { class: "muted" }, toDisplayString(t("exportConfigHint")), 1)
                    ]),
                    createBaseVNode("div", { class: "button-row" }, [
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("json")
                      }, toDisplayString(t("exportJson")), 1),
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("sh")
                      }, toDisplayString(t("exportShell")), 1),
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("bat")
                      }, toDisplayString(t("exportBatch")), 1),
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("command")
                      }, toDisplayString(t("exportCommand")), 1)
                    ])
                  ])
                ])
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "video" ? (openBlock(), createElementBlock("section", _hoisted_419, [
                createBaseVNode("h2", null, toDisplayString(t("video")), 1),
                createBaseVNode("div", _hoisted_420, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("bitRate")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[113] || (_cache[113] = ($event) => config.launch.videoBitRate = $event),
                      type: "number",
                      min: "1",
                      max: "1024"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.videoBitRate,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("maxFps")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[114] || (_cache[114] = ($event) => config.launch.maxFps = $event),
                      type: "number",
                      min: "0",
                      max: "1000"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.maxFps,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ]),
                createBaseVNode("div", _hoisted_421, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("videoBuffer")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[115] || (_cache[115] = ($event) => config.launch.videoBuffer = $event),
                      type: "number",
                      min: "0"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.videoBuffer,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("audioBuffer")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[116] || (_cache[116] = ($event) => config.launch.audioBuffer = $event),
                      type: "number",
                      min: "0"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.audioBuffer,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ]),
                createBaseVNode("div", _hoisted_422, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("maxSize")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[117] || (_cache[117] = ($event) => config.launch.maxSize = $event),
                      type: "number",
                      min: "0"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.maxSize,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("orientation")), 1),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[118] || (_cache[118] = ($event) => config.launch.orientation = $event)
                    }, [..._cache[187] || (_cache[187] = [
                      createBaseVNode("option", { value: "0" }, "0°", -1),
                      createBaseVNode("option", { value: "90" }, "90°", -1),
                      createBaseVNode("option", { value: "180" }, "180°", -1),
                      createBaseVNode("option", { value: "270" }, "270°", -1)
                    ])], 512), [
                      [vModelSelect, config.launch.orientation]
                    ])
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("displayId")), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[119] || (_cache[119] = ($event) => config.launch.displayId = $event),
                    type: "number",
                    min: "0"
                  }, null, 512), [
                    [
                      vModelText,
                      config.launch.displayId,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  createBaseVNode("small", null, toDisplayString(t("displayIdHint")), 1)
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("codec")), 1),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[120] || (_cache[120] = ($event) => config.launch.videoCodec = $event)
                  }, [..._cache[188] || (_cache[188] = [
                    createStaticVNode('<option value="default">Default</option><option value="h264">H.264</option><option value="h265">H.265</option><option value="av1">AV1</option><option value="vp8">VP8</option><option value="vp9">VP9</option>', 6)
                  ])], 512), [
                    [vModelSelect, config.launch.videoCodec]
                  ])
                ])
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "controls" ? (openBlock(), createElementBlock("section", _hoisted_423, [
                createBaseVNode("h2", null, toDisplayString(t("behavior")), 1),
                createBaseVNode("div", _hoisted_424, [
                  createBaseVNode("label", _hoisted_425, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[121] || (_cache[121] = ($event) => config.launch.alwaysOnTop = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.alwaysOnTop]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("alwaysOnTop")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_426, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[122] || (_cache[122] = ($event) => config.launch.control = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.control]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("control")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_427, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[123] || (_cache[123] = ($event) => config.launch.audio = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.audio]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("audio")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_428, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[124] || (_cache[124] = ($event) => config.launch.turnScreenOff = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.turnScreenOff]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("turnScreenOff")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_429, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[125] || (_cache[125] = ($event) => config.launch.stayAwake = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.stayAwake]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("stayAwake")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_430, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[126] || (_cache[126] = ($event) => config.launch.showTouches = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.showTouches]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showTouches")), 1)
                  ]),
                  createBaseVNode("label", { class: "toggle" }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.swipePanel = $event,
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.swipePanel]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showSwipePanel")), 1)
                  ]),
                  createBaseVNode("label", { class: "toggle" }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.navBar = $event,
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.navBar]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showNavBar")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_431, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[127] || (_cache[127] = ($event) => config.launch.fullscreen = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.fullscreen]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("fullscreen")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_432, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[128] || (_cache[128] = ($event) => config.launch.borderless = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.borderless]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("borderless")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_433, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[129] || (_cache[129] = ($event) => config.launch.windowAspectRatioLock = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.windowAspectRatioLock]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("aspectRatioLock")), 1)
                  ]),
                  createBaseVNode("label", _hoisted_434, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[130] || (_cache[130] = ($event) => config.autoSelectFirstDevice = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.autoSelectFirstDevice]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("autoSelectFirst")), 1)
                  ])
                ])
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "recording" ? (openBlock(), createElementBlock("section", _hoisted_435, [
                createBaseVNode("h2", null, toDisplayString(t("recording")), 1),
                createBaseVNode("label", _hoisted_436, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[131] || (_cache[131] = ($event) => config.launch.recordEnabled = $event),
                    type: "checkbox"
                  }, null, 512), [
                    [vModelCheckbox, config.launch.recordEnabled]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("recordEnabled")), 1)
                ]),
                createBaseVNode("label", _hoisted_437, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[132] || (_cache[132] = ($event) => config.launch.autoRecordName = $event),
                    type: "checkbox",
                    disabled: !config.launch.recordEnabled
                  }, null, 8, _hoisted_438), [
                    [vModelCheckbox, config.launch.autoRecordName]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("autoRecordName")), 1)
                ]),
                config.launch.autoRecordName ? (openBlock(), createElementBlock("label", _hoisted_439, [
                  createBaseVNode("span", null, toDisplayString(t("recordDirectory")), 1),
                  createBaseVNode("div", _hoisted_440, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[133] || (_cache[133] = ($event) => config.launch.recordDirectory = $event),
                      disabled: !config.launch.recordEnabled
                    }, null, 8, _hoisted_441), [
                      [vModelText, config.launch.recordDirectory]
                    ]),
                    createBaseVNode("button", {
                      class: "ghost compact",
                      disabled: !config.launch.recordEnabled,
                      onClick: chooseRecordDirectory
                    }, toDisplayString(t("chooseFolder")), 9, _hoisted_442)
                  ])
                ])) : (openBlock(), createElementBlock("label", _hoisted_443, [
                  createBaseVNode("span", null, toDisplayString(t("recordPath")), 1),
                  createBaseVNode("div", _hoisted_444, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[134] || (_cache[134] = ($event) => config.launch.recordPath = $event),
                      disabled: !config.launch.recordEnabled
                    }, null, 8, _hoisted_445), [
                      [vModelText, config.launch.recordPath]
                    ]),
                    createBaseVNode("button", {
                      class: "ghost compact",
                      disabled: !config.launch.recordEnabled,
                      onClick: chooseRecordPath
                    }, toDisplayString(t("chooseFile")), 9, _hoisted_446)
                  ])
                ])),
                createBaseVNode("label", _hoisted_447, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[135] || (_cache[135] = ($event) => config.launch.noPlayback = $event),
                    type: "checkbox",
                    disabled: !config.launch.recordEnabled
                  }, null, 8, _hoisted_448), [
                    [vModelCheckbox, config.launch.noPlayback]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("noPlayback")), 1)
                ])
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "geometry" ? (openBlock(), createElementBlock("section", _hoisted_449, [
                createBaseVNode("h2", null, toDisplayString(t("geometry")), 1),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("crop")), 1),
                  createBaseVNode("div", _hoisted_450, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[136] || (_cache[136] = ($event) => config.launch.crop.x = $event),
                      type: "number"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.crop.x,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[137] || (_cache[137] = ($event) => config.launch.crop.y = $event),
                      type: "number"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.crop.y,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[138] || (_cache[138] = ($event) => config.launch.crop.width = $event),
                      type: "number",
                      min: "0"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.crop.width,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[139] || (_cache[139] = ($event) => config.launch.crop.height = $event),
                      type: "number",
                      min: "0"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.crop.height,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("initialWindow")), 1),
                  createBaseVNode("div", _hoisted_451, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[140] || (_cache[140] = ($event) => config.launch.window.x = $event),
                      type: "number"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.window.x,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[141] || (_cache[141] = ($event) => config.launch.window.y = $event),
                      type: "number"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.window.y,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[142] || (_cache[142] = ($event) => config.launch.window.width = $event),
                      type: "number",
                      min: "0"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.window.width,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[143] || (_cache[143] = ($event) => config.launch.window.height = $event),
                      type: "number",
                      min: "0"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.window.height,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ])
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "advanced" ? (openBlock(), createElementBlock("section", _hoisted_452, [
                createBaseVNode("h2", null, toDisplayString(t("advanced")), 1),
                createBaseVNode("div", null, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("accentScheme")), 1),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": ($event) => config.accentScheme = $event
                    }, [
                      createBaseVNode("option", { value: "default" }, "Red & Green (Default)", -1),
                      createBaseVNode("option", { value: "purple-orange" }, "Purple & Orange", -1),
                      createBaseVNode("option", { value: "pink-blue" }, "Pink & Blue", -1),
                      createBaseVNode("option", { value: "pink-purple" }, "Pink & Purple", -1),
                      createBaseVNode("option", { value: "blue-orange" }, "Blue & Orange", -1),
                      createBaseVNode("option", { value: "green-pink" }, "Green & Pink", -1),
                      createBaseVNode("option", { value: "yellow-purple" }, "Yellow & Purple", -1),
                      createBaseVNode("option", { value: "red-blue" }, "Red & Blue", -1)
                    ], 512), [
                      [vModelSelect, config.accentScheme]
                    ]),
                    createBaseVNode("small", null, toDisplayString(t("accentSchemeHint")), 1)
                  ]),
                  createBaseVNode("label", { class: "accent-reverse-row" }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.accentReversed = $event,
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.accentReversed]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("accentReversed")), 1)
                  ])
                ]),
                createBaseVNode("label", null, [
                  createBaseVNode("span", null, toDisplayString(t("extraArgs")), 1),
                  withDirectives(createBaseVNode("textarea", {
                    "onUpdate:modelValue": _cache[144] || (_cache[144] = ($event) => config.launch.extraArgs = $event),
                    rows: "5",
                    placeholder: "--power-off-on-close"
                  }, null, 512), [
                    [vModelText, config.launch.extraArgs]
                  ]),
                  createBaseVNode("small", null, toDisplayString(t("extraArgsHint")), 1)
                ]),
                createBaseVNode("div", _hoisted_453, [
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("pushTarget")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[145] || (_cache[145] = ($event) => config.launch.pushTarget = $event),
                      placeholder: "/sdcard/Download/"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.pushTarget,
                        void 0,
                        { trim: true }
                      ]
                    ]),
                    createBaseVNode("small", null, toDisplayString(t("pushTargetHint")), 1)
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("tunnelPort")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[146] || (_cache[146] = ($event) => config.launch.tunnelPort = $event),
                      placeholder: "27183:27199"
                    }, null, 512), [
                      [
                        vModelText,
                        config.launch.tunnelPort,
                        void 0,
                        { trim: true }
                      ]
                    ]),
                    createBaseVNode("small", null, toDisplayString(t("tunnelPortHint")), 1)
                  ])
                ]),
                createBaseVNode("div", { class: "toggle-columns" }, [
                createBaseVNode("div", { class: "toggle-col" }, [
                createBaseVNode("label", _hoisted_454, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[147] || (_cache[147] = ($event) => config.muteNotifications = $event),
                    type: "checkbox"
                  }, null, 512), [
                    [vModelCheckbox, config.muteNotifications]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("muteNotifications")), 1)
                ]),
                createBaseVNode("label", _hoisted_455, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[148] || (_cache[148] = ($event) => config.minimizeToTray = $event),
                    type: "checkbox"
                  }, null, 512), [
                    [vModelCheckbox, config.minimizeToTray]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("minimizeToTray")), 1)
                ]),
                createBaseVNode("label", _hoisted_456, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[149] || (_cache[149] = ($event) => config.killAdbOnQuit = $event),
                    type: "checkbox"
                  }, null, 512), [
                    [vModelCheckbox, config.killAdbOnQuit]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("killAdbOnQuit")), 1)
                ]),
                createBaseVNode("label", { class: "toggle" }, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": ($event) => config.update.checkOnStartup = $event,
                    type: "checkbox"
                  }, null, 512), [
                    [vModelCheckbox, config.update.checkOnStartup]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("checkUpdatesOnStartup")), 1)
                ]),
                createBaseVNode("label", { class: "toggle" }, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": ($event) => config.update.autoUpdateOnStartup = $event,
                    type: "checkbox"
                  }, null, 512), [
                    [vModelCheckbox, config.update.autoUpdateOnStartup]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("autoUpdateOnStartup")), 1)
                ]),
                createBaseVNode("label", { class: "toggle" }, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": ($event) => config.update.skipConfirmation = $event,
                    type: "checkbox"
                  }, null, 512), [
                    [vModelCheckbox, config.update.skipConfirmation]
                  ]),
                  createBaseVNode("span", null, toDisplayString(t("skipUpdateConfirmation")), 1)
                ])
                ]),
                createBaseVNode("div", { class: "toggle-col scripts-col" }, [
                  createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("scripts")), 1),
                  createBaseVNode("p", { class: "muted scripts-hint" }, toDisplayString(t("scriptsHint")), 1),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(SCRCPY_SCRIPTS, (script) => {
                    return openBlock(), createElementBlock("label", { key: script.id, class: "toggle" }, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": ($event) => config.scripts[script.id] = $event,
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.scripts[script.id]]
                      ]),
                      createBaseVNode("span", { title: script.args }, toDisplayString(script.label), 1)
                    ]);
                  }), 128))
                ])
                ]),
                createBaseVNode("div", _hoisted_457, [
                  createBaseVNode("label", _hoisted_458, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[150] || (_cache[150] = ($event) => config.bossKeyEnabled = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.bossKeyEnabled]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("bossKey")), 1)
                  ]),
                  createBaseVNode("label", null, [
                    createBaseVNode("span", null, toDisplayString(t("bossKeyShortcut")), 1),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[151] || (_cache[151] = ($event) => config.bossKeyAccelerator = $event),
                      disabled: !config.bossKeyEnabled,
                      placeholder: "CommandOrControl+Shift+B",
                      onChange: _cache[152] || (_cache[152] = ($event) => applyBossKey(true))
                    }, null, 40, _hoisted_459), [
                      [
                        vModelText,
                        config.bossKeyAccelerator,
                        void 0,
                        { trim: true }
                      ]
                    ]),
                    createBaseVNode("small", null, toDisplayString(t("bossKeyHint")), 1)
                  ])
                ])
              ])) : createCommentVNode("", true)
            ])
          ], 64)) : activeTab.value === "logs" ? (openBlock(), createElementBlock(Fragment, { key: 6 }, [
            createBaseVNode("section", _hoisted_460, [
              createBaseVNode("div", null, [
                createBaseVNode("p", _hoisted_461, toDisplayString(t("logs")), 1),
                createBaseVNode("h1", null, toDisplayString(t("structuredEvents")), 1)
              ]),
              createBaseVNode("div", _hoisted_462, [
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[153] || (_cache[153] = ($event) => logLevel.value = $event),
                  "aria-label": t("filterByLevel")
                }, [
                  createBaseVNode("option", _hoisted_464, toDisplayString(t("allLevels")), 1),
                  (openBlock(), createElementBlock(Fragment, null, renderList(eventLevels, (level) => {
                    return createBaseVNode("option", {
                      key: level,
                      value: level
                    }, toDisplayString(level), 9, _hoisted_465);
                  }), 64))
                ], 8, _hoisted_463), [
                  [vModelSelect, logLevel.value]
                ]),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[154] || (_cache[154] = ($event) => logDomain.value = $event),
                  "aria-label": t("filterByDomain")
                }, [
                  createBaseVNode("option", _hoisted_467, toDisplayString(t("allDomains")), 1),
                  (openBlock(), createElementBlock(Fragment, null, renderList(eventDomains, (domain) => {
                    return createBaseVNode("option", {
                      key: domain,
                      value: domain
                    }, toDisplayString(domain), 9, _hoisted_468);
                  }), 64))
                ], 8, _hoisted_466), [
                  [vModelSelect, logDomain.value]
                ]),
                createBaseVNode("button", {
                  class: "secondary",
                  disabled: preparingDiagnostics.value,
                  onClick: previewDiagnostics
                }, toDisplayString(t("prepareDiagnostics")), 9, _hoisted_469),
                createBaseVNode("button", {
                  class: "ghost",
                  onClick: clearLogs
                }, toDisplayString(t("clearLogs")), 1)
              ])
            ]),
            diagnosticPreview.value ? (openBlock(), createElementBlock("section", _hoisted_470, [
              createBaseVNode("div", _hoisted_471, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", _hoisted_472, toDisplayString(t("diagnosticPreview")), 1),
                  createBaseVNode("p", _hoisted_473, toDisplayString(t("diagnosticPrivacyHint")), 1)
                ]),
                createBaseVNode("span", _hoisted_474, toDisplayString(formatBytes(diagnosticPreview.value.estimatedBytes)) + " / " + toDisplayString(formatBytes(diagnosticPreview.value.maxBytes)), 1)
              ]),
              createBaseVNode("div", _hoisted_475, [
                createBaseVNode("div", _hoisted_476, [
                  createBaseVNode("strong", null, toDisplayString(t("includedFiles")), 1),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(diagnosticPreview.value.files, (file) => {
                    return openBlock(), createElementBlock("div", {
                      key: file.name
                    }, [
                      createBaseVNode("code", null, toDisplayString(file.name), 1),
                      createBaseVNode("span", null, toDisplayString(file.description), 1),
                      createBaseVNode("small", null, toDisplayString(formatBytes(file.bytes)), 1)
                    ]);
                  }), 128))
                ]),
                createBaseVNode("div", _hoisted_477, [
                  createBaseVNode("strong", null, toDisplayString(t("redactionsApplied")), 1),
                  diagnosticPreview.value.redactions.length ? (openBlock(), createElementBlock("div", _hoisted_478, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(diagnosticPreview.value.redactions, (item) => {
                      return openBlock(), createElementBlock("span", {
                        key: item.kind
                      }, toDisplayString(item.kind) + " · " + toDisplayString(item.count), 1);
                    }), 128))
                  ])) : (openBlock(), createElementBlock("p", _hoisted_479, toDisplayString(t("noSensitiveValuesFound")), 1)),
                  createBaseVNode("small", null, toDisplayString(diagnosticPreview.value.eventCount) + " " + toDisplayString(t("recentEventsIncluded")), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_480, [
                createBaseVNode("button", {
                  class: "primary",
                  disabled: preparingDiagnostics.value,
                  onClick: exportDiagnostics
                }, toDisplayString(t("exportDiagnosticBundle")), 9, _hoisted_481),
                diagnosticArtifact.value ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  class: "secondary",
                  onClick: _cache[155] || (_cache[155] = ($event) => openIssueHelper())
                }, toDisplayString(t("openIssueHelper")), 1)) : createCommentVNode("", true),
                diagnosticArtifact.value ? (openBlock(), createElementBlock("span", _hoisted_482, toDisplayString(diagnosticArtifact.value.name), 1)) : createCommentVNode("", true)
              ])
            ])) : createCommentVNode("", true),
            createBaseVNode("section", _hoisted_483, [
              !visibleLogs.value.length ? (openBlock(), createElementBlock("p", _hoisted_484, toDisplayString(t("noLogs")), 1)) : createCommentVNode("", true),
              (openBlock(true), createElementBlock(Fragment, null, renderList(visibleLogs.value, (entry) => {
                return openBlock(), createElementBlock("div", {
                  key: entry.id,
                  class: normalizeClass(["log-line", entry.level])
                }, [
                  createBaseVNode("time", null, toDisplayString(new Date(entry.timestamp).toLocaleTimeString()), 1),
                  createBaseVNode("div", _hoisted_485, [
                    createBaseVNode("code", null, [
                      createTextVNode("[" + toDisplayString(entry.domain) + "/" + toDisplayString(entry.action) + "]", 1),
                      entry.deviceId ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                        createTextVNode(" [" + toDisplayString(entry.deviceId) + "]", 1)
                      ], 64)) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(entry.message), 1)
                    ]),
                    entry.stage || entry.requestId ? (openBlock(), createElementBlock("small", _hoisted_486, [
                      entry.stage ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                        createTextVNode("stage=" + toDisplayString(entry.stage), 1)
                      ], 64)) : createCommentVNode("", true),
                      entry.requestId ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                        createTextVNode(" request=" + toDisplayString(entry.requestId), 1)
                      ], 64)) : createCommentVNode("", true)
                    ])) : createCommentVNode("", true),
                    eventError(entry) ? (openBlock(), createElementBlock("details", _hoisted_487, [
                      createBaseVNode("summary", null, toDisplayString(t("errorDetails")) + " · " + toDisplayString(eventError(entry)?.code), 1),
                      eventError(entry)?.detail ? (openBlock(), createElementBlock("p", _hoisted_488, toDisplayString(eventError(entry)?.detail), 1)) : createCommentVNode("", true),
                      createBaseVNode("p", null, toDisplayString(t("retryable")) + ": " + toDisplayString(eventError(entry)?.retryable ? t("yes") : t("no")), 1),
                      eventError(entry)?.suggestedActions.length ? (openBlock(), createElementBlock("ul", _hoisted_489, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(eventError(entry)?.suggestedActions, (action) => {
                          return openBlock(), createElementBlock("li", { key: action }, toDisplayString(action), 1);
                        }), 128))
                      ])) : createCommentVNode("", true)
                    ])) : createCommentVNode("", true)
                  ])
                ], 2);
              }), 128))
            ])
          ], 64)) : activeTab.value === "boot" ? (openBlock(), createElementBlock("section", { key: 7, class: "panel" }, [
            createBaseVNode("div", { class: "panel-title" }, [
              createBaseVNode("div", null, [
                createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("boot")), 1),
                createBaseVNode("p", { class: "muted" }, toDisplayString(t("bootHint")), 1)
              ]),
              createBaseVNode("label", { class: "inline-form" }, [
                createBaseVNode("span", null, toDisplayString(t("bootDevice")), 1),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": ($event) => bootSerial.value = $event
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(usableDevices.value, (device) => {
                    return openBlock(), createElementBlock("option", {
                      key: device.serial,
                      value: device.serial
                    }, toDisplayString(config.deviceAliases[device.serial] || device.model) + " \u00b7 " + toDisplayString(device.serial), 9);
                  }), 128))
                ], 512), [
                  [vModelSelect, bootSerial.value]
                ])
              ])
            ]),
            createBaseVNode("div", { class: "toolkit-grid" }, [
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("reboot") }, toDisplayString(t("bootReboot")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("recovery") }, toDisplayString(t("bootRecovery")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("bootloader") }, toDisplayString(t("bootBootloader")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("safe-mode") }, toDisplayString(t("bootSafeMode")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("wake") }, toDisplayString(t("bootWake")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("sleep") }, toDisplayString(t("bootSleep")), 1),
              createBaseVNode("button", { class: "danger", onClick: () => bootAction("power-off") }, toDisplayString(t("bootPowerOff")), 1)
            ]),
            createBaseVNode("p", { class: "muted" }, toDisplayString(t("bootSafeModeHint")), 1)
          ])) : activeTab.value === "toolkit" ? (openBlock(), createElementBlock("section", { key: 8, class: "panel" }, [
            createBaseVNode("div", { class: "panel-title" }, [
              createBaseVNode("div", null, [
                createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("toolkit")), 1),
                createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitHint")), 1)
              ]),
              createBaseVNode("label", { class: "inline-form" }, [
                createBaseVNode("span", null, toDisplayString(t("bootDevice")), 1),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": ($event) => toolkitSerial.value = $event
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(usableDevices.value, (device) => {
                    return openBlock(), createElementBlock("option", {
                      key: device.serial,
                      value: device.serial
                    }, toDisplayString(config.deviceAliases[device.serial] || device.model) + " \u00b7 " + toDisplayString(device.serial), 9);
                  }), 128))
                ], 512), [
                  [vModelSelect, toolkitSerial.value]
                ])
              ])
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("div", { class: "toolkit-section-title" }, toDisplayString(t("toolkitAdbTitle")), 1),
              createBaseVNode("div", { class: "toolkit-row" }, [
                createBaseVNode("button", { class: "secondary compact", onClick: () => adbServerAction("restart") }, toDisplayString(t("restartAdbServer")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => adbServerAction("stop") }, toDisplayString(t("stopAdbServer")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => refreshDevices() }, toDisplayString(t("refresh")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => runToolkitAdb(["devices", "-l"]) }, toDisplayString(t("listDevices")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => runToolkitAdb(["shell", "getprop", "ro.build.version.release"]) }, toDisplayString(t("androidVersion")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => runToolkitAdb(["shell", "dumpsys", "battery"]) }, toDisplayString(t("battery")), 1)
              ])
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("div", { class: "toolkit-section-title" }, toDisplayString(t("toolkitShizukuTitle")), 1),
              createBaseVNode("div", { class: "toolkit-row" }, [
                createBaseVNode("button", { class: "secondary compact", onClick: () => shizukuAction("start") }, toDisplayString(t("toolkitShizukuStart")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => shizukuAction("stop") }, toDisplayString(t("toolkitShizukuStop")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => shizukuAction("status") }, toDisplayString(t("toolkitShizukuStatus")), 1)
              ]),
              createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitShizukuHint")), 1)
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("div", { class: "toolkit-section-title" }, toDisplayString(t("toolkitCommandTitle")), 1),
              createBaseVNode("div", { class: "toolkit-row" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => toolkitCommand.value = $event,
                  placeholder: t("toolkitCommandPlaceholder")
                }, null, 512), [
                  [vModelText, toolkitCommand.value, void 0, { trim: false }]
                ]),
                createBaseVNode("button", {
                  class: "secondary compact",
                  disabled: toolkitBusy.value,
                  onClick: runToolkitCommand
                }, toDisplayString(t("toolkitRun")), 9, ["disabled"])
              ]),
              createBaseVNode("pre", { class: "toolkit-output" }, toDisplayString(toolkitOutput.value || t("toolkitNoOutput")), 1),
              createBaseVNode("div", { class: "toolkit-subtitle" }, toDisplayString(t("toolkitRecent")), 1),
              recentCommands.value.length ? (openBlock(), createElementBlock("div", { key: 0, class: "toolkit-chips" }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(recentCommands.value, (command) => {
                  return openBlock(), createElementBlock("button", {
                    key: command,
                    class: "ghost compact",
                    onClick: () => runRecent(command)
                  }, toDisplayString(command), 1);
                }), 128))
              ])) : createBaseVNode("p", { key: 1, class: "muted" }, toDisplayString(t("toolkitNoCommands")), 1),
              createBaseVNode("div", { class: "toolkit-subtitle" }, toDisplayString(t("toolkitMostUsed")), 1),
              mostUsedCommands.value.length ? (openBlock(), createElementBlock("div", { key: 2, class: "toolkit-chips" }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(mostUsedCommands.value, (command) => {
                  return openBlock(), createElementBlock("button", {
                    key: command,
                    class: "ghost compact",
                    onClick: () => runRecent(command)
                  }, toDisplayString(command) + " (" + toDisplayString(config.toolkit.commandUsage[command] || 0) + ")", 1);
                }), 128))
              ])) : createBaseVNode("p", { key: 3, class: "muted" }, toDisplayString(t("toolkitNoCommands")), 1)
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("label", { class: "toggle" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshEnabled = $event,
                  type: "checkbox"
                }, null, 512), [
                  [vModelCheckbox, config.toolkit.sshEnabled]
                ]),
                createBaseVNode("span", null, toDisplayString(t("toolkitEnableSsh")), 1)
              ]),
              config.toolkit.sshEnabled ? (openBlock(), createElementBlock("div", { key: 0, class: "toolkit-row" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshHost = $event,
                  placeholder: t("toolkitSshHost")
                }, null, 512), [
                  [vModelText, config.toolkit.sshHost, void 0, { trim: true }]
                ]),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshLocalPort = $event,
                  type: "number",
                  min: "1",
                  max: "65535"
                }, null, 512), [
                  [vModelText, config.toolkit.sshLocalPort, void 0, { number: true }]
                ]),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshRemotePort = $event,
                  type: "number",
                  min: "1",
                  max: "65535"
                }, null, 512), [
                  [vModelText, config.toolkit.sshRemotePort, void 0, { number: true }]
                ]),
                createBaseVNode("button", { class: "secondary compact", onClick: () => sshTunnelAction("start") }, toDisplayString(t("toolkitStart")), 1),
                createBaseVNode("button", { class: "ghost compact", onClick: () => sshTunnelAction("stop") }, toDisplayString(t("toolkitStop")), 1),
                createBaseVNode("button", { class: "ghost compact", onClick: () => sshTunnelAction("status") }, toDisplayString(t("toolkitStatus")), 1)
              ])) : createCommentVNode("", true),
              createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitSshHint")), 1)
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("label", { class: "toggle" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.perInstanceTerminal = $event,
                  type: "checkbox"
                }, null, 512), [
                  [vModelCheckbox, config.toolkit.perInstanceTerminal]
                ]),
                createBaseVNode("span", null, toDisplayString(t("toolkitEnableTerminal")), 1)
              ]),
              config.toolkit.perInstanceTerminal ? (openBlock(), createElementBlock("div", { key: 0, class: "toolkit-row" }, [
                createBaseVNode("button", { class: "secondary compact", onClick: () => openDeviceTerminal() }, toDisplayString(t("toolkitTerminalOpen")), 1)
              ])) : createCommentVNode("", true),
              createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitTerminalHint")), 1)
            ])
          ])) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", _hoisted_490, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(toasts.value, (item) => {
            return openBlock(), createElementBlock("div", {
              key: item.id,
              class: normalizeClass(["toast", item.kind])
            }, toDisplayString(item.message), 3);
          }), 128))
        ]),
        updateConfirmOpen.value ? (openBlock(), createElementBlock("div", { key: 0, class: "modal-backdrop" }, [
          createBaseVNode("div", { class: "modal", role: "dialog", "aria-modal": "true" }, [
            createBaseVNode("h3", null, toDisplayString(t("updateConfirmTitle")), 1),
            createBaseVNode("p", { class: "modal-subtitle" }, toDisplayString(t("updateConfirmHint")), 1),
            createBaseVNode("div", { class: "update-list" }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(updateInfo.value.items.filter((item) => item.available), (item) => {
                return openBlock(), createElementBlock("div", {
                  key: item.id,
                  class: "update-row"
                }, [
                  createBaseVNode("span", { class: "update-name" }, toDisplayString(item.name), 1),
                  createBaseVNode("span", { class: "update-versions" }, toDisplayString(`${item.installed || "?"} → ${item.latest || "?"}`), 1)
                ]);
              }), 128))
            ]),
            createBaseVNode("div", { class: "modal-actions" }, [
              createBaseVNode("button", {
                class: "primary compact",
                onClick: () => applyUpdates()
              }, toDisplayString(t("update")), 1),
              createBaseVNode("button", {
                class: "ghost compact",
                onClick: () => updateConfirmOpen.value = false
              }, toDisplayString(t("cancel")), 1)
            ]),
            createBaseVNode("label", { class: "modal-check" }, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": ($event) => updateDontShowAgain.value = $event,
                type: "checkbox"
              }, null, 512), [
                [vModelCheckbox, updateDontShowAgain.value]
              ]),
              createBaseVNode("span", null, toDisplayString(t("dontShowAgain")), 1)
            ])
          ])
        ])) : createCommentVNode("", true),
        createBaseVNode("div", {
          class: "float-nav-bar",
          style: { display: config.navBar ? "flex" : "none" }
        }, [
          createBaseVNode("span", { class: "float-label" }, toDisplayString(t("navBarLabel")), 1),
          createBaseVNode("button", {
            class: "float-nav-btn",
            onClick: () => sendControlAction("back")
          }, "‹"),
          createBaseVNode("button", {
            class: "float-nav-btn float-home",
            onClick: () => sendControlAction("home")
          }, "●"),
          createBaseVNode("button", {
            class: "float-nav-btn",
            onClick: () => sendControlAction("app-switch")
          }, "▢")
        ], 4),
        createBaseVNode("div", {
          class: "float-swipe",
          style: { display: config.swipePanel ? "grid" : "none" }
        }, [
          createBaseVNode("span", { class: "float-label" }, toDisplayString(t("swipePanelLabel")), 1),
          createBaseVNode("button", {
            class: "swipe-btn",
            onClick: () => swipeAction("up")
          }, "↑"),
          createBaseVNode("div", { class: "swipe-mid" }, [
            createBaseVNode("button", {
              class: "swipe-btn",
              onClick: () => swipeAction("left")
            }, "←"),
            createBaseVNode("button", {
              class: "swipe-btn",
              onClick: () => swipeAction("right")
            }, "→")
          ]),
          createBaseVNode("button", {
            class: "swipe-btn",
            onClick: () => swipeAction("down")
          }, "↓")
        ], 4),
        createBaseVNode("div", {
          class: "modal-backdrop qr-backdrop",
          style: { display: qrModal.value ? "flex" : "none" }
        }, [
          createBaseVNode("div", { class: "modal qr-modal", role: "dialog", "aria-modal": "true" }, [
            createBaseVNode("h3", null, toDisplayString(t("qrTitle")), 1),
            createBaseVNode("p", { class: "modal-subtitle" }, toDisplayString(t("qrSubtitle")), 1),
            createBaseVNode("div", { class: "qr-body" }, [
              createBaseVNode("canvas", { class: "qr-canvas", width: "320", height: "320" }, null, 512),
              createBaseVNode("p", { class: "muted qr-status" }, toDisplayString(qrStatus.value === "done" ? t("qrSuccess") : qrStatus.value === "failed" ? t("qrFailed") : t("qrWaitingDevice")), 1)
            ]),
            createBaseVNode("div", { class: "modal-actions" }, [
              createBaseVNode("button", {
                class: "ghost compact",
                onClick: closeQrModal
              }, toDisplayString(t("close")), 1)
            ])
          ])
        ], 4),
        createBaseVNode("div", {
          class: "drop-overlay",
          style: { display: dragActive.value ? "grid" : "none" }
        }, [
          createBaseVNode("div", { class: "drop-overlay-card" }, toDisplayString(t("dropHint")), 1)
        ], 4)
      ]);
    };
  }
});
createApp(_sfc_main).mount("#app");
