import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <h1 className="text-9xl font-bold text-slate-200">404</h1>
      <div className="absolute mt-2">
        <h2 className="text-2xl font-bold text-slate-900">Page not found</h2>
        <p className="text-slate-500 mt-2 mb-6">This page doesn't exist.</p>
        
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;