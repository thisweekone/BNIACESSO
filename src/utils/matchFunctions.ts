import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ReferenceMatch } from '@/types/references';

/**
 * Encontra matches para uma solicitação de referência específica
 */
export async function findMatchesForRequest(requestId: string): Promise<ReferenceMatch[]> {
  const supabase = createClientComponentClient();

  try {
    // Busca a solicitação de referência atual
    const { data: request, error: requestError } = await supabase
      .from('reference_requests')
      .select('title, description, tags, user_email')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) throw new Error('Solicitação não encontrada');

    // Prepara as tags para comparação (array de strings em lowercase)
    const currentTags: string[] = request.tags
      ? request.tags.split(',').map((tag: string) => tag.trim().toLowerCase())
      : [];

    // Busca todas as outras solicitações (exceto a atual e do mesmo usuário)
    const { data: otherRequests, error: otherRequestsError } = await supabase
      .from('reference_requests')
      .select('id, title, description, tags, user_email, created_at')
      .neq('id', requestId)
      .neq('user_email', request.user_email)
      .order('created_at', { ascending: false });

    if (otherRequestsError) throw otherRequestsError;
    if (!otherRequests || otherRequests.length === 0) return [];

    // Calcula a pontuação de match para cada solicitação
    const matches: ReferenceMatch[] = otherRequests
      .map(otherRequest => {
        const otherTags: string[] = otherRequest.tags
          ? otherRequest.tags.split(',').map((tag: string) => tag.trim().toLowerCase())
          : [];

        // Calcula a sobreposição de tags
        const tagOverlap = currentTags.filter((tag: string) => otherTags.includes(tag)).length;
        
        // Calcula similaridade baseada em texto usando match de palavras-chave
        const currentWords = extractKeywords(`${request.title} ${request.description}`);
        const otherWords = extractKeywords(`${otherRequest.title} ${otherRequest.description}`);
        const textSimilarity = calculateTextSimilarity(currentWords, otherWords);

        // Pontuação final: 70% relevância de tags + 30% similaridade de texto
        const matchScore = tagOverlap > 0 
          ? (tagOverlap / Math.max(currentTags.length, otherTags.length) * 0.7) + (textSimilarity * 0.3)
          : textSimilarity * 0.5; // Se não houver sobreposição de tags, reduz a pontuação

        return {
          request_id: otherRequest.id,
          user_email: otherRequest.user_email,
          title: otherRequest.title,
          description: otherRequest.description,
          tags: otherRequest.tags,
          created_at: otherRequest.created_at,
          match_score: matchScore,
          matching_tags: currentTags.filter((tag: string) => otherTags.includes(tag))
        };
      })
      .filter(match => match.match_score > 0.3) // Filtra apenas matches com pontuação relevante
      .sort((a, b) => b.match_score - a.match_score) // Ordena por pontuação (maior primeiro)
      .slice(0, 10); // Limita a 10 matches

    return matches;
  } catch (error) {
    console.error('Erro ao buscar matches:', error);
    throw error;
  }
}

/**
 * Extrai palavras-chave de um texto
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];

  // Remove caracteres especiais e converte para minúsculas
  const cleanText = text.toLowerCase().replace(/[^\w\sáàâãéèêíìîóòôõúùûçñ]/g, '');
  
  // Divide em palavras e filtra
  const words = cleanText.split(/\s+/);
  
  // Remove palavras comuns (stopwords) e palavras muito curtas
  const stopwords = ['a', 'e', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'da', 'do', 'das', 'dos', 
    'na', 'no', 'nas', 'nos', 'em', 'para', 'por', 'com', 'sem', 'sob', 'sobre', 'de', 'que', 'se'];
  
  return words
    .filter(word => word.length > 2 && !stopwords.includes(word))
    .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicatas
}

/**
 * Calcula a similaridade entre dois conjuntos de palavras
 */
function calculateTextSimilarity(words1: string[], words2: string[]): number {
  if (!words1.length || !words2.length) return 0;
  
  // Palavras em comum
  const commonWords = words1.filter(word => words2.includes(word));
  
  // Coeficiente de Jaccard (interseção / união)
  const union = new Set([...words1, ...words2]).size;
  const similarity = commonWords.length / union;
  
  return similarity;
}

/**
 * Busca informações sobre o usuário de uma referência usando a tabela members
 */
export async function getUserInfoForMatches(userEmails: string[]): Promise<Record<string, any>> {
  if (!userEmails.length) return {};
  
  const supabase = createClientComponentClient();
  const userInfo: Record<string, any> = {};

  try {
    // Tenta buscar da tabela members
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .in('email', userEmails);

    if (!error && data) {
      data.forEach(member => {
        userInfo[member.email] = {
          email: member.email,
          name: member.name || member.nome,  // Considerando ambos os campos possíveis
          company: member.company || member.empresa,
          role: member.role || member.cargo,
          avatar_url: member.avatar_url || member.photo || member.foto
        };
      });
    }
  } catch (error) {
    console.warn('Erro ao buscar informações da tabela members:', error);
  }
  
  // Para emails que não encontramos na tabela members, geramos informações básicas
  userEmails.forEach(email => {
    if (!userInfo[email]) {
      // Extrai o nome do email (parte antes do @)
      const name = email.split('@')[0].replace(/[\._]/g, ' ');
      const formattedName = name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      userInfo[email] = {
        email,
        name: formattedName,
        avatar_url: null,
        company: null,
        role: null
      };
    }
  });

  return userInfo;
}
