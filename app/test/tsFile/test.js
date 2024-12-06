var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
export class CompilerWatchSubject {
    constructor() {
        this.observers = [];
    }
    attach(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }
    detach(observer) {
        const obeserverIndex = this.observers.indexOf(observer);
        if (obeserverIndex === -1) {
            throw Error(`observer do not exist (on CompilerWatchSubject)`);
        }
        this.observers.splice(obeserverIndex, 1);
    }
    notify(event) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            for (const observer of this.observers) {
                const iterator = observer.update(this, event);
                try {
                    for (var _d = true, iterator_1 = (e_1 = void 0, __asyncValues(iterator)), iterator_1_1; iterator_1_1 = yield iterator_1.next(), _a = iterator_1_1.done, !_a; _d = true) {
                        _c = iterator_1_1.value;
                        _d = false;
                        const IteratorResult = _c;
                        IteratorResult;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = iterator_1.return)) yield _b.call(iterator_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    }
    addEventObserver(observer, eventPromise) {
        eventPromise.then((event) => {
            observer.addEvent(event);
        });
    }
}
export class ObserverWatch {
    constructor(path) {
        this._events = [];
        this._path = path;
    }
    update(subject, event) {
        return __asyncGenerator(this, arguments, function* update_1() {
            const emitPromise = new Promise((resolve, rejects) => {
                resolve(event);
            });
            yield yield __await(subject.addEventObserver(this, emitPromise));
        });
    }
    addEvent(event) {
        this._events.push(event);
    }
    get events() {
        return this._events;
    }
    get path() {
        return this._path;
    }
}
const subject = new CompilerWatchSubject();
const observer = new ObserverWatch('/');
export function ProxyObserver(observer, callBack) {
    const _array = [];
    const raiseEvent = (event, path) => {
        callBack(event, path);
    };
    const EventsHandler = {
        get: function (target, p, receiver) {
            if (p) {
                const index = parseInt(p);
                return target[index];
            }
            return target;
        },
        set: function (target, p, newvalue, receiver) {
            const index = parseInt(p);
            target[index] = newvalue;
            return true;
        }
    };
    const ProxyObserver = new Proxy(observer.events, EventsHandler);
    Object.defineProperty(ProxyObserver, 'push', {
        value: function () {
            _array.push(...arguments);
            raiseEvent(arguments[0], observer.path);
        },
        writable: false,
    });
}
//# sourceMappingURL=test.js.map