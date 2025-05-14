import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MatchSuggestion, MemberStats, Reference, ReferenceFilters } from '@/types/references';

export class ReferenceService {
  private supabase = createClientComponentClient();

  async getMatches(requestId: string, forceRefresh: boolean = false): Promise<MatchSuggestion[]> {
    try {
      const { data: matches, error } = await this.supabase
        .rpc('match_references', { 
          p_request_id: requestId,
          p_force_refresh: forceRefresh 
        });

      if (error) throw error;
      return matches || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }

  async getMemberStats(memberIds: string[]): Promise<Record<string, MemberStats>> {
    try {
      const { data, error } = await this.supabase
        .from('reference_statistics')
        .select('*')
        .in('member_id', memberIds);

      if (error) throw error;

      const stats: Record<string, MemberStats> = {};
      data?.forEach(stat => {
        stats[stat.member_id] = {
          references_given: stat.completed_references || 0,
          references_received: stat.received_references || 0,
          success_rate: stat.success_rate || 0,
          avg_value: stat.avg_value || 0,
          total_value: stat.total_value || 0,
          unique_connections: stat.unique_connections || 0
        };
      });

      return stats;
    } catch (error) {
      console.error('Error fetching member stats:', error);
      throw error;
    }
  }

  async createReferenceRequest(
    originalRequestId: string, 
    targetMemberId: string
  ): Promise<void> {
    try {
      // Primeiro busca os detalhes do pedido original
      const { data: originalRequest, error: fetchError } = await this.supabase
        .from('reference_requests')
        .select('title, description, tags')
        .eq('id', originalRequestId)
        .single();

      if (fetchError) throw fetchError;
      if (!originalRequest) throw new Error('Original request not found');

      // Cria o novo pedido
      const { error: insertError } = await this.supabase
        .from('reference_requests')
        .insert({
          title: `Solicitação de referência: ${originalRequest.title}`,
          description: `Baseado no seu perfil e experiência com: ${originalRequest.description}`,
          tags: originalRequest.tags,
          target_member_id: targetMemberId,
          original_request_id: originalRequestId,
          status: 'pending'
        });

      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error creating reference request:', error);
      throw error;
    }
  }

  async updateReferenceStatus(
    referenceId: string, 
    status: Reference['status'],
    value?: number
  ): Promise<void> {
    try {
      const updateData: Partial<Reference> = {
        status,
        ...(status === 'completed' ? { 
          completed_at: new Date().toISOString(),
          value 
        } : {})
      };

      const { error } = await this.supabase
        .from('reference_requests')
        .update(updateData)
        .eq('id', referenceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reference status:', error);
      throw error;
    }
  }

  async getReferences(filters?: ReferenceFilters): Promise<Reference[]> {
    try {
      let query = this.supabase
        .from('reference_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.status?.length) {
          query = query.in('status', filters.status);
        }

        if (filters.tags?.length) {
          const tagConditions = filters.tags.map(tag => 
            `tags ILIKE '%${tag}%'`
          ).join(' OR ');
          query = query.or(tagConditions);
        }

        if (filters.dateRange) {
          query = query
            .gte('created_at', filters.dateRange.start.toISOString())
            .lte('created_at', filters.dateRange.end.toISOString());
        }

        if (filters.valueRange) {
          query = query
            .gte('value', filters.valueRange.min)
            .lte('value', filters.valueRange.max);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching references:', error);
      throw error;
    }
  }

  async getTagSuggestions(partial: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .select('name')
        .ilike('name', `%${partial}%`)
        .limit(10);

      if (error) throw error;
      return data?.map(tag => tag.name) || [];
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      throw error;
    }
  }
} 