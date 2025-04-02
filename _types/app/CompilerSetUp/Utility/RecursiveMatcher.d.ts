export default class RecursiveMatcher {
    static StartBraket: RegExp;
    static EndBraket: RegExp;
    static RegexExcludingFunctionStartAndMatchRestOfText: RegExp;
    static functionName: RegExp;
    static ClassStart: RegExp;
    static ClassName: RegExp;
    static RegexExcludingClassStartAndMatchRestOfText: RegExp;
    static RegexIncludingClassStartAndMatchRestOfText: RegExp;
    static getAllFunctionContent(text: string): any[];
    static getAllClass(text: string): any[];
    static getallRecursiveContentClassAndFunction(text: any): any[];
    static contentCleanerRecursion(text: any): any;
    static getSpecificClassContent(text: any, className: any): any[];
    processRecurtion(textMatched: string, regexToTransform: RegExp, StartNestedLevel: number): {
        matchingtext: string;
        restOfTheText: string;
    };
    generatorMatchingRecurtion(textMatched: string, RegexMatchStart: RegExp, RegexRestOfText: RegExp, StartNestedLevel: number | null): Generator<string, void, unknown>;
    generatorHandler(generator: Iterable<any>): any[];
}
