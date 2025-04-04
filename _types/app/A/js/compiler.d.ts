export default class Compiler {
    constructor(observer: LibFile.Observer, subject: LibFile.Subject);
    compile(): void;
    #private;
}
