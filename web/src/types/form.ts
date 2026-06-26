export type FormFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type FormErrors = Partial<Record<keyof FormFields, string>>;

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';
