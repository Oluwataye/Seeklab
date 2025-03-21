import { Link } from "wouter";
import { Shield, CheckCircle, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/public-layout";

export default function AboutPage() {
  return (
    <PublicLayout>

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
    </PublicLayout>
  );
}