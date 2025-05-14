"use client";

import { useState, useEffect } from 'react';
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
  Image,
  FormErrorMessage,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

export default function AtualizarSenha() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState<string>('');
  const toast = useToast();
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Validar força da senha
  const passwordHasErrors = password.length > 0 && password.length < 8;
  const passwordsMatch = password === confirmPassword;

  // Verificar se já tem hash na URL (modo de recuperação)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      console.log('Token encontrado na URL, usuário em modo de recuperação');
    }
  }, []);

  // Alternar visibilidade da senha
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não correspondem');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Atualizar a senha do usuário
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setPasswordUpdated(true);
      toast({
        title: 'Senha atualizada com sucesso!',
        description: 'Sua senha foi atualizada. Você já pode fazer login com sua nova senha.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      setError(error.message || 'Ocorreu um erro ao atualizar sua senha.');
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message || 'Ocorreu um erro ao atualizar sua senha.',
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
          Atualizar Senha
        </Heading>
      </Flex>
      
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
        {passwordUpdated ? (
          <VStack spacing={4}>
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Senha atualizada com sucesso!
            </Alert>
            <Text>
              Sua senha foi atualizada com sucesso. Você será redirecionado para a página de login em instantes.
            </Text>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <Text>
                Digite sua nova senha abaixo para atualizá-la.
              </Text>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <FormControl id="password" isRequired isInvalid={passwordHasErrors}>
                <FormLabel>Nova Senha</FormLabel>
                <InputGroup>
                  <Input 
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                  />
                  <InputRightElement>
                    <Button size="sm" onClick={togglePasswordVisibility} bg="transparent">
                      {passwordVisible ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {passwordHasErrors && (
                  <FormErrorMessage>Senha deve ter no mínimo 8 caracteres</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired isInvalid={confirmPassword.length > 0 && !passwordsMatch}>
                <FormLabel>Confirmar Senha</FormLabel>
                <InputGroup>
                  <Input 
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                  />
                  <InputRightElement>
                    <Button size="sm" onClick={toggleConfirmPasswordVisibility} bg="transparent">
                      {confirmPasswordVisible ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <FormErrorMessage>As senhas não correspondem</FormErrorMessage>
                )}
              </FormControl>
              
              <Button 
                colorScheme="brand" 
                width="full" 
                type="submit"
                isLoading={loading}
                loadingText="Atualizando..."
                isDisabled={!password || !confirmPassword || password !== confirmPassword || password.length < 8}
              >
                Atualizar senha
              </Button>
            </VStack>
          </form>
        )}
        
        <Flex justify="center" mt={6}>
          <ChakraLink as={Link} href="/login" color="brand.500">
            <Flex align="center">
              <ArrowBackIcon mr={2} />
              Voltar para login
            </Flex>
          </ChakraLink>
        </Flex>
      </Box>
    </Container>
  );
}
