import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PrintIcon from '@mui/icons-material/Print';

const ApplicationConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmation = location.state?.confirmation;

  if (!confirmation) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          No application confirmation found.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/cards')}>
          Browse Cards
        </Button>
      </Container>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Application Submitted!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Thank you, {confirmation.ownerFirstName}! Your application has been received.
        </Typography>
      </Box>

      {/* Reference Details */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #003366 0%, #008080 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
            Application Reference Number
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: 2 }}>
            {confirmation.applicationId}
          </Typography>
          <Chip
            label={confirmation.status}
            sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 600 }}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Application Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">Card Applied For</Typography>
              <Typography variant="body2" fontWeight={600}>{confirmation.cardName}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">Applicant</Typography>
              <Typography variant="body2" fontWeight={600}>
                {confirmation.ownerFirstName} {confirmation.ownerLastName}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body2" fontWeight={600}>{confirmation.ownerEmail}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">Submitted</Typography>
              <Typography variant="body2" fontWeight={600}>
                {confirmation.submittedAt
                  ? new Date(confirmation.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })
                  : 'Just now'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
        <Typography variant="body2" fontWeight={600}>
          {confirmation.expectedDecisionTimeline}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          A confirmation email will be sent to <strong>{confirmation.ownerEmail}</strong>.
          Our team will review your application and contact you with a decision.
        </Typography>
      </Alert>

      {/* Next Steps */}
      <Card sx={{ mb: 4, backgroundColor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            What Happens Next?
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              We'll review your business and personal information
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              A credit check will be performed (as you authorized)
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              You'll receive a decision within 5-7 business days
            </Typography>
            <Typography component="li" variant="body2">
              If approved, your card will arrive within 7-10 business days
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print Summary
        </Button>
        <Button
          variant="contained"
          startIcon={<CompareArrowsIcon />}
          onClick={() => navigate('/cards')}
        >
          Apply for Another Card
        </Button>
      </Box>
    </Container>
  );
};

export default ApplicationConfirmationPage;
