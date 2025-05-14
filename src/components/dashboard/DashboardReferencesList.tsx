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
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

interface Reference {
  id: string;
  title: string;
  description: string;
  tags: string;
  created_at: string;
  user_email: string;
  status?: string;
}

export function DashboardReferencesList() {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  useEffect(() => {
    async function fetchReferences() {
      try {
        setLoading(true);
        setError(null);
        
        // Obter usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Usuário não autenticado');
          return;
        }
        
        // Buscar apenas as 5 referências mais recentes
        const { data, error: referencesError } = await supabase
          .from('reference_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (referencesError) {
          throw referencesError;
        }
        
        if (data) {
          setReferences(data);
        } else {
          setReferences([]);
        }
      } catch (e) {
        console.error('Erro ao buscar referências:', e);
        setError('Erro ao buscar referências');
      } finally {
        setLoading(false);
      }
    }
    
    fetchReferences();
  }, [supabase]);

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

  if (references.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Você ainda não possui referências</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={3} align="stretch" w="full">
        {references.map((reference) => (
        <Box
          key={reference.id}
          p={3}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          _hover={{ shadow: 'sm', borderColor: 'brand.300' }}
          onClick={() => router.push(`/dashboard/referencias/${reference.id}`)}
          cursor="pointer"
        >
          <VStack align="start" spacing={2}>
            <HStack justify="space-between" w="full">
              <HStack spacing={2}>
                <Badge colorScheme={reference.status === 'closed' ? 'green' : 'blue'} fontSize="xs">
                  {reference.status === 'closed' ? 'Finalizada' : 'Aberta'}
                </Badge>
                <Text fontWeight="medium" fontSize="sm">{reference.user_email}</Text>
              </HStack>
              <HStack spacing={1} fontSize="xs" color="gray.500">
                <Icon as={FiCalendar} boxSize={3} />
                <Text>
                  {new Date(reference.created_at).toLocaleDateString()}
                </Text>
              </HStack>
            </HStack>
            
            <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{reference.title}</Text>
            <Text color="gray.600" fontSize="sm" noOfLines={1}>{reference.description}</Text>
            
            <HStack spacing={1} flexWrap="wrap">
              {reference.tags && reference.tags.split(',').slice(0, 3).map((tag, index) => (
                <Badge key={index} colorScheme="brand" fontSize="xs">
                  {tag.trim()}
                </Badge>
              ))}
              {reference.tags && reference.tags.split(',').length > 3 && (
                <Badge colorScheme="gray" fontSize="xs">+{reference.tags.split(',').length - 3}</Badge>
              )}
            </HStack>
            
            <Icon
              as={reference.status === 'closed' ? FiCheckCircle : FiAlertCircle}
              color={reference.status === 'closed' ? 'green.500' : 'blue.500'}
              boxSize={4}
              alignSelf="flex-end"
              mt={-8}
            />
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
        Ver histórico completo
      </Button>
    </Box>
  );
}
