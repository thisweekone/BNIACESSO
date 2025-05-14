'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Divider,
  SimpleGrid,
  Icon,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiBell, FiGlobe, FiLock, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Configuracoes() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const supabase = createClientComponentClient();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    async function getUserEmail() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    }
    getUserEmail();
  }, [supabase.auth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Primeiro, verificar a senha atual tentando fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Senha atual incorreta'
        }));
        setLoading(false);
        return;
      }

      // Agora atualizar para a nova senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Sucesso
      toast({
        title: 'Senha alterada com sucesso',
        description: 'Sua senha foi atualizada com segurança.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Resetar formulário e fechar modal
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onClose();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar sua senha. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading mb={6}>Configurações</Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Notificações */}
        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
          <VStack align="start" spacing={6} w="full">
            <Flex align="center" gap={2}>
              <Icon as={FiBell} color="brand.500" boxSize={5} />
              <Heading size="md">Notificações</Heading>
            </Flex>

            <VStack spacing={4} w="full">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Notificações por email</FormLabel>
                <Switch colorScheme="brand" defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Notificações por WhatsApp</FormLabel>
                <Switch colorScheme="brand" defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Lembretes de reunião</FormLabel>
                <Switch colorScheme="brand" defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Novos pedidos de referência</FormLabel>
                <Switch colorScheme="brand" defaultChecked />
              </FormControl>
            </VStack>
          </VStack>
        </Box>

        {/* Privacidade */}
        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
          <VStack align="start" spacing={6} w="full">
            <Flex align="center" gap={2}>
              <Icon as={FiLock} color="brand.500" boxSize={5} />
              <Heading size="md">Privacidade</Heading>
            </Flex>

            <VStack spacing={4} w="full">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Perfil público</FormLabel>
                <Switch colorScheme="brand" defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Mostrar contatos</FormLabel>
                <Switch colorScheme="brand" defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Mostrar valor dos negócios</FormLabel>
                <Switch colorScheme="brand" />
              </FormControl>
            </VStack>
          </VStack>
        </Box>

        {/* Preferências */}
        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
          <VStack align="start" spacing={6} w="full">
            <Flex align="center" gap={2}>
              <Icon as={FiGlobe} color="brand.500" boxSize={5} />
              <Heading size="md">Preferências</Heading>
            </Flex>

            <VStack spacing={4} w="full">
              <FormControl>
                <FormLabel>Idioma</FormLabel>
                <Select defaultValue="pt-BR">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Fuso horário</FormLabel>
                <Select defaultValue="America/Sao_Paulo">
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/New_York">New York (GMT-4)</option>
                  <option value="Europe/London">London (GMT+1)</option>
                </Select>
              </FormControl>
            </VStack>
          </VStack>
        </Box>

        {/* Conta */}
        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
          <VStack align="start" spacing={6} w="full">
            <Heading size="md">Conta</Heading>

            <VStack spacing={4} w="full">
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" value="usuario@email.com" isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Senha</FormLabel>
                <Button variant="outline" w="full" onClick={onOpen}>
                  Alterar senha
                </Button>
              </FormControl>

              <Divider />

              <Button colorScheme="red" variant="ghost">
                Excluir conta
              </Button>
            </VStack>
          </VStack>
        </Box>
      </SimpleGrid>

      <Flex justify="flex-end" mt={6}>
        <Button
          leftIcon={<Icon as={FiSave} />}
          colorScheme="brand"
          size="lg"
          onClick={() => {/* TODO: Salvar configurações */}}
        >
          Salvar Alterações
        </Button>
      </Flex>

      {/* Modal de alteração de senha */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alterar Senha</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.currentPassword}>
                <FormLabel>Senha Atual</FormLabel>
                <InputGroup>
                  <Input
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha atual"
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                      h="1.75rem"
                      size="sm"
                    >
                      <Icon as={showCurrentPassword ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.currentPassword && (
                  <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.newPassword}>
                <FormLabel>Nova Senha</FormLabel>
                <InputGroup>
                  <Input
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={handleInputChange}
                    placeholder="Digite a nova senha"
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                      h="1.75rem"
                      size="sm"
                    >
                      <Icon as={showNewPassword ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.newPassword && (
                  <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <InputGroup>
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme a nova senha"
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      h="1.75rem"
                      size="sm"
                    >
                      <Icon as={showConfirmPassword ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.confirmPassword && (
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
              Cancelar
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleChangePassword}
              isLoading={loading}
              loadingText="Alterando..."
            >
              Alterar Senha
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}