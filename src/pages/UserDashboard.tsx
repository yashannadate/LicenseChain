import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Upload, Activity, RefreshCw, Download, 
  ShieldCheck, Bell, Loader2, X, PlusCircle 
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
  
  // State for the Application Status Popup
  const [showStatusModal, setShowStatusModal] = useState(false);

  // --- BLOCKCHAIN LOGIC ---
  useEffect(() => {
    checkWalletAndFetch();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
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

  const checkWalletAndFetch = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = await accounts[0].getAddress();
          setWalletAddress(address);
          fetchMyLicense(address, provider);
        }
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
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
        if (data[2].toLowerCase() === userAddress.toLowerCase()) {
          foundLicense = {
            id: data[0].toString(),
            businessName: data[1],
            issueDate: new Date(Number(data[3]) * 1000).toLocaleDateString(),
            expiryDate: new Date(Number(data[4]) * 1000).toLocaleDateString(),
            isValid: data[5],
            status: data[5] ? "Approved" : "Revoked"
          };
          break;
        }
      }
      setMyLicense(foundLicense);
    } catch (err) {
      console.error("Error fetching license:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
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

  // --- ACTIONS (Clean, Management tasks only) ---
  const actions = [
    { title: "Upload Documents", desc: "KYC & certificates", icon: Upload, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "View Application Status", desc: "Track progress", icon: Activity, color: "text-green-600", bg: "bg-green-50", onClick: () => setShowStatusModal(true) },
    { title: "Renew License", desc: "Extend validity", icon: RefreshCw, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Download NFT License", desc: "Get blockchain certificate", icon: Download, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Check Validity", desc: "View expiry details", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Notifications", desc: "View alerts", icon: Bell, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        
        {/* --- HEADER WITH PRIMARY ACTION BUTTON --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Dashboard</h1>
            <p className="text-slate-500">Manage your licenses and applications</p>
          </div>
          
          {/* THE NEW "BEST UI" BUTTON */}
          <Button 
            onClick={() => navigate("/apply")} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-105"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> 
            New Application
          </Button>
        </div>

        {/* --- ACTION GRID --- */}
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

        {/* --- RECENT ACTIVITY --- */}
        <h2 className="text-xl font-bold text-slate-900 mb-6">Active Licenses</h2>
        
        {!walletAddress ? (
           <div className="text-center py-10 bg-white rounded-lg border border-dashed">
             <Button onClick={checkWalletAndFetch}>Connect Wallet</Button>
           </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : myLicense ? (
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
              <p>No active licenses found.</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* --- POPUP MODAL --- */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
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
                <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300">In Review</Badge>
              </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Business Registration</h4>
                    <p className="text-xs text-slate-500">Submitted Jan 05, 2025</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-slate-500">Documents Received</Badge>
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;