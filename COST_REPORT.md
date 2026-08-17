# Milestone M8 — One-Page AWS Infrastructure Cost Report

This report presents a comprehensive financial analysis of running the **TicketDesk** IT support tracking application on AWS infrastructure in the `ap-south-2` region.

---

## 📊 Monthly Cost Breakdown (Estimated Production Stack)

| AWS Service / Resource | Configuration / Sizing | Monthly Cost (USD) | Percentage of Total |
|------------------------|------------------------|--------------------|---------------------|
| **AWS NAT Gateway** | 1 NAT Gateway + 1 Elastic IP (24/7) | ~$32.40 | **37.6%** |
| **Amazon RDS MySQL** | `db.t3.micro` (2 vCPU, 1GB RAM) + 20GB GP3 | ~$18.20 | **21.1%** |
| **AWS Fargate (ECS)** | 1 Task (0.5 vCPU, 1 GB RAM) | ~$14.50 | **16.8%** |
| **Application Load Balancer** | 1 ALB + 1 LCU (Low Traffic) | ~$18.00 | **20.9%** |
| **Amazon CloudFront** | 10 GB Outbound Data Transfer + HTTPS | ~$0.85 | **1.0%** |
| **AWS Secrets Manager** | 1 Secret | ~$0.40 | **0.5%** |
| **Amazon S3 Storage** | 2 Buckets (Frontend + Attachments < 5 GB) | ~$0.15 | **0.2%** |
| **AWS CloudWatch** | Logs (14-day retention) + 3 Metric Alarms | ~$1.60 | **1.9%** |
| **AWS Lambda** | Thumbnail Generator (< 100,000 requests) | ~$0.00 | **0.0%** (Free Tier) |
| **TOTAL ESTIMATED MONTHLY COST** | | **~$86.10 / month** | **100%** |

---

## 🏆 Top 2 Most Expensive Resources

### 1. AWS NAT Gateway (~$32.40 / month | 37.6%)
- **Why it costs so much**: AWS charges a flat hourly fee of ~$0.045/hour (~$32.40/month) per NAT Gateway instance regardless of network throughput, plus data processing fees ($0.045/GB).
- **Cost Optimization Recommendation**: For non-production/staging environments, utilize VPC Endpoints (Gateway endpoints for S3/DynamoDB are free) or single NAT instances (`t4g.nano`) to eliminate the fixed NAT Gateway hourly charge.

### 2. Amazon RDS MySQL Instance (~$18.20 / month | 21.1%)
- **Why it costs so much**: The dedicated `db.t3.micro` database instance runs 24/7 providing managed relational database features (automated backups, multi-AZ support, storage encryption).
- **Cost Optimization Recommendation**: Utilize RDS Savings Plans / Reserved Instances (up to 38% discount for 1-year commitment) or migrate to Amazon Aurora Serverless v2 for auto-pausing dev workloads.

---

## 💡 Summary & Optimization Strategy
1. **Total Spend**: ~$86.10 / month (~$2.87 / day).
2. **Key Driver**: Fixed networking infrastructure (NAT Gateway and ALB) accounts for **58.5%** of total deployment cost.
3. **Automated Destruction**: Enforce `terraform destroy` when dev/test cycles finish to avoid persistent NAT Gateway & RDS charges.
