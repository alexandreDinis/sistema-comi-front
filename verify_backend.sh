#!/bin/bash
OUTPUT_FILE="verification_result.txt"
echo "=== Backend Security Verification Log ===" > $OUTPUT_FILE
echo "Timestamp: $(date)" >> $OUTPUT_FILE

# 1. Check Connectivity
echo "Checking Backend Connectivity..." >> $OUTPUT_FILE
# Method Not Allowed (405) or OK (200) or Forbidden (403) expected if Up. 000 if Down.
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:8080/api/v1/users/me) 
# Note: users/me might be 403 if no token, which implies server UP.
echo "Connectivity Check (/users/me): HTTP $HTTP_CODE" >> $OUTPUT_FILE

if [ "$HTTP_CODE" == "000" ]; then
    echo "CRITICAL: Backend seems DOWN or unreachable (Connection Refused)." >> $OUTPUT_FILE
    exit 1
fi

# 2. Register Test User
EMAIL="verif_$(date +%s)@test.com"
echo "Registering test user: $EMAIL" >> $OUTPUT_FILE
REGISTER_RES=$(curl -s -X POST http://localhost:8080/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"nome\":\"TestUser\",\"email\":\"$EMAIL\",\"senha\":\"password\"}")

# Simple token extraction using sed
TOKEN=$(echo "$REGISTER_RES" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
    echo "Registration failed or returned no token." >> $OUTPUT_FILE
    echo "Response Snippet: ${REGISTER_RES:0:100}" >> $OUTPUT_FILE
else
    echo "Token received." >> $OUTPUT_FILE
    
    # 3. Test Restricted Endpoint (Faturamento)
    echo "Attempting to access Protected Endpoint (/faturamento) as Common User..." >> $OUTPUT_FILE
    
    # We expect 403 if Secured, 200/201 if Open.
    STATUS_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" -X GET \
        http://localhost:8080/api/v1/faturamento \
        -H "Authorization: Bearer $TOKEN")
        
    echo "API Response Status: $STATUS_CODE" >> $OUTPUT_FILE
    
    if [ "$STATUS_CODE" == "200" ] || [ "$STATUS_CODE" == "201" ]; then
        echo "RESULT: FAILURE - Endpoint is OPEN/ACCESSIBLE to common users!" >> $OUTPUT_FILE
    elif [ "$STATUS_CODE" == "403" ]; then
        echo "RESULT: SUCCESS - Endpoint is SECURED (Access Denied)." >> $OUTPUT_FILE
    elif [ "$STATUS_CODE" == "500" ]; then
        echo "RESULT: ERROR - Server Error (500)." >> $OUTPUT_FILE
    else
        echo "RESULT: UNDEFINED (Status $STATUS_CODE). Check manual." >> $OUTPUT_FILE
    fi
fi
