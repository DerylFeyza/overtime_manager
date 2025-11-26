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
import { Skeleton } from '@/components/ui/skeleton';
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

export default function ViewOvertime({
    entries: paginatedEntries,
}: {
    entries: PaginationData;
}) {
    const [entries, setEntries] = useState<Lembur[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<Lembur[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        try {
            setEntries(paginatedEntries.data);
            setFilteredEntries(paginatedEntries.data);
        } catch (error) {
            console.error('Error fetching entries:', error);
            toast.error('Failed to load overtime entries');
        } finally {
            setIsLoading(false);
        }
    }, [paginatedEntries]);

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        let filtered = [...entries];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (entry) =>
                    entry.person
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    entry.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(
                (entry) => entry.status === statusFilter,
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortField === 'created_at') {
                comparison =
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime();
            } else if (sortField === 'start_date') {
                comparison =
                    new Date(a.start_date).getTime() -
                    new Date(b.start_date).getTime();
            } else if (sortField === 'finish_date') {
                comparison =
                    new Date(a.finish_date).getTime() -
                    new Date(b.finish_date).getTime();
            } else if (sortField === 'duration') {
                const durationA =
                    new Date(a.finish_date).getTime() -
                    new Date(a.start_date).getTime();
                const durationB =
                    new Date(b.finish_date).getTime() -
                    new Date(b.start_date).getTime();
                comparison = durationA - durationB;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredEntries(filtered);
    }, [entries, searchTerm, statusFilter, sortField, sortOrder]);

    // const handleStatusUpdate = async (id: string, newStatus: string) => {
    //   try {
    //     const { error } = await supabase
    //       .from("overtime_entries")
    //       .update({ status: newStatus })
    //       .eq("id", id);

    //     if (error) throw error;

    //     setEntries((prev) =>
    //       prev.map((entry) => (entry.id === id ? { ...entry, status: newStatus as any } : entry))
    //     );
    //     toast.success("Status updated successfully");
    //   } catch (error) {
    //     console.error("Error updating status:", error);
    //     toast.error("Failed to update status");
    //   }
    // };

    // const handleDelete = async () => {
    //   if (!deleteId) return;

    //   try {
    //     const { error } = await supabase.from("overtime_entries").delete().eq("id", deleteId);

    //     if (error) throw error;

    //     setEntries((prev) => prev.filter((entry) => entry.id !== deleteId));
    //     toast.success("Entry deleted successfully");
    //   } catch (error) {
    //     console.error("Error deleting entry:", error);
    //     toast.error("Failed to delete entry");
    //   } finally {
    //     setDeleteId(null);
    //   }
    // };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
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
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredEntries.length === 0 ? (
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
                                        {filteredEntries.map((entry) => (
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
                                                <TableCell className="hidden max-w-xs text-sm text-muted-foreground md:table-cell">
                                                    <div className="break-words whitespace-normal">
                                                        {entry.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={entry.status}
                                                        // onValueChange={(value) => handleStatusUpdate(entry.id, value)}
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
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
