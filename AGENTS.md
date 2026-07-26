# AndgateBOS Frontend Context

## Technology

This is the AndgateBOS Next.js web application and PWA.

Inspect `package.json`, configuration files and existing source code for exact framework versions, package manager and scripts.

## Development Rules

- Use TypeScript consistently.
- Follow the existing App Router and component structure.
- Avoid business logic inside presentation components.
- Reuse established components and design tokens.
- Preserve responsive behavior.
- Preserve localization.
- Preserve permissions and subscription feature visibility.
- Avoid unnecessary client-side JavaScript.
- Do not add dependencies without demonstrating need.

## User Experience

Design for Bangladesh SME owners and shopkeepers.

Prioritize:

- Clear navigation
- Large and understandable controls
- Safe defaults
- Visible loading, success and error states
- Mobile responsiveness
- Bangla and English usability
- Consistent branding
- Fast common workflows

Do not remove functionality merely to simplify the interface. Improve hierarchy, guidance and defaults instead.

## Validation

Read scripts from `package.json` before selecting commands.

Run the applicable checks, such as:

    npm run lint
    npm run test
    npm run build

Do not run package upgrades or modify lockfiles unless required by the task.
