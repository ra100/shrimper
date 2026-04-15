#!/usr/bin/env bash
# Harness v3 pre-tool hook shim
# Delegates to core if installed, otherwise no-op
set -euo pipefail

CORE_HOOK="${HARNESS_CORE:-$HOME/.claude/plugins/cache/claude-code-harness-marketplace/claude-code-harness}/core/src/index.ts"
if [[ -f "$CORE_HOOK" ]]; then
  exec npx tsx "$CORE_HOOK" pre-tool "$@"
fi
