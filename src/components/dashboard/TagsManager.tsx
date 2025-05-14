import { useState, useEffect, useRef } from 'react';
import {
  VStack,
  Heading,
  Button,
  useToast,
  Box,
  Text,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  Input,
  Spinner,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiCheck } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface TagsManagerProps {
  memberId: string;
}

export default function TagsManager({ memberId }: TagsManagerProps) {
  // Estados
  const [memberTags, setMemberTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal para adicionar tag
  const { isOpen, onOpen, onClose } = useDisclosure();
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const tagBg = useColorModeValue('brand.100', 'brand.900');
  const tagColor = useColorModeValue('brand.800', 'brand.200');

  useEffect(() => {
    if (memberId) {
      fetchMemberTags();
    }
  }, [memberId]);

  // Foca no input de tag quando o modal abre
  useEffect(() => {
    if (isOpen && tagInputRef.current) {
      setTimeout(() => {
        tagInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Busca as tags do membro
  const fetchMemberTags = async () => {
    if (!memberId || memberId === 'temp-id') return;
    
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('members')
        .select('tags')
        .eq('id', memberId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar tags:', error);
        return;
      }
      
      if (data && data.tags) {
        setMemberTags(data.tags);
      } else {
        setMemberTags([]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adiciona uma tag ao membro
  const addTagToMember = async () => {
    if (!memberId || memberId === 'temp-id') {
      toast({
        title: 'Erro',
        description: 'ID de membro inválido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!newTag.trim()) {
      toast({
        title: 'Tag vazia',
        description: 'Por favor, digite uma tag válida',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    // Verificar se a tag já existe
    if (memberTags.includes(newTag.trim())) {
      toast({
        title: 'Tag já adicionada',
        description: 'Esta tag já está na sua lista',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Adicionar tag ao array de tags do membro
      const updatedTags = [...memberTags, newTag.trim()];
      
      const { error } = await supabase
        .from('members')
        .update({ tags: updatedTags })
        .eq('id', memberId);
      
      if (error) {
        console.error('Erro ao adicionar tag:', error);
        toast({
          title: 'Erro ao adicionar tag',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Atualizar a lista local
      setMemberTags(updatedTags);
      setNewTag(''); // Limpar o campo
      onClose(); // Fechar o modal
      
      toast({
        title: 'Tag adicionada',
        description: `"${newTag.trim()}" foi adicionada às suas tags`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Erro inesperado ao adicionar tag:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a tag',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove uma tag do membro
  const removeTagFromMember = async (tagToRemove: string) => {
    if (!memberId || memberId === 'temp-id') {
      toast({
        title: 'Erro',
        description: 'ID de membro inválido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Remover a tag do array
      const updatedTags = memberTags.filter(tag => tag !== tagToRemove);
      
      const { error } = await supabase
        .from('members')
        .update({ tags: updatedTags })
        .eq('id', memberId);
      
      if (error) {
        console.error('Erro ao remover tag:', error);
        toast({
          title: 'Erro ao remover tag',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Atualizar a lista local
      setMemberTags(updatedTags);
      
      toast({
        title: 'Tag removida',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Erro ao remover tag:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a tag',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar tag com Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagToMember();
    }
  };

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" w="full" mb={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Tags</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          size="sm"
          onClick={onOpen}
          isLoading={loading}
        >
          Adicionar Tag
        </Button>
      </Flex>

      {memberTags.length === 0 ? (
        <Text color="gray.500" fontSize="sm" my={4}>
          Você ainda não tem tags. Adicione tags para facilitar que outras pessoas encontrem você.
        </Text>
      ) : (
        <Flex wrap="wrap" gap={2} my={4}>
          {memberTags.map((tag, index) => (
            <Tag
              key={index}
              size="md"
              borderRadius="full"
              variant="solid"
              bg={tagBg}
              color={tagColor}
            >
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => removeTagFromMember(tag)} />
            </Tag>
          ))}
        </Flex>
      )}

      {/* Modal para adicionar tag */}
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={tagInputRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar Nova Tag</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Tags são palavras-chave que descrevem sua área de atuação, ajudando outros membros a encontrar você.
            </Text>
            <InputGroup>
              <Input
                ref={tagInputRef}
                placeholder="Digite uma nova tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <InputRightElement>
                {loading ? <Spinner size="sm" /> : null}
              </InputRightElement>
            </InputGroup>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              leftIcon={<FiCheck />}
              colorScheme="brand"
              onClick={addTagToMember}
              isLoading={loading}
            >
              Adicionar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
