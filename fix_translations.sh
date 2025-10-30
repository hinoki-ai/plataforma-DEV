#!/bin/bash

# Script to systematically update all translation usage to use proper Divine Parsing Oracle

echo "Finding files that still use useLanguage..."

# Get list of files using useLanguage
files=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "useLanguage")

for file in $files; do
    echo "Processing $file..."
    
    # Replace import
    sed -i 's|import { useLanguage } from "@/components/language/LanguageContext";|import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";|g' "$file"
    
    # Replace hook usage - this is trickier as we need to determine the right namespace
    # For now, just replace with common namespace as default
    sed -i 's/const { t } = useLanguage();/const { t } = useDivineParsing(["common"]);/g' "$file"
    
done

echo "Translation fixes applied. You may need to manually adjust namespaces for specific components."
