'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Login() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Verifica se o usuário já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        router.push('/dashboard');
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={8} align="center">
        <Box
          bg="red.500"
          color="white"
          fontWeight="bold"
          fontSize="xl"
          p={4}
          borderRadius="full"
          width="100px"
          height="100px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={4}
          boxShadow="md"
        >
          BNI
        </Box>
        
        <Heading as="h1" size="xl" textAlign="center">
          BNI Acesso
        </Heading>
        
        <Text textAlign="center" color="gray.600">
          Entre com suas credenciais para acessar a plataforma
        </Text>
        
        <Box w="100%" p={6} borderRadius="md" borderWidth="1px" boxShadow="sm">
          <LoginForm />
        </Box>
      </VStack>
    </Container>
  );
}
