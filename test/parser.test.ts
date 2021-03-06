import "jest";
import { isRight, isLeft } from "fp-ts/lib/Either";
import { Token } from "../src/scanner_types";
import { parseModule } from "../src/parser";
import { identifierIso } from "../src/universal_types";
import { Block, Module } from "../src/parser_types";

const testModuleName = identifierIso.wrap("Test");
const wrapBlock = (block: Block): Module => {
  return {
    name: testModuleName,
    body: block,
    exports: [],
  };
};

describe("Parser", () => {
  describe("Successful parses", () => {
    describe("Simple variable declarations", () => {
      it("Parses { let x; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("x"),
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Simple variable assignments (expression parsing)", () => {
      it("Parses { x = 1 + 2; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "add",
              leftOperand: {
                expressionKind: "numberLit",
                value: 1,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 1 + 2 + 3; } with proper associativity", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "add",
              leftOperand: {
                expressionKind: "binOp",
                binOp: "add",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 1,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 2,
                },
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 3,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 1 * 2; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "asterisk",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "multiply",
              leftOperand: {
                expressionKind: "numberLit",
                value: 1,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 1 * 2 - 3; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "asterisk",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "minus",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "subtract",
              leftOperand: {
                expressionKind: "binOp",
                binOp: "multiply",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 1,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 2,
                },
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 3,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 4 + 5 / 6; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 4,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 5,
          },
          {
            tokenKind: "forwardSlash",
          },
          {
            tokenKind: "number",
            value: 6,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "add",
              leftOperand: {
                expressionKind: "numberLit",
                value: 4,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "divide",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 5,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 6,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = (7 + 8) / 9; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "number",
            value: 7,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 8,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "forwardSlash",
          },
          {
            tokenKind: "number",
            value: 9,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "divide",
              leftOperand: {
                expressionKind: "binOp",
                binOp: "add",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 7,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 8,
                },
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 9,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = -1; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "minus",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "unaryOp",
              unaryOp: "negative",
              operand: {
                expressionKind: "numberLit",
                value: 1,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 2 - -3; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "minus",
          },
          {
            tokenKind: "minus",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "subtract",
              leftOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
              rightOperand: {
                expressionKind: "unaryOp",
                unaryOp: "negative",
                operand: {
                  expressionKind: "numberLit",
                  value: 3,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = f(); } (function call with no arguments)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "funcCall",
              callee: {
                expressionKind: "variableRef",
                variableName: identifierIso.wrap("f"),
              },
              args: [],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { y = g(1); } (function call with one argument)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("y"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("g"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("y"),
            variableValue: {
              expressionKind: "funcCall",
              callee: {
                expressionKind: "variableRef",
                variableName: identifierIso.wrap("g"),
              },
              args: [
                {
                  expressionKind: "numberLit",
                  value: 1,
                },
              ],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { z = h(2, 3); } (function call with >1 argument)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("z"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("h"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "comma",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("z"),
            variableValue: {
              expressionKind: "funcCall",
              callee: {
                expressionKind: "variableRef",
                variableName: identifierIso.wrap("h"),
              },
              args: [
                {
                  expressionKind: "numberLit",
                  value: 2,
                },
                {
                  expressionKind: "numberLit",
                  value: 3,
                },
              ],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { i = f() + 1; } (function call with operation after it)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("i"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("i"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "add",
              leftOperand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 1,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { j = 2 * f(); } (function call with operation before it)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("j"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "asterisk",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("j"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "multiply",
              leftOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
              rightOperand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { higherOrderResult = higher()(); } (higher-order function call)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("higherOrderResult"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("higher"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("higherOrderResult"),
            variableValue: {
              expressionKind: "funcCall",
              callee: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("higher"),
                },
                args: [],
              },
              args: [],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "booleanLit",
              isTrue: true,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true & false; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "and",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
              rightOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = false | true; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
              rightOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 1 < 2; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "lessThan",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "lessThan",
              leftOperand: {
                expressionKind: "numberLit",
                value: 1,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 3 > 4; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "greaterThan",
          },
          {
            tokenKind: "number",
            value: 4,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "greaterThan",
              leftOperand: {
                expressionKind: "numberLit",
                value: 3,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 4,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 5 <= 6; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 5,
          },
          {
            tokenKind: "lessThanEquals",
          },
          {
            tokenKind: "number",
            value: 6,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "lessThanEquals",
              leftOperand: {
                expressionKind: "numberLit",
                value: 5,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 6,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 7 >= 8; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 7,
          },
          {
            tokenKind: "greaterThanEquals",
          },
          {
            tokenKind: "number",
            value: 8,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "greaterThanEquals",
              leftOperand: {
                expressionKind: "numberLit",
                value: 7,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 8,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true == 9; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "doubleEquals",
          },
          {
            tokenKind: "number",
            value: 9,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "equals",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 9,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = false /= 10; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "notEqual",
          },
          {
            tokenKind: "number",
            value: 10,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "notEqual",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 10,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = !true; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "unaryOp",
              unaryOp: "not",
              operand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = null; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "null",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "nullLit",
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it('Parses { x = "str"; }', () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "string",
            value: "str",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "stringLit",
              value: "str",
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = !f(); } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "unaryOp",
              unaryOp: "not",
              operand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 2 * f(); } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "asterisk",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "multiply",
              leftOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
              rightOperand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 1 + f(); } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "add",
              leftOperand: {
                expressionKind: "numberLit",
                value: 1,
              },
              rightOperand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 3 < f(); } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "lessThan",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "lessThan",
              leftOperand: {
                expressionKind: "numberLit",
                value: 3,
              },
              rightOperand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true & f(); } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "and",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
              rightOperand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = false | f(); } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
              rightOperand: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("f"),
                },
                args: [],
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 4 / !true; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 4,
          },
          {
            tokenKind: "forwardSlash",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "divide",
              leftOperand: {
                expressionKind: "numberLit",
                value: 4,
              },
              rightOperand: {
                expressionKind: "unaryOp",
                unaryOp: "not",
                operand: {
                  expressionKind: "booleanLit",
                  isTrue: true,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 5 - !6; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 5,
          },
          {
            tokenKind: "minus",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "number",
            value: 6,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "subtract",
              leftOperand: {
                expressionKind: "numberLit",
                value: 5,
              },
              rightOperand: {
                expressionKind: "unaryOp",
                unaryOp: "not",
                operand: {
                  expressionKind: "numberLit",
                  value: 6,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 7 < !8; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 7,
          },
          {
            tokenKind: "lessThan",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "number",
            value: 8,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "lessThan",
              leftOperand: {
                expressionKind: "numberLit",
                value: 7,
              },
              rightOperand: {
                expressionKind: "unaryOp",
                unaryOp: "not",
                operand: {
                  expressionKind: "numberLit",
                  value: 8,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = false & !true; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "and",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
              rightOperand: {
                expressionKind: "unaryOp",
                unaryOp: "not",
                operand: {
                  expressionKind: "booleanLit",
                  isTrue: true,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true | !false; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
              rightOperand: {
                expressionKind: "unaryOp",
                unaryOp: "not",
                operand: {
                  expressionKind: "booleanLit",
                  isTrue: false,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 9 > 10 * 11; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 9,
          },
          {
            tokenKind: "greaterThan",
          },
          {
            tokenKind: "number",
            value: 10,
          },
          {
            tokenKind: "asterisk",
          },
          {
            tokenKind: "number",
            value: 11,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "greaterThan",
              leftOperand: {
                expressionKind: "numberLit",
                value: 9,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "multiply",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 10,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 11,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true & 12 * 13; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "number",
            value: 12,
          },
          {
            tokenKind: "asterisk",
          },
          {
            tokenKind: "number",
            value: 13,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "and",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "multiply",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 12,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 13,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 14 | 15 / 16; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 14,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "number",
            value: 15,
          },
          {
            tokenKind: "forwardSlash",
          },
          {
            tokenKind: "number",
            value: 16,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "numberLit",
                value: 14,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "divide",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 15,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 16,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 17 >= 18 + 19; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 17,
          },
          {
            tokenKind: "greaterThanEquals",
          },
          {
            tokenKind: "number",
            value: 18,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 19,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "greaterThanEquals",
              leftOperand: {
                expressionKind: "numberLit",
                value: 17,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "add",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 18,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 19,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = false & 20 - 21; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "number",
            value: 20,
          },
          {
            tokenKind: "minus",
          },
          {
            tokenKind: "number",
            value: 21,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "and",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "subtract",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 20,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 21,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true | 22 + 23; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "number",
            value: 22,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 23,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "add",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 22,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 23,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true & 24 >= 25; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "number",
            value: 24,
          },
          {
            tokenKind: "greaterThanEquals",
          },
          {
            tokenKind: "number",
            value: 25,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "and",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: true,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "greaterThanEquals",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 24,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 25,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = false | 26 <= 27; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "number",
            value: 26,
          },
          {
            tokenKind: "lessThanEquals",
          },
          {
            tokenKind: "number",
            value: 27,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "lessThanEquals",
                leftOperand: {
                  expressionKind: "numberLit",
                  value: 26,
                },
                rightOperand: {
                  expressionKind: "numberLit",
                  value: 27,
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = true & true | false; } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "binOp",
                binOp: "and",
                leftOperand: {
                  expressionKind: "booleanLit",
                  isTrue: true,
                },
                rightOperand: {
                  expressionKind: "booleanLit",
                  isTrue: true,
                },
              },
              rightOperand: {
                expressionKind: "booleanLit",
                isTrue: false,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x = 1 < 2 & 3 > 4 | 5 + 6 * 7 /= 8 & !f(); } with proper precedence", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "lessThan",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "greaterThan",
          },
          {
            tokenKind: "number",
            value: 4,
          },
          {
            tokenKind: "verticalBar",
          },
          {
            tokenKind: "number",
            value: 5,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 6,
          },
          {
            tokenKind: "asterisk",
          },
          {
            tokenKind: "number",
            value: 7,
          },
          {
            tokenKind: "notEqual",
          },
          {
            tokenKind: "number",
            value: 8,
          },
          {
            tokenKind: "ampersand",
          },
          {
            tokenKind: "exclamationPoint",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "binOp",
              binOp: "or",
              leftOperand: {
                expressionKind: "binOp",
                binOp: "and",
                leftOperand: {
                  expressionKind: "binOp",
                  binOp: "lessThan",
                  leftOperand: {
                    expressionKind: "numberLit",
                    value: 1,
                  },
                  rightOperand: {
                    expressionKind: "numberLit",
                    value: 2,
                  },
                },
                rightOperand: {
                  expressionKind: "binOp",
                  binOp: "greaterThan",
                  leftOperand: {
                    expressionKind: "numberLit",
                    value: 3,
                  },
                  rightOperand: {
                    expressionKind: "numberLit",
                    value: 4,
                  },
                },
              },
              rightOperand: {
                expressionKind: "binOp",
                binOp: "and",
                leftOperand: {
                  expressionKind: "binOp",
                  binOp: "notEqual",
                  leftOperand: {
                    expressionKind: "binOp",
                    binOp: "add",
                    leftOperand: {
                      expressionKind: "numberLit",
                      value: 5,
                    },
                    rightOperand: {
                      expressionKind: "binOp",
                      binOp: "multiply",
                      leftOperand: {
                        expressionKind: "numberLit",
                        value: 6,
                      },
                      rightOperand: {
                        expressionKind: "numberLit",
                        value: 7,
                      },
                    },
                  },
                  rightOperand: {
                    expressionKind: "numberLit",
                    value: 8,
                  },
                },
                rightOperand: {
                  expressionKind: "unaryOp",
                  unaryOp: "not",
                  operand: {
                    expressionKind: "funcCall",
                    callee: {
                      expressionKind: "variableRef",
                      variableName: identifierIso.wrap("f"),
                    },
                    args: [],
                  },
                },
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Combination declaration and assignments", () => {
      it("Parses { let x = 1; }", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("x"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "numberLit",
              value: 1,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Simple return statements", () => {
      it("Parses { return 1 + 2; } (return of operation)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "plus",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "return",
            returnedValue: {
              expressionKind: "binOp",
              binOp: "add",
              leftOperand: {
                expressionKind: "numberLit",
                value: 1,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { return; } (return with no expression)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "return",
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Simple function declarations", () => {
      it("Parses { function f() {} } (function with no parameters or body)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "function",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "funcDecl",
            functionName: identifierIso.wrap("f"),
            argNames: [],
            body: [],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { function g(x) {} } (function with one parameter, no body)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "function",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("g"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "funcDecl",
            functionName: identifierIso.wrap("g"),
            argNames: [identifierIso.wrap("x")],
            body: [],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { function h(x, y) {} } (function with multiple parameters, no body)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "function",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("h"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "comma",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("y"),
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "funcDecl",
            functionName: identifierIso.wrap("h"),
            argNames: [identifierIso.wrap("x"), identifierIso.wrap("y")],
            body: [],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { function foo() { return 1; } } (function with no parameters, one statement in body)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "function",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("foo"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "funcDecl",
            functionName: identifierIso.wrap("foo"),
            argNames: [],
            body: [
              {
                statementKind: "return",
                returnedValue: {
                  expressionKind: "numberLit",
                  value: 1,
                },
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { function bar() { x = 1; return x; } } (function with no parameters, multiple statements in body)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "function",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("bar"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "funcDecl",
            functionName: identifierIso.wrap("bar"),
            argNames: [],
            body: [
              {
                statementKind: "assignment",
                variableName: identifierIso.wrap("x"),
                variableValue: {
                  expressionKind: "numberLit",
                  value: 1,
                },
              },
              {
                statementKind: "return",
                returnedValue: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("x"),
                },
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Object usage", () => {
      it("Parses { let x = { field: 1 }; } (simple object with one field)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("field"),
          },
          {
            tokenKind: "colon",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("x"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "objectLit",
              fields: [
                {
                  fieldName: identifierIso.wrap("field"),
                  fieldValue: {
                    expressionKind: "numberLit",
                    value: 1,
                  },
                },
              ],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { let x = { fieldA: 1, fieldB: true }; } (simple object with multiple fields)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("fieldA"),
          },
          {
            tokenKind: "colon",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "comma",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("fieldB"),
          },
          {
            tokenKind: "colon",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("x"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "objectLit",
              fields: [
                {
                  fieldName: identifierIso.wrap("fieldA"),
                  fieldValue: {
                    expressionKind: "numberLit",
                    value: 1,
                  },
                },
                {
                  fieldName: identifierIso.wrap("fieldB"),
                  fieldValue: {
                    expressionKind: "booleanLit",
                    isTrue: true,
                  },
                },
              ],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { let nested = { outerField: { innerField: 1 } }; } (object with nested fields)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("nested"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("outerField"),
          },
          {
            tokenKind: "colon",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("innerField"),
          },
          {
            tokenKind: "colon",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("nested"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("nested"),
            variableValue: {
              expressionKind: "objectLit",
              fields: [
                {
                  fieldName: identifierIso.wrap("outerField"),
                  fieldValue: {
                    expressionKind: "objectLit",
                    fields: [
                      {
                        fieldName: identifierIso.wrap("innerField"),
                        fieldValue: {
                          expressionKind: "numberLit",
                          value: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { let y = x.a; } (basic getter usage)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("y"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("a"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("y"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("y"),
            variableValue: {
              expressionKind: "get",
              object: {
                expressionKind: "variableRef",
                variableName: identifierIso.wrap("x"),
              },
              field: identifierIso.wrap("a"),
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x.a = 1; } (basic setter usage)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("a"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "set",
            object: {
              expressionKind: "variableRef",
              variableName: identifierIso.wrap("x"),
            },
            field: identifierIso.wrap("a"),
            value: {
              expressionKind: "numberLit",
              value: 1,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { let y = x.a.b; } (chained getters)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("y"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("a"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("b"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("y"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("y"),
            variableValue: {
              expressionKind: "get",
              object: {
                expressionKind: "get",
                object: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("x"),
                },
                field: identifierIso.wrap("a"),
              },
              field: identifierIso.wrap("b"),
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x.a.b = 1; } (nested setter)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("a"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("b"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "set",
            object: {
              expressionKind: "get",
              object: {
                expressionKind: "variableRef",
                variableName: identifierIso.wrap("x"),
              },
              field: identifierIso.wrap("a"),
            },
            field: identifierIso.wrap("b"),
            value: {
              expressionKind: "numberLit",
              value: 1,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { let y = x.f().a; } (chaining function call, then getter)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("y"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("a"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("y"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("y"),
            variableValue: {
              expressionKind: "get",
              object: {
                expressionKind: "funcCall",
                callee: {
                  expressionKind: "get",
                  object: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("x"),
                  },
                  field: identifierIso.wrap("f"),
                },
                args: [],
              },
              field: identifierIso.wrap("a"),
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { let y = x.a.f(); } (calling function after getter)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "let",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("y"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("a"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "varDecl",
            variableName: identifierIso.wrap("y"),
          },
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("y"),
            variableValue: {
              expressionKind: "funcCall",
              callee: {
                expressionKind: "get",
                object: {
                  expressionKind: "get",
                  object: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("x"),
                  },
                  field: identifierIso.wrap("a"),
                },
                field: identifierIso.wrap("f"),
              },
              args: [],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Expression statements", () => {
      it("Parses { f(); } (calling function as expression statement)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("f"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "expression",
            expression: {
              expressionKind: "funcCall",
              args: [],
              callee: {
                expressionKind: "variableRef",
                variableName: identifierIso.wrap("f"),
              },
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { x; } (variable reference as expression statement)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "expression",
            expression: {
              expressionKind: "variableRef",
              variableName: identifierIso.wrap("x"),
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { 1; } (number literal as expression statement)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "expression",
            expression: {
              expressionKind: "numberLit",
              value: 1,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { true; } (boolean literal as expression statement)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "expression",
            expression: {
              expressionKind: "booleanLit",
              isTrue: true,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Multi-statement programs", () => {
      it("Parses { x = 1; return x; } (program with multiple simple statements)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "assignment",
            variableName: identifierIso.wrap("x"),
            variableValue: {
              expressionKind: "numberLit",
              value: 1,
            },
          },
          {
            statementKind: "return",
            returnedValue: {
              expressionKind: "variableRef",
              variableName: identifierIso.wrap("x"),
            },
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { if (true) { return 1; } else {} } (program with if statement, empty else block)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "if",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "else",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "if",
            condition: {
              expressionKind: "booleanLit",
              isTrue: true,
            },
            trueBody: [
              {
                statementKind: "return",
                returnedValue: {
                  expressionKind: "numberLit",
                  value: 1,
                },
              },
            ],
            falseBody: [],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { if (false) {} else { return 2; } } (program with if statement, empty then block", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "if",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "else",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "if",
            condition: {
              expressionKind: "booleanLit",
              isTrue: false,
            },
            trueBody: [],
            falseBody: [
              {
                statementKind: "return",
                returnedValue: {
                  expressionKind: "numberLit",
                  value: 2,
                },
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { if (1 < 2) { return 3; } else { return 4; } } (program with if statement, statements in both blocks", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "if",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "lessThan",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "else",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 4,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "if",
            condition: {
              expressionKind: "binOp",
              binOp: "lessThan",
              leftOperand: {
                expressionKind: "numberLit",
                value: 1,
              },
              rightOperand: {
                expressionKind: "numberLit",
                value: 2,
              },
            },
            trueBody: [
              {
                statementKind: "return",
                returnedValue: {
                  expressionKind: "numberLit",
                  value: 3,
                },
              },
            ],
            falseBody: [
              {
                statementKind: "return",
                returnedValue: {
                  expressionKind: "numberLit",
                  value: 4,
                },
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { if (false) { return 1; } else if (true) { return 2; } else { return 3; } } (program with if statement, else-if, else) ", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "if",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "boolean",
            isTrue: false,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "else",
          },
          {
            tokenKind: "if",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 2,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "else",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "return",
          },
          {
            tokenKind: "number",
            value: 3,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "if",
            condition: {
              expressionKind: "booleanLit",
              isTrue: false,
            },
            trueBody: [
              {
                statementKind: "return",
                returnedValue: {
                  expressionKind: "numberLit",
                  value: 1,
                },
              },
            ],
            falseBody: [
              {
                statementKind: "if",
                condition: {
                  expressionKind: "booleanLit",
                  isTrue: true,
                },
                trueBody: [
                  {
                    statementKind: "return",
                    returnedValue: {
                      expressionKind: "numberLit",
                      value: 2,
                    },
                  },
                ],
                falseBody: [
                  {
                    statementKind: "return",
                    returnedValue: {
                      expressionKind: "numberLit",
                      value: 3,
                    },
                  },
                ],
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { while (true) { x = 1; } } (program with while statement)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "while",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "boolean",
            isTrue: true,
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("x"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "while",
            condition: {
              expressionKind: "booleanLit",
              isTrue: true,
            },
            body: [
              {
                statementKind: "assignment",
                variableName: identifierIso.wrap("x"),
                variableValue: {
                  expressionKind: "numberLit",
                  value: 1,
                },
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Import statements", () => {
      it("Parses { import someObj from SomeModule; } (program with single import)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "import",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("someObj"),
          },
          {
            tokenKind: "from",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SomeModule"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "import",
            moduleName: identifierIso.wrap("SomeModule"),
            imports: [identifierIso.wrap("someObj")],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses { import someObj, someFunc from SomeModule; } (program with multiple imports)", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "import",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("someObj"),
          },
          {
            tokenKind: "comma",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("someFunc"),
          },
          {
            tokenKind: "from",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SomeModule"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "import",
            moduleName: identifierIso.wrap("SomeModule"),
            imports: [identifierIso.wrap("someObj"), identifierIso.wrap("someFunc")],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Modules with exports", () => {
      it("Parses a module with a single export", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "export",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("testExport"),
          },
          {
            tokenKind: "semicolon",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredModule: Module = {
          name: testModuleName,
          body: [],
          exports: [identifierIso.wrap("testExport")],
        };
        expect(parseResult.right).toEqual(desiredModule);
      });

      it("Parses a module with multiple exports", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "export",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("testExport1"),
          },
          {
            tokenKind: "comma",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("testExport2"),
          },
          {
            tokenKind: "semicolon",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredModule: Module = {
          name: testModuleName,
          body: [],
          exports: [identifierIso.wrap("testExport1"), identifierIso.wrap("testExport2")],
        };
        expect(parseResult.right).toEqual(desiredModule);
      });
    });

    describe("Class declarations", () => {
      it("Parses a class declaration with no explicit constructor and no methods", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with no-argument constructor and no methods", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "constructor",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "this",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("field"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [],
              body: [
                {
                  statementKind: "set",
                  object: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("this"),
                  },
                  field: identifierIso.wrap("field"),
                  value: {
                    expressionKind: "numberLit",
                    value: 1,
                  },
                },
              ],
            },
            methods: [],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with single-argument constructor and no methods", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "constructor",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("name"),
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "this",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("name"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("name"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [identifierIso.wrap("name")],
              body: [
                {
                  statementKind: "set",
                  object: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("this"),
                  },
                  field: identifierIso.wrap("name"),
                  value: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("name"),
                  },
                },
              ],
            },
            methods: [],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with multiple-argument constructor and no methods", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "constructor",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("name"),
          },
          {
            tokenKind: "comma",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("age"),
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "this",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("name"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("name"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "this",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("age"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("age"),
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [identifierIso.wrap("name"), identifierIso.wrap("age")],
              body: [
                {
                  statementKind: "set",
                  object: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("this"),
                  },
                  field: identifierIso.wrap("name"),
                  value: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("name"),
                  },
                },
                {
                  statementKind: "set",
                  object: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("this"),
                  },
                  field: identifierIso.wrap("age"),
                  value: {
                    expressionKind: "variableRef",
                    variableName: identifierIso.wrap("age"),
                  },
                },
              ],
            },
            methods: [],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with empty constructor and one method with no arguments", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("sampleMethod"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("someFunc"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [
              {
                methodName: identifierIso.wrap("sampleMethod"),
                argNames: [],
                body: [
                  {
                    statementKind: "expression",
                    expression: {
                      expressionKind: "funcCall",
                      callee: {
                        expressionKind: "variableRef",
                        variableName: identifierIso.wrap("someFunc"),
                      },
                      args: [],
                    },
                  },
                ],
              },
            ],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with empty constructor and one method with one argument", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("sampleMethod"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("sampleArg"),
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [
              {
                methodName: identifierIso.wrap("sampleMethod"),
                argNames: [identifierIso.wrap("sampleArg")],
                body: [],
              },
            ],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with empty constructor and one method with multiple arguments", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("sampleMethod"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("arg1"),
          },
          {
            tokenKind: "comma",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("arg2"),
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [
              {
                methodName: identifierIso.wrap("sampleMethod"),
                argNames: [identifierIso.wrap("arg1"), identifierIso.wrap("arg2")],
                body: [],
              },
            ],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with empty constructor and multiple methods", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SampleClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("method1"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("method2"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SampleClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [
              {
                methodName: identifierIso.wrap("method1"),
                argNames: [],
                body: [],
              },
              {
                methodName: identifierIso.wrap("method2"),
                argNames: [],
                body: [],
              },
            ],
          },
        ];
        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with constructor before method", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SomeClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "constructor",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("someMethod"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SomeClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [
              {
                methodName: identifierIso.wrap("someMethod"),
                argNames: [],
                body: [],
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with method before constructor", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SomeClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("someMethod"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "constructor",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SomeClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [
              {
                methodName: identifierIso.wrap("someMethod"),
                argNames: [],
                body: [],
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it("Parses a class declaration with constructor between methods", () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "class",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("SomeClass"),
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("method1"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "constructor",
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("method2"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "classDecl",
            className: identifierIso.wrap("SomeClass"),
            constructor: {
              argNames: [],
              body: [],
            },
            methods: [
              {
                methodName: identifierIso.wrap("method1"),
                argNames: [],
                body: [],
              },
              {
                methodName: identifierIso.wrap("method2"),
                argNames: [],
                body: [],
              },
            ],
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });

    describe("Usages of this in setters/getters", () => {
      it('Parses a simple setter on "this"', () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "this",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("field"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "set",
            object: {
              expressionKind: "variableRef",
              variableName: identifierIso.wrap("this"),
            },
            field: identifierIso.wrap("field"),
            value: {
              expressionKind: "numberLit",
              value: 1,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it('Parses a nested setter on "this"', () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "this",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("field"),
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("inner"),
          },
          {
            tokenKind: "singleEquals",
          },
          {
            tokenKind: "number",
            value: 1,
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "set",
            object: {
              expressionKind: "get",
              object: {
                expressionKind: "variableRef",
                variableName: identifierIso.wrap("this"),
              },
              field: identifierIso.wrap("field"),
            },
            field: identifierIso.wrap("inner"),
            value: {
              expressionKind: "numberLit",
              value: 1,
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });

      it('Parses "this" as regular variable in getter', () => {
        // Arrange
        const tokens: Array<Token> = [
          {
            tokenKind: "module",
          },
          {
            tokenKind: "identifier",
            name: testModuleName,
          },
          {
            tokenKind: "leftBrace",
          },
          {
            tokenKind: "this",
          },
          {
            tokenKind: "period",
          },
          {
            tokenKind: "identifier",
            name: identifierIso.wrap("method"),
          },
          {
            tokenKind: "leftParen",
          },
          {
            tokenKind: "rightParen",
          },
          {
            tokenKind: "semicolon",
          },
          {
            tokenKind: "rightBrace",
          },
        ];

        // Act
        const parseResult = parseModule(tokens);

        // Assert
        if (!isRight(parseResult)) {
          console.error(parseResult.left.message);
          throw new Error("Parse failed, should have succeeded");
        }

        const desiredBlock: Block = [
          {
            statementKind: "expression",
            expression: {
              expressionKind: "funcCall",
              callee: {
                expressionKind: "get",
                object: {
                  expressionKind: "variableRef",
                  variableName: identifierIso.wrap("this"),
                },
                field: identifierIso.wrap("method"),
              },
              args: [],
            },
          },
        ];

        expect(parseResult.right).toEqual(wrapBlock(desiredBlock));
      });
    });
  });

  describe("Parse errors", () => {
    it('Expects a module to begin with "module"', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "leftBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected "module"/);
    });

    it('Expects an identifier after "module"', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "leftBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it("Expects a semicolon after return statements", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "return",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it('Expects an identifier after the "let" keyword', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "let",
        },
        {
          tokenKind: "number",
          value: 1,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it("Expects a semicolon after variable declaration statements", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "let",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it("Expects a semicolon after assignment statements", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "singleEquals",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it("Expects a semicolon after combined declaration/assignment statements", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "let",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "singleEquals",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it("Expects a left brace at the beginning of a block", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected {/);
    });

    it("Expects a right brace at the end of a block", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "return",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "semicolon",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected start/);
    });

    it("Expects a right parenthesis matching a left paren", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "return",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "semicolon",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \)/);
    });

    it("Expects parsing to consume all input", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "return",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "semicolon",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "return",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "semicolon",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected end of input/);
    });

    it("Expects a left parenthesis after the function name in a function declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "function",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("func"),
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \(/);
    });

    it("Expects a right parenthesis after the list of arguments in a function declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "function",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("func"),
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "comma",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \)/);
    });

    it("Expects a comma between parameter names in a function definition", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "function",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("func"),
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("y"),
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ,/);
    });

    it("Expects a comma between arguments in a function call", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("func"),
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("y"),
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "semicolon",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ,/);
    });

    it("Expects an identifier in non-number, non-parenthesized primary expressions", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "return",
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "semicolon",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it('Expects a left parenthesis after "if"', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "if",
        },
        {
          tokenKind: "rightParen",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \(/);
    });

    it("Expects a right parenthesis following the expression in an if statement's condition", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "if",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "boolean",
          isTrue: true,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \)/);
    });

    it("Expects a block to start with a left brace after the condition in an if statement", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "if",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "boolean",
          isTrue: true,
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected {/);
    });

    it('Expects an "else" after the first block in an if statement', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "if",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "boolean",
          isTrue: true,
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "leftBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected "else"/);
    });

    it('Expects a block to start with a left brace after the "else" (with no if) in an if statement', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "if",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "boolean",
          isTrue: true,
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "else",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected {/);
    });

    it('Expects a left parenthesis after "while"', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "while",
        },
        {
          tokenKind: "rightParen",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \(/);
    });

    it("Expects a right parenthesis following the expression in a while statement's condition", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "while",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "boolean",
          isTrue: true,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \)/);
    });

    it("Expects a block to start with a left brace after the condition in a while statement", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "while",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "boolean",
          isTrue: true,
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected {/);
    });

    it('Expects an identifier after "function"', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "function",
        },
        {
          tokenKind: "function",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it("Expects commas between field definitions in an object", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "let",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("obj"),
        },
        {
          tokenKind: "singleEquals",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("a"),
        },
        {
          tokenKind: "colon",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("b"),
        },
        {
          tokenKind: "colon",
        },
        {
          tokenKind: "number",
          value: 2,
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "semicolon",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ,/);
    });

    it("Expects an = or ; after an identifier beginning a statement", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("x"),
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected/);
      expect(parseResult.left.message).toMatch(/;/);
      expect(parseResult.left.message).toMatch(/=/);
    });

    it("Expects a semicolon following a number literal expression statement", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it("Expects a semicolon following a boolean literal expression statement", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "boolean",
          isTrue: true,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it("Expects an identifier following a period in a get expression/set statement", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("obj"),
        },
        {
          tokenKind: "period",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it("Expects a colon after a field name in an object literal", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("obj"),
        },
        {
          tokenKind: "singleEquals",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("field"),
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected :/);
    });

    it("Expects a right brace at the end of an object literal", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("obj"),
        },
        {
          tokenKind: "singleEquals",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "semicolon",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected }/);
    });

    it("Expects a comma between exported identifiers", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "export",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("testExport1"),
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("testExport2"),
        },
        {
          tokenKind: "semicolon",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ,/);
    });

    it("Expects a semicolon after the list of exports", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "export",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("testExport"),
        },
        {
          tokenKind: "comma",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it("Expects a comma between imported identifiers", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "import",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("import1"),
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("import2"),
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ,/);
    });

    it('Expects "from" after a list of imports', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "import",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("import"),
        },
        {
          tokenKind: "comma",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected "from"/);
    });

    it('Expects identifier after "from" in import statement ', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "import",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("import"),
        },
        {
          tokenKind: "from",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it("Expects semicolon at end of import statement", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "import",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("import"),
        },
        {
          tokenKind: "from",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("SomeModule"),
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it('Expects period after "this" at start of statement', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "this",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("field"),
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ./);
    });

    it('Expects identifier after "this." at start of statement', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "this",
        },
        {
          tokenKind: "period",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it('Expects single equals after "this.field" at start of statement', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "this",
        },
        {
          tokenKind: "period",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("field"),
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected =/);
    });

    it('Expects semicolon at end of "this.field = 1" setter statement', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "this",
        },
        {
          tokenKind: "period",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("field"),
        },
        {
          tokenKind: "singleEquals",
        },
        {
          tokenKind: "number",
          value: 1,
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ;/);
    });

    it("Expects identifier as part of nested setter on this", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "this",
        },
        {
          tokenKind: "period",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("field"),
        },
        {
          tokenKind: "period",
        },
        {
          tokenKind: "number",
          value: 1,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it('Expects identifier after "class" keyword', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "number",
          value: 1,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected identifier/);
    });

    it("Expects left brace after class name", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "number",
          value: 1,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected {/);
    });

    it('Expects left paren after "constructor" in class declaration', () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "constructor",
        },
        {
          tokenKind: "this",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \(/);
    });

    it("Expects comma between argument names in constructor declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "constructor",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("arg1"),
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("arg2"),
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ,/);
    });

    it("Expects right paren after list of arguments in constructor declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "constructor",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("arg"),
        },
        {
          tokenKind: "comma",
        },
        {
          tokenKind: "leftBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \)/);
    });

    it("Expects left paren after method name in class declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("method"),
        },
        {
          tokenKind: "this",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \(/);
    });

    it("Expects comma between argument names in method declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("method"),
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("arg1"),
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("arg2"),
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected ,/);
    });

    it("Expects right paren after list of arguments in method declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("method"),
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("arg"),
        },
        {
          tokenKind: "comma",
        },
        {
          tokenKind: "leftBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected \)/);
    });

    it("Expects right brace at end of class declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "number",
          value: 1,
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected }/);
    });

    it("Expects at most one constructor in class declaration", () => {
      // Arrange
      const tokens: Array<Token> = [
        {
          tokenKind: "module",
        },
        {
          tokenKind: "identifier",
          name: testModuleName,
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "class",
        },
        {
          tokenKind: "identifier",
          name: identifierIso.wrap("TestClass"),
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "constructor",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "constructor",
        },
        {
          tokenKind: "leftParen",
        },
        {
          tokenKind: "rightParen",
        },
        {
          tokenKind: "leftBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "rightBrace",
        },
        {
          tokenKind: "rightBrace",
        },
      ];

      // Act
      const parseResult = parseModule(tokens);

      // Assert
      if (!isLeft(parseResult)) {
        throw new Error("Parse succeeded, should have failed");
      }

      expect(parseResult.left.message).toMatch(/Expected at most one constructor/);
    });
  });
});
