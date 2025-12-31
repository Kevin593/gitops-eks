output "cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "Endpoint del clúster EKS"
}
