// n: Nml
// i: Identifier
// e: Exp = n | i | true | false | uop e | e bop e | i e* | e ? e : e | [e*] | e[e]
// s: Stm = let i = e | func i i* = e | i = e
//          | print e | while e b
// b: Block = block s*
// p: Program = program b

type Value = number
    | boolean
    | Value[]
    | ((...args: number[]) => Value)
    | [Identifier[], Expression];

let memory = new Map<string, Value>();

class Program {
    constructor(public block: Block) { }
    interpret() {
        return this.block.interpret();
    }
}

class Block {
    constructor(public statements: Statement[]) { }
    interpret() {
        for (let statement of this.statements) {
            statement.interpret();
        }
    }
}

interface Statement {
    interpret(): void;
}

class VariableDeclaration implements Statement {
    constructor(public id: Identifier, public type: Expression) { }
    interpret(): void {
        if (memory.has(this.id.name)) {
            throw new Error("Variable " + this.id.name + " already declared");
        }
        memory.set(this.id.name, this.type.interpret());
    }
}

class FunctionDeclaration implements Statement {
    constructor(
        public id: Identifier,
        public parameters: Identifier[],
        public expression: Expression
    ) { }
    interpret(): void {
        if (memory.has(this.id.name)) {
            throw new Error("Function " + this.id.name + " already declared");
        }
        memory.set(this.id.name, [this.parameters, this.expression]);
    }
}

class Assignment implements Statement {
    constructor(public id: Identifier, public expression: Expression) { }
    interpret(): void {
        if (!memory.has(this.id.name)) {
            throw new Error("Variable " + this.id.name + " not declared");
        }
        memory.set(this.id.name, this.expression.interpret());
    }
}

class PrintStatement implements Statement {
    constructor(public expression: Expression) { }
    interpret(): void {
        console.log(this.expression.interpret());
    }
}

class WhileStatement implements Statement {
    constructor(public expression: Expression, public block: Block) { }
    interpret(): void {
        while (this.expression.interpret()) {
            this.block.interpret();
        }
    }
}

interface Expression {
    interpret(): Value;
}

class Numeral implements Expression {
    constructor(public value: number) { }
    interpret(): number {
        return this.value;
    }
}

class Identifier implements Expression {
    constructor(public name: string) { }
    interpret(): Value {
        if (!memory.has(this.name)) {
            throw new Error("Variable " + this.name + " not declared");
        }
        else{
            return memory.get(this.name);
        }
    }
}

class BooleanLiteral implements Expression {
    constructor(public value: boolean) { }
    interpret(): Value {
        return this.value;
    }
}

class UnaryExpression implements Expression {
    constructor(public operator: string, public expression: Expression) { }
    interpret(): number | boolean {
        switch (this.operator) {
            case "-":
                return -this.expression.interpret();
            case "!":
                return !this.expression.interpret();
            default:
                throw new Error("Unknown operator: " + this.operator);
        }
    }
}

class BinaryExpression implements Expression {
    constructor(public operator: string, public left: Expression, public right: Expression) { }
    interpret() {
        switch (this.operator) {
            case "<":
                return this.left.interpret() < this.right.interpret();
            case ">":
                return this.left.interpret() > this.right.interpret();
            case "<=":
                return this.left.interpret() <= this.right.interpret();
            case ">=":
                return this.left.interpret() >= this.right.interpret();
            case "==":
                return this.left.interpret() == this.right.interpret();
            case "!=":
                return this.left.interpret() != this.right.interpret();
            case "&&":
                return this.left.interpret() && this.right.interpret();
            case "||":
                return this.left.interpret() || this.right.interpret();
            default:
                throw new Error("Unknown operator: " + this.operator);
        }
    }
}


class CallExpression implements Expression {
    constructor(public name: Identifier, public args: Expression[]) { }
    interpret(): Value {
        const value = this.name.interpret();
        if (typeof value !== "function") {
            throw new Error("Call expression must be a function");
        }
        else {
            const args = this.args.map((arg) => arg.interpret());
            if (typeof args !== "object") {
                throw new Error("Call expression arguments must be numbers");
            }
            else {
                return Number(...args);
            }
        }
    }
}

class ConditionalExpression implements Expression {
    constructor(
        public test: Expression,
        public consequent: Expression,
        public alternate: Expression
    ) { }
    interpret(): Value {
        if (this.test.interpret()) {
            return this.consequent.interpret();
        } else {
            return this.alternate.interpret();
        }
    }
}

class ArrayLiteral implements Expression {
    constructor(public elements: Expression[]) { }
    interpret(): Value[] {
        return this.elements.map((element) => element.interpret());
    }
}

class SubscriptExpression implements Expression {
    constructor(public array: Expression, public subscript: Expression) { }
    interpret(): boolean | number | Value[] {
        const arrayValue = this.array.interpret();
        const subscriptValue = this.subscript.interpret();
        if (typeof subscriptValue !== "number") {
            throw new Error("Subscript must be a number");
        }
        else if (!Array.isArray(arrayValue)) {
            throw new Error("Subscripted expression must be an array");
        }
        else {
            return arrayValue[subscriptValue];
        }
    }
}

//Run the interpreter

const sample: Program = new Program(
    new Block([
        new PrintStatement(new UnaryExpression("-", new Numeral(5))),
        new PrintStatement(
            new BinaryExpression("*", new Numeral(5), new Numeral(8))
        ),
    ])
);

const helloWorld: Program = new Program(
    new Block([
        new PrintStatement(new Numeral(0x07734))
    ])
);


//console.log(util.inspect(sample, false, null, true /* enable colors */));

function interpret(p: Program) {
    return p.interpret();
}

interpret(helloWorld);