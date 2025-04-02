var _a;
import chalk from "chalk";
class RecursiveMatcher {
    ;
    processRecurtion(textMatched, regexToTransform, StartNestedLevel) {
        let nestedLevel = StartNestedLevel ?? 1;
        let transform = textMatched?.match(regexToTransform)[0];
        const arrayLine = transform.split('\n');
        let i = 0;
        for (let line of arrayLine) {
            if (line.match(_a.StartBraket) != null) {
                const toAdd = line.match(_a.StartBraket).length;
                nestedLevel = nestedLevel + toAdd;
            }
            if (line.match(_a.EndBraket) != null) {
                const toSub = line.match(_a.EndBraket).length;
                nestedLevel = nestedLevel - toSub;
            }
            i++;
            if ((nestedLevel === 0) && (i != 1)) {
                break;
            }
            if (i == arrayLine.length) {
                if (nestedLevel > 0) {
                    throw new Error(`no end bracket finished nestedLevel > 0`);
                }
            }
        }
        const basicLevel = (StartNestedLevel == null);
        arrayLine[i - 1] = (basicLevel) ? arrayLine[i - 1].split('}')[0] : `${arrayLine[i - 1].split('}')[0]}}`;
        const exceptingFinishingline = (i != arrayLine.length);
        const toCut = (exceptingFinishingline) ? i - arrayLine.length : arrayLine.length;
        const matchingtext = arrayLine.slice(0, toCut).join('\n');
        const restOfTheText = arrayLine.slice(toCut).join('\n');
        return {
            matchingtext: matchingtext,
            restOfTheText: restOfTheText,
        };
    }
    *generatorMatchingRecurtion(textMatched, RegexMatchStart, RegexRestOfText, StartNestedLevel) {
        while (textMatched.match(RegexMatchStart) !== null) {
            const processedClass = this.processRecurtion(textMatched, RegexRestOfText, StartNestedLevel);
            yield processedClass.matchingtext;
            textMatched = processedClass.restOfTheText;
        }
    }
    generatorHandler(generator) {
        const arrayGenerated = [...generator];
        const arrayOrNull = (arrayGenerated.length == 0) ? null : arrayGenerated;
        return arrayOrNull;
    }
    static getAllFunctionContent(text) {
        if (typeof text == 'object') {
            text.then(data => {
                console.log(chalk.yellow(data));
            });
        }
        try {
            const generator = this.self.generatorMatchingRecurtion(text, _a.functionName, _a.RegexExcludingFunctionStartAndMatchRestOfText);
            return this.self.generatorHandler(generator);
        }
        catch (err) {
            throw err;
        }
    }
    static getAllClass(text) {
        try {
            const generator = this.self.generatorMatchingRecurtion(text, _a.ClassStart, _a.RegexIncludingClassStartAndMatchRestOfText, 0);
            return this.self.generatorHandler(generator);
        }
        catch (err) {
            throw err;
        }
    }
    static getallRecursiveContentClassAndFunction(text) {
        try {
            const generator = this.self.generatorMatchingRecurtion(text, _a.ClassStart, _a.RegexExcludingClassStartAndMatchRestOfText);
            const resultContentClass = this.self.generatorHandler(generator);
            const allcontent = resultContentClass?.concat(_a.getAllFunctionContent(text)) ??
                _a.getAllFunctionContent(text);
            return allcontent;
        }
        catch (err) {
            throw err;
        }
    }
    static contentCleanerRecursion(text) {
        const allclassAndFunctionContent = _a.getallRecursiveContentClassAndFunction(text);
        allclassAndFunctionContent?.forEach((e) => {
            text = text.replace(e, '');
        });
        return text;
    }
    static getSpecificClassContent(text, className) {
        try {
            const generator = this.self.generatorMatchingRecurtion(text, new RegExp(`((\\bclass((\\s)+?)\\b))(${className})((\\s?)+?)(?=\\{)`, 'g'), new RegExp(`(?<=((\\bclass((\\s)+?)\\b))(${className})((\\s?)+?)\\{)(.*)`, 'gms'));
            return this.self.generatorHandler(generator);
        }
        catch (err) {
            throw err;
        }
    }
}
_a = RecursiveMatcher;
(() => {
    _a.self = (new _a);
})();
RecursiveMatcher.StartBraket = /\{/g;
RecursiveMatcher.EndBraket = /\}/g;
RecursiveMatcher.RegexExcludingFunctionStartAndMatchRestOfText = /(?<=(\bfunction\b((\s)+?))(([A-z])|([A-z]\w+))(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{)(.*)/gms;
RecursiveMatcher.functionName = /(?<=(\b(\t?)function\b((\s)+?)))(([A-z])|([A-z]\w+))(((\s)?)+?)(?=(\((\n*?)([^]*)(\n*?)\))((\s+)?)(\{))/g;
RecursiveMatcher.ClassStart = /((\b(\t?)class((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)(?=\{)/g;
RecursiveMatcher.ClassName = /(?<=(\b(\t?)class((\s)+?)\b))([A-z]|([A-z]\w+))(?=((\s?)+?)(?=\{))/g;
RecursiveMatcher.RegexExcludingClassStartAndMatchRestOfText = /(?<=((\bclass((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)\{)(.*)/gms;
RecursiveMatcher.RegexIncludingClassStartAndMatchRestOfText = /((\bclass((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)\{(.*)/gms;
export default RecursiveMatcher;
