#!/bin/bash
# Optimize background images for web
echo "Optimizing background images..."

# Install imagemagick if not present
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Optimize each background image
for img in public/bg*.jpg; do
    if [ -f "$img" ]; then
        echo "Optimizing $img..."
        convert "$img" -quality 80 -resize "1920x1080>" "${img%.jpg}_optimized.jpg"
        mv "${img%.jpg}_optimized.jpg" "$img"
    fi
done

echo "Image optimization complete!"
