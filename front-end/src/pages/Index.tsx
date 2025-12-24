import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Zap, Lock, Globe, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "Blockchain Secured",
    desc: "Tamper-proof records secured permanently on the Ethereum network.",
    icon: ShieldCheck,
  },
  {
    title: "Instant Verification",
    desc: "Verify any license globally in seconds using a smart ID system.",
    icon: Zap,
  },
  {
    title: "Encrypted Privacy",
    desc: "Enterprise-grade encryption ensures applicant data remains private.",
    icon: Lock,
  },
  {
    title: "Global Accessibility",
    desc: "Access digital certificates from anywhere, anytime, on any device.",
    icon: Globe,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow">
        
        {/* --- HERO SECTION --- */}
        <section className="relative py-32 bg-slate-50 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Blockchain-Powered <br className="hidden md:block" />
              <span className="text-blue-600">Digital Licensing System</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              Apply for business licenses securely and transparently. <br />
              Eliminate paperwork with immutable blockchain records.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              <Link to="/apply">
                <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/10 transition-all hover:scale-105">
                  Apply for License <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/verify">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-10 text-lg text-slate-700 border-slate-300 hover:bg-white hover:text-blue-600 hover:border-blue-600 transition-all"
                >
                  Verify Validity
                </Button>
              </Link>
            </div>

            {/* Simple Trust Indicators */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500 font-medium animate-in fade-in duration-1000 delay-300">
              <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Tamper Proof</span>
              <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Paperless</span>
              <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Secure</span>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why LicenseChain?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Modern web capability meets decentralized security.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-500 leading-relaxed mt-2">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- MINIMAL FOOTER CTA --- */}
        <section className="py-20 bg-slate-900 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Ready to Digitalize?</h2>
            <p className="text-slate-400 mb-8">Join the new standard of trust.</p>
            <Link to="/apply">
              <Button size="lg" className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">L</div>
            <span className="font-bold text-slate-900">LicenseChain</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 Final Year Project.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;