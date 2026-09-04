import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { creditCardService, cardApplicationService } from '../services/api';

const CardApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    businessName: '',
    businessTaxId: '',
    annualRevenue: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const { data: card, isLoading: cardLoading } = useQuery({
    queryKey: ['creditCard', id],
    queryFn: () => creditCardService.getCardById(id),
  });

  const mutation = useMutation({
    mutationFn: (data) => cardApplicationService.submitApplication(id, data),
    onSuccess: (data) => {
      setApplicationId(data.id);
      setSubmitted(true);
      window.scrollTo(0, 0);
    },
    onError: (error) => {
      console.error('Application submission error:', error);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.applicantName.trim()) {
      errors.applicantName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    }
    
    if (!formData.businessName.trim()) {
      errors.businessName = 'Business name is required';
    }
    
    if (!formData.businessTaxId.trim()) {
      errors.businessTaxId = 'Business Tax ID is required';
    }
    
    if (!formData.annualRevenue) {
      errors.annualRevenue = 'Annual revenue is required';
    } else if (isNaN(formData.annualRevenue) || parseFloat(formData.annualRevenue) <= 0) {
      errors.annualRevenue = 'Annual revenue must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      mutation.mutate({
        ...formData,
        annualRevenue: parseFloat(formData.annualRevenue),
      });
    }
  };

  if (cardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!card) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">Card not found</Alert>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Application Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for applying for the {card.name}. Your application ID is: <strong>{applicationId}</strong>
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We will review your application and contact you within 5-7 business days at {formData.email}.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/cards/${id}`)}
            >
              View Card Details
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Apply for {card.name}
      </Typography>
      
      <Card sx={{ mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Card Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Annual Fee
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                ${card.annualFee}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                APR
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {card.regularApr}
              </Typography>
            </Grid>
            {card.rewardsRate > 0 && (
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Rewards
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {card.rewardsRate}% back
                </Typography>
              </Grid>
            )}
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Card Type
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {card.cardType}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Application Information
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please fill out all required fields. All information is kept confidential and secure.
        </Typography>

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            There was an error submitting your application. Please try again.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleInputChange}
                error={!!formErrors.applicantName}
                helperText={formErrors.applicantName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Business Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                error={!!formErrors.businessName}
                helperText={formErrors.businessName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Business Tax ID (EIN)"
                name="businessTaxId"
                value={formData.businessTaxId}
                onChange={handleInputChange}
                error={!!formErrors.businessTaxId}
                helperText={formErrors.businessTaxId}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Annual Revenue"
                name="annualRevenue"
                type="number"
                value={formData.annualRevenue}
                onChange={handleInputChange}
                error={!!formErrors.annualRevenue}
                helperText={formErrors.annualRevenue}
                InputProps={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/cards/${id}`)}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={mutation.isPending}
                  startIcon={mutation.isPending ? <CircularProgress size={20} /> : null}
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CardApplicationPage;
