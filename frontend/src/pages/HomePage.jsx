import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlightIcon from '@mui/icons-material/Flight';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { creditCardService } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedPriority, setSelectedPriority] = useState('');
  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['creditCards'],
    queryFn: creditCardService.getAllCards,
  });

  const handleViewCard = (cardId) => {
    navigate(`/cards/${cardId}`);
  };

  const handleCompareCards = () => {
    navigate('/cards');
  };

  const getRecommendedCard = () => {
    if (!selectedPriority || !cards?.length) {
      return null;
    }

    if (selectedPriority === 'travel') {
      return cards.find((card) => card.cardType === 'Travel Rewards') || cards[0];
    }

    if (selectedPriority === 'cashback') {
      return cards.find((card) => card.cardType === 'Cash Back') || cards[0];
    }

    return cards.find((card) => Number(card.annualFee) === 0) || cards[0];
  };

  const recommendedCard = getRecommendedCard();

  const getCategoryIcon = (cardType) => {
    switch (cardType) {
      case 'Travel Rewards':
        return <FlightIcon />;
      case 'Cash Back':
        return <AccountBalanceWalletIcon />;
      case 'Premium Rewards':
        return <TrendingUpIcon />;
      default:
        return <CreditCardIcon />;
    }
  };

  const getCategoryTone = (cardType) => {
    switch (cardType) {
      case 'Travel Rewards':
        return {
          surface: 'rgba(0, 128, 128, 0.08)',
          accent: 'secondary.main',
        };
      case 'Cash Back':
        return {
          surface: 'rgba(0, 51, 102, 0.08)',
          accent: 'primary.main',
        };
      case 'Premium Rewards':
        return {
          surface: 'rgba(0, 128, 128, 0.14)',
          accent: 'secondary.dark',
        };
      default:
        return {
          surface: 'rgba(0, 51, 102, 0.05)',
          accent: 'primary.light',
        };
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #003366 0%, #008080 100%)',
          color: 'white',
          py: { xs: 7, md: 10 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                fontWeight={700}
                sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' }, lineHeight: 1 }}
              >
                Business Credit Cards for Every Need
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, maxWidth: 560 }}>
                Earn rewards, build credit, and manage expenses with Three Rivers Bank
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                onClick={handleCompareCards}
              >
                Compare All Cards
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  color: 'text.primary',
                  backgroundColor: 'rgba(255,255,255,0.96)',
                  border: '1px solid rgba(255,255,255,0.55)',
                  borderRadius: 3,
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Not sure where to start?
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Tell us what matters most and we&apos;ll point you to a card worth a closer look.
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedPriority}
                    exclusive
                    onChange={(_, value) => value && setSelectedPriority(value)}
                    aria-label="Choose what matters most"
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      '& .MuiToggleButtonGroup-grouped': {
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '999px !important',
                        px: 2,
                      },
                    }}
                  >
                    <ToggleButton value="cashback">Cash back</ToggleButton>
                    <ToggleButton value="travel">Travel rewards</ToggleButton>
                    <ToggleButton value="simple">Keep it simple</ToggleButton>
                  </ToggleButtonGroup>

                  <Collapse in={Boolean(recommendedCard)} unmountOnExit>
                    {recommendedCard && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                          pt: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="secondary.dark" fontWeight={700}>
                            A good place to start
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {recommendedCard.name}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="secondary"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => handleViewCard(recommendedCard.id)}
                          sx={{ flexShrink: 0 }}
                        >
                          See why it fits
                        </Button>
                      </Box>
                    )}
                  </Collapse>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Cards Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Featured Business Credit Cards
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4 }}>
            Unable to load credit cards. Please verify the backend is running and try again.
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {cards?.slice(0, 3).map((card) => (
              <Grid size={{ xs: 12, md: 4 }} key={card.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: getCategoryTone(card.cardType).surface,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: getCategoryTone(card.cardType).accent,
                          color: 'white',
                          p: 1,
                          borderRadius: 2,
                          mr: 2,
                        }}
                      >
                        {getCategoryIcon(card.cardType)}
                      </Box>
                      <Typography variant="h5" component="h3" fontWeight={600}>
                        {card.name}
                      </Typography>
                    </Box>

                    <Chip
                      label={card.cardType}
                      size="small"
                      sx={{ mb: 2 }}
                      color="secondary"
                    />

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {card.description?.substring(0, 150)}...
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Annual Fee: ${card.annualFee}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        APR: {card.regularApr}
                      </Typography>
                      {card.rewardsRate > 0 && (
                        <Typography variant="body2" fontWeight={600}>
                          Rewards: {card.rewardsRate}% back
                        </Typography>
                      )}
                    </Box>

                    {card.signupBonus && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          backgroundColor: 'secondary.light',
                          color: 'white',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {card.signupBonus}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleViewCard(card.id)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="outlined" size="large" onClick={handleCompareCards}>
            View All Cards
          </Button>
        </Box>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ backgroundColor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            Why Choose Three Rivers Bank?
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Competitive Rewards
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Earn cash back or points on every purchase with our flexible rewards programs
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Expense Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track spending, set employee limits, and integrate with QuickBooks seamlessly
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CreditCardIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  No Hidden Fees
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Transparent pricing with no surprises. Many cards with $0 annual fee
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
