import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  InputAdornment,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import { creditCardService, applicationService } from '../services/api';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const YEARS_IN_BUSINESS_OPTIONS = [
  'Less than 1 year',
  '1-2 years',
  '3-5 years',
  '6-10 years',
  'More than 10 years',
];

const steps = ['Card Selection', 'Business Information', 'Personal Information', 'Review & Submit'];

const CardApplicationPage = () => {
  const { id: cardIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cardId = cardIdParam || searchParams.get('cardId');

  const [activeStep, setActiveStep] = useState(cardId ? 1 : 0);
  const [selectedCardId, setSelectedCardId] = useState(cardId || '');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    businessName: '',
    annualRevenue: '',
    yearsInBusiness: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['creditCards'],
    queryFn: () => creditCardService.getAllCards(),
  });

  const { data: selectedCard } = useQuery({
    queryKey: ['creditCard', selectedCardId],
    queryFn: () => creditCardService.getCardById(selectedCardId),
    enabled: !!selectedCardId,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => applicationService.submitApplication(data),
    onSuccess: (response) => {
      setSubmissionResult(response);
      setActiveStep(4);
    },
    onError: (error) => {
      if (error.response?.data?.fieldErrors) {
        setFieldErrors(error.response.data.fieldErrors);
      }
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.businessName) errors.businessName = 'Business name is required';
      if (!formData.annualRevenue) errors.annualRevenue = 'Annual revenue is required';
      if (formData.annualRevenue && isNaN(formData.annualRevenue)) errors.annualRevenue = 'Must be a number';
      if (!formData.yearsInBusiness) errors.yearsInBusiness = 'Years in business is required';
    }
    if (step === 2) {
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.email) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
      if (!formData.phone) errors.phone = 'Phone number is required';
      else if (!/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(formData.phone)) errors.phone = 'Invalid phone number';
      if (!formData.address) errors.address = 'Address is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.zipCode) errors.zipCode = 'ZIP code is required';
      else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) errors.zipCode = 'Invalid ZIP code';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedCardId) return;
      setActiveStep(1);
    } else if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setFieldErrors({});
  };

  const handleSubmit = () => {
    const payload = {
      cardId: Number(selectedCardId),
      ...formData,
      annualRevenue: parseFloat(formData.annualRevenue),
    };
    submitMutation.mutate(payload);
  };

  // Success screen
  if (submissionResult) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main">
            Application Submitted!
          </Typography>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Thank you, {submissionResult.firstName}. Your application for the{' '}
            <strong>{submissionResult.cardName}</strong> has been received.
          </Typography>
          <Card sx={{ my: 3, backgroundColor: 'grey.50' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Reference Number
              </Typography>
              <Typography variant="h5" fontWeight={700} color="secondary.main">
                {submissionResult.referenceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Status: <Chip label={submissionResult.status} size="small" color="primary" />
              </Typography>
            </CardContent>
          </Card>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            A confirmation email will be sent to <strong>{submissionResult.email}</strong>.
            You can use your reference number to check your application status.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/cards')}>
              Browse More Cards
            </Button>
            <Button variant="contained" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(cardId ? `/cards/${cardId}` : '/cards')}
        sx={{ mb: 3 }}
      >
        {cardId ? 'Back to Card Details' : 'Back to Cards'}
      </Button>

      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Apply for a Business Credit Card
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete the application form below. All fields are required.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {submitMutation.isError && !submitMutation.error?.response?.data?.fieldErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          An error occurred while submitting your application. Please try again.
        </Alert>
      )}

      {/* Step 0: Card Selection */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Select a Credit Card
          </Typography>
          {cardsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {cards?.map((card) => (
                <Grid item xs={12} sm={6} key={card.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedCardId === card.id ? '2px solid' : '2px solid transparent',
                      borderColor: selectedCardId === card.id ? 'secondary.main' : 'transparent',
                    }}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600}>
                        {card.name}
                      </Typography>
                      <Chip label={card.cardType} size="small" sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Annual Fee: ${card.annualFee} | Rewards: {card.rewardsRate > 0 ? `${card.rewardsRate}%` : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Step 1: Business Information */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Business Information
          </Typography>
          {selectedCard && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Applying for: <strong>{selectedCard.name}</strong> ({selectedCard.cardType})
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                error={!!fieldErrors.businessName}
                helperText={fieldErrors.businessName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Revenue"
                name="annualRevenue"
                value={formData.annualRevenue}
                onChange={handleInputChange}
                error={!!fieldErrors.annualRevenue}
                helperText={fieldErrors.annualRevenue}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Years in Business"
                name="yearsInBusiness"
                value={formData.yearsInBusiness}
                onChange={handleInputChange}
                error={!!fieldErrors.yearsInBusiness}
                helperText={fieldErrors.yearsInBusiness}
                required
              >
                {YEARS_IN_BUSINESS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Step 2: Personal Information */}
      {activeStep === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Personal Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                placeholder="(555) 555-5555"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={!!fieldErrors.address}
                helperText={fieldErrors.address}
                required
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={!!fieldErrors.city}
                helperText={fieldErrors.city}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                error={!!fieldErrors.state}
                helperText={fieldErrors.state}
                required
              >
                {US_STATES.map((st) => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                error={!!fieldErrors.zipCode}
                helperText={fieldErrors.zipCode}
                placeholder="15201"
                required
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Step 3: Review & Submit */}
      {activeStep === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Review Your Application
          </Typography>
          {selectedCard && (
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #003366 0%, #008080 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>
                  {selectedCard.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedCard.cardType} | Annual Fee: ${selectedCard.annualFee} | Rewards: {selectedCard.rewardsRate > 0 ? `${selectedCard.rewardsRate}%` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Business Information</Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography><strong>Business Name:</strong> {formData.businessName}</Typography>
              <Typography><strong>Annual Revenue:</strong> ${Number(formData.annualRevenue).toLocaleString()}</Typography>
              <Typography><strong>Years in Business:</strong> {formData.yearsInBusiness}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Personal Information</Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography><strong>Name:</strong> {formData.firstName} {formData.lastName}</Typography>
              <Typography><strong>Email:</strong> {formData.email}</Typography>
              <Typography><strong>Phone:</strong> {formData.phone}</Typography>
              <Typography><strong>Address:</strong> {formData.address}</Typography>
              <Typography>{formData.city}, {formData.state} {formData.zipCode}</Typography>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            By submitting this application, you agree to allow Three Rivers Bank to review your
            business credit history. This is a demo application — no real credit check will be performed.
          </Alert>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || (activeStep === 1 && !!cardId)}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep < 3 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 0 && !selectedCardId}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              startIcon={submitMutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default CardApplicationPage;
