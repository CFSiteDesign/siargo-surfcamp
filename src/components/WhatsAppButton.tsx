/**
 * Floating WhatsApp button — matches the main site's persistent chat affordance.
 * Links to the Siargao Mad Monkey WhatsApp group.
 */

const WHATSAPP_URL = 'https://chat.whatsapp.com/BBLy7mC93WcBXD1pP6MYZU?mode=gi_t';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" aria-hidden="true" focusable="false">
        <path d="M16.04 3.2C9.03 3.2 3.34 8.89 3.34 15.9c0 2.24.59 4.42 1.71 6.35L3.2 28.8l6.71-1.76a12.66 12.66 0 0 0 6.13 1.56h.01c7.01 0 12.7-5.69 12.7-12.7 0-3.39-1.32-6.58-3.72-8.98a12.6 12.6 0 0 0-8.99-3.72Zm0 23.13h-.01a10.55 10.55 0 0 1-5.37-1.47l-.39-.23-3.98 1.04 1.06-3.88-.25-.4a10.5 10.5 0 0 1-1.61-5.61c0-5.82 4.74-10.55 10.56-10.55 2.82 0 5.47 1.1 7.46 3.09a10.48 10.48 0 0 1 3.09 7.47c0 5.82-4.74 10.54-10.56 10.54Zm5.79-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.68.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
