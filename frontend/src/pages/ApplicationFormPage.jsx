import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  FormHelperText,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { cardService } from '../services/api';
import { useApplicationForm } from '../hooks/useApplicationForm';

const steps = ['Business Information', 'Personal Information', 'Card Preferences', 'Terms & Review'];

const businessStructures = [
  'Sole Proprietorship',
  'LLC',
  'Corporation',
  'Partnership',
  'Non-Profit',
];

const industryTypes = [
  'Retail',
  'Restaurant/Food Service',
  'Professional Services',
  'Healthcare',
  'Technology',
  'Construction',
  'Real Estate',
  'Manufacturing',
  'Transportation',
  'Other',
];

const revenueRanges = [
  'Under $100,000',
  '$100,000 - $250,000',
  '$250,000 - $500,000',
  '$500,000 - $1,000,000',
  '$1,000,000 - $5,000,000',
  'Over $5,000,000',
];

const creditLimits = [
  '$5,000',
  '$10,000',
  '$25,000',
  '$50,000',
  '$100,000+',
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const ApplicationFormPage = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  // Load saved form data from localStorage
  const getSavedFormData = () => {
    const saved = localStorage.getItem(`application_draft_${cardId}`);
    return saved ? JSON.parse(saved) : {};
  };

  const { control, handleSubmit, watch, formState: { errors }, trigger, getValues } = useApplicationForm(getSavedFormData());

  const formValues = watch();

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentValues = getValues();
      localStorage.setItem(`application_draft_${cardId}`, JSON.stringify(currentValues));
      setSaveMessage('Draft saved');
      setTimeout(() => setSaveMessage(''), 2000);
    }, 30000);

    return () => clearInterval(interval);
  }, [cardId, getValues]);

  const { data: card, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardService.getCardById(cardId),
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!card) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">Card not found</Alert>
      </Container>
    );
  }

  const calculateProgress = () => {
    const fields = Object.keys(formValues);
    const filled = fields.filter(key => {
      const value = formValues[key];
      return value !== '' && value !== null && value !== undefined;
    });
    return Math.round((filled.length / fields.length) * 100);
  };

  const handleNext = async () => {
    const fieldsToValidate = getStepFields(activeStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      if (activeStep === steps.length - 1) {
        // Navigate to review page
        localStorage.setItem(`application_draft_${cardId}`, JSON.stringify(getValues()));
        navigate('/application/review', { state: { formData: getValues(), card } });
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0: // Business Information
        return [
          'businessLegalName', 'businessStructure', 'taxId', 'industryType',
          'yearsInBusiness', 'numberOfEmployees', 'annualBusinessRevenue',
          'businessStreet', 'businessCity', 'businessState', 'businessZip', 'businessPhone'
        ];
      case 1: // Personal Information
        return [
          'firstName', 'lastName', 'dateOfBirth', 'ssn', 'email',
          'homeStreet', 'homeCity', 'homeState', 'homeZip', 'mobilePhone',
          'ownershipPercentage', 'title', 'annualPersonalIncome'
        ];
      case 2: // Card Preferences
        return ['requestedCreditLimit'];
      case 3: // Terms
        return ['agreedToTerms', 'consentToCreditCheck', 'electronicSignature'];
      default:
        return [];
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBusinessInfo();
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderCardPreferences();
      case 3:
        return renderTermsAndConditions();
      default:
        return null;
    }
  };

  const renderBusinessInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Business Information
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="businessLegalName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Business Legal Name *"
              fullWidth
              error={!!errors.businessLegalName}
              helperText={errors.businessLegalName?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="dbaName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Doing Business As (DBA) Name"
              fullWidth
              error={!!errors.dbaName}
              helperText={errors.dbaName?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="businessStructure"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.businessStructure}>
              <InputLabel>Business Structure *</InputLabel>
              <Select {...field} label="Business Structure *">
                {businessStructures.map((structure) => (
                  <MenuItem key={structure} value={structure}>
                    {structure}
                  </MenuItem>
                ))}
              </Select>
              {errors.businessStructure && (
                <FormHelperText>{errors.businessStructure.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="taxId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Tax ID / EIN *"
              fullWidth
              placeholder="123456789"
              error={!!errors.taxId}
              helperText={errors.taxId?.message || '9 digits, no dashes'}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="industryType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.industryType}>
              <InputLabel>Industry Type *</InputLabel>
              <Select {...field} label="Industry Type *">
                {industryTypes.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
              {errors.industryType && (
                <FormHelperText>{errors.industryType.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="yearsInBusiness"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Years in Business *"
              type="number"
              fullWidth
              error={!!errors.yearsInBusiness}
              helperText={errors.yearsInBusiness?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="numberOfEmployees"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Number of Employees *"
              type="number"
              fullWidth
              error={!!errors.numberOfEmployees}
              helperText={errors.numberOfEmployees?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="annualBusinessRevenue"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.annualBusinessRevenue}>
              <InputLabel>Annual Business Revenue *</InputLabel>
              <Select {...field} label="Annual Business Revenue *">
                {revenueRanges.map((range) => (
                  <MenuItem key={range} value={range}>
                    {range}
                  </MenuItem>
                ))}
              </Select>
              {errors.annualBusinessRevenue && (
                <FormHelperText>{errors.annualBusinessRevenue.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="businessStreet"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Business Street Address *"
              fullWidth
              error={!!errors.businessStreet}
              helperText={errors.businessStreet?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="businessCity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="City *"
              fullWidth
              error={!!errors.businessCity}
              helperText={errors.businessCity?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="businessState"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.businessState}>
              <InputLabel>State *</InputLabel>
              <Select {...field} label="State *">
                {US_STATES.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
              {errors.businessState && (
                <FormHelperText>{errors.businessState.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="businessZip"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ZIP Code *"
              fullWidth
              placeholder="12345"
              error={!!errors.businessZip}
              helperText={errors.businessZip?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="businessPhone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Business Phone *"
              fullWidth
              placeholder="1234567890"
              error={!!errors.businessPhone}
              helperText={errors.businessPhone?.message || '10 digits, no dashes'}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="businessWebsite"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Business Website"
              fullWidth
              placeholder="https://example.com"
              error={!!errors.businessWebsite}
              helperText={errors.businessWebsite?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderPersonalInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Personal Information (Business Owner)
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="First Name *"
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Last Name *"
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Date of Birth *"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth?.message || 'Must be 18 or older'}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="ssn"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="SSN *"
              type="password"
              fullWidth
              placeholder="123456789"
              error={!!errors.ssn}
              helperText={errors.ssn?.message || '9 digits, no dashes. Will be encrypted'}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address *"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="homeStreet"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Home Street Address *"
              fullWidth
              error={!!errors.homeStreet}
              helperText={errors.homeStreet?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="homeCity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="City *"
              fullWidth
              error={!!errors.homeCity}
              helperText={errors.homeCity?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="homeState"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.homeState}>
              <InputLabel>State *</InputLabel>
              <Select {...field} label="State *">
                {US_STATES.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
              {errors.homeState && (
                <FormHelperText>{errors.homeState.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="homeZip"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ZIP Code *"
              fullWidth
              placeholder="12345"
              error={!!errors.homeZip}
              helperText={errors.homeZip?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="mobilePhone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mobile Phone *"
              fullWidth
              placeholder="1234567890"
              error={!!errors.mobilePhone}
              helperText={errors.mobilePhone?.message || '10 digits, no dashes'}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="ownershipPercentage"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ownership Percentage *"
              type="number"
              fullWidth
              inputProps={{ min: 0, max: 100 }}
              error={!!errors.ownershipPercentage}
              helperText={errors.ownershipPercentage?.message || 'Enter a value between 0 and 100'}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title/Position *"
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="annualPersonalIncome"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Annual Personal Income *"
              type="number"
              fullWidth
              InputProps={{ startAdornment: '$' }}
              error={!!errors.annualPersonalIncome}
              helperText={errors.annualPersonalIncome?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderCardPreferences = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Card Preferences
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="requestedCreditLimit"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.requestedCreditLimit}>
              <InputLabel>Requested Credit Limit *</InputLabel>
              <Select {...field} label="Requested Credit Limit *">
                {creditLimits.map((limit) => (
                  <MenuItem key={limit} value={limit}>
                    {limit}
                  </MenuItem>
                ))}
              </Select>
              {errors.requestedCreditLimit && (
                <FormHelperText>{errors.requestedCreditLimit.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="employeeCardsNeeded"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Number of Employee Cards Needed"
              type="number"
              fullWidth
              inputProps={{ min: 0, max: 50 }}
              error={!!errors.employeeCardsNeeded}
              helperText={errors.employeeCardsNeeded?.message || 'Optional: 0-50 cards'}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="authorizedUserInfo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Authorized User Information"
              fullWidth
              multiline
              rows={3}
              placeholder="Optional: Enter names and details of authorized users"
              error={!!errors.authorizedUserInfo}
              helperText={errors.authorizedUserInfo?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderTermsAndConditions = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Terms & Conditions
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Credit Terms and Conditions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              By submitting this application, you agree to the following terms:
              <br /><br />
              1. All information provided is true and accurate to the best of your knowledge.
              <br />
              2. Three Rivers Bank may verify the information provided through credit bureaus and other sources.
              <br />
              3. Approval is subject to credit review and verification of information.
              <br />
              4. APRs and credit limits are subject to creditworthiness.
              <br />
              5. You authorize Three Rivers Bank to obtain credit reports for application review.
              <br /><br />
              Please read the full terms and conditions document for complete details.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Privacy Policy</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Three Rivers Bank is committed to protecting your privacy. Your personal information will be:
              <br /><br />
              - Used solely for processing your credit card application
              <br />
              - Protected with industry-standard encryption
              <br />
              - Not sold or shared with third parties except as required for credit evaluation
              <br />
              - Stored securely in compliance with CCPA and GDPR regulations
              <br /><br />
              For more information, please review our complete Privacy Policy.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="agreedToTerms"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label="I agree to the Terms and Conditions *"
            />
          )}
        />
        {errors.agreedToTerms && (
          <FormHelperText error>{errors.agreedToTerms.message}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="consentToCreditCheck"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label="I consent to a credit check *"
            />
          )}
        />
        {errors.consentToCreditCheck && (
          <FormHelperText error>{errors.consentToCreditCheck.message}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="electronicSignature"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Electronic Signature *"
              fullWidth
              placeholder="Type your full name to sign"
              error={!!errors.electronicSignature}
              helperText={errors.electronicSignature?.message || 'Type your full name as your electronic signature'}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Card Info Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          Apply for {card.name}
        </Typography>
        <Typography variant="body2">
          Complete the application below to apply for this card.
        </Typography>
      </Paper>

      {/* Progress Indicator */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Application Progress</Typography>
          <Typography variant="body2">{calculateProgress()}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={calculateProgress()} />
        {saveMessage && (
          <Chip label={saveMessage} size="small" color="success" sx={{ mt: 1 }} />
        )}
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Form Content */}
      <Paper sx={{ p: 4, mb: 3 }}>
        {renderStepContent(activeStep)}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
        >
          {activeStep === steps.length - 1 ? 'Review Application' : 'Next'}
        </Button>
      </Box>
    </Container>
  );
};

export default ApplicationFormPage;
