import { Metadata } from "next";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about DIUQBank and our mission to make exam preparation easier and more collaborative.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          About{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            DIUQBank
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Making exam preparation easier and more collaborative through a
          community-powered platform
        </p>
      </div>

      {/* Mission section */}
      <Card className="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
        <CardContent className="p-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Our Mission
            </h2>
          </div>

          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              At DIUQBank, our mission is simple: to create a platform where you
              can easily access previous year exam questions and contribute your
              own. We believe in the power of sharing knowledge to build a
              supportive learning community.
            </p>
            <p>
              By fostering collaboration, we aim to empower students with the
              resources they need to excel academically, ensuring that learning
              remains accessible and efficient for everyone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Why Contribute and Join Us section */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Why Contribute?
            </h2>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                DIUQBank thrives because of contributions from students like
                you. Your seniors have shared their resources to help you
                succeed. Now, it&apos;s your turn to continue this cycle of
                support by sharing your own questions for future students.
              </p>
              <p>
                Your participation helps build a comprehensive question bank
                that not only benefits you but also creates a lasting impact for
                generations of learners at DIU.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 h-full">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Join Us
            </h2>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                Whether you&apos;re looking for resources or want to give back
                by contributing your own, DIUQBank is here to support you.
                Together, we can create a shared platform that helps everyone
                excel.
              </p>
              <p>
                Join the DIUQBank family today and make exam preparation a
                collaborative success. Your contributions and participation make
                all the difference.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
