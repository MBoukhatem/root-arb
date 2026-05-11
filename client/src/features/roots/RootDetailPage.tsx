import { useParams } from 'react-router-dom';

export default function RootDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main id="main" className="p-6">
      <h1 className="text-2xl font-semibold">Racine : {id}</h1>
      <p className="text-(--text-muted)">RootTree D3 - stub (S2 J4).</p>
    </main>
  );
}
