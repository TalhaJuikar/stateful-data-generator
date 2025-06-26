# Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification to standardize commit messages and automate versioning.

## Commit Message Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify source or test files

## Breaking Changes

Commits that introduce breaking changes should include an exclamation mark after the type/scope, and a `BREAKING CHANGE:` footer describing the breaking change.

```text
feat!: drop support for Node 14

BREAKING CHANGE: Node 14 is no longer supported due to end of life
```

## Examples

```text
feat(ui): add multi-select capability to data table
fix(api): correct pagination when limit changes
docs: update installation instructions
refactor: optimize data fetching logic
test: add test cases for delete all functionality
ci: integrate semantic versioning into pipeline
```

## Versioning Impact

- `feat` type → Minor version bump (1.0.0 → 1.1.0)
- `fix`, `perf`, `refactor`, `docs` types → Patch version bump (1.0.0 → 1.0.1)
- Any commit with `BREAKING CHANGE` in footer or `!` after type → Major version bump (1.0.0 → 2.0.0)

## Rules

1. Commit messages should be specific and descriptive
2. Use the imperative mood ("add feature" not "added feature")
3. First line should be 50 characters or less
4. Wrap body text at 72 characters
5. Separate subject from body with a blank line
6. Subject line should not end with a period
