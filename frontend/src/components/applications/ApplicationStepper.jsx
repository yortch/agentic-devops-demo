import React from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, Paper } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ApplicationStepper component displays the progress of the application 
 * and controls navigation between steps.
 */
const ApplicationStepper = ({ activeStep, steps, children, handleNext, handleBack, isSubmitting }) => {
  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Box sx={{ minHeight: '400px' }}>
        {children}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4, pb: 2, justifyContent: 'space-between' }}>
        <Button
          data-testid="application-back-button"
          color="inherit"
          disabled={activeStep === 0 || isSubmitting}
          onClick={handleBack}
          sx={{ mr: 1, minWidth: '100px' }}
          variant="outlined"
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {!isLastStep && (
          <Button
            data-testid="application-next-button"
            onClick={handleNext}
            variant="contained"
            disabled={isSubmitting}
            sx={{ 
              minWidth: '100px',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

ApplicationStepper.propTypes = {
  activeStep: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

ApplicationStepper.defaultProps = {
  isSubmitting: false
};

export default ApplicationStepper;
