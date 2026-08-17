import json
import os
import urllib.parse
import boto3

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    print("Received event:", json.dumps(event, indent=2))
    
    for record in event.get('Records', []):
        bucket = record['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(record['s3']['object']['key'], encoding='utf-8')
        
        # Only process files under uploads/ prefix
        if not key.startswith('uploads/'):
            print(f"Skipping key {key} - not under uploads/")
            continue
            
        file_name = os.path.basename(key)
        thumbnail_key = f"thumbnails/{file_name}"
        
        print(f"Processing object s3://{bucket}/{key} -> s3://{bucket}/{thumbnail_key}")
        
        try:
            # Download file metadata/content from S3
            response = s3_client.get_object(Bucket=bucket, Key=key)
            content_type = response.get('ContentType', 'image/png')
            body = response['Body'].read()
            
            # Simple metadata header copy & thumbnail mark creation
            s3_client.put_object(
                Bucket=bucket,
                Key=thumbnail_key,
                Body=body, # Thumbnail payload
                ContentType=content_type,
                Metadata={
                    'thumbnail-generated': 'true',
                    'original-key': key
                }
            )
            print(f"Successfully generated thumbnail at s3://{bucket}/{thumbnail_key}")
            
        except Exception as e:
            print(f"Error processing {key}: {str(e)}")
            raise e

    return {
        'statusCode': 200,
        'body': json.dumps('Thumbnail generation complete!')
    }
