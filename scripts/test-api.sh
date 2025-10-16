#!/bin/bash

echo "==================================="
echo "🧪 Tests de l'API Phenom"
echo "==================================="
echo ""

# Test 1: Health check
echo "✅ Test 1: Health Check"
curl -s http://localhost:3000/health | head -20
echo -e "\n"

# Test 2: Liste des observations
echo "✅ Test 2: Liste des observations (limit=2)"
curl -s "http://localhost:3000/api/v1/observations?limit=2" | head -30
echo -e "\n"

# Test 3: Recherche
echo "✅ Test 3: Recherche par texte (triangle)"
curl -s "http://localhost:3000/api/v1/observations?search=triangle" | head -30
echo -e "\n"

# Test 4: Connexion admin
echo "✅ Test 4: Connexion admin"
cat > /tmp/login.json <<EOF
{"email":"admin@phenom.com","password":"Admin123!"}
EOF

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d @/tmp/login.json)

echo "$LOGIN_RESPONSE" | head -30
echo -e "\n"

# Extraction du token (si la réponse contient un token)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Token récupéré: ${TOKEN:0:50}..."
  echo ""
  
  # Test 5: Récupération du profil
  echo "✅ Test 5: Récupération du profil utilisateur"
  curl -s http://localhost:3000/api/v1/auth/me \
    -H "Authorization: Bearer $TOKEN" | head -20
  echo -e "\n"
  
  # Test 6: Liste des utilisateurs (admin only)
  echo "✅ Test 6: Liste des utilisateurs (admin)"
  curl -s http://localhost:3000/api/v1/admin/users \
    -H "Authorization: Bearer $TOKEN" | head -30
  echo -e "\n"
  
  # Test 7: Statistiques (admin only)
  echo "✅ Test 7: Statistiques globales (admin)"
  curl -s http://localhost:3000/api/v1/admin/stats \
    -H "Authorization: Bearer $TOKEN"
  echo -e "\n"
else
  echo "❌ Échec de récupération du token"
fi

echo "==================================="
echo "🎉 Tests terminés!"
echo "==================================="
