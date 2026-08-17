# M0 — Manual AWS Console Deployment Runbook & Resource Inventory

This document details the step-by-step procedure for manually deploying the **TicketDesk** API onto AWS ECS Fargate behind an Application Load Balancer using the AWS Management Console.

---

## 📋 Comprehensive Resource Inventory

To manually deploy the application, the following **14 AWS resources** must be created in order:

| # | Resource Type | Resource Name | Key Configuration Details |
|---|---------------|---------------|---------------------------|
| 1 | **VPC** | `ticketdesk-manual-vpc` | CIDR `10.0.0.0/16`, DNS Hostnames enabled |
| 2 | **Internet Gateway** | `ticketdesk-igw` | Attached to `ticketdesk-manual-vpc` |
| 3 | **Public Subnet 1** | `ticketdesk-pub-1` | CIDR `10.0.1.0/24`, AZ `ap-south-2a`, Auto-assign public IP |
| 4 | **Public Subnet 2** | `ticketdesk-pub-2` | CIDR `10.0.2.0/24`, AZ `ap-south-2b`, Auto-assign public IP |
| 5 | **Private Subnet 1** | `ticketdesk-priv-1` | CIDR `10.0.10.0/24`, AZ `ap-south-2a` |
| 6 | **Private Subnet 2** | `ticketdesk-priv-2` | CIDR `10.0.20.0/24`, AZ `ap-south-2b` |
| 7 | **Elastic IP** | `ticketdesk-nat-eip` | Scope: VPC |
| 8 | **NAT Gateway** | `ticketdesk-nat` | Placed in `ticketdesk-pub-1` with EIP attached |
| 9 | **Public Route Table** | `ticketdesk-pub-rt` | Route `0.0.0.0/0` -> Internet Gateway |
| 10 | **Private Route Table** | `ticketdesk-priv-rt` | Route `0.0.0.0/0` -> NAT Gateway |
| 11 | **ALB Security Group** | `ticketdesk-alb-sg` | Inbound: HTTP (Port 80) from `0.0.0.0/0` |
| 12 | **ECS Security Group** | `ticketdesk-ecs-sg` | Inbound: TCP (Port 8080) from `ticketdesk-alb-sg` |
| 13 | **Target Group** | `ticketdesk-tg` | Target type: IP, Port 8080, Health check `/api/health` |
| 14 | **Application Load Balancer** | `ticketdesk-alb` | Public internet-facing across Public Subnets 1 & 2 |
| 15 | **ECR Repository** | `ticketdesk` | Private container repository |
| 16 | **IAM Role** | `ecsTaskExecutionRole` | Trust policy: `ecs-tasks.amazonaws.com`, Attached policy: `AmazonECSTaskExecutionRolePolicy` |
| 17 | **ECS Cluster** | `ticketdesk-cluster` | Infrastructure: AWS Fargate |
| 18 | **ECS Task Definition** | `ticketdesk-task` | Fargate, 0.5 vCPU, 1GB RAM, Container Port 8080 |
| 19 | **ECS Service** | `ticketdesk-service` | Placed in Private Subnets 1 & 2, attached to Target Group |

---

## 🛠 Manual Execution Runbook (Step-by-Step)

### Step 1: Create Networking Infrastructure
1. Open **VPC Console** -> Click **Create VPC** (`10.0.0.0/16`).
2. Create **Internet Gateway** and attach to VPC.
3. Create 2 Public Subnets (`10.0.1.0/24`, `10.0.2.0/24`) and 2 Private Subnets (`10.0.10.0/24`, `10.0.20.0/24`).
4. Allocate Elastic IP and create **NAT Gateway** in `ticketdesk-pub-1`.
5. Configure Route Tables:
   - Associate Public Subnets with Route Table pointing `0.0.0.0/0` -> Internet Gateway.
   - Associate Private Subnets with Route Table pointing `0.0.0.0/0` -> NAT Gateway.

### Step 2: Create Security Groups
1. Create `ticketdesk-alb-sg`: Add inbound rule allowing HTTP (80) from `0.0.0.0/0`.
2. Create `ticketdesk-ecs-sg`: Add inbound rule allowing Custom TCP (8080) with source set to `ticketdesk-alb-sg`.

### Step 3: Create Target Group & Application Load Balancer
1. Go to **EC2 Console** -> **Target Groups** -> Create Target Group:
   - Target type: `IP addresses`, Protocol: `HTTP`, Port: `8080`.
   - Health check path: `/api/health`, Success code: `200`.
2. Go to **Load Balancers** -> Create ALB (`ticketdesk-alb`):
   - Scheme: `Internet-facing`, IP address type: `IPv4`.
   - Select VPC and check both Public Subnets.
   - Attach security group `ticketdesk-alb-sg`.
   - Listener: HTTP on Port 80 forwarding to `ticketdesk-tg`.

### Step 4: Containerize & Push to ECR
1. Go to **ECR Console** -> Create private repository `ticketdesk`.
2. Authenticate Docker, build image with SHA tag, and push:
   ```bash
   aws ecr get-login-password --region ap-south-2 | docker login --username AWS --password-stdin 379563252342.dkr.ecr.ap-south-2.amazonaws.com
   docker build -t ticketdesk:ec78414 .
   docker tag ticketdesk:ec78414 379563252342.dkr.ecr.ap-south-2.amazonaws.com/ticketdesk:ec78414
   docker push 379563252342.dkr.ecr.ap-south-2.amazonaws.com/ticketdesk:ec78414
   ```

### Step 5: Launch ECS Fargate Cluster & Service
1. Go to **ECS Console** -> Create Cluster `ticketdesk-cluster` (Fargate).
2. Create **Task Definition** `ticketdesk-task`:
   - Launch type: `FARGATE`, CPU: `0.5 vCPU (512)`, Memory: `1 GB (1024)`.
   - Container image: `379563252342.dkr.ecr.ap-south-2.amazonaws.com/ticketdesk:ec78414`.
   - Port mapping: `8080` (TCP).
   - Log driver: `awslogs`.
3. Deploy **ECS Service** `ticketdesk-service`:
   - Launch type: `FARGATE`, Desired tasks: `1`.
   - VPC: `ticketdesk-manual-vpc`, Subnets: Private Subnets 1 & 2.
   - Security Group: `ticketdesk-ecs-sg`, Public IP: `DISABLED`.
   - Load balancer: Select `ticketdesk-alb` and target group `ticketdesk-tg`.

---

## 🎯 Verification & Cleanup
- **Verification**: Query `http://<alb-dns-name>/api/health` -> HTTP 200 `{"status":"UP"}`.
- **Teardown**: Delete ECS Service, ECS Cluster, Task Definition, ALB, Target Group, ECR Repository, Security Groups, NAT Gateway, EIP, Subnets, IGW, and VPC.
