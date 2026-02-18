import { z } from 'zod';

const PHONE_REGEX = /^(?:\+1\s?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}$/;
const STATE_REGEX = /^[A-Za-z]{2}$/;
const ZIP_CODE_REGEX = /^\d{5}$/;
const TAX_ID_LAST4_REGEX = /^\d{4}$/;

const toTrimmedString = (fieldLabel, minLength = 1) =>
  z
    .string({ required_error: `${fieldLabel} is required.` })
    .trim()
    .min(minLength, `${fieldLabel} must be at least ${minLength} characters.`);

const toPositiveNumber = (fieldLabel) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string') {
        return Number(value.replace(/,/g, '').trim());
      }

      return value;
    },
    z
      .number({
        required_error: `${fieldLabel} is required.`,
        invalid_type_error: `${fieldLabel} must be a valid number.`,
      })
      .finite(`${fieldLabel} must be a valid number.`)
      .positive(`${fieldLabel} must be greater than 0.`)
  );

const toOptionalPositiveNumber = (fieldLabel) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string') {
        return Number(value.replace(/,/g, '').trim());
      }

      return value;
    },
    z
      .number({ invalid_type_error: `${fieldLabel} must be a valid number.` })
      .finite(`${fieldLabel} must be a valid number.`)
      .positive(`${fieldLabel} must be greater than 0.`)
      .optional()
  );

const dateOfBirthSchema = z
  .preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      if (value instanceof Date) {
        return value;
      }

      return new Date(value);
    },
    z.date({ required_error: 'Date of birth is required.', invalid_type_error: 'Please enter a valid date of birth.' })
  )
  .refine((value) => !Number.isNaN(value.getTime()), {
    message: 'Please enter a valid date of birth.',
  })
  .refine((value) => value < new Date(), {
    message: 'Date of birth must be in the past.',
  })
  .refine((value) => {
    const today = new Date();
    let age = today.getFullYear() - value.getFullYear();
    const monthDifference = today.getMonth() - value.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < value.getDate())) {
      age -= 1;
    }

    return age >= 18;
  }, {
    message: 'You must be at least 18 years old to apply.',
  });

const addressSchema = z.object({
  street: toTrimmedString('Street address'),
  city: toTrimmedString('City'),
  state: z
    .string({ required_error: 'State is required.' })
    .trim()
    .regex(STATE_REGEX, 'State must be exactly 2 letters.'),
  zipCode: z
    .string({ required_error: 'ZIP code is required.' })
    .trim()
    .regex(ZIP_CODE_REGEX, 'ZIP code must be exactly 5 digits.'),
});

const personalStepFieldsSchema = {
  firstName: toTrimmedString('First name', 2),
  lastName: toTrimmedString('Last name', 2),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please enter a valid email address.'),
  phone: z
    .string({ required_error: 'Phone number is required.' })
    .trim()
    .regex(PHONE_REGEX, 'Please enter a valid 10-digit phone number.'),
  dateOfBirth: dateOfBirthSchema,
};

const businessStepFieldsSchema = {
  businessLegalName: toTrimmedString('Business legal name'),
  businessType: toTrimmedString('Business type'),
  yearsInBusiness: toPositiveNumber('Years in business'),
  taxIdLast4: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z
      .string()
      .trim()
      .regex(TAX_ID_LAST4_REGEX, 'Tax ID last 4 must be exactly 4 digits.')
      .optional()
  ),
};

const financialStepFieldsSchema = {
  annualPersonalIncome: toPositiveNumber('Annual personal income'),
  annualBusinessRevenue: toPositiveNumber('Annual business revenue'),
};

const employmentStepFieldsSchema = {
  employmentStatus: toTrimmedString('Employment status'),
  employerName: z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      }

      return value;
    },
    z.string().optional()
  ),
  jobTitle: z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      }

      return value;
    },
    z.string().optional()
  ),
  yearsEmployed: toOptionalPositiveNumber('Years employed'),
};

const withEmploymentConditionalValidation = (schema) =>
  schema.superRefine((data, context) => {
    const isEmployed = data.employmentStatus?.toLowerCase() === 'employed';

    if (!isEmployed) {
      return;
    }

    if (!data.employerName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Employer name is required when employment status is Employed.',
        path: ['employerName'],
      });
    }

    if (!data.jobTitle) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Job title is required when employment status is Employed.',
        path: ['jobTitle'],
      });
    }

    if (data.yearsEmployed === undefined || data.yearsEmployed === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Years employed is required when employment status is Employed.',
        path: ['yearsEmployed'],
      });
    }
  });

export const personalStepSchema = z.object(personalStepFieldsSchema);
export const homeAddressStepSchema = z.object({ homeAddress: addressSchema });
export const businessStepSchema = z.object(businessStepFieldsSchema);
export const businessAddressStepSchema = z.object({ businessAddress: addressSchema });
export const financialStepSchema = z.object(financialStepFieldsSchema);
export const employmentStepSchema = withEmploymentConditionalValidation(z.object(employmentStepFieldsSchema));

export const applicationSchema = withEmploymentConditionalValidation(
  z.object({
    ...personalStepFieldsSchema,
    homeAddress: addressSchema,
    ...businessStepFieldsSchema,
    businessAddress: addressSchema,
    ...financialStepFieldsSchema,
    ...employmentStepFieldsSchema,
  })
);

export default applicationSchema;