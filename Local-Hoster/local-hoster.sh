#!/usr/bin/env bash

# zz – Dev server reset and start (standardized UI like vv)

set -Eeuo pipefail
IFS=$'\n\t'

# Default to raw UI (no external wrapper) unless explicitly enabled
export VV_DISABLE_UI=${VV_DISABLE_UI:-true}

# Early auto-wrap disabled (always render raw corners)
:

# Colors (honor NO_COLOR) – aligned with vv (explicit ESC)
if [[ -n "${NO_COLOR:-}" ]]; then
  NC=""; COLOR_PRIMARY=""; COLOR_ACCENT=""; COLOR_SUCCESS=""; COLOR_SUCCESS_BRIGHT=""; COLOR_WARN=""; COLOR_ERROR=""; COLOR_ERROR_BRIGHT=""; COLOR_MUTED=""; COLOR_PURPLE_BRIGHT=""; COLOR_PINK_SOFT=""; BLUE="";
else
  ESC=$'\033'
  NC="${ESC}[0m"
  COLOR_PRIMARY="${ESC}[38;5;${VV_COLOR_PRIMARY:-208}m"
  COLOR_ACCENT="${ESC}[38;5;${VV_COLOR_ACCENT:-110}m"
  COLOR_SUCCESS="${ESC}[38;5;${VV_COLOR_SUCCESS:-71}m"
  COLOR_SUCCESS_BRIGHT="${ESC}[38;5;${VV_COLOR_SUCCESS_BRIGHT:-82}m"
  COLOR_WARN="${ESC}[38;5;${VV_COLOR_WARN:-178}m"
  COLOR_ERROR="${ESC}[38;5;${VV_COLOR_ERROR:-203}m"
  COLOR_ERROR_BRIGHT="${ESC}[38;5;${VV_COLOR_ERROR_BRIGHT:-196}m"
  COLOR_MUTED="${ESC}[38;5;${VV_COLOR_MUTED:-246}m"
  COLOR_PURPLE_BRIGHT="${ESC}[38;5;${VV_COLOR_PURPLE_BRIGHT:-141}m"
  COLOR_PINK_SOFT="${ESC}[38;5;${VV_COLOR_PINK_SOFT:-218}m"
  BLUE="${ESC}[0;34m"
fi

# Unicode / ASCII fallback
_ZZ_CHARMAP=$(locale charmap 2>/dev/null || echo "ANSI_X3.4-1968")
if [[ -n "${ZZ_ASCII:-}" ]] || [[ ! -t 1 ]] || [[ "${TERM:-}" == "dumb" ]] || ! echo "${_ZZ_CHARMAP}" | grep -qi 'utf-8'; then
  ZZ_UNICODE=false
  ZZ_BOX_H='-'; ZZ_BOX_V='|'
else
  ZZ_UNICODE=true
  ZZ_BOX_H='─'; ZZ_BOX_V='│'
fi

# UI icons (with ASCII fallbacks)
if [[ "$ZZ_UNICODE" == true ]]; then
  ICON_TRIANGLE='▲'
  ICON_CIRCLE='○'
  ICON_CHECK='✓'
else
  ICON_TRIANGLE='!'
  ICON_CIRCLE='o'
  ICON_CHECK='OK'
fi

# Icon options (configurable)
ZZ_ICONS=${ZZ_ICONS:-true}
ZZ_ICON_MATCH_LINE=${ZZ_ICON_MATCH_LINE:-false}
ZZ_ICON_WARN_COLOR="${ZZ_ICON_WARN_COLOR:-$COLOR_WARN}"
ZZ_ICON_INFO_COLOR="${ZZ_ICON_INFO_COLOR:-$COLOR_WARN}"
ZZ_ICON_SUCCESS_COLOR="${ZZ_ICON_SUCCESS_COLOR:-$COLOR_SUCCESS_BRIGHT}"
ZZ_ICON_ERROR_COLOR="${ZZ_ICON_ERROR_COLOR:-$COLOR_ERROR_BRIGHT}"
ZZ_ICON_STAGE_COLOR="${ZZ_ICON_STAGE_COLOR:-$COLOR_WARN}"

_zz_icon() {
  local kind="$1" glyph color
  case "$kind" in
    warn)    glyph="$ICON_TRIANGLE"; color=$([[ "$ZZ_ICON_MATCH_LINE" == true ]] && echo "$COLOR_WARN"          || echo "$ZZ_ICON_WARN_COLOR");;
    error)   glyph="$ICON_TRIANGLE"; color=$([[ "$ZZ_ICON_MATCH_LINE" == true ]] && echo "$COLOR_ERROR_BRIGHT"  || echo "$ZZ_ICON_ERROR_COLOR");;
    info)    glyph="$ICON_CIRCLE";  color=$([[ "$ZZ_ICON_MATCH_LINE" == true ]] && echo "$COLOR_WARN"          || echo "$ZZ_ICON_INFO_COLOR");;
    success) glyph="$ICON_CHECK";   color=$([[ "$ZZ_ICON_MATCH_LINE" == true ]] && echo "$COLOR_SUCCESS_BRIGHT" || echo "$ZZ_ICON_SUCCESS_COLOR");;
    stage)   glyph="$ICON_CIRCLE";  color=$([[ "$ZZ_ICON_MATCH_LINE" == true ]] && echo "$COLOR_WARN"          || echo "$ZZ_ICON_STAGE_COLOR");;
    *)       glyph=""; color="";;
  esac
  [[ "$ZZ_ICONS" == true && -n "$glyph" ]] && printf "%s%s%s" "$color" "$glyph" "$NC" || true
}

# Terminal width helpers
TERM_WIDTH=${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}
strip_ansi() { sed -E 's/\x1B\[[0-9;?]*[ -\/]*[@-~]//g' <<<"$1"; }
_zz_repeat_chars() {
  local char="$1" count="$2" s
  printf -v s '%*s' "$count" ''
  s=${s// /$char}
  printf '%s' "$s"
}

# Cross-platform stream prefix (Linux/macOS): prefer stdbuf, then unbuffer, then script
STREAM_PREFIX=""
if command -v stdbuf >/dev/null 2>&1; then
  STREAM_PREFIX="stdbuf -oL -eL"
elif command -v unbuffer >/dev/null 2>&1; then
  STREAM_PREFIX="unbuffer -p"
elif command -v script >/dev/null 2>&1; then
  STREAM_PREFIX="script -q /dev/null"
fi

# Prefix external command output with the orange left margin to keep continuity
zz_prefix_stream() {
  local _zz_err_file=${ZZ_ERROR_TAIL_FILE:-/tmp/zz-errors-$$.log}
  while IFS= read -r line; do
    if [[ "${VV_UI_SILENT:-false}" == true ]]; then
      echo -e "$line"
    else
      # Strip leading npm '>' prompt (no regex to avoid parsing issues)
      local l_leading l_trimmed
      l_leading="${line%%[![:space:]]*}"
      l_trimmed="${line#${l_leading}}"
      if [[ "${l_trimmed:0:1}" == ">" ]]; then
        l_trimmed="${l_trimmed:1}"
        [[ "${l_trimmed:0:1}" == " " ]] && l_trimmed="${l_trimmed:1}"
        line="${l_leading}${l_trimmed}"
      fi
      # Colorize a leading status symbol if present
      local leading trimmed first rest sym_color="" coloredFirst
      leading="${line%%[![:space:]]*}"
      trimmed="${line#${leading}}"
      first="${trimmed:0:1}"
      rest="${trimmed:1}"
      case "$first" in
        "✓") sym_color="$COLOR_SUCCESS_BRIGHT" ;;
        "○"|"⚪") sym_color="$COLOR_WARN" ;;
        "▲"|"⚠") sym_color="$COLOR_WARN" ;;
        "✖"|"×"|"X") sym_color="$COLOR_ERROR_BRIGHT" ;;
      esac
      # Capture error-ish lines for summary
      if [[ "$first" == "✖" || "$first" == "×" || "$first" == "X" ]] || [[ "$line" =~ [Ee]rror ]]; then
        printf "%s\n" "$line" >> "$_zz_err_file" 2>/dev/null || true
      fi
      # Optionally hide in-progress lines (Mode B approximation)
      ZZ_HIDE_INPROGRESS=${ZZ_HIDE_INPROGRESS:-true}
      if [[ "$first" == "○" || "$first" == "⚪" ]]; then
        if [[ "$ZZ_HIDE_INPROGRESS" == true ]]; then
          continue
        fi
      fi
      if [[ -n "$sym_color" ]]; then
        coloredFirst="${sym_color}${first}${NC}"
        line="${leading}${coloredFirst}${rest}"
      fi
      # Colorize only numbers in purple (ports, IP octets, versions, etc.), no text
      local colored
      colored=$(awk -v purple="${COLOR_PURPLE_BRIGHT}" -v nc="${NC}" 'BEGIN{RS="";ORS=""}{s=$0; gsub(/[0-9]+/, purple"&"nc, s); print s; }' <<<"$line")
      printf "%s %s\n" "${COLOR_PRIMARY}${ZZ_BOX_V}${NC}" "${colored}"
    fi
  done
}

print_error_summary() {
  local _f=${ZZ_ERROR_TAIL_FILE:-/tmp/zz-errors-$$.log}
  [[ -s "$_f" ]] || return 0
  section "ERROR SUMMARY"
  tail -n 10 "$_f" 2>/dev/null | while IFS= read -r l; do _zz_print_panel "${COLOR_ERROR}$l${NC}"; done
  rm -f "$_f" 2>/dev/null || true
}

# Boxed UI helpers (aligned with vv)
box_open() {
  local title="$1"
  title=${title//\"/}
  local line
  # Fixed top rule length after corner
  local rule_len=${ZZ_RULE_LEN:-20}
  line=$(_zz_repeat_chars "$ZZ_BOX_H" "$rule_len")
  if [[ "${VV_UI_SILENT:-false}" == true ]]; then
    return
  fi
  local corner_tl
  if [[ "$ZZ_UNICODE" == true ]]; then corner_tl='╭'; else corner_tl='+'; fi
  # First rule line without left margin bar: "╭────"
  printf "%s\n" "${COLOR_PRIMARY}${corner_tl}${line}${NC}"
  _zz_print_panel "$title"
}

box_line() {
  # Delegate to panel printer for consistent padding/margin
  _zz_print_panel "$1"
}

box_rule() {
  # Fixed middle rule length for section separators
  local rule_len=${ZZ_RULE_LEN:-20}
  local line
  line=$(_zz_repeat_chars "$ZZ_BOX_H" "$rule_len")
  if [[ "${VV_UI_SILENT:-false}" == true ]]; then
    return
  fi
  printf "%s\n" "${COLOR_PRIMARY}${line}${NC}"
}

box_close() {
  # Fixed bottom rule length after corner
  local rule_len=${ZZ_RULE_LEN:-20}
  local line
  line=$(_zz_repeat_chars "$ZZ_BOX_H" "$rule_len")
  if [[ "${VV_UI_SILENT:-false}" == true ]]; then
    return
  fi
  local corner_bl
  if [[ "$ZZ_UNICODE" == true ]]; then corner_bl='╰'; else corner_bl='+'; fi
  # Bottom rule without left margin bar: "╰────"
  printf "%s\n" "${COLOR_PRIMARY}${corner_bl}${line}${NC}"
}

# Boxed line printers (silent when wrapped)
_zz_print_panel() {
  if [[ "${VV_UI_SILENT:-false}" == true ]]; then
    echo -e "$1"
  else
    local cw=$(( TERM_WIDTH - 2 ))
    (( cw < 10 )) && cw=10
    local vis; vis=$(strip_ansi "$1")
    local pad=$(( cw - ${#vis} )); (( pad < 0 )) && pad=0
    # If the line begins with a corner (unicode) or '+' after optional spaces, skip the margin.
    # Use pattern matching for reliability across locales.
    if [[ "$vis" == +* || "$vis" == "┏"* || "$vis" == "┓"* || "$vis" == "┗"* || "$vis" == "┛"* ||
          "$vis" == "╭"* || "$vis" == "╮"* || "$vis" == "╰"* || "$vis" == "╯"* ||
          "$vis" == " "*+* || "$vis" == " "*"┏"* || "$vis" == " "*"┓"* || "$vis" == " "*"┗"* || "$vis" == " "*"┛"* ||
          "$vis" == $'\t'*+* || "$vis" == $'\t'*"┏"* || "$vis" == $'\t'*"┓"* || "$vis" == $'\t'*"┗"* || "$vis" == $'\t'*"┛"* ||
          "$vis" == " "*"╭"* || "$vis" == " "*"╮"* || "$vis" == " "*"╰"* || "$vis" == " "*"╯"* ||
          "$vis" == $'\t'*"╭"* || "$vis" == $'\t'*"╮"* || "$vis" == $'\t'*"╰"* || "$vis" == $'\t'*"╯"* ]]; then
      printf "%s%*s\n" "$1" "$pad" ""
    else
      printf "%s %s%*s\n" "${COLOR_PRIMARY}${ZZ_BOX_V}${NC}" "$1" "$pad" ""
    fi
  fi
}

section() { _zz_print_panel "${COLOR_PRIMARY}$1${NC}"; }
log()     { _zz_print_panel "${COLOR_ACCENT}$1${NC}"; }
warn()    { local ic=$(_zz_icon warn);   _zz_print_panel "${COLOR_WARN}${ic:+$ic }$1${NC}"; }
error()   { local ic=$(_zz_icon error);  _zz_print_panel "${COLOR_ERROR}${ic:+$ic }$1${NC}"; }
info()    { local ic=$(_zz_icon info);   _zz_print_panel "${COLOR_MUTED}${ic:+$ic }$1${NC}"; }
success() { local ic=$(_zz_icon success); _zz_print_panel "${COLOR_SUCCESS}${ic:+$ic }$1${NC}"; }
stage()   { local ic=$(_zz_icon stage);  _zz_print_panel "${COLOR_WARN}${ic:+$ic }$1${NC}"; }

status_ok()      { echo -e "${COLOR_SUCCESS}Ok${NC}"; }
status_failed()  { echo -e "${COLOR_ERROR_BRIGHT}Failed${NC}"; }
status_skipped() { echo -e "${COLOR_WARN}Skipped${NC}"; }
status_ready()   { echo -e "${COLOR_SUCCESS}Ready${NC}"; }

# Standard status line like vv: label in amber, colored one-word status, muted context
status_line() {
  local label="$1"; local word="$2"; local context="${3:-}"
  local colored="$word"
  case "$word" in
    OK|Ok) colored="${COLOR_SUCCESS}Ok${NC}" ;;
    READY|Ready) colored="${COLOR_SUCCESS}Ready${NC}" ;;
    SUCCESS|Success) colored="${COLOR_SUCCESS}Success${NC}" ;;
    FAILED|Fail|FAILED|ERROR|Error) colored="${COLOR_ERROR_BRIGHT}Failed${NC}" ;;
    SKIPPED|Skipped|SKIP) colored="${COLOR_WARN}Skipped${NC}" ;;
  esac
  if [[ -n "$context" ]]; then
    _zz_print_panel "${COLOR_WARN}${label}:${NC} ${colored} ${COLOR_MUTED}${context}${NC}"
  else
    _zz_print_panel "${COLOR_WARN}${label}:${NC} ${colored}"
  fi
}

# Find the nearest package.json
PROJECT_ROOT=$(pwd)
while [[ "$PROJECT_ROOT" != "/" ]]; do
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then break; fi
  PROJECT_ROOT=$(dirname "$PROJECT_ROOT")
done

if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
  error "No package.json found. Run from a project directory."
  exit 1
fi

PROJECT_NAME=$(node -p "require('$PROJECT_ROOT/package.json').name" 2>/dev/null || echo "unknown-project")
PROJECT_VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version" 2>/dev/null || echo "0.0.0")

# Config
ZZ_DRY_RUN=${ZZ_DRY_RUN:-false}
ZZ_WAIT_AFTER_KILL=${ZZ_WAIT_AFTER_KILL:-1}
ZZ_PORT=${ZZ_PORT:-3000}  # user prefers port 3000 [[memory:4892754]]

truthy() { [[ "$1" =~ ^(1|true|yes|on)$ ]]; }
load_zz_config() {
  local cfg
  for cfg in "$HOME/.config/zz/config" "$PROJECT_ROOT/.zzrc"; do
    if [[ -f "$cfg" ]]; then
      while IFS='=' read -r raw_key raw_val; do
        [[ -z "$raw_key" ]] && continue
        [[ "$raw_key" =~ ^# ]] && continue
        local key val_raw val
        key=$(echo "$raw_key" | tr '[:lower:]-' '[:upper:]_')
        val_raw=$(echo "${raw_val}" | sed 's/^ *//;s/ *$//')
        val=$(echo "${val_raw}" | tr -d ' ' | tr '[:upper:]' '[:lower:]')
        case "$key" in
          DRY_RUN) if truthy "$val"; then ZZ_DRY_RUN=true; else ZZ_DRY_RUN=false; fi ;;
          WAIT_AFTER_KILL) ZZ_WAIT_AFTER_KILL="$val_raw" ;;
          PORT) ZZ_PORT="$val_raw" ;;
          ZZ_ASCII) export ZZ_ASCII=1 ;;
          VV_COLOR_*|VVUI_*|VV_*) export "$key"="$val_raw" ;;
        esac
      done < "$cfg"
      info "Loaded config: $cfg"
    fi
  done
}

ensure_default_config() {
  local global_cfg="$HOME/.config/zz/config"
  if [[ ! -f "$global_cfg" ]]; then
    mkdir -p "$HOME/.config/zz"
    cat > "$global_cfg" <<CFG
# Auto-generated by zz
PORT=3000
WAIT_AFTER_KILL=1
CFG
    info "Initialized default zz config at $global_cfg"
  fi
}

# Doctor
run_doctor() {
  local ok=true
  stage "Preflight: running doctor…"
  command -v node >/dev/null 2>&1 || { ok=false; error "Doctor: Node.js missing"; }
  command -v npm  >/dev/null 2>&1 || info "Doctor: npm missing (may use yarn/pnpm/bun)"
  # pm present?
  command -v pnpm >/dev/null 2>&1 && info "Doctor: pnpm available" || true
  command -v yarn >/dev/null 2>&1 && info "Doctor: yarn available" || true
  command -v bun  >/dev/null 2>&1 && info "Doctor: bun available" || true
  # next present?
  if [[ -x "$PROJECT_ROOT/node_modules/.bin/next" ]] || command -v next >/dev/null 2>&1; then
    info "Doctor: next present"
  else
    info "Doctor: next not found (dev may still work via custom script)"
  fi
  # port check
  if lsof -ti:"$ZZ_PORT" >/dev/null 2>&1; then
    warn "Doctor: port $ZZ_PORT busy"
  else
    info "Doctor: port $ZZ_PORT free"
  fi
  status_line "Doctor" "Ok"
}

# Spinner/progress (simple roller)
_zz_progress() {
  local pid=$1 title=$2
  local i=0 frames='|/-\\'
  while kill -0 "$pid" 2>/dev/null; do
    local ch=${frames:i%4:1}
    printf "\r%s %s %s" "${COLOR_PRIMARY}${ZZ_BOX_V}${NC}" "${COLOR_ACCENT}${ch}${NC}" "$title"
    ((i++))
    sleep 0.08
  done
  printf "\r%*s\r" "$TERM_WIDTH" ""
}

run_step() {
  local title="$1"; shift
  local cmd=("$@")
  section "$title"
  if [[ "$ZZ_DRY_RUN" == true ]]; then
    echo "[dry-run] ${cmd[*]}"
    return 0
  fi
  ( set +e; stdbuf -oL -eL "${cmd[@]}" 2>&1 | zz_prefix_stream ) &
  local pid=$!
  if [[ "${VV_UI_SILENT:-false}" == true ]]; then
    wait "$pid"
  else
    _zz_progress "$pid" "$title"
    wait "$pid"
  fi
}

on_error() {
  local code=$?
  error "Aborted (exit $code)"
}
trap on_error ERR

# PM detection
detect_pm() {
  if [[ -f "$PROJECT_ROOT/pnpm-lock.yaml" ]] && command -v pnpm >/dev/null 2>&1; then echo pnpm; return; fi
  if [[ -f "$PROJECT_ROOT/yarn.lock" ]] && command -v yarn >/dev/null 2>&1; then echo yarn; return; fi
  if [[ -f "$PROJECT_ROOT/bun.lockb" ]] && command -v bun >/dev/null 2>&1; then echo bun; return; fi
  echo npm
}

kill_dev_processes() {
  stage "Resetting dev processes on port $ZZ_PORT…"
  if [[ "$ZZ_DRY_RUN" == true ]]; then
    echo "[dry-run] pkill -f 'next dev' && lsof -ti:$ZZ_PORT | xargs kill -9"
    return 0
  fi
  pkill -f "next dev" 2>/dev/null || true
  pkill -f "npm run dev" 2>/dev/null || true
  pkill -f "pnpm dev" 2>/dev/null || true
  pkill -f "yarn dev" 2>/dev/null || true
  pkill -f "bun dev" 2>/dev/null || true
  lsof -ti:"$ZZ_PORT" | xargs kill -9 2>/dev/null || true
  command -v fuser >/dev/null 2>&1 && fuser -k "$ZZ_PORT"/tcp 2>/dev/null || true
  sleep "$ZZ_WAIT_AFTER_KILL"
  # Reclaim port with retries using both lsof and ss/fuser
  local waited=0
  local timeout=${ZZ_RECLAIM_TIMEOUT:-8}
  while true; do
    if lsof -ti:"$ZZ_PORT" >/dev/null 2>&1; then
      :
    elif ss -Htanp 2>/dev/null | grep -q ":$ZZ_PORT\b"; then
      # Attempt to kill via fuser if possible
      command -v fuser >/dev/null 2>&1 && fuser -k "$ZZ_PORT"/tcp 2>/dev/null || true
      # Extract PIDs from ss as fallback
      ss -Htanp 2>/dev/null | awk -v p=":$ZZ_PORT" '$0~p{print $NF}' | sed 's/.*pid=\([0-9]\+\).*/\1/' | xargs -r kill -9 2>/dev/null || true
    else
      break
    fi
    (( waited++ ))
    [[ $waited -ge $timeout ]] && break
    printf "\r%s %s Reclaiming port %s…" "${COLOR_PRIMARY}${ZZ_BOX_V}${NC}" "${COLOR_ACCENT}⠙${NC}" "$ZZ_PORT"
    sleep 1
  done
  printf "\r%*s\r" "$TERM_WIDTH" ""
  if lsof -ti:"$ZZ_PORT" >/dev/null 2>&1; then
    warn "Port $ZZ_PORT still busy; forcing again"
    lsof -ti:"$ZZ_PORT" | xargs kill -9 2>/dev/null || true
    command -v fuser >/dev/null 2>&1 && fuser -k "$ZZ_PORT"/tcp 2>/dev/null || true
  fi
  status_line "Reset" "OK" "port $ZZ_PORT"
}

has_dev_script() { node -e "const p=require('$PROJECT_ROOT/package.json'); process.exit(!(p.scripts&&p.scripts.dev))" >/dev/null 2>&1; }

start_dev_server() {
  local pm_override=${ZZ_PM:-}
  local pm
  if [[ -n "$pm_override" ]]; then pm="$pm_override"; else pm=$(detect_pm); fi
  local cmd
  # Optional auto-scan for a free port
  if [[ "${ZZ_AUTO_SCAN_PORTS:-true}" == true ]]; then
    local candidates=("$ZZ_PORT" 3000 3020 3050 3123 3456 4211 4507 4905 5321)
    local picked="$ZZ_PORT" c
    for c in "${candidates[@]}"; do
      if ! lsof -ti:"$c" >/dev/null 2>&1; then picked="$c"; break; fi
    done
    ZZ_PORT="$picked"
  fi
  if has_dev_script; then
    case "$pm" in
      pnpm) cmd=(pnpm dev -p "$ZZ_PORT") ;;
      yarn) cmd=(yarn dev -p "$ZZ_PORT") ;;
      bun)  cmd=(bun run dev -p "$ZZ_PORT") ;;
      npm|*) cmd=(npm run dev -- -p "$ZZ_PORT") ;;
    esac
  else
    warn "No 'dev' script found; falling back to Next.js binary"
    # Prefer local binary if present
    if [[ -x "$PROJECT_ROOT/node_modules/.bin/next" ]]; then
      cmd=("$PROJECT_ROOT/node_modules/.bin/next" dev -p "$ZZ_PORT")
    else
      case "$pm" in
        pnpm) cmd=(pnpm exec next dev -p "$ZZ_PORT") ;;
        yarn) cmd=(yarn next dev -p "$ZZ_PORT") ;;
        bun)  cmd=(bunx next dev -p "$ZZ_PORT") ;;
        npm|*) cmd=(npx next dev -p "$ZZ_PORT") ;;
      esac
    fi
  fi
  stage "Starting dev server on http://localhost:$ZZ_PORT with $pm…"
  if [[ "$ZZ_DRY_RUN" == true ]]; then
    echo "[dry-run] (cd '$PROJECT_ROOT' && PORT=$ZZ_PORT ${cmd[*]})"
    return 0
  fi
  cd "$PROJECT_ROOT"
  PORT="$ZZ_PORT" ${STREAM_PREFIX} "${cmd[@]}" 2>&1 | zz_prefix_stream
}

main() {
  # Header (build separately to avoid stray quotes)
  local base; base=$(basename "$PROJECT_ROOT")
  local env_tag="${BLUE}[DEV]${NC}"
  local header="${COLOR_PINK_SOFT}Local-Hoster • ${base} v$PROJECT_VERSION • ${env_tag}"
  box_open "$header"
  ensure_default_config
  load_zz_config
  # Don't abort if missing 'dev' script; we'll fallback to Next.js binary
  run_doctor || true
  info "Project: ${PROJECT_NAME} ${COLOR_MUTED}v${PROJECT_VERSION}${NC}"
  info "Root: ${PROJECT_ROOT}"
  kill_dev_processes
  status_line "Server" "Ready" "(localhost:$ZZ_PORT)"
  start_dev_server
  print_error_summary
  box_close
}

main "$@"
