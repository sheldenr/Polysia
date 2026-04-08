#!/bin/bash

echo "🔍 Verifying no secrets before staging..."
echo ""

# Check if .env is ignored
if git check-ignore .env > /dev/null 2>&1; then
    echo "✅ .env is ignored"
else
    echo "❌ ERROR: .env is NOT ignored!"
    exit 1
fi

# Check .env.example for real secrets
if grep -q "rnaorhdiuvkgkvhgjgdx\|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.ey" .env.example 2>/dev/null; then
    echo "❌ ERROR: .env.example contains real secrets!"
    exit 1
else
    echo "✅ .env.example is clean (placeholders only)"
fi

# Check documentation files
for file in AUTH.md SUPABASE_SETUP.md; do
    if [ -f "$file" ]; then
        if grep -q "rnaorhdiuvkgkvhgjgdx" "$file" 2>/dev/null; then
            echo "❌ ERROR: $file contains real Supabase URL!"
            exit 1
        else
            echo "✅ $file is clean"
        fi
    fi
done

# Check that secret docs are ignored
for file in OAUTH_QUICK_START.md GOOGLE_OAUTH_SETUP.md google-oauth-setup.html; do
    if git check-ignore "$file" > /dev/null 2>&1; then
        echo "✅ $file is ignored (contains secrets)"
    else
        echo "⚠️  WARNING: $file is NOT ignored but may contain secrets"
    fi
done

echo ""
echo "✅ All checks passed! Safe to stage and commit."
echo ""
echo "Running: git add ."
git add .

echo ""
echo "📋 Files staged for commit:"
git diff --cached --name-status
echo ""
echo "🔐 Files ignored (not committed):"
git status --ignored --short | grep "^!!" | head -10

echo ""
echo "✅ Ready to commit! Run:"
echo "   git commit -m 'feat: add Supabase authentication with Google OAuth'"
echo "   git push"
