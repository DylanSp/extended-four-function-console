import { Either, left, right } from "fp-ts/lib/Either";
import { Identifier, identifierIso } from "./types";

/**
 * TYPES
 */

export type Token =
  | LeftBrace
  | RightBrace
  | LeftParen
  | RightParen
  | SingleEquals
  | FunctionKeyword
  | ReturnKeyword
  | Semicolon
  | Comma
  | NumberToken
  | OperationToken
  | IdentifierToken;

interface LeftBrace {
  tokenKind: "leftBrace";
}

interface RightBrace {
  tokenKind: "rightBrace";
}

interface LeftParen {
  tokenKind: "leftParen";
}

interface RightParen {
  tokenKind: "rightParen";
}

interface SingleEquals {
  tokenKind: "singleEquals";
}

interface FunctionKeyword {
  tokenKind: "function";
}

interface ReturnKeyword {
  tokenKind: "return";
}

interface Semicolon {
  tokenKind: "semicolon";
}

interface Comma {
  tokenKind: "comma";
}

export interface NumberToken {
  tokenKind: "number";
  value: number;
}

export type Operation = "add" | "subtract" | "multiply" | "divide";

export interface OperationToken {
  tokenKind: "operation";
  operation: Operation;
}

export interface IdentifierToken {
  tokenKind: "identifier";
  name: Identifier;
}

export interface ScanError {
  invalidLexeme: string;
}

type Scan = (input: string) => Either<Array<ScanError>, Array<Token>>;

/**
 * SCANNING
 */

export const scan: Scan = (input: string) => {
  const errors: Array<ScanError> = [];
  const tokens: Array<Token> = [];

  let position = 0;
  while (position < input.length) {
    const char = input[position];

    if (/^function/.test(input.substring(position))) {
      tokens.push({
        tokenKind: "function",
      });
      position += "function".length;
    } else if (/^return/.test(input.substring(position))) {
      tokens.push({
        tokenKind: "return",
      });
      position += "return".length;
    } else if (/\d{1}/.test(char)) {
      const numberMatches = input.substring(position).match(/^[\d]+([.][\d]+)?/);
      if (numberMatches === null) {
        throw new Error("Programming error when trying to scan a number"); // shouldn't get here; the regex for the whole number should find something if the /\d{1}/ regex matched
      }
      const value = parseFloat(numberMatches[0]);
      tokens.push({
        tokenKind: "number",
        value,
      });
      position += numberMatches[0].length; // advance past the number we just scanned
    } else {
      switch (char) {
        case "(":
          tokens.push({
            tokenKind: "leftParen",
          });
          position += 1;
          break;
        case ")":
          tokens.push({
            tokenKind: "rightParen",
          });
          position += 1;
          break;
        case "{":
          tokens.push({
            tokenKind: "leftBrace",
          });
          position += 1;
          break;
        case "}":
          tokens.push({
            tokenKind: "rightBrace",
          });
          position += 1;
          break;
        case "=":
          tokens.push({
            tokenKind: "singleEquals",
          });
          position += 1;
          break;
        case ",":
          tokens.push({
            tokenKind: "comma",
          });
          position += 1;
          break;
        case ";":
          tokens.push({
            tokenKind: "semicolon",
          });
          position += 1;
          break;
        case "+":
          tokens.push({
            tokenKind: "operation",
            operation: "add",
          });
          position += 1;
          break;
        case "-":
          tokens.push({
            tokenKind: "operation",
            operation: "subtract",
          });
          position += 1;
          break;
        case "*":
          tokens.push({
            tokenKind: "operation",
            operation: "multiply",
          });
          position += 1;
          break;
        case "/":
          tokens.push({
            tokenKind: "operation",
            operation: "divide",
          });
          position += 1;
          break;
        default:
          // check for whitespace; if present, skip past it
          if (/\s/.test(char)) {
            position += 1;
            break;
          }

          // check for valid identifier; if doesn't match, lexeme is invalid
          const matches = input.substring(position).match(/^[a-zA-Z][a-zA-Z0-9]*/);
          if (matches === null) {
            const badMatches = input.substring(position).match(/^[^\s]+/);
            if (badMatches === null) {
              throw new Error(
                `Programming error; ${input.substring(
                  position,
                )} begins with neither a valid identifier nor an invalid lexeme`,
              );
            }
            errors.push({
              invalidLexeme: badMatches[0],
            });
            position += badMatches[0].length;
          } else {
            const name = matches[0];

            tokens.push({
              tokenKind: "identifier",
              name: identifierIso.wrap(name),
            });
            position += name.length;
          }
      }
    }
  }

  if (errors.length > 0) {
    return left(errors);
  }

  return right(tokens);
};
