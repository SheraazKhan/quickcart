export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="container py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <img src="/quickcart-logo.svg" alt="QuickCart" className="h-7 mb-3" />
          <p className="text-slate-600">Quality products at fair prices.</p>
        </div>
        <div>
          <div className="font-semibold mb-3">Quick Links</div>
          <ul className="space-y-2 text-slate-600">
            <li>Contact</li><li>Returns</li><li>Shipping</li><li>FAQs</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Support</div>
          <ul className="space-y-2 text-slate-600">
            <li>Orders</li><li>Payments</li><li>Privacy</li><li>Terms</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Payments</div>
          <div className="flex gap-2 items-center">
            <img src="/visa.svg" alt="Visa" className="h-6" />
            <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
            <img src="/amex.svg" alt="AmEx" className="h-6" />
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 pb-6">© {new Date().getFullYear()} QuickCart</div>
    </footer>
  );
}
