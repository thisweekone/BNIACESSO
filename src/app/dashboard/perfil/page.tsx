"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Tag,
  useColorModeValue,
  Grid,
  Icon,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { FiEdit2, FiMapPin, FiPhone, FiMail, FiLink } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Importação dinâmica para evitar erros de SSR
const MemberProfileForm = dynamic(
  () => import('@/components/dashboard/MemberProfileForm'),
  { ssr: false }
);
const ServicesManager = dynamic(
  () => import('@/components/dashboard/ServicesManager'),
  { ssr: false }
);
const TagsManager = dynamic(
  () => import('@/components/dashboard/TagsManager'),
  { ssr: false }
);
import { ReferencesList } from '@/components/dashboard/ReferencesList';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export default function Perfil() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMember() {
      try {
        setLoading(true);
        // Criar cliente Supabase usando o helper que mantém a sessão consistente com o middleware
        const supabase = createClientComponentClient();
        
        // Verificar se o usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('Usuário não autenticado');
          setLoading(false);
          return;
        }
        
        console.log('Usuário autenticado:', user.email);
        
        console.log('Buscando perfil do membro para o email:', user.email);
        console.log('Email do usuário autenticado:', user.email);
        
        // Primeiro verificar se o email existe na tabela members sem usar .single()
        // para evitar erro quando não encontra
        let { data: checkData, error: checkError } = await supabase
          .from('members')
          .select('*')
          .eq('email', user.email);
          
        console.log('Resultado da verificação inicial:', { checkData, checkError });
        
        // Perfil existe
        if (checkData && checkData.length > 0) {
          console.log('Perfil encontrado:', checkData[0]);
          setMemberInfo(checkData[0]);
        }
        // Perfil não existe, vamos criar
        else {
          console.log('Perfil não encontrado, criando um novo...');
            
            // Vamos criar o perfil diretamente sem verificar a tabela
            // pois se já estamos dentro do if/else, já sabemos que a tabela existe
            
            try {
              // Criar perfil básico
              // Criar perfil com informações básicas
              // Garantindo valores padrão mesmo se email for undefined
              const emailPrefix = user.email ? user.email.split('@')[0] : 'usuário';
              const displayName = user.user_metadata?.name || emailPrefix
                .split(/[\._]/)
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
                
              // Adicionando campos obrigatórios e garantindo valores válidos para arrays
              // Vamos incluir apenas campos que certamente existem na tabela members
              const newMember = {
                name: displayName,
                email: user.email,
                phone: '',
                // Removemos 'company' já que esse campo não existe na tabela
                // occupation: '', // Tentamos usar esse campo alternativo se necessário
                bio: '',
                city: '',
                specialty: '',
                created_at: new Date().toISOString()
                // Removemos 'services' se não tiver certeza que esse campo existe
              };
              
              console.log('Tentando criar novo membro com campos básicos:', newMember);
              
              // Inserir o novo membro e retornar os dados inseridos
              const { data: created, error: createError } = await supabase
                .from('members')
                .insert(newMember)
                .select();
                
              console.log('Resultado da criação:', { created, createError });
                
              if (createError) {
                console.error('Erro ao criar perfil:', createError);
                toast({
                  title: 'Não foi possível criar seu perfil',
                  description: createError.message,
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
                
                // Forçar a criação de um perfil básico para exibição mesmo com erro
                setMemberInfo({
                  id: 'temp-id',
                  name: displayName,
                  email: user.email,
                  phone: '',
                  company: '',
                  bio: '',
                  city: '',
                  specialty: '',
                  created_at: new Date().toISOString(),
                  services: []
                });
              } else if (created && created.length > 0) {
                console.log('Perfil criado com sucesso');
                setMemberInfo(created[0]);
                toast({
                  title: 'Perfil criado!',
                  description: 'Seu perfil foi criado com sucesso. Você pode editá-lo agora.',
                  status: 'success',
                  duration: 5000,
                  isClosable: true,
                });
              }
            } catch (createErr) {
              console.error('Erro ao criar perfil:', createErr);
              
              // Forçar a criação de um perfil básico para exibição mesmo com erro
              if (user && user.email) {
                const emailPrefix = user.email.split('@')[0];
                const displayName = emailPrefix
                  .split(/[\._]/)
                  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ');
                  
                setMemberInfo({
                  id: 'temp-id',
                  name: displayName,
                  email: user.email,
                  phone: '',
                  company: '',
                  bio: '',
                  city: '',
                  specialty: '',
                  created_at: new Date().toISOString(),
                  services: []
                });
              }
            }
        }
      } catch (e) {
        console.error('Erro inesperado:', e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMember();
  }, [toast]);

  async function handleSave(form: any) {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Atualizar o perfil do membro
      const { error } = await supabase
        .from('members')
        .update({
          // Campos básicos
          name: form.name,
          email: form.email,
          phone: form.phone,
          specialty: form.specialty, // Mantemos o campo de texto para compatibilidade
          bio: form.bio || '',
          city: form.city || '',
          // Redes sociais
          website: form.website || '',
          linkedin: form.linkedin || '',
          instagram: form.instagram || '',
          facebook: form.facebook || '',
          // Campos estratégicos
          icp: form.icp || '',
          tips: form.tips || '',
          cases: form.cases || '',
          // Endereço
          zipcode: form.zipcode || '',
          street: form.street || '',
          street_number: form.street_number || '',
          complement: form.complement || '',
          neighborhood: form.neighborhood || '',
          state: form.state || '',
          // Perfil público e LGPD
          public_profile: form.public_profile || false,
          profile_description: form.profile_description || '',
          // Se ativar o perfil público e não tiver data de consentimento, registra agora
          ...(form.public_profile && !memberInfo.lgpd_consent_date ? 
            { lgpd_consent_date: new Date().toISOString() } : {}),
          // Tags (para compatibilidade com o campo na tabela)
          tags: form.tags || []
        })
        .eq('id', memberInfo.id);

      if (error) {
        throw error;
      }
      
      // Se tiver specialty_id, atualizar a relação na tabela member_specialties
      if (form.specialty_id) {
        try {
          // Primeiro verificar se já existe um registro para este membro
          const { data: existingRelation } = await supabase
            .from('member_specialties')
            .select('id')
            .eq('member_id', memberInfo.id);
          
          // Se já existir, atualizar
          if (existingRelation && existingRelation.length > 0) {
            const { error: relationUpdateError } = await supabase
              .from('member_specialties')
              .update({
                specialty_id: form.specialty_id
              })
              .eq('member_id', memberInfo.id);
            
            if (relationUpdateError) {
              console.error('Erro ao atualizar especialidade:', relationUpdateError);
            }
          } 
          // Senão, inserir novo
          else {
            const { error: relationInsertError } = await supabase
              .from('member_specialties')
              .insert({
                member_id: memberInfo.id,
                specialty_id: form.specialty_id
              });
            
            if (relationInsertError) {
              console.error('Erro ao inserir especialidade:', relationInsertError);
            }
          }
        } catch (relationError) {
          console.error('Erro ao processar relação de especialidade:', relationError);
          // Não interrompemos o fluxo por causa de erro na relação
        }
      }
      
      // Atualizar as informações do membro em memória para refletir as mudanças
      setMemberInfo({ ...memberInfo, ...form });
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Perfil atualizado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Fechar o modal
      onClose();
    } catch (err) {
      console.error('Erro inesperado ao salvar:', err);
      toast({ 
        title: 'Erro inesperado', 
        description: 'Ocorreu um erro ao tentar salvar seu perfil.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Flex justify="center" align="center" minH="60vh"><Spinner size="xl" /></Flex>;
  }
  if (!memberInfo) {
    return (
      <Box p={8}>
        <VStack spacing={4} align="center">
          <Heading size="md">Perfil não encontrado.</Heading>
          <Text>Estamos tendo dificuldades para localizar ou criar seu perfil.</Text>
          <Button
            colorScheme="brand"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Meu Perfil</Heading>
        <Button
          leftIcon={<Icon as={FiEdit2} />}
          colorScheme="brand"
          variant="outline"
          onClick={onOpen}
        >
          Editar Perfil
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={6}>
        {/* Coluna da Esquerda - Informações Principais */}
        <VStack spacing={6}>
          <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" w="full">
            <VStack spacing={4} align="center">
              <Avatar
                size="2xl"
                name={memberInfo.name}
                src=""
                mb={2}
              />
              <VStack spacing={1} textAlign="center">
                <Heading size="md">{memberInfo.name}</Heading>
                <Text color="brand.500" fontWeight="medium">
                  {memberInfo.specialty}
                </Text>
                <HStack>
                  <Icon as={FiMapPin} color="gray.500" />
                  <Text color="gray.500">{memberInfo.city}</Text>
                </HStack>
              </VStack>

              <Divider />

              <VStack spacing={2} w="full">
                <Flex w="full" align="center" gap={2}>
                  <Icon as={FiPhone} color="gray.500" />
                  <Text>{memberInfo.phone}</Text>
                </Flex>
                <Flex w="full" align="center" gap={2}>
                  <Icon as={FiMail} color="gray.500" />
                  <Text>{memberInfo.email}</Text>
                </Flex>
                <Flex w="full" align="center" gap={2}>
                  <Icon as={FiLink} color="gray.500" />
                  <Text>{memberInfo.website}</Text>
                </Flex>
              </VStack>
            </VStack>
          </Box>

          {/* O box de tags estático foi removido, pois agora usamos o TagsManager */}
        </VStack>

        {/* Coluna da Direita - Bio, Serviços e Histórico */}
        <VStack spacing={6}>
          <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" w="full">
            <VStack align="start" spacing={4}>
              <Heading size="sm">Sobre</Heading>
              <Text>{memberInfo.bio}</Text>
            </VStack>
          </Box>

          {/* Componente de gerenciamento de serviços */}
          <ServicesManager 
            memberId={memberInfo.id} 
          />
          
          {/* Componente de gerenciamento de tags */}
          <TagsManager
            memberId={memberInfo.id}
          />

          <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" w="full">
            <VStack align="start" spacing={4}>
              <Flex justify="space-between" w="full">
                <Heading size="sm">Histórico de Referências</Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {/* TODO: Ver todas */}}
                >
                  Ver todas
                </Button>
              </Flex>
              <ReferencesList memberId={memberInfo.id} />
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* Modal de edição */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Perfil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MemberProfileForm initialData={memberInfo} onSubmit={handleSave} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}