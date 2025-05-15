'use client';

import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Spinner,
  Box,
  Alert,
  AlertIcon,
  Divider
} from '@chakra-ui/react';

interface ProfileImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (profileData: any) => void;
}

export function ProfileImporter({ isOpen, onClose, onImport }: ProfileImporterProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const extractProfile = async () => {
    if (!url || !url.includes('bnibrasil.net.br')) {
      setError('Por favor, insira um link válido do perfil BNI');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProfileData(null);

      const response = await fetch('/api/scrape-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao extrair dados do perfil');
      }

      if (!result.data || Object.keys(result.data).length === 0) {
        throw new Error('Não foi possível extrair os dados do perfil BNI');
      }

      setProfileData(result.data);
      
      toast({
        title: 'Dados extraídos com sucesso',
        description: 'As informações do perfil foram carregadas. Você pode revisar antes de importar.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error('Erro ao extrair perfil:', err);
      setError(err.message || 'Erro ao extrair dados do perfil');
      
      toast({
        title: 'Erro ao carregar perfil',
        description: err.message || 'Não foi possível extrair os dados do perfil BNI',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (profileData) {
      onImport(profileData);
      toast({
        title: 'Dados importados',
        description: 'As informações do perfil foram importadas com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Importar Perfil do BNI</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Cole abaixo o link do perfil do membro no site do BNI para extrair automaticamente as informações.
            </Text>
            
            <FormControl isRequired>
              <FormLabel>Link do Perfil BNI</FormLabel>
              <Input
                placeholder="Ex: https://bnibrasil.net.br/pt-BR/memberdetails?encryptedMemberId=..."
                value={url}
                onChange={handleInputChange}
              />
            </FormControl>
            
            <Button 
              colorScheme="red" 
              onClick={extractProfile} 
              isLoading={loading}
              loadingText="Extraindo dados..."
            >
              Extrair Dados do Perfil
            </Button>

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {loading && (
              <Box textAlign="center" py={4}>
                <Spinner size="xl" />
                <Text mt={2}>Extraindo dados do perfil...</Text>
              </Box>
            )}

            {profileData && (
              <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="bold" fontSize="lg" mb={2}>
                  Dados Extraídos:
                </Text>
                
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontWeight="semibold">Nome:</Text>
                    <Text>{profileData.nome}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Empresa:</Text>
                    <Text>{profileData.empresa}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Indústria:</Text>
                    <Text>{profileData.industria}</Text>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Text fontWeight="semibold">Meu Negócio:</Text>
                    <Text noOfLines={2}>{profileData.meuNegocio}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Referência Ideal:</Text>
                    <Text noOfLines={2}>{profileData.referenciaIdeal}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Principal Problema Resolvido:</Text>
                    <Text noOfLines={2}>{profileData.problemaResolvido}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Contato:</Text>
                    <Text>Telefone: {profileData.contatos?.telefone}</Text>
                    <Text>Email: {profileData.contatos?.email}</Text>
                    <Text>Website: {profileData.contatos?.website}</Text>
                  </Box>
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="red" 
            onClick={handleImport}
            isDisabled={!profileData}
          >
            Importar Dados
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
