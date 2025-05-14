import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  Spinner,
  InputGroup,
  InputRightElement,
  useOutsideClick,
} from '@chakra-ui/react';
import { searchSpecialties, fetchSpecialties } from '@/utils/specialtyFunctions';

interface Specialty {
  id: string;
  name: string;
}

interface SpecialtySelectProps {
  value?: string;
  onChange: (value: string, specialtyObj: Specialty | null) => void;
  placeholder?: string;
}

export default function SpecialtySelect({ value = '', onChange, placeholder = 'Selecione sua especialidade' }: SpecialtySelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  
  // Fechar o dropdown quando clicar fora
  useOutsideClick({
    ref: ref,
    handler: () => setIsOpen(false),
  });

  // Carregar todas as especialidades quando o componente montar
  useEffect(() => {
    const loadSpecialties = async () => {
      setLoading(true);
      try {
        const data = await fetchSpecialties();
        setSpecialties(data);
      } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  // Atualizar o input quando vier um valor de fora
  useEffect(() => {
    if (value) {
      // Se já tiver especialidades carregadas, procura pelo ID
      const foundSpecialty = specialties.find(s => s.id === value);
      
      if (foundSpecialty) {
        setInputValue(foundSpecialty.name);
        setSelectedSpecialty(foundSpecialty);
      } else if (specialties.length > 0) {
        // Tenta encontrar por nome se não encontrou por ID
        const foundByName = specialties.find(s => s.name.toLowerCase() === value.toLowerCase());
        
        if (foundByName) {
          setInputValue(foundByName.name);
          setSelectedSpecialty(foundByName);
        } else {
          // Se não encontrou, considera o valor como texto livre temporário
          setInputValue(value);
          setSelectedSpecialty(null);
        }
      } else {
        // Se as especialidades ainda não carregaram, mostra o valor como está
        setInputValue(value);
      }
    }
  }, [value, specialties]);

  // Função para buscar especialidades com base no texto digitado
  const handleSearch = async (searchText: string) => {
    setInputValue(searchText);
    
    if (searchText.length > 0) {
      setLoading(true);
      try {
        // Se o texto tem mais de 2 caracteres, busca no backend
        if (searchText.length > 2) {
          const results = await searchSpecialties(searchText);
          setFilteredSpecialties(results);
        } else {
          // Senão filtra localmente
          const filtered = specialties.filter(specialty => 
            specialty.name.toLowerCase().includes(searchText.toLowerCase())
          );
          setFilteredSpecialties(filtered);
        }
      } catch (error) {
        console.error('Erro ao pesquisar especialidades:', error);
      } finally {
        setLoading(false);
      }
      
      setIsOpen(true);
    } else {
      setFilteredSpecialties([]);
      setIsOpen(false);
    }
  };

  // Quando selecionar uma especialidade
  const handleSelectSpecialty = (specialty: Specialty) => {
    setInputValue(specialty.name);
    setSelectedSpecialty(specialty);
    setIsOpen(false);
    
    // Chama o onChange com o ID da especialidade selecionada
    onChange(specialty.id, specialty);
  };

  // Quando o input perder o foco
  const handleBlur = () => {
    // Se tiver especialidade selecionada, mantém o valor
    if (!selectedSpecialty && inputValue) {
      // Se não tiver especialidade selecionada mas tiver texto,
      // verifica se há match exato na lista
      const exactMatch = specialties.find(
        s => s.name.toLowerCase() === inputValue.toLowerCase()
      );
      
      if (exactMatch) {
        setSelectedSpecialty(exactMatch);
        onChange(exactMatch.id, exactMatch);
      } else {
        // Se não tiver match exato, mantém o texto como está
        onChange(inputValue, null);
      }
    }
    
    // Fecha o dropdown depois de um delay para permitir o clique nas opções
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Box position="relative" ref={ref} width="100%">
      <InputGroup>
        <Input
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (inputValue.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          width="100%"
        />
        {loading && (
          <InputRightElement>
            <Spinner size="sm" color="gray.400" />
          </InputRightElement>
        )}
      </InputGroup>

      {isOpen && filteredSpecialties.length > 0 && (
        <List
          position="absolute"
          w="100%"
          bg="white"
          boxShadow="md"
          borderRadius="md"
          mt={1}
          maxH="200px"
          overflowY="auto"
          zIndex={999}
          border="1px solid"
          borderColor="gray.200"
        >
          {filteredSpecialties.map((specialty) => (
            <ListItem
              key={specialty.id}
              p={2}
              cursor="pointer"
              _hover={{ bg: 'gray.100' }}
              onClick={() => handleSelectSpecialty(specialty)}
            >
              <Text>{specialty.name}</Text>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
