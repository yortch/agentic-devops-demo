import React from 'react';
import { Grid, TextField, Typography, Box, MenuItem, Select, FormControl, InputLabel, InputAdornment } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

const IncomeEmploymentStep = () => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const isEmployed = watch('employmentStatus') === 'Employed';

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
        Income & Employment
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="annualPersonalIncome"
            name="annualPersonalIncome"
            label="Annual Personal Income"
            type="number"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={Boolean(errors.annualPersonalIncome)}
            helperText={errors.annualPersonalIncome?.message}
            {...register('annualPersonalIncome')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="annualBusinessRevenue"
            name="annualBusinessRevenue"
            label="Annual Business Revenue"
            type="number"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={Boolean(errors.annualBusinessRevenue)}
            helperText={errors.annualBusinessRevenue?.message}
            {...register('annualBusinessRevenue')}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
            Employment Details
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={Boolean(errors.employmentStatus)}>
            <InputLabel id="employment-status-label">Employment Status</InputLabel>
            <Controller
              name="employmentStatus"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="employment-status-label"
                  id="employmentStatus"
                  label="Employment Status"
                  {...field}
                >
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="Self-Employed">Self-Employed</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                  <MenuItem value="Retired">Retired</MenuItem>
                  <MenuItem value="Student">Student</MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </Grid>

        {isEmployed && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                required={isEmployed}
                id="employerName"
                name="employerName"
                label="Employer Name"
                fullWidth
                variant="outlined"
                error={Boolean(errors.employerName)}
                helperText={errors.employerName?.message}
                {...register('employerName')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required={isEmployed}
                id="jobTitle"
                name="jobTitle"
                label="Job Title"
                fullWidth
                variant="outlined"
                error={Boolean(errors.jobTitle)}
                helperText={errors.jobTitle?.message}
                {...register('jobTitle')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required={isEmployed}
                id="yearsEmployed"
                name="yearsEmployed"
                label="Years at Current Job"
                type="number"
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
                error={Boolean(errors.yearsEmployed)}
                helperText={errors.yearsEmployed?.message}
                {...register('yearsEmployed')}
              />
            </Grid>
          </>
        )}
      </Grid>
      
      <Typography variant="caption" display="block" sx={{ mt: 4, color: 'text.secondary' }}>
        * Alimony, child support, or separate maintenance income need not be revealed if you do not wish to have it considered as a basis for repaying this obligation.
      </Typography>
    </Box>
  );
};

export default IncomeEmploymentStep;
