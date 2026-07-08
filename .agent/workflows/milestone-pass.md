# Milestone Verification Workflow

This workflow ensures code quality, compiler stability, and regression testing are verified before presenting any completed milestone to the user.

---

## Pre-Review Validation Steps

Future agents must execute the following sequence:

### 1. Compile & Bundling Check
Compile the React/TypeScript codebase and verify there are zero TypeScript compiler warnings or bundling errors:
```bash
npm run build
```

### 2. Test Suite Validation
Execute the Vitest testing suite. Verify all unit and integration tests compile and pass successfully:
```bash
npm run test
```

### 3. Repository Size and Branch Health
Confirm there is only one active branch and that no large media files, videos, or extraneous node folders have been tracked:
```bash
git status
```

### 4. Safety Constraints Audit
Verify the following safety rules:
- No hardcoded API keys are present.
- No official FIFA brand logos or trademarked graphic files are present.
- The simulated disclaimer banner renders clearly.

---

## Presentation Checklist
When reporting a milestone's completion, provide:
1. **Summary of changes:** Files modified/created.
2. **Build output:** The console logs showing successful compilation.
3. **Test output:** The Vitest summary showing passed counts.
4. **Git status output:** Review showing only untracked files present.
5. **Decisions or issues:** Note any version changes or design adjustments.
