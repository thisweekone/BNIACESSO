'use client';

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
} from '@chakra-ui/react';
import { FiBell, FiGlobe, FiLock, FiSave } from 'react-icons/fi';

export default function Configuracoes() {
  const bgColor = useColorModeValue('white', 'gray.800');

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
                <Button variant="outline" w="full">
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
    </Box>
  );
} 