'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Input,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  List,
  ListItem,
} from '@chakra-ui/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = "Adicione tags separadas por vírgula" }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const suggestionBg = useColorModeValue('white', 'gray.700');
  const suggestionHoverBg = useColorModeValue('gray.100', 'gray.600');

  // Converter de string para array de tags e vice-versa
  useEffect(() => {
    if (value) {
      setTags(value.split(',').map(tag => tag.trim()).filter(Boolean));
    } else {
      setTags([]);
    }
  }, [value]);

  const updateTags = (newTags: string[]) => {
    const tagsString = newTags.join(', ');
    onChange(tagsString);
    setTags(newTags);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.trim().length > 0) { // Reduzido para começar a mostrar sugestões mais cedo
      // Buscar sugestões no banco de dados
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('name')
          .ilike('name', `%${newValue.trim()}%`)
          .order('name', { ascending: true })
          .limit(8); // Aumentado o limite para mostrar mais sugestões

        if (!error && data) {
          console.log('Sugestões encontradas:', data);
          const suggestions = data.map(tag => tag.name);
          setSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões de tags:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      updateTags(newTags);
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      updateTags(newTags);
      setInputValue('');
      saveTagToDatabase(newTag);
    } else {
      setInputValue('');
    }
    setShowSuggestions(false);
  };

  const saveTagToDatabase = async (tag: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .upsert({ name: tag })
        .select();

      if (error) {
        console.error('Erro ao salvar tag:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar tag:', error);
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    updateTags(newTags);
  };

  const selectSuggestion = (suggestion: string) => {
    if (!tags.includes(suggestion)) {
      const newTags = [...tags, suggestion];
      updateTags(newTags);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  return (
    <VStack align="start" spacing={2} width="100%">
      <HStack wrap="wrap" width="100%" spacing={2} minHeight="40px">
        {tags.map((tag, index) => (
          <Tag
            key={index}
            size="md"
            borderRadius="full"
            variant="solid"
            colorScheme="brand"
            m={1}
          >
            <TagLabel>{tag}</TagLabel>
            <TagCloseButton onClick={() => removeTag(index)} />
          </Tag>
        ))}
      </HStack>
      
      <Box position="relative" width="100%">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
          onFocus={() => {
            // Mostrar sugestões ao focar se houver input ou se já tivermos sugestões
            if (inputValue.trim().length > 0 || suggestions.length > 0) {
              if (suggestions.length === 0) {
                // Se não houver sugestões ainda, busque imediatamente
                handleInputChange({ target: { value: inputValue } } as React.ChangeEvent<HTMLInputElement>);
              }
              setShowSuggestions(true);
            }
          }}
          placeholder={tags.length ? "Digite para adicionar mais tags" : placeholder}
          size="md"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <List
            position="absolute"
            zIndex={10}
            width="100%"
            bg={suggestionBg}
            boxShadow="lg"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            mt={1}
            maxH="200px"
            overflowY="auto"
          >
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                px={4}
                py={2}
                cursor="pointer"
                _hover={{ bg: suggestionHoverBg }}
                onClick={() => selectSuggestion(suggestion)}
                fontWeight={inputValue.trim() && suggestion.toLowerCase().startsWith(inputValue.toLowerCase().trim()) ? "bold" : "normal"}
              >
                <Text>
                  {suggestion}
                  {inputValue.trim() && suggestion.toLowerCase().startsWith(inputValue.toLowerCase().trim()) && 
                    <Text as="span" fontSize="xs" ml={2} color="gray.500">(correspondência exata)</Text>
                  }
                </Text>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </VStack>
  );
}
