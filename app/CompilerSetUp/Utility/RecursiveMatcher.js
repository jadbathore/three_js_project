import chalk from "chalk"


export default class RecursiveMatcher{

    static{
        /**
         * @property this.self invokation of itself for accessing public method in a static context
         */
        this.self = (new RecursiveMatcher)
    };
    static StartBraket = /\{/g
    static EndBraket = /\}/g
    static RegexExcludingFunctionStartAndMatchRestOfText = /(?<=(\bfunction\b((\s)+?))(([A-z])|([A-z]\w+))(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{)(.*)/gms
    static functionName = /(?<=(\b(\t?)function\b((\s)+?)))(([A-z])|([A-z]\w+))(((\s)?)+?)(?=(\((\n*?)([^]*)(\n*?)\))((\s+)?)(\{))/g
    static ClassStart = /((\b(\t?)class((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)(?=\{)/g
    static ClassName = /(?<=(\b(\t?)class((\s)+?)\b))([A-z]|([A-z]\w+))(?=((\s?)+?)(?=\{))/g
    static RegexExcludingClassStartAndMatchRestOfText = /(?<=((\bclass((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)\{)(.*)/gms
    static RegexIncludingClassStartAndMatchRestOfText = /((\bclass((\s)+?)\b))([A-z]|([A-z]\w+))((\s?)+?)\{(.*)/gms

    /**
     * 
     * @param {string} textMatched the text where the recurtion might be 
     * @param {RegExp} regexToTransform the regex matching the rest of the text 
     * @param {number} StartNestedLevel nullish number you can forget to declare it's but the nestedlevel will be considered
     * 1
     * @returns Object 
     */
    processRecurtion(textMatched,regexToTransform,StartNestedLevel){
            let nestedLevel = StartNestedLevel ?? 1;
            // console.log(typeof(textMatched))
            let transform = textMatched?.match(regexToTransform)[0];
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
     * 
     * @param {string} textMatched the text where the recurtion might be 
     * @param {RegExp} RegexMatchStart the regex which identifies the declaration of the recurtion 
     * @example 
     * ```
            //matching (the declaration + argument + startbraket)
            function getFresnelMat({rimHex = 0x0088ff,facingHax = 0x000000} = {}){
        ```
     * @param {RegExp} RegexRestOfText the regex matching the rest of the text including or excluding the **RegexMatchStart** param
     * @param {number|null} StartNestedLevel nullish number you can forget to declare it's but the nestedlevel will be considered
     * 1
     * @yield matched Recurstion 
     */
    *generatorMatchingRecurtion(textMatched,RegexMatchStart,RegexRestOfText,StartNestedLevel) {
        while(textMatched.match(RegexMatchStart)!== null)
        {
            const processedClass = this.processRecurtion(textMatched,RegexRestOfText,StartNestedLevel);
            yield processedClass.matchingtext;
            textMatched = processedClass.restOfTheText;
        }
    } 

    /**
     * 
     * @param {Iterable} generator handling every type of Iterable to transform into a array and then if length = 0 (return null) else 
     * return the arraygenerated 
     * @returns 
     */
    generatorHandler(generator)
    {
        const arrayGenerated = [...generator]
        const arrayOrNull =(arrayGenerated.length == 0)? null : arrayGenerated;
        return arrayOrNull
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
        if(typeof text == 'object')
        {
            text.then(data=>
                {
                    console.log(chalk.yellow(data))
                })
        }
        try{
            const generator = this.self.generatorMatchingRecurtion(
                text,
                RecursiveMatcher.functionName,
                RecursiveMatcher.RegexExcludingFunctionStartAndMatchRestOfText,
            );
            return this.self.generatorHandler(generator)
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
            const generator = this.self.generatorMatchingRecurtion(
                text,
                RecursiveMatcher.ClassStart,
                RecursiveMatcher.RegexIncludingClassStartAndMatchRestOfText,
                0
            );
            return this.self.generatorHandler(generator);
        } catch (err){
            throw err
        }
    }


    static getallRecursiveContentClassAndFunction(text)
    {
        try{
            const generator = this.self.generatorMatchingRecurtion(
                text,
                RecursiveMatcher.ClassStart,
                RecursiveMatcher.RegexExcludingClassStartAndMatchRestOfText,
            );
            const resultContentClass = this.self.generatorHandler(generator);
            const allcontent = resultContentClass?.concat(RecursiveMatcher.getAllFunctionContent(text)) ??
            RecursiveMatcher.getAllFunctionContent(text);
            return allcontent;
        } catch (err){
            throw err
        }
    }
    static contentCleanerRecursion(text){
        const allclassAndFunctionContent = RecursiveMatcher.getallRecursiveContentClassAndFunction(text);
        allclassAndFunctionContent?.forEach((e)=>{
            text = text.replace(e,'')
        });
        return text;
    }

    static getSpecificClassContent(text,className)
    {
        try{
            const generator = this.self.generatorMatchingRecurtion(
                text,
                new RegExp(`((\\bclass((\\s)+?)\\b))(${className})((\\s?)+?)(?=\\{)`,'g'),
                new RegExp(`(?<=((\\bclass((\\s)+?)\\b))(${className})((\\s?)+?)\\{)(.*)`,'gms'),
            );
            return this.self.generatorHandler(generator);
        } catch (err){
            throw err
        }
    }
}
