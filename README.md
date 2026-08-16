# RepoReady Viewer

RepoReady Viewer is a privacy-first, browser-based Angular application for exploring RepoReady JSON and SARIF reports. Reports are parsed entirely on the user's device and are never uploaded.

## Features

- Drag-and-drop JSON and SARIF import
- Typed parsing for RepoReady and SARIF 2.1.0 reports
- Signal-based state, filtering, selection, and summary counts
- Block, warning, and pass review queues
- Finding details with remediation guidance and fingerprints
- Search and severity filters
- Baseline suppression summary
- Responsive desktop and mobile layouts
- Light and dark themes
- Keyboard-accessible controls and reduced-motion support
- Synthetic sample report for an immediate demo

## Technology

- Angular 20 standalone components
- Strict TypeScript
- Angular Signals
- Native CSS design tokens and responsive layout
- Jasmine and Karma unit tests
- GitHub Actions

The application intentionally avoids a server, database, analytics, third-party UI framework, and external runtime requests. The synthetic sample is bundled with the application.

## Development

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Validation

```bash
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

## Deployment

The included GitHub Pages workflow builds with the `/RepoReadyViewer/` base path and deploys the static browser bundle after pushes to `main`. Configure the repository's Pages source to **GitHub Actions** before the first deployment.

## Report formats

RepoReady Viewer accepts the JSON emitted by:

```bash
repoready scan . --format json --output report.json
repoready scan . --format sarif --output report.sarif
```

Unknown structures and severity values are rejected with a clear local error. Imported content is not placed in browser storage.

## Privacy

Report files can contain repository metadata and remediation context. RepoReady Viewer processes them only in browser memory. Closing or reloading the page clears the imported report.

## License

[MIT](LICENSE)
