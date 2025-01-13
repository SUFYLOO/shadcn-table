import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker'; // Assuming this is a custom component
import { RadioGroup } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { NumberInput } from '@/components/ui/number-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import { z } from 'zod';


interface SchemaField {
  title?: string;
  dataIndex?: string;
  name: string;
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'file'
    | 'select'
    | 'dateRange';
  options?: string[] | { value: string | number; label: string }[];
  initialValue?: any;
  renderFormItem?: () => React.ReactNode;
  width?: string;
  colProps?: any;
  transform?: (value: any) => any;
  rules?: any; // Add rules for validation
  [key: string]: any;
}

interface Schema {
  title: string;
  description?: string;
  fields: SchemaField[];
}

interface SchemaFormBuilderProps<T> {
  schema: Schema;
  client: (data: T) => Promise<any>;
  onSubmit: (data: T) => void;
  initialValues?: Record<string, any>;
}

const SchemaFormBuilder: React.FC<SchemaFormBuilderProps<any>> = ({
  schema,
  client,
  onSubmit,
  initialValues = {},
}) => {
  const form /* { control, handleSubmit, formState: { errors },  }  */ = useForm({
    // Define the type of the form data dynamically based on the schema
    resolver: zodResolver(
      z.object(
        schema.fields.reduce((acc, field) => {
          const { name, type, options, rules } = field;
          let fieldSchema = z.any();

          switch (type) {
            case 'text':
            case 'textarea':
              fieldSchema = z.string();
              break;
            case 'number':
              fieldSchema = z.number();
              break;
            case 'checkbox':
              fieldSchema = z.boolean();
              break;
            case 'radio':
              if (options && Array.isArray(options) && options.length > 0) {
                const optionValues = options.map((option) =>
                  typeof option === 'object' ? option.value : option
                );
                fieldSchema = z.enum(optionValues);
              } else {
                fieldSchema = z.string(); // Default to string if options are not defined
              }
              break;
            case 'date':
              fieldSchema = z.string(); // Handle date format as needed
              break;
            case 'file':
              fieldSchema = z.string(); // Handle file upload as needed
              break;
            case 'select':
              if (options && Array.isArray(options) && options.length > 0) {
                const optionValues = options.map((option) =>
                  typeof option === 'object' ? option.value : option
                );
                fieldSchema = z.enum(optionValues);
              } else {
                fieldSchema = z.string(); // Default to string if options are not defined
              }
              break;
            case 'dateRange':
              // Define your date range schema here
              fieldSchema = z.array(z.string()).length(2); // Example: array of two dates
              break;
            default:
              fieldSchema = z.any();
          }

          if (rules) {
            fieldSchema = fieldSchema.refine(rules.validate, {
              message: rules.message,
            });
          }

          return { ...acc, [name]: fieldSchema };
        }, {} as any)
      )
    ),
    defaultValues: initialValues,
  });

  const handleFormSubmit = async (data: any) => {
    try {
      const processedData = {};
      schema.fields.forEach((field) => {
        if (field.transform) {
          processedData[field.dataIndex || field.name] = field.transform(data[field.name]);
        } else {
          processedData[field.dataIndex || field.name] = data[field.name];
        }
      });

      const response = await client(processedData);

      if (response.error) {
        console.error(response.error);
        return;
      }

      onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderField = (field: SchemaField) => {
    const { name, label, type, options, initialValue, renderFormItem, ...rest } = field;

    return (
      <FormField key={name} control={form.control} name={name}>
        {({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            {renderFormItem ? (
              renderFormItem()
            ) : (
              <FormControl>
                {type === "textarea" ? (
                  <Textarea {...field} placeholder={label} className="resize-none" />
                ) : type === "text" ? (
                  <Input {...field} placeholder={label} />
                ) : type === "number" ? (
                  <NumberInput {...field} placeholder={label} />
                ) : type === "checkbox" ? (
                  <FormControl>
                    <Checkbox {...field} />
                  </FormControl>
                ) : type === "radio" ? (
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      options={options.map((option: any) => ({
                        value: option.value || option,
                        label: option.label || option,
                      }))}
                    />
                  </FormControl>
                ) : type === "date" ? (
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                ) : type === "dateRange" ? (
                  <FormControl>
                    <DateRangePicker {...field} />
                  </FormControl>
                ) : type === "file" ? (
                  <FormControl>
                    <FileUpload {...field} />
                  </FormControl>
                ) : type === "select" ? (
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="capitalize">
                          <SelectValue placeholder={`Select a ${label}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {options.map((option: any) => (
                            <SelectItem
                              key={option.value || option}
                              value={option.value || option}
                              className="capitalize"
                            >
                              {option.label || option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl>
                    <Input {...field} placeholder={label} />
                  </FormControl>
                )}
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      </FormField>
    );
  };

  return (
    <Sheet>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>{schema.title}</SheetTitle>
          <SheetDescription>{schema.description}</SheetDescription>
        </SheetHeader>
        <Form {...form}> 
          <form className="flex flex-col gap-4">
            {schema.fields.map((field) => renderField(field))}
          </form>
          <SheetFooter className="gap-2 pt-2 sm:space-x-0">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit">Save</Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default SchemaFormBuilder;