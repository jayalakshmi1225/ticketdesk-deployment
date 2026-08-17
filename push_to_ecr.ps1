param (
    [Parameter(Mandatory=$true)]
    [string]$AwsAccountId,

    [string]$AwsRegion = "ap-south-2"
)

# 1. Add AWS CLI & Docker to PATH
$env:PATH = "C:\Program Files\Amazon\AWSCLIV2;C:\Program Files\Docker\Docker\resources\bin;C:\Program Files\Git\cmd;" + $env:PATH

$COMMIT_SHA = (git rev-parse --short HEAD)
$ECR_REGISTRY = "${AwsAccountId}.dkr.ecr.${AwsRegion}.amazonaws.com"
$ECR_REPO_URI = "${ECR_REGISTRY}/ticketdesk"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> AWS Region: $AwsRegion" -ForegroundColor Cyan
Write-Host ">>> Current Commit SHA: $COMMIT_SHA" -ForegroundColor Cyan
Write-Host ">>> ECR Registry: $ECR_REGISTRY" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 2. Log in to AWS ECR
Write-Host ">>> Authenticating Docker with AWS ECR in region $AwsRegion..." -ForegroundColor Yellow
aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $ECR_REGISTRY
if ($LASTEXITCODE -ne 0) {
    Write-Host ">>> ERROR: Docker authentication with ECR failed." -ForegroundColor Red
    exit 1
}

# 3. Create ECR Repository if missing
Write-Host ">>> Creating ECR repository 'ticketdesk' in region $AwsRegion..." -ForegroundColor Yellow
aws ecr create-repository --repository-name ticketdesk --region $AwsRegion 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host ">>> ECR repository 'ticketdesk' created successfully." -ForegroundColor Green
} else {
    Write-Host ">>> ECR repository 'ticketdesk' already exists." -ForegroundColor Yellow
}

# 4. Tag & Push Docker Image
Write-Host ">>> Tagging image ticketdesk:$COMMIT_SHA -> ${ECR_REPO_URI}:${COMMIT_SHA}" -ForegroundColor Yellow
docker tag ticketdesk:$COMMIT_SHA "${ECR_REPO_URI}:${COMMIT_SHA}"

Write-Host ">>> Pushing image to ECR..." -ForegroundColor Yellow
docker push "${ECR_REPO_URI}:${COMMIT_SHA}"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Image pushed to ECR: ${ECR_REPO_URI}:${COMMIT_SHA}" -ForegroundColor Green
    Write-Host " View in AWS Console:" -ForegroundColor Green
    Write-Host " https://${AwsRegion}.console.aws.amazon.com/ecr/repositories/private/${AwsAccountId}/ticketdesk?region=${AwsRegion}" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host ">>> ERROR: Docker push failed." -ForegroundColor Red
}
