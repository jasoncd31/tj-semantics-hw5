import assert from "assert"
import {
  Program,
  Block,
  VariableDeclaration,
  FunctionDeclaration,
  Assignment,
  PrintStatement,
  WhileStatement,
  Numeral,
  Identifier,
  BooleanLiteral,
  UnaryExpression,
  BinaryExpression,
  CallExpression,
  ConditionalExpression,
  ArrayLiteral,
  SubscriptExpression,
  interpret
} from "../bella.js"

// Programs that are correct
const checks = [
  ["Hello 5", new Program(new Block([new PrintStatement(new Numeral(5))]))],
  [
    "2 + 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "+", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 - 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "-", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 * 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "*", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 / 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "/", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 % 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "%", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 ** 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "**", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 == 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "==", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 > 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), ">", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 < 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "<", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 >= 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), ">=", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 <= 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "<=", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "2 != 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "!=", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "true == false",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(
            new BooleanLiteral(true),
            "==",
            new BooleanLiteral(false)
          )
        ),
      ])
    ),
  ],
  [
    "true != false",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(
            new BooleanLiteral(true),
            "!=",
            new BooleanLiteral(false)
          )
        ),
      ])
    ),
  ],
  [
    "true && false",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(
            new BooleanLiteral(true),
            "&&",
            new BooleanLiteral(false)
          )
        ),
      ])
    ),
  ],
  [
    "true || false",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(
            new BooleanLiteral(true),
            "||",
            new BooleanLiteral(false)
          )
        ),
      ])
    ),
  ],
  [
    "false || true",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(
            new BooleanLiteral(false),
            "||",
            new BooleanLiteral(true)
          )
        ),
      ])
    ),
  ],
  [
    "-(3)",
    new Program(
      new Block([new PrintStatement(new UnaryExpression("-", new Numeral(3)))])
    ),
  ],
  [
    "!(true)",
    new Program(
      new Block([
        new PrintStatement(new UnaryExpression("!", new BooleanLiteral(true))),
      ])
    ),
  ],
  [
    "five() = 5",
    new Program(
      new Block([
        new FunctionDeclaration(new Identifier("five"), [], new Numeral(5)),
        new PrintStatement(new CallExpression(new Identifier("five"), [])),
      ])
    ),
  ],
  [
    "dereferencing a varaible",
    new Program(
      new Block([
        new VariableDeclaration(new Identifier("x"), new Numeral(5)),
        new PrintStatement(new Identifier("x")),
      ])
    ),
  ],
  [
    "identity functon: f(x) = x",
    new Program(
      new Block([
        new FunctionDeclaration(
          new Identifier("f"),
          [new Identifier("x")],
          new Identifier("x")
        ),
        new PrintStatement(
          new CallExpression(new Identifier("f"), [new Numeral(2)])
        ),
      ])
    ),
  ],
  [
    "plus(x, y) = x + y",
    new Program(
      new Block([
        new FunctionDeclaration(
          new Identifier("f"),
          [new Identifier("x"), new Identifier("y")],
          new BinaryExpression(new Identifier("x"), "+", new Identifier("y"))
        ),
        new PrintStatement(
          new CallExpression(new Identifier("f"), [
            new Numeral(2),
            new Numeral(3),
          ])
        ),
      ])
    ),
  ],
  [
    "(truthy) giveSevenOrThree(wantSeven) = wantSeven ? 7 : 3",
    new Program(
      new Block([
        new FunctionDeclaration(
          new Identifier("giveSevenOrThree"),
          [new Identifier("wantSeven")],
          new ConditionalExpression(
            new Identifier("wantSeven"),
            new Numeral(7),
            new Numeral(3)
          )
        ),
        new PrintStatement(
          new CallExpression(new Identifier("giveSevenOrThree"), [
            new BooleanLiteral(true),
          ])
        ),
      ])
    ),
  ],
  [
    "(falsey) giveSevenOrThree(wantSeven) = wantSeven ? 7 : 3",
    new Program(
      new Block([
        new FunctionDeclaration(
          new Identifier("giveSevenOrThree"),
          [new Identifier("wantSeven")],
          new ConditionalExpression(
            new Identifier("wantSeven"),
            new Numeral(7),
            new Numeral(3)
          )
        ),
        new PrintStatement(
          new CallExpression(new Identifier("giveSevenOrThree"), [
            new BooleanLiteral(false),
          ])
        ),
      ])
    ),
  ],
  [
    "subscripting a list returned from a function",
    new Program(
      new Block([
        new FunctionDeclaration(
          new Identifier("listy"),
          [new Identifier("x"), new Identifier("y"), new Identifier("z")],
          new ArrayLiteral([
            new Identifier("x"),
            new Identifier("y"),
            new Identifier("z"),
          ])
        ),
        new PrintStatement(
          new SubscriptExpression(
            new CallExpression(new Identifier("listy"), [
              new Numeral(17),
              new Numeral(89),
              new Numeral(207),
            ]),
            new Numeral(2)
          )
        ),
      ])
    ),
  ],
  [
    "functions that use an inherited variable from a parent scope",
    new Program(
      new Block([
        new VariableDeclaration(
          new Identifier("fourth"),
          new BinaryExpression(new Numeral(5), "+", new Numeral(1))
        ),
        new FunctionDeclaration(
          new Identifier("listy"),
          [new Identifier("x"), new Identifier("y"), new Identifier("z")],
          new ArrayLiteral([
            new Identifier("x"),
            new Identifier("y"),
            new Identifier("z"),
            new Identifier("fourth"),
          ])
        ),
        new FunctionDeclaration(
          new Identifier("fourthyPlusOne"),
          [],
          new BinaryExpression(new Identifier("fourth"), "+", new Numeral(1))
        ),
        new PrintStatement(
          new SubscriptExpression(
            new CallExpression(new Identifier("listy"), [
              new Numeral(17),
              new Numeral(89),
              new Numeral(207),
            ]),
            new Numeral(3)
          )
        ),
        new PrintStatement(
          new CallExpression(new Identifier("fourthyPlusOne"), [])
        ),
      ])
    ),
  ],
  [
    "Blastoff",
    new Program(
      new Block([
        new VariableDeclaration(new Identifier("x"), new Numeral(10)),
        new WhileStatement(
          new BinaryExpression(new Identifier("x"), ">", new Numeral(1)),
          new Block([
            new PrintStatement(new Identifier("x")),
            new Assignment(
              new Identifier("x"),
              new BinaryExpression(new Identifier("x"), "-", new Numeral(1))
            ),
          ])
        ),
        new PrintStatement(new BooleanLiteral(true)),
      ])
    ),
  ],
]

// Programs that are incorrect
const errors = [
  [
    "assigning to an undeclared variable",
    new Program(
      new Block([
        new Assignment(new Identifier("x"), new Numeral(2)),
        new PrintStatement(new Identifier("x")),
      ])
    ),
  ],
  [
    "declaring a declared variable",
    new Program(
      new Block([
        new VariableDeclaration(new Identifier("x"), new Numeral(2)),
        new VariableDeclaration(new Identifier("x"), new Numeral(3)),
      ])
    ),
  ],
  [
    "declaring a function to an already declared variable",
    new Program(
      new Block([
        new VariableDeclaration(new Identifier("x"), new Numeral(2)),
        new FunctionDeclaration(new Identifier("x"), [], new Numeral(3)),
      ])
    ),
  ],
  [
    "application of a unary operator on a function",
    new Program(
      new Block([
        new FunctionDeclaration(new Identifier("f"), [], new Numeral(2)),
        new PrintStatement(new UnaryExpression("-", new Identifier("f"))),
      ])
    ),
  ],
  [
    "number to number binary operator that doesn't exist",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "!!", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "boolean to boolean binary operator that doesn't exist",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(
            new BooleanLiteral(false),
            "&^&",
            new BooleanLiteral(true)
          )
        ),
      ])
    ),
  ],
  [
    "referencing an undeclared variable",
    new Program(new Block([new PrintStatement(new Identifier("x"))])),
  ],
  [
    "a function that uses an inherited variable from a parent scope that doesn't exist",
    new Program(
      new Block([
        new VariableDeclaration(
          new Identifier("fourth"),
          new BinaryExpression(new Numeral(5), "+", new Numeral(1))
        ),
        new FunctionDeclaration(
          new Identifier("listy"),
          [new Identifier("x"), new Identifier("y"), new Identifier("z")],
          new ArrayLiteral([
            new Identifier("x"),
            new Identifier("y"),
            new Identifier("z"),
            new Identifier("fifth"),
          ])
        ),
        new PrintStatement(
          new SubscriptExpression(
            new CallExpression(new Identifier("listy"), [
              new Numeral(17),
              new Numeral(89),
              new Numeral(207),
            ]),
            new Numeral(3)
          )
        ),
      ])
    ),
  ],
  [
    "printing a function",
    new Program(
      new Block([
        new FunctionDeclaration(new Identifier("f"), [], new Numeral(2)),
        new PrintStatement(new Identifier("f")),
      ])
    ),
  ],
  [
    "calling a function with the wrong number of arguments (under)",
    new Program(
      new Block([
        new FunctionDeclaration(
          new Identifier("f"),
          [new Identifier("a")],
          new Numeral(2)
        ),
        new PrintStatement(new CallExpression(new Identifier("f"), [])),
      ])
    ),
  ],
  [
    "calling a function with the wrong number of arguments (over)",
    new Program(
      new Block([
        new FunctionDeclaration(new Identifier("f"), [], new Numeral(2)),
        new PrintStatement(
          new CallExpression(new Identifier("f"), [
            new Numeral(2),
            new Numeral(3),
          ])
        ),
      ])
    ),
  ],
  [
    "calling a non-function",
    new Program(
      new Block([
        new VariableDeclaration(new Identifier("x"), new Numeral(2)),
        new PrintStatement(new CallExpression(new Identifier("x"), [])),
      ])
    ),
  ],
  [
    "2 + true",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new Numeral(2), "+", new BooleanLiteral(true))
        ),
      ])
    ),
  ],
  [
    "false > 3",
    new Program(
      new Block([
        new PrintStatement(
          new BinaryExpression(new BooleanLiteral(false), ">", new Numeral(3))
        ),
      ])
    ),
  ],
  [
    "-(true)",
    new Program(
      new Block([
        new PrintStatement(new UnaryExpression("-", new BooleanLiteral(true))),
      ])
    ),
  ],
  [
    "!(3)",
    new Program(
      new Block([new PrintStatement(new UnaryExpression("!", new Numeral(3)))])
    ),
  ],
  [
    "subscript index is out of range",
    new Program(
      new Block([
        new VariableDeclaration(
          new Identifier("a"),
          new ArrayLiteral([new Numeral(1), new Numeral(2), new Numeral(3)])
        ),
        new PrintStatement(
          new SubscriptExpression(new Identifier("a"), new Numeral(5))
        ),
      ])
    ),
  ],
  [
    "subscripting a number returned from a function",
    new Program(
      new Block([
        new FunctionDeclaration(
          new Identifier("listy"),
          [new Identifier("x"), new Identifier("y"), new Identifier("z")],
          new Numeral(3)
        ),
        new PrintStatement(
          new SubscriptExpression(
            new CallExpression(new Identifier("listy"), [
              new Numeral(17),
              new Numeral(89),
              new Numeral(207),
            ]),
            new Numeral(2)
          )
        ),
      ])
    ),
  ],
]

describe("The Interpreter", () => {
  for (const [scenario, source] of checks) {
    it(`Runs ${scenario}`, () => {
      assert.doesNotThrow(() => interpret(source))
    })
  }

  for (const [scenario, source] of errors) {
    it(`Fails ${scenario}`, () => {
      assert.throws(() => interpret(source))
    })
  }
})
