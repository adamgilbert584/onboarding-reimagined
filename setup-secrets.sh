#!/bin/bash

# Secrets Setup Helper Script
# This script helps you securely collect and validate your secrets

set -e

TEMPLATE_FILE=".secrets.template"
SECRETS_FILE=".secrets.local"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    print_error "Template file $TEMPLATE_FILE not found!"
    exit 1
fi

print_header "Veriff Portal - Secrets Setup Helper"

# Step 1: Create .secrets.local if it doesn't exist
if [ ! -f "$SECRETS_FILE" ]; then
    print_info "Creating $SECRETS_FILE from template..."
    cp "$TEMPLATE_FILE" "$SECRETS_FILE"
    print_success "Created $SECRETS_FILE"
    echo
    print_warning "⚠️  IMPORTANT: Fill in your secrets in $SECRETS_FILE before continuing"
    print_warning "⚠️  This file is in .gitignore and will NOT be committed"
    echo
    print_info "Opening $SECRETS_FILE in your default editor..."
    sleep 2

    # Try to open in editor
    if command -v code &> /dev/null; then
        code "$SECRETS_FILE"
    elif command -v nano &> /dev/null; then
        nano "$SECRETS_FILE"
    elif command -v vim &> /dev/null; then
        vim "$SECRETS_FILE"
    else
        print_warning "No editor found. Please manually edit $SECRETS_FILE"
    fi

    echo
    print_info "After filling in your secrets, run this script again to validate them."
    exit 0
fi

# Step 2: Validate secrets
print_header "Validating Secrets"

# Source the secrets file (but don't export)
source "$SECRETS_FILE" 2>/dev/null || true

VALIDATION_PASSED=true

# Validate ADMIN_PASSWORD
echo -n "Checking ADMIN_PASSWORD... "
if [ -z "$ADMIN_PASSWORD" ]; then
    print_error "Not set"
    VALIDATION_PASSED=false
elif [ ${#ADMIN_PASSWORD} -lt 8 ]; then
    print_warning "Too short (min 8 chars recommended)"
    VALIDATION_PASSED=false
else
    print_success "OK (${#ADMIN_PASSWORD} chars)"
fi

# Validate JWT_SECRET
echo -n "Checking JWT_SECRET... "
if [ -z "$JWT_SECRET" ]; then
    print_error "Not set"
    VALIDATION_PASSED=false
elif [ ${#JWT_SECRET} -ne 64 ]; then
    print_error "Wrong length (must be exactly 64 chars, found ${#JWT_SECRET})"
    VALIDATION_PASSED=false
elif ! [[ "$JWT_SECRET" =~ ^[0-9a-fA-F]+$ ]]; then
    print_error "Invalid format (must be hexadecimal)"
    VALIDATION_PASSED=false
else
    print_success "OK (64 hex chars)"
fi

# Validate VERIFF_API_KEY
echo -n "Checking VERIFF_API_KEY... "
if [ -z "$VERIFF_API_KEY" ]; then
    print_error "Not set"
    VALIDATION_PASSED=false
else
    print_success "OK"
fi

# Validate VERIFF_API_SECRET
echo -n "Checking VERIFF_API_SECRET... "
if [ -z "$VERIFF_API_SECRET" ]; then
    print_error "Not set"
    VALIDATION_PASSED=false
else
    print_success "OK"
fi

# Validate Supabase URL
echo -n "Checking VITE_SUPABASE_URL... "
if [ -z "$VITE_SUPABASE_URL" ]; then
    print_error "Not set"
    VALIDATION_PASSED=false
elif ! [[ "$VITE_SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    print_warning "Format looks incorrect (should be https://xxxxx.supabase.co)"
    VALIDATION_PASSED=false
else
    print_success "OK"
fi

# Validate Supabase Anon Key
echo -n "Checking VITE_SUPABASE_ANON_KEY... "
if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    print_error "Not set"
    VALIDATION_PASSED=false
elif ! [[ "$VITE_SUPABASE_ANON_KEY" =~ ^eyJ ]]; then
    print_warning "Format looks incorrect (should start with 'eyJ')"
    VALIDATION_PASSED=false
else
    print_success "OK"
fi

echo

if [ "$VALIDATION_PASSED" = false ]; then
    print_error "Validation failed! Please fix the issues above."
    print_info "Edit $SECRETS_FILE and run this script again."
    exit 1
fi

print_success "All secrets validated successfully!"
echo

# Step 3: Generate .env file
print_header "Generating .env File"

cat > "$ENV_FILE" << EOF
# Supabase Configuration
# Generated on $(date)
# DO NOT COMMIT THIS FILE

VITE_SUPABASE_URL=$VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
EOF

print_success "Created $ENV_FILE with Supabase configuration"
echo

# Step 4: Generate instructions for Supabase
print_header "Next Steps: Add Secrets to Supabase"

echo "Copy these values to Supabase Dashboard → Project Settings → Edge Functions → Secrets:"
echo
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo -e "${GREEN}Name:${NC} ADMIN_PASSWORD"
echo -e "${GREEN}Value:${NC} $ADMIN_PASSWORD"
echo
echo -e "${GREEN}Name:${NC} JWT_SECRET"
echo -e "${GREEN}Value:${NC} $JWT_SECRET"
echo
echo -e "${GREEN}Name:${NC} VERIFF_API_KEY"
echo -e "${GREEN}Value:${NC} $VERIFF_API_KEY"
echo
echo -e "${GREEN}Name:${NC} VERIFF_API_SECRET"
echo -e "${GREEN}Value:${NC} $VERIFF_API_SECRET"
echo
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Step 5: Security reminders
print_header "Security Reminders"

print_warning "After adding secrets to Supabase:"
echo "  1. Store secrets in a password manager (1Password, Bitwarden, etc.)"
echo "  2. Delete $SECRETS_FILE: rm $SECRETS_FILE"
echo "  3. The .env file is already in .gitignore (safe to keep locally)"
echo "  4. Never commit secrets to Git"
echo

print_success "Setup complete! Follow the instructions above to finish."
