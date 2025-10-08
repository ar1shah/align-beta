'use client';

import { QuizQuestion, QuizValue, AddressValue } from '@/lib/quiz/types';
import { Input } from '@/app/_components/Input';
import { useEffect, useState, useCallback } from 'react';

interface QuestionProps {
  question: QuizQuestion;
  value: QuizValue | null;
  onChange: (value: QuizValue) => void;
  error?: string;
}

export function Question({ question, value, onChange, error }: QuestionProps) {
  const [localValue, setLocalValue] = useState<QuizValue | null>(value);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange for text inputs
  const debouncedOnChange = useCallback(
    (newValue: QuizValue) => {
      setLocalValue(newValue);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onChange(newValue);
      }, 400);

      setDebounceTimer(timer);
    },
    [onChange, debounceTimer]
  );

  // Immediate onChange for selections
  const immediateOnChange = useCallback(
    (newValue: QuizValue) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const renderQuestion = () => {
    switch (question.type) {
      case 'single_choice':
        return renderSingleChoice();
      case 'multi_choice':
        return renderMultiChoice();
      case 'short_text':
        return renderShortText();
      case 'long_text':
        return renderLongText();
      case 'number':
        return renderNumber();
      case 'money':
        return renderMoney();
      case 'address':
        return renderAddress();
      case 'yes_no':
        return renderYesNo();
      case 'phone':
        return renderPhone();
      case 'email':
        return renderEmail();
      case 'date':
        return renderDate();
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  const renderSingleChoice = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <div className="space-y-3">
        {question.quiz_options?.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary-300 ${
              currentValue === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={option.value}
              checked={currentValue === option.value}
              onChange={(e) =>
                immediateOnChange({ value: e.target.value })
              }
              className="w-5 h-5 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-gray-900 font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderMultiChoice = () => {
    const currentValues =
      localValue && 'values' in localValue ? localValue.values : [];
    const customValues =
      localValue && 'values' in localValue && 'custom' in localValue
        ? localValue.custom || []
        : [];
    const allowCustom = question.ui_props?.allowCustom;

    const handleToggle = (optionValue: string) => {
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      immediateOnChange({ values: newValues, custom: customValues });
    };

    const handleCustomAdd = (customValue: string) => {
      if (customValue.trim()) {
        immediateOnChange({
          values: currentValues,
          custom: [...customValues, customValue.trim()],
        });
      }
    };

    return (
      <div className="space-y-3">
        {question.quiz_options?.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary-300 ${
              currentValues.includes(option.value)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="checkbox"
              value={option.value}
              checked={currentValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="ml-3 text-gray-900 font-medium">{option.label}</span>
          </label>
        ))}
        {allowCustom && (
          <div className="mt-4">
            <Input
              placeholder="Add custom option (press Enter)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomAdd(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            {customValues.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customValues.map((custom, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {custom}
                    <button
                      type="button"
                      onClick={() => {
                        const newCustom = customValues.filter(
                          (_, i) => i !== idx
                        );
                        immediateOnChange({ values: currentValues, custom: newCustom });
                      }}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderShortText = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <Input
        type="text"
        value={String(currentValue)}
        onChange={(e) => debouncedOnChange({ value: e.target.value })}
        placeholder={question.ui_props?.placeholder}
        error={error}
      />
    );
  };

  const renderLongText = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <div className="space-y-1">
        <textarea
          value={String(currentValue)}
          onChange={(e) => debouncedOnChange({ value: e.target.value })}
          placeholder={question.ui_props?.placeholder}
          rows={5}
          className={`w-full px-4 py-3 rounded-xl border ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          } focus:outline-none focus:ring-2 transition-all resize-none`}
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  };

  const renderNumber = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <Input
        type="number"
        value={currentValue === '' ? '' : Number(currentValue)}
        onChange={(e) => {
          const num = e.target.value === '' ? '' : Number(e.target.value);
          debouncedOnChange({ value: num });
        }}
        min={question.ui_props?.min}
        max={question.ui_props?.max}
        error={error}
      />
    );
  };

  const renderMoney = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          $
        </span>
        <Input
          type="number"
          value={currentValue === '' ? '' : Number(currentValue)}
          onChange={(e) => {
            const num = e.target.value === '' ? '' : Number(e.target.value);
            debouncedOnChange({ value: num });
          }}
          className="pl-8"
          error={error}
        />
      </div>
    );
  };

  const renderAddress = () => {
    const currentValue: AddressValue =
      localValue && 'line1' in localValue
        ? localValue
        : { line1: '', line2: '', city: '', state: '', postal_code: '' };

    const handleAddressChange = (field: keyof AddressValue, value: string) => {
      const newAddress = { ...currentValue, [field]: value };
      debouncedOnChange(newAddress);
    };

    return (
      <div className="space-y-3">
        <Input
          placeholder="Address Line 1"
          value={currentValue.line1 || ''}
          onChange={(e) => handleAddressChange('line1', e.target.value)}
        />
        <Input
          placeholder="Address Line 2 (optional)"
          value={currentValue.line2 || ''}
          onChange={(e) => handleAddressChange('line2', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="City"
            value={currentValue.city || ''}
            onChange={(e) => handleAddressChange('city', e.target.value)}
          />
          <Input
            placeholder="State"
            value={currentValue.state || ''}
            onChange={(e) => handleAddressChange('state', e.target.value)}
          />
        </div>
        <Input
          placeholder="ZIP / Postal Code"
          value={currentValue.postal_code || ''}
          onChange={(e) => handleAddressChange('postal_code', e.target.value)}
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  };

  const renderYesNo = () => {
    const currentValue =
      localValue && 'value' in localValue ? localValue.value : null;

    return (
      <div className="flex gap-4">
        <label
          className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary-300 ${
            currentValue === true
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200'
          }`}
        >
          <input
            type="radio"
            name={question.id}
            checked={currentValue === true}
            onChange={() => immediateOnChange({ value: true })}
            className="sr-only"
          />
          <span className="text-gray-900 font-medium">Yes</span>
        </label>
        <label
          className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary-300 ${
            currentValue === false
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200'
          }`}
        >
          <input
            type="radio"
            name={question.id}
            checked={currentValue === false}
            onChange={() => immediateOnChange({ value: false })}
            className="sr-only"
          />
          <span className="text-gray-900 font-medium">No</span>
        </label>
      </div>
    );
  };

  const renderPhone = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <Input
        type="tel"
        value={String(currentValue)}
        onChange={(e) => debouncedOnChange({ value: e.target.value })}
        placeholder="(555) 123-4567"
        error={error}
      />
    );
  };

  const renderEmail = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <Input
        type="email"
        value={String(currentValue)}
        onChange={(e) => debouncedOnChange({ value: e.target.value })}
        placeholder="your@email.com"
        error={error}
      />
    );
  };

  const renderDate = () => {
    const currentValue = localValue && 'value' in localValue ? localValue.value : '';

    return (
      <Input
        type="date"
        value={String(currentValue)}
        onChange={(e) => debouncedOnChange({ value: e.target.value })}
        error={error}
      />
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-1">
          {question.prompt}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.help_text && (
          <p className="text-sm text-gray-600">{question.help_text}</p>
        )}
      </div>
      {renderQuestion()}
    </div>
  );
}

