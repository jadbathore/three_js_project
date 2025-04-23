

const target= {
    m1: "/a",
};

const test = (event) => {
    console.log("handle connect")
}

const test1 = (event) => {
    console.log("handle disconnect")
}
const handler2 =  {
    get:function(target, prop,receiver)
    {
        if(prop){
            // return target[prop]
            switch(target[prop]?.type ?? "first_connection"){
                case"connect": 
                    test(target[prop])
                break;
                case"disconnect": 
                    test1(target[prop])
                break;
                case"first_connection":
                break;
                default:throw new Error("unknow type :" target[prop].type);
            }
            return target[prop]
        }
        return target
    },
    set:function(target,prop,newvalue,receiver)
    {
        target[prop] = {
            route:newvalue,
            type:(receiver[prop]?.route == newvalue)? "connect":"disconnect",
        }
        
        return true;
    }
};

const proxy2 = new Proxy(target, handler2);

// const test = generate(proxy2.m1);


proxy2.m1 = "/"
console.log(proxy2.m1)
proxy2.m1 = "/"
console.log(proxy2.m1)
// console.log(proxy2.m1)
proxy2.m1 = "/"
console.log(proxy2.m1)
proxy2.m1 = "/a"
console.log(proxy2.m1)
proxy2.m1 = "/a"
console.log(proxy2.m1)
proxy2.m1 = "/b"
console.log(proxy2.m1)
proxy2.m1 = "/c"
console.log(proxy2.m1)
proxy2.m1 = "/"
console.log(proxy2.m1)
// console.log(proxy2.m1)


// console.log(target.m1,)