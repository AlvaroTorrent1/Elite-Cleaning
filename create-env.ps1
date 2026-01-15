# Script para crear .env.local
# Ejecuta este archivo con: .\create-env.ps1

$envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://oaysmidoxtyykhqrpzai.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heXNtaWRveHR5eWtocXJwemFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTk4MjUsImV4cCI6MjA4MzQ3NTgyNX0.5PyZpKBC0GbTpHzau45vnM6GUZo97RfyDFGgdZLDgeY
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8

Write-Host "✅ Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximo paso:" -ForegroundColor Yellow
Write-Host "1. Ve a Supabase Dashboard" -ForegroundColor Cyan
Write-Host "2. Abre el SQL Editor" -ForegroundColor Cyan
Write-Host "3. Copia el contenido de: supabase\migrations\001_initial_schema.sql" -ForegroundColor Cyan
Write-Host "4. Pégalo en el SQL Editor y haz clic en RUN" -ForegroundColor Cyan
