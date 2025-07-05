# workpal-agent

## System Architecture

![System Architecture](assets/system-arch.png)

## Folder Descriptions
- `activity-buffer`: Smart filtering service for ActivityWatch data (TypeScript/Node microservice).
- `activitywatch`: Upstream ActivityWatch time-tracking suite included as a git submodule for collecting raw activity data.
- `assets`: Static assets such as diagrams and images used in documentation.
- `screen-overlay`: (WIP) Front-end overlay components for displaying real-time status and controls on screen.
- `smart-response`: Microservice that analyses ActivityWatch data and generates context-aware responses via the agents doodle API.
- `webhook-example-main`: Example Express server that validates signed webhooks and returns demo responses.