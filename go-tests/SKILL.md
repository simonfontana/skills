---
name: go-tests
description: Write or review Go tests in this repository. Use when creating new tests, modifying existing tests, or reviewing test code.
---

# Testing Conventions

## Rules

- External test package (`package foo_test`) to verify via public API.
- `t.Parallel()` on every test and subtest unless there is shared mutable state that prevents it (e.g., a package-level singleton, shared temp directory, or serial database).
- Table-driven tests (`gotests` convention) when there are multiple cases exercising the same code path with different inputs. A single focused test function is fine when there is genuinely only one scenario or when the setup/assertion logic differs significantly per case.
- Group inputs in a nested `args` struct when there are multiple inputs. Inline when trivial.
- **Never use `time.Sleep` in tests.** Use `timing.FixedClock` with explicit advances, channels, or `assert.Eventually`/`require.Eventually` for async assertions.
- `timing.FixedClock` for time-sensitive tests; advance explicitly.
- `require` for fatal preconditions (early return on failure), `assert` for test assertions.
- Mocks: add `//mockery:generate: true` above the interface and run `make generate`.
- Mock setup should only include expectations that are *relevant to the scenario under test*. If a mock expectation isn't part of the stimulus or the assertion, leave it out. The test fixture should handle unrelated calls via defaults or `.Maybe()` — don't litter the test body with irrelevant `.On(...)` lines that obscure what's actually being tested. A reader should be able to look at the mock setup and immediately understand what inputs are being controlled and why.

## Logging in Tests

Use `zap.New` writing to stdout (the default). `go test` captures stdout and only displays it when a test fails, which gives exactly the right behaviour: logs visible on failure, hidden on success.

```go
log := zap.New(zap.WithLevel(l0g.DebugLevel))
defer log.Close()
```

**`observable.NewLogger`** — use only when you must assert on log output (e.g., verifying a specific warning fires). Prefer exposing observable state via a method or return value instead; log assertions are brittle and should be a last resort.

## Stubs vs Generated Mocks

Use **generated mocks** (mockery) when:
- You need to verify specific call sequences, arguments, or call counts.
- The interface is a key dependency whose interactions define the test's purpose.

Use **hand-rolled stubs** when:
- The interface has many methods but the test only cares about one or two.
- You need a trivial no-op or fixed-value implementation.
- The stub is simpler than configuring a mock (no `.On(...)` ceremony needed).

A stub is just a struct that satisfies the interface with hard-coded or configurable return values. Place stubs at the top of the test file or in a shared `helpers_test.go`.

## Test Helper Organisation

When multiple test files in a package share setup logic, extract helpers into a dedicated `helpers_test.go` (or `mock_helpers_test.go` for mock-specific wiring). This keeps individual test files focused on scenarios, not plumbing.

Guidelines:
- Helper functions that call `t.Helper()` so failures report the caller's line.
- Name helpers after what they *produce* (`newTestStore`, `createMeasureDoc`) not what they *do internally*.
- Keep helpers in the same `_test` package — they don't need to be exported.

## Table-Driven Test Template

```go
func TestFoo(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		args args
		want Type
	}{
		{
			name: "descriptive case name",
			args: args{...},
			want: expected,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := DoSomething(tt.args.input)

			assert.Equal(t, tt.want, got)
		})
	}
}
```

## Example

```go
func TestClamp(t *testing.T) {
	t.Parallel()

	type args struct {
		value int
		min   int
		max   int
	}
	tests := []struct {
		name    string
		args    args
		want    int
		wantErr bool
	}{
		{
			name: "value within range unchanged",
			args: args{value: 5, min: 0, max: 10},
			want: 5,
		},
		{
			name: "value below min clamped up",
			args: args{value: -3, min: 0, max: 10},
			want: 0,
		},
		{
			name: "value above max clamped down",
			args: args{value: 15, min: 0, max: 10},
			want: 10,
		},
		{
			name:    "min greater than max returns error",
			args:    args{value: 5, min: 10, max: 0},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := Clamp(tt.args.value, tt.args.min, tt.args.max)

			if tt.wantErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
```
