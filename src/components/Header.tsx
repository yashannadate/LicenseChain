import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, X, Wallet } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Helper: Format wallet address (0x12...3456)
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Connection failed", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  // Check connection on load
  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setWalletAddress(window.ethereum.selectedAddress);
    }
  }, []);

  // minimal active link style
  const navClass = (path: string) => 
    location.pathname === path 
      ? "text-sm font-semibold text-slate-900" 
      : "text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-slate-900 tracking-tight">LicenseChain</span>
        </Link>

        {/* --- DESKTOP NAV --- */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={navClass("/")}>Home</Link>
          <Link to="/apply" className={navClass("/apply")}>Apply</Link>
          <Link to="/verify" className={navClass("/verify")}>Verify</Link>
          <Link to="/user-dashboard" className={navClass("/user-dashboard")}>Dashboard</Link>
          <Link to="/admin" className={navClass("/admin")}>Admin</Link>
        </nav>

        {/* --- WALLET BUTTON --- */}
        <div className="hidden md:flex items-center">
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-slate-600">{formatAddress(walletAddress)}</span>
            </div>
          ) : (
            <Button 
              onClick={connectWallet} 
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-600"
            >
              <Wallet className="mr-2 h-4 w-4" /> Connect
            </Button>
          )}
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button 
          className="md:hidden text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4">
          <nav className="flex flex-col gap-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">Home</Link>
            <Link to="/apply" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">Apply</Link>
            <Link to="/verify" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">Verify License</Link>
            <Link to="/user-dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">Dashboard</Link>
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">Admin Portal</Link>
          </nav>
          <Button onClick={connectWallet} className="w-full bg-slate-900 text-white hover:bg-slate-800">
            {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;