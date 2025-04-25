export function rollupWatchConfig(): void;
export class Compiler {
    constructor(observer: LibFile.Observer, subject: LibFile.Subject, sceneName: string);
    get sceneName(): string;
    compile(): void;
    stopCompiler(): void;
    destructCompiler(): void;
    #private;
}
