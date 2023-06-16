output "cluster_name" {
  value = module.morpheus_cluster.cluster_name
}

output "cluster_endpoint" {
  value = module.morpheus_cluster.cluster_endpoint
}

output "cluster_id" {
  value = module.morpheus_cluster.cluster_id
}

output "cluster_security_group_id" {
  value = module.morpheus_cluster.cluster_security_group_id
}

output "node_security_group_id" {
  value = module.morpheus_cluster.node_security_group_id
}
