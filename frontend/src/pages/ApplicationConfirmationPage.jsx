import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';

const ApplicationConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { response, card } = location.state || {};

  if (!response) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">No confirmation data found.</Alert>
        <Button variant="contained" onClick={() => navigate('/cards')} sx={{ mt: 2 }}>
          Browse Cards
        </Button>
      </Container>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom color="success.main">
          Application Submitted!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {response.message}
        </Typography>

        <Divider sx={{ my: 4 }} />

        {/* Application Details */}
        <Box sx={{ textAlign: 'left', mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Application Reference
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Application ID
              </Typography>
              <Typography variant="h5" color="primary">
                {response.applicationId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {response.status}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Submitted
              </Typography>
              <Typography variant="body1">
                {new Date(response.submittedAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Expected Decision
              </Typography>
              <Typography variant="body1">
                {response.expectedDecisionTimeline}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>What happens next?</strong>
            <br />
            • A confirmation email has been sent to your registered email address
            <br />
            • Our credit team will review your application within 5-7 business days
            <br />
            • You'll receive an email notification once a decision is made
            <br />
            • Keep your application ID ({response.applicationId}) for reference
          </Typography>
        </Alert>

        <Divider sx={{ my: 4 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handlePrint}
          >
            Print Summary
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/cards')}
          >
            Apply for Another Card
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>

      {/* Contact Information */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Questions?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you have any questions about your application, please contact us:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Phone:</strong> 1-800-THREE-RB
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> business@threeriversbank.com
          </Typography>
          <Typography variant="body2">
            <strong>Hours:</strong> Monday-Friday, 8 AM - 8 PM EST
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApplicationConfirmationPage;
