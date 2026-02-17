export interface EmailJob {
  to: string;
  subject: string;

  html?: string;
  template?: string;
  context?: Record<string, any>;

  text?: string;
}
