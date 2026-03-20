variable "cluster_name" {
  type        = string
  description = "Nombre del clúster EKS"
}

variable "cluster_version" {
  type        = string
  description = "Versión de Kubernetes"
  default     = "1.27"
}

variable "instance_types" {
  type        = list(string)
  description = "Tipos de instancias para los nodos worker"
  default     = ["t3.large"]
}

variable "desired_capacity" {
  type        = number
  description = "Número deseado de nodos worker"
  default     = 3
}

variable "min_size" {
  type        = number
  description = "Número mínimo de nodos worker"
  default     = 2
}

variable "max_size" {
  type        = number
  description = "Número máximo de nodos worker"
  default     = 5
}


variable "region" {
  type        = string
  description = "Región de AWS"
  default     = "us-east-1"
}

variable "availability_zones" {
  type        = list(string)
  description = "Lista de zonas de disponibilidad"
  default     = ["us-east-1a", "us-east-1b"] # Puedes cambiar las zonas de disponibilidad aquí
}

variable "vpc_cidr" {
  type        = string
  description = "Rango CIDR para la VPC"
  default     = "10.0.0.0/16" # Puedes cambiar el rango CIDR aquí
}