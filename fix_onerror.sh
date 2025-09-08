#!/bin/bash

# List of files to fix
files=(
    "src/app/(main)/master/global-settings/page.tsx"
    "src/app/(main)/master/global-oversight/page.tsx"
    "src/app/(main)/master/audit-master/page.tsx"
    "src/app/(main)/master/database-tools/page.tsx"
    "src/app/(main)/master/user-analytics/page.tsx"
    "src/app/(main)/master/audit-logs/page.tsx"
    "src/app/(main)/master/system-config/page.tsx"
    "src/app/(main)/master/performance/page.tsx"
    "src/app/(main)/master/system-monitor/page.tsx"
    "src/app/(main)/master/role-management/page.tsx"
    "src/app/(main)/master/security/page.tsx"
    "src/app/(main)/master/debug-console/page.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file"
        # Remove onError prop and its function
        sed -i '/onError={(error, errorInfo) => {/,/}},$/ {
            /onError={(error, errorInfo) => {/d
            /}}/d
            /console\.error/d
            /dbLogger\.error/d
        }' "$file"
        
        # Also remove any trailing commas from the previous line
        sed -i 's/,$//' "$file"
    fi
done

echo "All files fixed"
