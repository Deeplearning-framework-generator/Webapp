import { Link } from "react-router-dom";

/**
 * Blocks page, URL: "/blocks"
 * Rendered inside AppLayout's <Outlet />.
 * Placeholder for now; the real content comes later.
 */
export default function BlocksPage() {
  return (
    <div>
      <h1 className="text-[26px] font-semibold">Blocks</h1>
      <p className="text-sm text-muted">
        Your library. Datasets are blocks too, and every block can be used in any project.
      </p>
      <Link
          to="/blocks/new"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          + New block
        </Link>
    </div>
  )
}
