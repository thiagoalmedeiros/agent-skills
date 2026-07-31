# Code Simplification — Full Reference

> Complexity signals to scan for and per-language before/after examples for
> the `code-simplification` skill. `SKILL.md` is the lean process that
> points here.

## Complexity Signals

### Structural

| Signal | Why it costs comprehension | Typical fix |
| --- | --- | --- |
| Nesting three or more levels deep | Reader has to hold multiple open conditions in their head at once | Extract guard clauses / early returns, or pull the inner block into a named helper |
| Functions over ~50 lines | Usually doing more than one job | Split by responsibility, name each piece |
| Nested ternaries | Requires a mental stack to parse | Rewrite as if/else, a switch, or a lookup table |
| Boolean flag parameters (`doThing(true, false)`) | Call sites are unreadable without checking the signature | Replace with an options object or two distinctly named functions |
| The same `if` condition repeated in several places | The condition is really a concept that has no name yet | Extract a well-named predicate function |

### Naming

| Signal | Why it costs comprehension | Typical fix |
| --- | --- | --- |
| Generic names (`data`, `result`, `temp`, `val`, `item`) | Tells the reader nothing about content | Name for what it holds: `userProfile`, `validationErrors` |
| Non-standard abbreviations (`usr`, `cfg`, `btn`) | Forces a mental expansion step | Spell it out, except universal abbreviations (`id`, `url`, `api`) |
| Names that no longer match behavior (a `get*` that also mutates) | Misleads the reader into wrong assumptions | Rename to reflect what it actually does |
| Comments restating the next line (`// increment counter` above `count++`) | Adds noise without adding information | Delete — let the code speak |
| Comments explaining a non-obvious *why* | Carries intent the code can't express on its own | Keep these |

### Redundancy

| Signal | Why it costs comprehension | Typical fix |
| --- | --- | --- |
| The same 5+ lines duplicated in multiple places | Two places to keep in sync, one of which will drift | Extract a shared function |
| Unreachable branches, unused variables, commented-out code | Reader has to determine it's dead before ignoring it | Remove, after confirming it really is dead |
| A wrapper that adds no behavior of its own | Pure indirection with no payoff | Inline it, call the underlying function directly |
| A factory building a factory, a strategy with exactly one strategy | Solves a problem that doesn't exist yet | Replace with the direct, simple approach |
| A type assertion casting to a type already inferred | Dead weight that can hide a real mismatch later | Remove the assertion |

## Before / After Examples

### TypeScript / JavaScript

Dense ternary chain vs. a readable mapping:

```typescript
// Before
const label = isNew ? 'New' : isUpdated ? 'Updated' : isArchived ? 'Archived' : 'Active';

// After
function getStatusLabel(item: Item): string {
  if (item.isNew) return 'New';
  if (item.isUpdated) return 'Updated';
  if (item.isArchived) return 'Archived';
  return 'Active';
}
```

An async wrapper that adds nothing over the promise it returns:

```typescript
// Before
async function getUser(id: string): Promise<User> {
  return await userService.findById(id);
}

// After
function getUser(id: string): Promise<User> {
  return userService.findById(id);
}
```

### Python

Verbose loop vs. a comprehension:

```python
# Before
result = {}
for item in items:
    result[item.id] = item.name

# After
result = {item.id: item.name for item in items}
```

Nested conditionals vs. guard clauses:

```python
# Before
def process(data):
    if data is not None:
        if data.is_valid():
            if data.has_permission():
                return do_work(data)
            else:
                raise PermissionError("No permission")
        else:
            raise ValueError("Invalid data")
    else:
        raise TypeError("Data is None")

# After
def process(data):
    if data is None:
        raise TypeError("Data is None")
    if not data.is_valid():
        raise ValueError("Invalid data")
    if not data.has_permission():
        raise PermissionError("No permission")
    return do_work(data)
```

### React / JSX

Verbose branching render vs. derived values:

```tsx
// Before
function UserBadge({ user }: Props) {
  if (user.isAdmin) {
    return <Badge variant="admin">Admin</Badge>;
  } else {
    return <Badge variant="default">User</Badge>;
  }
}

// After
function UserBadge({ user }: Props) {
  const variant = user.isAdmin ? 'admin' : 'default';
  const label = user.isAdmin ? 'Admin' : 'User';
  return <Badge variant={variant}>{label}</Badge>;
}
```

Prop drilling through intermediate components is a judgment call, not an
automatic simplification — flag whether context or composition fits better,
but don't refactor it without confirming the change first.

## Over-Simplification Traps

Simplification has its own failure mode. Watch for:

- **Inlining too aggressively** — removing a helper that gave a concept a name can make the call site harder to read, not easier.
- **Merging unrelated logic** — two simple functions combined into one complex function is not simpler.
- **Stripping "unnecessary" abstraction** — some abstractions exist for extensibility or testability, not complexity for its own sake.
- **Optimizing for line count** — the goal is comprehension speed, not a smaller diff.
