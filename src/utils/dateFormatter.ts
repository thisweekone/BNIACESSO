/**
 * Utilitário para formatação de datas relativas em português
 * Retorna strings como "há 2 dias", "há 5 minutos", etc.
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Menos de 1 minuto
  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }
  
  // Menos de 1 hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  // Menos de 1 dia
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  
  // Menos de 1 mês (30 dias)
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  
  // Menos de 1 ano
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  
  // Mais de 1 ano
  const years = Math.floor(diffInSeconds / 31536000);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}
