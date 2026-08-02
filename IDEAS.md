# Website ideas

## Direction

The site should feel minimal at first glance, then reveal a surprising amount of
detail to people who choose to explore. It should be personal, playful, and data
rich without looking like a dashboard.

Keep the main page calm and concise. Let deeper information appear through small
visualizations, expandable details, project pages, and writing.

## Main page

### Introduction

- Short personal introduction
- Links to:
  - GitHub
  - Instagram
  - SoundCloud

### Currently

- Time at Sentry
- Total commit count
- Small commit-history graph
- Other current interests or projects

### Projects

- A short, curated list rather than every repository
- Each project should explain what it is and why it exists
- Mix software, infrastructure, music, and experiments
- Allow selected projects to have their own detailed pages

### Writing

- Notes and longer-form posts
- Engineering, design, infrastructure, music, and personal projects
- Keep publishing mechanics simple enough that writing does not feel expensive

## Personal statistics

Small visualizations could act as entry points into more detailed views.

- Commit history
  - Weekly commits over the last year
  - Total commits at Sentry
  - Activity grouped by project or organization
- Command history
  - Commands per day or week from Atuin
  - Frequently used tools
  - Languages and ecosystems inferred from commands
- Projects
  - Active projects
  - Releases and deployments
  - Code churn or languages used
- Music
  - Recent listening
  - Mixes published
  - Time spent listening or DJing
- Home infrastructure
  - Services running
  - Deployments or upgrades
  - Uptime and other operational curiosities
- Travel or places
- Reading and writing activity

Statistics should tell a story or expose an interesting pattern. Avoid numbers
that exist only because they are easy to collect.

## Personal statistics service

Build a small service on the home server that collects, normalizes, and publishes
interesting personal statistics for the website.

Possible data sources:

- GitHub GraphQL API
- Atuin history
- Home Assistant
- Music services and local listening history
- Git repositories and deployment systems
- The home server's service inventory

The public API should expose intentionally selected aggregates, never raw personal
events. It should make privacy boundaries explicit and avoid leaking repository
names, commands, locations, or infrastructure details by accident.

Useful properties:

- Periodically refreshed rather than live
- Cached and resilient when a source is unavailable
- Stable, small JSON responses designed for individual visualizations
- Historical snapshots so graphs do not depend on upstream retention
- A clear distinction between public, private, and derived data

## Interaction ideas

- Graphs begin as quiet decorative elements but reveal exact values on interaction
- Clicking a statistic opens a deeper view with context
- Small annotations explain unusual peaks or meaningful periods
- Details remain accessible without requiring animation
- The site should still be useful with JavaScript disabled where practical

## Open questions

- Which statistics feel meaningfully personal rather than performative?
- Should detailed views live on the main page or have their own routes?
- How often should data refresh?
- Should commit counts follow GitHub contribution rules or count every authored
  commit reachable in an organization?
- Which information is safe to expose publicly?
- How should private activity contribute to public aggregates?

## Rough sequence

1. Finish the main-page typography, links, and layout.
2. Add the projects list.
3. Establish writing and post routes.
4. Replace the mock commit graph with real GitHub data.
5. Revisit the Atuin command visualization.
6. Prototype the personal statistics service with one or two data sources.
7. Add deeper statistics only when they have a compelling presentation.
