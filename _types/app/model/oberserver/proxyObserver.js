export class proxyObserver {
    constructor(observer) {
        this._observer = observer;
        this._firstLayerProxy = new Proxy(observer.events, observer.firstLayerproxyHandler);
        this._proxy = this.proxyRevokeable(this._firstLayerProxy);
    }
    ProxyBehavior(callBack) {
        const _array = [];
        Object.defineProperty(this._proxy.proxy, 'push', {
            value: function () {
                _array.push(...arguments);
                callBack(arguments[0], this._observer.path);
            },
            writable: true,
            configurable: true
        });
    }
    proxyRevokeable(proxy) {
        const objRevokableProxy = { proxy: proxy, observer: this._observer };
        const secondLayerProxy = Proxy.revocable(objRevokableProxy, this._observer.secondLayerproxyHandler);
        Object.defineProperty(secondLayerProxy, 'revoke', {
            value: () => {
                delete objRevokableProxy.proxy;
                delete objRevokableProxy.observer;
            },
        });
        return secondLayerProxy;
    }
    proxyRevoke() {
        this._proxy.revoke();
    }
}
