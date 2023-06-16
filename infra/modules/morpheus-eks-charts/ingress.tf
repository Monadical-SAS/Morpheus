

resource "helm_release" "ingress_nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  timeout    = 300

  values = [<<EOF
controller:
  admissionWebhooks:
    enabled: false
  electionID: ingress-controller-leader-internal
  ingressClass: nginx
  podLabels:
    app: ingress-nginx
  service:
    annotations:
      service.beta.kubernetes.io/aws-load-balancer-type: nlb
  scope:
    enabled: true
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: morpheus-type
            operator: In
            values:
            - web
rbac:
  scope: true
EOF
  ]
}

resource "helm_release" "ingress_morpheus" {
  name       = "ingress-morpheus"
  chart = "${path.module}/helm/charts/morpheus-ingress"
  force_update = true
  depends_on = [
    helm_release.ingress_nginx
  ]
  values = [<<EOF
clientHost: ${ var.ingress_client_host }
apiHost: ${ var.ingress_api_host }
proxyBodySize: ${ var.ingress_proxy_body_size }
tlsSecretName: ${ var.ingress_tls_secret_name }
time: ${ timestamp() }
EOF
  ]
}
