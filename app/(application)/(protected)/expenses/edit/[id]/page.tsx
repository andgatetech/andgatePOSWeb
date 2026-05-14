import ExpenseEditForm from './ExpenseEditForm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <ExpenseEditForm id={Number(id)} />;
}
