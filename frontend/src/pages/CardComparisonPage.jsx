import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { cardService } from '../services/api';

const CardComparisonPage = () => {
  const navigate = useNavigate();

  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['cards'],
    queryFn: cardService.getAllCards,
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">Failed to load credit cards. Please try again later.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Compare Business Credit Cards
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
        Choose the perfect card for your business needs
      </Typography>

      <Grid container spacing={4}>
        {cards?.map((card) => (
          <Grid item xs={12} md={6} lg={4} key={card.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Chip
                  label={card.cardType}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  {card.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {card.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Annual Fee:</strong> ${card.annualFee}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>APR:</strong> {card.regularApr}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Rewards:</strong> {card.rewardsRate || 'N/A'}
                  </Typography>
                  {card.signupBonus && (
                    <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                      Bonus: {card.signupBonus}
                    </Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/cards/${card.id}`)}
                  sx={{ mr: 1 }}
                >
                  Learn More
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/apply/${card.id}`)}
                >
                  Apply Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CardComparisonPage;
