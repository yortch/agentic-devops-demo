import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { creditCardService, applicationService } from '../services/api';

const STORAGE_KEY = 'trb_application_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

const STEPS = [
  'Business Information',
  'Personal Information',
  'Card Preferences',
  'Terms & Conditions',
  'Review',
];

const BUSINESS_STRUCTURES = [
  'Sole Proprietorship',
  'LLC',
  'Corporation',
  'Partnership',
  'Non-Profit',
];

const INDUSTRIES = [
  'Agriculture',
  'Construction',
  'Education',
  'Finance & Insurance',
  'Food & Beverage',
  'Healthcare',
  'Information Technology',
  'Legal Services',
  'Manufacturing',
  'Media & Entertainment',
  'Professional Services',
  'Real Estate',
  'Retail',
  'Transportation',
  'Other',
];

const REVENUE_RANGES = [
  'Under $100K',
  '$100K - $500K',
  '$500K - $1M',
  '$1M - $5M',
  '$5M - $10M',
  'Over $10M',
];

const CREDIT_LIMIT_OPTIONS = ['$5,000', '$10,000', '$25,000', '$50,000', '$100,000+'];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

// Step validation schemas
const businessSchema = yup.object({
  businessLegalName: yup.string().required('Business legal name is required'),
  dbaName: yup.string(),
  businessStructure: yup.string().required('Business structure is required'),
  taxId: yup
    .string()
    .required('Tax ID / EIN is required')
    .matches(/^\d{9}$/, 'Tax ID must be exactly 9 digits'),
  industry: yup.string().required('Industry is required'),
  yearsInBusiness: yup
    .number()
    .typeError('Years in business must be a number')
    .required('Years in business is required')
    .min(0, 'Must be non-negative'),
  numberOfEmployees: yup
    .number()
    .typeError('Number of employees must be a number')
    .required('Number of employees is required')
    .min(1, 'Must be at least 1'),
  annualRevenue: yup.string().required('Annual revenue is required'),
  businessStreet: yup.string().required('Street address is required'),
  businessCity: yup.string().required('City is required'),
  businessState: yup.string().required('State is required'),
  businessZip: yup
    .string()
    .required('ZIP code is required')
    .matches(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  businessPhone: yup
    .string()
    .required('Business phone is required')
    .matches(/^[\d\-\+\(\)\s]{7,20}$/, 'Enter a valid phone number'),
  businessWebsite: yup.string().nullable().transform(v => v === '' ? null : v).url('Enter a valid URL (include http:// or https://)'),
});

const personalSchema = yup.object({
  ownerFirstName: yup.string().required('First name is required'),
  ownerLastName: yup.string().required('Last name is required'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required')
    .test('age', 'You must be at least 18 years old', (value) => {
      if (!value) return false;
      const dob = new Date(value);
      const today = new Date();
      const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      const age = today.getFullYear() - dob.getFullYear()
        - (today < birthdayThisYear ? 1 : 0);
      return age >= 18;
    }),
  ssn: yup
    .string()
    .required('SSN is required')
    .matches(/^\d{9}$/, 'SSN must be exactly 9 digits'),
  ownerEmail: yup.string().required('Email is required').email('Enter a valid email address'),
  ownerStreet: yup.string().required('Street address is required'),
  ownerCity: yup.string().required('City is required'),
  ownerState: yup.string().required('State is required'),
  ownerZip: yup
    .string()
    .required('ZIP code is required')
    .matches(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  ownerPhone: yup
    .string()
    .required('Mobile phone is required')
    .matches(/^[\d\-\+\(\)\s]{7,20}$/, 'Enter a valid phone number'),
  ownershipPercentage: yup
    .number()
    .typeError('Must be a number')
    .required('Ownership percentage is required')
    .min(1, 'Must be at least 1%')
    .max(100, 'Must not exceed 100%'),
  ownerTitle: yup.string().required('Title/Position is required'),
  annualPersonalIncome: yup
    .number()
    .typeError('Must be a number')
    .required('Annual personal income is required')
    .min(0, 'Must be non-negative'),
});

const preferencesSchema = yup.object({
  requestedCreditLimit: yup.string().required('Requested credit limit is required'),
  numberOfEmployeeCards: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .min(0, 'Must be non-negative')
    .max(50, 'Must not exceed 50')
    .transform(v => (v === '' || isNaN(v) ? null : v)),
});

const termsSchema = yup.object({
  agreedToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms and conditions'),
  consentToCreditCheck: yup
    .boolean()
    .oneOf([true], 'You must consent to a credit check'),
  electronicSignature: yup
    .string()
    .required('Electronic signature is required'),
});

const stepSchemas = [businessSchema, personalSchema, preferencesSchema, termsSchema];

const ApplicationFormPage = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const autoSaveRef = useRef(null);

  const { data: card, isLoading: cardLoading } = useQuery({
    queryKey: ['creditCard', cardId],
    queryFn: () => creditCardService.getCardById(cardId),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => applicationService.submitApplication({ ...data, creditCardId: Number(cardId) }),
    onSuccess: (data) => {
      localStorage.removeItem(STORAGE_KEY + '_' + cardId);
      navigate(`/apply/${cardId}/confirmation`, { state: { confirmation: data } });
    },
  });

  // Load saved draft from localStorage
  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_' + cardId);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const savedDraft = getSavedDraft();

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(
      yup.object({
        ...businessSchema.fields,
        ...personalSchema.fields,
        ...preferencesSchema.fields,
        ...termsSchema.fields,
      })
    ),
    defaultValues: {
      businessLegalName: savedDraft.businessLegalName || '',
      dbaName: savedDraft.dbaName || '',
      businessStructure: savedDraft.businessStructure || '',
      taxId: '',
      industry: savedDraft.industry || '',
      yearsInBusiness: savedDraft.yearsInBusiness || '',
      numberOfEmployees: savedDraft.numberOfEmployees || '',
      annualRevenue: savedDraft.annualRevenue || '',
      businessStreet: savedDraft.businessStreet || '',
      businessCity: savedDraft.businessCity || '',
      businessState: savedDraft.businessState || '',
      businessZip: savedDraft.businessZip || '',
      businessPhone: savedDraft.businessPhone || '',
      businessWebsite: savedDraft.businessWebsite || '',
      ownerFirstName: savedDraft.ownerFirstName || '',
      ownerLastName: savedDraft.ownerLastName || '',
      dateOfBirth: '',
      ssn: '',
      ownerEmail: savedDraft.ownerEmail || '',
      ownerStreet: savedDraft.ownerStreet || '',
      ownerCity: savedDraft.ownerCity || '',
      ownerState: savedDraft.ownerState || '',
      ownerZip: savedDraft.ownerZip || '',
      ownerPhone: savedDraft.ownerPhone || '',
      ownershipPercentage: savedDraft.ownershipPercentage || '',
      ownerTitle: savedDraft.ownerTitle || '',
      annualPersonalIncome: savedDraft.annualPersonalIncome || '',
      requestedCreditLimit: savedDraft.requestedCreditLimit || '',
      numberOfEmployeeCards: savedDraft.numberOfEmployeeCards || '',
      agreedToTerms: savedDraft.agreedToTerms || false,
      consentToCreditCheck: savedDraft.consentToCreditCheck || false,
      electronicSignature: savedDraft.electronicSignature || '',
    },
    mode: 'onChange',
  });

  // Auto-save to localStorage every 30 seconds (exclude sensitive fields)
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      const values = getValues();
      // Exclude sensitive PII from localStorage
      const { ssn, taxId, dateOfBirth, ...safeToPersist } = values;
      localStorage.setItem(STORAGE_KEY + '_' + cardId, JSON.stringify(safeToPersist));
    }, AUTO_SAVE_INTERVAL);
    return () => clearInterval(autoSaveRef.current);
  }, [cardId, getValues]);

  const stepFields = [
    ['businessLegalName','dbaName','businessStructure','taxId','industry','yearsInBusiness','numberOfEmployees','annualRevenue','businessStreet','businessCity','businessState','businessZip','businessPhone','businessWebsite'],
    ['ownerFirstName','ownerLastName','dateOfBirth','ssn','ownerEmail','ownerStreet','ownerCity','ownerState','ownerZip','ownerPhone','ownershipPercentage','ownerTitle','annualPersonalIncome'],
    ['requestedCreditLimit','numberOfEmployeeCards'],
    ['agreedToTerms','consentToCreditCheck','electronicSignature'],
  ];

  const handleNext = async () => {
    if (activeStep < STEPS.length - 1) {
      if (activeStep < 4) {
        const fields = stepFields[activeStep];
        const valid = await trigger(fields);
        if (!valid) return;
        setCompletedSteps(prev => new Set([...prev, activeStep]));
      }
      setActiveStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmitForm = handleSubmit((data) => {
    submitMutation.mutate(data);
  });

  const progress = Math.round((completedSteps.size / (STEPS.length - 1)) * 100);

  const renderTextField = (name, label, type = 'text', required = true, multiline = false, inputProps = {}) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={required ? `${label} *` : label}
          type={type}
          fullWidth
          multiline={multiline}
          rows={multiline ? 3 : undefined}
          error={!!errors[name]}
          helperText={errors[name]?.message}
          InputLabelProps={type === 'date' ? { shrink: true } : undefined}
          inputProps={inputProps}
          sx={{ mb: 2 }}
        />
      )}
    />
  );

  const renderSelect = (name, label, options, required = true) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={!!errors[name]} sx={{ mb: 2 }}>
          <InputLabel>{required ? `${label} *` : label}</InputLabel>
          <Select {...field} label={required ? `${label} *` : label}>
            {options.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          {errors[name] && <FormHelperText>{errors[name]?.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );

  const renderStateSelect = (name, label) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={!!errors[name]} sx={{ mb: 2 }}>
          <InputLabel>{`${label} *`}</InputLabel>
          <Select {...field} label={`${label} *`}>
            {US_STATES.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
          {errors[name] && <FormHelperText>{errors[name]?.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );

  // Step renderers
  const renderBusinessStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Business Information</Typography>
      {renderTextField('businessLegalName', 'Business Legal Name')}
      {renderTextField('dbaName', 'Doing Business As (DBA) Name', 'text', false)}
      {renderSelect('businessStructure', 'Business Structure', BUSINESS_STRUCTURES)}
      {renderTextField('taxId', 'Tax ID / EIN (9 digits, no dashes)', 'text', true, false, { maxLength: 9, inputMode: 'numeric' })}
      {renderSelect('industry', 'Industry / Business Type', INDUSTRIES)}
      {renderTextField('yearsInBusiness', 'Years in Business', 'number')}
      {renderTextField('numberOfEmployees', 'Number of Employees', 'number')}
      {renderSelect('annualRevenue', 'Annual Business Revenue', REVENUE_RANGES)}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Business Address</Typography>
      {renderTextField('businessStreet', 'Street Address')}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 5 }}>
          {renderTextField('businessCity', 'City')}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {renderStateSelect('businessState', 'State')}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderTextField('businessZip', 'ZIP Code')}
        </Grid>
      </Grid>
      {renderTextField('businessPhone', 'Business Phone')}
      {renderTextField('businessWebsite', 'Business Website (optional)', 'text', false)}
    </Box>
  );

  const renderPersonalStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Personal Information (Business Owner)</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {renderTextField('ownerFirstName', 'First Name')}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {renderTextField('ownerLastName', 'Last Name')}
        </Grid>
      </Grid>
      {renderTextField('dateOfBirth', 'Date of Birth', 'date')}
      {renderTextField('ssn', 'SSN (9 digits, no dashes)', 'text', true, false, { maxLength: 9, inputMode: 'numeric', autoComplete: 'off' })}
      {renderTextField('ownerEmail', 'Email Address', 'email')}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Home Address</Typography>
      {renderTextField('ownerStreet', 'Street Address')}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 5 }}>
          {renderTextField('ownerCity', 'City')}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {renderStateSelect('ownerState', 'State')}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderTextField('ownerZip', 'ZIP Code')}
        </Grid>
      </Grid>
      {renderTextField('ownerPhone', 'Mobile Phone')}
      {renderTextField('ownershipPercentage', 'Ownership Percentage', 'number', true, false, { min: 1, max: 100 })}
      {renderTextField('ownerTitle', 'Title / Position')}
      <Controller
        name="annualPersonalIncome"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Annual Personal Income *"
            type="number"
            fullWidth
            error={!!errors.annualPersonalIncome}
            helperText={errors.annualPersonalIncome?.message}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
        )}
      />
    </Box>
  );

  const renderPreferencesStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Card Preferences</Typography>
      {renderSelect('requestedCreditLimit', 'Requested Credit Limit', CREDIT_LIMIT_OPTIONS)}
      {renderTextField('numberOfEmployeeCards', 'Number of Employee Cards Needed (0-50)', 'number', false)}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Authorized User Information (Optional)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            You can add authorized users after your application is approved. Our team will contact you with instructions.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderTermsStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Terms & Conditions</Typography>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Credit Card Terms & Conditions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            By submitting this application, you agree to Three Rivers Bank's credit card agreement,
            including the applicable Annual Percentage Rate (APR), fees, and credit terms disclosed
            herein. Your account will be subject to applicable state and federal laws. Three Rivers
            Bank reserves the right to change rates, fees, and terms in accordance with applicable law.
            All transactions are subject to the terms of the Cardholder Agreement. Please review your
            full Cardholder Agreement for complete terms.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Privacy Policy</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            Three Rivers Bank is committed to protecting your privacy. We collect personal information
            to process your application and service your account. We do not sell your personal information
            to third parties. You have rights under CCPA/GDPR to access, correct, and delete your data.
            For our full Privacy Policy, visit <strong>threeriversbank.com/privacy</strong>.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Box sx={{ mt: 3 }}>
        <Controller
          name="agreedToTerms"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.agreedToTerms} sx={{ display: 'block', mb: 1 }}>
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} color="primary" />}
                label="I agree to the Terms and Conditions *"
              />
              {errors.agreedToTerms && (
                <FormHelperText sx={{ color: 'error.main', ml: 4 }}>{errors.agreedToTerms.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        <Controller
          name="consentToCreditCheck"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.consentToCreditCheck} sx={{ display: 'block', mb: 2 }}>
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} color="primary" />}
                label="I consent to a credit check *"
              />
              {errors.consentToCreditCheck && (
                <FormHelperText sx={{ color: 'error.main', ml: 4 }}>{errors.consentToCreditCheck.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        {renderTextField('electronicSignature', 'Electronic Signature (type your full name to confirm)')}
      </Box>
    </Box>
  );

  const formValues = watch();

  const renderReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Review Your Application</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Please review all information carefully before submitting. Click "Edit" on any section to make changes.
      </Alert>

      {/* Business Info Review */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>Business Information</Typography>
            <Button size="small" onClick={() => setActiveStep(0)}>Edit</Button>
          </Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Legal Name</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.businessLegalName}</Typography></Grid>
            {formValues.dbaName && (<><Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">DBA</Typography></Grid><Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.dbaName}</Typography></Grid></>)}
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Structure</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.businessStructure}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Tax ID</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">***{formValues.taxId?.slice(-4)}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Industry</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.industry}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Annual Revenue</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.annualRevenue}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Address</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.businessStreet}, {formValues.businessCity}, {formValues.businessState} {formValues.businessZip}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Personal Info Review */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>Personal Information</Typography>
            <Button size="small" onClick={() => setActiveStep(1)}>Edit</Button>
          </Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Name</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.ownerFirstName} {formValues.ownerLastName}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Email</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.ownerEmail}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">SSN</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">***-**-{formValues.ssn?.slice(-4)}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Title</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.ownerTitle}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Ownership</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.ownershipPercentage}%</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Address</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.ownerStreet}, {formValues.ownerCity}, {formValues.ownerState} {formValues.ownerZip}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Preferences Review */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>Card Preferences</Typography>
            <Button size="small" onClick={() => setActiveStep(2)}>Edit</Button>
          </Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Credit Limit</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.requestedCreditLimit}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Employee Cards</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2">{formValues.numberOfEmployeeCards || 0}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      {submitMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitMutation.error?.response?.data?.error || 'An error occurred. Please try again.'}
        </Alert>
      )}
    </Box>
  );

  const stepContent = [
    renderBusinessStep(),
    renderPersonalStep(),
    renderPreferencesStep(),
    renderTermsStep(),
    renderReviewStep(),
  ];

  if (cardLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
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

      {/* Card Summary */}
      {card && (
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #003366 0%, #008080 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700}>{card.name}</Typography>
            <Chip
              label={card.cardType}
              size="small"
              sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }}
            />
            <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Annual Fee</Typography>
                <Typography variant="body1" fontWeight={600}>${card.annualFee}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Regular APR</Typography>
                <Typography variant="body1" fontWeight={600}>{card.regularApr}</Typography>
              </Box>
              {card.rewardsRate > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Rewards Rate</Typography>
                  <Typography variant="body1" fontWeight={600}>{card.rewardsRate}%</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Application Progress</Typography>
          <Typography variant="body2" fontWeight={600}>{progress}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label, index) => (
          <Step key={label} completed={completedSteps.has(index)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Form Content */}
      <Box component="form" noValidate>
        {stepContent[activeStep]}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          {activeStep < STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmitForm}
              disabled={submitMutation.isPending}
              startIcon={submitMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          * Required field. Your progress is auto-saved every 30 seconds.
        </Typography>
      </Box>
    </Container>
  );
};

export default ApplicationFormPage;
