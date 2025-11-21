#!/bin/bash

# Perfect E2E Test Runner with Dev Server Management
# This script runs the perfect e2e test suite with automatic error detection and fixing

set -e

echo "🚀 Starting Perfect E2E Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEV_MODE=true
BASE_URL="http://localhost:3000"
TEST_RESULTS_DIR="test-results/perfect-e2e-logs"
MAX_RETRIES=3

# Create test results directory
mkdir -p "$TEST_RESULTS_DIR"

# Function to check if dev server is running
check_dev_server() {
    echo -e "${BLUE}🔍 Checking if dev server is running on $BASE_URL${NC}"
    if curl -s --max-time 5 "$BASE_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Dev server is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Dev server not detected${NC}"
        return 1
    fi
}

# Function to start dev server
start_dev_server() {
    echo -e "${BLUE}🚀 Starting Next.js dev server${NC}"

    # Check if port 3000 is already in use
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port 3000 is already in use. Assuming dev server is running.${NC}"
        return 0
    fi

    # Start dev server in background
    npm run dev &
    DEV_SERVER_PID=$!

    echo -e "${CYAN}⏳ Waiting for dev server to start (PID: $DEV_SERVER_PID)${NC}"

    # Wait for server to be ready
    local attempts=0
    local max_attempts=30
    while [ $attempts -lt $max_attempts ]; do
        if curl -s --max-time 5 "$BASE_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Dev server started successfully${NC}"
            return 0
        fi
        sleep 2
        attempts=$((attempts + 1))
        echo -e "${CYAN}⏳ Still waiting... ($attempts/$max_attempts)${NC}"
    done

    echo -e "${RED}❌ Dev server failed to start within 60 seconds${NC}"
    return 1
}

# Function to run e2e tests
run_e2e_tests() {
    local test_name="$1"
    local retry_count="${2:-0}"

    echo -e "${BLUE}🧪 Running Perfect E2E tests (attempt $((retry_count + 1))/$MAX_RETRIES)${NC}"

    # Set environment variables for dev mode
    export NODE_ENV=development
    export E2E_DEV_MODE=true
    export E2E_BASE_URL="$BASE_URL"

    # Run the tests
    if npx playwright test tests/e2e/perfect-e2e.spec.ts --project=dev-mode --workers=1; then
        echo -e "${GREEN}✅ E2E tests passed!${NC}"
        return 0
    else
        local exit_code=$?
        echo -e "${RED}❌ E2E tests failed with exit code $exit_code${NC}"

        # Check for common error patterns and attempt fixes
        if [ -f "test-results/e2e-results.json" ]; then
            echo -e "${YELLOW}🔍 Analyzing test results for auto-fixing opportunities...${NC}"

            # Check for turbopack errors
            if grep -q "turbopack\|webpack.*error" test-results/e2e-results.json 2>/dev/null; then
                echo -e "${MAGENTA}🚨 Turbopack errors detected. Attempting to fix...${NC}"

                # Clear Next.js cache
                echo -e "${CYAN}🧹 Clearing Next.js cache${NC}"
                rm -rf .next

                # Restart dev server if it's running
                if [ -n "$DEV_SERVER_PID" ] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
                    echo -e "${CYAN}🔄 Restarting dev server${NC}"
                    kill "$DEV_SERVER_PID" 2>/dev/null || true
                    sleep 2
                    start_dev_server
                fi
            fi

            # Check for network errors
            if grep -q "network.*error\|connection.*failed" test-results/e2e-results.json 2>/dev/null; then
                echo -e "${MAGENTA}🚨 Network errors detected. Checking connectivity...${NC}"

                # Wait a bit and retry
                sleep 5
            fi
        fi

        # Retry logic
        if [ $retry_count -lt $((MAX_RETRIES - 1)) ]; then
            echo -e "${YELLOW}🔄 Retrying tests...${NC}"
            sleep 3
            run_e2e_tests "$test_name" $((retry_count + 1))
            return $?
        fi

        return $exit_code
    fi
}

# Function to analyze test logs
analyze_test_logs() {
    echo -e "${BLUE}📊 Analyzing test logs and errors${NC}"

    local log_files=$(find "$TEST_RESULTS_DIR" -name "*.json" -type f -mmin -30 2>/dev/null | head -5)

    if [ -z "$log_files" ]; then
        echo -e "${YELLOW}⚠️  No recent log files found${NC}"
        return
    fi

    echo -e "${CYAN}📋 Recent test log files:${NC}"
    echo "$log_files" | while read -r log_file; do
        echo "  $log_file"
    done

    # Analyze the most recent log file
    local latest_log=$(echo "$log_files" | head -1)

    if [ -f "$latest_log" ]; then
        echo -e "${CYAN}📈 Analyzing $latest_log${NC}"

        # Count different types of logs
        local error_count=$(grep -c '"level":"error"' "$latest_log" 2>/dev/null || echo "0")
        local critical_count=$(grep -c '"level":"critical"' "$latest_log" 2>/dev/null || echo "0")
        local turbopack_errors=$(grep -c '"type":"turbopack"' "$latest_log" 2>/dev/null || echo "0")
        local js_errors=$(grep -c '"type":"js_error"' "$latest_log" 2>/dev/null || echo "0")
        local network_errors=$(grep -c '"type":"network"' "$latest_log" 2>/dev/null || echo "0")

        echo -e "${CYAN}📊 Test Summary:${NC}"
        echo "  Errors: $error_count"
        echo "  Critical: $critical_count"
        echo "  Turbopack: $turbopack_errors"
        echo "  JavaScript: $js_errors"
        echo "  Network: $network_errors"

        if [ "$error_count" -gt 0 ] || [ "$critical_count" -gt 0 ]; then
            echo -e "${RED}🚨 Issues detected. Check $latest_log for details${NC}"

            # Show some key errors
            echo -e "${MAGENTA}🔍 Key Error Summary:${NC}"
            grep '"level":"critical"' "$latest_log" | head -3 | sed 's/.*"message":"([^"]*)".*/  ❌ \1/' || true
            grep '"level":"error"' "$latest_log" | grep -E '"type":"turbopack"|"type":"js_error"' | head -3 | sed 's/.*"message":"([^"]*)".*/  ❌ \1/' || true
        else
            echo -e "${GREEN}✅ No critical errors detected${NC}"
        fi
    fi
}

# Function to cleanup
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"

    # Kill dev server if we started it
    if [ -n "$DEV_SERVER_PID" ] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        echo -e "${CYAN}🛑 Stopping dev server (PID: $DEV_SERVER_PID)${NC}"
        kill "$DEV_SERVER_PID" 2>/dev/null || true
        sleep 2
    fi

    # Analyze final results
    analyze_test_logs

    echo -e "${GREEN}🏁 Perfect E2E test run completed${NC}"
}

# Trap cleanup function
trap cleanup EXIT

# Main execution
echo -e "${CYAN}🎯 Perfect E2E Test Configuration:${NC}"
echo "  Dev Mode: $DEV_MODE"
echo "  Base URL: $BASE_URL"
echo "  Max Retries: $MAX_RETRIES"
echo "  Test Results: $TEST_RESULTS_DIR"
echo ""

# Check/start dev server
if ! check_dev_server; then
    if ! start_dev_server; then
        echo -e "${RED}❌ Failed to start dev server. Exiting.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Using existing dev server${NC}"
fi

# Run the tests
echo ""
run_e2e_tests "perfect-e2e-suite"

# The cleanup function will run automatically on exit


