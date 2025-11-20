import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const phoneRegex = /^\d{10}$/;
const zipRegex = /^\d{5}(-\d{4})?$/;
const taxIdRegex = /^\d{9}$/;
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)\/?$/;

export const applicationSchema = yup.object().shape({
  // Business Information
  businessLegalName: yup
    .string()
    .required('Business legal name is required')
    .max(200, 'Business legal name must not exceed 200 characters'),
  dbaName: yup
    .string()
    .max(200, 'DBA name must not exceed 200 characters'),
  businessStructure: yup
    .string()
    .required('Business structure is required'),
  taxId: yup
    .string()
    .required('Tax ID/EIN is required')
    .matches(taxIdRegex, 'Tax ID must be 9 digits (no dashes)'),
  industryType: yup
    .string()
    .required('Industry type is required'),
  yearsInBusiness: yup
    .number()
    .required('Years in business is required')
    .min(0, 'Years in business must be 0 or greater')
    .typeError('Years in business must be a number'),
  numberOfEmployees: yup
    .number()
    .required('Number of employees is required')
    .min(0, 'Number of employees must be 0 or greater')
    .typeError('Number of employees must be a number'),
  annualBusinessRevenue: yup
    .string()
    .required('Annual business revenue is required'),
  businessStreet: yup
    .string()
    .required('Business street address is required'),
  businessCity: yup
    .string()
    .required('Business city is required'),
  businessState: yup
    .string()
    .required('Business state is required')
    .length(2, 'State must be 2 characters'),
  businessZip: yup
    .string()
    .required('Business ZIP code is required')
    .matches(zipRegex, 'Invalid ZIP code format'),
  businessPhone: yup
    .string()
    .required('Business phone is required')
    .matches(phoneRegex, 'Phone must be 10 digits (no dashes)'),
  businessWebsite: yup
    .string()
    .matches(urlRegex, 'Invalid URL format')
    .nullable(),

  // Personal Information
  firstName: yup
    .string()
    .required('First name is required')
    .max(100, 'First name must not exceed 100 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .max(100, 'Last name must not exceed 100 characters'),
  dateOfBirth: yup
    .date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth must be in the past')
    .test('age', 'You must be at least 18 years old', function(value) {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 18);
      return value <= cutoff;
    })
    .typeError('Invalid date'),
  ssn: yup
    .string()
    .required('SSN is required')
    .matches(taxIdRegex, 'SSN must be 9 digits (no dashes)'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  homeStreet: yup
    .string()
    .required('Home street address is required'),
  homeCity: yup
    .string()
    .required('Home city is required'),
  homeState: yup
    .string()
    .required('Home state is required')
    .length(2, 'State must be 2 characters'),
  homeZip: yup
    .string()
    .required('Home ZIP code is required')
    .matches(zipRegex, 'Invalid ZIP code format'),
  mobilePhone: yup
    .string()
    .required('Mobile phone is required')
    .matches(phoneRegex, 'Phone must be 10 digits (no dashes)'),
  ownershipPercentage: yup
    .number()
    .required('Ownership percentage is required')
    .min(0, 'Ownership percentage must be between 0 and 100')
    .max(100, 'Ownership percentage must be between 0 and 100')
    .typeError('Ownership percentage must be a number'),
  title: yup
    .string()
    .required('Title/Position is required')
    .max(100, 'Title must not exceed 100 characters'),
  annualPersonalIncome: yup
    .number()
    .required('Annual personal income is required')
    .min(0, 'Annual personal income must be positive')
    .typeError('Annual personal income must be a number'),

  // Card Preferences
  requestedCreditLimit: yup
    .string()
    .required('Requested credit limit is required'),
  employeeCardsNeeded: yup
    .number()
    .min(0, 'Employee cards needed must be 0 or greater')
    .max(50, 'Employee cards needed must not exceed 50')
    .nullable()
    .typeError('Employee cards needed must be a number'),
  authorizedUserInfo: yup
    .string()
    .nullable(),

  // Terms & Conditions
  agreedToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
    .required('You must agree to the terms and conditions'),
  consentToCreditCheck: yup
    .boolean()
    .oneOf([true], 'You must consent to a credit check')
    .required('You must consent to a credit check'),
  electronicSignature: yup
    .string()
    .required('Electronic signature is required'),
});

export const useApplicationForm = (defaultValues = {}) => {
  return useForm({
    resolver: yupResolver(applicationSchema),
    defaultValues: {
      businessLegalName: '',
      dbaName: '',
      businessStructure: '',
      taxId: '',
      industryType: '',
      yearsInBusiness: '',
      numberOfEmployees: '',
      annualBusinessRevenue: '',
      businessStreet: '',
      businessCity: '',
      businessState: '',
      businessZip: '',
      businessPhone: '',
      businessWebsite: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      ssn: '',
      email: '',
      homeStreet: '',
      homeCity: '',
      homeState: '',
      homeZip: '',
      mobilePhone: '',
      ownershipPercentage: '',
      title: '',
      annualPersonalIncome: '',
      requestedCreditLimit: '',
      employeeCardsNeeded: '',
      authorizedUserInfo: '',
      agreedToTerms: false,
      consentToCreditCheck: false,
      electronicSignature: '',
      ...defaultValues,
    },
    mode: 'onBlur',
  });
};
