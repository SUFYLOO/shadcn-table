import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, Radio } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { NumberInput } from '@/components/ui/number-input';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SchemaField {
  title?: string; // Optional title
  dataIndex?: string; // Optional data index
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
    | 'dateRange'; // Added dateRange type
  options?: string[] | { value: string | number; label: string }[];
  initialValue?: any; // Allow for various initial values
  renderFormItem?: () => React.ReactNode; // Allow custom form item rendering
  width?: string; // Optional width for layout
  colProps?: any; // Optional column properties
  transform?: (value: any) => any; // Optional data transformation function
  [key: string]: any; // Allow for custom properties
}

interface Schema {
  title: string;
  description?: string;
  fields: SchemaField[];
}

interface SchemaFormBuilderProps {
  schema: Schema;
  client: (data: any) => Promise<any>;
  onSubmit: (data: any) => void;
  initialValues?: Record<string, any>;
}

const SchemaFormBuilder: React.FC<SchemaFormBuilderProps> = ({
  schema,
  client,
  onSubmit,
  initialValues = {},
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
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

      const response = await client(processedData); // Call the provided client function with processed data

      if (response.error) {
        toast.error(response.error);
        return;
      }

      onSubmit(data); // Call the provided onSubmit callback with form data
      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const renderField = (field: SchemaField) => {
    const {
      name,
      label,
      type,
      options,
      initialValue,
      renderFormItem,
      ...rest
    } = field;

    return (
      <FormField key={name} control={control} name={name}>
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
                    <DatePicker.RangePicker {...field} />
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
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
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