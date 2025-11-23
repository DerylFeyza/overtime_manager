import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import {
    Control,
    FieldValues,
    Path,
    UseFormGetValues,
    UseFormSetValue,
    useWatch,
} from 'react-hook-form';

type TimePickerProps<T extends FieldValues> = {
    control: Control<T>;
    name: Path<T>;
    label: string;
    getValues: UseFormGetValues<T>;
    setValue: UseFormSetValue<T>;
};

export default function TimePicker<T extends FieldValues>({
    control,
    name,
    label,
    getValues,
    setValue,
}: TimePickerProps<T>) {
    const [timeInput, setTimeInput] = useState('');
    const fieldValue = useWatch({ control, name });

    function handleTimeChange(
        type: 'hour' | 'minute' | 'date',
        value: string | Date,
        setInputValue: (value: string) => void,
    ) {
        const currentDate = (getValues(name) as Date) || new Date();
        const newDate = new Date(currentDate);

        if (type === 'date' && value instanceof Date) {
            newDate.setFullYear(value.getFullYear());
            newDate.setMonth(value.getMonth());
            newDate.setDate(value.getDate());
        } else if (type === 'hour' && typeof value === 'string') {
            const hour = parseInt(value, 10);
            newDate.setHours(hour);
        } else if (type === 'minute' && typeof value === 'string') {
            newDate.setMinutes(parseInt(value, 10));
        }

        setValue(name, newDate as T[Path<T>]);
        setInputValue(format(newDate, 'MM/dd/yyyy HH:mm'));
    }

    function handleManualInput(
        value: string,
        setInputValue: (value: string) => void,
    ) {
        setInputValue(value);

        const currentDate = (getValues(name) as Date) || new Date();

        const timeOnlyMatch = value.match(/^(\d{1,2}):(\d{2})$/);
        if (timeOnlyMatch) {
            const [, hours, minutes] = timeOnlyMatch;
            const newDate = new Date(currentDate);
            newDate.setHours(parseInt(hours, 10));
            newDate.setMinutes(parseInt(minutes, 10));
            setValue(name, newDate as T[Path<T>]);
            return;
        }

        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            setValue(name, parsed as T[Path<T>]);
        }
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                if (
                    fieldValue &&
                    timeInput !== format(fieldValue, 'MM/dd/yyyy HH:mm')
                ) {
                    setTimeInput(format(fieldValue, 'MM/dd/yyyy HH:mm'));
                }
                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <Popover>
                            <div className="relative">
                                <FormControl>
                                    <Input
                                        placeholder="MM/dd/yyyy HH:mm or HH:mm"
                                        value={
                                            timeInput ||
                                            (field.value
                                                ? format(
                                                      field.value as Date,
                                                      'MM/dd/yyyy HH:mm',
                                                  )
                                                : '')
                                        }
                                        onChange={(e) =>
                                            handleManualInput(
                                                e.target.value,
                                                setTimeInput,
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            const allowedKeys = [
                                                'Backspace',
                                                'Delete',
                                                'Tab',
                                                'Escape',
                                                'Enter',
                                                'ArrowLeft',
                                                'ArrowRight',
                                                'ArrowUp',
                                                'ArrowDown',
                                                'Home',
                                                'End',
                                            ];
                                            const isNumber = /^[0-9]$/.test(
                                                e.key,
                                            );
                                            const isAllowed =
                                                allowedKeys.includes(e.key) ||
                                                e.key === ':' ||
                                                e.key === '/' ||
                                                e.key === ' ';
                                            if (
                                                !isNumber &&
                                                !isAllowed &&
                                                !e.ctrlKey &&
                                                !e.metaKey
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onBlur={() => {
                                            if (field.value) {
                                                setTimeInput(
                                                    format(
                                                        field.value,
                                                        'MM/dd/yyyy HH:mm',
                                                    ),
                                                );
                                            }
                                        }}
                                        className="pr-10"
                                    />
                                </FormControl>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-0 right-0 h-full px-3"
                                        type="button"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                            </div>
                            <PopoverContent className="w-auto p-0">
                                <div className="sm:flex">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            if (date) {
                                                handleTimeChange(
                                                    'date',
                                                    date,
                                                    setTimeInput,
                                                );
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
                                        <ScrollArea className="w-64 sm:w-auto">
                                            <div className="flex p-2 sm:flex-col">
                                                {Array.from(
                                                    {
                                                        length: 24,
                                                    },
                                                    (_, i) => i,
                                                )
                                                    .reverse()
                                                    .map((hour) => (
                                                        <Button
                                                            key={hour}
                                                            size="icon"
                                                            variant={
                                                                field.value &&
                                                                (
                                                                    field.value as Date
                                                                ).getHours() ===
                                                                    hour
                                                                    ? 'default'
                                                                    : 'ghost'
                                                            }
                                                            className="aspect-square shrink-0 sm:w-full"
                                                            onClick={() =>
                                                                handleTimeChange(
                                                                    'hour',
                                                                    hour.toString(),
                                                                    setTimeInput,
                                                                )
                                                            }
                                                        >
                                                            {hour}
                                                        </Button>
                                                    ))}
                                            </div>
                                            <ScrollBar
                                                orientation="horizontal"
                                                className="sm:hidden"
                                            />
                                        </ScrollArea>
                                        <ScrollArea className="w-64 sm:w-auto">
                                            <div className="flex p-2 sm:flex-col">
                                                {Array.from(
                                                    {
                                                        length: 12,
                                                    },
                                                    (_, i) => i * 5,
                                                ).map((minute) => (
                                                    <Button
                                                        key={minute}
                                                        size="icon"
                                                        variant={
                                                            field.value &&
                                                            (
                                                                field.value as Date
                                                            ).getMinutes() ===
                                                                minute
                                                                ? 'default'
                                                                : 'ghost'
                                                        }
                                                        className="aspect-square shrink-0 sm:w-full"
                                                        onClick={() =>
                                                            handleTimeChange(
                                                                'minute',
                                                                minute.toString(),
                                                                setTimeInput,
                                                            )
                                                        }
                                                    >
                                                        {minute
                                                            .toString()
                                                            .padStart(2, '0')}
                                                    </Button>
                                                ))}
                                            </div>
                                            <ScrollBar
                                                orientation="horizontal"
                                                className="sm:hidden"
                                            />
                                        </ScrollArea>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
