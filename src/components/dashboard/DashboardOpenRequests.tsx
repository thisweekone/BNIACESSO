'use client';

import {
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  Button,
  useColorModeValue,
  HStack,
  Center,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface OpenRequest {
  id: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
  user_email: string;
}

export function DashboardOpenRequests() {
  const [requests, setRequests] = useState<OpenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        // Buscar apenas os 5 pedidos mais recentes
        const { data, error } = await supabase
          .from('reference_requests')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        if (data) {
          setRequests(data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
            created_at: item.created_at,
            user_email: item.user_email || 'Usuário',
          })));
        }
      } catch (err) {
        console.error('Erro ao buscar pedidos em aberto:', err);
        setError('Erro ao carregar os pedidos em aberto');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <Center py={4}>
        <Spinner size="md" color="brand.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md" size="sm">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Não há pedidos em aberto no momento</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={3} align="stretch">
        {requests.map((request) => (
          <Box
            key={request.id}
            p={3}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            _hover={{ borderColor: 'brand.300' }}
            onClick={() => router.push(`/dashboard/referencias/${request.id}`)}
            cursor="pointer"
          >
            <VStack align="start" spacing={2}>
              <Flex justify="space-between" w="full">
                <Text fontWeight="medium" fontSize="sm">{request.user_email}</Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(request.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </Flex>
              <Text fontWeight="bold" noOfLines={1}>{request.title}</Text>
              <Text color="gray.600" fontSize="sm" noOfLines={1}>{request.description}</Text>
              <HStack spacing={1} flexWrap="wrap">
                {request.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} colorScheme="brand" fontSize="xs">{tag}</Badge>
                ))}
                {request.tags.length > 3 && (
                  <Badge colorScheme="gray" fontSize="xs">+{request.tags.length - 3}</Badge>
                )}
              </HStack>
            </VStack>
          </Box>
        ))}
      </VStack>
      
      <Button
        mt={4}
        size="sm"
        rightIcon={<FiArrowRight />}
        variant="outline"
        colorScheme="brand"
        w="full"
        onClick={() => router.push('/dashboard/referencias')}
      >
        Ver mais pedidos
      </Button>
    </Box>
  );
}
