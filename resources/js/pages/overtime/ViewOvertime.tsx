import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Lembur } from '@/types/lembur';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    ListChecks,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SortField = 'created_at' | 'start_date' | 'finish_date' | 'duration';
type SortOrder = 'asc' | 'desc';

interface PaginationData {
    current_page: number;
    data: Lembur[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Filters {
    search: string;
    status: string;
    sort_field: string;
    sort_order: string;
}

export default function ViewOvertime({
    entries: paginatedEntries,
    filters,
}: {
    entries: PaginationData;
    filters: Filters;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [sortField, setSortField] = useState<SortField>(
        filters.sort_field as SortField,
    );
    const [sortOrder, setSortOrder] = useState<SortOrder>(
        filters.sort_order as SortOrder,
    );
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        router.get(
            url,
            {
                search: searchTerm,
                status: statusFilter,
                sort_field: sortField,
                sort_order: sortOrder,
                per_page: paginatedEntries.per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/list',
                {
                    search: searchTerm,
                    status: statusFilter,
                    sort_field: sortField,
                    sort_order: sortOrder,
                    per_page: paginatedEntries.per_page,
                },
                { preserveState: true, preserveScroll: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [
        searchTerm,
        statusFilter,
        sortField,
        sortOrder,
        paginatedEntries.per_page,
    ]);

    const handleStatusUpdate = (id: string, newStatus: string) => {
        const loadingToastId = toast.loading('Updating status...');

        router.put(
            `/entries/${id}`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status updated successfully', {
                        id: loadingToastId,
                    });
                },
                onError: () => {
                    toast.error('Failed to update status', {
                        id: loadingToastId,
                    });
                },
            },
        );
    };

    const handleDelete = () => {
        if (!deleteId) return;
        const loadingToastId = toast.loading('Deleting lembur...');
        router.delete(`/entries/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Entry deleted successfully', {
                    id: loadingToastId,
                });
                setDeleteId(null);
            },
            onError: () => {
                toast.error('Failed to delete entry', { id: loadingToastId });
            },
        });
    };

    const toggleSort = (field: SortField) => {
        const newSortOrder =
            sortField === field
                ? sortOrder === 'asc'
                    ? 'desc'
                    : 'asc'
                : 'asc';

        router.get(
            '/list',
            {
                search: searchTerm,
                status: statusFilter,
                sort_field: field,
                sort_order: newSortOrder,
                per_page: paginatedEntries.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSortField(field);
                    setSortOrder(newSortOrder);
                },
            },
        );
    };

    const calculateDuration = (start: string, finish: string) => {
        const startDate = new Date(start);
        const finishDate = new Date(finish);

        const totalMinutes = Math.floor(
            (finishDate.getTime() - startDate.getTime()) / (1000 * 60),
        );

        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }
        return `${hours}h ${minutes}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Compensated':
                return 'bg-success text-success-foreground';
            case 'Not Compensated':
                return 'bg-destructive text-destructive-foreground';
            default:
                return 'bg-warning text-warning-foreground';
        }
    };

    return (
        <div className="bg-gradient-subtle min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <Card className="border-border shadow-lg">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <ListChecks className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                List Lembur
                            </CardTitle>
                        </div>
                        <CardDescription>
                            View dan manage list lembur.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by person or description..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent className="z-50 bg-popover">
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
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

                                <Select
                                    value={paginatedEntries.per_page.toString()}
                                    onValueChange={(value) => {
                                        router.get(
                                            '/list',
                                            { per_page: value },
                                            { preserveState: true },
                                        );
                                    }}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-50 bg-popover">
                                        <SelectItem value="5">
                                            5 / page
                                        </SelectItem>
                                        <SelectItem value="10">
                                            10 / page
                                        </SelectItem>
                                        <SelectItem value="25">
                                            25 / page
                                        </SelectItem>
                                        <SelectItem value="50">
                                            50 / page
                                        </SelectItem>
                                        <SelectItem value="100">
                                            100 / page
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {paginatedEntries.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border p-12 text-center">
                                <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    No entries found
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Start by adding your first overtime entry'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleSort('created_at')
                                                    }
                                                    className="h-8 font-semibold"
                                                >
                                                    Input Date
                                                    <ArrowUpDown className="ml-2 h-3 w-3" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>Person</TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleSort('start_date')
                                                    }
                                                    className="h-8 font-semibold"
                                                >
                                                    Start Time
                                                    <ArrowUpDown className="ml-2 h-3 w-3" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleSort(
                                                            'finish_date',
                                                        )
                                                    }
                                                    className="h-8 font-semibold"
                                                >
                                                    Finish Time
                                                    <ArrowUpDown className="ml-2 h-3 w-3" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleSort('duration')
                                                    }
                                                    className="h-8 font-semibold"
                                                >
                                                    Duration
                                                    <ArrowUpDown className="ml-2 h-3 w-3" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Description
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedEntries.data.map((entry) => (
                                            <TableRow
                                                key={entry.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    {format(
                                                        new Date(
                                                            entry.created_at,
                                                        ),
                                                        'MMM dd, yyyy',
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {entry.person}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {format(
                                                        new Date(
                                                            entry.start_date,
                                                        ),
                                                        'MMM dd, yyyy HH:mm',
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {format(
                                                        new Date(
                                                            entry.finish_date,
                                                        ),
                                                        'MMM dd, yyyy HH:mm',
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">
                                                    {calculateDuration(
                                                        entry.start_date,
                                                        entry.finish_date,
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden w-full max-w-xs text-sm text-muted-foreground md:table-cell">
                                                    <div className="break-words whitespace-normal">
                                                        {entry.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={entry.status}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            handleStatusUpdate(
                                                                entry.id,
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-[140px] border-0 focus:ring-0">
                                                            <Badge
                                                                className={cn(
                                                                    'pointer-events-none',
                                                                    getStatusColor(
                                                                        entry.status,
                                                                    ),
                                                                )}
                                                            >
                                                                {entry.status}
                                                            </Badge>
                                                        </SelectTrigger>
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
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDeleteId(
                                                                entry.id,
                                                            )
                                                        }
                                                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {paginatedEntries.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {paginatedEntries.from} to{' '}
                                    {paginatedEntries.to} of{' '}
                                    {paginatedEntries.total} entries
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(
                                                paginatedEntries.prev_page_url,
                                            )
                                        }
                                        disabled={
                                            !paginatedEntries.prev_page_url
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex gap-1">
                                        {paginatedEntries.links
                                            .filter(
                                                (link) =>
                                                    link.label !==
                                                        '&laquo; Previous' &&
                                                    link.label !==
                                                        'Next &raquo;',
                                            )
                                            .map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={
                                                        link.active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            link.url,
                                                        )
                                                    }
                                                    disabled={!link.url}
                                                    className="min-w-[40px]"
                                                >
                                                    {link.label}
                                                </Button>
                                            ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(
                                                paginatedEntries.next_page_url,
                                            )
                                        }
                                        disabled={
                                            !paginatedEntries.next_page_url
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this overtime entry?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
