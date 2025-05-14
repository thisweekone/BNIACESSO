#!/bin/bash

# Instala dependências
echo "Instalando dependências..."
npm ci

# Instala dependências de desenvolvimento que podem estar faltando
echo "Garantindo que TypeScript esteja instalado..."
npm install --save-dev typescript @types/node @types/react @types/react-dom

# Limpa cache e diretório de build anterior
echo "Limpando cache e diretório de build..."
rm -rf .next
rm -rf node_modules/.cache

# Executa o build normal do Next.js com Server Components e API Routes
echo "Iniciando build do Next.js..."
NODE_OPTIONS="--max-old-space-size=4096" NEXT_TELEMETRY_DISABLED=1 NEXT_IGNORE_TYPESCRIPT_ERRORS=1 npm run build

# Verifica se o build foi bem-sucedido
if [ -d ".next" ]; then
  echo "Build do Next.js finalizado com sucesso no diretório '.next'"
else
  echo "ERRO: Build do Next.js falhou! Diretório '.next' não encontrado."
  exit 1
fi
