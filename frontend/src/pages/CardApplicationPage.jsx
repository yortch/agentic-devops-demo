import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import ApplicationStepper from '../components/applications/ApplicationStepper';
import PersonalInfoStep from '../components/applications/steps/PersonalInfoStep';
import BusinessInfoStep from '../components/applications/steps/BusinessInfoStep';
import IncomeEmploymentStep from '../components/applications/steps/IncomeEmploymentStep';
import ReviewSubmitStep from '../components/applications/steps/ReviewSubmitStep';
import applicationSchema from '../validation/applicationSchema';
import { applicationService, creditCardService } from '../services/api';

const STEP_LABELS = [
  'Personal Info',
  'Business Info',
  'Income & Employment',
  'Review & Submit',
];

const STEP_FIELDS = [
  ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'homeAddress.street', 'homeAddress.city', 'homeAddress.state', 'homeAddress.zipCode'],
  ['businessLegalName', 'businessType', 'yearsInBusiness', 'taxIdLast4', 'businessAddress.street', 'businessAddress.city', 'businessAddress.state', 'businessAddress.zipCode'],
  ['annualPersonalIncome', 'annualBusinessRevenue', 'employmentStatus', 'employerName', 'jobTitle', 'yearsEmployed'],
];

const DEFAULT_FORM_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  homeAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
  },
  businessLegalName: '',
  businessType: '',
  yearsInBusiness: '',
  taxIdLast4: '',
  businessAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
  },
  annualPersonalIncome: '',
  annualBusinessRevenue: '',
  employmentStatus: '',
  employerName: '',
  jobTitle: '',
  yearsEmployed: '',
};

const CardApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const methods = useForm({
    resolver: zodResolver(applicationSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    trigger,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  const { data: selectedCard, isLoading: isCardLoading, error: cardError } = useQuery({
    queryKey: ['creditCard', id],
    queryFn: () => creditCardService.getCardById(id),
    enabled: Boolean(id),
  });

  const submitApplicationMutation = useMutation({
    mutationFn: (applicationData) => applicationService.submitApplication(applicationData),
    onSuccess: (response) => {
      navigate(`/applications/${response.trackingId}/submitted`);
    },
    onError: (error) => {
      const serverFieldErrors = error?.data?.fieldErrors;
      if (Array.isArray(serverFieldErrors)) {
        serverFieldErrors.forEach((fieldError) => {
          if (fieldError?.field && fieldError?.message) {
            setError(fieldError.field, {
              type: 'server',
              message: fieldError.message,
            });
          }
        });
      }

      setError('root.serverError', {
        type: 'server',
        message: error?.data?.error
          || error?.data?.message
          || error?.message
          || 'Failed to submit application. Please try again.',
      });
    },
  });

  const cardName = selectedCard?.name || 'Business Credit Card';

  const handleNext = async () => {
    clearErrors('root.serverError');

    if (activeStep >= STEP_FIELDS.length) {
      return;
    }

    const isCurrentStepValid = await trigger(STEP_FIELDS[activeStep], { shouldFocus: true });
    if (isCurrentStepValid) {
      setActiveStep((previousStep) => previousStep + 1);
    }
  };

  const handleBack = () => {
    clearErrors('root.serverError');
    setActiveStep((previousStep) => Math.max(previousStep - 1, 0));
  };

  const handleEditStep = (stepIndex) => {
    clearErrors('root.serverError');
    setActiveStep(stepIndex);
  };

  const onSubmitApplication = (formData) => {
    clearErrors('root.serverError');

    const payload = {
      ...formData,
      creditCardId: Number(id),
      dateOfBirth: formData.dateOfBirth instanceof Date
        ? formData.dateOfBirth.toISOString().split('T')[0]
        : formData.dateOfBirth,
    };

    submitApplicationMutation.mutate(payload);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <PersonalInfoStep />;
      case 1:
        return <BusinessInfoStep />;
      case 2:
        return <IncomeEmploymentStep />;
      case 3:
        return (
          <ReviewSubmitStep
            formData={methods.getValues()}
            selectedCardName={cardName}
            onEditStep={handleEditStep}
            handleSubmit={handleSubmit(onSubmitApplication)}
            isSubmitting={submitApplicationMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  if (isCardLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (cardError || !selectedCard) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          Unable to load selected card details. Please return to card comparison and try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Credit Card Application
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Applying for: {selectedCard.name}
      </Typography>

      <Paper elevation={2} sx={{ p: 4 }}>
        <FormProvider {...methods}>
          <Box>
            {errors.root?.serverError?.message && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.root.serverError.message}
              </Alert>
            )}

            <ApplicationStepper
              activeStep={activeStep}
              steps={STEP_LABELS}
              handleNext={handleNext}
              handleBack={handleBack}
              isSubmitting={submitApplicationMutation.isPending}
            >
              {renderStepContent()}
            </ApplicationStepper>
          </Box>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default CardApplicationPage;