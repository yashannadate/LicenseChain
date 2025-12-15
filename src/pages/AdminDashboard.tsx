import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { 
  FileText, CheckCircle, XCircle, RefreshCw, Search, 
  Loader2, ShieldAlert, Lock, LogOut, Wallet, Eye, ExternalLink 
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, ADMIN_WALLET_ADDRESS } from "@/constants";

interface Application {
  id: number;
  businessName: string;
  regNumber: string;
  sector: string;
  applicant: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected" | "Revoked";
  ipfsHash: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (isAdmin) fetchBlockchainData();
  }, [isAdmin]);

  // --- FORCE POPUP LOGIN ---
  const handleLogin = async () => {
    if (!window.ethereum) return toast({ title: "Error", description: "MetaMask not found", variant: "destructive" });
    
    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // ⚠️ FORCE METAMASK POPUP
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setCurrentAddress(address);

      if (address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()) {
        setIsAdmin(true);
        toast({ title: "Welcome Admin 🔓", className: "bg-green-600 text-white" });
      } else {
        toast({ title: "Access Denied ⛔", description: "Wallet is not authorized.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchBlockchainData = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const count = Number(await contract.licenseCount());
      const data: Application[] = [];

      for (let i = count; i >= 1; i--) {
        const lic = await contract.getLicense(i);
        data.push({
          id: Number(lic[0]),
          businessName: lic[1],
          regNumber: lic[2],
          sector: lic[7],
          ipfsHash: lic[8],
          applicant: lic[9],
          date: lic[10] > 0 ? new Date(Number(lic[10]) * 1000).toLocaleDateString() : "New Request",
          status: lic[12]
        });
      }
      setApplications(data);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject" | "revoke") => {
    try {
      setProcessingId(id);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      let tx;
      if (action === "approve") tx = await contract.approveLicense(id);
      else if (action === "reject") tx = await contract.rejectLicense(id);
      else if (action === "revoke") {
        if (!confirm("Are you sure?")) { setProcessingId(null); return; }
        tx = await contract.revokeLicense(id);
      }

      toast({ title: "Processing...", description: "Please sign in MetaMask." });
      await tx.wait(); 
      toast({ title: "Success!", description: `License ${action}ed successfully.` });
      fetchBlockchainData();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed", description: error.reason || error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const stats = useMemo(() => [
    { label: "Pending", count: applications.filter(a => a.status === "Pending").length, sub: "Action Required", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approved", count: applications.filter(a => a.status === "Approved").length, sub: "Total Minted", color: "text-green-600", bg: "bg-green-50" },
    { label: "Revoked", count: applications.filter(a => a.status === "Revoked").length, sub: "Action Taken", color: "text-red-600", bg: "bg-red-50" },
    { label: "Active", count: applications.length, sub: "Total issued", color: "text-purple-600", bg: "bg-purple-50" },
  ], [applications]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-t-4 border-slate-900">
            <CardHeader className="text-center">
              <div className="mx-auto bg-slate-100 p-4 rounded-full w-fit mb-4"><Lock className="h-10 w-10 text-slate-800" /></div>
              <CardTitle className="text-2xl font-bold text-slate-900">Admin Verification</CardTitle>
              <CardDescription>Connect the Admin Wallet to proceed.</CardDescription>
            </CardHeader>
            <CardContent>
              {currentAddress && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-center text-sm text-red-700">
                  <p className="font-bold">Access Denied</p>
                </div>
              )}
              <Button onClick={handleLogin} className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800" disabled={isConnecting}>
                {isConnecting ? <Loader2 className="animate-spin mr-2" /> : <><ShieldAlert className="mr-2 h-5 w-5" /> Verify Admin Identity</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
              <Badge className="bg-slate-900 text-white">SECURE MODE</Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">Logged in as: <span className="font-mono bg-slate-200 px-1 rounded">{currentAddress}</span></p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={fetchBlockchainData} disabled={processingId !== null}>
               <RefreshCw className={`mr-2 h-4 w-4 ${processingId ? 'animate-spin' : ''}`} /> Refresh
             </Button>
             <Button variant="outline" onClick={() => setIsAdmin(false)}>Disconnect</Button>
          </div>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[{ label: "Pending Apps", icon: FileText }, { label: "Approved List", icon: CheckCircle }, { label: "Revoke/Reject", icon: XCircle }, { label: "Renewals", icon: RefreshCw }, { label: "Verify", icon: Search }].map((btn, i) => (
            <Button key={i} variant="outline" className="h-24 flex-col gap-2 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm">
              <btn.icon className="h-6 w-6 text-slate-600" /><span className="text-slate-700 font-medium">{btn.label}</span>
            </Button>
          ))}
        </div>

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
                {applications.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">No applications found on Blockchain yet.</TableCell></TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="pl-6 font-medium text-slate-900">{app.businessName}</TableCell>
                      <TableCell><div className="text-sm">{app.applicant.slice(0,6)}...{app.applicant.slice(-4)}</div><div className="text-xs text-slate-400">{app.sector}</div></TableCell>
                      <TableCell>{app.date}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === "Approved" ? "default" : app.status === "Rejected" ? "destructive" : app.status === "Revoked" ? "destructive" : "secondary"}>{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2 items-center">
                            <Dialog>
                                <DialogTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><Eye className="h-4 w-4 text-slate-500"/></Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>{app.businessName}</DialogTitle></DialogHeader>
                                    <div className="space-y-2 text-sm"><p><strong>Reg No:</strong> {app.regNumber}</p><p><strong>Sector:</strong> {app.sector}</p><p><strong>Address:</strong> {app.applicant}</p><p><strong>Proof:</strong> {app.ipfsHash ? (<a href={app.ipfsHash} target="_blank" className="ml-2 text-blue-600 underline inline-flex items-center">View IPFS <ExternalLink className="h-3 w-3 ml-1"/></a>) : " No Doc"}</p></div>
                                </DialogContent>
                            </Dialog>
                            {app.status === "Pending" && (
                              <>
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleAction(app.id, "reject")} disabled={processingId === app.id}>Reject</Button>
                                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => handleAction(app.id, "approve")} disabled={processingId === app.id}>{processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Mint"}</Button>
                              </>
                            )}
                            {app.status === "Approved" && (<Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleAction(app.id, "revoke")}>Revoke</Button>)}
                            {(app.status === "Rejected" || app.status === "Revoked") && (<span className="text-slate-400 text-sm italic pr-2">Closed</span>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;