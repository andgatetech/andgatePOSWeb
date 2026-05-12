import ExpenseEditForm from './ExpenseEditForm';
export default function Page({ params }: { params: { id: string } }) {
    return <ExpenseEditForm id={Number(params.id)} />;
}
