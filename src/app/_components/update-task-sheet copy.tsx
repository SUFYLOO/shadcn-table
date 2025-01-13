// In your component where you want to use the SchemaFormBuilder

import React from 'react';
import SchemaFormBuilder from './schema-form-builder'; // Import the component
import { DateRangePicker } from '@/components/date-range-picker';

const MyComponent = () => {
  const mySchema = {
    title: 'My Form',
    description: 'This is a sample form',
    fields: [
      { name: 'firstName', label: 'First Name', type: 'text' },
      { name: 'lastName', label: 'Last Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'age', label: 'Age', type: 'number' },
      { 
        title: 'Date Range', 
        dataIndex: 'dateRange', 
        name: 'dateRange', 
        type: 'dateRange', 
        initialValue: [dayjs().add(-1, 'm'), dayjs()], 
        renderFormItem: () => <DateRangePicker/> 
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'radio',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'dob', label: 'Date of Birth', type: 'date' },
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        options: ['USA', 'Canada', 'UK', 'Australia'],
      },
    ],
  };

  const handleFormSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle form submission here (e.g., send data to server)
  };

  return (
    <div>
      <SchemaFormBuilder 
        schema={mySchema} 
        onSubmit={handleFormSubmit} 
      />
    </div>
  );
};

export default MyComponent;