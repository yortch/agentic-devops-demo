import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { cardService } from '../services/api';

const CardDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: card, isLoading, error } = useQuery({
    queryKey: ['card', id],
    queryFn: () => cardService.getCardById(id),
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !card) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">Card not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          p: 4,
          mb: 4,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Chip label={card.cardType} color="secondary" sx={{ mb: 2 }} />
            <Typography variant="h3" gutterBottom>
              {card.name}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {card.description}
            </Typography>
            {card.signupBonus && (
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Signup Bonus: {card.signupBonus}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={() => navigate(`/apply/${card.id}`)}
              sx={{ py: 2 }}
            >
              Apply Now
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Facts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Annual Fee
              </Typography>
              <Typography variant="h4">${card.annualFee}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Regular APR
              </Typography>
              <Typography variant="h4">{card.regularApr}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Rewards
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '1.5rem' }}>
                {card.rewardsRate || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Details Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Features
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {card.features}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Benefits
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {card.benefits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Rate & Fee Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Intro APR:</strong> {card.introApr}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Regular APR:</strong> {card.regularApr}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Annual Fee:</strong> ${card.annualFee}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Foreign Transaction Fee:</strong> {card.foreignTransactionFee}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Credit Score Needed:</strong> {card.creditScoreNeeded}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom CTA */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate(`/apply/${card.id}`)}
          sx={{ px: 6, py: 2 }}
        >
          Apply for This Card
        </Button>
      </Box>
    </Container>
  );
};

export default CardDetailsPage;
