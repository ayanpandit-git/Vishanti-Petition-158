import ComplaintForm from "../components/ComplaintForm";

export default function NewComplaintPage() {
  return (
    <main className="container py-5 row justify-content-center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="mb-3">
          <h1 className="h2 fw-bold">Submit a complaint</h1>
          <p className="text-muted">
            Tell us about an issue so it can be reviewed.
          </p>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <ComplaintForm />
          </div>
        </div>
      </div>
    </main>
  );
}
