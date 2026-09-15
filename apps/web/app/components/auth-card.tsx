import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function AuthCard({
  title,
  description,
  footer,
  children,
}: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-sm py-4 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
