#!/usr/bin/env bash
# Bootstrap Terraform remote-state storage and configure azd environment.
#
# Usage (bash):   source ./setup-tfstate.sh
# Usage (run azd): source ./setup-tfstate.sh && azd up

set -euo pipefail

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUB_CLEAN=$(echo "$SUBSCRIPTION_ID" | tr -d '-' | cut -c1-12)

TFSTATE_RG="rg-tfstate"
TFSTATE_SA="sttf${SUB_CLEAN}"
TFSTATE_CONTAINER="tfstate"
LOCATION="${AZURE_LOCATION:-eastus2}"

echo "==> Terraform state backend"
echo "    Resource group:  $TFSTATE_RG"
echo "    Storage account: $TFSTATE_SA"
echo "    Container:       $TFSTATE_CONTAINER"
echo "    Location:        $LOCATION"

# Create resources (idempotent)
az group create \
  --name "$TFSTATE_RG" \
  --location "$LOCATION" \
  --output none

az storage account create \
  --name "$TFSTATE_SA" \
  --resource-group "$TFSTATE_RG" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --allow-blob-public-access false \
  --output none 2>/dev/null || true

az storage container create \
  --name "$TFSTATE_CONTAINER" \
  --account-name "$TFSTATE_SA" \
  --auth-mode login \
  --output none 2>/dev/null || true

# Store values in azd environment (required for provider.conf.json substitution)
azd env set RS_STORAGE_ACCOUNT "$TFSTATE_SA" 2>/dev/null || true
azd env set RS_CONTAINER_NAME "$TFSTATE_CONTAINER" 2>/dev/null || true
azd env set RS_RESOURCE_GROUP "$TFSTATE_RG" 2>/dev/null || true

# Assign Storage Blob Data Contributor for Azure AD backend auth
STORAGE_ACCOUNT_ID=$(az storage account show \
  --name "$TFSTATE_SA" \
  --resource-group "$TFSTATE_RG" \
  --query id -o tsv)

# Detect identity: user (local) vs service principal (CI)
PRINCIPAL_ID=""
PRINCIPAL_TYPE=""
if [ -n "${ARM_CLIENT_ID:-}" ]; then
  # CI: ARM_CLIENT_ID is set — look up the service principal object ID
  PRINCIPAL_ID=$(az ad sp show --id "$ARM_CLIENT_ID" --query id -o tsv 2>/dev/null || true)
  PRINCIPAL_TYPE="ServicePrincipal"
fi
if [ -z "$PRINCIPAL_ID" ]; then
  # Local: fall back to signed-in user
  PRINCIPAL_ID=$(az ad signed-in-user show --query id -o tsv 2>/dev/null || true)
  PRINCIPAL_TYPE="User"
fi

if [ -n "$PRINCIPAL_ID" ]; then
  echo "    Assigning Storage Blob Data Contributor to $PRINCIPAL_TYPE $PRINCIPAL_ID..."
  az role assignment create \
    --assignee-object-id "$PRINCIPAL_ID" \
    --assignee-principal-type "$PRINCIPAL_TYPE" \
    --role "Storage Blob Data Contributor" \
    --scope "$STORAGE_ACCOUNT_ID" \
    --output none 2>/dev/null || true
  echo "    Waiting 30s for role assignment propagation..."
  sleep 30
else
  echo "    WARNING: Could not determine current identity for role assignment."
fi

echo "==> Environment configured. You can now run: azd up"
