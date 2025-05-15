import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL do perfil BNI é obrigatória' },
        { status: 400 }
      );
    }

    // Fazer a requisição para o site do BNI
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha ao acessar o perfil no site do BNI' },
        { status: response.status }
      );
    }

    const html = await response.text();
    
    // Usar cheerio para extrair dados do HTML
    const $ = cheerio.load(html);
    
    // Extrair informações do perfil
    const nome = $('.member-profile-content h1').text().trim();
    const empresa = $('.member-profile-content h2').first().text().trim();
    const industria = $('.member-profile-content .industry').text().trim();
    
    // Extrair as seções principais
    const meuNegocioSection = $('h3:contains("Meu Negócio")').next('p').text().trim();
    const referenciaIdealSection = $('h3:contains("REFERÊNCIA IDEAL")').parent().find('p').text().trim();
    const problemaResolvidoSection = $('h3:contains("PRINCIPAL PROBLEMA RESOLVIDO")').parent().find('p').text().trim();
    const produtoPrincipalSection = $('h3:contains("PRODUTO PRINCIPAL")').parent().find('p').text().trim();
    const historiaFavoritaSection = $('h3:contains("MINHA HISTÓRIA FAVORITA DO BNI")').parent().find('p').text().trim();
    const parceiroIdealSection = $('h3:contains("MEU PARCEIRO IDEAL DE REFERÊNCIA")').parent().find('p').text().trim();
    
    // Extrair contatos
    const telefone = $('a[href^="tel:"]').attr('href')?.replace('tel:', '') || '';
    const email = $('a[href^="mailto:"]').attr('href')?.replace('mailto:', '') || '';
    const website = $('.website-url').text().trim();
    
    // Montar o objeto com as informações extraídas
    const profileData = {
      nome,
      empresa,
      industria,
      meuNegocio: meuNegocioSection,
      referenciaIdeal: referenciaIdealSection,
      problemaResolvido: problemaResolvidoSection, 
      produtoPrincipal: produtoPrincipalSection,
      historiaFavorita: historiaFavoritaSection,
      parceiroIdeal: parceiroIdealSection,
      contatos: {
        telefone,
        email,
        website
      }
    };

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Erro ao extrair dados do perfil:', error);
    return NextResponse.json(
      { error: 'Falha ao processar os dados do perfil BNI' },
      { status: 500 }
    );
  }
}
