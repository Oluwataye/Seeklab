import Link from "next/link"
import { ArrowLeft, Building, Users, Globe, Award, BookOpen } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="ml-[150px] p-6">
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <Building className="h-5 w-5 mr-2" />
          About DeskFlow
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              DeskFlow was founded in 2020 with a simple mission: to create powerful, intuitive business management
              software that helps organizations streamline their operations and achieve their goals.
            </p>
            <p className="text-gray-700 mb-4">
              What started as a small team of passionate developers has grown into a company serving businesses of all
              sizes across Nigeria and beyond. Our integrated business management platform combines inventory
              management, human resources, finance, and more into a single, cohesive system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-medium">Our Team</h3>
              </div>
              <p className="text-gray-700">
                Our diverse team brings together expertise in software development, business operations, and customer
                service. We're united by our commitment to creating solutions that make business management simpler and
                more efficient.
              </p>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-medium">Our Reach</h3>
              </div>
              <p className="text-gray-700">
                DeskFlow is proud to serve businesses across Nigeria and expanding throughout Africa. Our solutions are
                designed to address the unique challenges faced by businesses in emerging markets while maintaining
                global standards.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <Award className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="font-medium">Excellence</h4>
                </div>
                <p className="text-sm text-gray-700">
                  We strive for excellence in everything we do, from code quality to customer service.
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="font-medium">Collaboration</h4>
                </div>
                <p className="text-sm text-gray-700">
                  We believe in the power of teamwork and partnership with our clients.
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="font-medium">Innovation</h4>
                </div>
                <p className="text-sm text-gray-700">
                  We continuously innovate to provide cutting-edge solutions to business challenges.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="border rounded-lg p-6">
              <p className="mb-2">
                <strong>Address:</strong> 123 Business Avenue, Lagos, Nigeria
              </p>
              <p className="mb-2">
                <strong>Email:</strong> info@deskflow.com
              </p>
              <p className="mb-2">
                <strong>Phone:</strong> +234 123 456 7890
              </p>
              <p>
                <strong>Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/admin" className="inline-flex items-center text-red-600 hover:text-red-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
