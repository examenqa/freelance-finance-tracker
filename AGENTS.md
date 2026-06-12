# ExamenQA Payment Tracker

## What this app is
- Electron desktop app for tracking incoming payments, payouts, expenses, GST RCM, and setup data.
- Main UI lives in `src/index.html`, `src/renderer.js`, and `src/styles.css`.
- Main process and file/system behavior live in `main.js` and `preload.js`.

## Working rules
- Keep changes small and local unless a wider refactor is explicitly requested.
- Do not overwrite or reset user data files unless the user explicitly asks for it.
- Treat the active data path as user-controlled state. If a new data path is chosen, warn before reusing an existing file.
- Prefer fixing behavior in the smallest possible place first, especially for UI issues.

## Data and storage
- Default app data file: `payment-tracker-data.json`.
- Settings file: `payment-tracker-settings.json`.
- The app supports a custom data path chosen from Setup.
- Import/export should preserve the app’s data shape and not drop fields silently.
- When recovering or migrating data, verify the target path before writing.

## Packaging and icon rules
- Windows builds use the app icon at `src/assets/app-icon.ico`.
- `npm run dist` builds the installer with electron-builder.
- If the icon or installer changes, rebuild the installer and verify the new package output.

## Useful commands
- `npm run start` to launch the app locally.
- `npm run build` to verify build-related checks.
- `npm run dist` to create the Windows installer.

## UI guidance
- Keep the layout compact and readable.
- Do not change unrelated tabs or tables when fixing one tab.
- If a UI control looks wrong, verify the actual DOM/state flow before changing styling only.

## Validation
- Run `node --check main.js` and `node --check src/renderer.js` after code changes.
- If packaging changes, rebuild with `npm run dist` and confirm the installer is produced in `dist/`.
