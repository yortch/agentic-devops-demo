import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { creditCardService } from '../services/api';
import api from '../services/api';

const steps = ['Business Information', 'Personal Information', 'Review & Submit'];

const businessTypes = [
  'LLC',
  'Corporation',
  'Sole Proprietorship',
  'Partnership',
  'Non-Profit',
];

const industries = [
  'Technology',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Finance',
  'Real Estate',
  'Professional Services',
  'Hospitality',
  'Construction',
  'Other',
];

const CardApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    businessLegalName: '',
    businessType: '',
    taxId: '',
    businessIndustry: '',
    annualRevenue: '',
    yearsInBusiness: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessPhone: '',
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    homeAddress: '',
    city: '',
    state: '',
    zipCode: '',
    ssn: '',
    dateOfBirth: '',
    annualIncome: '',
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: card, isLoading } = useQuery({
    queryKey: ['creditCard', id],
    queryFn: () => creditCardService.getCardById(id),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Business Information validation
      if (!formData.businessName.trim()) newErrors.businessName = 'Required';
      if (!formData.businessLegalName.trim()) newErrors.businessLegalName = 'Required';
      if (!formData.businessType) newErrors.businessType = 'Required';
      if (!formData.taxId.trim()) newErrors.taxId = 'Required';
      if (!formData.businessIndustry) newErrors.businessIndustry = 'Required';
      if (!formData.annualRevenue || parseFloat(formData.annualRevenue) <= 0) {
        newErrors.annualRevenue = 'Required and must be greater than 0';
      }
      if (!formData.yearsInBusiness || parseInt(formData.yearsInBusiness) < 0) {
        newErrors.yearsInBusiness = 'Required and must be 0 or greater';
      }
      if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Required';
      if (!formData.businessCity.trim()) newErrors.businessCity = 'Required';
      if (!formData.businessState.trim()) newErrors.businessState = 'Required';
      if (!formData.businessZipCode.trim()) newErrors.businessZipCode = 'Required';
      if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Required';
    }

    if (step === 1) {
      // Personal Information validation
      if (!formData.firstName.trim()) newErrors.firstName = 'Required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Required';
      if (!formData.email.trim()) {
        newErrors.email = 'Required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Required';
      if (!formData.homeAddress.trim()) newErrors.homeAddress = 'Required';
      if (!formData.city.trim()) newErrors.city = 'Required';
      if (!formData.state.trim()) newErrors.state = 'Required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Required';
      if (!formData.ssn.trim()) newErrors.ssn = 'Required (last 4 digits)';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
      if (!formData.annualIncome || parseFloat(formData.annualIncome) <= 0) {
        newErrors.annualIncome = 'Required and must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Format the data for submission
      const applicationData = {
        ...formData,
        cardId: parseInt(id),
        annualRevenue: parseFloat(formData.annualRevenue),
        yearsInBusiness: parseInt(formData.yearsInBusiness),
        annualIncome: parseFloat(formData.annualIncome),
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      };

      const response = await api.post(`/cards/${id}/applications`, applicationData);

      setSubmitStatus({
        type: 'success',
        message: `Application submitted successfully! Reference ID: ${response.data.id}`,
      });
      setActiveStep(3); // Move to success step
    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to submit application. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!card) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Card not found</Alert>
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

  // Success screen after submission
  if (activeStep === 3) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Application Submitted!
          </Typography>
          <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
            {submitStatus.message}
          </Alert>
          <Typography variant="body1" paragraph>
            Thank you for applying for the {card.name}. A Three Rivers Bank representative
            will review your application and contact you within 7-10 business days.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/cards')}
              sx={{ mr: 2 }}
            >
              View Other Cards
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/cards/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to Card Details
      </Button>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Apply for {card.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Complete the application form below to apply for this card
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitStatus.message && (
            <Alert severity={submitStatus.type} sx={{ mb: 3 }}>
              {submitStatus.message}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Name (DBA)"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={!!errors.businessName}
                    helperText={errors.businessName}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Legal Name"
                    name="businessLegalName"
                    value={formData.businessLegalName}
                    onChange={handleChange}
                    error={!!errors.businessLegalName}
                    helperText={errors.businessLegalName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Business Type"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    error={!!errors.businessType}
                    helperText={errors.businessType}
                    required
                  >
                    {businessTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax ID (EIN)"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    error={!!errors.taxId}
                    helperText={errors.taxId}
                    placeholder="XX-XXXXXXX"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Industry"
                    name="businessIndustry"
                    value={formData.businessIndustry}
                    onChange={handleChange}
                    error={!!errors.businessIndustry}
                    helperText={errors.businessIndustry}
                    required
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Years in Business"
                    name="yearsInBusiness"
                    type="number"
                    value={formData.yearsInBusiness}
                    onChange={handleChange}
                    error={!!errors.yearsInBusiness}
                    helperText={errors.yearsInBusiness}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Annual Revenue"
                    name="annualRevenue"
                    type="number"
                    value={formData.annualRevenue}
                    onChange={handleChange}
                    error={!!errors.annualRevenue}
                    helperText={errors.annualRevenue}
                    InputProps={{ startAdornment: '$' }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Address"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    error={!!errors.businessAddress}
                    helperText={errors.businessAddress}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    name="businessCity"
                    value={formData.businessCity}
                    onChange={handleChange}
                    error={!!errors.businessCity}
                    helperText={errors.businessCity}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    name="businessState"
                    value={formData.businessState}
                    onChange={handleChange}
                    error={!!errors.businessState}
                    helperText={errors.businessState}
                    placeholder="PA"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="businessZipCode"
                    value={formData.businessZipCode}
                    onChange={handleChange}
                    error={!!errors.businessZipCode}
                    helperText={errors.businessZipCode}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Phone"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleChange}
                    error={!!errors.businessPhone}
                    helperText={errors.businessPhone}
                    placeholder="412-555-0123"
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Personal Information (Primary Business Owner)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
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
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Home Address"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleChange}
                    error={!!errors.homeAddress}
                    helperText={errors.homeAddress}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    error={!!errors.city}
                    helperText={errors.city}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    error={!!errors.state}
                    helperText={errors.state}
                    placeholder="PA"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SSN (Last 4 Digits)"
                    name="ssn"
                    value={formData.ssn}
                    onChange={handleChange}
                    error={!!errors.ssn}
                    helperText={errors.ssn}
                    placeholder="****1234"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Annual Personal Income"
                    name="annualIncome"
                    type="number"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    error={!!errors.annualIncome}
                    helperText={errors.annualIncome}
                    InputProps={{ startAdornment: '$' }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Application
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
                Please review your information before submitting
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Business Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Business Name:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.businessName}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Legal Name:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.businessLegalName}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Type:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.businessType}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Industry:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.businessIndustry}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Annual Revenue:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">${parseFloat(formData.annualRevenue).toLocaleString()}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Years in Business:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.yearsInBusiness}</Typography></Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Name:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.firstName} {formData.lastName}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Email:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.email}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Phone:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.phoneNumber}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Annual Income:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">${parseFloat(formData.annualIncome).toLocaleString()}</Typography></Grid>
                </Grid>
              </Paper>

              <Alert severity="info" sx={{ mt: 3 }}>
                By submitting this application, you authorize Three Rivers Bank to check your
                credit and verify the information provided.
              </Alert>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CardApplicationPage;
