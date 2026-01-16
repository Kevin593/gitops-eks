#############################################
# VPC
#############################################

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "tfm-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.3.0/24", "10.0.4.0/24"]

  enable_dns_hostnames = true
  enable_nat_gateway   = true
  single_nat_gateway   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

#############################################
# EKS
#############################################

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name                             = var.cluster_name
  cluster_version                          = var.cluster_version

  enable_irsa = true
  
  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_group_defaults = {
    ami_type = "AL2_x86_64"
  }

  eks_managed_node_groups = {
    default = {
      name           = "worker-group-tfm"
      instance_types = ["t3.medium"]
      desired_size   = var.desired_capacity
      min_size       = var.min_size
      max_size       = var.max_size
    }
  }
}

#############################################
# Data sources EKS (ORDEN CORRECTO)
#############################################

data "aws_eks_cluster" "this" {
  depends_on = [module.eks]
  name       = module.eks.cluster_name
}

data "aws_eks_cluster_auth" "this" {
  depends_on = [module.eks]
  name       = module.eks.cluster_name
}

#############################################
# Providers Kubernetes / Helm
#############################################

provider "kubernetes" {
  host                   = data.aws_eks_cluster.this.endpoint
  cluster_ca_certificate = base64decode(
    data.aws_eks_cluster.this.certificate_authority[0].data
  )
  token = data.aws_eks_cluster_auth.this.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.this.endpoint
    cluster_ca_certificate = base64decode(
      data.aws_eks_cluster.this.certificate_authority[0].data
    )
    token = data.aws_eks_cluster_auth.this.token
  }
}

#############################################
# ArgoCD
#############################################

resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "7.3.6"
  namespace  = "argocd"

  create_namespace = true

  values = [<<EOF
server:
  service:
    type: LoadBalancer
EOF
  ]
}

#############################################
# Monitoring (Prometheus + Grafana)
#############################################

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "helm_release" "prometheus" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = "58.2.1"

  depends_on = [kubernetes_namespace.monitoring]

  values = [<<EOF
grafana:
  enabled: true
  service:
    type: LoadBalancer
EOF
  ]
}



