var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _PathUtility_element;
import fs from 'fs';
import path from 'path';
import ThreeTreeConfig from '../../../../threeTree.config.js';
class PathUtility {
    getPathSplit(pathFile) {
        const pathregex = /((\.)|(\/))/g;
        const replace = pathFile.replace(pathregex, ' ');
        return replace?.split(' ')?.filter((e) => e != '') ?? pathFile;
    }
    static getcompilerFile() {
        return this.compilerFile;
    }
    static getViewerFile() {
        return this.viewerPathName;
    }
    static getlinkFile() {
        return this.linkFile;
    }
    static getRollupFile() {
        return this.rollupConfig;
    }
    static initElement(element) {
        __classPrivateFieldSet(this, _a, element, "f", _PathUtility_element);
    }
    static getMapFile(directory) {
        directory = (directory) ? this.rootDirProjectName + directory + "/" : this.rootDirProjectName;
        const mapFile = new Map();
        fs.readdirSync(directory, { withFileTypes: true }).filter(dir => dir.isDirectory()).map((dir) => {
            const arry = fs.readdirSync(path.join(process.cwd(), ...this.self.getPathSplit(directory), dir.name));
            mapFile.set(dir.name, arry);
        });
        return mapFile;
    }
    static getarrayFile(directory) {
        const allFile = [];
        for (const [key, value] of _a.getMapFile(directory)) {
            for (const file of value) {
                const pathFile = path.join(process.cwd(), ...this.self.getPathSplit(this.rootDirProjectName), directory, key, file);
                allFile.push(pathFile);
            }
        }
        return allFile;
    }
    static getArrayFileExeceptSetting() {
        const allExeceptSetting = [];
        for (const [key, value] of _a.getMapFile()) {
            for (const file of value) {
                if (key != 'Setting') {
                    const pathFile = path.join(process.cwd(), ...this.self.getPathSplit(this.rootDirProjectName), key, file);
                    allExeceptSetting.push(pathFile);
                }
            }
        }
        return allExeceptSetting;
    }
    static getBasename() {
        const basenameFile = [];
        _a.getarrayFile().forEach((element) => {
            const base = path.basename(element);
            basenameFile.push(base);
        });
        return basenameFile;
    }
    static getBasenameExceptingSetting() {
        const basenameFile = [];
        _a.getArrayFileExeceptSetting().forEach((element) => {
            const base = path.basename(element);
            basenameFile.push(base);
        });
        return basenameFile;
    }
    static getPathFromElement(...pathfile) {
        return path.join(process.cwd(), ...this.self.getPathSplit(this.rootDirProjectName), ...pathfile);
    }
    static getPathFromElementCompile(...pathfile) {
        return path.join(process.cwd(), ...this.self.getPathSplit(this.rootDirProjectName), __classPrivateFieldGet(this, _a, "f", _PathUtility_element) ?? '', ...pathfile);
    }
    static pathofElementWithPoint(pathfile) {
        return (pathfile) ? this.rootDirProjectName + pathfile : '';
    }
    static getPathFromProcess(...pathfile) {
        return path.join(process.cwd(), ...pathfile);
    }
    static getPathFromBaseFile(...pathfile) {
        return path.join(process.cwd(), ...pathfile);
    }
    static getPathFromPublic(...pathfile) {
        return path.join(process.cwd(), ...this.self.getPathSplit(this.dirPathPublic), ...pathfile);
    }
    static getMapAsset() {
        const mapAsset = new Map();
        fs.readdirSync(this.dirPathAssetName, { withFileTypes: true }).filter(dir => dir.isDirectory()).map((dir) => {
            const arry = fs.readdirSync(path.join(process.cwd(), ...this.self.getPathSplit(this.dirPathAssetName), dir.name));
            mapAsset.set(dir.name, arry);
        });
        return mapAsset;
    }
}
_a = PathUtility;
(() => {
    _a.self = (new _a);
    _a.versionDIR = path.join(process.cwd(), 'app', 'public', 'versionning');
    _a.compilerFile = path.join(process.cwd(), 'app', 'public', 'versionning', 'compling.js');
    _a.linkFile = path.join(process.cwd(), 'app', 'public', 'versionning', 'linkfile.js');
    _a.rollupConfig = path.resolve(process.cwd(), 'rollup.config.js');
    _a.dist = path.resolve(process.cwd(), 'app', 'public', 'dist', 'compling.js');
    _a.rootDirProjectName = ThreeTreeConfig.path.rootDirProjectName;
    _a.dirPathAssetName = ThreeTreeConfig.path.dirPathAssetName;
    _a.dirPathPublic = ThreeTreeConfig.path.dirPathPublic;
    _a.viewerPathName = path.join(process.cwd(), 'app', 'viewer');
    _a.keySLL = path.join(process.cwd(), 'SSLcredential', 'key.pem');
    _a.certSLL = path.join(process.cwd(), 'SSLcredential', 'cert.pem');
})();
_PathUtility_element = { value: void 0 };
export default PathUtility;
