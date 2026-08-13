import React from 'react';
import { Button, Input, Label, Select } from '@/components/ui';
import { GENDER_OPTIONS, ROLE_OPTIONS } from '../constants/register.constants';
import type { RegisterFormValues, RegisterFormProps } from '../types/register.types';
import { Loader2, ArrowRight } from 'lucide-react';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  values,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* General Error Message Alert */}
      {errors.general && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {errors.general}
        </div>
      )}

      {/* First Name & Last Name Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-1.5">
          <Label htmlFor="firstName" required>
            First Name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            value={values.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            disabled={isSubmitting}
            error={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
          <Label htmlFor="lastName" required>
            Last Name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={values.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            disabled={isSubmitting}
            error={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email Address */}
      <div className="space-y-1.5">
        <Label htmlFor="email" required>
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john.doe@example.com"
          value={values.email}
          onChange={(e) => onChange('email', e.target.value)}
          disabled={isSubmitting}
          error={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => onChange('password', e.target.value)}
          disabled={isSubmitting}
          error={!!errors.password}
        />
        {errors.password && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.password}</p>
        )}
      </div>

      {/* Age & Gender Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Age */}
        <div className="space-y-1.5">
          <Label htmlFor="age" required>
            Age
          </Label>
          <Input
            id="age"
            name="age"
            type="number"
            min={1}
            max={120}
            placeholder="12"
            value={values.age}
            onChange={(e) => onChange('age', e.target.value)}
            disabled={isSubmitting}
            error={!!errors.age}
          />
          {errors.age && <p className="text-xs text-destructive font-medium mt-1">{errors.age}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label htmlFor="gender" required>
            Gender
          </Label>
          <Select
            id="gender"
            name="gender"
            value={values.gender}
            onValueChange={(val) => onChange('gender', val as RegisterFormValues['gender'])}
            options={GENDER_OPTIONS}
            disabled={isSubmitting}
            error={!!errors.gender}
            placeholder="Select gender"
          />
          {errors.gender && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Phone Number (Optional) & Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone Number */}
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+1234567890"
            value={values.phoneNumber}
            onChange={(e) => onChange('phoneNumber', e.target.value)}
            disabled={isSubmitting}
            error={!!errors.phoneNumber}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Role (Only PATIENT allowed) */}
        <div className="space-y-1.5">
          <Label htmlFor="role">Account Role</Label>
          <Select
            id="role"
            name="role"
            value={values.role}
            onValueChange={(val) => onChange('role', val as RegisterFormValues['role'])}
            options={ROLE_OPTIONS}
            disabled={isSubmitting}
            error={!!errors.role}
            placeholder="Select role"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full mt-6 bg-gradient-primary hover:bg-gradient-primary-hover shadow-primary font-semibold text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Sending Verification OTP...
          </>
        ) : (
          <>
            Create Account & Send OTP
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Terms & Privacy Footer Notice matching reference UI model */}
      <p className="text-center text-[11px] text-muted-foreground pt-3 leading-relaxed">
        By continuing, you agree to our{' '}
        <span className="font-semibold text-foreground underline hover:text-primary cursor-pointer">
          Terms of Service
        </span>{' '}
        and{' '}
        <span className="font-semibold text-foreground underline hover:text-primary cursor-pointer">
          Privacy Policy
        </span>
        .
      </p>
    </form>
  );
};
