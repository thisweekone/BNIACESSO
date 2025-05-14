'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Spinner,
  Flex,
  useOutsideClick,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

interface Option {
  id?: string;
  value: string;
  label: string;
}

interface FilterComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  loading?: boolean;
  onSearch?: (searchQuery: string) => void;
  label?: string;
}

export default function FilterCombobox({
  value,
  onChange,
  options,
  placeholder,
  loading = false,
  onSearch,
  label
}: FilterComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Fechar o dropdown quando clicar fora
  useOutsideClick({
    ref: ref,
    handler: () => setIsOpen(false),
  });

  // Atualizar o valor exibido quando o valor selecionado mudar
  useEffect(() => {
    if (value) {
      const option = options.find(opt => 
        opt.id === value || opt.value === value
      );
      
      if (option) {
        setDisplayValue(option.label);
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue('');
    }
  }, [value, options]);

  // Filtrar opções quando a busca ou opções mudarem
  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(lowerQuery)
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options]);

  // Lidar com a entrada de busca
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setDisplayValue(query);
    
    if (onSearch) {
      onSearch(query);
    }
    
    if (query.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      onChange('');
    }
  };

  // Selecionar uma opção
  const handleSelectOption = (option: Option) => {
    onChange(option.id || option.value);
    setDisplayValue(option.label);
    setSearchQuery('');
    setIsOpen(false);
  };

  // Limpar a seleção quando o campo estiver vazio
  const handleClear = () => {
    setDisplayValue('');
    setSearchQuery('');
    onChange('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Box position="relative" ref={ref} width="100%">
      {label && (
        <Text fontSize="sm" mb={1} fontWeight="medium">{label}</Text>
      )}
      
      <InputGroup>
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => {
            if (options.length > 0) {
              setIsOpen(true);
            }
          }}
          autoComplete="off"
        />
        <InputRightElement>
          {loading ? (
            <Spinner size="sm" color="gray.400" />
          ) : (
            <FiSearch color="gray" />
          )}
        </InputRightElement>
      </InputGroup>

      {isOpen && (
        <Box
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
          {filteredOptions.length === 0 ? (
            <Text color="gray.500" p={3} textAlign="center">
              Nenhuma opção encontrada
            </Text>
          ) : (
            filteredOptions.slice(0, 10).map((option, index) => (
              <Box
                key={option.id || `${option.value}-${index}`}
                p={3}
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
                onClick={() => handleSelectOption(option)}
                borderBottom={index < filteredOptions.length - 1 ? '1px solid' : 'none'}
                borderColor="gray.100"
              >
                <Text>{option.label}</Text>
              </Box>
            ))
          )}
          
          {filteredOptions.length > 10 && (
            <Box p={2} textAlign="center" bg="gray.50">
              <Text fontSize="sm" color="gray.500">
                +{filteredOptions.length - 10} resultados. Continue digitando para refinar.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
