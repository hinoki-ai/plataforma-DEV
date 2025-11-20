#!/bin/bash
# Project environment setup - prioritize local scripts over global commands
PROJECT_SCRIPTS="$(pwd)/scripts"
export PATH="$PROJECT_SCRIPTS:$PATH"

# Clear command hash to ensure new PATH is used
hash -r

echo "✅ Project scripts loaded!"
echo "   zz = Start dev server (npm run dev)"
echo "   vv = Deployment shortcuts (--help for options)"
echo ""
echo "🚀 Ready to use: zz, vv --help"
