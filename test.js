

let array = ["bonjour","a","b","bonjour"];

function returndouble(array)
{
    const uniqueArray = [...new Set(array)];
    let i = 0;
    const condition = (array.length != uniqueArray.length);
    const double = (condition)?array.filter((e)=>{
        if(e != uniqueArray[i])
        {
            return e
        } else {
            i++;
        }
    }):null;
    return {
        double:double,
        uniqueArray:[...new Set(array)],
    };
}


