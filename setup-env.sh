#!/bin/bash
# Project environment setup - prioritize local scripts over global commands
PROJECT_SCRIPTS="$(pwd)/scripts"
export PATH="$PROJECT_SCRIPTS:/mnt/Secondary/projects/scripts/vv:/mnt/Secondary/projects/scripts/zz:$PATH"

# Clear command hash to ensure new PATH is used (do this after PATH export)
hash -r

echo "✅ Project scripts loaded!"
echo "   zz = Start dev server (npm run dev)"
echo "   vv = Deployment shortcuts (--help for options)"
echo ""
echo "🚀 Ready to use: zz, vv --help"
echo ""
echo "💡 If commands not found, run: hash -r"
