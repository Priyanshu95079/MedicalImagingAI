# Deployment Guide

This guide outlines the steps to deploy the Medical Imaging Expert AI application on AWS.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Python 3.8+ installed
4. Git installed

## Step 1: AWS Setup

1. Create an S3 bucket for image storage:

```bash
aws s3 mb s3://medical-imaging-ai-uploads
```

2. Create an IAM role for Lambda:

```bash
aws iam create-role \
    --role-name MedicalImagingLambdaRole \
    --assume-role-policy-document file://backend/lambda-role-policy.json
```

3. Attach necessary policies to the Lambda role:

```bash
aws iam attach-role-policy \
    --role-name MedicalImagingLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
    --role-name MedicalImagingLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
    --role-name MedicalImagingLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

## Step 2: Deploy Lambda Function

1. Create a deployment package:

```bash
cd backend
pip install -r requirements.txt -t .
zip -r ../lambda-deployment.zip .
```

2. Create the Lambda function:

```bash
aws lambda create-function \
    --function-name medical-imaging-analyzer \
    --runtime python3.8 \
    --handler lambda_function.lambda_handler \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/MedicalImagingLambdaRole \
    --zip-file fileb://lambda-deployment.zip \
    --environment Variables={S3_BUCKET_NAME=medical-imaging-ai-uploads}
```

## Step 3: Set up API Gateway

1. Create a new REST API:

```bash
aws apigateway create-rest-api \
    --name "Medical Imaging API" \
    --description "API for medical image analysis"
```

2. Create a resource and method:

```bash
# Get the API ID and root resource ID
API_ID=$(aws apigateway get-rest-apis --query 'items[?name==`Medical Imaging API`].id' --output text)
ROOT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path==`/`].id' --output text)

# Create a new resource
aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part "analyze"

# Create POST method
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE

# Create Lambda integration
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:YOUR_REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:YOUR_REGION:YOUR_ACCOUNT_ID:function:medical-imaging-analyzer/invocations
```

3. Deploy the API:

```bash
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod
```

## Step 4: Deploy Frontend

1. Update the API endpoint in `frontend/app.js`:

```javascript
const API_ENDPOINT =
  "https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/analyze";
```

2. Deploy to EC2:

```bash
# Launch EC2 instance
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --instance-type t2.micro \
    --key-name YOUR_KEY_PAIR \
    --security-group-ids YOUR_SECURITY_GROUP_ID \
    --user-data file://ec2-setup.sh

# Copy frontend files to EC2
scp -r frontend/* ec2-user@YOUR_EC2_IP:/var/www/html/
```

## Step 5: Configure Nginx

1. Install Nginx on EC2:

```bash
sudo yum update -y
sudo yum install nginx -y
```

2. Configure Nginx:

```bash
sudo nano /etc/nginx/conf.d/medical-imaging.conf
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Start Nginx:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 6: Testing

1. Access the application at `http://YOUR_EC2_IP`
2. Upload a medical image
3. Verify the analysis results

## Troubleshooting

1. Check Lambda logs:

```bash
aws logs get-log-events \
    --log-group-name /aws/lambda/medical-imaging-analyzer \
    --log-stream-name $(aws logs describe-log-streams --log-group-name /aws/lambda/medical-imaging-analyzer --query 'logStreams[0].logStreamName' --output text)
```

2. Check API Gateway logs:

```bash
aws logs get-log-events \
    --log-group-name /aws/apigateway/Medical-Imaging-API \
    --log-stream-name $(aws logs describe-log-streams --log-group-name /aws/apigateway/Medical-Imaging-API --query 'logStreams[0].logStreamName' --output text)
```

3. Check Nginx logs:

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```
