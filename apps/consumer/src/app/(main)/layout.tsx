import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Main public layout — includes Navbar and Footer
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
