"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Container,
  Link as ChakraLink,
  Flex,
  Image
} from '@chakra-ui/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const toast = useToast();
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, informe seu email para recuperar a senha.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Enviar email de recuperação usando nosso endpoint personalizado
      const response = await fetch('/api/email/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao enviar email de recuperação');
      }
      
      setEmailSent(true);
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para instruções sobre como redefinir sua senha.',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      toast({
        title: 'Erro ao recuperar senha',
        description: error.message || 'Ocorreu um erro ao processar sua solicitação.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxW="lg" py={12}>
      <Flex direction="column" align="center" mb={6}>
        <Image 
          src="/logo.png" 
          alt="BNI ACESSO" 
          maxW="200px"
          mb={6}
        />
        <Heading as="h1" size="xl" textAlign="center" mb={4}>
          Recuperar Senha
        </Heading>
      </Flex>
      
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
        {emailSent ? (
          <VStack spacing={4}>
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Email de recuperação enviado com sucesso!
            </Alert>
            <Text>
              Enviamos um link para redefinir sua senha para {email}. 
              Por favor, verifique sua caixa de entrada e siga as instruções no email.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Caso não encontre o email, verifique também sua pasta de spam.
            </Text>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <Text>
                Digite seu email cadastrado abaixo e enviaremos um link para você redefinir sua senha.
              </Text>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                />
              </FormControl>
              
              <Button 
                colorScheme="brand" 
                width="full" 
                type="submit"
                isLoading={loading}
                loadingText="Enviando..."
              >
                Enviar link de recuperação
              </Button>
            </VStack>
          </form>
        )}
        
        <Flex justify="center" mt={6}>
          <Link href="/login" passHref>
            <Button leftIcon={<FiArrowLeft />} variant="outline" size="sm" mb={4}>
              Voltar para o Login
            </Button>
          </Link>
        </Flex>
      </Box>
    </Container>
  );
}
