export type Lembur = {
    id: string;
    start_date: string;
    finish_date: string;
    description: string;
    person: string;
    status: 'Pending' | 'Compensated' | 'Not Compensated';
    created_at: string;
};
