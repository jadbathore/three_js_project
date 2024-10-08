

export default class RecursiveMatcher{

    static StartBraket = /\{/g
    static EndBraket = /\}/g
    static RegexExcludingFunctionStartAndMatchRestOfText = /(?<=(\bfunction\b((\s)+?))(([A-z])|([A-z]\w+))(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{)(.*)/gms
    static FunctionStart = /(\b(\t?)function\b((\s)+?))(([A-z])|([A-z]\w+))(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{/g
    static ClassStart = /((\b(\t?)class((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)(?=\{)/g
    static ClassName = /(?<=(\b(\t?)class((\s)+?)\b))([A-z]|([A-z]\w+))(?=((\s?)+?)(?=\{))/g
    static RegexExcludingClassStartAndMatchRestOfText = /(?<=((\bclass((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)\{)(.*)/gms
    static RegexIncludingClassStartAndMatchRestOfText = /((\bclass((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)\{(.*)/gms

    processRecurtion(textMatched,regexToTransform,StartNestedLevel){
            let nestedLevel = StartNestedLevel ?? 1;
            let transform = textMatched.match(regexToTransform)[0];
            const arrayLine = transform.split('\n')
            let i = 0
            for(let line of arrayLine){
                if(line.match(RecursiveMatcher.StartBraket)!= null)
                    {
                        const toAdd = line.match(RecursiveMatcher.StartBraket).length;
                        nestedLevel =  nestedLevel + toAdd;
                    } 
                if(line.match(RecursiveMatcher.EndBraket) != null)
                    {
                        const toSub = line.match(RecursiveMatcher.EndBraket).length;
                        nestedLevel =  nestedLevel - toSub
                    } 
                    i++
                if((nestedLevel === 0) && (i != 1)){
                    break;
                }
                if(i == arrayLine.length)
                {
                    if(nestedLevel > 0)
                    {
                        throw new Error(`no end bracket finished nestedLevel > 0`)
                    }
                }
            }
            const basicLevel = (StartNestedLevel == null)
            arrayLine[i-1] =(basicLevel)? arrayLine[i-1].split('}')[0]: `${arrayLine[i-1].split('}')[0]}}`;
            const exceptingFinishingline = (i != arrayLine.length);
            const toCut =(exceptingFinishingline)? i - arrayLine.length: arrayLine.length;
            const matchingtext = arrayLine.slice(0,toCut).join('\n');
            const restOfTheText = arrayLine.slice(toCut).join('\n');
            return {
                matchingtext: matchingtext,
                restOfTheText: restOfTheText,
            };
    }
    /**
     * @param {string} text 
     * @returns null|string return null if there are no function else string 
     * @local *generatorMatchingFunction(textMatched) generate all matching 
     * @example
     * ```
        const generator = generatorMatchingFunction(text)
        const arrayGenerated = [...generator]
        const matchedFunction =(arrayGenerated == 0)? null :arrayGenerated;
        return matchedFunction 
     * ```
     */
    static getAllFunctionContent(text)
    {
        try{
            function* generatorMatchingFunction(textMatched) {
                    while(textMatched.match(RecursiveMatcher.FunctionStart)!== null)
                        {
                            const processedFunction = (new RecursiveMatcher()).processRecurtion(textMatched,RecursiveMatcher.RegexExcludingFunctionStartAndMatchRestOfText);
                            yield processedFunction.matchingtext;
                            textMatched = processedFunction.restOfTheText ;
                        }
            } 
                const generator = generatorMatchingFunction(text)
                const arrayGenerated = [...generator]
                const matchedFunction =(arrayGenerated.length == 0)? null :arrayGenerated;
                return matchedFunction 
        } catch (err){
            throw err
        }
    }


    /**
     * @param {string} text 
     * @returns null|string return null if there are no function else string 
     * @local *generatorMatchingFunction(textMatched) generate all matching 
     * @example
     * ```
    const generator = generatorMatchingFunction(text)
    const arrayGenerated = [...generator]
    const matchedFunction =(arrayGenerated == 0)? null :arrayGenerated;
    return matchedFunction 
    * ```
    */
    static getAllClass(text)
    {
        try{
            function* generatorMatchingClass(textMatched) {
                while(textMatched.match(RecursiveMatcher.ClassStart)!== null)
                    {
                        const processedClass = (new RecursiveMatcher()).processRecurtion(textMatched,RecursiveMatcher.RegexIncludingClassStartAndMatchRestOfText,0);
                        yield `${processedClass.matchingtext}`;
                        textMatched = processedClass.restOfTheText;
                    }
            } 
                const generator = generatorMatchingClass(text)
                const arrayGenerated = [...generator]
                const matchedFunction =(arrayGenerated.length == 0)? null : arrayGenerated;
                return matchedFunction 
        } catch (err){
            throw err
        }
    }

}
