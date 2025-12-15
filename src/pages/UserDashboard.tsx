import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, FileText, RefreshCw, CheckCircle, 
  XCircle, Clock, ExternalLink, Plus, ShieldCheck, Wallet 
} from "lucide-react";

// UI Components
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Constants
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";

// --- TYPES ---
interface MyLicense {
  id: number;
  name: string;
  status: "Pending" | "Approved" | "Rejected" | "Revoked";
  issueDate: string;
  expiryDate: string;
  ipfsHash: string;
}

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [myApps, setMyApps] = useState<MyLicense[]>([]);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  const checkIfWalletConnected = async () => {
    if (!window.ethereum) return;
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            setWallet(accounts[0].address);
            fetchMyLicenses(accounts[0].address, provider);
        }
    } catch (err) { console.error(err); }
  };

  // --- 2. CONNECT WALLET ---
  const connectWallet = async () => {
    if (!window.ethereum) return toast({ title: "Error", description: "MetaMask not found", variant: "destructive" });
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        const address = accounts[0];
        setWallet(address);
        fetchMyLicenses(address, provider);
        toast({ title: "Connected", description: "Wallet linked successfully." });
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  // --- 3. FETCH DATA ---
  const fetchMyLicenses = async (userAddr: string, provider: ethers.BrowserProvider) => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const count = Number(await contract.licenseCount());
      
      const apps: MyLicense[] = [];
      
      for (let i = 1; i <= count; i++) {
        const lic = await contract.getLicense(i);
        if (lic[9].toLowerCase() === userAddr.toLowerCase()) {
          apps.push({
            id: Number(lic[0]),
            name: lic[1],
            status: lic[12] as any, 
            issueDate: Number(lic[10]) > 0 ? new Date(Number(lic[10]) * 1000).toLocaleDateString() : "-",
            expiryDate: Number(lic[11]) > 0 ? new Date(Number(lic[11]) * 1000).toLocaleDateString() : "-",
            ipfsHash: lic[8]
          });
        }
      }
      setMyApps(apps.reverse());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!window.ethereum || !wallet) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    await fetchMyLicenses(wallet, provider);
    toast({ title: "Refreshed", description: "Dashboard updated." });
  };

  // --- RENDER: LOGIN GATE ---
  if (!wallet) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-600">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-50 p-4 rounded-full w-fit mb-4">
                <Wallet className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">User Dashboard</CardTitle>
              <CardDescription>Connect your wallet to view and manage your licenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={connectWallet} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-md">
                Connect MetaMask
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* --- TOP BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Dashboard</h1>
                <Badge className="bg-blue-600 text-white hover:bg-blue-700">APPLICANT</Badge>
            </div>
            <p className="text-slate-500 mt-1">Manage your digital licenses and applications.</p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* WALLET BADGE */}
             <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-mono text-slate-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {wallet.slice(0,6)}...{wallet.slice(-4)}
             </div>
             
             {/* SIMPLE REFRESH BUTTON */}
             <Button variant="outline" onClick={handleRefresh} disabled={loading} className="bg-white hover:bg-slate-50">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
             </Button>
          </div>
        </div>

        {/* --- ACTION BAR --- */}
        <div className="mb-10">
           <Button 
             onClick={() => navigate("/apply")} 
             className="bg-blue-600 hover:bg-blue-700 h-14 text-lg px-8 shadow-md hover:shadow-lg transition-all"
           >
             <Plus className="mr-2 h-5 w-5" /> Apply for New License
           </Button>
        </div>

        {/* --- LICENSE LIST --- */}
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2 border-b pb-4">
          <FileText className="h-5 w-5 text-slate-500" /> My Applications
        </h2>
        
        {loading && myApps.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
             <p className="text-slate-500">Syncing with Blockchain...</p>
           </div>
        ) : myApps.length === 0 ? (
           <Card className="border-dashed border-2 bg-slate-50/50 shadow-none">
             <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-700">No applications found</p>
                <p className="text-sm mb-6">You haven't submitted any license requests yet.</p>
                <Button variant="outline" onClick={() => navigate("/apply")}>Start Application</Button>
             </CardContent>
           </Card>
        ) : (
           <div className="grid gap-4">
             {myApps.map((app) => (
               <Card key={app.id} className="border-l-4 overflow-hidden bg-white shadow-sm" 
                     style={{ borderLeftColor: app.status === "Approved" ? "#16a34a" : app.status === "Rejected" ? "#dc2626" : "#3b82f6" }}>
                 <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                   
                   {/* LEFT: ICON & INFO */}
                   <div className="flex items-start gap-5 w-full md:w-auto">
                     <div className={`p-3 rounded-full shrink-0 ${
                        app.status === "Approved" ? "bg-green-50 text-green-600" :
                        app.status === "Rejected" ? "bg-red-50 text-red-600" :
                        "bg-blue-50 text-blue-600"
                     }`}>
                        {app.status === "Approved" ? <ShieldCheck className="h-8 w-8"/> : 
                         app.status === "Rejected" ? <XCircle className="h-8 w-8"/> : 
                         <Clock className="h-8 w-8"/>}
                     </div>
                     <div>
                       <h3 className="font-bold text-xl text-slate-900">{app.name}</h3>
                       <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">ID: #{app.id}</span>
                          {app.status === "Approved" && <span className="flex items-center text-green-700"><CheckCircle className="w-3 h-3 mr-1"/> Expires: {app.expiryDate}</span>}
                          {app.ipfsHash && (
                            <a href={app.ipfsHash} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 rounded">
                              <ExternalLink className="h-3 w-3" /> View Documents
                            </a>
                          )}
                       </div>
                     </div>
                   </div>

                   {/* RIGHT: STATUS & ACTION */}
                   <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between md:justify-center">
                      <Badge className={`text-sm py-1.5 px-4 ${
                        app.status === "Approved" ? "bg-green-600 hover:bg-green-700" :
                        app.status === "Rejected" ? "bg-red-600 hover:bg-red-700" :
                        "bg-blue-600 hover:bg-blue-700"
                      }`}>
                        {app.status}
                      </Badge>
                      
                      {app.status === "Pending" && (
                        <span className="text-xs text-slate-400 italic">Under Review</span>
                      )}
                      
                      {app.status === "Rejected" && (
                         <span className="text-xs text-red-500 font-medium">Contact Admin</span>
                      )}
                   </div>

                 </CardContent>
               </Card>
             ))}
           </div>
        )}

      </main>
    </div>
  );
};

export default UserDashboard;