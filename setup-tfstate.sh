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

# Get storage account key for Terraform backend auth
ACCOUNT_KEY=$(az storage account keys list \
  --account-name "$TFSTATE_SA" \
  --resource-group "$TFSTATE_RG" \
  --query '[0].value' -o tsv)
export ARM_ACCESS_KEY="$ACCOUNT_KEY"

echo "==> Environment configured. You can now run: azd up"
