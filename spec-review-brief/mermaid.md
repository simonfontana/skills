# Mermaid that renders

A broken diagram can go unnoticed: some viewers show a raw error block, but others drop the diagram without any error, so a reader cannot tell anything is missing.

## Rules for writing diagrams

- Quote flowchart node labels: `A["Coordinator (v2)"]`. Unquoted parentheses, brackets, colons and commas break the parser.
- Quote flowchart edge labels: `A -->|"starts, then waits"| B`.
- In `stateDiagram-v2`, give any state name with spaces or punctuation an ID: `state "Waiting for ack" as Waiting`, then use `Waiting` in transitions.
- Write "then" inside a label or message, never `-->`; an arrow ends the label early.
- `end` as a bare node ID collides with `subgraph`'s terminator. Use another ID, such as `Done`.
- `stateDiagram-v2`, not `stateDiagram`. Only `-v2` supports composite states and notes reliably.
- In `sequenceDiagram`, declare every participant at the top. Undeclared ones appear in first-mention order, which is rarely the order you want.
- Keep semicolons out of labels and messages. Mermaid can read one as the end of a statement.
- Draw before and after as two separate diagrams. Unconnected `subgraph`s render in an order the layout engine picks, not the order you wrote them, so a validator passes and the diagram still reads wrong.

## Checking the diagrams

1. If your agent has a Mermaid validation tool, for example `mermaid-diagram-validator` from the Mermaid Chart VS Code extension, run it on each diagram. A reported syntax error is a result: fix it and run the tool again. If the tool itself fails, errors, or does not respond, stop using it for this brief and go to step 2. Use only a tool you already have; install nothing.
2. Without a working tool, check by reading, as a separate pass after the brief is written. Take one diagram at a time, go through every rule above against it, and fix what fails.

The check is done when every diagram has passed the tool or every rule.
In the conversation summary, say how the diagrams were checked: with the tool, or by reading against the rules because no validator was available. Leave this out of the brief itself.
