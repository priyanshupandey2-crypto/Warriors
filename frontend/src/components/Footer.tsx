import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container-low mt-auto">
      <div className="w-full px-6 md:px-8 py-12 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="text-2xl font-bold text-primary">AuraLearn</span>
          <p className="text-sm text-on-surface-variant max-w-[300px] text-center md:text-left opacity-80 hover:opacity-100 transition-opacity">
            Empowering the next generation of thinkers, designers, and engineers through energetic,
            human-centric education.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <Link href="#" className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="#" className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="#" className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Cookie Policy
          </Link>
          <Link href="#" className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Contact Us
          </Link>
        </div>
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 pb-8">
        <div className="border-t border-surface-variant pt-6 text-center">
          <p className="text-xs font-semibold text-on-surface-variant">
            © {new Date().getFullYear()} AuraLearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
