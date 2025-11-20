import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { applicationService } from '../services/api';

const ApplicationReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, card } = location.state || {};
  const [error, setError] = useState(null);

  const submitMutation = useMutation({
    mutationFn: (data) => {
      // Convert date string to proper format and ensure numeric fields are numbers
      const submissionData = {
        ...data,
        cardId: card.id,
        dateOfBirth: data.dateOfBirth,
        yearsInBusiness: parseInt(data.yearsInBusiness) || 0,
        numberOfEmployees: parseInt(data.numberOfEmployees) || 0,
        ownershipPercentage: parseFloat(data.ownershipPercentage) || 0,
        annualPersonalIncome: parseFloat(data.annualPersonalIncome) || 0,
        employeeCardsNeeded: data.employeeCardsNeeded ? parseInt(data.employeeCardsNeeded) : null,
      };
      return applicationService.submitApplication(submissionData);
    },
    onSuccess: (response) => {
      // Clear draft from localStorage
      localStorage.removeItem(`application_draft_${card.id}`);
      navigate('/application/confirmation', { state: { response, card } });
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    },
  });

  if (!formData || !card) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">No application data found. Please start a new application.</Alert>
        <Button variant="contained" onClick={() => navigate('/cards')} sx={{ mt: 2 }}>
          Browse Cards
        </Button>
      </Container>
    );
  }

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  const handleEdit = () => {
    navigate(`/apply/${card.id}`);
  };

  const maskSensitive = (value, visibleDigits = 4) => {
    if (!value) return '';
    const masked = '*'.repeat(value.length - visibleDigits);
    return masked + value.slice(-visibleDigits);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom align="center">
        Review Your Application
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Please review all information before submitting. You can edit any section by clicking the Edit button.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Card Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Selected Card</Typography>
        </Box>
        <Typography variant="body1"><strong>{card.name}</strong></Typography>
        <Typography variant="body2" color="text.secondary">{card.cardType}</Typography>
      </Paper>

      {/* Business Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Business Information</Typography>
          <Button startIcon={<EditIcon />} onClick={handleEdit} size="small">
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Legal Name</Typography>
            <Typography variant="body1">{formData.businessLegalName}</Typography>
          </Grid>
          {formData.dbaName && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">DBA Name</Typography>
              <Typography variant="body1">{formData.dbaName}</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Business Structure</Typography>
            <Typography variant="body1">{formData.businessStructure}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Tax ID / EIN</Typography>
            <Typography variant="body1">{maskSensitive(formData.taxId)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Industry</Typography>
            <Typography variant="body1">{formData.industryType}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Years in Business</Typography>
            <Typography variant="body1">{formData.yearsInBusiness}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Number of Employees</Typography>
            <Typography variant="body1">{formData.numberOfEmployees}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Annual Revenue</Typography>
            <Typography variant="body1">{formData.annualBusinessRevenue}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Business Address</Typography>
            <Typography variant="body1">
              {formData.businessStreet}<br />
              {formData.businessCity}, {formData.businessState} {formData.businessZip}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Business Phone</Typography>
            <Typography variant="body1">{formData.businessPhone}</Typography>
          </Grid>
          {formData.businessWebsite && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Website</Typography>
              <Typography variant="body1">{formData.businessWebsite}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Personal Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Personal Information</Typography>
          <Button startIcon={<EditIcon />} onClick={handleEdit} size="small">
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Name</Typography>
            <Typography variant="body1">{formData.firstName} {formData.lastName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body1">{formData.dateOfBirth}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">SSN</Typography>
            <Typography variant="body1">{maskSensitive(formData.ssn)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1">{formData.email}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Home Address</Typography>
            <Typography variant="body1">
              {formData.homeStreet}<br />
              {formData.homeCity}, {formData.homeState} {formData.homeZip}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Mobile Phone</Typography>
            <Typography variant="body1">{formData.mobilePhone}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Ownership %</Typography>
            <Typography variant="body1">{formData.ownershipPercentage}%</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Title/Position</Typography>
            <Typography variant="body1">{formData.title}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Annual Personal Income</Typography>
            <Typography variant="body1">${parseFloat(formData.annualPersonalIncome).toLocaleString()}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Card Preferences */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Card Preferences</Typography>
          <Button startIcon={<EditIcon />} onClick={handleEdit} size="small">
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Requested Credit Limit</Typography>
            <Typography variant="body1">{formData.requestedCreditLimit}</Typography>
          </Grid>
          {formData.employeeCardsNeeded && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Employee Cards Needed</Typography>
              <Typography variant="body1">{formData.employeeCardsNeeded}</Typography>
            </Grid>
          )}
          {formData.authorizedUserInfo && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Authorized User Info</Typography>
              <Typography variant="body1">{formData.authorizedUserInfo}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Electronic Signature */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Electronic Signature</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1">{formData.electronicSignature}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          By submitting this application, you confirm that you have read and agree to the Terms and Conditions
          and consent to a credit check.
        </Typography>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={handleEdit}>
          Back to Edit
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          startIcon={submitMutation.isPending && <CircularProgress size={20} />}
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Box>
    </Container>
  );
};

export default ApplicationReviewPage;
