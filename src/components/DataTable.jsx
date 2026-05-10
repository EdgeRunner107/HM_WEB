function DataTable({ title, description, columns, rows }) {
  return (
    <section className="table-panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-head__title">{title}</h3>
          <p className="panel-head__description">{description}</p>
        </div>
        <div className="panel-head__meta">총 {rows.length}행</div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column, index) => (
                  <td key={`${row.id}-${column.key}`} className={index === 0 ? 'table-emphasis' : ''}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DataTable;
