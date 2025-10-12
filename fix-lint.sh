#!/bin/bash

# Fix script for common ESLint warnings

echo "Fixing common ESLint issues..."

# Find all TypeScript/TSX files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  # Skip if file doesn't exist
  [ ! -f "$file" ] && continue
  
  # Fix unused error variables in catch blocks - rename to _error
  sed -i 's/} catch (error) {/} catch (_error) {/g' "$file"
  sed -i "s/} catch (error) {/} catch (_error) {/g" "$file"
  
  echo "Processed: $file"
done

echo "Done! Please review changes and run 'npm run lint' to check remaining issues."
