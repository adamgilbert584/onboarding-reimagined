#!/bin/bash

# Edge Functions Deployment Script
# Run this on your local machine after downloading the supabase/functions directory

set -e

echo "🚀 Deploying Veriff Portal Edge Functions"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Please install it first:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Windows: scoop install supabase"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Check if we're in the right directory
if [ ! -d "supabase/functions" ]; then
    echo "❌ Error: supabase/functions directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✓ Edge functions directory found"
echo ""

# Check if linked to project
PROJECT_REF=$(supabase status 2>/dev/null | grep "Project ref:" | awk '{print $3}')
if [ -z "$PROJECT_REF" ]; then
    echo "⚠️  Not linked to a Supabase project"
    echo "Please run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✓ Linked to project: $PROJECT_REF"
echo ""

# Deploy functions
FUNCTIONS=(
    "admin-login"
    "get-branding"
    "update-branding"
    "upload-file"
    "create-veriff-session"
    "get-verifications"
    "veriff-webhook"
)

echo "Deploying 7 edge functions..."
echo ""

DEPLOYED=0
FAILED=0

for FUNC in "${FUNCTIONS[@]}"; do
    echo "Deploying $FUNC..."
    if supabase functions deploy "$FUNC" --no-verify-jwt; then
        echo "✓ $FUNC deployed successfully"
        ((DEPLOYED++))
    else
        echo "✗ $FUNC deployment failed"
        ((FAILED++))
    fi
    echo ""
done

echo "=========================================="
echo "Deployment Summary:"
echo "  ✓ Successful: $DEPLOYED"
if [ $FAILED -gt 0 ]; then
    echo "  ✗ Failed: $FAILED"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All functions deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Add secrets to Supabase Dashboard"
    echo "2. Create database tables"
    echo "3. Create storage buckets"
    echo "4. Configure Veriff webhook"
    echo ""
    echo "See DEPLOYMENT_INSTRUCTIONS.md for details"
else
    echo "⚠️  Some deployments failed. Check the output above for details."
    exit 1
fi
