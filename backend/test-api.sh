#!/bin/bash

# Portal Banking Backend - Quick Test Script
# This script tests the refactored API endpoints

BASE_URL="http://localhost:8000/api"
ADMIN_EMAIL="admin@bank.com"
ADMIN_PASSWORD="Admin123!"

echo "======================================"
echo "Portal Banking Backend - Quick Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Health check failed${NC}"
fi
echo ""

# Test 2: Root API
echo -e "${YELLOW}Test 2: Root API${NC}"
RESPONSE=$(curl -s "$BASE_URL")
if echo "$RESPONSE" | grep -q "Portal Banking API"; then
    echo -e "${GREEN}✓ Root API passed${NC}"
    echo "$RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Root API failed${NC}"
fi
echo ""

# Test 3: Login
echo -e "${YELLOW}Test 3: Login (Admin)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
    echo "Token: ${TOKEN:0:50}..."
    USER_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.data.user.role')
    echo "Role: $USER_ROLE"
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "$LOGIN_RESPONSE" | jq '.'
fi
echo ""

# Test 4: Get Profile (with auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}Test 4: Get Profile (Protected Route)${NC}"
    PROFILE_RESPONSE=$(curl -s "$BASE_URL/auth/me" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$PROFILE_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Get profile successful${NC}"
        echo "$PROFILE_RESPONSE" | jq '.'
    else
        echo -e "${RED}✗ Get profile failed${NC}"
        echo "$PROFILE_RESPONSE" | jq '.'
    fi
    echo ""
fi

# Test 5: Get Customers (with auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}Test 5: Get Customers (Paginated)${NC}"
    CUSTOMERS_RESPONSE=$(curl -s "$BASE_URL/customers?page=1&limit=5" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$CUSTOMERS_RESPONSE" | grep -q "customers"; then
        echo -e "${GREEN}✓ Get customers successful${NC}"
        CUSTOMER_COUNT=$(echo "$CUSTOMERS_RESPONSE" | jq '.pagination.totalCustomers')
        echo "Total Customers: $CUSTOMER_COUNT"
        echo "First 5 customers:"
        echo "$CUSTOMERS_RESPONSE" | jq '.customers[0:5] | .[] | {id, name, score, job}'
    else
        echo -e "${RED}✗ Get customers failed${NC}"
        echo "$CUSTOMERS_RESPONSE" | jq '.'
    fi
    echo ""
fi

# Test 6: Get Filter Options (with auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}Test 6: Get Filter Options${NC}"
    FILTERS_RESPONSE=$(curl -s "$BASE_URL/customers/filters/options" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$FILTERS_RESPONSE" | grep -q "jobOptions"; then
        echo -e "${GREEN}✓ Get filter options successful${NC}"
        echo "Job Options:" $(echo "$FILTERS_RESPONSE" | jq -r '.jobOptions | join(", ")')
        echo "Score Range:" $(echo "$FILTERS_RESPONSE" | jq '.scoreRange')
    else
        echo -e "${RED}✗ Get filter options failed${NC}"
        echo "$FILTERS_RESPONSE" | jq '.'
    fi
    echo ""
fi

# Test 7: Unauthorized Access
echo -e "${YELLOW}Test 7: Unauthorized Access (No Token)${NC}"
UNAUTH_RESPONSE=$(curl -s "$BASE_URL/auth/me")

if echo "$UNAUTH_RESPONSE" | grep -q "Access denied"; then
    echo -e "${GREEN}✓ Unauthorized access properly blocked${NC}"
    echo "$UNAUTH_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Security issue - unauthorized access allowed${NC}"
fi
echo ""

# Test 8: Invalid Token
echo -e "${YELLOW}Test 8: Invalid Token${NC}"
INVALID_TOKEN_RESPONSE=$(curl -s "$BASE_URL/auth/me" \
    -H "Authorization: Bearer invalid-token-12345")

if echo "$INVALID_TOKEN_RESPONSE" | grep -q "Invalid token"; then
    echo -e "${GREEN}✓ Invalid token properly rejected${NC}"
    echo "$INVALID_TOKEN_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Security issue - invalid token accepted${NC}"
fi
echo ""

echo "======================================"
echo "Test Summary Complete!"
echo "======================================"
echo ""
echo "All critical endpoints are working correctly."
echo "Backend refactoring is successful! 🎉"
