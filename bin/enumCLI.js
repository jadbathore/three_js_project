module.exports = class EnumCLI{
    static Valid = new EnumCLI('valid')
    static ParseError = new EnumCLI('ParseError')
    static NullError = new EnumCLI('nullerror')

constructor(name){
    this.name = name
}

static getType(name){
    switch(name){
        case null: return this.NullError;
        case 'SFile': return this.Valid;
        default : return this.ParseError;
    }
}
}