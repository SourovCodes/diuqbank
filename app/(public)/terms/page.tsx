import { Metadata } from "next";
import { FileText, BarChart2, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions - DIUQBank",
  description:
    "The terms and conditions governing the use of DIUQBank services.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Terms and{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Conditions
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Guidelines and legal terms for using DIUQBank services
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Last updated: April 5, 2025
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
        <CardContent className="p-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Introduction
            </h2>
          </div>

          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              Welcome to DIUQBank. These Terms and Conditions
              (&quot;Terms&quot;) govern your use of the DIUQBank website and
              services (&quot;Services&quot;). By accessing or using our
              Services, you agree to be bound by these Terms.
            </p>
            <p>
              Please read these Terms carefully before using our Services. If
              you do not agree with any part of these Terms, you must not use
              our Services.
            </p>
            <p>
              We may revise these Terms at any time by updating this page. You
              are expected to check this page regularly to take notice of any
              changes, as they are binding on you. Your continued use of the
              Services following the posting of revised Terms means that you
              accept and agree to the changes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility & Accounts */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Eligibility
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>To use DIUQBank, you must:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Be affiliated with Daffodil International University (DIU) as
                  a student or faculty member
                </li>
                <li>
                  Have a valid DIU email address (@diu.edu.bd or @s.diu.edu.bd)
                </li>
                <li>
                  Be at least 18 years old or the legal age in your jurisdiction
                </li>
                <li>Have the legal capacity to enter into these Terms</li>
              </ul>
              <p className="mt-4">
                We reserve the right to refuse service to anyone for any reason
                at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <BarChart2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Accounts
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>When you create an account with us, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your account credentials secure</li>
                <li>
                  Notify us immediately of any unauthorized access or security
                  breaches
                </li>
                <li>
                  Take responsibility for all activities that occur under your
                  account
                </li>
              </ul>
              <p className="mt-4">
                You are solely responsible for maintaining the confidentiality
                of your account credentials and for any activity that occurs
                under your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Content and Intellectual Property */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                User Content
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                Our Services allow you to upload, post, and share content,
                including PDF files of question papers (&quot;User
                Content&quot;). You retain all rights to your User Content, but
                grant us a non-exclusive, transferable, sub-licensable,
                royalty-free, worldwide license to use, store, display,
                reproduce, and distribute your User Content on and through our
                Services.
              </p>
              <p>By uploading User Content, you represent and warrant that:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You own or have the necessary rights to the User Content
                </li>
                <li>
                  The User Content does not infringe on any third party&apos;s
                  intellectual property rights
                </li>
                <li>
                  The User Content does not violate any applicable laws or
                  regulations
                </li>
                <li>
                  The User Content does not contain any harmful, offensive, or
                  inappropriate material
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Intellectual Property
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                The DIUQBank name, logo, website design, and content created by
                us are our intellectual property and are protected by copyright,
                trademark, and other intellectual property laws. You may not
                use, reproduce, distribute, or create derivative works based on
                our content without our express written permission.
              </p>
              <p>
                We respect the intellectual property rights of others. If you
                believe that any content on our Services infringes upon your
                intellectual property rights, please contact us at{" "}
                <a
                  href="mailto:sourov2305101004@diu.edu.bd"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  sourov2305101004@diu.edu.bd
                </a>{" "}
                with details of the alleged infringement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prohibited Activities and Termination */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Prohibited Activities
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                You agree not to engage in any of the following prohibited
                activities:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Using the Services for any illegal purpose or in violation of
                  any laws
                </li>
                <li>
                  Uploading content that infringes on intellectual property
                  rights
                </li>
                <li>Sharing or selling DIU exam papers to non-DIU students</li>
                <li>
                  Using the Services to distribute malware or harmful code
                </li>
                <li>
                  Attempting to interfere with, disrupt, or gain unauthorized
                  access to our Services
                </li>
                <li>
                  Scraping, data mining, or otherwise extracting data from our
                  Services
                </li>
                <li>Impersonating another person or entity</li>
                <li>Harassing, bullying, or intimidating other users</li>
                <li>Uploading false, misleading, or inappropriate content</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Termination
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                We may terminate or suspend your account and access to our
                Services immediately, without prior notice or liability, for any
                reason, including, without limitation, if you breach these
                Terms.
              </p>
              <p>
                Upon termination, your right to use the Services will
                immediately cease. If you wish to terminate your account, you
                may simply discontinue using the Services or contact us to
                request account deletion.
              </p>
              <p>
                All provisions of the Terms which by their nature should survive
                termination shall survive termination, including, without
                limitation, ownership provisions, warranty disclaimers,
                indemnity, and limitations of liability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimers and Limitation of Liability */}
      <Card className="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Disclaimers and Limitation of Liability
          </h2>

          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              <strong>Disclaimers</strong>: Our Services are provided on an
              &quot;as is&quot; and &quot;as available&quot; basis without any
              warranties, expressed or implied. We do not warrant that our
              Services will be uninterrupted, timely, secure, or error-free. We
              do not guarantee the accuracy, completeness, or usefulness of any
              content available on or through our Services.
            </p>
            <p>
              <strong>Limitation of Liability</strong>: To the maximum extent
              permitted by law, in no event shall DIUQBank, its directors,
              employees, partners, agents, suppliers, or affiliates be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from (i) your
              access to or use of or inability to access or use the Services;
              (ii) any conduct or content of any third party on the Services;
              (iii) any content obtained from the Services; and (iv)
              unauthorized access, use, or alteration of your transmissions or
              content.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Governing Law and Contact */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Governing Law
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of Bangladesh, without regard to its conflict of
                law provisions.
              </p>
              <p>
                Any disputes arising out of or relating to these Terms or your
                use of our Services shall be resolved exclusively in the courts
                of Bangladesh, and you consent to the personal jurisdiction of
                such courts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Contact Us
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                If you have any questions or concerns about these Terms, please
                contact us at:
              </p>
              <p>
                <a
                  href="mailto:sourov2305101004@diu.edu.bd"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  sourov2305101004@diu.edu.bd
                </a>
              </p>
              <p>
                You can also visit our{" "}
                <Link
                  href="/contact"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Contact page
                </Link>{" "}
                for more ways to reach us.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Note */}
      <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
        <CardContent className="p-8">
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              By using DIUQBank, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and Conditions. Please also
              review our{" "}
              <Link
                href="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              which governs how we collect, use, and protect your information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
