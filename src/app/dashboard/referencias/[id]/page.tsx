"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  Button,
  HStack,
  Divider,
  useToast,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Container,
  useColorModeValue,
  Flex,
  Spacer,
  Avatar
} from "@chakra-ui/react";
import { FiTrash2, FiCheck, FiEdit, FiArrowLeft } from "react-icons/fi";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import ReferenceResponseList from "@/components/dashboard/ReferenceResponseList";
import CanHelpButton from "@/components/dashboard/CanHelpButton";
import TagInput from "@/components/dashboard/TagInput";
import Link from "next/link";

export default function ReferenceDetailsPage({ params }: { params: { id: string } }) {
  const [reference, setReference] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [responseCount, setResponseCount] = useState(0);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [loadingMember, setLoadingMember] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    tags: [] as string[]
  });
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const toast = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Função para buscar informações do membro
  const fetchMemberInfo = async (email: string) => {
    setLoadingMember(true);
    try {
      // Primeiro tenta buscar apenas as informações básicas do membro
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email, company, position, specialty, phone, avatar_url')
        .eq('email', email)
        .single();
      
      if (error) {
        console.warn('Erro ao buscar informações do membro:', error);
        return;
      }
      
      // Se encontrou o membro, define as informações básicas
      setMemberInfo(data || { email: email, name: email.split('@')[0] });
      
      // Depois tenta buscar os serviços (se existirem)
      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from('member_services')
          .select('services(name)')
          .eq('member_id', data.id);
        
        if (!servicesError && servicesData && servicesData.length > 0) {
          const services = servicesData.map(item => item.services);
          setMemberInfo(prev => ({ ...prev, services }));
        }
      } catch (serviceError) {
        console.warn('Não foi possível carregar serviços do membro:', serviceError);
      }
    } catch (error) {
      console.error('Erro geral ao buscar informações do membro:', error);
    } finally {
      setLoadingMember(false);
    }
  };

  useEffect(() => {
    fetchReference();
  }, [params.id]);

  const fetchReference = async () => {
    setLoading(true);
    try {
      // Buscar a referência
      const { data: referenceData, error: referenceError } = await supabase
        .from("reference_requests")
        .select("*")
        .eq("id", params.id)
        .single();

      if (referenceError) throw referenceError;
      setReference(referenceData);
      
      // Preencher formulário de edição
      setEditForm({
        title: referenceData.title,
        description: referenceData.description,
        tags: referenceData.tags ? referenceData.tags.split(',').map((tag: string) => tag.trim()) : []
      });

      // Verificar se o usuário atual é o dono da referência
      const { data: { user } } = await supabase.auth.getUser();
      const isOwnerUser = user?.email === referenceData.user_email;
      setIsOwner(isOwnerUser);
      
      // Se não for o dono, buscar informações do membro que criou a referência
      if (!isOwnerUser && referenceData.user_email) {
        await fetchMemberInfo(referenceData.user_email);
      }

    } catch (error: any) {
      console.error("Erro ao buscar referência:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da referência",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      router.push("/dashboard/referencias");
    } finally {
      setLoading(false);
    }
  };

  const handleResponsesLoaded = (count: number) => {
    setResponseCount(count);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("reference_requests")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      toast({
        title: "Referência excluída",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      router.push("/dashboard/referencias");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a referência",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      onDeleteClose();
    }
  };

  const handleFinalize = async () => {
    try {
      const { error } = await supabase
        .from("reference_requests")
        .update({ status: "closed" })
        .eq("id", params.id);

      if (error) throw error;

      toast({
        title: "Referência finalizada",
        description: "Esta referência foi marcada como finalizada",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      setReference({ ...reference, status: "closed" });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível finalizar a referência",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleTagChange = (newTags: string[]) => {
    setEditForm(prev => ({ ...prev, tags: newTags }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("reference_requests")
        .update({
          title: editForm.title,
          description: editForm.description,
          tags: editForm.tags.join(','),
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id);

      if (error) throw error;

      setReference({
        ...reference,
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags.join(','),
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Referência atualizada",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      onEditClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a referência",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  if (loading) {
    return (
      <Center h="70vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (!reference) {
    return (
      <Center h="70vh">
        <VStack>
          <Heading size="md">Referência não encontrada</Heading>
          <Button as={Link} href="/dashboard/referencias" leftIcon={<FiArrowLeft />}>
            Voltar para Lista
          </Button>
        </VStack>
      </Center>
    );
  }

  const isClosed = reference.status === "closed";
  
  return (
    <Box maxW="container.lg" mx="auto" py={8} px={4}>
      <Button 
        as={Link} 
        href="/dashboard/referencias" 
        leftIcon={<FiArrowLeft />} 
        mb={6}
        variant="outline"
      >
        Voltar para Lista
      </Button>

      {!isOwner && (
        <Box
          p={6}
          bg={bgColor}
          borderRadius="md"
          borderWidth="1px"
          borderColor="brand.100"
          shadow="md"
          mb={6}
        >
          <Heading size="md" mb={4}>Solicitado por:</Heading>
          <Flex direction={{ base: "column", md: "row" }} gap={6} alignItems="flex-start">
            <Box textAlign="center" minW="150px">
              <Avatar
                size="xl"
                name={memberInfo?.name || reference?.user_email || 'Membro'}
                src={memberInfo?.avatar_url}
                mb={2}
              />
              <Text fontWeight="bold">{memberInfo?.name || reference?.user_email?.split('@')[0]}</Text>
              <Text fontSize="sm" color="gray.500">{memberInfo?.email || reference?.user_email}</Text>
            </Box>
            
            <Box flex="1">
              {loadingMember ? (
                <Center py={4}>
                  <Spinner size="md" color="brand.500" />
                </Center>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {memberInfo?.company && (
                    <Box>
                      <Text fontWeight="semibold">Empresa:</Text>
                      <Text>{memberInfo.company}</Text>
                    </Box>
                  )}
                  
                  {memberInfo?.position && (
                    <Box>
                      <Text fontWeight="semibold">Cargo:</Text>
                      <Text>{memberInfo.position}</Text>
                    </Box>
                  )}
                  
                  {memberInfo?.specialty && (
                    <Box>
                      <Text fontWeight="semibold">Especialidade:</Text>
                      <Text>{memberInfo.specialty}</Text>
                    </Box>
                  )}
                  
                  {memberInfo?.services && memberInfo.services.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold">Serviços:</Text>
                      <HStack flexWrap="wrap" mt={1}>
                        {memberInfo.services.map((service: any, index: number) => (
                          <Badge key={index} colorScheme="green" mr={2} mb={2}>
                            {service.name}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}
                  
                  {memberInfo?.phone && (
                    <Box>
                      <Text fontWeight="semibold">Telefone:</Text>
                      <Text>{memberInfo.phone}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </Box>
          </Flex>
        </Box>
      )}

      <Box 
        p={6} 
        bg={bgColor} 
        borderRadius="md" 
        borderWidth="1px"
        borderColor={borderColor}
        shadow="md"
        mb={6}
      >
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} mb={4}>
          <Box>
            <Heading as="h1" size="lg">
              {reference.title}
              {isClosed && 
                <Badge ml={2} colorScheme="green">
                  Finalizada
                </Badge>
              }
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Criado em {new Date(reference.created_at).toLocaleDateString()}
              {reference.updated_at && reference.updated_at !== reference.created_at && 
                ` · Atualizado em ${new Date(reference.updated_at).toLocaleDateString()}`
              }
            </Text>
          </Box>
          
          <Spacer display={{ base: "block", md: "none" }} my={2} />
          
          {isOwner && !isClosed && (
            <HStack spacing={2}>
              <Button 
                leftIcon={<FiEdit />} 
                size="sm" 
                onClick={onEditOpen}
              >
                Editar
              </Button>
              <Button 
                leftIcon={<FiCheck />} 
                colorScheme="green" 
                size="sm"
                onClick={handleFinalize}
              >
                Finalizar
              </Button>
              <Button 
                leftIcon={<FiTrash2 />} 
                colorScheme="red" 
                size="sm" 
                onClick={onDeleteOpen}
              >
                Excluir
              </Button>
            </HStack>
          )}
        </Flex>
        
        <Text mb={4} whiteSpace="pre-wrap">
          {reference.description}
        </Text>
        
        {reference.tags && (
          <HStack flexWrap="wrap" mt={4}>
            {reference.tags.split(',').map((tag: string, index: number) => (
              <Badge key={index} colorScheme="brand" variant="subtle" px={2} py={1}>
                {tag.trim()}
              </Badge>
            ))}
          </HStack>
        )}
      </Box>
      
      {!isOwner && !isClosed && (
        <Box mb={6} textAlign="right">
          <CanHelpButton referenceId={params.id} onResponse={fetchReference} />
        </Box>
      )}
      
      <VStack align="stretch" spacing={8}>
        <Box>
          <Heading size="md" mb={4}>
            {isOwner ? `Respostas (${responseCount})` : 'Sua Resposta'}
          </Heading>
          <ReferenceResponseList 
            referenceId={params.id} 
            isOwner={isOwner}
            onResponsesLoaded={handleResponsesLoaded}
          />
        </Box>
      </VStack>
      
      {/* Modal de Edição */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmitEdit}>
            <ModalHeader>Editar Referência</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Título</FormLabel>
                  <Input 
                    value={editForm.title} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Descrição</FormLabel>
                  <Textarea 
                    value={editForm.description} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Tags (Áreas de Interesse)</FormLabel>
                  <TagInput 
                    tags={editForm.tags} 
                    onChange={handleTagChange}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancelar
              </Button>
              <Button colorScheme="brand" type="submit">
                Salvar Alterações
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* Diálogo de Confirmação para Exclusão */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Referência
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza? Esta ação não pode ser desfeita.
              {responseCount > 0 && (
                <Text mt={2} color="red.500">
                  Esta referência já possui {responseCount} resposta{responseCount > 1 ? 's' : ''}.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
