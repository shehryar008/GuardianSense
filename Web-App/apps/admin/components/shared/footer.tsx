import { LockIcon } from "../shared/icons"

export function Footer() {
  return (
    <footer className="py-6 px-4 bg-gray-100/80 border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© 2025 GuardianSense. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Terms of Service
          </a>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <LockIcon className="w-4 h-4" />
          <span>Protected by enterprise-grade security • HTTPS Encrypted</span>
        </div>
      </div>
    </footer>
  )
}

