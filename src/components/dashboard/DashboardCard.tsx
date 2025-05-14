'use client';

import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export interface DashboardCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function DashboardCard({ children, onClick }: DashboardCardProps) {
  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      transition="all 0.2s"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={{
        transform: onClick ? 'translateY(-2px)' : 'none',
        boxShadow: onClick ? 'md' : 'sm',
      }}
    >
      {children}
    </Box>
  );
}