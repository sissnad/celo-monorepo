{{/* vim: set filetype=mustache: */}}
{{/*
The name of the deployment
*/}}
{{- define "name" -}}
{{- .Values.environment.cluster.name -}}
{{- end -}}

{{/*
Common labels that are recommended to be used by Helm and Kubernetes
*/}}
{{- define "labels" -}}
app.kubernetes.io/name: {{ template "name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Annotations to indicate to the prometheus server that this node should be scraped for metrics
*/}}
{{- define "metric-annotations" -}}
prometheus.io/scrape: "true"
prometheus.io/port: "{{ .Values.relayer.metrics.prometheusPort }}"
{{- end -}}

{{/*
Label specific to the odis signer component
*/}}
{{- define "odis-signer-component-label" -}}
app.kubernetes.io/component: odis-signer
{{- end -}}

{{/*
The name of the azure identity binding for the odis signer
*/}}
{{- define "azure-identity-binding-name" -}}
{{- template "name" . -}}-identity-binding
{{- end -}}

{{/*
The name of the azure identity for the odis signer
*/}}
{{- define "azure-identity-name" -}}
{{- template "name" . -}}-identity
{{- end -}}

{{/*
The name of the K8s Service Account
*/}}
{{- define "k8s-service-account" -}}
{{- default (include "name" .) .Values.k8sServiceAccountNameOverride -}}
{{- end -}}

{{/*
GCP Cloud sql proxy container
*/}}
{{- define "cloudsql-container" -}}
- command:
  - /cloud_sql_proxy
  - -instances=celo-testnet-production:us-west1:alfajores2-replica=tcp:5432
  - -instances={{ .Values.gcpCloudSQLConnectionString }}
  - -term_timeout=30s
  image: gcr.io/cloudsql-docker/gce-proxy:1.19.1
  imagePullPolicy: IfNotPresent
  name: cloudsql-proxy
  resources:
    requests:
      cpu: 200m
      memory: 250Mi
  securityContext:
    allowPrivilegeEscalation: false
    runAsUser: 2
  terminationMessagePath: /dev/termination-log
  terminationMessagePolicy: File
{{- end -}}

