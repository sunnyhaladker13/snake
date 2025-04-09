#!/bin/bash

# Create sounds directory if it doesn't exist
mkdir -p sounds

echo "Downloading sound files..."

# Download background music
curl -L "https://pixabay.com/sound-effects/calm-and-peaceful-electronic-ambient-music-116304/" -o sounds/background-music.mp3 || \
wget -O sounds/background-music.mp3 "https://pixabay.com/sound-effects/calm-and-peaceful-electronic-ambient-music-116304/"

# Download eat sound
curl -L "https://pixabay.com/sound-effects/apple-bite-180890/" -o sounds/eat.mp3 || \
wget -O sounds/eat.mp3 "https://pixabay.com/sound-effects/apple-bite-180890/"

# Download bonus sound
curl -L "https://pixabay.com/sound-effects/bonus-pickup-38507/" -o sounds/bonus.mp3 || \
wget -O sounds/bonus.mp3 "https://pixabay.com/sound-effects/bonus-pickup-38507/"

# Download multiplier sound
curl -L "https://pixabay.com/sound-effects/powerup-86480/" -o sounds/multiplier.mp3 || \
wget -O sounds/multiplier.mp3 "https://pixabay.com/sound-effects/powerup-86480/"

# Download game over sound
curl -L "https://pixabay.com/sound-effects/negative-beeps-6008/" -o sounds/game-over.mp3 || \
wget -O sounds/game-over.mp3 "https://pixabay.com/sound-effects/negative-beeps-6008/"

echo "Download complete!"
echo "If some files failed to download, please manually download them from the sound sources mentioned in sounds/placeholder.txt"

# Make the script executable
chmod +x "$0"
