import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { creditCardService } from '../services/api';

const CardDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState('features');

  const { data: card, isLoading, error } = useQuery({
    queryKey: ['creditCard', id],
    queryFn: () => creditCardService.getCardById(id),
  });

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !card) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Card not found or error loading card details</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cards')}
          sx={{ mt: 2 }}
        >
          Back to Cards
        </Button>
      </Container>
    );
  }

  const features = card.features?.split(';').filter(f => f.trim()) || [];
  const benefits = card.benefits?.split(';').filter(b => b.trim()) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/cards')}
        sx={{ mb: 3 }}
      >
        Back to Comparison
      </Button>

      {/* Hero Section */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #003366 0%, #008080 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Chip
            label={card.cardType}
            sx={{ mb: 2, backgroundColor: 'white', color: 'primary.main' }}
          />
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {card.name}
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            {card.description}
          </Typography>
          {card.signupBonus && (
            <Box
              sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                🎉 Sign-up Bonus: {card.signupBonus}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Facts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                ${card.annualFee}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Annual Fee
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main" fontWeight={700}>
                {card.rewardsRate > 0 ? `${card.rewardsRate}%` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rewards Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main" fontWeight={700}>
                {card.introApr || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intro APR
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main" fontWeight={700}>
                {card.regularApr}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regular APR
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Information */}
      <Box sx={{ mb: 4 }}>
        <Accordion expanded={expanded === 'features'} onChange={handleChange('features')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight={600}>
              Card Features
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="ul" sx={{ pl: 2 }}>
              {features.map((feature, index) => (
                <Typography component="li" key={index} variant="body1" sx={{ mb: 1 }}>
                  {feature.trim()}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'benefits'} onChange={handleChange('benefits')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight={600}>
              Benefits & Perks
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="ul" sx={{ pl: 2 }}>
              {benefits.map((benefit, index) => (
                <Typography component="li" key={index} variant="body1" sx={{ mb: 1 }}>
                  {benefit.trim()}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {card.feeSchedules && card.feeSchedules.length > 0 && (
          <Accordion expanded={expanded === 'fees'} onChange={handleChange('fees')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600}>
                Fee Schedule
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Fee Type</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {card.feeSchedules.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.feeType}</TableCell>
                        <TableCell>${fee.feeAmount}</TableCell>
                        <TableCell>{fee.feeDescription}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}

        {card.interestRates && card.interestRates.length > 0 && (
          <Accordion expanded={expanded === 'interest'} onChange={handleChange('interest')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600}>
                Interest Rates
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Rate Type</strong></TableCell>
                      <TableCell><strong>Rate</strong></TableCell>
                      <TableCell><strong>Calculation Method</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {card.interestRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>{rate.rateType}</TableCell>
                        <TableCell>{rate.rateValue}%</TableCell>
                        <TableCell>{rate.calculationMethod}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>

      {/* Credit Score Requirement */}
      <Card sx={{ mb: 4, backgroundColor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Credit Score Needed
          </Typography>
          <Typography variant="body1">
            {card.creditScoreNeeded}
          </Typography>
        </CardContent>
      </Card>

      {/* Apply CTA */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ minWidth: 200 }}
          onClick={() => navigate(`/cards/${id}/apply`)}
        >
          Apply Now
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
          Start your application in just a few minutes
        </Typography>
      </Box>
    </Container>
  );
};

export default CardDetailsPage;
