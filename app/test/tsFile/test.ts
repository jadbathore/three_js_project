// import express,{Request,Response} from "express";

// const app = express();

// // app.getPrototypeOf()
// enum method {
//     GET = "GET",
//     POST = "POST",
//     PATCH = "PATCH",
//     DELETE = "DELETE",
//     PUT = "PUT",
// }

// // interface methodOverload{
// //     (foo: string): 
// //     (foo: number): number
// // }

// interface ExpressInput{
    
//     routeName:String,
//     callback:(req:Request,res:Response)=>void,
//     method:method
// }

// interface ExpressRouteComponent {
//     get input():ExpressInput;
//     invokeRoute():void;
// }



// class ConcreteRouteComponent implements ExpressRouteComponent {

//     private _input:ExpressInput;

//     constructor(
//         input:ExpressInput
//     ){
//         this._input = input;
//     }

//     public CallRoute(): void {
//         const method:string = this._input.method.toLocaleLowerCase();
//     }

//     private invoke(app:string,methodName:CallableFunction)
//     {
//         app.prototype.methodName();
//     }

//     public get input(): ExpressInput {
//         return this._input;
//     }

// }

// /**
//  * Iterator Design Pattern
//  *
//  * Intent: Lets you traverse elements of a collection without exposing its
//  * underlying representation (list, stack, tree, etc.).
//  */

// interface Iterator<T> {
//     get current(): T;
//     next(): void;
//     key(): number;
//     valid(): boolean;
//     rewind(): void;
// }

// interface Aggregator {
//     getIterator(): Iterator<ExpressInput>;
// }

// class RouteIterator implements Iterator<ExpressInput> {
//     private collection: RouteAggregator;
//     private index: number = 0;
//     private reverse: boolean = false;

//     constructor(collection: RouteAggregator, reverse: boolean = false) {
//         this.collection = collection;
//         this.reverse = reverse;
//         if (reverse) {
//             this.index = collection.count - 1;
//         }
//     }

//     public rewind() {
//         this.index = this.reverse ?
//             this.collection.count - 1 :
//             0;
//     }

//     public get current(): ExpressInput {
//         return this.collection.items[this.index];
//     }

//     public key(): number {
//         return this.index;
//     }

//     public next(): void {
//         const item = this.collection.items[this.index];
//         this.index += this.reverse ? -1 : 1;
//     }

//     public valid(): boolean {
//         if (this.reverse) {
//             return this.index >= 0;
//         }
//         return this.index < this.collection.count;
//     }
// }

// class RouteAggregator implements Aggregator {
//     private _items: ExpressInput[] = [];

//     public get items(): ExpressInput[] {
//         return this._items;
//     }

//     public get count(): number {
//         return this._items.length;
//     }

//     public addItem(item: ExpressInput): void {
//         this._items.push(item);
//     }

//     public getIterator(): Iterator<ExpressInput> {
//         return new RouteIterator(this);
//     }

//     public getReverseIterator(): Iterator<ExpressInput> {
//         return new RouteIterator(this, true);
//     }
// }

// const routeList:ExpressInput[] = [
// {
//     routeName:'/',
//     callback: (req:Request, res:Response)=>{
//         res.render(
//             'index',
//             {
//                 title:'test_app'
//             }
//         );
//     },
//     method: method.GET
// },
// {
//     routeName:'/test',
//     callback: (req:Request, res:Response)=>{
//         res.render(
//             'index',
//             {
//                 title:'test_app'
//             }
//         );
//     },
//     method: method.GET
// },
// ];

// function makeExpressRoute()
// {
//     const routeAggregator:RouteAggregator = new RouteAggregator();

//     routeList.forEach((element:ExpressInput) => {
//         routeAggregator.addItem(element);
//     });

//     const iterator = routeAggregator.getIterator();

//     while (iterator.valid()) {
//         console.log(iterator.current.routeName)
//         iterator.next();
//     }
// }

// makeExpressRoute();



// class ConcreteComponentB implements Component {

//     public accept(visitor: Visitor): void {
//         visitor.visitConcreteComponentB(this);
//     }

//     public specialMethodOfConcreteComponentB(): string {
//         return 'B';
//     }
// }

// interface Visitor {
//     visitConcreteComponentA(element: ConcreteRouteComponent): void;
//     // visitConcreteComponentB(element: ConcreteComponentB): void;
// }

// class ConcreteVisitor1 implements Visitor {
//     public visitConcreteComponentA(element: ConcreteComponentA): void {
//         console.log(`${element.exclusiveMethodOfConcreteComponentA()} + ConcreteVisitor1`);
//     }

//     public visitConcreteComponentB(element: ConcreteComponentB): void {
//         console.log(`${element.specialMethodOfConcreteComponentB()} + ConcreteVisitor1`);
//     }
// }

// class ConcreteVisitor2 implements Visitor {
//     public visitConcreteComponentA(element: ConcreteComponentA): void {
//         console.log(`${element.exclusiveMethodOfConcreteComponentA()} + ConcreteVisitor2`);
//     }

//     public visitConcreteComponentB(element: ConcreteComponentB): void {
//         console.log(`${element.specialMethodOfConcreteComponentB()} + ConcreteVisitor2`);
//     }
// }

// function clientCode(components: Component[], visitor: Visitor) {
//     // ...
//     for (const component of components) {
//         component.accept(visitor);
//     }
//     // ...
// }

// const components = [
//     new ConcreteComponentA(),
//     new ConcreteComponentB(),
// ];

// console.log('The client code works with all visitors via the base Visitor interface:');
// const visitor1 = new ConcreteVisitor1();
// clientCode(components, visitor1);
// console.log('');

// console.log('It allows the same client code to work with different types of visitors:');
// const visitor2 = new ConcreteVisitor2();
// clientCode(components, visitor2);

