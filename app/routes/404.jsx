export default function NotFound() {
  return (
    <div className="page_error-crt p-4">
      <div className="page_error-tvsnow justify-center items-center">
        <div className="flex flex-col items-center bg-blue-500 p-5 rounded">
          <h1 className=" text-center text-zinc-200">404 - Page Not Found</h1>
          <p className="text-center">
            The page you're looking for doesn't exist.
          </p>
          <a className="" href="/">Return to Home</a>
        </div>
      </div>
    </div>
  );
}
