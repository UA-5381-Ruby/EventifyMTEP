import { validate } from '@/utils/validate';

describe('validate', () => {
  const validFields = {
    name: 'John',
    email: 'john@example.com',
    subject: 'Hello',
    message: 'This is a valid message',
  };

  it('returns no errors for valid input', () => {
    expect(validate(validFields)).toEqual({});
  });

  it('returns error when name is empty', () => {
    expect(validate({ ...validFields, name: '' }).name).toBe('Name is required');
  });

  it('returns error when name is only whitespace', () => {
    expect(validate({ ...validFields, name: '   ' }).name).toBe('Name is required');
  });

  it('returns error when email is empty', () => {
    expect(validate({ ...validFields, email: '' }).email).toBe('Email is required');
  });

  it('returns error when email is only whitespace', () => {
    expect(validate({ ...validFields, email: '   ' }).email).toBe('Email is required');
  });

  it('returns error when email format is invalid', () => {
    expect(validate({ ...validFields, email: 'notanemail' }).email).toBe(
      'Enter a valid email address'
    );
  });

  it('returns no email error for valid email', () => {
    expect(validate({ ...validFields, email: 'a@b.com' }).email).toBeUndefined();
  });

  it('returns error when subject is empty', () => {
    expect(validate({ ...validFields, subject: '' }).subject).toBe('Subject is required');
  });

  it('returns error when subject is only whitespace', () => {
    expect(validate({ ...validFields, subject: '   ' }).subject).toBe('Subject is required');
  });

  it('returns error when message is empty', () => {
    expect(validate({ ...validFields, message: '' }).message).toBe('Message is required');
  });

  it('returns error when message is only whitespace', () => {
    expect(validate({ ...validFields, message: '   ' }).message).toBe('Message is required');
  });

  it('returns error when message is too short', () => {
    expect(validate({ ...validFields, message: 'Hi' }).message).toBe('Message is too short');
  });

  it('returns no message error when message is exactly 10 characters', () => {
    expect(validate({ ...validFields, message: '1234567890' }).message).toBeUndefined();
  });
});
