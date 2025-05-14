import { Box, Grid, Typography } from '@mui/material';
import { MatchCard } from './MatchCard';
import { mockMatches } from '../mocks/matchesMock';

export const MatchesExample = () => {
  const handleMatchClick = (matchId: string) => {
    console.log(`Match selecionado: ${matchId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Matches Sugeridos
      </Typography>
      
      <Grid container spacing={3}>
        {mockMatches.map((match) => (
          <Grid item xs={12} sm={6} md={4} key={match.id}>
            <MatchCard
              match={match}
              onClick={() => handleMatchClick(match.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 