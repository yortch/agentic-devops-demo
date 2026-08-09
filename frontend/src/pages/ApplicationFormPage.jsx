import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { creditCardService } from '../services/api';

const steps = ['Business Information', 'Owner Information', 'Card Preferences', 'Review & Submit'];

const businessStructures = [
  'Sole Proprietorship',
  'LLC',
  'Corporation',
  'Partnership',
  'Non-Profit',
];

const industries = [
  'Retail',
  'Technology',
  'Healthcare',
  'Construction',
  'Manufacturing',
  'Professional Services',
  'Food & Beverage',
  'Real Estate',
  'Transportation',
  'Other',
];

const revenueRanges = [
  'Less than $100,000',
  '$100,000 - $250,000',
  '$250,000 - $500,000',
  '$500,000 - $1,000,000',
  '$1,000,000 - $5,000,000',
  'Over $5,000,000',
];

const creditLimits = ['$5k', '$10k', '$25k', '$50k', '$100k+'];

const ApplicationFormPage = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(`application_draft_${cardId}`);
    return saved ? JSON.parse(saved) : {
      // Business Information
      businessLegalName: '',
      dbaName: '',
      businessStructure: '',
      taxId: '',
      industry: '',
      yearsInBusiness: '',
      numberOfEmployees: '',
      annualBusinessRevenue: '',
      businessStreetAddress: '',
      businessCity: '',
      businessState: '',
      businessZip: '',
      businessPhone: '',
      businessWebsite: '',
      // Owner Information
      ownerFirstName: '',
      ownerLastName: '',
      ownerDateOfBirth: '',
      ownerSsn: '',
      ownerEmail: '',
      ownerStreetAddress: '',
      ownerCity: '',
      ownerState: '',
      ownerZip: '',
      ownerMobilePhone: '',
      ownershipPercentage: '',
      ownerTitle: '',
      ownerAnnualIncome: '',
      // Card Preferences
      requestedCreditLimit: '',
      numberOfEmployeeCards: 0,
      // Terms
      agreedToTerms: false,
      consentToCreditCheck: false,
      electronicSignature: '',
    };
  });

  const { data: card, isLoading: cardLoading } = useQuery({
    queryKey: ['creditCard', cardId],
    queryFn: () => creditCardService.getCardById(cardId),
  });

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`application_draft_${cardId}`, JSON.stringify(formData));
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData, cardId]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Business Information
      if (!formData.businessLegalName) newErrors.businessLegalName = 'Required';
      if (!formData.businessStructure) newErrors.businessStructure = 'Required';
      if (!formData.taxId) {
        newErrors.taxId = 'Required';
      } else if (!/^\d{9}$/.test(formData.taxId.replace(/\D/g, ''))) {
        newErrors.taxId = 'Must be 9 digits';
      }
      if (!formData.industry) newErrors.industry = 'Required';
      if (!formData.yearsInBusiness) newErrors.yearsInBusiness = 'Required';
      if (!formData.numberOfEmployees) newErrors.numberOfEmployees = 'Required';
      if (!formData.annualBusinessRevenue) newErrors.annualBusinessRevenue = 'Required';
      if (!formData.businessStreetAddress) newErrors.businessStreetAddress = 'Required';
      if (!formData.businessCity) newErrors.businessCity = 'Required';
      if (!formData.businessState) newErrors.businessState = 'Required';
      if (!formData.businessZip) {
        newErrors.businessZip = 'Required';
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.businessZip)) {
        newErrors.businessZip = 'Invalid ZIP code';
      }
      if (!formData.businessPhone) newErrors.businessPhone = 'Required';
    }

    if (step === 1) {
      // Owner Information
      if (!formData.ownerFirstName) newErrors.ownerFirstName = 'Required';
      if (!formData.ownerLastName) newErrors.ownerLastName = 'Required';
      if (!formData.ownerDateOfBirth) {
        newErrors.ownerDateOfBirth = 'Required';
      } else {
        const age = Math.floor((new Date() - new Date(formData.ownerDateOfBirth)) / 31557600000);
        if (age < 18) newErrors.ownerDateOfBirth = 'Must be 18 or older';
      }
      if (!formData.ownerSsn) {
        newErrors.ownerSsn = 'Required';
      } else if (!/^\d{9}$/.test(formData.ownerSsn.replace(/\D/g, ''))) {
        newErrors.ownerSsn = 'Must be 9 digits';
      }
      if (!formData.ownerEmail) {
        newErrors.ownerEmail = 'Required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
        newErrors.ownerEmail = 'Invalid email';
      }
      if (!formData.ownerStreetAddress) newErrors.ownerStreetAddress = 'Required';
      if (!formData.ownerCity) newErrors.ownerCity = 'Required';
      if (!formData.ownerState) newErrors.ownerState = 'Required';
      if (!formData.ownerZip) {
        newErrors.ownerZip = 'Required';
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.ownerZip)) {
        newErrors.ownerZip = 'Invalid ZIP code';
      }
      if (!formData.ownerMobilePhone) newErrors.ownerMobilePhone = 'Required';
      if (!formData.ownershipPercentage) {
        newErrors.ownershipPercentage = 'Required';
      } else if (formData.ownershipPercentage < 1 || formData.ownershipPercentage > 100) {
        newErrors.ownershipPercentage = 'Must be 1-100';
      }
      if (!formData.ownerTitle) newErrors.ownerTitle = 'Required';
      if (!formData.ownerAnnualIncome) newErrors.ownerAnnualIncome = 'Required';
    }

    if (step === 2) {
      // Card Preferences
      if (!formData.requestedCreditLimit) newErrors.requestedCreditLimit = 'Required';
    }

    if (step === 3) {
      // Terms & Review
      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms';
      if (!formData.consentToCreditCheck) newErrors.consentToCreditCheck = 'You must consent to credit check';
      if (!formData.electronicSignature) newErrors.electronicSignature = 'Electronic signature required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const calculateProgress = () => {
    const totalFields = 28; // Total required fields
    const filledFields = Object.values(formData).filter(v => v !== '' && v !== false && v !== null).length;
    return Math.min((filledFields / totalFields) * 100, 100);
  };

  if (cardLoading) {
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
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/cards/${cardId}`)}
        sx={{ mb: 3 }}
      >
        Back to Card Details
      </Button>

      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Apply for {card.name}
      </Typography>
      
      <Card sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Selected Card</Typography>
          <Typography variant="body2">{card.name}</Typography>
          <Typography variant="body2">Annual Fee: ${card.annualFee}</Typography>
          {card.rewardsRate > 0 && (
            <Typography variant="body2">Rewards: {card.rewardsRate}%</Typography>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          Application Progress: {calculateProgress().toFixed(0)}%
        </Typography>
        <LinearProgress variant="determinate" value={calculateProgress()} />
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Business Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Business Legal Name"
                  value={formData.businessLegalName}
                  onChange={handleChange('businessLegalName')}
                  error={!!errors.businessLegalName}
                  helperText={errors.businessLegalName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Doing Business As (DBA) Name"
                  value={formData.dbaName}
                  onChange={handleChange('dbaName')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.businessStructure}>
                  <InputLabel>Business Structure</InputLabel>
                  <Select
                    value={formData.businessStructure}
                    onChange={handleChange('businessStructure')}
                    label="Business Structure"
                  >
                    {businessStructures.map((structure) => (
                      <MenuItem key={structure} value={structure}>{structure}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Tax ID / EIN"
                  value={formData.taxId}
                  onChange={handleChange('taxId')}
                  error={!!errors.taxId}
                  helperText={errors.taxId || '9 digits'}
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.industry}>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={formData.industry}
                    onChange={handleChange('industry')}
                    label="Industry"
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Years in Business"
                  value={formData.yearsInBusiness}
                  onChange={handleChange('yearsInBusiness')}
                  error={!!errors.yearsInBusiness}
                  helperText={errors.yearsInBusiness}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Number of Employees"
                  value={formData.numberOfEmployees}
                  onChange={handleChange('numberOfEmployees')}
                  error={!!errors.numberOfEmployees}
                  helperText={errors.numberOfEmployees}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.annualBusinessRevenue}>
                  <InputLabel>Annual Business Revenue</InputLabel>
                  <Select
                    value={formData.annualBusinessRevenue}
                    onChange={handleChange('annualBusinessRevenue')}
                    label="Annual Business Revenue"
                  >
                    {revenueRanges.map((range) => (
                      <MenuItem key={range} value={range}>{range}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Business Street Address"
                  value={formData.businessStreetAddress}
                  onChange={handleChange('businessStreetAddress')}
                  error={!!errors.businessStreetAddress}
                  helperText={errors.businessStreetAddress}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  value={formData.businessCity}
                  onChange={handleChange('businessCity')}
                  error={!!errors.businessCity}
                  helperText={errors.businessCity}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  value={formData.businessState}
                  onChange={handleChange('businessState')}
                  error={!!errors.businessState}
                  helperText={errors.businessState}
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  fullWidth
                  label="ZIP Code"
                  value={formData.businessZip}
                  onChange={handleChange('businessZip')}
                  error={!!errors.businessZip}
                  helperText={errors.businessZip}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Business Phone"
                  value={formData.businessPhone}
                  onChange={handleChange('businessPhone')}
                  error={!!errors.businessPhone}
                  helperText={errors.businessPhone}
                  placeholder="(555) 123-4567"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Website"
                  value={formData.businessWebsite}
                  onChange={handleChange('businessWebsite')}
                  placeholder="https://www.example.com"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Owner Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  value={formData.ownerFirstName}
                  onChange={handleChange('ownerFirstName')}
                  error={!!errors.ownerFirstName}
                  helperText={errors.ownerFirstName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  value={formData.ownerLastName}
                  onChange={handleChange('ownerLastName')}
                  error={!!errors.ownerLastName}
                  helperText={errors.ownerLastName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={formData.ownerDateOfBirth}
                  onChange={handleChange('ownerDateOfBirth')}
                  error={!!errors.ownerDateOfBirth}
                  helperText={errors.ownerDateOfBirth || 'Must be 18 or older'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Social Security Number"
                  value={formData.ownerSsn}
                  onChange={handleChange('ownerSsn')}
                  error={!!errors.ownerSsn}
                  helperText={errors.ownerSsn || 'Encrypted & secure'}
                  type="password"
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={formData.ownerEmail}
                  onChange={handleChange('ownerEmail')}
                  error={!!errors.ownerEmail}
                  helperText={errors.ownerEmail}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Home Street Address"
                  value={formData.ownerStreetAddress}
                  onChange={handleChange('ownerStreetAddress')}
                  error={!!errors.ownerStreetAddress}
                  helperText={errors.ownerStreetAddress}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  value={formData.ownerCity}
                  onChange={handleChange('ownerCity')}
                  error={!!errors.ownerCity}
                  helperText={errors.ownerCity}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  value={formData.ownerState}
                  onChange={handleChange('ownerState')}
                  error={!!errors.ownerState}
                  helperText={errors.ownerState}
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  fullWidth
                  label="ZIP Code"
                  value={formData.ownerZip}
                  onChange={handleChange('ownerZip')}
                  error={!!errors.ownerZip}
                  helperText={errors.ownerZip}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Mobile Phone"
                  value={formData.ownerMobilePhone}
                  onChange={handleChange('ownerMobilePhone')}
                  error={!!errors.ownerMobilePhone}
                  helperText={errors.ownerMobilePhone}
                  placeholder="(555) 123-4567"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Ownership Percentage"
                  value={formData.ownershipPercentage}
                  onChange={handleChange('ownershipPercentage')}
                  error={!!errors.ownershipPercentage}
                  helperText={errors.ownershipPercentage}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Title/Position"
                  value={formData.ownerTitle}
                  onChange={handleChange('ownerTitle')}
                  error={!!errors.ownerTitle}
                  helperText={errors.ownerTitle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Annual Personal Income"
                  value={formData.ownerAnnualIncome}
                  onChange={handleChange('ownerAnnualIncome')}
                  error={!!errors.ownerAnnualIncome}
                  helperText={errors.ownerAnnualIncome}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Card Preferences</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.requestedCreditLimit}>
                  <InputLabel>Requested Credit Limit</InputLabel>
                  <Select
                    value={formData.requestedCreditLimit}
                    onChange={handleChange('requestedCreditLimit')}
                    label="Requested Credit Limit"
                  >
                    {creditLimits.map((limit) => (
                      <MenuItem key={limit} value={limit}>{limit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Employee Cards"
                  value={formData.numberOfEmployeeCards}
                  onChange={handleChange('numberOfEmployeeCards')}
                  helperText="Optional (0-50)"
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Review & Submit</Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review your application details before submitting.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>Business Information</Typography>
              <Typography variant="body2">Legal Name: {formData.businessLegalName}</Typography>
              <Typography variant="body2">Structure: {formData.businessStructure}</Typography>
              <Typography variant="body2">Industry: {formData.industry}</Typography>
              <Typography variant="body2">Revenue: {formData.annualBusinessRevenue}</Typography>
              <Button size="small" onClick={() => setActiveStep(0)}>Edit</Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>Owner Information</Typography>
              <Typography variant="body2">Name: {formData.ownerFirstName} {formData.ownerLastName}</Typography>
              <Typography variant="body2">Email: {formData.ownerEmail}</Typography>
              <Typography variant="body2">Title: {formData.ownerTitle}</Typography>
              <Button size="small" onClick={() => setActiveStep(1)}>Edit</Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>Card Preferences</Typography>
              <Typography variant="body2">Credit Limit: {formData.requestedCreditLimit}</Typography>
              <Typography variant="body2">Employee Cards: {formData.numberOfEmployeeCards}</Typography>
              <Button size="small" onClick={() => setActiveStep(2)}>Edit</Button>
            </Box>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Terms and Conditions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  By submitting this application, you agree to the following terms...
                  [Full terms would be displayed here]
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Privacy Policy</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Three Rivers Bank respects your privacy...
                  [Full privacy policy would be displayed here]
                </Typography>
              </AccordionDetails>
            </Accordion>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreedToTerms}
                  onChange={handleChange('agreedToTerms')}
                  required
                />
              }
              label="I agree to the terms and conditions *"
            />
            {errors.agreedToTerms && (
              <Typography variant="caption" color="error" display="block">{errors.agreedToTerms}</Typography>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.consentToCreditCheck}
                  onChange={handleChange('consentToCreditCheck')}
                  required
                />
              }
              label="I consent to a credit check *"
            />
            {errors.consentToCreditCheck && (
              <Typography variant="caption" color="error" display="block">{errors.consentToCreditCheck}</Typography>
            )}

            <TextField
              required
              fullWidth
              label="Electronic Signature"
              value={formData.electronicSignature}
              onChange={handleChange('electronicSignature')}
              error={!!errors.electronicSignature}
              helperText={errors.electronicSignature || 'Type your full name to sign'}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={() => {
                if (validateStep(activeStep)) {
                  navigate(`/apply/${cardId}/review`, { state: { formData, card } });
                }
              }}
            >
              Review Application
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ApplicationFormPage;
