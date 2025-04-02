export default class PathUtility {
    static getcompilerFile(): string;
    static getViewerFile(): string;
    static getlinkFile(): string;
    static getRollupFile(): string;
    static getMapFile(directory?: string): Map<any, any>;
    static getarrayFile(directory?: string): string[];
    static getArrayFileExeceptSetting(): string[];
    static getBasename(): any[];
    static getBasenameExceptingSetting(): any[];
    static getPathFromElement(...pathfile: any[]): string;
    static getPathFromPublic(...pathfile: any[]): string;
    static getMapAsset(): Map<any, any>;
    getPathSplit(pathFile: any): any;
}
