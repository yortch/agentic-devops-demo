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

# Assign Storage Blob Data Contributor to current user for Azure AD backend auth
CURRENT_USER_ID=$(az ad signed-in-user show --query id -o tsv 2>/dev/null || true)
if [ -n "$CURRENT_USER_ID" ]; then
  STORAGE_ACCOUNT_ID=$(az storage account show \
    --name "$TFSTATE_SA" \
    --resource-group "$TFSTATE_RG" \
    --query id -o tsv)
  az role assignment create \
    --assignee "$CURRENT_USER_ID" \
    --role "Storage Blob Data Contributor" \
    --scope "$STORAGE_ACCOUNT_ID" \
    --output none 2>/dev/null || true
fi

# Use Azure AD auth for Terraform backend (configured in provider.conf.json)
echo "==> Environment configured. You can now run: azd up"
