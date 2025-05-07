export class proxyObserver {
    constructor(observer) {
        this._observer = observer;
        this._proxy = new Proxy(observer.events, observer.firstLayerproxyHandler);
    }
    ProxyBehavior(callBack) {
        const _array = [];
        Object.defineProperty(this._proxy, 'push', {
            value: function () {
                _array.push(...arguments);
                callBack(arguments[0], this._observer);
            },
            writable: true,
            configurable: true
        });
    }
    proxyRevoke() {
        const objRevokableProxy = { proxy: this._proxy, observer: this._observer };
        const secondLayerProxy = Proxy.revocable(objRevokableProxy, this._observer.secondLayerproxyHandler);
        Object.defineProperty(secondLayerProxy, 'revoke', {
            value: () => {
                delete objRevokableProxy.proxy;
                delete objRevokableProxy.observer;
            },
        });
        secondLayerProxy.revoke();
    }
}
