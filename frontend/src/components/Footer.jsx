function Footer() {
  return (
    <footer className="py-4 text-center bg-gray-100">
      <div className="container mx-auto">
        <a href="" className="text-gray-600 hover:underline">Privacy Policy</a>
        <span className="mx-2">|</span>
        <a href="" className="text-gray-600 hover:underline">Terms of Service</a>
        <span className="mx-2">|</span>
        <a href="" className="text-gray-600 hover:underline">Contact Us</a>
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} BINIGNIT. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;