# Lambda Image Transformer

A serverless AWS Lambda@Edge function for image transformation using [Sharp](https://github.com/lovell/sharp). Deployed behind CloudFront, it dynamically resizes and converts images stored in S3 via URL query parameters.

## How It Works

CloudFront sends an origin request to Lambda@Edge. The Lambda function:

1. Parses the image request from S3
2. Applies transformations via Sharp
3. Returns the optimized image as a base64-encoded response
   
## Features

- Resize images with `w` (width) and `h` (height) query parameters
- Convert image formats using `format` (e.g., `webp`, `jpeg`)
- Optimized for AWS Lambda@Edge
- Caches transformed responses via CloudFront


### Example Request

https://your-distribution-id.cloudfront.net/uploads/dog.jpg?w=300&format=webp

Returns a 300px-wide WebP version of `dog.jpg` from S3.

---

## Deployment

1. Build the deployment package
Use Docker to compile Sharp for Lambda:

```bash
docker run -it --rm -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs18.x bash

# Inside container:
npm install
exit
Then:

zip -r lambda-image-transformer.zip .

2. Upload to Lambda (region us-east-1)
Upload the .zip in AWS Lambda Console

Publish a new version

Attach it to CloudFront (Origin Request trigger)

3. IAM Role Requirements
The Lambda execution role must allow:

{
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::your-bucket-name/*"
}
And its trust policy must allow:

"Principal": {
  "Service": ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
}
Logging
Logs are available in CloudWatch under us-east-1:

/aws/lambda/<FunctionName>
Make sure CloudFront forwards query strings to enable dynamic caching.

📄 License
MIT
