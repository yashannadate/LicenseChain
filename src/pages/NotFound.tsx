import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50 text-center px-4">
      <h1 className="text-9xl font-bold text-slate-200 select-none">404</h1>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8">
        <p className="text-2xl font-semibold text-slate-900">Page not found</p>
        <p className="mt-2 mb-6 text-slate-500">The page you are looking for doesn't exist.</p>
        
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;