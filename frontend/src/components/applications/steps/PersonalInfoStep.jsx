import React from 'react';
import { Grid, TextField, Typography, Box } from '@mui/material';
import { useFormContext } from 'react-hook-form';

const PersonalInfoStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
        Personal Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="firstName"
            name="firstName"
            label="First Name"
            fullWidth
            variant="outlined"
            error={Boolean(errors.firstName)}
            helperText={errors.firstName?.message}
            {...register('firstName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="lastName"
            name="lastName"
            label="Last Name"
            fullWidth
            variant="outlined"
            error={Boolean(errors.lastName)}
            helperText={errors.lastName?.message}
            {...register('lastName')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="email"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="phone"
            name="phone"
            label="Phone Number"
            fullWidth
            variant="outlined"
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            {...register('phone')}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            id="dateOfBirth"
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            error={Boolean(errors.dateOfBirth)}
            helperText={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
            Home Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            id="street"
            name="homeAddress.street"
            label="Street Address"
            fullWidth
            variant="outlined"
            error={Boolean(errors.homeAddress?.street)}
            helperText={errors.homeAddress?.street?.message}
            {...register('homeAddress.street')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="city"
            name="homeAddress.city"
            label="City"
            fullWidth
            variant="outlined"
            error={Boolean(errors.homeAddress?.city)}
            helperText={errors.homeAddress?.city?.message}
            {...register('homeAddress.city')}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            required
            id="state"
            name="homeAddress.state"
            label="State"
            fullWidth
            variant="outlined"
            error={Boolean(errors.homeAddress?.state)}
            helperText={errors.homeAddress?.state?.message}
            {...register('homeAddress.state')}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            required
            id="zipCode"
            name="homeAddress.zipCode"
            label="Zip Code"
            fullWidth
            variant="outlined"
            error={Boolean(errors.homeAddress?.zipCode)}
            helperText={errors.homeAddress?.zipCode?.message}
            {...register('homeAddress.zipCode')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalInfoStep;
