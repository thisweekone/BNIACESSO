'use client';

import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar telefone
      const phoneNumber = phone.replace(/\D/g, '');
      if (phoneNumber.length < 10) {
        throw new Error('Telefone inválido. Informe o DDD e o número.');
      }

      // Verifique primeiro se a tabela registration_requests existe
      try {
        // Usando uma abordagem alternativa - vamos tentar criar diretamente
        // Verificar se o e-mail já existe nos membros primeiro
        const { data: existingMember, error: memberError } = await supabase
          .from('members')
          .select('id')
          .eq('email', email)
          .maybeSingle(); // use maybeSingle em vez de single para não gerar erro se não encontrar

        if (existingMember) {
          throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
        }

        // Se chegarmos aqui, vamos tentar inserir diretamente sem verificação prévia
        console.log('Tentando criar solicitação de cadastro para:', email);

        // Criar solicitação de cadastro diretamente
        const { data, error: insertError } = await supabase
          .from('registration_requests')
          .insert({
            name,
            email,
            phone: phoneNumber, 
            status: 'pendente',
            notes: 'Solicitação de cadastro via formulário público',
            created_at: new Date().toISOString()
          })
          .select();

        if (insertError) {
          console.error('Erro detalhado ao inserir:', insertError);
          
          // Verificar se é um erro de tabela inexistente
          if (insertError.message?.includes('does not exist') || 
              insertError.code === '42P01') {
            throw new Error(
              'Sistema de registro ainda não está configurado. ' + 
              'Entre em contato com o administrador (Erro: Tabela não existe).'
            );
          }
          
          // Verificar se é um erro de violação de chave única
          if (insertError.code === '23505') {
            throw new Error(
              'Já existe uma solicitação para este e-mail. ' +
              'Se você já se cadastrou, aguarde a aprovação.'
            );
          }
          
          throw insertError;
        }

        // Mostrar mensagem de sucesso e limpar formulário
        setRegistrationSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        
      } catch (err: any) {
        console.error('Erro detalhado:', err);
        throw err; // Repassar o erro para o handler externo
      }
      
    } catch (error: any) {
      console.error('Erro completo no cadastro:', error);
      toast({
        title: 'Erro na solicitação',
        description: error.message || 'Ocorreu um erro durante o cadastro',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs isFitted variant="enclosed">
      <TabList mb="1em">
        <Tab>Login</Tab>
        <Tab>Cadastro</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={loading}
              >
                Entrar
              </Button>
            </VStack>
          </form>
        </TabPanel>

        <TabPanel>
          {registrationSuccess ? (
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="220px"
              borderRadius="md"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Solicitação Enviada!
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Seu cadastro foi recebido e está aguardando aprovação. 
                Você receberá um e-mail quando sua conta for ativada.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSignUp}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome Completo</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefone</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>+55</InputLeftAddon>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Senha</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Processo de Aprovação</AlertTitle>
                    <AlertDescription>
                      Seu cadastro passará por uma verificação antes de ser aprovado. 
                      Você receberá um e-mail quando sua conta estiver ativa.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Button
                  type="submit"
                  colorScheme="brand"
                  width="full"
                  isLoading={loading}
                >
                  Solicitar Cadastro
                </Button>

                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Ao se cadastrar, você concorda com nossos termos de uso e política
                  de privacidade.
                </Text>
              </VStack>
            </form>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}