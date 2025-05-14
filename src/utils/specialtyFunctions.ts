import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Busca todas as especialidades disponíveis
 * @returns Lista de especialidades
 */
export async function fetchSpecialties() {
  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    return [];
  }
}

/**
 * Busca especialidades que correspondem ao termo de busca
 * @param searchTerm Termo para pesquisar especialidades
 * @returns Lista de especialidades filtradas
 */
export async function searchSpecialties(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true })
      .limit(20);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao pesquisar especialidades:', error);
    return [];
  }
}

/**
 * Associa uma especialidade a um membro
 * @param memberId ID do membro
 * @param specialtyId ID da especialidade
 * @returns Resultado da operação
 */
export async function assignSpecialtyToMember(memberId: string, specialtyId: string) {
  try {
    const { data, error } = await supabase
      .from('member_specialties')
      .insert({
        member_id: memberId,
        specialty_id: specialtyId
      });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao associar especialidade ao membro:', error);
    return { success: false, error };
  }
}

/**
 * Remove a associação de uma especialidade a um membro
 * @param memberId ID do membro
 * @param specialtyId ID da especialidade
 * @returns Resultado da operação
 */
export async function removeSpecialtyFromMember(memberId: string, specialtyId: string) {
  try {
    const { data, error } = await supabase
      .from('member_specialties')
      .delete()
      .match({
        member_id: memberId,
        specialty_id: specialtyId
      });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao remover especialidade do membro:', error);
    return { success: false, error };
  }
}

/**
 * Busca as especialidades de um membro específico
 * @param memberId ID do membro
 * @returns Lista de especialidades do membro
 */
export async function fetchMemberSpecialties(memberId: string) {
  try {
    const { data, error } = await supabase
      .from('member_specialties')
      .select(`
        specialty_id,
        specialties (
          id,
          name
        )
      `)
      .eq('member_id', memberId);
    
    if (error) throw error;
    return data?.map(item => item.specialties) || [];
  } catch (error) {
    console.error('Erro ao buscar especialidades do membro:', error);
    return [];
  }
}

/**
 * Atualiza a especialidade do membro (migração do campo texto para a tabela de relacionamento)
 * @param memberId ID do membro
 * @param specialtyName Nome da especialidade
 * @returns Resultado da operação
 */
export async function updateMemberSpecialty(memberId: string, specialtyId: string) {
  try {
    // Primeiro removemos quaisquer especialidades existentes
    const { error: deleteError } = await supabase
      .from('member_specialties')
      .delete()
      .eq('member_id', memberId);
    
    if (deleteError) throw deleteError;
    
    // Depois adicionamos a nova especialidade
    const { error: insertError } = await supabase
      .from('member_specialties')
      .insert({
        member_id: memberId,
        specialty_id: specialtyId
      });
    
    if (insertError) throw insertError;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar especialidade do membro:', error);
    return { success: false, error };
  }
}
