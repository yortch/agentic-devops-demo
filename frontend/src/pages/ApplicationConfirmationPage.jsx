import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { applicationService } from '../services/api';

const ApplicationConfirmationPage = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();

  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ['applicationStatus', trackingId],
    queryFn: () => applicationService.getApplicationStatus(trackingId),
    enabled: Boolean(trackingId),
  });

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography data-testid="application-submitted-title" variant="h3" component="h1" gutterBottom fontWeight={700}>
            Application Submitted
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for applying with Three Rivers Bank. Your application is now in review.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Tracking ID
          </Typography>
          <Typography data-testid="application-tracking-id" variant="h5" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
            {trackingId}
          </Typography>
        </Paper>

        <Box sx={{ mb: 3 }}>
          {isStatusLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading application status...
              </Typography>
            </Box>
          )}

          {!isStatusLoading && !statusError && statusData?.status && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary">
                Current Status:
              </Typography>
              <Chip label={statusData.status} color="primary" />
              {statusData.creditCardSummary?.cardName && (
                <Typography variant="body2" color="text.secondary">
                  Card: {statusData.creditCardSummary.cardName}
                </Typography>
              )}
            </Stack>
          )}

          {!isStatusLoading && statusError && (
            <Alert severity="warning">
              We received your application, but we could not retrieve the latest status details right now.
            </Alert>
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            What happens next?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We&apos;ll review your application within 3-5 business days and contact you by email with an update.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" onClick={() => navigate('/')}>
            Return Home
          </Button>
          <Button variant="outlined" onClick={() => navigate('/cards')}>
            View Cards
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ApplicationConfirmationPage;