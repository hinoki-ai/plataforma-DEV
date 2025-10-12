#!/bin/bash

# Fix error variable reference issues
# Changes catch (_error) to catch (error) so error references work

echo "Fixing error variable references..."

# Find all TypeScript/TSX files and replace catch (_error) with catch (error)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/catch (_error)/catch (error)/g' {} +

echo "Fixed error variable references in src/ directory"

# Also check convex directory
if [ -d "convex" ]; then
  find convex -type f -name "*.ts" -exec sed -i 's/catch (_error)/catch (error)/g' {} +
  echo "Fixed error variable references in convex/ directory"
fi

echo "Done!"
