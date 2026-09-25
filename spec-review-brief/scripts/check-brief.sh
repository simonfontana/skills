#!/usr/bin/env bash
# Quick checks on a written brief. Uses only POSIX grep/awk/wc/find.
set -eu

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <brief.md> <change-dir>" >&2
  exit 2
fi
brief=$1
change_dir=$2
[ -f "$brief" ] || { echo "not a file: $brief" >&2; exit 2; }
[ -d "$change_dir" ] || { echo "not a directory: $change_dir" >&2; exit 2; }

failed=0

brief_words=$(wc -w < "$brief")
change_words=$(find "$change_dir" -type f -name '*.md' -exec cat {} + | wc -w)
if [ "$change_words" -eq 0 ]; then
  echo "no .md files with content under $change_dir" >&2
  exit 2
fi
if [ $((brief_words * 100)) -gt $((change_words * 75)) ]; then
  echo "FAIL length: the brief has $((brief_words)) words and the change has $((change_words)); cut the brief."
  failed=1
fi

if ! awk '
  !title && /^# / { title = 1; next }
  title && /^[[:space:]]*$/ { next }
  title { found = /^> \*\*Not part of the spec\.\*\*/; exit }
  END { exit !found }
' "$brief"; then
  echo "FAIL notice: the \"Not part of the spec\" notice is not directly under the title."
  failed=1
fi

if ! modal=$(awk '
  /^[[:space:]]*(```|~~~)/ { fenced = !fenced; next }
  fenced { next }
  /^[[:space:]]*>/ { next }
  { line = $0; gsub(/`[^`]*`/, "", line) }
  line ~ /(^|[^A-Za-z])(SHALL|MUST)([^A-Za-z]|$)/ { printf "  %d: %s\n", FNR, $0; bad = 1 }
  END { exit bad }
' "$brief"); then
  echo "FAIL modal verbs: SHALL or MUST outside a quote or code; rewrite these lines as prose:"
  echo "$modal"
  failed=1
fi

if [ "$failed" -eq 0 ]; then
  echo "OK: all checks passed."
fi
exit "$failed"
