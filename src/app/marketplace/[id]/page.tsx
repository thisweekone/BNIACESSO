"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Avatar,
  Badge,
  Icon,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Divider,
  Tag,
  Center,
  Spinner,
  Card,
  CardBody,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiMapPin,
  FiPhone,
  FiMail,
  FiLink,
  FiLinkedin, 
  FiInstagram, 
  FiFacebook,
  FiMessageSquare,
  FiExternalLink
} from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import { sendContactMessage } from '@/utils/messagesFunctions';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PublicHeader from '@/components/marketplace/PublicHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MemberDetails({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const initialRef = useRef(null);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentBg = useColorModeValue('brand.50', 'brand.900');
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Função para lidar com mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para enviar o formulário de contato
  const handleContactSubmit = async () => {
    // Validação básica
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha nome, email e mensagem.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSending(true);
      
      // Enviando a mensagem para o membro usando a função que criamos
      await sendContactMessage({
        member_id: member.id,
        sender_name: contactForm.name,
        sender_email: contactForm.email,
        sender_whatsapp: contactForm.whatsapp || undefined,
        message: contactForm.message
      });
      
      // Limpa o formulário e fecha o modal
      setContactForm({
        name: '',
        email: '',
        whatsapp: '',
        message: ''
      });
      
      onClose();
      
      toast({
        title: 'Mensagem enviada',
        description: `Sua mensagem foi enviada para ${member.name}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Houve um problema ao enviar sua mensagem. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    async function fetchMemberDetails() {
      try {
        setLoading(true);
        
        // Buscar detalhes do membro
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('id', params.id)
          .eq('public_profile', true)
          .single();
        
        if (memberError) throw memberError;
        if (!memberData) {
          setError('Membro não encontrado ou perfil não disponível publicamente');
          setLoading(false);
          return;
        }
        
        setMember(memberData);
        
        // Buscar serviços do membro
        const { data: serviceData, error: serviceError } = await supabase
          .from('member_services')
          .select('*, services(*)')
          .eq('member_id', params.id);
        
        if (!serviceError && serviceData) {
          setServices(serviceData);
        }
        
      } catch (err: any) {
        console.error('Erro ao buscar detalhes do membro:', err);
        setError(err.message || 'Erro ao carregar detalhes do membro');
      } finally {
        setLoading(false);
      }
    }
    
    if (params.id) {
      fetchMemberDetails();
    }
  }, [params.id]);
  
  // Processar tags se existirem
  let tagsList: string[] = [];
  
  if (member?.tags) {
    // Verificar se tags é um array ou uma string
    if (Array.isArray(member.tags)) {
      // Se for array, usar diretamente
      tagsList = member.tags.filter(Boolean);
    } else if (typeof member.tags === 'string') {
      // Se for string (formato legado), dividir por vírgula
      tagsList = member.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
  }
  
  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <PublicHeader />
        <Center py={20}>
          <Spinner size="xl" color="brand.500" />
        </Center>
      </Box>
    );
  }
  
  if (error || !member) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <PublicHeader />
        <Container maxW="container.lg" py={16}>
          <Center flexDirection="column" py={16}>
            <Heading mb={4} color="red.500">Erro</Heading>
            <Text fontSize="lg" mb={6}>{error || 'Membro não encontrado'}</Text>
            <Button
              as={Link}
              href="/marketplace"
              leftIcon={<FiArrowLeft />}
              colorScheme="brand"
            >
              Voltar para o Marketplace
            </Button>
          </Center>
        </Container>
      </Box>
    );
  }
  
  return (
    <Box minH="100vh" bg="white">
      <PublicHeader />
      
      <Container maxW="container.xl" pt={4} pb={12}>
        <Button
          as={Link}
          href="/marketplace"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          color="gray.600"
          fontWeight="normal"
          size="sm"
          mb={6}
          pl={0}
          _hover={{ bg: 'transparent', color: 'red.500' }}
        >
          Voltar para o Marketplace
        </Button>
        
        <Flex flexDirection={{ base: 'column', md: 'row' }} gap={{ base: 8, md: 12 }}>
          {/* Coluna da esquerda - Informações de contato */}
          <Box width={{ base: '100%', md: '30%' }}>
            <Box 
              bg="white" 
              borderRadius="xl" 
              overflow="hidden"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <VStack spacing={6} align="center" py={10} px={8}>
                <Avatar
                  size="2xl"
                  name={member.name}
                  src={member.avatar_url || ''}
                />
                  
                <VStack spacing={1}>
                  <Heading as="h1" size="lg" textAlign="center">
                    {member.name}
                  </Heading>
                  
                  <Badge colorScheme="brand" fontSize="md" px={2} py={1}>
                    {member.specialty}
                  </Badge>
                  
                  {member.company && (
                    <Text color="gray.500" textAlign="center">
                      {member.company}
                    </Text>
                  )}
                </VStack>
                  
                <Button
                  leftIcon={<FiMessageSquare />}
                  colorScheme="red"
                  size="md"
                  width="full"
                  borderRadius="full"
                  py={6}
                  fontWeight="bold"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                  onClick={onOpen}
                >
                  Contactar {member.name.split(' ')[0]}
                </Button>
                  
                <Divider />
                
                <VStack align="start" spacing={4} width="100%">
                  {member.city && (
                    <Flex align="center" width="100%">
                      <Box width="32px" display="flex" justifyContent="center">
                        <Icon as={FiMapPin} color="gray.500" boxSize={4} />
                      </Box>
                      <Text flex="1">{member.city}</Text>
                    </Flex>
                  )}
                    
                  {member.phone && (
                    <Flex align="center" width="100%">
                      <Box width="32px" display="flex" justifyContent="center">
                        <Icon as={FiPhone} color="gray.500" boxSize={4} />
                      </Box>
                      <Text flex="1">{member.phone}</Text>
                      <Button
                        as="a"
                        href={`tel:${member.phone.replace(/\D/g, '')}`}
                        size="sm"
                        variant="solid"
                        colorScheme="red"
                        borderRadius="full"
                        px={3}
                        height="32px"
                        minWidth="80px"
                      >
                        Ligar
                      </Button>
                    </Flex>
                  )}
                    
                  <Flex align="center" width="100%">
                    <Box width="32px" display="flex" justifyContent="center">
                      <Icon as={FiMail} color="gray.500" boxSize={4} />
                    </Box>
                    <Text flex="1" noOfLines={1}>{member.email}</Text>
                    <Button
                      as="a"
                      href={`mailto:${member.email}`}
                      size="sm"
                      variant="solid"
                      colorScheme="red"
                      borderRadius="full"
                      px={3}
                      height="32px"
                      minWidth="80px"
                    >
                      Email
                    </Button>
                  </Flex>
                    
                  {member.website && (
                    <Flex align="center" width="100%">
                      <Box width="32px" display="flex" justifyContent="center">
                        <Icon as={FiLink} color="gray.500" boxSize={4} />
                      </Box>
                      <Text flex="1" noOfLines={1}>
                        {member.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </Text>
                      <Button
                        as="a"
                        href={member.website.startsWith('http') ? member.website : `https://${member.website}`}
                        target="_blank"
                        size="sm"
                        variant="solid"
                        colorScheme="red"
                        borderRadius="full"
                        px={3}
                        height="32px"
                        minWidth="80px"
                      >
                        Visitar
                      </Button>
                    </Flex>
                  )}
                  </VStack>
                  
                {/* Redes sociais */}
                <HStack spacing={4} pt={6}>
                  {member.linkedin && (
                    <Button
                      as="a"
                      href={member.linkedin}
                      target="_blank"
                      size="sm"
                      colorScheme="linkedin"
                      leftIcon={<FiLinkedin />}
                    >
                      LinkedIn
                    </Button>
                  )}
                  
                  {member.instagram && (
                    <Button
                      as="a"
                      href={member.instagram}
                      target="_blank"
                      size="sm"
                      colorScheme="pink"
                      leftIcon={<FiInstagram />}
                    >
                      Instagram
                    </Button>
                  )}
                  
                  {member.facebook && (
                    <Button
                      as="a"
                      href={member.facebook}
                      target="_blank"
                      size="sm"
                      colorScheme="facebook"
                      leftIcon={<FiFacebook />}
                    >
                      Facebook
                    </Button>
                  )}
                  </HStack>
                </VStack>
              </Box>
            
            {/* Tags */}
            {tagsList.length > 0 && (
              <Box 
                mt={6} 
                bg="white" 
                borderRadius="xl" 
                overflow="hidden"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={8}
              >
                <Heading as="h3" size="md" mb={4} fontWeight="semibold" color="gray.700">
                  Áreas de atuação
                </Heading>
                <Flex wrap="wrap" gap={2}>
                  {tagsList.map((tag, index) => (
                    <Tag 
                      key={index} 
                      colorScheme="red" 
                      size="md"
                      borderRadius="full"
                      variant="subtle"
                      py={1.5}
                      px={3}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
          
          {/* Coluna da direita - Bio e Serviços */}
          <Box flex="1">
            {/* Descrição do perfil */}
            <Box 
              bg="white" 
              borderRadius="xl" 
              overflow="hidden"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={8}
              mb={6}
            >
              <Heading as="h2" size="md" mb={4} fontWeight="semibold" color="gray.700">
                Sobre {member.name}
              </Heading>
              
              {member.profile_description ? (
                <Text whiteSpace="pre-wrap" color="gray.600" lineHeight="1.7">
                  {member.profile_description}
                </Text>
              ) : member.bio ? (
                <Text whiteSpace="pre-wrap" color="gray.600" lineHeight="1.7">
                  {member.bio}
                </Text>
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  Nenhuma descrição disponível.
                </Text>
              )}
            </Box>
            {/* Biografia completa */}
            {member.bio && member.profile_description && member.bio !== member.profile_description && (
              <Box 
                bg="white" 
                borderRadius="xl" 
                overflow="hidden"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={8}
                mb={6}
              >
                <Heading as="h3" size="md" mb={4} fontWeight="semibold" color="gray.700">
                  Biografia
                </Heading>
                <Text whiteSpace="pre-wrap" color="gray.600" lineHeight="1.7">
                  {member.bio}
                </Text>
              </Box>
            )}
            
            {/* Serviços */}
            {services.length > 0 && (
              <Box 
                bg="white" 
                borderRadius="xl" 
                overflow="hidden"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
              >
                <Box bg="red.500" py={3} px={6}>
                  <Heading as="h3" size="md" color="white" fontWeight="medium">
                    Serviços Oferecidos
                  </Heading>
                </Box>
                <Box p={8}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    {services.map((service) => (
                      <Flex 
                        key={service.id} 
                        p={6} 
                        borderRadius="lg" 
                        bg="white"
                        border="1px"
                        borderColor="red.100"
                        boxShadow="sm"
                        _hover={{ borderColor: 'red.300', transform: 'translateY(-2px)', boxShadow: 'md' }}
                        transition="all 0.3s"
                        direction="column"
                        position="relative"
                        overflow="hidden"
                      >
                        <Box position="absolute" top="0" left="0" w="4px" h="full" bg="red.500" />
                        <Heading size="sm" mb={3} color="gray.800">
                          {service.services?.name}
                        </Heading>
                        {service.description ? (
                          <Text fontSize="sm" color="gray.600">
                            {service.description}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.500" fontStyle="italic">
                            Consulte para mais informações sobre este serviço.
                          </Text>
                        )}
                      </Flex>
                    ))}
                  </SimpleGrid>
                </Box>
              </Box>
            )}
            
            {/* Cliente ideal */}
            {member.icp && (
              <Box 
                bg="white" 
                borderRadius="xl" 
                overflow="hidden"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={8}
                mt={6}
              >
                <Heading as="h3" size="md" mb={4} fontWeight="semibold" color="gray.700">
                  Cliente Ideal
                </Heading>
                <Text color="gray.600" lineHeight="1.7">
                  {member.icp}
                </Text>
              </Box>
            )}
            
            {/* Casos de sucesso */}
            {member.cases && (
              <Box 
                bg="white" 
                borderRadius="xl" 
                overflow="hidden"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={8}
                mt={6}
              >
                <Heading as="h3" size="md" mb={4} fontWeight="semibold" color="gray.700">
                  Casos de Sucesso
                </Heading>
                <Text whiteSpace="pre-wrap" color="gray.600" lineHeight="1.7">
                  {member.cases}
                </Text>
              </Box>
            )}
            
            {/* Dicas para indicação */}
            {member.tips && (
              <Box 
                bg="white" 
                borderRadius="xl" 
                overflow="hidden"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={8}
                mt={6}
              >
                <Heading as="h3" size="md" mb={4} fontWeight="semibold" color="gray.700">
                  Dicas para Indicação
                </Heading>
                <Text whiteSpace="pre-wrap" color="gray.600" lineHeight="1.7">
                  {member.tips}
                </Text>
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
      
      <Box as="footer" py={8} textAlign="center" borderTopWidth="1px" borderColor="gray.200" mt={12} bg="white">
        <Text color="gray.600">&copy; {new Date().getFullYear()} BNI Acesso. Todos os direitos reservados.</Text>
        <Text fontSize="sm" color="gray.500" mt={1}>
          As informações exibidas nesta página são divulgadas com o consentimento dos membros conforme a LGPD.
        </Text>
      </Box>

      {/* Modal de Contato */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        initialFocusRef={initialRef}
        isCentered
        size="md"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalHeader color="gray.700">
            Enviar mensagem para {member?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Seu nome</FormLabel>
              <Input 
                ref={initialRef}
                placeholder="Seu nome completo" 
                name="name" 
                value={contactForm.name} 
                onChange={handleInputChange}
                focusBorderColor="red.400"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Seu e-mail</FormLabel>
              <Input 
                placeholder="seu.email@exemplo.com" 
                name="email" 
                type="email"
                value={contactForm.email} 
                onChange={handleInputChange}
                focusBorderColor="red.400"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Seu WhatsApp</FormLabel>
              <Input 
                placeholder="(00) 00000-0000" 
                name="whatsapp" 
                value={contactForm.whatsapp} 
                onChange={handleInputChange}
                focusBorderColor="red.400"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Mensagem</FormLabel>
              <Textarea
                placeholder="Escreva sua mensagem..."
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                rows={5}
                resize="vertical"
                focusBorderColor="red.400"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button 
              mr={3} 
              onClick={onClose}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleContactSubmit}
              isLoading={isSending}
              loadingText="Enviando"
            >
              Enviar mensagem
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
