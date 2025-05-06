import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-900"></div>
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-br from-red-500 to-red-600 rounded-bl-[50%]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gray-900"></div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-6 z-10">
        {/* Left side - Branding */}
        <div className="text-white mb-10 md:mb-0 flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold mb-2">DeskFlow</h1>
          <p className="text-xl font-light">Smart way for office management</p>
        </div>

        {/* Right side - Login Form */}
        <LoginForm />
      </div>
    </main>
  )
}
