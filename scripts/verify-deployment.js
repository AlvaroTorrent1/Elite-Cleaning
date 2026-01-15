#!/usr/bin/env node

/**
 * Script de verificación de configuración de deployment
 * Verifica que todas las variables de entorno necesarias estén configuradas
 */

const requiredEnvVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'URL de tu proyecto Supabase',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Anon key de Supabase',
  'NEXT_PUBLIC_SITE_URL': 'URL de tu sitio en producción (https://...)'
};

const optionalEnvVars = {
  'VERCEL_URL': 'URL automática de Vercel (no configurar manualmente)'
};

console.log('🔍 Verificando configuración de deployment...\n');

let hasErrors = false;
let hasWarnings = false;

// Verificar variables requeridas
console.log('📋 Variables Requeridas:');
for (const [key, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[key];
  if (!value) {
    console.log(`  ❌ ${key}: NO CONFIGURADA`);
    console.log(`     → ${description}`);
    hasErrors = true;
  } else {
    // Ocultar valores sensibles
    const displayValue = key.includes('KEY') 
      ? `${value.substring(0, 10)}...` 
      : value;
    console.log(`  ✅ ${key}: ${displayValue}`);
  }
}

console.log('\n📋 Variables Opcionales:');
for (const [key, description] of Object.entries(optionalEnvVars)) {
  const value = process.env[key];
  if (value) {
    console.log(`  ✅ ${key}: ${value}`);
  } else {
    console.log(`  ℹ️  ${key}: No configurada (OK en local)`);
  }
}

// Verificar configuración de URLs
console.log('\n🌐 Verificación de URLs:');

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const vercelUrl = process.env.VERCEL_URL;

if (siteUrl) {
  if (!siteUrl.startsWith('https://') && !siteUrl.startsWith('http://localhost')) {
    console.log(`  ⚠️  NEXT_PUBLIC_SITE_URL debe empezar con https:// (o http://localhost para desarrollo)`);
    hasWarnings = true;
  }
  
  if (siteUrl.endsWith('/')) {
    console.log(`  ⚠️  NEXT_PUBLIC_SITE_URL no debe terminar con /`);
    hasWarnings = true;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  if (!supabaseUrl.startsWith('https://')) {
    console.log(`  ⚠️  NEXT_PUBLIC_SUPABASE_URL debe empezar con https://`);
    hasWarnings = true;
  }
  
  if (!supabaseUrl.includes('.supabase.co')) {
    console.log(`  ⚠️  NEXT_PUBLIC_SUPABASE_URL debe ser una URL de Supabase (.supabase.co)`);
    hasWarnings = true;
  }
}

// Determinar el origin que se usará
console.log('\n🎯 Origin que se usará para redirects:');
const origin = process.env.NEXT_PUBLIC_SITE_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'http://localhost:3000';

console.log(`  → ${origin}`);

if (origin === 'http://localhost:3000' && process.env.VERCEL) {
  console.log(`  ⚠️  Estás en Vercel pero usando localhost como origin!`);
  console.log(`     Configura NEXT_PUBLIC_SITE_URL en Vercel`);
  hasErrors = true;
}

// Resumen
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ ERRORES ENCONTRADOS - Revisa la configuración');
  console.log('\n📖 Lee DEPLOYMENT-FIX.md para instrucciones detalladas');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  ADVERTENCIAS ENCONTRADAS - Revisa las recomendaciones');
  process.exit(0);
} else {
  console.log('✅ CONFIGURACIÓN CORRECTA');
  console.log('\n🚀 La aplicación debería funcionar correctamente');
  process.exit(0);
}
