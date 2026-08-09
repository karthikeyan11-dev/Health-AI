# Backend Unit & Integration Tests

This directory mirrors the feature hierarchy of `src/modules/`.

## Structure Rules:
- For each feature module in `src/modules/<feature>/`, create a corresponding test directory: `tests/<feature>/`.
- Write dedicated unit test files for each business logic layer:
  - `<feature>.controller.spec.ts`
  - `<feature>.service.spec.ts`
  - `<feature>.repository.spec.ts`
  - `<feature>.transformer.spec.ts` (if applicable)
- Do not write unit tests for DTO files (`*.dto.ts`).
- Maintain 100% test coverage for all controllers, services, repositories, and transformers.
