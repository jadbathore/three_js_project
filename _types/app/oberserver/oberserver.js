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
    async notify(event) {
        for (const observer of this.observers) {
            const iterator = observer.update(this, event);
            for await (const IteratorResult of iterator) {
                IteratorResult;
            }
        }
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
    async *update(subject, event) {
        const emitPromise = new Promise((resolve, rejects) => {
            resolve(event);
        });
        yield subject.addEventObserver(this, emitPromise);
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
        writable: true,
        configurable: true
    });
}
