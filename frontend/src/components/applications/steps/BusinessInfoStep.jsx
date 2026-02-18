import React from 'react';
import { Grid, TextField, Typography, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

const BusinessInfoStep = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
        Business Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={8}>
          <TextField
            required
            id="businessLegalName"
            name="businessLegalName"
            label="Legal Business Name"
            fullWidth
            variant="outlined"
            error={Boolean(errors.businessLegalName)}
            helperText={errors.businessLegalName?.message}
            {...register('businessLegalName')}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required error={Boolean(errors.businessType)}>
            <InputLabel id="business-type-label">Business Type</InputLabel>
            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="business-type-label"
                  id="businessType"
                  label="Business Type"
                  {...field}
                >
                  <MenuItem value="Sole Proprietorship">Sole Proprietorship</MenuItem>
                  <MenuItem value="Partnership">Partnership</MenuItem>
                  <MenuItem value="LLC">LLC</MenuItem>
                  <MenuItem value="Corporation">Corporation</MenuItem>
                  <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="yearsInBusiness"
            name="yearsInBusiness"
            label="Years in Business"
            type="number"
            fullWidth
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
            error={Boolean(errors.yearsInBusiness)}
            helperText={errors.yearsInBusiness?.message}
            {...register('yearsInBusiness')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            id="taxIdLast4"
            name="taxIdLast4"
            label="Tax ID (Last 4 digits)"
            fullWidth
            variant="outlined"
            inputProps={{ maxLength: 4 }}
            error={Boolean(errors.taxIdLast4)}
            helperText={errors.taxIdLast4?.message || 'Optional'}
            {...register('taxIdLast4')}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
            Business Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            id="businessStreet"
            name="businessAddress.street"
            label="Street Address"
            fullWidth
            variant="outlined"
            error={Boolean(errors.businessAddress?.street)}
            helperText={errors.businessAddress?.street?.message}
            {...register('businessAddress.street')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="businessCity"
            name="businessAddress.city"
            label="City"
            fullWidth
            variant="outlined"
            error={Boolean(errors.businessAddress?.city)}
            helperText={errors.businessAddress?.city?.message}
            {...register('businessAddress.city')}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            required
            id="businessState"
            name="businessAddress.state"
            label="State"
            fullWidth
            variant="outlined"
            error={Boolean(errors.businessAddress?.state)}
            helperText={errors.businessAddress?.state?.message}
            {...register('businessAddress.state')}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            required
            id="businessZipCode"
            name="businessAddress.zipCode"
            label="Zip Code"
            fullWidth
            variant="outlined"
            error={Boolean(errors.businessAddress?.zipCode)}
            helperText={errors.businessAddress?.zipCode?.message}
            {...register('businessAddress.zipCode')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessInfoStep;
