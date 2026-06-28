import { Link } from "react-router-dom";

export default function PageShell({
  eyebrow,
  title,
  description,
  actions,
  aside,
  children
}) {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="page-hero-copy">
          <Link to="/" className="back-link">
            ← Trở về Dashboard
          </Link>

          {eyebrow && (
            <span className="page-eyebrow">{eyebrow}</span>
          )}

          <h1>{title}</h1>

          {description && (
            <p className="page-description">
              {description}
            </p>
          )}

          {actions && (
            <div className="page-actions">
              {actions}
            </div>
          )}
        </div>

        {aside && (
          <aside className="page-hero-aside">
            {aside}
          </aside>
        )}
      </section>

      <section className="page-content">
        {children}
      </section>
    </main>
  );
}
