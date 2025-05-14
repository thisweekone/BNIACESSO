'use client';

import {
  VStack,
  Box,
  Text,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Button,
  Flex,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import { FiCalendar, FiExternalLink, FiCheckCircle, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import Link from 'next/link';

interface Reference {
  id: string;
  title: string;
  description: string;
  tags: string;
  created_at: string;
  user_email: string;
  status?: string;
}

interface ReferencesListProps {
  refreshTrigger?: number;
  memberId?: string; // ID do membro para filtrar referências específicas
}

export function ReferencesList({ refreshTrigger = 0, memberId }: ReferencesListProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReferences, setTotalReferences] = useState(0);
  const supabase = createClientComponentClient();
  
  const PAGE_SIZE = 10;

  useEffect(() => {
    async function fetchReferences() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Iniciando busca de referências. MemberID:', memberId, 'Página:', page);
        
        // Se temos um memberId válido, busca associada ao membro
        if (memberId && memberId !== 'temp-id') {
          console.log('Buscando referências para o membro com ID:', memberId);
          
          try {
            // ABORDAGEM 1: Verificar diretamente na tabela member_references
            // Esta tabela deve existir se você tem um sistema de referências entre membros
            console.log('Tentando buscar pela tabela member_references...');
            const { data: referencesData, error: referencesError } = await supabase
              .from('member_references')
              .select('*')
              .or(`member_id.eq.${memberId},giver_id.eq.${memberId}`)
              .order('created_at', { ascending: false });
            
            if (referencesError) {
              console.log('Erro ou tabela member_references não existe:', referencesError);
            } else if (referencesData && referencesData.length > 0) {
              console.log('Referências encontradas na tabela member_references:', referencesData.length);
              setReferences(referencesData);
              setLoading(false);
              return;
            } else {
              console.log('Nenhuma referência encontrada na tabela member_references.');
            }
            
            // ABORDAGEM 2: Buscar pelo email do membro (original)
            console.log('Tentando buscar pelo email do membro...');
            const { data: memberData, error: memberError } = await supabase
              .from('members')
              .select('email, name')
              .eq('id', memberId)
              .single();
            
            console.log('Dados do membro:', memberData, 'Erro:', memberError);
            
            if (memberError) {
              console.error('Erro ao buscar email do membro:', memberError);
              setError('Não foi possível buscar informações do membro');
            } else if (memberData && memberData.email) {
              // Buscar referências relacionadas ao membro pelo email
              console.log('Filtrando referências pelo email:', memberData.email);
              // Primeiro buscar o total para a paginação
              const { count, error: countError } = await supabase
                .from('reference_requests')
                .select('*', { count: 'exact', head: true })
                .eq('user_email', memberData.email);

              if (countError) {
                console.error('Erro ao contar referências:', countError);
              } else if (count !== null) {
                setTotalReferences(count);
                setTotalPages(Math.ceil(count / PAGE_SIZE));
              }

              // Buscar os registros da página atual
              const { data, error } = await supabase
                .from('reference_requests')
                .select('*')
                .eq('user_email', memberData.email)
                .order('created_at', { ascending: false })
                .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
                
              console.log('Resultado da busca por email:', data, 'Erro:', error);
              
              if (error) {
                console.error('Erro ao buscar referências:', error);
                setError('Erro ao buscar referências');
              } else if (data) {
                setReferences(data);
                console.log('Total de referências encontradas:', data.length);
              }
            }
          } catch (err) {
            console.error('Erro ao buscar membro:', err);
            setError('Erro ao processar informações do membro');
          }
        } else {
          // Se não temos um ID válido, usamos o usuário atual
          try {
            console.log('Sem ID de membro válido, buscando pelo usuário atual...');
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user || !user.email) {
              console.error('Usuário não autenticado ou sem email');
              setError('Usuário não autenticado');
              setLoading(false);
              return;
            }
            
            // Busca referências do usuário atual
            console.log('Filtrando referências pelo email do usuário atual:', user.email);
            // Primeiro buscar o total para a paginação
            const { count, error: countError } = await supabase
              .from('reference_requests')
              .select('*', { count: 'exact', head: true })
              .eq('user_email', user.email);

            if (countError) {
              console.error('Erro ao contar referências:', countError);
            } else if (count !== null) {
              setTotalReferences(count);
              setTotalPages(Math.ceil(count / PAGE_SIZE));
            }

            // Buscar os registros da página atual
            const { data, error } = await supabase
              .from('reference_requests')
              .select('*')
              .eq('user_email', user.email)
              .order('created_at', { ascending: false })
              .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
            
            console.log('Resultado da busca pelo usuário atual:', data?.length || 0, 'Erro:', error);
            
            if (error) {
              console.error('Erro ao buscar referências:', error);
              setError('Erro ao buscar referências');
            } else if (data) {
              setReferences(data);
            }
          } catch (err) {
            console.error('Erro ao buscar referências do usuário:', err);
            setError('Erro ao buscar referências');
          }
        }
      } catch (e) {
        console.error('Erro inesperado:', e);
        setError('Erro inesperado ao buscar referências');
      } finally {
        setLoading(false);
      }
    }
    
    fetchReferences();
  }, [memberId, refreshTrigger, supabase, page]); // Adicionado page como dependência

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" color="brand.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (references.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Você ainda não possui referências</Text>
        <Text fontSize="sm" mt={2}>
          Crie um novo pedido de referência clicando no botão "Novo Pedido"
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch" w="full">
        {references.map((reference) => (
        <Box
          key={reference.id}
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          transition="all 0.2s"
          _hover={{ shadow: 'md', borderColor: 'brand.300' }}
        >
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <HStack spacing={2}>
                <Badge colorScheme={reference.status === 'closed' ? 'green' : 'blue'}>
                  {reference.status === 'closed' ? 'Finalizada' : 'Aberta'}
                </Badge>
                <Text fontWeight="medium">{reference.user_email}</Text>
              </HStack>
              <HStack spacing={2} fontSize="sm" color="gray.500">
                <Icon as={FiCalendar} />
                <Text>
                  {new Date(reference.created_at).toLocaleDateString()}
                </Text>
              </HStack>
            </HStack>
            
            <Text fontWeight="bold" fontSize="lg">{reference.title}</Text>
            
            <Text color="gray.600" noOfLines={2}>{reference.description}</Text>
            
            <HStack spacing={2} flexWrap="wrap">
              {reference.tags && reference.tags.split(',').map((tag, index) => (
                <Badge key={index} colorScheme="brand">
                  {tag.trim()}
                </Badge>
              ))}
            </HStack>
            
            <HStack spacing={2}>
              <Button
                as={Link}
                href={`/dashboard/referencias/${reference.id}`}
                size="sm"
                colorScheme="brand"
                leftIcon={<FiExternalLink />}
              >
                Ver Detalhes
              </Button>
              
              <Tooltip label={reference.status === 'closed' ? 'Referência finalizada' : 'Referência em aberto'}>
                <Icon
                  as={reference.status === 'closed' ? FiCheckCircle : FiAlertCircle}
                  color={reference.status === 'closed' ? 'green.500' : 'blue.500'}
                  boxSize={5}
                />
              </Tooltip>
            </HStack>
          </VStack>
        </Box>
      ))}
      </VStack>
      
      {/* Paginação */}
      {totalPages > 1 && (
        <Flex mt={6} justify="center" align="center" gap={2}>
          <IconButton 
            icon={<FiChevronLeft />} 
            aria-label="Anterior" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            isDisabled={page === 1} 
          />
          <Text>Página {page} de {totalPages}</Text>
          <IconButton 
            icon={<FiChevronRight />} 
            aria-label="Próxima" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            isDisabled={page === totalPages} 
          />
        </Flex>
      )}
    </Box>
  );
}
