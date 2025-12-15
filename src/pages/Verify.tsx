import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";

const Verify = () => {
  const [licenseId, setLicenseId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseId) return;
    
    setLoading(true);
    setSearched(true);
    setVerificationResult(null);
    setError("");

    try {
      // 1. Connect to Blockchain (Read-Only Mode)
      // We don't need a "Signer" (Wallet) to read data, just a Provider.
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        // Fallback if user has no MetaMask (Use a public RPC URL if needed, or alert)
        alert("MetaMask is required to read the blockchain.");
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // 2. Call the Smart Contract
      // Solidity Function: getLicense(uint256 _licenseId)
      const data = await contract.getLicense(licenseId);

      // 3. Format the Data (Solidity returns complex types)
      const formattedResult = {
        id: data[0].toString(),
        businessName: data[1],
        walletAddress: data[2],
        issueDate: new Date(Number(data[3]) * 1000).toLocaleDateString(), // Convert Timestamp
        expiryDate: new Date(Number(data[4]) * 1000).toLocaleDateString(),
        isValid: data[5]
      };

      setVerificationResult({
        isValid: formattedResult.isValid,
        licenseNumber: formattedResult.id,
        businessName: formattedResult.businessName,
        licenseType: "Business License", // This is static for now
        issueDate: formattedResult.issueDate,
        expiryDate: formattedResult.expiryDate,
        status: formattedResult.isValid ? "Active" : "Revoked"
      });

    } catch (err: any) {
      console.error(err);
      // If the ID doesn't exist, the contract usually reverts
      setError("License ID not found on Blockchain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Verify License Validity
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Enter a unique license ID below to verify its authenticity and status on the Ethereum blockchain.
            </p>
          </div>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">License Search</CardTitle>
              <CardDescription>
                Search by License ID (e.g., 101)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-grow">
                    <Label htmlFor="license-id" className="sr-only">License Number</Label>
                    <Input 
                      id="license-id" 
                      placeholder="Enter License ID (e.g., 101)"
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      className="h-12 text-lg bg-slate-50 border-slate-300 focus:border-blue-500"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" /> Verify Now
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {searched && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {error ? (
                 <Card className="border-2 border-red-100 shadow-md">
                   <CardContent className="p-6 text-center">
                     <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-slate-900 mb-2">License Not Found</h3>
                     <p className="text-slate-500">{error}</p>
                   </CardContent>
                 </Card>
              ) : (
                <Card className={`border-2 shadow-md ${verificationResult?.isValid ? 'border-green-100' : 'border-red-100'}`}>
                  <CardContent className="p-6 md:p-8">
                    
                    <div className={`flex items-center gap-4 p-4 rounded-lg mb-6 ${verificationResult?.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                      {verificationResult?.isValid ? (
                        <>
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-green-800">License Verified</h3>
                            <p className="text-green-700 text-sm">This license is authentic and active on the blockchain.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <XCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-red-800">Invalid License</h3>
                            <p className="text-red-700 text-sm">This license has been REVOKED.</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-slate-500 font-medium">License Number</p>
                        <p className="text-slate-900 font-semibold text-lg">#{verificationResult?.licenseNumber}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-500 font-medium">Current Status</p>
                        <Badge className={`${verificationResult?.isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-transparent px-3 py-1`}>
                          {verificationResult?.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <p className="text-slate-500 font-medium">Business Name</p>
                        <p className="text-slate-900 font-semibold text-base">{verificationResult?.businessName}</p>
                      </div>

                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <p className="text-slate-500 font-medium">License Type</p>
                        <p className="text-slate-900 font-medium">{verificationResult?.licenseType}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 col-span-2 grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-slate-500 font-medium mb-1">Issue Date</p>
                          <p className="text-slate-700">{verificationResult?.issueDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium mb-1">Expiry Date</p>
                          <p className="text-slate-700">{verificationResult?.expiryDate}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Verify;