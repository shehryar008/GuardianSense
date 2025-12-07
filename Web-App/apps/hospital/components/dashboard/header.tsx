"use client"

import { SearchIcon, PlusIcon, DownloadIcon, BellIcon } from "../shared/icons"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search incident, ambulance, staff..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors font-medium">
            <PlusIcon className="w-4 h-4" />
            Manual Dispatch
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-700">
            <DownloadIcon className="w-4 h-4" />
            Export Data
          </button>
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <BellIcon className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">DR</span>
          </div>
        </div>
      </div>
    </header>
  )
}
