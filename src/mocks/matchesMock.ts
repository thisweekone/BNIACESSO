import { Match } from '../types/match';

export const mockMatches: Match[] = [
  {
    id: '1',
    memberName: 'João Silva',
    similarity: 0.85,
    historicalSuccess: 0.92,
    commonTags: ['Marketing Digital', 'Vendas B2B', 'Networking']
  },
  {
    id: '2',
    memberName: 'Maria Santos',
    similarity: 0.75,
    historicalSuccess: 0.88,
    commonTags: ['Consultoria', 'Gestão de Projetos', 'Estratégia']
  },
  {
    id: '3',
    memberName: 'Pedro Oliveira',
    similarity: 0.95,
    historicalSuccess: 0.78,
    commonTags: ['Tecnologia', 'Startups', 'Inovação', 'Desenvolvimento Web']
  },
  {
    id: '4',
    memberName: 'Ana Costa',
    similarity: 0.68,
    historicalSuccess: 0.95,
    commonTags: ['RH', 'Recrutamento', 'Treinamento']
  },
  {
    id: '5',
    memberName: 'Lucas Ferreira',
    similarity: 0.72,
    historicalSuccess: 0.85,
    commonTags: ['Finanças', 'Investimentos', 'Planejamento Financeiro']
  }
]; 