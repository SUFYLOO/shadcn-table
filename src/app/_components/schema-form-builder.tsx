import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
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
  rules?: any;
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
  props?: React.ComponentPropsWithRef<any>;
}

const SchemaFormBuilder = <T,>({
  schema,
  client,
  onSubmit,
  initialValues = {},
  ...props
}: SchemaFormBuilderProps<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(
      z.object(
        schema.fields.reduce((acc, field) => {
          const { name, type, options, rules } = field;
          let fieldSchema = z.any() ;

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
                fieldSchema = z.string();
              }
              break;
            case 'date':
              fieldSchema = z.string();
              break;
            case 'file':
              fieldSchema = z.string();
              break;
            case 'select':
              if (options && Array.isArray(options) && options.length > 0) {
                const optionValues = options.map((option) =>
                  typeof option === 'object' ? option.value : option
                );
                fieldSchema = z.enum(optionValues);
              } else {
                fieldSchema = z.string();
              }
              break;
            case 'dateRange':
              fieldSchema = z.array(z.string()).length(2);
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
        }, {} as Record<string, any>)
      )
    ),
    defaultValues: initialValues,
  });

  const handleFormSubmit = async (data: T) => {
    try {
      const processedData: Record<string, any> = {};
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
    const { name, title, type, options, renderFormItem, ...rest } = field;

    return (
      <FormField key={name} control={form.control} name={name} 
         render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
            {renderFormItem ? (
              renderFormItem()
            ) : (
              <FormControl>
                {type === "textarea" ? (
                  <Textarea {...field} placeholder={title} className="resize-none" />
                ) : type === "text" ? (
                  <Input {...field} placeholder={title} />
                ) : type === "number" ? (
                  <NumberInput {...field} placeholder={title} />
                ) : type === "checkbox" ? (
                  <Checkbox {...field} />
                ) : type === "radio" ? (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    options={options?.map((option: any) => ({
                      value: option.value || option,
                      label: option.label || option,
                    })) || []}
                  />
                ) : type === "date" ? (
                  <DatePicker {...field} />
                ) : type === "dateRange" ? (
                  <DateRangePicker {...field} />
                ) : type === "file" ? (
                  <FileUpload {...field} />
                ) : type === "select" ? (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={`Select a ${title}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {options?.map((option: any) => (
                          <SelectItem
                            key={option.value || option}
                            value={option.value || option}
                            className="capitalize"
                          >
                            {option.label || option}
                          </SelectItem>
                        )) || null}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...field} placeholder={title} />
                )}
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
         )}
         />
    );
  };

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>{schema.title}</SheetTitle>
          <SheetDescription>{schema.description}</SheetDescription>
        </SheetHeader>
        {/* onSubmit={form.handleSubmit(handleFormSubmit)} */}
        <Form {...form} >
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