#!/bin/bash
# Build hello-world demo extension from modular source files.
# Output: ../output/hello-world.bundle.jsx (paste this into Airtable Edit Source)
#
# Concatenation order (no forward references — flat scope after concat):
#   shared deps → brand → constants → helpers → components → theme
#   → ext constants → views → app → ext theme (initializeBlock last)

set -e
shopt -s nullglob   # empty views/ glob expands to nothing instead of literal
cd "$(dirname "$0")"

cat \
  ../shared/cdn-loader.jsx \
  ../shared/brand.config.jsx \
  ../shared/constants.jsx \
  ../shared/helpers.jsx \
  ../shared/components.jsx \
  ../shared/theme.jsx \
  constants.jsx \
  views/*.jsx \
  app.jsx \
  theme.jsx \
  > ../output/hello-world.bundle.jsx

echo "✓ Built output/hello-world.bundle.jsx ($(wc -l < ../output/hello-world.bundle.jsx | tr -d ' ') lines)"
