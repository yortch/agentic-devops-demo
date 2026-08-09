import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import DownloadIcon from '@mui/icons-material/Download';

const ApplicationConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { application } = location.state || {};

  if (!application) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Confirmation data not found.</Alert>
        <Button onClick={() => navigate('/cards')} sx={{ mt: 2 }}>
          Back to Cards
        </Button>
      </Container>
    );
  }

  const handleDownloadSummary = () => {
    // In a real implementation, this would generate a PDF
    alert('PDF download would be implemented here');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="success.main">
          Application Submitted!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Thank you for applying for the {application.creditCardName}
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderLeft: 4, borderColor: 'success.main' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Application Reference Number
          </Typography>
          <Chip 
            label={application.applicationNumber} 
            color="primary" 
            sx={{ fontSize: '1rem', py: 2.5, px: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please save this reference number for your records. You will need it to check your application status.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            What Happens Next?
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight={600}>
                Confirmation Email
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {application.confirmationMessage}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              📋 Application Review
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our team will review your application and supporting documents. We may contact you if additional information is needed.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              🔍 Credit Check
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We will perform a credit check as authorized in your application. This may temporarily impact your credit score.
            </Typography>
          </Box>

          <Box>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              ✅ Decision Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {application.expectedDecisionTimeframe}. You will be notified via email and can also check your status using your reference number.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Application Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <Chip label={application.status} color="info" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Submitted:</Typography>
            <Typography variant="body2">{new Date(application.submittedAt).toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Card:</Typography>
            <Typography variant="body2">{application.creditCardName}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadSummary}
        >
          Download Application Summary
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/cards')}
        >
          Apply for Another Card
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Box>

      <Box sx={{ mt: 4, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2">
          Contact Three Rivers Bank Business Credit Card Support<br />
          📞 1-800-THREE-RB (1-800-847-3372)<br />
          ✉️ business@threeriversbank.com<br />
          Monday-Friday, 8 AM - 8 PM EST
        </Typography>
      </Box>
    </Container>
  );
};

export default ApplicationConfirmationPage;
