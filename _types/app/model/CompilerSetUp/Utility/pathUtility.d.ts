export default class PathUtility {
    static "__#2@#element": string | null;
    static getcompilerFile(): string;
    static getViewerFile(): string;
    static getlinkFile(): string;
    static getRollupFile(): string;
    static initElement(element?: string): void;
    static getMapFile(directory?: string): Map<any, any>;
    static getarrayFile(directory?: string): string[];
    static getArrayFileExeceptSetting(): string[];
    static getBasename(): string[];
    static getBasenameExceptingSetting(): string[];
    static getPathFromElement(...pathfile?: any[]): string;
    static getPathFromElementCompile(...pathfile?: any[]): string;
    static pathofElementWithPoint(pathfile?: string): string;
    static getPathFromProcess(...pathfile: any[]): string;
    static getPathFromBaseFile(...pathfile: any[]): string;
    static getPathFromPublic(...pathfile: any[]): string;
    static getMapAsset(): Map<any, any>;
    getPathSplit(pathFile: any): any;
}
