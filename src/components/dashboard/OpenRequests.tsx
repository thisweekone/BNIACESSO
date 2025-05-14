'use client';

import {
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  Avatar,
  Button,
  useColorModeValue,
  Input,
  Select,
  Spacer,
  IconButton,
  HStack,
  ButtonGroup,
  Tooltip,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiEye, FiList } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface OpenRequest {
  id: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
  user_email: string;
}

interface OpenRequestsProps {
  userEmail?: string;
  userGroup?: string;
  userSpecialty?: string;
  onRequestSelect?: (requestId: string) => void;
  onViewDetails?: (requestId: string) => void;
}

const supabase = createClientComponentClient();

export function OpenRequests({ userEmail, userGroup, userSpecialty, onRequestSelect, onViewDetails }: OpenRequestsProps) {
  const [requests, setRequests] = useState<OpenRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tagFilter, setTagFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([]);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const PAGE_SIZE = 10;

  useEffect(() => {
    async function fetchSpecialties() {
      const { data, error } = await supabase.from('members').select('specialty').neq('specialty', '').order('specialty', { ascending: true });
      if (!error && data) {
        const unique = Array.from(new Set(data.map((m: any) => m.specialty).filter(Boolean)));
        setSpecialtyOptions(unique);
      }
    }
    fetchSpecialties();
  }, []);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      let query = supabase.from('reference_requests').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (tagFilter) query = query.ilike('tags', `%${tagFilter}%`);
      if (nameFilter) query = query.ilike('user_email', `%${nameFilter}%`);
      if (specialtyFilter) {
        const { data: members, error: membersError } = await supabase.from('members').select('email').eq('specialty', specialtyFilter);
        if (!membersError && members) {
          const emails = members.map((m: any) => m.email);
          if (emails.length > 0) {
            query = query.in('user_email', emails);
          } else {
            setRequests([]);
            setTotalPages(1);
            setLoading(false);
            return;
          }
        }
      }
      if (userEmail) query = query.eq('user_email', userEmail);
      if (userGroup) {
        const { data: members, error: membersError } = await supabase.from('members').select('email').eq('group_id', userGroup);
        if (!membersError && members) {
          const emails = members.map((m: any) => m.email);
          if (emails.length > 0) {
            query = query.in('user_email', emails);
          } else {
            setRequests([]);
            setTotalPages(1);
            setLoading(false);
            return;
          }
        }
      }
      query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      const { data, error, count } = await query;
      if (!error && data) {
        setRequests(data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
          created_at: item.created_at,
          user_email: item.user_email || 'Usuário',
        })));
        setTotalPages(count ? Math.ceil(count / PAGE_SIZE) : 1);
      }
      setLoading(false);
    }
    fetchRequests();
  }, [page, tagFilter, nameFilter, specialtyFilter, userEmail, userGroup]);

  const handleSelect = (requestId: string) => {
    setSelectedId(requestId);
    onRequestSelect?.(requestId);
  };
  
  const handleViewDetails = (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(requestId);
    } else {
      // Fallback se não houver um handler específico
      window.location.href = `/dashboard/referencias/${requestId}`;
    }
  };

  return (
    <Box>
      <Flex mb={4} gap={2}>
        <Input placeholder="Buscar por nome" value={nameFilter} onChange={e => setNameFilter(e.target.value)} maxW="200px" />
        <Input placeholder="Buscar por tag" value={tagFilter} onChange={e => setTagFilter(e.target.value)} maxW="200px" />
        <Select placeholder="Especialidade" value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)} maxW="200px">
          {specialtyOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
        <Spacer />
      </Flex>
      <VStack spacing={4} align="stretch">
        {loading ? <Text>Carregando...</Text> :
          requests.map((request) => (
            <Box
              key={request.id}
              p={4}
              borderWidth="1px"
              borderColor={request.id === selectedId ? 'brand.500' : borderColor}
              borderRadius="md"
              _hover={{ borderColor: 'brand.300' }}
            >
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="medium">{request.user_email}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(request.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </HStack>
                <Text fontWeight="bold">{request.title}</Text>
                <Text color="gray.600">{request.description}</Text>
                <HStack spacing={2}>
                  {request.tags.map((tag) => (
                    <Badge key={tag} colorScheme="brand">{tag}</Badge>
                  ))}
                </HStack>
                <ButtonGroup spacing={2} size="sm">
                  <Button
                    leftIcon={<FiEye />}
                    colorScheme="brand"
                    variant="solid"
                    onClick={(e) => handleViewDetails(request.id, e)}
                  >
                    Ver Detalhes
                  </Button>
                  
                  {onRequestSelect && (
                    <Tooltip label="Ver possíveis matches para esta referência">
                      <Button
                        leftIcon={<FiList />}
                        colorScheme="brand"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(request.id);
                        }}
                      >
                        Ver Matches
                      </Button>
                    </Tooltip>
                  )}
                </ButtonGroup>
              </VStack>
            </Box>
          ))}
      </VStack>
      <Flex mt={6} justify="center" align="center" gap={2}>
        <IconButton icon={<FiChevronLeft />} aria-label="Anterior" onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={page === 1} />
        <Text>Página {page} de {totalPages}</Text>
        <IconButton icon={<FiChevronRight />} aria-label="Próxima" onClick={() => setPage(p => Math.min(totalPages, p + 1))} isDisabled={page === totalPages} />
      </Flex>
    </Box>
  );
}