#!/bin/bash
# Reassemble binary assets split into <128KB chunks (GitHub API single-call limit).
# Run from repo root: bash bin/restore-assets.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$ROOT/theme/fmd-wear-memories/assets/models"
cat "$ROOT"/bin-chunks/theme/fmd-wear-memories/assets/models/hoodie.glb.part* > "$ROOT/theme/fmd-wear-memories/assets/models/hoodie.glb"
echo "restored theme/fmd-wear-memories/assets/models/hoodie.glb"
mkdir -p "$ROOT/theme/fmd-wear-memories/assets/models"
cat "$ROOT"/bin-chunks/theme/fmd-wear-memories/assets/models/crewneck.glb.part* > "$ROOT/theme/fmd-wear-memories/assets/models/crewneck.glb"
echo "restored theme/fmd-wear-memories/assets/models/crewneck.glb"
mkdir -p "$ROOT/theme/fmd-wear-memories/assets/models"
cat "$ROOT"/bin-chunks/theme/fmd-wear-memories/assets/models/tshirt.glb.part* > "$ROOT/theme/fmd-wear-memories/assets/models/tshirt.glb"
echo "restored theme/fmd-wear-memories/assets/models/tshirt.glb"
mkdir -p "$ROOT/theme/fmd-wear-memories/assets/img"
cat "$ROOT"/bin-chunks/theme/fmd-wear-memories/assets/img/logo2x.png.part* > "$ROOT/theme/fmd-wear-memories/assets/img/logo2x.png"
echo "restored theme/fmd-wear-memories/assets/img/logo2x.png"
mkdir -p "$ROOT/theme/fmd-wear-memories/assets/img"
cat "$ROOT"/bin-chunks/theme/fmd-wear-memories/assets/img/booth-tent.webp.part* > "$ROOT/theme/fmd-wear-memories/assets/img/booth-tent.webp"
echo "restored theme/fmd-wear-memories/assets/img/booth-tent.webp"
echo DONE
