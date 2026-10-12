export function HistorySummaryTable({
  periodLabel,
  summaries,
}: {
  periodLabel: string;
  summaries: Array<{
    id: string;
    name: string;
    latest: number | null;
    highest: number | null;
    lowest: number | null;
  }>;
}) {
  return (
    <table className="visually-hidden">
      <caption>E. coli summary for the past {periodLabel}</caption>
      <thead>
        <tr>
          <th scope="col">Station</th>
          <th scope="col">Latest</th>
          <th scope="col">Highest</th>
          <th scope="col">Lowest</th>
        </tr>
      </thead>
      <tbody>
        {summaries.map((summary) => (
          <tr key={summary.id}>
            <th scope="row">{summary.name}</th>
            <td>{summary.latest ?? "—"}</td>
            <td>{summary.highest ?? "—"}</td>
            <td>{summary.lowest ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
