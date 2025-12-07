import { redirect } from "next/navigation"

export default function Home() {
  redirect("/login")
}

// export default function AdminLoginPage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 flex flex-col">
//       {/* Purple gradient accent line at top */}
//       <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-500 to-violet-400" />

//       {/* Main Content */}
//       <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
//         <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
//           {/* Left Side - Branding */}
//           <div className="space-y-8">
//             {/* Logo */}
//             <div className="flex items-center gap-3">
//               <div className="w-14 h-14 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
//                 <ShieldIcon className="w-8 h-8 text-white" />
//               </div>
//               <span className="text-3xl font-bold text-violet-600">GuardianSense</span>
//             </div>

//             {/* Title - Dark text for light background */}
//             <div className="space-y-2">
//               <h1 className="text-2xl font-semibold text-gray-900">Administrator Portal</h1>
//               <p className="text-gray-500">Comprehensive hospital and police station management system</p>
//             </div>

//             {/* Features */}
//             <div className="space-y-5">
//               <FeatureItem
//                 icon={<ShieldIcon className="w-5 h-5" />}
//                 title="Enterprise Security"
//                 description="Military-grade encryption with two-factor authentication and role-based access control"
//               />
//               <FeatureItem
//                 icon={<ActivityIcon className="w-5 h-5" />}
//                 title="Real-Time Monitoring"
//                 description="Live incident tracking, performance metrics, and instant alerts for critical situations"
//               />
//               <FeatureItem
//                 icon={<BarChart3Icon className="w-5 h-5" />}
//                 title="Integrated Analytics"
//                 description="Comprehensive reporting and data visualization across all hospital and police operations"
//               />
//             </div>

//             {/* Stats */}
//             <div className="flex gap-8 pt-4">
//               <StatItem value="99.9%" label="Uptime" />
//               <StatItem value="24/7" label="Support" />
//               <StatItem value="256-bit" label="Encryption" />
//             </div>
//           </div>

//           {/* Right Side - Login Form */}
//           <div className="flex justify-center lg:justify-end">
//             <AdminLoginForm />
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <Footer />
//     </div>
//   )
// }
