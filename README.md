# Skills

A collection of agent skills that encode reusable conventions and workflows.

## Skills

| Skill | Description |
|-------|-------------|
| [`agents-md`](agents-md/SKILL.md) | Create and maintain `AGENTS.md` / `CLAUDE.md` files with concise, actionable agent instructions |
| [`commit-message`](commit-message/SKILL.md) | Write git commit messages focused on observable behaviour change, not implementation detail |
| [`go-tests`](go-tests/SKILL.md) | Write and review Go tests following table-driven, parallel, and mock conventions |
| [`spec-to-dev-brief`](spec-to-dev-brief/SKILL.md) | Turn a dense OpenSpec change into one readable implementation brief for developers (unofficial, not part of OpenSpec) |

## Usage

Each skill lives in its own directory around a `SKILL.md` file with a YAML frontmatter `description` that controls when an agent automatically invokes it. Point your agent configuration at the relevant `SKILL.md` to enable it. Some skills ship supporting scripts alongside it; `SKILL.md` explains when they are needed and how to set them up.
