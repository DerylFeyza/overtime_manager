import TimePicker from '@/components/form/time-picker';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z
    .object({
        startTime: z.date({
            message: 'start time is required.',
        }),
        finishTime: z.date({
            message: 'finish time is required.',
        }),
        description: z
            .string()
            .min(1, 'Description is required')
            .max(500, 'Description must be less than 500 characters'),
        person: z
            .string()
            .min(1, 'Person is required')
            .max(100, 'Name must be less than 100 characters'),
        status: z.enum(['Pending', 'Compensated', 'Not Compensated'], {
            message: 'Please select a status',
        }),
    })
    .refine((data) => data.finishTime > data.startTime, {
        message: 'Finish time must be after start time',
        path: ['finishTime'],
    });

type FormValues = z.infer<typeof formSchema>;

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    console.log('canRegister', canRegister);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startTime: new Date(),
            finishTime: new Date(),
            description: '',
            person: '',
            status: 'Pending',
        },
    });

    const onSubmit = async (values: FormValues) => {
        console.log(values);
        setIsSubmitting(true);
        try {
            // Extract date from startTime
            const entryDate = format(values.startTime, 'yyyy-MM-dd');
            const startTime = format(values.startTime, 'HH:mm');
            const finishTime = format(values.finishTime, 'HH:mm');

            router.post(
                '/entries',
                {
                    person: values.person,
                    date: entryDate,
                    start_time: startTime,
                    finish_time: finishTime,
                    description: values.description,
                    status: values.status,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Overtime entry added successfully!');
                        form.reset();
                    },
                    onError: (errors) => {
                        console.error('Validation errors:', errors);
                        toast.error(
                            'Failed to add overtime entry. Please check the form.',
                        );
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error adding overtime entry:', error);
            toast.error('Failed to add overtime entry. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gradient-subtle min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
                <Card className="border-border bg-card shadow-lg dark:shadow-none">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                Add Overtime Entry
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Record a new overtime work entry with all the
                            details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="person"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Person</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <TimePicker
                                    control={form.control}
                                    name="startTime"
                                    label="Start Time"
                                    getValues={form.getValues}
                                    setValue={form.setValue}
                                />

                                <TimePicker
                                    control={form.control}
                                    name="finishTime"
                                    label="Finish Time"
                                    getValues={form.getValues}
                                    setValue={form.setValue}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="z-50 bg-popover">
                                                    <SelectItem value="Pending">
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value="Compensated">
                                                        Compensated
                                                    </SelectItem>
                                                    <SelectItem value="Not Compensated">
                                                        Not Compensated
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the overtime work..."
                                                    className="min-h-[120px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-4 pt-2">
                                    <Button
                                        type="submit"
                                        className="gradient-primary flex-1 transition-opacity hover:opacity-90"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Add Entry'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        // onClick={() => navigate("/records")}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
