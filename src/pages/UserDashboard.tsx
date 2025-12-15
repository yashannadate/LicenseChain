import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Upload, Activity, RefreshCw, Download, 
  ShieldCheck, Bell, Loader2, X, AlertTriangle 
} from "lucide-react";
import { ethers } from "ethers";
import { jsPDF } from "jspdf";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [myLicense, setMyLicense] = useState<any>(null);
  
  // --- RENEWAL STATE ---
  const [renewalDue, setRenewalDue] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // --- 1. MODIFIED EFFECT: AUTO-LOGIN REMOVED ---
  useEffect(() => {
    // We REMOVED 'checkWalletAndFetch()' from here.
    // The wallet will ONLY connect when the user clicks the button.

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          // If user switches accounts in MetaMask while already connected
          setWalletAddress(accounts[0]);
          fetchMyLicense(accounts[0], new ethers.BrowserProvider(window.ethereum));
        } else {
          setWalletAddress("");
          setMyLicense(null);
        }
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {}); 
      }
    };
  }, []);

  // --- 2. MANUAL CONNECT FUNCTION ---
  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // This forces the MetaMask popup to appear
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          fetchMyLicense(address, provider);
          toast({ title: "Connected", description: "Wallet connected successfully." });
        }
      } catch (err) {
        console.error("Wallet connection failed", err);
        toast({ title: "Connection Failed", description: "Please approve the connection in MetaMask.", variant: "destructive" });
      }
    } else {
      toast({ title: "MetaMask Not Found", description: "Please install MetaMask.", variant: "destructive" });
    }
  };

  const fetchMyLicense = async (userAddress: string, provider: any) => {
    setLoading(true);
    setMyLicense(null); 
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const count = await contract.licenseCount();
      const totalLicenses = Number(count);

      let foundLicense = null;
      for (let i = totalLicenses; i > 100; i--) {
        const data = await contract.getLicense(i);
        // Check if the connected wallet owns this license
        if (data[2].toLowerCase() === userAddress.toLowerCase()) {
            
          // --- SMART RENEWAL LOGIC ---
          const expiryTimestamp = Number(data[4]);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const thirtyDays = 30 * 24 * 60 * 60; // 30 days in seconds
          
          // Logic: If expiring in < 30 days AND currently valid
          if (expiryTimestamp - currentTimestamp < thirtyDays && data[5]) {
            setRenewalDue(true); // TRIGGER THE ALERT
          } else {
            setRenewalDue(false);
          }

          foundLicense = {
            id: data[0].toString(),
            businessName: data[1],
            issueDate: new Date(Number(data[3]) * 1000).toLocaleDateString(),
            expiryDate: new Date(Number(data[4]) * 1000).toLocaleDateString(),
            isValid: data[5],
            status: data[5] ? "Approved" : "Revoked"
          };
          break; // Stop loop once found
        }
      }
      setMyLicense(foundLicense);
    } catch (err) {
      console.error("Error fetching license:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = () => {
    toast({
      title: "Renewal Request Sent 🔄",
      description: "Your request has been forwarded to the Admin for approval.",
      className: "bg-blue-600 text-white"
    });
    setRenewalDue(false); 
  };

  const generatePDF = () => { //pdf generator
    if (!myLicense) return;
    const doc = new jsPDF();
    doc.setLineWidth(1); doc.rect(10, 10, 190, 277);
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text("Certificate of License", 105, 40, { align: "center" });
    doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.text("Verified on Ethereum Blockchain", 105, 50, { align: "center" });
    doc.line(50, 60, 160, 60);
    doc.setFontSize(16); doc.text("This certifies that", 105, 80, { align: "center" });
    doc.setFontSize(24); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 51, 102); doc.text(myLicense.businessName, 105, 95, { align: "center" });
    doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal"); doc.text(`is officially licensed under License ID #${myLicense.id}`, 105, 110, { align: "center" });
    let startY = 140; doc.setFontSize(12); doc.text(`Status: ${myLicense.status.toUpperCase()}`, 20, startY); doc.text(`Issue Date: ${myLicense.issueDate}`, 20, startY + 10); doc.text(`Expiry Date: ${myLicense.expiryDate}`, 20, startY + 20); doc.text(`Owner Address: ${walletAddress}`, 20, startY + 30);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.text(`Contract: ${CONTRACT_ADDRESS}`, 105, 260, { align: "center" });
    doc.save(`${myLicense.businessName}_License.pdf`);
    toast({ title: "Downloaded! 📄", description: "Certificate saved to your device." });
  };

  const actions = [
    { title: "Upload Documents", desc: "KYC & certificates", icon: Upload, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "View Application Status", desc: "Track progress", icon: Activity, color: "text-green-600", bg: "bg-green-50", onClick: () => setShowStatusModal(true) },
    { title: "Renew License", desc: "Extend validity", icon: RefreshCw, color: "text-orange-600", bg: "bg-orange-50", onClick: handleRenew }, 
    { title: "Download NFT License", desc: "Get blockchain certificate", icon: Download, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Check Validity", desc: "View expiry details", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Notifications", desc: "View alerts", icon: Bell, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Dashboard</h1>
            <p className="text-slate-500">Manage your licenses and applications</p>
          </div>
          {/* --- TOP RIGHT CONNECT INDICATOR --- */}
          {walletAddress && (
             <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 font-mono text-sm">
               Connected: {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
             </div>
          )}
        </div>

       
        {renewalDue && ( //renewal alert
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">License Expiring Soon</h3>
                <p className="text-sm text-amber-700">Your license is set to expire on <b>{myLicense?.expiryDate}</b>. Please renew to maintain validity.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100" onClick={() => setRenewalDue(false)}>Dismiss</Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRenew}>Accept & Renew</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {actions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-all cursor-pointer border-slate-200 group" onClick={action.onClick}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-lg ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{action.title}</h3>
                  <p className="text-sm text-slate-500">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-6">Active Licenses</h2>
        
       
        {!walletAddress ? (
           <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
             <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <ShieldCheck className="h-6 w-6 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900 mb-2">Wallet Not Connected</h3>
             <p className="text-slate-500 mb-6 max-w-md mx-auto">Please connect your MetaMask wallet to view your digital trade licenses.</p>
             <Button onClick={handleConnectWallet} className="bg-blue-600 hover:bg-blue-700">
               Connect Wallet
             </Button>
           </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {myLicense ? (
              <Card className={`border-l-4 ${myLicense.status === "Approved" ? "border-l-green-500" : "border-l-red-500"}`}>
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${myLicense.status === "Approved" ? "bg-green-100" : "bg-red-100"}`}>
                      <ShieldCheck className={`h-6 w-6 ${myLicense.status === "Approved" ? "text-green-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{myLicense.businessName}</h3>
                      <p className="text-sm text-slate-500">License #{myLicense.id} • Issued on {myLicense.issueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={myLicense.status === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {myLicense.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={generatePDF} className="gap-2">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="text-center py-10 text-slate-500">
                  <p>No active licenses found for this wallet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* MODAL for Application Status */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>Application Status</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowStatusModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full">
                    <Activity className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Trade License Application</h4>
                    <p className="text-xs text-slate-500">ID #Pending • Submitted Jan 10, 2025</p>
                  </div>
                </div>
                <Badge className="bg-yellow-200 text-yellow-800">In Review</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;