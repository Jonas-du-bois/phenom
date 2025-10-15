#!/bin/bash
# scripts/monitor.sh - Script de monitoring des services

echo "🔍 Monitoring Phenom App"
echo "========================"
echo ""

echo "📊 État des services Docker:"
docker-compose ps
echo ""

echo "💾 Utilisation des ressources:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""

echo "💿 Utilisation disque Docker:"
docker system df
echo ""

echo "🏥 Health checks:"
echo -n "Backend: "
curl -f -s http://localhost:3000/health > /dev/null && echo "✅ OK" || echo "❌ DOWN"

echo -n "Frontend: "
curl -f -s http://localhost/ > /dev/null && echo "✅ OK" || echo "❌ DOWN"
echo ""

echo "📝 Derniers logs d'erreur (Backend):"
docker-compose logs --tail=10 backend | grep -i error || echo "Aucune erreur récente"
echo ""

echo "📈 Nombre de containers actifs:"
echo "Total: $(docker ps -q | wc -l)"
echo "Phenom: $(docker ps --filter name=phenom -q | wc -l)"
