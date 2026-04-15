#!/usr/bin/env bash
set -euo pipefail

# Run from docker/ by default; switch to repo root to ensure correct context
root_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root_dir"

echo "Running pnpm run build..."
pnpm run build

# Read name and version from package.json
name=$(pnpm show ./ name)
version=$(pnpm show ./ version)

image_tag="${name}:${version}"

echo "Building Docker image ${image_tag}..."
docker build -f docker/Dockerfile -t "${image_tag}" .

echo "Built ${image_tag}"
