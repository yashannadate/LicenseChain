import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";

const Apply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate a network request
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Application Submitted",
        description: "Your application is now under review.",
        className: "bg-green-600 text-white",
      });
      navigate("/user-dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Simple Back Button */}
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 text-slate-500 hover:text-slate-900" 
            onClick={() => navigate("/user-dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">New License Application</CardTitle>
              <CardDescription>Fill in the details below to request a new blockchain license.</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. License Details */}
                <div className="space-y-2">
                  <Label>License Type</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a license type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business License</SelectItem>
                      <SelectItem value="trade">Trade License</SelectItem>
                      <SelectItem value="food">Food Safety License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Business Info (Side by Side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input placeholder="e.g. My Company Ltd" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Number</Label>
                    <Input placeholder="e.g. REG-1234" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Textarea placeholder="Enter full address" required />
                </div>

                {/* 3. Contact Info (Side by Side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input placeholder="Full Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="name@email.com" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input type="tel" placeholder="+91 99999 00000" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="service">Services</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 4. Description */}
                <div className="space-y-2">
                  <Label>Business Description</Label>
                  <Textarea placeholder="Short description of your business activities..." rows={3} required />
                </div>

                {/* 5. Documents Section */}
                <div className="pt-2">
                  <h3 className="text-sm font-semibold mb-3">Required Documents</h3>
                  <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">KYC Document</Label>
                      <Input type="file" accept=".pdf,.jpg" className="bg-white" required />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">Business Certificate</Label>
                      <Input type="file" accept=".pdf,.jpg" className="bg-white" required />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">Tax Registration</Label>
                      <Input type="file" accept=".pdf,.jpg" className="bg-white" required />
                    </div>

                    {/* Restored Optional Field */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">Additional Documents (Optional)</Label>
                      <Input type="file" accept=".pdf,.jpg" multiple className="bg-white" />
                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/user-dashboard")}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Apply;