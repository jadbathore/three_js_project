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
        const ObserverToDetach = this.observers[obeserverIndex];
        Object.defineProperty(ObserverToDetach, 'push', {
            writable: false,
            configurable: false
        });
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
        this._firstLayerProxyHandler = this.setProxyHandler();
        this._secondLayerProxyHandler = this.setSecondLayerProxy();
    }
    async *update(subject, event) {
        const emitPromise = new Promise((resolve, rejects) => {
            resolve(event);
        });
        yield subject.addEventObserver(this, emitPromise);
    }
    setProxyHandler() {
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
export class singletonProxyObserver {
    constructor() {
        this._array = [];
        this._proxyFirstLayerObserver = [];
    }
    static get instance() {
        if (!singletonProxyObserver._instance) {
            singletonProxyObserver._instance = new singletonProxyObserver();
        }
        return singletonProxyObserver._instance;
    }
    proxyObserver(observer, callBack) {
        if (!this._proxyFirstLayerObserver) {
            this._proxyFirstLayerObserver = new Proxy(observer.events, observer.firstLayerproxyHandler);
            Object.defineProperty(this._proxyFirstLayerObserver, 'push', {
                value: function () {
                    this._array.push(...arguments);
                    callBack(arguments[0], observer.path);
                },
                writable: true,
                configurable: true
            });
        }
        const objRevokableProxy = { proxy: this._proxyFirstLayerObserver, observer: observer };
        const secondLayerProxy = Proxy.revocable(objRevokableProxy, observer.secondLayerproxyHandler);
        Object.defineProperty(secondLayerProxy, 'revoke', {
            value: () => {
                delete objRevokableProxy.proxy;
                console.log(this._array);
            },
            writable: true,
            configurable: true
        });
        return secondLayerProxy;
    }
}
export function ProxyObserver(observer, callBack) {
    const _array = [];
    const ProxyObserver = new Proxy(observer.events, observer.firstLayerproxyHandler);
    Object.defineProperty(ProxyObserver, 'push', {
        value: function () {
            _array.push(...arguments);
            callBack(arguments[0], observer.path);
        },
        writable: true,
        configurable: true
    });
    const objRevokableProxy = { proxy: observer.events, observer: observer };
    const secondLayerProxy = Proxy.revocable(objRevokableProxy, observer.secondLayerproxyHandler);
    Object.defineProperty(secondLayerProxy, 'revoke', {
        value: () => {
            delete objRevokableProxy.proxy;
            console.log(_array);
        },
        writable: true,
        configurable: true
    });
    return secondLayerProxy;
}
