# Medical Imaging Expert AI Agent

An intelligent AI agent that analyzes medical images using AWS Bedrock's Claude 3 Sonnet model to provide detailed medical insights.

## Project Overview

This project implements a web-based application that allows users to upload medical images (X-rays, MRIs, etc.) and receive AI-powered analysis and insights. The system leverages AWS Bedrock's multimodal capabilities to provide detailed medical observations and potential findings.

## Architecture

- Frontend: HTML/CSS/JavaScript web interface
- Backend: AWS Lambda (Python)
- Storage: Amazon S3
- AI Model: Claude 3 Sonnet via Amazon Bedrock
- API: Amazon API Gateway
- Deployment: AWS EC2

## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/yourusername/MedicalImagingAI.git
cd MedicalImagingAI
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure AWS credentials:

- Set up AWS CLI with appropriate credentials
- Configure IAM roles for S3, Lambda, and Bedrock access

4. Deploy the application:

- Follow the deployment instructions in `docs/deployment.md`

## Project Structure

```
MedicalImagingAI/
├── frontend/           # Web interface files
├── backend/           # Lambda function code
├── docs/             # Documentation
├── tests/            # Test files
├── requirements.txt  # Python dependencies
└── README.md        # This file
```

## Features

- Medical image upload and analysis
- AI-powered insights using Claude 3 Sonnet
- Secure image storage in S3
- RESTful API interface
- Responsive web UI

## Security Considerations

- All medical images are stored securely in S3
- No PHI (Protected Health Information) is stored
- AWS IAM roles for secure service access
- HTTPS encryption for all communications

## License

MIT License

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
