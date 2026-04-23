function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children && <div style={{ display: "flex", gap: 8 }}>{children}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
