'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useColorModeValue
} from '@chakra-ui/react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagInput({ 
  tags = [], 
  onChange, 
  placeholder = 'Adicione uma tag e pressione Enter', 
  maxTags = 20 
}: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const tagBg = useColorModeValue('brand.100', 'brand.900');
  const tagColor = useColorModeValue('brand.800', 'brand.200');

  // Foca o input quando o componente é montado
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // Verifica se já atingiu o número máximo de tags
      if (tags.length >= maxTags) {
        return;
      }
      
      // Verifica se a tag já existe
      if (!tags.includes(inputValue.trim())) {
        const newTags = [...tags, inputValue.trim()];
        onChange(newTags);
      }
      
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove a última tag quando pressiona backspace com o input vazio
      const newTags = tags.slice(0, tags.length - 1);
      onChange(newTags);
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  return (
    <Box>
      <Wrap spacing={2} mb={2}>
        {tags.map((tag, index) => (
          <WrapItem key={index}>
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              bg={tagBg}
              color={tagColor}
            >
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => removeTag(index)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        size="md"
      />
    </Box>
  );
}
