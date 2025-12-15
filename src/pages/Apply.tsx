import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { ArrowLeft, Upload, Loader2, Wallet } from "lucide-react";

// --- WEB3 IMPORTS ---
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import { uploadToIPFS } from "../utils/uploadToIPFS"; 

const Apply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); 
  const [walletAddress, setWalletAddress] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    businessName: "",
    regNumber: "",
    address: "",
    email: "",
    description: ""
  });
  
  const [sector, setSector] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [kycFile, setKycFile] = useState<File | null>(null);

  // --- 1. CHECK WALLET ON LOAD ---
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
        }
      } catch (err) {
        console.error("Not connected yet");
      }
    }
  };

  // --- 2. MANUAL CONNECT FUNCTION ---
  const connectWallet = async () => {
    if (!window.ethereum) return toast({ title: "MetaMask missing", variant: "destructive" });
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // THIS LINE FORCES THE POPUP
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
    } catch (error) {
        console.error(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!sector || !licenseType || !kycFile) {
        toast({ title: "Missing Fields", description: "Please complete all fields.", variant: "destructive" });
        return;
    }

    setLoading(true);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
      }

      // --- CRITICAL FIX: FORCE CONNECTION BEFORE STARTING ---
      const provider = new ethers.BrowserProvider(window.ethereum);
      setStatus("Requesting Wallet Connection...");
      await provider.send("eth_requestAccounts", []); // <--- THIS OPENS METAMASK
      const signer = await provider.getSigner();

      // --- STEP 1: UPLOAD TO IPFS ---
      setStatus("Uploading KYC document to IPFS...");
      const ipfsUrl = await uploadToIPFS(kycFile);

      if (!ipfsUrl) throw new Error("File upload failed.");
      console.log("✅ IPFS Link:", ipfsUrl);

      // --- STEP 2: SEND TRANSACTION ---
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setStatus("Please Confirm Transaction in MetaMask...");
      console.log("Sending Transaction...");
      
      const tx = await contract.applyForLicense([
          formData.businessName,  
          formData.regNumber,     
          formData.email,         
          formData.address,       
          formData.description,   
          licenseType,            
          sector,                 
          ipfsUrl                 
      ]);

      setStatus("Transaction Sent! Waiting for Block Confirmation...");
      await tx.wait(); 

      toast({
        title: "Success! 🚀",
        description: "Application sent to Admin.",
        className: "bg-green-600 text-white",
      });
      
      navigate("/user-dashboard");

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.code === "ACTION_REJECTED" 
        ? "You rejected the request."
        : error.reason || error.message || "Transaction failed.";

      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Top Bar with Connect Button */}
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" className="pl-0" onClick={() => navigate("/user-dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {!walletAddress ? (
                <Button onClick={connectWallet} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                </Button>
            ) : (
                <div className="flex items-center gap-2 text-sm font-mono text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
                </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">New License Application</CardTitle>
              <CardDescription>Fill in the details to submit to the Blockchain.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Name & Reg No */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input name="businessName" placeholder="Tech Solutions Ltd" onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <Input name="regNumber" placeholder="GST-12345" onChange={handleInputChange} required />
                    </div>
                </div>

                {/* 2. Email */}
                <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" name="email" placeholder="contact@business.com" onChange={handleInputChange} required />
                </div>

                {/* 3. Address & Description */}
                <div className="space-y-2">
                    <Label>Physical Address</Label>
                    <Textarea name="address" placeholder="123 Block Chain St, Web3 City" onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea name="description" placeholder="Briefly describe your business activity..." onChange={handleInputChange} required />
                </div>

                {/* 4. Selectors */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>License Type</Label>
                        <Select onValueChange={setLicenseType} required>
                            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Business">Business Registration</SelectItem>
                                <SelectItem value="Trade">Trade License</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Sector</Label>
                        <Select onValueChange={setSector} required>
                            <SelectTrigger><SelectValue placeholder="Select Sector" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Food">Food & Beverage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 5. DOCUMENTS (IPFS) */}
                <div className="p-6 bg-slate-100 rounded-md border-2 border-dashed border-slate-300 text-center hover:bg-slate-200 transition relative">
                    <input 
                        type="file" 
                        onChange={(e) => setKycFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required 
                    />
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-slate-500" />
                        <span className="font-semibold text-sm text-slate-700">
                            {kycFile ? kycFile.name : "Click to Upload KYC Document"}
                        </span>
                        <span className="text-xs text-slate-400">PDF, JPG or PNG</span>
                    </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" disabled={loading}>
                    {loading ? (
                        <div className="flex items-center gap-2">
                             <Loader2 className="animate-spin h-5 w-5" /> {status}
                        </div>
                    ) : "Submit Application"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Apply;