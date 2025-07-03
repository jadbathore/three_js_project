var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var restrictionType;
(function (restrictionType) {
    restrictionType["none"] = "none";
    restrictionType["usingDatabase"] = "none";
    restrictionType["usingCompiler"] = "none";
})(restrictionType || (restrictionType = {}));
function restriction(restriction) {
    return (target, propertyKey, descriptor) => {
        console.log(restriction);
    };
}
function reportableClassDecorator(constructor) {
    return class extends constructor {
        constructor() {
            super(...arguments);
            this.reportingURL = "t";
            this.blabla = "a";
        }
    };
}
let bin = class bin {
    abc(...args) {
        console.log("normal");
    }
    abcd(...args) {
        console.log("normal");
    }
    efg(...args) {
        console.log(args);
        return "a";
    }
};
__decorate([
    restriction(restrictionType.none)
], bin.prototype, "abc", null);
__decorate([
    restriction(restrictionType.usingDatabase)
], bin.prototype, "abcd", null);
bin = __decorate([
    reportableClassDecorator
], bin);
console.log(new bin);
export {};
