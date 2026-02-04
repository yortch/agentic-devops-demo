import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { applicationService } from '../services/api';

const ApplicationReviewPage = () => {
  const { cardId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const { formData, card } = location.state || {};

  const submitMutation = useMutation({
    mutationFn: (data) => applicationService.submitApplication(data),
    onSuccess: (response) => {
      // Clear draft from localStorage
      localStorage.removeItem(`application_draft_${cardId}`);
      navigate(`/apply/${cardId}/confirmation`, { state: { application: response } });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to submit application. Please try again.';
      setSubmitError(errorMessage);
      window.scrollTo(0, 0);
    },
  });

  const handleSubmit = () => {
    if (!formData || !card) {
      setSubmitError('Application data is missing. Please start over.');
      return;
    }

    // Prepare submission data
    const applicationData = {
      creditCardId: parseInt(cardId),
      ...formData,
      // Clean up phone numbers and SSN/Tax ID (remove formatting)
      businessPhone: formData.businessPhone.replace(/\D/g, ''),
      ownerMobilePhone: formData.ownerMobilePhone.replace(/\D/g, ''),
      taxId: formData.taxId.replace(/\D/g, ''),
      ownerSsn: formData.ownerSsn.replace(/\D/g, ''),
      // Convert numeric fields
      yearsInBusiness: parseInt(formData.yearsInBusiness),
      numberOfEmployees: parseInt(formData.numberOfEmployees),
      ownershipPercentage: parseInt(formData.ownershipPercentage),
      ownerAnnualIncome: parseFloat(formData.ownerAnnualIncome),
      numberOfEmployeeCards: parseInt(formData.numberOfEmployeeCards) || 0,
    };

    submitMutation.mutate(applicationData);
  };

  if (!formData || !card) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Application data not found. Please start over.</Alert>
        <Button onClick={() => navigate(`/apply/${cardId}`)} sx={{ mt: 2 }}>
          Start Application
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/apply/${cardId}`)}
        sx={{ mb: 3 }}
        disabled={submitMutation.isPending}
      >
        Back to Application
      </Button>

      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Review Your Application
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
          {submitError}
        </Alert>
      )}

      <Card sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Selected Card</Typography>
          <Typography variant="body1" fontWeight={600}>{card.name}</Typography>
          <Typography variant="body2">Annual Fee: ${card.annualFee}</Typography>
          {card.rewardsRate > 0 && (
            <Typography variant="body2">Rewards: {card.rewardsRate}%</Typography>
          )}
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary.main" fontWeight={600}>
            Business Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Legal Name</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.businessLegalName}</Typography>
            </Grid>
            {formData.dbaName && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">DBA Name</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.dbaName}</Typography>
              </Grid>
            )}
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Business Structure</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.businessStructure}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Tax ID</Typography>
              <Typography variant="body1" fontWeight={500}>***-**-{formData.taxId.slice(-4)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Industry</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.industry}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Years in Business</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.yearsInBusiness}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Number of Employees</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.numberOfEmployees}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Annual Revenue</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.annualBusinessRevenue}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Business Address</Typography>
              <Typography variant="body1" fontWeight={500}>
                {formData.businessStreetAddress}<br />
                {formData.businessCity}, {formData.businessState} {formData.businessZip}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Business Phone</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.businessPhone}</Typography>
            </Grid>
            {formData.businessWebsite && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Website</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.businessWebsite}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Owner Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary.main" fontWeight={600}>
            Owner Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body1" fontWeight={500}>
                {formData.ownerFirstName} {formData.ownerLastName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.ownerDateOfBirth}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">SSN</Typography>
              <Typography variant="body1" fontWeight={500}>***-**-{formData.ownerSsn.slice(-4)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.ownerEmail}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Home Address</Typography>
              <Typography variant="body1" fontWeight={500}>
                {formData.ownerStreetAddress}<br />
                {formData.ownerCity}, {formData.ownerState} {formData.ownerZip}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Mobile Phone</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.ownerMobilePhone}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Ownership</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.ownershipPercentage}%</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Title</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.ownerTitle}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Annual Income</Typography>
              <Typography variant="body1" fontWeight={500}>
                ${parseFloat(formData.ownerAnnualIncome).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Card Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary.main" fontWeight={600}>
            Card Preferences
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Requested Credit Limit</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.requestedCreditLimit}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Employee Cards</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.numberOfEmployeeCards || 0}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Terms Acknowledgment */}
      <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Acknowledgments</Typography>
          <Typography variant="body2" gutterBottom>
            ✓ Agreed to terms and conditions
          </Typography>
          <Typography variant="body2" gutterBottom>
            ✓ Consented to credit check
          </Typography>
          <Typography variant="body2">
            ✓ Electronic signature: <strong>{formData.electronicSignature}</strong>
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/apply/${cardId}`)}
          disabled={submitMutation.isPending}
        >
          Edit Application
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          startIcon={submitMutation.isPending ? <CircularProgress size={20} /> : null}
          data-testid="submit-application-button"
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2, textAlign: 'center' }}>
        By submitting, you authorize Three Rivers Bank to review your credit and business information.
      </Typography>
    </Container>
  );
};

export default ApplicationReviewPage;
