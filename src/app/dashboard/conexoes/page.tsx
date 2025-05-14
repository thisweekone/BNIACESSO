import { Box, Container } from '@chakra-ui/react';
import { UserConnectionsList } from '@/components/connections/UserConnectionsList';

export default function ConexoesPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <UserConnectionsList />
      </Box>
    </Container>
  );
}
