// n: Nml
// i: Identifier
// e: Exp = n | i | true | false | uop e | e bop e | i e* | e ? e : e | [e*] | e[e]
// s: Stm = let i = e | func i i* = e | i = e
//          | print e | while e b
// b: Block = block s*
// p: Program = program b
let memory = new Map();
class Program {
    block;
    constructor(block) {
        this.block = block;
    }
    interpret() {
        return this.block.interpret();
    }
}
class Block {
    statements;
    constructor(statements) {
        this.statements = statements;
    }
    interpret() {
        for (let statement of this.statements) {
            statement.interpret();
        }
    }
}
class VariableDeclaration {
    id;
    type;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
    interpret() {
        if (memory.has(this.id.name)) {
            throw new Error("Variable " + this.id.name + " already declared");
        }
        memory.set(this.id.name, this.type.interpret());
    }
}
class FunctionDeclaration {
    id;
    parameters;
    expression;
    constructor(id, parameters, expression) {
        this.id = id;
        this.parameters = parameters;
        this.expression = expression;
    }
    interpret() {
        if (memory.has(this.id.name)) {
            throw new Error("Function " + this.id.name + " already declared");
        }
        memory.set(this.id.name, [this.parameters, this.expression]);
    }
}
class Assignment {
    id;
    expression;
    constructor(id, expression) {
        this.id = id;
        this.expression = expression;
    }
    interpret() {
        if (!memory.has(this.id.name)) {
            throw new Error("Variable " + this.id.name + " not declared");
        }
        memory.set(this.id.name, this.expression.interpret());
    }
}
class PrintStatement {
    expression;
    constructor(expression) {
        this.expression = expression;
    }
    interpret() {
        console.log(this.expression.interpret());
    }
}
class WhileStatement {
    expression;
    block;
    constructor(expression, block) {
        this.expression = expression;
        this.block = block;
    }
    interpret() {
        while (this.expression.interpret()) {
            this.block.interpret();
        }
    }
}
class Numeral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class Identifier {
    name;
    constructor(name) {
        this.name = name;
    }
    interpret() {
        if (!memory.has(this.name)) {
            throw new Error("Variable " + this.name + " not declared");
        }
        else {
            return memory.get(this.name);
        }
    }
}
class BooleanLiteral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class UnaryExpression {
    operator;
    expression;
    constructor(operator, expression) {
        this.operator = operator;
        this.expression = expression;
    }
    interpret() {
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
class BinaryExpression {
    operator;
    left;
    right;
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
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
class CallExpression {
    name;
    args;
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }
    interpret() {
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
class ConditionalExpression {
    test;
    consequent;
    alternate;
    constructor(test, consequent, alternate) {
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    interpret() {
        if (this.test.interpret()) {
            return this.consequent.interpret();
        }
        else {
            return this.alternate.interpret();
        }
    }
}
class ArrayLiteral {
    elements;
    constructor(elements) {
        this.elements = elements;
    }
    interpret() {
        return this.elements.map((element) => element.interpret());
    }
}
class SubscriptExpression {
    array;
    subscript;
    constructor(array, subscript) {
        this.array = array;
        this.subscript = subscript;
    }
    interpret() {
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
const sample = new Program(new Block([
    new PrintStatement(new UnaryExpression("-", new Numeral(5))),
    new PrintStatement(new BinaryExpression("*", new Numeral(5), new Numeral(8))),
]));
const helloWorld = new Program(new Block([
    new PrintStatement(new Numeral(0x07734))
]));
//console.log(util.inspect(sample, false, null, true /* enable colors */));
function interpret(p) {
    return p.interpret();
}
interpret(helloWorld);
export {};
