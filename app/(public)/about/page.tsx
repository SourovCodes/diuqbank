import { Metadata } from "next";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about DIUQBank and our mission to make exam preparation easier and more collaborative.",
};

export default function AboutPage() {
  const teamMembers = [
    { name: "Sourov Biswas", id: "232-15-004" },
    { name: "Muntasir Munyim Polash", id: "232-15-708" },
    { name: "Moniruzzaman Nahid", id: "232-15-607" },
    { name: "Rony Roy", id: "232-15-712" },
    { name: "Mehedi Hasan Shuvo", id: "232-15-358" },
  ];
  const supervisor = {
    name: "Pranto Protim Choudhury (PPC)",
    role: "Lecturer",
    email: "prantoprotimchoudhury.cse@diu.edu.bd",
    phone: "01737043436",
  };

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

      {/* Course project submission & team info */}
      <Card className="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            DBMS Course Project Submission
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            This platform is a Database Management Systems (DBMS) course project
            submission.
          </p>
          <div>
            {/* Supervisor highlight */}
            <div className="flex flex-col items-center text-center mb-10">
              <Avatar className="h-28 w-28 border-2 border-blue-500 shadow-sm mb-4 bg-white dark:bg-slate-900">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    supervisor.name
                  )}`}
                  alt={supervisor.name}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {supervisor.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 3)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {supervisor.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                {supervisor.role}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                <span className="font-medium">Email:</span>{" "}
                <a
                  href={`mailto:${supervisor.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {supervisor.email}
                </a>
                <br />
                <span className="font-medium">Phone:</span>{" "}
                <a
                  href={`tel:${supervisor.phone}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {supervisor.phone}
                </a>
              </p>
            </div>

            {/* Team row */}
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 text-center">
              Team Members
            </h3>
            <div className="flex flex-wrap justify-center gap-8">
              {teamMembers.map((m) => {
                const initials = m.name
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase();
                const placeholderSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  m.name
                )}`;
                return (
                  <div key={m.id} className="flex flex-col items-center w-32">
                    <Avatar className="h-20 w-20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                      <AvatarImage
                        src={placeholderSrc}
                        alt={`${m.name} avatar placeholder`}
                      />
                      <AvatarFallback className="text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="mt-2 text-center text-slate-700 dark:text-slate-300 text-sm font-medium leading-tight">
                      {m.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {m.id}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

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
