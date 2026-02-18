import React from 'react';
import { Box, Typography, Paper, Grid, Button, Divider, ListItemText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';

const ReviewSection = ({ title, items, stepIndex, onEdit }) => (
  <Paper elevation={1} sx={{ p: 3, mb: 3, position: 'relative' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" color="primary.main">
        {title}
      </Typography>
      <Button 
        startIcon={<EditIcon />} 
        onClick={() => onEdit(stepIndex)}
        size="small"
        color="secondary"
      >
        Edit
      </Button>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <Grid container spacing={2}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <ListItemText 
            primary={item.label}
            secondary={item.value || '-'}
            primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
          />
        </Grid>
      ))}
    </Grid>
  </Paper>
);

ReviewSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })).isRequired,
  stepIndex: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired
};

const ReviewSubmitStep = ({ formData, selectedCardName, onEditStep, handleSubmit, isSubmitting }) => {
  const formatCurrency = (value) => {
    if (!value && value !== 0) {
      return '-';
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }

    return `$${numericValue.toLocaleString()}`;
  };

  const personalInfoItems = [
    { label: 'Full Name', value: `${formData.firstName} ${formData.lastName}` },
    { label: 'Email', value: formData.email },
    { label: 'Phone', value: formData.phone },
    { label: 'Date of Birth', value: formData.dateOfBirth },
    {
      label: 'Home Address',
      value: `${formData.homeAddress?.street || ''}, ${formData.homeAddress?.city || ''}, ${formData.homeAddress?.state || ''} ${formData.homeAddress?.zipCode || ''}`,
    }
  ];

  const businessInfoItems = [
    { label: 'Business Name', value: formData.businessLegalName },
    { label: 'Type', value: formData.businessType },
    { label: 'Years in Business', value: formData.yearsInBusiness },
    ...(formData.taxIdLast4 ? [{ label: 'Tax ID', value: `***-${formData.taxIdLast4}` }] : []),
    {
      label: 'Business Address',
      value: `${formData.businessAddress?.street || ''}, ${formData.businessAddress?.city || ''}, ${formData.businessAddress?.state || ''} ${formData.businessAddress?.zipCode || ''}`,
    }
  ];

  const incomeInfoItems = [
    { label: 'Personal Income', value: formatCurrency(formData.annualPersonalIncome) },
    { label: 'Business Revenue', value: formatCurrency(formData.annualBusinessRevenue) },
    { label: 'Employment Status', value: formData.employmentStatus },
    ...(formData.employmentStatus === 'Employed' ? [
      { label: 'Employer', value: formData.employerName },
      { label: 'Job Title', value: formData.jobTitle },
      { label: 'Years Employed', value: formData.yearsEmployed }
    ] : [])
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary.main">
          Review Application
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          For your new <strong>{selectedCardName}</strong>
        </Typography>
      </Box>

      <ReviewSection 
        title="Personal Information" 
        items={personalInfoItems} 
        stepIndex={0} 
        onEdit={onEditStep} 
      />

      <ReviewSection 
        title="Business Information" 
        items={businessInfoItems} 
        stepIndex={1} 
        onEdit={onEditStep} 
      />

      <ReviewSection 
        title="Income & Employment" 
        items={incomeInfoItems} 
        stepIndex={2} 
        onEdit={onEditStep} 
      />

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          data-testid="application-submit-button"
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ 
            px: 6, 
            py: 1.5, 
            fontSize: '1.1rem',
            backgroundColor: 'secondary.main',
            '&:hover': {
              backgroundColor: 'secondary.dark', 
            }
          }}
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </Button>
      </Box>
      
      <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
        By clicking "Submit Application", you agree to our Terms and Conditions and Privacy Policy.
      </Typography>
    </Box>
  );
};

ReviewSubmitStep.propTypes = {
  formData: PropTypes.object.isRequired,
  selectedCardName: PropTypes.string,
  onEditStep: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

ReviewSubmitStep.defaultProps = {
  isSubmitting: false,
  selectedCardName: 'Business Credit Card'
};

export default ReviewSubmitStep;
