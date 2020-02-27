Program -> Block

Block -> "{" Statement:* "}"

Statement -> FunctionDeclaration
           | ReturnStatement
		   | VariableAssignment
		   | IfStatement
		   | WhileStatement
		 
FunctionDeclaration -> "function" Identifier "(" ParameterDeclarationList ")" Block

ParameterDeclarationList -> (Identifier ("," Identifier):*):?

ReturnStatement -> "return" LogicalExpression ";"

VariableAssignment -> Identifier "=" LogicalExpression ";"

IfStatement -> "if" "(" LogicalExpression ")" Block "else" Block

WhileStatement -> "while" "(" LogicalExpression ")" Block




LogicalExpression -> LogicalTerm (AndOp LogicalTerm):*

AndOp -> "&"

LogicalTerm -> Relation (OrOp Relation):*

OrOp -> "|"

Relation -> Expression (RelOp Expression):?
		  
RelOp -> "<" | ">" | "<=" | ">=" | "==" | "/="

Expression -> Term (AddOp Term):*

AddOp -> "+" | "-"

Term -> Factor (MulOp Factor):*

MulOp -> "*" | "/"

FactorWithUnary -> UnaryOp:* Factor

UnaryOp -> "!"

Factor -> "(" LogicalExpression ")"
        | PossibleCall
		
PossibleCall -> LiteralOrIdent ("(" ArgumentList ")"):*

ArgumentList -> (LogicalExpression ("," LogicalExpression):*):?
			
LiteralOrIdent -> Number
			    | Boolean
                | Identifier
			   
Number -> [0-9]:+ ("." [0-9]:+):?

Boolean -> "true" | "false"

Identifier -> [a-zA-Z] [a-zA-Z0-9]:*