import { Link } from "wouter";
import { Home, Mail, Shield, CheckCircle, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Seek Labs
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-sm hover:text-primary">
                <Home className="h-4 w-4 inline mr-1" />
                Home
              </Link>
              <Link href="/about" className="text-sm hover:text-primary font-medium">About Us</Link>
              <Link href="/contact" className="text-sm hover:text-primary">Contact</Link>
              <Link href="/privacy" className="text-sm hover:text-primary">Privacy Policy</Link>
            </nav>
          </div>
          <Link href="/auth" className="text-sm text-primary hover:underline">
            Lab Staff Login
          </Link>
        </div>
      </header>

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

      {/* Services List */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
          <ul className="max-w-2xl mx-auto space-y-4 text-lg">
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
              <span>Comprehensive opioid and substance detection panels</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
              <span>Specialized testing programs for youth and adult populations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
              <span>Direct collaboration with healthcare providers and clinicians</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-3 text-primary flex-shrink-0 mt-1" />
              <span>Rapid result delivery through our secure online portal</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Compliance Badges */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-12">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="font-semibold">HIPAA Compliant</p>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="font-semibold">SAMHSA Certified</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="font-semibold">GDPR Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
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
