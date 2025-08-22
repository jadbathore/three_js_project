export function rollupWatchConfig(): void;
export class Compiler {
    constructor(observer: LibFile.Observer, subject: LibFile.Subject, sceneName: string);
    get sceneName(): string;
    repopulate(): void;
    compile(): void;
    stopCompiler(repolulate?: boolean): void;
    destructCompiler(): void;
    #private;
}
