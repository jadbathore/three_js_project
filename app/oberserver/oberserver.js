var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _SingleToneEventHistory_instance, _SingleToneEventHistory_events;
class SingleToneEventHistory {
    constructor() {
        _SingleToneEventHistory_events.set(this, []);
    }
    static get instance() {
        if (!__classPrivateFieldGet(_a, _a, "f", _SingleToneEventHistory_instance)) {
            __classPrivateFieldSet(_a, _a, new _a(), "f", _SingleToneEventHistory_instance);
        }
        return __classPrivateFieldGet(_a, _a, "f", _SingleToneEventHistory_instance);
    }
    addEvent(event) {
        __classPrivateFieldGet(this, _SingleToneEventHistory_events, "f").push(event);
    }
    get events() {
        return __classPrivateFieldGet(this, _SingleToneEventHistory_events, "f");
    }
}
_a = SingleToneEventHistory, _SingleToneEventHistory_events = new WeakMap();
_SingleToneEventHistory_instance = { value: void 0 };
export class CompilerWatchSubject {
    constructor() {
        this.observers = [];
        this._instanceEvent = SingleToneEventHistory.instance;
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
    getChange(event) {
        for (const observer of this.observers) {
            observer.update(this, event);
        }
    }
    addToHistory(event) {
        this._instanceEvent.addEvent(event);
    }
}
export class ObserverWatch {
    get eventType() {
        return this._eventType;
    }
    get filename() {
        return this._fileName;
    }
    update(subject, event) {
        this._eventType = event.eventType;
        this._fileName = event.filename;
    }
}
const subject = new CompilerWatchSubject();
const funcTest = () => {
    const observer = new ObserverWatch();
    subject.attach(observer);
    subject.getChange({ eventType: 'change', filename: 'baba.js' });
};
funcTest();
//# sourceMappingURL=oberserver.js.map