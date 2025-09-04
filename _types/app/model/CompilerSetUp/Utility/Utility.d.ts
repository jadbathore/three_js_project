export default class Compile {
    constructor(compilerDir?: string);
    fileDirArray: string[];
    mapAsset: Map<any, any>;
    get allConstant(): any[];
    setMapFile(fileArray: string[]): string[];
    nameSpaceMaker(file: string): string;
    public lazyRemplacement(beginingFile: any, endFile: any): void;
    lazyComposerRemplacement(beginingFile: string, endFile: string): Promise<void>;
    public repopulateComposer(file: string, composerContext?: boolean): void;
    public repopulatelinkFile(file: string, composerContext?: boolean): void;
    repopulateContentString(): Promise<void>;
    public addimportScript(file: string): void;
    #private;
}
