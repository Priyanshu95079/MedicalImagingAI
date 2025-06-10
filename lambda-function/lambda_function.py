import json
import base64
import boto3
import os
from typing import Dict, Any
from botocore.exceptions import ClientError

# Initialize AWS clients
bedrock = boto3.client('bedrock-runtime')
s3 = boto3.client('s3')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda function handler for processing medical images.
    
    Args:
        event: The event data from API Gateway
        context: Lambda context object
    
    Returns:
        Dict containing the analysis results or error message
    """
    try:
        # Get the image data from the request
        body = json.loads(event['body'])
        image_data = body.get('image')
        
        if not image_data:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No image data provided'})
            }
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Store image in S3 (optional, for audit purposes)
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        if bucket_name:
            s3.put_object(
                Bucket=bucket_name,
                Key=f'uploads/{context.aws_request_id}.jpg',
                Body=image_bytes
            )
        
        # Prepare the prompt for Claude
        prompt = """You are a medical imaging expert. Analyze this medical image and provide:
1. A detailed description of what you observe
2. Any potential abnormalities or concerns
3. Recommendations for further analysis if needed
Please be thorough but concise in your analysis."""
        
        # Call Bedrock API
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                'prompt': prompt,
                'max_tokens': 1000,
                'temperature': 0.5,
                'top_p': 0.9,
                'stop_sequences': ['\n\n']
            })
        )
        
        # Parse and return the response
        response_body = json.loads(response['body'].read())
        analysis = response_body.get('completion', 'No analysis available')
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'analysis': analysis,
                'request_id': context.aws_request_id
            })
        }
        
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'AWS Service error: {str(e)}'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}'
            })
        } 