// Quiz type definitions

export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'money'
  | 'address'
  | 'yes_no'
  | 'phone'
  | 'email'
  | 'date';

export interface UIProps {
  allowCustom?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface VisibilityCondition {
  q: string; // question key
  op: 'eq' | 'in' | 'neq' | 'nin';
  value: string | number | boolean | string[];
}

export interface VisibleIf {
  all?: VisibilityCondition[];
  any?: VisibilityCondition[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  sort_order: number;
  tags?: string[];
  weight?: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  section_id: string;
  key: string;
  prompt: string;
  type: QuestionType;
  required: boolean;
  sort_order: number;
  help_text?: string;
  ui_props?: UIProps;
  visible_if?: VisibleIf;
  is_active: boolean;
  created_at: string;
  quiz_options?: QuizOption[];
}

export interface QuizSection {
  id: string;
  key: string;
  title: string;
  description?: string;
  sort_order: number;
  is_optional: boolean;
  visible_if?: VisibleIf;
  is_active: boolean;
  created_at: string;
  quiz_questions?: QuizQuestion[];
}

export interface QuizSession {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed';
  purpose?: string;
  selected_categories?: string[];
  started_at: string;
  completed_at?: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  session_id: string;
  question_id: string;
  value: QuizValue;
  created_at: string;
  updated_at: string;
}

// Value types for different question types
export type QuizValue =
  | { value: string } // single_choice, short_text, long_text, email, phone, date
  | { value: number } // number, money
  | { value: boolean } // yes_no
  | { values: string[]; custom?: string[] } // multi_choice
  | AddressValue; // address

export interface AddressValue {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

// Helper type for answers map
export type AnswersMap = Record<string, QuizValue>;

// Seed file structure
export interface SeedQuestionDefinition {
  key: string;
  type: QuestionType;
  prompt: string;
  required: boolean;
  sort_order: number;
  help_text?: string;
  ui_props?: UIProps;
  visible_if?: VisibleIf;
  options?: Array<{
    label: string;
    value: string;
    tags?: string[];
    weight?: number;
  }>;
}

export interface SeedSectionDefinition {
  key: string;
  title: string;
  description?: string;
  sort_order: number;
  is_optional: boolean;
  visible_if?: VisibleIf | null;
  questions: SeedQuestionDefinition[];
}

export interface SeedDefinition {
  version: string;
  sections: SeedSectionDefinition[];
}

