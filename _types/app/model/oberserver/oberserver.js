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
        this._firstLayerProxyHandler = this.setFirstLayerProxyHandler();
        this._secondLayerProxyHandler = this.setSecondLayerProxy();
    }
    async *update(subject, event) {
        const emitPromise = new Promise((resolve, rejects) => {
            resolve(event);
        });
        yield subject.addEventObserver(this, emitPromise);
    }
    setFirstLayerProxyHandler() {
        return {
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
    }
    setSecondLayerProxy() {
        return {
            get: function (...args) {
                return Reflect.get(...args);
            },
            deleteProperty(...args) {
                console.log("test");
                return Reflect.deleteProperty(...args);
            }
        };
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
    get firstLayerproxyHandler() {
        return this._firstLayerProxyHandler;
    }
    get secondLayerproxyHandler() {
        return this._secondLayerProxyHandler;
    }
}
export function proxyObserver(observer, callBack) {
    const _array = [];
    const ProxyObserver = new Proxy(observer.events, observer.firstLayerproxyHandler);
    Object.defineProperty(ProxyObserver, 'push', {
        value: function () {
            _array.push(...arguments);
            callBack(arguments[0], observer.path, this);
        },
        writable: true,
        configurable: true
    });
    return ProxyObserver;
}
export function proxyRevokeCall(proxy, observer) {
    const objRevokableProxy = { proxy: proxy, observer: observer };
    const secondLayerProxy = Proxy.revocable(objRevokableProxy, observer.secondLayerproxyHandler);
    Object.defineProperty(proxy, 'push', {
        writable: false,
        configurable: false
    });
    Object.defineProperty(secondLayerProxy, 'revoke', {
        value: () => {
            delete objRevokableProxy.proxy;
            delete objRevokableProxy.observer;
        },
    });
    return secondLayerProxy;
}
