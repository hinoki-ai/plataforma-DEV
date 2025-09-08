#!/usr/bin/env bash

# Vercel Deployment Script (vv/VV)
# Complete deployment process with monitoring, reporting, and bug reporting

# Safer shell: exit on error, undefined vars, pipeline errors; sane IFS
set -Eeuo pipefail
IFS=$'\n\t'

# Default to raw UI (no external wrapper) unless explicitly enabled
export VV_DISABLE_UI=${VV_DISABLE_UI:-true}

# Early auto-wrap disabled (always render raw corners)
:

# Colors for output (honor NO_COLOR) – unified, env-overridable 256-color palette
if [[ -n "${NO_COLOR:-}" ]]; then
  RED=""; GREEN=""; YELLOW=""; BLUE=""; PURPLE=""; CYAN=""; NC="";
  COLOR_PRIMARY=""; COLOR_ACCENT=""; COLOR_SUCCESS=""; COLOR_SUCCESS_BRIGHT="";
  COLOR_WARN=""; COLOR_ERROR=""; COLOR_ERROR_BRIGHT=""; COLOR_MUTED="";
  COLOR_PURPLE_BRIGHT=""; COLOR_PINK_SOFT="";
else
  # Base ANSI (16-color fallbacks)
  ESC=$'\033'
  RED="${ESC}[0;31m"
  GREEN="${ESC}[0;32m"
  YELLOW="${ESC}[1;33m"
  BLUE="${ESC}[0;34m"
  PURPLE="${ESC}[0;35m"
  CYAN="${ESC}[0;36m"
  NC="${ESC}[0m"
  # Unified 256-color palette (overridable via VV_COLOR_* env vars)
  COLOR_PRIMARY="${ESC}[38;5;${VV_COLOR_PRIMARY:-208}m"       # Orange margin / headers
  COLOR_ACCENT="${ESC}[38;5;${VV_COLOR_ACCENT:-110}m"         # Teal accent
  COLOR_SUCCESS="${ESC}[38;5;${VV_COLOR_SUCCESS:-71}m"        # Muted green
  COLOR_SUCCESS_BRIGHT="${ESC}[38;5;${VV_COLOR_SUCCESS_BRIGHT:-82}m" # Bright green (banner status)
  COLOR_WARN="${ESC}[38;5;${VV_COLOR_WARN:-178}m"             # Amber
  COLOR_ERROR="${ESC}[38;5;${VV_COLOR_ERROR:-203}m"           # Muted red (non-fatal/info)
  COLOR_ERROR_BRIGHT="${ESC}[38;5;${VV_COLOR_ERROR_BRIGHT:-196}m" # Bright red (FAILED one-word)
  COLOR_MUTED="${ESC}[38;5;${VV_COLOR_MUTED:-246}m"           # Muted gray
  COLOR_PURPLE_BRIGHT="${ESC}[38;5;${VV_COLOR_PURPLE_BRIGHT:-141}m" # Purple for sections/results
  COLOR_PINK_SOFT="${ESC}[38;5;${VV_COLOR_PINK_SOFT:-218}m"   # Soft pink header option
fi

# Terminal width helpers
TERM_WIDTH=${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}
# Cross-platform stream prefix (Linux/macOS): prefer stdbuf, then unbuffer, then script, else none
STREAM_PREFIX=""
if command -v stdbuf >/dev/null 2>&1; then
  STREAM_PREFIX="stdbuf -oL -eL"
elif command -v unbuffer >/dev/null 2>&1; then
  STREAM_PREFIX="unbuffer -p"
elif command -v script >/dev/null 2>&1; then
  STREAM_PREFIX="script -q /dev/null"
fi

# Unicode safety detection (do NOT force UTF-8); prefer ASCII for non-TTY or unknown charmap
_VV_CHARMAP=$(locale charmap 2>/dev/null || echo "ANSI_X3.4-1968")
if [[ -n "${VV_ASCII:-}" ]] || [[ ! -t 1 ]] || [[ "${TERM:-}" == "dumb" ]] || ! echo "${_VV_CHARMAP}" | grep -qi 'utf-8'; then
  VV_UNICODE=false
  VV_BAR_CHAR='-'
  VV_SPIN_FRAMES='-|/\\'
  VV_BOX_TL='+'; VV_BOX_TR='+'; VV_BOX_BL='+'; VV_BOX_BR='+'; VV_BOX_H='-'; VV_BOX_V='|'
else
  VV_UNICODE=true
  VV_BAR_CHAR='─'
  VV_SPIN_FRAMES='⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓'
  # Light box-drawing characters to match desired style (╭, ╰, │, ─)
  VV_BOX_TL='╭'; VV_BOX_TR='╮'; VV_BOX_BL='╰'; VV_BOX_BR='╯'; VV_BOX_H='─'; VV_BOX_V='│'
fi

# Simple icons (with ASCII fallbacks when not Unicode)
if [[ "$VV_UNICODE" == true ]]; then
  ICON_TRIANGLE='▲'
  ICON_CIRCLE='○'
  ICON_CHECK='✓'
else
  ICON_TRIANGLE='!'
  ICON_CIRCLE='o'
  ICON_CHECK='OK'
fi

# Icon options
VV_ICONS=${VV_ICONS:-true}
VV_ICON_MATCH_LINE=${VV_ICON_MATCH_LINE:-false}
VV_ICON_WARN_COLOR="${VV_ICON_WARN_COLOR:-$COLOR_WARN}"
VV_ICON_INFO_COLOR="${VV_ICON_INFO_COLOR:-$COLOR_WARN}"
VV_ICON_SUCCESS_COLOR="${VV_ICON_SUCCESS_COLOR:-$COLOR_SUCCESS_BRIGHT}"
VV_ICON_ERROR_COLOR="${VV_ICON_ERROR_COLOR:-$COLOR_ERROR_BRIGHT}"
VV_ICON_STAGE_COLOR="${VV_ICON_STAGE_COLOR:-$COLOR_WARN}"

_vv_icon() {
  local kind="$1" glyph color
  case "$kind" in
    warn)    glyph="$ICON_TRIANGLE"; color=$([[ "$VV_ICON_MATCH_LINE" == true ]] && echo "$COLOR_WARN"            || echo "$VV_ICON_WARN_COLOR");;
    error)   glyph="$ICON_TRIANGLE"; color=$([[ "$VV_ICON_MATCH_LINE" == true ]] && echo "$COLOR_ERROR_BRIGHT"    || echo "$VV_ICON_ERROR_COLOR");;
    info)    glyph="$ICON_CIRCLE";  color=$([[ "$VV_ICON_MATCH_LINE" == true ]] && echo "$COLOR_WARN"            || echo "$VV_ICON_INFO_COLOR");;
    success) glyph="$ICON_CHECK";   color=$([[ "$VV_ICON_MATCH_LINE" == true ]] && echo "$COLOR_SUCCESS_BRIGHT"   || echo "$VV_ICON_SUCCESS_COLOR");;
    stage)   glyph="$ICON_CIRCLE";  color=$([[ "$VV_ICON_MATCH_LINE" == true ]] && echo "$COLOR_WARN"            || echo "$VV_ICON_STAGE_COLOR");;
    *)       glyph=""; color="";;
  esac
  [[ "$VV_ICONS" == true && -n "$glyph" ]] && printf "%s%s%s" "$color" "$glyph" "$NC" || true
}

# Global flags (defaults). All can be overridden via env vars.
# Verbose is ON by default so you never need to pass a flag.
VV_VERBOSE=${VV_VERBOSE:-true}
VV_DRY_RUN=${VV_DRY_RUN:-false}
VV_PROD=${VV_PROD:-true}
VV_OPEN=${VV_OPEN:-true}
VV_MONITOR=${VV_MONITOR:-true}
VV_AUTOCOMMIT=${VV_AUTOCOMMIT:-true}
VV_REPORT=${VV_REPORT:-true}
VV_PREBUILD=${VV_PREBUILD:-true}
VV_UI_SILENT=${VV_UI_SILENT:-false}
VV_HYPERLINKS=${VV_HYPERLINKS:-false}
FORCE_ALWAYS=${FORCE_ALWAYS:-false}
FORCE_ON_FAIL=${FORCE_ON_FAIL:-false}
FORCE_ON_UNHEALTHY=${FORCE_ON_UNHEALTHY:-false}
PREVIEW_FORCE=${PREVIEW_FORCE:-false}
FORCE_RETRY_DELAY=${FORCE_RETRY_DELAY:-3}
SUMMARY_JSON=${SUMMARY_JSON:-false}
SUMMARY_PLAIN=${SUMMARY_PLAIN:-false}
DOCTOR_ON_START=${DOCTOR_ON_START:-true}
VV_TOKEN=""
VV_SCOPE=""
VV_PROJECT=""

# Pretty separators (Unicode-safe repetition)
_vv_repeat_chars() {
  local char="$1" count="$2" s
  printf -v s '%*s' "$count" ''
  s=${s// /$char}
  printf '%s' "$s"
}
hr() { _vv_repeat_chars "$VV_BAR_CHAR" "${TERM_WIDTH}"; echo; }
section() { box_line "${COLOR_PRIMARY}$1${NC}"; box_rule; }

# Boxed UI helpers
strip_ansi() {
  sed -E 's/\x1B\[[0-9;?]*[ -\/]*[@-~]//g' <<<"$1"
}

# Prefix external command output with the orange left margin to keep continuity
vv_prefix_stream() {
  local _vv_err_file=${VV_ERROR_TAIL_FILE:-/tmp/vv-errors-$$.log}
  while IFS= read -r line; do
    if [[ "$VV_UI_SILENT" == true ]]; then
      echo -e "$line"
    else
      # Strip leading npm '>' prompt and following space(s) without regex
      local l_leading l_trimmed
      l_leading="${line%%[![:space:]]*}"
      l_trimmed="${line#${l_leading}}"
      if [[ "${l_trimmed:0:1}" == ">" ]]; then
        l_trimmed="${l_trimmed:1}"
        [[ "${l_trimmed:0:1}" == " " ]] && l_trimmed="${l_trimmed:1}"
        line="${l_leading}${l_trimmed}"
      fi
      # Colorize leading status symbol if present
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
        printf "%s\n" "$line" >> "$_vv_err_file" 2>/dev/null || true
      fi
      # Optionally hide in-progress lines (Mode B approximation)
      VV_HIDE_INPROGRESS=${VV_HIDE_INPROGRESS:-true}
      if [[ "$first" == "○" || "$first" == "⚪" ]]; then
        if [[ "$VV_HIDE_INPROGRESS" == true ]]; then
          continue
        fi
      fi
      if [[ -n "$sym_color" ]]; then
        coloredFirst="${sym_color}${first}${NC}"
        line="${leading}${coloredFirst}${rest}"
      fi
      # Colorize only numbers in purple (ports, IP octets, versions, times), no text
      local colored
      colored=$(awk -v purple="${COLOR_PURPLE_BRIGHT}" -v nc="${NC}" 'BEGIN{RS="";ORS=""}{s=$0; gsub(/[0-9]+/, purple"&"nc, s); print s; }' <<<"$line")
      printf "%s %s\n" "${COLOR_PRIMARY}${VV_BOX_V}${NC}" "${colored}"
    fi
  done
}

print_error_summary() {
  local _f=${VV_ERROR_TAIL_FILE:-/tmp/vv-errors-$$.log}
  [[ -s "$_f" ]] || return 0
  section "ERROR SUMMARY"
  tail -n 10 "$_f" 2>/dev/null | while IFS= read -r l; do box_line "${COLOR_ERROR}$l${NC}"; done
  box_rule
  rm -f "$_f" 2>/dev/null || true
}

box_open() {
  local title="$1"
  title=${title//\"/}
  # Fixed top rule length after corner
  local rule_len=${VV_RULE_LEN:-20}
  local line
  line=$(_vv_repeat_chars "$VV_BOX_H" "$rule_len")
  if [[ "$VV_UI_SILENT" == true ]]; then
    return
  fi
  # Print raw top rule as "╭──────" without left margin bar
  printf "%s%s\n" "${COLOR_PRIMARY}${VV_BOX_TL}" "${line}${NC}"
  # Title line inside margin
  printf "%s %s\n" "${COLOR_PRIMARY}${VV_BOX_V}${NC}" "${title}"
}
box_line() {
  local msg="$1"
  local content_width=$(( TERM_WIDTH - 2 ))
  (( content_width < 10 )) && content_width=10
  local vis; vis=$(strip_ansi "$msg")
  local len=${#vis}
  if (( len > content_width )); then
    msg=${vis:0:content_width}
    len=${#msg}
  fi
  local pad=$(( content_width - len ))
  (( pad < 0 )) && pad=0
  local spaces; spaces=$(printf '%*s' "$pad" '')
  if [[ "$VV_UI_SILENT" == true ]]; then
    echo -e "$msg"
  else
    printf "%s %s%s\n" "${COLOR_PRIMARY}${VV_BOX_V}${NC}" "$msg" "$spaces"
  fi
}

box_rule() {
  # Fixed bottom rule length after corner
  local rule_len=${VV_RULE_LEN:-20}
  local line
  line=$(_vv_repeat_chars "$VV_BOX_H" "$rule_len")
  if [[ "$VV_UI_SILENT" == true ]]; then
    :
  else
    printf "%s %s\n" "${COLOR_PRIMARY}${VV_BOX_V}${NC}" "${COLOR_PRIMARY}${line}${NC}"
  fi
}
box_close() {
  local content_width=$(( TERM_WIDTH - 2 ))
  (( content_width < 10 )) && content_width=10
  local line
  line=$(printf '%*s' "$content_width" '' | tr ' ' "$VV_BOX_H")
  if [[ "$VV_UI_SILENT" == true ]]; then
    return
  fi
  # Print raw bottom rule as "╰──────" without left margin bar
  printf "%s%s\n" "${COLOR_PRIMARY}${VV_BOX_BL}" "${line}${NC}"
}

# Final banner (compact encapsulated summary)
final_banner() {
  local status_word="$1" url="$2" project="$3" version="$4" log_path="$5"
  local status_colored
  case "$status_word" in
    SUCCESS) status_colored="${COLOR_SUCCESS_BRIGHT}SUCCESS${NC}" ;;
    FAILED)  status_colored="${COLOR_ERROR_BRIGHT}FAILED${NC}" ;;
    *)       status_colored="$status_word" ;;
  esac

  # When wrapped by vvui, print a plain summary without box corners to avoid
  # nested/garbled borders. Otherwise, use standard section + boxed lines.
  if [[ "${VV_UI_SILENT:-false}" == true ]]; then
    echo -e "Project: ${project} ${COLOR_MUTED}v${version}${NC}"
    if [[ -n "$url" ]]; then
      echo -e "URL: ${url}"
    else
      echo -e "URL: N/A"
    fi
    echo -e "Status: ${status_colored}"
    echo -e "Log: ${log_path}"
  else
    section "FINAL SUMMARY"
    box_line "Project: ${project} ${COLOR_MUTED}v${version}${NC}"
    if [[ -n "$url" ]]; then
      box_line "URL: ${url}"
    else
      box_line "URL: N/A"
    fi
    box_line "Status: ${status_colored}"
    box_line "Log: ${log_path}"
    box_rule
  fi
}

# Progress bar (best-effort)
_vv_progress() {
  local pid=$1 title=$2
  local content_width=$(( TERM_WIDTH - 2 ))
  local width=$(( content_width - ${#title} - 6 ))
  (( width < 10 )) && width=10
  local i=0
  local fill empty
  local FILL_CHAR EMPTY_CHAR
  if [[ "$VV_UNICODE" == true ]]; then FILL_CHAR='█'; EMPTY_CHAR='░'; else FILL_CHAR='#'; EMPTY_CHAR='-'; fi
  while kill -0 "$pid" 2>/dev/null; do
    local n=$(( (i % (width-1)) + 1 ))
    fill=$(printf '%*s' "$n" '' | tr ' ' "$FILL_CHAR")
    empty=$(printf '%*s' "$(( width - n ))" '' | tr ' ' "$EMPTY_CHAR")
    local bar="[${fill}${empty}]"
    local content="${title} ${bar}"
    local vis; vis=$(strip_ansi "$content")
    local len=${#vis}
    local pad=$(( content_width - len ))
    (( pad < 0 )) && pad=0
    local spaces; spaces=$(printf '%*s' "$pad" '')
    # spinner roller
    local roller_idx=$(( i % 4 ))
    local roller_char='|'
    case $roller_idx in 0) roller_char='|';; 1) roller_char='/';; 2) roller_char='-';; 3) roller_char='\\';; esac
    printf "\r%s %s %s%s" "${COLOR_PRIMARY}${VV_BOX_V}${NC}" "${COLOR_ACCENT}${roller_char} ${content}${NC}" "$spaces"
    ((i++))
    sleep 0.06
  done
  printf "\r%*s\r" "$TERM_WIDTH" ""
}

# Run commands with spinner and capture output
run_step() {
  local title="$1"; shift
  local cmd=("$@")
  section "$title"
  if [[ "$VV_DRY_RUN" == true ]]; then
    echo "[dry-run] ${cmd[*]}" | tee -a "$DEPLOYMENT_LOG" 2>/dev/null || true
    return 0
  fi
  (
    set +e
    ${STREAM_PREFIX} "${cmd[@]}" 2>&1 | tee -a "$DEPLOYMENT_LOG" | vv_prefix_stream
  ) &
  local pid=$!
  if [[ "$VV_UI_SILENT" == true ]]; then
    wait "$pid"
  else
    _vv_progress "$pid" "$title"
    wait "$pid"
  fi
}

# No required flags: behavior is auto-driven. Optional env overrides exist.
# You can still set: VV_VERBOSE=1 VV_DRY_RUN=1 VV_REPORT=0 VV_AUTOCOMMIT=0 VV_OPEN=1 VV_PREBUILD=1

# Logging inside panel; no left [VV] column
_vv_print_panel() {
  if [[ "$VV_UI_SILENT" == true ]]; then
    # Print plain line for wrapper UI to decorate
    echo -e "$1"
    return 0
  fi
  box_line "$1"
}
log()     { log_to_file "$1"; _vv_print_panel "${COLOR_ACCENT}$1${NC}"; }
warn()    { log_to_file "$1"; local ic=$(_vv_icon warn);   _vv_print_panel "${COLOR_WARN}${ic:+$ic }$1${NC}"; }
error()   { log_to_file "$1"; local ic=$(_vv_icon error);  _vv_print_panel "${COLOR_ERROR}${ic:+$ic }$1${NC}"; }
info()    { log_to_file "$1"; local ic=$(_vv_icon info);   _vv_print_panel "${COLOR_MUTED}${ic:+$ic }$1${NC}"; }
success() { log_to_file "$1"; local ic=$(_vv_icon success); _vv_print_panel "${COLOR_SUCCESS}${ic:+$ic }$1${NC}"; }
stage()   { log_to_file "$1"; local ic=$(_vv_icon stage);  _vv_print_panel "${COLOR_WARN}${ic:+$ic }$1${NC}"; }

# Terse status helpers (standardized)
status_ok()      { echo -e "${COLOR_SUCCESS}Ok${NC}"; }
status_failed()  { echo -e "${COLOR_ERROR_BRIGHT}Failed${NC}"; }
status_skipped() { echo -e "${COLOR_WARN}Skipped${NC}"; }
status_ready()   { echo -e "${COLOR_SUCCESS}Ready${NC}"; }

# Standard status line: label in amber, status live, optional muted context
status_line() {
  local label="$1"; local status_word="$2"; local context="${3:-}"
  local word="$status_word"
  case "$status_word" in
    OK|Ok) word="${COLOR_SUCCESS}Ok${NC}" ;;
    READY|Ready) word="${COLOR_SUCCESS}Ready${NC}" ;;
    SUCCESS|Success) word="${COLOR_SUCCESS}Success${NC}" ;;
    FAILED|Fail|FAILED|ERROR|Error) word="${COLOR_ERROR_BRIGHT}Failed${NC}" ;;
    SKIPPED|Skipped|SKIP) word="${COLOR_WARN}Skipped${NC}" ;;
  esac
  if [[ -n "$context" ]]; then
    box_line "${COLOR_WARN}${label}:${NC} ${word} ${COLOR_MUTED}${context}${NC}"
  else
    box_line "${COLOR_WARN}${label}:${NC} ${word}"
  fi
}

# Find the nearest package.json to determine project root
PROJECT_ROOT=$(pwd)
while [[ "$PROJECT_ROOT" != "/" ]]; do
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        break
    fi
    PROJECT_ROOT=$(dirname "$PROJECT_ROOT")
done

if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    error "No package.json found. Please run from a project directory."
    exit 1
fi

# Get project name from package.json
PROJECT_NAME=$(node -p "require('$PROJECT_ROOT/package.json').name" 2>/dev/null || echo "unknown-project")
PROJECT_VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version" 2>/dev/null || echo "1.0.0")

# Create deployment log file
DEPLOYMENT_LOG="/tmp/vv-deployment-$(date +%Y%m%d-%H%M%S).log"
DEPLOYMENT_ID=$(date +%Y%m%d-%H%M%S)
START_TS=$(date +%s)

# Function to log to file
log_to_file() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$DEPLOYMENT_LOG"
}

# Load config from file(s) to avoid typing flags
truthy() { [[ "$1" =~ ^(1|true|yes|on)$ ]]; }
load_vv_config() {
  local cfg
  for cfg in "$HOME/.config/vv/config" "$PROJECT_ROOT/.vvrc"; do
    if [[ -f "$cfg" ]]; then
      while IFS='=' read -r raw_key raw_val; do
        [[ -z "$raw_key" ]] && continue
        [[ "$raw_key" =~ ^# ]] && continue
        local key val
        key=$(echo "$raw_key" | tr '[:lower:]-' '[:upper:]_')
        # Preserve raw value for passthrough keys; normalized for booleans
        local val_raw
        val_raw=$(echo "${raw_val}" | sed 's/^ *//;s/ *$//')
        val=$(echo "${val_raw}" | tr -d ' ' | tr '[:upper:]' '[:lower:]')
        case "$key" in
          VERBOSE) if truthy "$val"; then VV_VERBOSE=true; else VV_VERBOSE=false; fi ;;
          QUIET)   if truthy "$val"; then VV_VERBOSE=false; fi ;;
          DRY_RUN) if truthy "$val"; then VV_DRY_RUN=true; else VV_DRY_RUN=false; fi ;;
          MONITOR) if truthy "$val"; then VV_MONITOR=true; else VV_MONITOR=false; fi ;;
          REPORT)  if truthy "$val"; then VV_REPORT=true; else VV_REPORT=false; fi ;;
          PREBUILD)if truthy "$val"; then VV_PREBUILD=true; else VV_PREBUILD=false; fi ;;
          OPEN)    if truthy "$val"; then VV_OPEN=true; else VV_OPEN=false; fi ;;
          ASCII)   if truthy "$val"; then VV_ASCII=1; fi ;;
          FORCE_ALWAYS) if truthy "$val"; then FORCE_ALWAYS=true; else FORCE_ALWAYS=false; fi ;;
          FORCE_ON_FAIL) if truthy "$val"; then FORCE_ON_FAIL=true; else FORCE_ON_FAIL=false; fi ;;
          FORCE_ON_UNHEALTHY) if truthy "$val"; then FORCE_ON_UNHEALTHY=true; else FORCE_ON_UNHEALTHY=false; fi ;;
          PREVIEW_FORCE) if truthy "$val"; then PREVIEW_FORCE=true; else PREVIEW_FORCE=false; fi ;;
          VV_COLOR_*|VVUI_*|VV_*) export "$key"="$val_raw" ;;
        esac
      done < "$cfg"
      info "Loaded config: $cfg"
    fi
  done
}

# One-time default config so you only type `vv`.
ensure_default_config() {
  local global_cfg="$HOME/.config/vv/config"
  local project_cfg="$PROJECT_ROOT/.vvrc"
  if [[ ! -f "$global_cfg" && ! -f "$project_cfg" ]]; then
    mkdir -p "$HOME/.config/vv"
    cat > "$global_cfg" <<CFG
# Auto-generated by vv to keep usage flagless
VERBOSE=true
PREBUILD=true
OPEN=true
MONITOR=true
REPORT=true
CFG
    info "Initialized default vv config at $global_cfg"
  fi
}

# Trap for clean error reporting
on_error() {
  local exit_code=$?
  local end_ts=$(date +%s)
  local dur=$(( end_ts - START_TS ))
  echo ""; hr
  error "Deployment aborted (exit $exit_code) after ${dur}s"
  [[ -f "$DEPLOYMENT_LOG" ]] && echo "See log: $DEPLOYMENT_LOG"
}
trap on_error ERR

# Function to check if Vercel CLI is installed
check_vercel_cli() {
    stage "Vercel CLI: checking…"
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI is not installed. Installing..."
        npm install -g vercel
        log "Vercel CLI: $(status_ok)"
    else
        local ver
        ver=$(vercel --version 2>/dev/null | tail -n1)
        log "Vercel CLI found: ${COLOR_ERROR}${ver}${NC}"
        log "Vercel CLI: $(status_ok)"
    fi
}

# Ensure project is linked to Vercel
ensure_vercel_link() {
  if [[ ! -f "$PROJECT_ROOT/.vercel/project.json" ]]; then
    stage "Linking project…"
    local args=(link --yes)
    [[ -n "$VV_PROJECT" ]] && args+=(--project "$VV_PROJECT")
    [[ -n "$VV_SCOPE" ]] && args+=(--scope "$VV_SCOPE")
    [[ -n "$VV_TOKEN" ]] && args+=(--token "$VV_TOKEN")
    if [[ "$VV_DRY_RUN" == true ]]; then
      echo "[dry-run] vercel ${args[*]}" | tee -a "$DEPLOYMENT_LOG" >/dev/null || true
    else
      (cd "$PROJECT_ROOT" && ${STREAM_PREFIX} vercel "${args[@]}" 2>&1 | tee -a "$DEPLOYMENT_LOG" | vv_prefix_stream)
    fi
    log "Vercel link: $(status_ok)"
  else
    log "Vercel link: $(status_ok) ${COLOR_MUTED}(.vercel/project.json)${NC}"
  fi
}

# Pull env from Vercel to local .env
pull_vercel_env() {
  local args=(pull --yes)
  [[ "$VV_PROD" == true ]] && args+=(--environment=production) || args+=(--environment=preview)
  [[ -n "$VV_SCOPE" ]] && args+=(--scope "$VV_SCOPE")
  [[ -n "$VV_TOKEN" ]] && args+=(--token "$VV_TOKEN")
  if [[ "$VV_DRY_RUN" == true ]]; then
    echo "[dry-run] vercel ${args[*]}" | tee -a "$DEPLOYMENT_LOG" >/dev/null || true
  else
    (cd "$PROJECT_ROOT" && ${STREAM_PREFIX} vercel "${args[@]}" 2>&1 | tee -a "$DEPLOYMENT_LOG" | vv_prefix_stream)
  fi
  local env_name
  if [[ "$VV_PROD" == true ]]; then env_name="production"; else env_name="preview"; fi
        log "Vercel env: $(status_ok)"
}

# Detect deploy subcommand support
supports_vercel_deploy() {
  vercel help deploy >/dev/null 2>&1
}

can_force_in_env() {
  if [[ "$VV_PROD" == true ]]; then return 0; fi
  if [[ "$PREVIEW_FORCE" == true ]]; then return 0; fi
  return 1
}

get_env_mtime() {
  local latest=0 f ts
  for f in "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.local" "$PROJECT_ROOT/.vercel/project.json"; do
    if [[ -f "$f" ]]; then
      ts=$(stat -c %Y "$f" 2>/dev/null || stat -f %m "$f" 2>/dev/null || echo 0)
      (( ts > latest )) && latest=$ts
    fi
  done
  echo "$latest"
}

should_force_env_change() {
  local key
  key=$(echo -n "$PROJECT_ROOT" | md5sum 2>/dev/null | awk '{print $1}')
  local store="/tmp/vv-last-env-ts-${key}.txt"
  local last=0 cur
  if [[ -f "$store" ]]; then last=$(cat "$store" 2>/dev/null || echo 0); fi
  cur=$(get_env_mtime)
  if (( cur > last )); then return 0; else return 1; fi
}

record_env_snapshot() {
  local key
  key=$(echo -n "$PROJECT_ROOT" | md5sum 2>/dev/null | awk '{print $1}')
  local store="/tmp/vv-last-env-ts-${key}.txt"
  get_env_mtime > "$store" 2>/dev/null || true
}

# Doctor: quick preflight checks
run_doctor() {
  local ok=true
  # vercel
  if ! command -v vercel >/dev/null 2>&1; then ok=false; error "Doctor: vercel CLI missing"; fi
  # linked
  if [[ ! -f "$PROJECT_ROOT/.vercel/project.json" ]]; then ok=false; error "Doctor: project not linked (.vercel/project.json)"; fi
  # node/npm
  command -v node >/dev/null 2>&1 || { ok=false; error "Doctor: Node.js missing"; }
  command -v npm  >/dev/null 2>&1 || info "Doctor: npm missing (non-fatal)"
  # prebuild support
  if supports_vercel_deploy; then
    info "Doctor: prebuilt deploy available"
  else
    log_to_file "Doctor: prebuilt deploy not available (will fallback)"
  fi
  # env pull dry-check (skip network-heavy call; rely on presence)
  [[ -f "$PROJECT_ROOT/.env" || -f "$PROJECT_ROOT/.env.local" || -f "$PROJECT_ROOT/.vercel/project.json" ]] || info "Doctor: no local env files found (may be fine)"
  if [[ "$ok" == false ]]; then
    return 1
  fi
  info "Doctor: $(status_ok)"
  return 0
}

# Function to check git status
check_git_status() {
    if [[ -d "$PROJECT_ROOT/.git" ]]; then
        cd "$PROJECT_ROOT"
        
        # Check if there are uncommitted changes
        if [[ -n $(git status --porcelain) ]]; then
            if [[ "$VV_AUTOCOMMIT" == true ]]; then
            warn "Uncommitted changes detected. Committing them..."
                if [[ "$VV_DRY_RUN" == true ]]; then
                  echo "[dry-run] git add . && git commit -m 'Auto-commit before deployment [VV-$DEPLOYMENT_ID]'" | tee -a "$DEPLOYMENT_LOG" >/dev/null || true
                else
            git add .
            git commit -m "Auto-commit before deployment [VV-$DEPLOYMENT_ID]"
                fi
            log "Changes committed successfully"
            else
        warn "Uncommitted changes: $(status_skipped) (--no-commit)"
            fi
        fi
        
        # Check if we're on main/master branch
        CURRENT_BRANCH=$(git branch --show-current)
        if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
            warn "Not on main/master branch. Current branch: $CURRENT_BRANCH"
        fi
        
        # Get latest commit info
        COMMIT_HASH=$(git rev-parse --short HEAD)
        COMMIT_MESSAGE=$(git log -1 --pretty=%B)
        log "Git status: $CURRENT_BRANCH@$COMMIT_HASH - $COMMIT_MESSAGE"
    else
        warn "No git repository found"
    fi
}

# Decide deploy environment automatically
decide_environment() {
    # Default: production on main/master, preview otherwise
    local branch
    branch=$(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo "")
    if [[ "$branch" == "main" || "$branch" == "master" ]]; then
        VV_PROD=true
    else
        VV_PROD=false
    fi
    if [[ "$VV_PROD" == true ]]; then
        ENV_NAME="production"
    else
        ENV_NAME="preview"
    fi
}

# Function to run pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if .env files exist
    if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
        log "Found .env.local"
    fi
    
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        log "Found .env"
    fi
    
    # Check if vercel.json exists
    if [[ -f "$PROJECT_ROOT/vercel.json" ]]; then
        log "Found vercel.json configuration"
    else
        warn "No vercel.json found. Using default configuration."
    fi
    
    # Check Node/npm availability
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js is required but not found"
        exit 1
    fi
    if ! command -v npm >/dev/null 2>&1; then
        warn "npm not found; ensure your package manager is available"
    fi
    
    # Check build script
    if grep -q '"build"' "$PROJECT_ROOT/package.json"; then
        log "Build script found in package.json"
    else
        error "No build script found in package.json"
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_to_vercel() {
    local force_hint="${1:-}"
    stage "Starting Vercel deployment…"
    log_to_file "Starting deployment for $PROJECT_NAME v$PROJECT_VERSION"
    
    cd "$PROJECT_ROOT"
    
    # Build args
    local args=()
    [[ "$VV_PROD" == true ]] && args+=(--prod) || true
    args+=(--yes)
    args+=(--cwd "$PROJECT_ROOT" --no-clipboard)
    [[ -n "$VV_SCOPE" ]] && args+=(--scope "$VV_SCOPE")
    [[ -n "$VV_TOKEN" ]] && args+=(--token "$VV_TOKEN")
    [[ -n "$VV_PROJECT" ]] && args+=(--project "$VV_PROJECT")

    # Decide force
    local DO_FORCE=false
    if can_force_in_env; then
      if [[ "$FORCE_ALWAYS" == true ]]; then DO_FORCE=true; fi
      if should_force_env_change; then DO_FORCE=true; fi
      if [[ "$force_hint" == "force" ]]; then DO_FORCE=true; fi
      if [[ "$DO_FORCE" == true && "$VV_AUTOCOMMIT" == false && -d "$PROJECT_ROOT/.git" && -n $(git -C "$PROJECT_ROOT" status --porcelain) ]]; then
        DO_FORCE=false
      fi
    fi
    if [[ "$DO_FORCE" == true ]]; then args+=(--force); fi

    # Choose strategy
    if [[ "$VV_PREBUILD" == true ]] && supports_vercel_deploy; then
        stage "Using prebuild + deploy strategy"
        local build_args=(build --yes)
        [[ "$VV_PROD" == true ]] && build_args+=(--prod)
        build_args+=(--cwd "$PROJECT_ROOT" --no-clipboard)
        [[ -n "$VV_SCOPE" ]] && build_args+=(--scope "$VV_SCOPE")
        [[ -n "$VV_TOKEN" ]] && build_args+=(--token "$VV_TOKEN")
        [[ -n "$VV_PROJECT" ]] && build_args+=(--project "$VV_PROJECT")
        if [[ "$VV_DRY_RUN" == true ]]; then
          echo "[dry-run] vercel ${build_args[*]}" | tee -a "$DEPLOYMENT_LOG" >/dev/null || true
          echo "[dry-run] vercel deploy --prebuilt ${args[*]}" | tee -a "$DEPLOYMENT_LOG" >/dev/null || true
          DEPLOYMENT_OUTPUT=""
          DEPLOYMENT_EXIT_CODE=0
        else
          stdbuf -oL -eL vercel "${build_args[@]}" 2>&1 | tee -a "$DEPLOYMENT_LOG" | vv_prefix_stream
          local _tmp_out
          _tmp_out=$(mktemp)
          stdbuf -oL -eL vercel deploy --prebuilt "${args[@]}" 2>&1 \
            | tee -a "$DEPLOYMENT_LOG" \
            | tee >(vv_prefix_stream) \
            > "$_tmp_out"
          DEPLOYMENT_OUTPUT=$(cat "$_tmp_out" 2>/dev/null || echo "")
          rm -f "$_tmp_out" 2>/dev/null || true
        fi
    else
        # Legacy single-shot deploy
        if [[ "$VV_DRY_RUN" == true ]]; then
          echo "[dry-run] vercel ${args[*]}" | tee -a "$DEPLOYMENT_LOG" >/dev/null || true
          DEPLOYMENT_OUTPUT=""
          DEPLOYMENT_EXIT_CODE=0
        else
          local _tmp_out
          _tmp_out=$(mktemp)
          stdbuf -oL -eL vercel "${args[@]}" 2>&1 \
            | tee -a "$DEPLOYMENT_LOG" \
            | tee >(vv_prefix_stream) \
            > "$_tmp_out"
          DEPLOYMENT_OUTPUT=$(cat "$_tmp_out" 2>/dev/null || echo "")
          rm -f "$_tmp_out" 2>/dev/null || true
        fi
    fi
    [[ "${DEPLOYMENT_EXIT_CODE:-999}" == 999 ]] && DEPLOYMENT_EXIT_CODE=$?
    
    log_to_file "Deployment output: $DEPLOYMENT_OUTPUT"
    
    if [[ ${DEPLOYMENT_EXIT_CODE:-0} -eq 0 ]]; then
        # Extract deployment URL from output
        DEPLOYMENT_URL=$(echo "$DEPLOYMENT_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\.[a-z]{2,}[^[:space:]]*' | grep -m1 vercel\.app || true)
        [[ -z "$DEPLOYMENT_URL" ]] && DEPLOYMENT_URL=$(echo "$DEPLOYMENT_OUTPUT" | grep -o 'https://[^[:space:]]*' | head -1)
        log "Deployment successful"
        log "Deployment URL: $DEPLOYMENT_URL"
        log_to_file "Deployment successful: $DEPLOYMENT_URL"
        
        # Store deployment URL for monitoring
        echo "$DEPLOYMENT_URL" > "/tmp/vv-last-deployment-url.txt"
        record_env_snapshot
        
        return 0
    else
        error "Deployment failed"
        log_to_file "Deployment failed with exit code: $DEPLOYMENT_EXIT_CODE"
        return 1
    fi
}

# Function to monitor deployment
monitor_deployment() {
    local deployment_url="$1"
    
    if [[ -z "$deployment_url" ]]; then
        warn "No deployment URL provided for monitoring"
        return 1
    fi
    
    stage "Monitoring deployment…"
    log_to_file "Starting monitoring for: $deployment_url"
    
    # Wait a moment for deployment to be ready
    if [[ "$VV_DRY_RUN" == true ]]; then
      warn "Dry-run: monitoring simulated"
      return 0
    fi
    sleep 10
    
    # Test deployment health
    local health_check_count=0
    local max_health_checks=30
    
    while [[ $health_check_count -lt $max_health_checks ]]; do
        health_check_count=$((health_check_count + 1))
        
        # Test if deployment is responding
        if curl -sS -o /dev/null -w '%{http_code} %{time_connect} %{time_starttransfer} %{time_total}\n' --max-time 10 "$deployment_url" >/tmp/vv_curl_metrics.$$ 2>/dev/null; then
            local status t_conn t_ttfb t_total
            read -r status t_conn t_ttfb t_total < /tmp/vv_curl_metrics.$$
            rm -f /tmp/vv_curl_metrics.$$ 2>/dev/null || true
            log "Responding (check $health_check_count/$max_health_checks) [HTTP $status | connect ${t_conn}s | TTFB ${t_ttfb}s | total ${t_total}s] ${COLOR_SUCCESS}OK${NC}"
            log_to_file "Health check passed: $health_check_count/$max_health_checks"
            
            # Test specific endpoints
            test_endpoints "$deployment_url"
            return 0
        else
            warn "Deployment not ready yet (check $health_check_count/$max_health_checks)"
            log_to_file "Health check failed: $health_check_count/$max_health_checks"
            sleep 10
        fi
    done
    
    error "Deployment monitoring timeout"
    log_to_file "Monitoring timeout after $max_health_checks checks"
    # Retry-on-unhealthy (single forced attempt) if configured
    if can_force_in_env && [[ "$FORCE_ON_UNHEALTHY" == true ]]; then
      warn "Monitoring timeout. Retrying deploy once with --force in ${FORCE_RETRY_DELAY}s…"
      sleep "${FORCE_RETRY_DELAY}"
      if deploy_to_vercel force; then
        DEPLOYMENT_SUCCESS="true"
        DEPLOYMENT_URL=$(cat "/tmp/vv-last-deployment-url.txt" 2>/dev/null || echo "")
        return 0
      fi
    fi
    return 1
}

# Function to test specific endpoints
test_endpoints() {
    local base_url="$1"
    stage "Testing application endpoints..."
    log_to_file "Testing endpoints for: $base_url"
    
    # Test main page
    if curl -s --max-time 10 "$base_url" > /dev/null; then
        log "Main page (/): ${COLOR_SUCCESS}OK${NC}"
        log_to_file "Main page test: PASSED"
    else
        warn "Main page (/): ${COLOR_ERROR_BRIGHT}FAILED${NC}"
        log_to_file "Main page test: FAILED"
    fi
    
    # Test API endpoints if they exist
    if curl -s --max-time 10 "$base_url/api/auth/session" > /dev/null; then
        log "Auth API (/api/auth/session): ${COLOR_SUCCESS}OK${NC}"
        log_to_file "Auth API test: PASSED"
    else
        warn "Auth API (/api/auth/session): ${COLOR_ERROR_BRIGHT}FAILED${NC}"
        log_to_file "Auth API test: FAILED"
    fi
    
    # Test votaciones system endpoints
    if curl -s --max-time 10 "$base_url/api/admin/votes" > /dev/null; then
        log "Admin Votes API (/api/admin/votes): ${COLOR_SUCCESS}OK${NC}"
        log_to_file "Admin Votes API test: PASSED"
    else
        warn "Admin Votes API (/api/admin/votes): ${COLOR_ERROR_BRIGHT}FAILED${NC}"
        log_to_file "Admin Votes API test: FAILED"
    fi
}

# Function to generate deployment report
generate_report() {
    local deployment_url="$1"
    local deployment_success="$2"
    
    log "Generating deployment report..."
    
    local report_file="/tmp/vv-deployment-report-$DEPLOYMENT_ID.md"
    
    cat > "$report_file" << EOF
# Vercel Deployment Report

**Deployment ID:** $DEPLOYMENT_ID  
**Project:** $PROJECT_NAME  
**Version:** $PROJECT_VERSION  
**Timestamp:** $(date)  
**Status:** $([ "$deployment_success" = "true" ] && echo "SUCCESS" || echo "FAILED")

## Deployment Details

- **Project Root:** $PROJECT_ROOT
- **Deployment URL:** $deployment_url
- **Git Branch:** $(git branch --show-current 2>/dev/null || echo "N/A")
- **Git Commit:** $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")

## System Information

- **Node.js Version:** $(node --version)
- **NPM Version:** $(npm --version)
- **Vercel CLI Version:** $(vercel --version 2>/dev/null || echo "N/A")
- **Platform:** $(uname -s)
- **Architecture:** $(uname -m)

## Log File

Full deployment log: $DEPLOYMENT_LOG

## Next Steps

$([ "$deployment_success" = "true" ] && echo "- Deployment successful. Monitor the application." || echo "- Deployment failed. Check the logs and fix issues.")
- Review the deployment log for detailed information
- Monitor application performance
- Report any issues found

---
*Generated by VV Deployment Script*
EOF

    log "Report generated: $report_file"
    log_to_file "Report generated: $report_file"
    
    # Display report summary
    echo ""
    log "DEPLOYMENT SUMMARY:"
    hr
    cat "$report_file"
    hr
}

# Function to create bug report if deployment failed
create_bug_report() {
    local deployment_url="$1"
    
    log "🐛 Creating bug report..."
    
    local bug_report_file="/tmp/vv-bug-report-$DEPLOYMENT_ID.md"
    
    cat > "$bug_report_file" << EOF
# Vercel Deployment Bug Report

**Deployment ID:** $DEPLOYMENT_ID  
**Project:** $PROJECT_NAME  
**Version:** $PROJECT_VERSION  
**Timestamp:** $(date)  
**Status:** ❌ FAILED

## Error Details

- **Deployment URL:** $deployment_url
- **Exit Code:** $DEPLOYMENT_EXIT_CODE
- **Log File:** $DEPLOYMENT_LOG

## System Information

- **Node.js:** $(node --version)
- **NPM:** $(npm --version)
- **Platform:** $(uname -s)
- **Architecture:** $(uname -m)

## Recent Changes

$(git log --oneline -10 2>/dev/null || echo "No git history available")

## Environment

$(env | grep -E "(NODE_ENV|VERCEL|NEXT)" | head -10 || echo "No relevant environment variables found")

## Build Output

$(tail -50 "$DEPLOYMENT_LOG" 2>/dev/null || echo "No build output available")

## Suggested Actions

1. Check the deployment log for specific errors
2. Verify environment variables are set correctly
3. Test the build locally: \`npm run build\`
4. Check Vercel dashboard for detailed error information
5. Review recent code changes

---
*Generated by VV Deployment Script*
EOF

    log "🐛 Bug report created: $bug_report_file"
    log_to_file "Bug report created: $bug_report_file"
}

# Function to cleanup
cleanup() {
    info "Cleaning up temporary files..."
    
    # Keep only the last 5 deployment logs
    ls -t /tmp/vv-deployment-*.log 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    # Keep only the last 5 reports
    ls -t /tmp/vv-deployment-report-*.md 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    # Keep only the last 5 bug reports
    ls -t /tmp/vv-bug-report-*.md 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    info "🧹 Cleanup completed"
}

# Main execution
main() {
    decide_environment
    # Wrapper disabled: render raw margins and corners
    :
    # Orange left margin; all logs render inside
    local ENV_TAG
    if [[ "$VV_PROD" == true ]]; then
      ENV_TAG="${COLOR_PURPLE_BRIGHT}[PRODUCTION]${NC}"
    else
      ENV_TAG="${BLUE}[PREVIEW]${NC}"
    fi
  local header_title
  header_title="${COLOR_PINK_SOFT}Vercel-Deployer • $(basename \"$PROJECT_ROOT\") v$PROJECT_VERSION • ${ENV_TAG}${NC}"
    box_open "$header_title"
    
    # Initialize log file
    log_to_file "Starting VV deployment script"
    log_to_file "Project: $PROJECT_NAME v$PROJECT_VERSION"
    log_to_file "Project root: $PROJECT_ROOT"
    
    # Step 1: Check Vercel CLI
    check_vercel_cli
    log_to_file "Vercel CLI check completed"
    
    # Step 1.5: Ensure link and pull env
    ensure_default_config
    load_vv_config
    if [[ "$DOCTOR_ON_START" == true ]]; then
    stage "Preflight: running doctor…"
      if ! run_doctor; then
        error "Preflight failed"
        exit 1
      fi
    fi
    ensure_vercel_link
    pull_vercel_env || warn "vercel pull skipped or failed"
    
    # Step 2: Check git status
    check_git_status
    log_to_file "Git status check completed"
    
    # Step 3: Pre-deployment checks
    pre_deployment_checks
    log_to_file "Pre-deployment checks completed"
    
    # Step 4: Deploy to Vercel
    if deploy_to_vercel; then
        DEPLOYMENT_SUCCESS="true"
        DEPLOYMENT_URL=$(cat "/tmp/vv-last-deployment-url.txt" 2>/dev/null || echo "")
        
        # Step 5: Monitor deployment
        if [[ "$VV_MONITOR" == true ]]; then
        monitor_deployment "$DEPLOYMENT_URL"
        else
          box_line "${COLOR_WARN}Monitoring:${NC} $(status_skipped) ${COLOR_MUTED}(by flag)${NC}"
        fi
        
        # Step 6: Generate success report
        if [[ "$VV_REPORT" == true ]]; then
        generate_report "$DEPLOYMENT_URL" "true"
        fi
        
        _vv_print_panel "${COLOR_PURPLE_BRIGHT}🎉 DEPLOYMENT SUCCESSFUL 🎉${NC}"
        if [[ -n "$DEPLOYMENT_URL" ]]; then
          if [[ "$VV_HYPERLINKS" == true ]]; then
            local url_link="\e]8;;$DEPLOYMENT_URL\e\\$DEPLOYMENT_URL\e]8;;\e\\"
            box_line "URL: $url_link"
          else
            box_line "URL: $DEPLOYMENT_URL"
          fi
        else
          box_line "URL: N/A"
        fi
        if [[ "$VV_OPEN" == true && -n "$DEPLOYMENT_URL" ]]; then
          command -v xdg-open >/dev/null 2>&1 && xdg-open "$DEPLOYMENT_URL" >/dev/null 2>&1 || true
        fi
        
    else
        DEPLOYMENT_SUCCESS="false"
        DEPLOYMENT_URL=""
        
        # Retry-on-fail (single forced attempt) if configured
        if can_force_in_env && [[ "$FORCE_ON_FAIL" == true ]]; then
          warn "Deploy failed. Retrying once with --force in ${FORCE_RETRY_DELAY}s…"
          sleep "${FORCE_RETRY_DELAY}"
          if deploy_to_vercel force; then
            DEPLOYMENT_SUCCESS="true"
            DEPLOYMENT_URL=$(cat "/tmp/vv-last-deployment-url.txt" 2>/dev/null || echo "")
          fi
        fi
        
        # Step 5: Create bug report
        if [[ "$VV_REPORT" == true ]]; then
        create_bug_report "$DEPLOYMENT_URL"
        fi
        
        # Step 6: Generate failure report
        if [[ "$VV_REPORT" == true ]]; then
        generate_report "$DEPLOYMENT_URL" "false"
        fi
        
        error "Deployment failed. Check the bug report for details."
    fi
    
    # Step 7: Cleanup
    cleanup
    
    echo ""
    local status_word
    if [[ "$DEPLOYMENT_SUCCESS" = "true" ]]; then status_word="SUCCESS"; else status_word="FAILED"; fi
    final_banner "$status_word" "$DEPLOYMENT_URL" "$PROJECT_NAME" "$PROJECT_VERSION" "$DEPLOYMENT_LOG"
    if [[ "$SUMMARY_PLAIN" == true ]]; then
      echo "project=$PROJECT_NAME version=$PROJECT_VERSION status=$status_word url=${DEPLOYMENT_URL:-N/A} log=$DEPLOYMENT_LOG"
    fi
    if [[ "$SUMMARY_JSON" == true ]]; then
      printf '{"project":"%s","version":"%s","status":"%s","url":"%s","log":"%s"}\n' \
        "$PROJECT_NAME" "$PROJECT_VERSION" "$status_word" "${DEPLOYMENT_URL:-}" "$DEPLOYMENT_LOG"
    fi
    box_close
    
    log_to_file "VV deployment script completed"
    
    # Exit with appropriate code
    if [[ "$DEPLOYMENT_SUCCESS" = "true" ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@" 