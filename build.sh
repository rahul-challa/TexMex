#!/bin/bash

# TexMex Build Script
# This script builds and packages the TexMex VS Code extension

set -e

echo "🔨 TexMex Build Script"
echo "====================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Step 1: Install dependencies
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
npm install

# Step 2: Compile TypeScript
echo -e "${BLUE}Step 2: Compiling TypeScript...${NC}"
npm run compile

# Step 3: Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo -e "${YELLOW}Installing VS Code packaging tool (vsce)...${NC}"
    npm install -g @vscode/vsce
fi

# Step 4: Package the extension
echo -e "${BLUE}Step 3: Packaging extension...${NC}"
npm run package

# Find the generated .vsix file
VSIX_FILE=$(find . -maxdepth 1 -name "texmex-*.vsix" | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ Failed to find .vsix file"
    exit 1
fi

echo -e "${GREEN}✓ Build successful!${NC}"
echo -e "${GREEN}✓ Extension packaged: $(basename $VSIX_FILE)${NC}"
echo ""
echo "📦 Installation Instructions:"
echo "1. Open VS Code"
echo "2. Press Ctrl+Shift+X (or Cmd+Shift+X on Mac)"
echo "3. Click the ... menu → Install from VSIX..."
echo "4. Select: $VSIX_FILE"
echo ""
echo "🚀 To get started:"
echo "1. Open a .tex file"
echo "2. Press Ctrl+Shift+P"
echo "3. Type 'TexMex: Open Live Preview'"
echo ""
