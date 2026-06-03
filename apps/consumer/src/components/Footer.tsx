import Link from "next/link";
import { Globe, BookOpen, HandCoins, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Setu SHG
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering Self-Help Groups globally through skill development, grant acquisition, and comprehensive support.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/skills" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Skill Development
                </Link>
              </li>
              <li>
                <Link href="/grants" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <HandCoins className="h-4 w-4" /> Grant Acquisition
                </Link>
              </li>
              <li>
                <Link href="/global" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Global Expansion
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
            <div className="flex flex-col gap-2">
              <a href="https://twitter.com/setushg" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="https://facebook.com/setushg" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="https://instagram.com/setushg" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Setu SHG. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
