import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
  Heart,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                DIUQBank
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The ultimate platform for finding, downloading, and sharing exam
              question papers at Daffodil International University.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com"
                className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://instagram.com"
                className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://github.com"
                className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/questions"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/questions/create"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Upload
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-400 flex items-center">
                <Mail className="h-4 w-4 mr-2" /> contact@diuqbank.com
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-all"
                asChild
              >
                <Link href="/contact">Send Message</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 md:mb-0">
              <p className="mb-2">
                © {new Date().getFullYear()} DIUQBank. All rights reserved.
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for DIU
              Students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
