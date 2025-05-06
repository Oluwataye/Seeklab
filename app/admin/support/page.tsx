import Link from "next/link"
import { ArrowLeft, LifeBuoy, MessageSquare, FileQuestion, BookOpen, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function SupportPage() {
  return (
    <div className="ml-[150px] p-6">
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <LifeBuoy className="h-5 w-5 mr-2" />
          Support Center
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How Can We Help You?</h2>
            <p className="text-gray-700 mb-4">
              Our support team is here to help you get the most out of DeskFlow. Browse through our resources or contact
              us directly for assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-lg font-medium">Live Chat</h3>
              </div>
              <p className="text-gray-700 mb-4">Chat with our support team in real-time during business hours.</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">Start Chat</Button>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <FileQuestion className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-lg font-medium">FAQs</h3>
              </div>
              <p className="text-gray-700 mb-4">Find answers to commonly asked questions about DeskFlow.</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">View FAQs</Button>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-lg font-medium">Documentation</h3>
              </div>
              <p className="text-gray-700 mb-4">Access detailed guides and documentation for all features.</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">View Docs</Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-red-600 mr-2" />
                  <h4 className="text-lg font-medium">Email Support</h4>
                </div>
                <p className="text-gray-700 mb-2">Send us an email and we'll respond within 24 hours.</p>
                <p className="text-red-600 font-medium">support@deskflow.com</p>
              </div>

              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <Phone className="h-6 w-6 text-red-600 mr-2" />
                  <h4 className="text-lg font-medium">Phone Support</h4>
                </div>
                <p className="text-gray-700 mb-2">Call us during business hours for immediate assistance.</p>
                <p className="text-red-600 font-medium">+234 123 456 7890</p>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Submit a Support Ticket</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input id="subject" placeholder="Enter subject" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea id="message" placeholder="Describe your issue in detail" rows={5} />
                </div>

                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Submit Ticket
                </Button>
              </form>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Support Hours</h2>
            <div className="border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Regular Hours</h4>
                  <p className="text-gray-700">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p className="text-gray-700">Saturday: 9:00 AM - 1:00 PM</p>
                  <p className="text-gray-700">Sunday: Closed</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Emergency Support</h4>
                  <p className="text-gray-700">
                    For urgent issues outside regular hours, please call our emergency line:
                  </p>
                  <p className="text-red-600 font-medium">+234 987 654 3210</p>
                </div>
              </div>
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
