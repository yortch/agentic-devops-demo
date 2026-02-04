import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import { creditCardService } from '../services/api';

const CardComparisonPage = () => {
  const navigate = useNavigate();
  const [cardTypeFilter, setCardTypeFilter] = useState('');
  const [annualFeeFilter, setAnnualFeeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const { data: cards, isLoading } = useQuery({
    queryKey: ['creditCards'],
    queryFn: creditCardService.getAllCards,
  });

  const handleViewCard = (cardId) => {
    navigate(`/cards/${cardId}`);
  };

  const filteredCards = cards?.filter((card) => {
    if (cardTypeFilter && card.cardType !== cardTypeFilter) return false;
    if (annualFeeFilter === 'free' && card.annualFee > 0) return false;
    if (annualFeeFilter === 'paid' && card.annualFee === 0) return false;
    return true;
  });

  const cardTypes = [...new Set(cards?.map((card) => card.cardType) || [])];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Compare Business Credit Cards
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Find the perfect card for your business needs. Compare features, rewards, and benefits side by side.
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Card Type</InputLabel>
          <Select
            value={cardTypeFilter}
            label="Card Type"
            onChange={(e) => setCardTypeFilter(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {cardTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Annual Fee</InputLabel>
          <Select
            value={annualFeeFilter}
            label="Annual Fee"
            onChange={(e) => setAnnualFeeFilter(e.target.value)}
          >
            <MenuItem value="">All Cards</MenuItem>
            <MenuItem value="free">No Annual Fee</MenuItem>
            <MenuItem value="paid">Has Annual Fee</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="table">
              <TableChartIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredCards?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No cards match your filters
          </Typography>
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredCards?.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                    {card.name}
                  </Typography>
                  <Chip label={card.cardType} size="small" color="secondary" sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {card.description?.substring(0, 120)}...
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Annual Fee:</Typography>
                      <Typography variant="body2">${card.annualFee}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Intro APR:</Typography>
                      <Typography variant="body2">{card.introApr || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Regular APR:</Typography>
                      <Typography variant="body2">{card.regularApr}</Typography>
                    </Box>
                    {card.rewardsRate > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Rewards:</Typography>
                        <Typography variant="body2">{card.rewardsRate}%</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={600}>Credit Score:</Typography>
                      <Typography variant="body2">{card.creditScoreNeeded}</Typography>
                    </Box>
                  </Box>

                  {card.signupBonus && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1,
                        backgroundColor: 'secondary.light',
                        color: 'white',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        {card.signupBonus}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleViewCard(card.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/apply/${card.id}`)}
                    data-testid={`apply-now-${card.id}`}
                  >
                    Apply Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Card Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Annual Fee</strong></TableCell>
                <TableCell><strong>Intro APR</strong></TableCell>
                <TableCell><strong>Regular APR</strong></TableCell>
                <TableCell><strong>Rewards</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCards?.map((card) => (
                <TableRow key={card.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {card.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={card.cardType} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>${card.annualFee}</TableCell>
                  <TableCell>{card.introApr || 'N/A'}</TableCell>
                  <TableCell>{card.regularApr}</TableCell>
                  <TableCell>
                    {card.rewardsRate > 0 ? `${card.rewardsRate}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewCard(card.id)}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/apply/${card.id}`)}
                        data-testid={`apply-now-table-${card.id}`}
                      >
                        Apply Now
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default CardComparisonPage;
