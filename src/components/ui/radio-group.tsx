// RadioGroup.tsx
"use client"
import * as React from 'react';

interface RadioGroupProps {
  value: string | number | null;
  onValueChange: (value: string | number | null) => void;
  options: { value: string | number; label: string }[];
}

 const RadioGroup: React.FC<RadioGroupProps> = ({ value, onValueChange, options }) => {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center">
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
            className="mr-2"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

 const Radio: React.FC<{ value: string | number; label: string }> = ({ value, label }) => {
  return (
    <label className="flex items-center">
      <input type="radio" value={value} className="mr-2" />
      {label}
    </label>
  );
};

export {RadioGroup,Radio}