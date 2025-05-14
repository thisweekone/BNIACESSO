import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  // Verificar se estamos em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Esta API só está disponível em ambiente de desenvolvimento' }, { status: 403 });
  }

  try {
    // Criar cliente Supabase usando o helper do Next.js
    const supabase = createClientComponentClient();

    // Script de migração
    const migrationScript = `
    -- Adicionar UUID extension se ainda não existir
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Tabela para armazenar as respostas às referências
    CREATE TABLE IF NOT EXISTS reference_responses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      request_id UUID REFERENCES reference_requests(id) ON DELETE CASCADE,
      responder_id UUID REFERENCES members(id),
      responder_email TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      company_name TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      contact_address TEXT,
      description TEXT,
      heat_level INTEGER NOT NULL, -- 1-5 indicando quão "quente" é a referência
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Tabela para armazenar o histórico de contatos para alertas futuros
    CREATE TABLE IF NOT EXISTS contact_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      member_id UUID REFERENCES members(id),
      contact_name TEXT NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      tags TEXT, -- Tags associadas à referência original
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Adicionar campo status à tabela reference_requests se não existir
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'reference_requests' AND column_name = 'status') THEN
        ALTER TABLE reference_requests ADD COLUMN status TEXT DEFAULT 'open';
      END IF;
    END $$;
    `;

    // Executar o script SQL diretamente
    const { error: sqlError } = await supabase.rpc('sql', { query: migrationScript });

    if (sqlError) {
      console.error('Erro ao executar migração via RPC:', sqlError);
      
      // Tentar adicionar apenas a coluna status
      const { error: alterError } = await supabase.rpc('sql', 
        { query: "ALTER TABLE reference_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open'" });
      
      if (alterError) {
        console.error('Erro ao adicionar coluna status:', alterError);
        
        // Executar SQL direto para cada tabela individualmente
        const createResponses = await supabase.rpc('sql', {
          query: `
          CREATE TABLE IF NOT EXISTS reference_responses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            request_id UUID REFERENCES reference_requests(id) ON DELETE CASCADE,
            responder_id UUID REFERENCES members(id),
            responder_email TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            company_name TEXT,
            contact_phone TEXT,
            contact_email TEXT,
            contact_address TEXT,
            description TEXT,
            heat_level INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );`
        });
        
        const createHistory = await supabase.rpc('sql', {
          query: `
          CREATE TABLE IF NOT EXISTS contact_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            member_id UUID REFERENCES members(id),
            contact_name TEXT NOT NULL,
            contact_email TEXT,
            contact_phone TEXT,
            tags TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );`
        });
        
        return NextResponse.json({ 
          status: 'Tentativa de criar tabelas individualmente',
          responses: createResponses.error ? 'Falha' : 'Sucesso',
          history: createHistory.error ? 'Falha' : 'Sucesso',
          message: 'Talvez seja necessário executar o script manualmente no Console do Supabase.'
        });
      }
      
      return NextResponse.json({ 
        status: 'Parcial', 
        message: 'Adicionada coluna status à tabela reference_requests, mas não foi possível criar as outras tabelas.' 
      });
    }

    return NextResponse.json({ status: 'Sucesso', message: 'Migração concluída com sucesso!' });
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return NextResponse.json({ 
      status: 'Erro', 
      message: 'Erro inesperado ao executar migração', 
      details: error.message 
    }, { status: 500 });
  }
}
