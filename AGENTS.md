# Calculator development

Use codebase-memory-mcp for code discovery; refresh the project index when needed. Prefer the repo manual (`manual/`) for key sequences and display behavior. User preferences override the manual where explicitly requested.

## Parallel feature work

Read `docs/FEATURES.md` before adding calculator behavior. Assign each agent one `src/features/<id>/` folder. Keep feature logic, LCD screens, text rendering, styles and tests in that folder. Browser discovery is automatic; do not add entries to shared registration files.

Use unique feature IDs and namespaced action names. Physical key bindings are owned by one feature for each label/modifier combination; duplicate bindings/actions fail at composition. Keep state immutable and under the feature namespace. Use injected math/parser/context helpers; do not import the app singleton from a feature.

Routine feature work should not modify `src/core/`, `src/app/`, `src/ui/`, `src/features/builtins.js` or another feature's files. Shared architecture/integration work may change those files when it is part of the requested task. Coordinate ownership before changing shared contracts.

Run feature-owned tests while developing, then `npm test` and `npm run build` before handoff. Preserve user changes and do not commit unless asked.
