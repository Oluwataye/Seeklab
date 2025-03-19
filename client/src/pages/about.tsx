import { Link } from "wouter";
import { Shield, CheckCircle, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/public-header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <div className="relative bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Trusted Drug Abuse Diagnostics</h1>
          <p className="text-xl text-primary-foreground/80">
            Accurate, confidential testing since 2010
          </p>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We are committed to providing accurate, timely, and confidential drug testing
              services to help combat substance abuse and promote public health.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card>
              <CardContent className="pt-6">
                <Award className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Accuracy</h3>
                <p className="text-muted-foreground">
                  State-of-the-art equipment and rigorous quality control measures
                  ensure precise results.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Privacy</h3>
                <p className="text-muted-foreground">
                  HIPAA-compliant processes protect your confidential information
                  at every step.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <CheckCircle className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  Easy-to-use systems and clear communication make accessing your
                  results simple.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary">About Us</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary">Contact</Link>
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Seek Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}