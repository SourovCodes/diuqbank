import Footer from "@/components/footer";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
