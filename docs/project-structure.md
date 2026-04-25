# Project Structure

This project now follows a scalable Expo Router structure with feature boundaries.

## Current layout

- `src/app`: Expo Router route entry points only.
- `src/features`: role-based and domain-specific UI modules.
- `src/shared`: reusable hooks, theme, types, data, and UI shared across features.
- `assets`: static images and banners used by the app.

## Current feature layering

- `src/features/profile`: fully layered with root compatibility wrappers and internal `screens`, `components`, and `lib` folders.
- `src/features/dealer`: layered for growth with root facades, `screens`, `components`, and `lib`.
- `src/features/electrician`: layered for growth with root facades, `screens`, and `components`.
- `src/shared/components/ProfileFlipCard.tsx`: shared UI used by both dealer and electrician flows, kept out of feature ownership to avoid cross-feature imports.

## Structure rules

- Keep route files thin and use them for composition and navigation orchestration only.
- Put screen-specific code inside the owning feature folder.
- Move cross-feature types, helpers, and theme tokens into `src/shared`.
- Avoid importing feature code from `src/app`; features should depend on shared modules, not route files.
- Keep large features layered internally: `screens` for entry screens, `components` for feature UI pieces, and `lib` for feature-owned data and helpers.
- Inside a layered feature, import directly from `screens`, `components`, and `lib` rather than routing back through root-level wrappers.
- Keep root-level feature files only as the feature's public facade or compatibility layer for external imports.
- Import language, theme, and translation helpers from `src/shared/preferences` rather than feature facades.

## Applied profile structure

- `src/features/profile/screens`: profile screen implementations.
- `src/features/profile/components`: profile-only UI primitives such as shared icons and buttons.
- `src/features/profile/lib`: profile menu definitions, row definitions, and feature-specific helpers.
- `src/shared/preferences`: shared preference context, language strings, and theme helpers used across features.
