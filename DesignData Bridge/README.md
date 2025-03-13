# DesignData Bridge

A tool for connecting design components to data models and creating meaningful relationships between them.

## Features

- Import Figma designs and map UI components to data elements
- Create and visualize data relationships between components
- Define and manage data schemas with visual representation
- Add comments and annotations with @mentions
- Optional Jira integration for issue tracking
- Schema visualization with optional dependencies

## Quick Start

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Optional Features

### Schema Visualization

To enable schema visualization, install the optional dependencies:

```bash
npm install graphology graphology-layout graphology-layout-force sigma
```

### Jira Integration

To enable Jira integration, install the optional dependency:

```bash
npm install jira.js
```

## Deployment

### AWS Deployment

1. Build the Docker image:
```bash
npm run docker:build
```

2. Push to Amazon ECR:
```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com
docker tag data-lineage-bridge:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/data-lineage-bridge:latest
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/data-lineage-bridge:latest
```

3. Deploy to ECS/EKS using the provided Docker image

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_FIGMA_ACCESS_TOKEN=your_figma_token
VITE_JIRA_HOST=https://your-domain.atlassian.net
VITE_JIRA_EMAIL=your-email
VITE_JIRA_API_TOKEN=your-api-token
VITE_JIRA_PROJECT=project-key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT