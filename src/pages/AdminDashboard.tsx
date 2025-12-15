import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, RefreshCw, Search, Loader2, ShieldAlert, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers"; 
import { CONTRACT_ADDRESS, CONTRACT_ABI, ADMIN_WALLET_ADDRESS } from "@/constants"; 

const AdminDashboard = () => {
  const { toast } = useToast();
  
  // --- AUTH STATE ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(false);

  // --- DASHBOARD STATE ---
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [applications, setApplications] = useState([
    {
      id: 1,
      businessName: "TechCorp Solutions",
      owner: "Rahul Sharma",
      walletAddress: "0x7299...40ff", 
      date: "2024-03-15",
      status: "Pending",
    },
    {
      id: 2,
      businessName: "Green Earth Foods",
      owner: "Anita Desai",
      walletAddress: "0x332a...9921",
      date: "2024-03-14",
      status: "Pending",
    }
  ]);

  // --- NEW: SYNC WITH BLOCKCHAIN ON LOAD ---
  useEffect(() => {
    const checkBlockchainData = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        // Get total count
        const count = await contract.licenseCount();
        const total = Number(count);

        // Fetch all issued business names from Blockchain
        const issuedNames = new Set();
        for (let i = 1; i <= total; i++) {
          const data = await contract.getLicense(i);
          issuedNames.add(data[1]); // data[1] is businessName
        }

        // Update local state: If business exists on-chain, mark as Approved
        setApplications(prevApps => prevApps.map(app => {
          if (issuedNames.has(app.businessName)) {
            return { ...app, status: "Approved" };
          }
          return app;
        }));

      } catch (err) {
        console.error("Blockchain Sync Error:", err);
      }
    };

    checkBlockchainData();
  }, []);

  // --- 1. SECURE LOGIN FUNCTION ---
  const handleAdminLogin = async () => {
    if (!window.ethereum) return alert("MetaMask is required!");
    
    setCheckingAuth(true);
    try {
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      setCurrentAddress(userAddress);

      // SECURITY CHECK: Compare connected wallet with the HARDCODED Admin Address
      if (userAddress.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()) {
        setIsAdmin(true);
        toast({ 
          title: "Admin Verified 🔓", 
          description: "Access granted to secure dashboard.",
          className: "bg-green-600 text-white" 
        });
      } else {
        setIsAdmin(false);
        toast({ 
          title: "Access Denied ⛔", 
          description: `Wallet ${userAddress.slice(0,6)}... is not the Admin.`, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Login Failed", description: "Could not connect to wallet.", variant: "destructive" });
    } finally {
      setCheckingAuth(false);
    }
  };

  // --- BLOCKCHAIN ACTIONS ---
  const handleApprove = async (id: number, businessName: string) => {
    try {
      setProcessingId(id);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const applicantAddress = await signer.getAddress(); // In real app, use app.walletAddress

      const tx = await contract.issueLicense(businessName, applicantAddress);
      
      toast({ title: "Minting License... ⏳", description: "Please wait for blockchain confirmation." });
      await tx.wait(); 

      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: "Approved" } : app
      ));
      toast({ title: "Success! ✅", description: "License minted on Blockchain.", className: "bg-green-600 text-white" });

    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed ❌", description: error.reason || error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (id: number) => {
    setApplications(applications.map(app => app.id === id ? { ...app, status: "Rejected" } : app));
    toast({ title: "Rejected ❌", variant: "destructive" });
  };

  const handleRevoke = async (id: number) => {
    if(!confirm("Revoke this license permanently?")) return;
    
    // Note: For real revocation, you'd need the License ID from the blockchain
    // For this UI demo, we just update the status
    setApplications(applications.map(app => app.id === id ? { ...app, status: "Revoked" } : app));
    toast({ title: "License Revoked ⚠️", variant: "destructive" });
  };

  // --- RENDER: LOGIN GATE (If not Admin) ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-slate-800">
            <CardHeader className="text-center">
              <div className="mx-auto bg-slate-100 p-4 rounded-full w-fit mb-4">
                <Lock className="h-10 w-10 text-slate-800" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Admin Verification</CardTitle>
              <CardDescription>
                This area is restricted to the Contract Owner. <br/>
                Please connect the <strong>Admin Wallet</strong> to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentAddress && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-center text-sm text-red-700">
                  <p className="font-bold">Access Denied</p>
                  <p>Connected: {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}</p>
                  <p>This wallet is not authorized.</p>
                </div>
              )}
              <Button 
                onClick={handleAdminLogin} 
                className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800"
                disabled={checkingAuth}
              >
                {checkingAuth ? <Loader2 className="animate-spin mr-2" /> : <><ShieldAlert className="mr-2 h-5 w-5" /> Verify Admin Identity</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD (Only if isAdmin === true) ---
  const stats = [
    { label: "Pending", count: applications.filter(a => a.status === "Pending").length, sub: "Action Required", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approved", count: applications.filter(a => a.status === "Approved").length, sub: "Total Minted", color: "text-green-600", bg: "bg-green-50" },
    { label: "Revoked", count: applications.filter(a => a.status === "Revoked").length, sub: "Action Taken", color: "text-red-600", bg: "bg-red-50" },
    { label: "Active", count: 342, sub: "Total issued", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
              <Badge className="bg-slate-900 text-white hover:bg-slate-800">SECURE MODE</Badge>
            </div>
            <p className="text-slate-500">Logged in as: <span className="font-mono text-xs">{currentAddress}</span></p>
          </div>
          <Button variant="outline" onClick={() => setIsAdmin(false)}>Disconnect</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className={`text-sm font-medium ${stat.color} mb-1`}>{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-slate-900">{stat.count}</h3>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{stat.sub}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Pending Apps", icon: FileText },
            { label: "Approved List", icon: CheckCircle },
            { label: "Revoke/Reject", icon: XCircle },
            { label: "Renewals", icon: RefreshCw },
            { label: "Verify", icon: Search },
          ].map((btn, i) => (
            <Button key={i} variant="outline" className="h-24 flex-col gap-2 bg-white hover:bg-slate-50 hover:border-blue-300">
              <btn.icon className="h-6 w-6 text-slate-600" />
              <span className="text-slate-700">{btn.label}</span>
            </Button>
          ))}
        </div>

        {/* Main Table */}
        <Card className="shadow-lg border-slate-200">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Pending Applications</h2>
            <p className="text-sm text-slate-500">Review requests. Actions are permanent on Blockchain.</p>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Business Name</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Decisions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="pl-6 font-medium">{app.businessName}</TableCell>
                    <TableCell>{app.owner}</TableCell>
                    <TableCell>{app.date}</TableCell>
                    <TableCell>
                      <Badge variant={
                        app.status === "Approved" ? "default" : 
                        app.status === "Rejected" ? "destructive" : 
                        app.status === "Revoked" ? "destructive" : "secondary"
                      }>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      
                      {app.status === "Pending" && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" variant="outline"
                            className="text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => handleReject(app.id)}
                            disabled={processingId !== null}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>

                          <Button 
                            size="sm" 
                            className="bg-slate-900 hover:bg-slate-800 text-white"
                            onClick={() => handleApprove(app.id, app.businessName)}
                            disabled={processingId !== null}
                          >
                            {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Mint"}
                          </Button>
                        </div>
                      )}

                      {app.status === "Approved" && (
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleRevoke(app.id)}>
                          Revoke
                        </Button>
                      )}

                      {(app.status === "Rejected" || app.status === "Revoked") && (
                        <span className="text-slate-400 text-sm italic">Case Closed</span>
                      )}

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;