import { FormEvent, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveImage } from "../components/ResponsiveImage";
import { amenities, galleryImages, reviews } from "../data/content";
import { usePageMeta } from "../lib/usePageMeta";

const blockedDates = new Set([
  "2026-06-03",
  "2026-06-04",
  "2026-06-05",
  "2026-06-11",
  "2026-06-12",
  "2026-06-17",
  "2026-06-18",
  "2026-06-24",
  "2026-06-28",
  "2026-06-29",
  "2026-07-02",
  "2026-07-03",
  "2026-07-09",
  "2026-07-10",
  "2026-07-15",
  "2026-07-21",
  "2026-07-22",
  "2026-07-30",
]);
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const nightlyRate = 180;
const cleaningFee = 60;
const maxStayNights = 14;
const calendarMonths = buildCalendarMonths(2026, 5, 24);
const propertyPosition: [number, number] = [51.8856, -1.7599];
const PropertyMap = lazy(() =>
  import("../components/PropertyMap").then((module) => ({ default: module.PropertyMap })),
);

export function DemoPage() {
  usePageMeta(
    "Foxglove Hollow Cottage | Example direct-booking website",
    "An example guest-facing direct-booking website for a fictional countryside holiday cottage.",
  );

  const [isHostOverlayVisible, setIsHostOverlayVisible] = useState(true);
  const [isHostOverlayDismissed, setIsHostOverlayDismissed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryLightboxOpen, setIsGalleryLightboxOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [calendarMonthIndex, setCalendarMonthIndex] = useState(0);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [hoverDate, setHoverDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [hasPets, setHasPets] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const bookingSectionRef = useRef<HTMLDivElement | null>(null);
  const locationSectionRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const featuredImage = galleryImages[selectedImage] ?? galleryImages[0]!;
  const heroImages = galleryImages.slice(0, 5);
  const activeMonth = calendarMonths[calendarMonthIndex] ?? calendarMonths[0]!;
  const calendarDays = useMemo(
    () => buildCalendarDays(activeMonth.year, activeMonth.monthIndex),
    [activeMonth],
  );
  const selectedNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return getNightCount(checkIn, checkOut);
  }, [checkIn, checkOut]);
  const previewCheckOut = useMemo(() => {
    if (!checkIn || checkOut || !hoverDate || hoverDate <= checkIn) return "";
    return isRangeAvailable(checkIn, hoverDate) ? hoverDate : "";
  }, [checkIn, checkOut, hoverDate]);
  const subtotal = selectedNights * nightlyRate;
  const total = subtotal + cleaningFee;
  const hasValidEmail = isValidEmail(email);
  const hasValidPhone = !phone || isValidPhone(phone);
  const hasValidDateRange =
    Boolean(checkIn && checkOut) &&
    checkOut > checkIn &&
    getNightCount(checkIn, checkOut) <= maxStayNights &&
    isRangeAvailable(checkIn, checkOut);
  const hasValidGuestDetails =
    Boolean(firstName && lastName && email) && hasValidEmail && hasValidPhone;
  const isMobileBookingOverlayOpen = isMobileViewport && bookingStep === 2 && !isBookingComplete;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (isHostOverlayDismissed) {
      setIsHostOverlayVisible(false);
      return;
    }

    lastScrollYRef.current = window.scrollY || 0;

    const onScroll = () => {
      if (scrollRafRef.current != null) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const y = window.scrollY || 0;
        lastScrollYRef.current = y;
        setIsHostOverlayVisible(y < 140);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [isHostOverlayDismissed]);

  useEffect(() => {
    const shouldLockScroll =
      isGalleryLightboxOpen || isConfirmationOpen || isMobileBookingOverlayOpen;
    const previousOverflow = document.body.style.overflow;

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isConfirmationOpen, isGalleryLightboxOpen, isMobileBookingOverlayOpen]);

  useEffect(() => {
    if (!isBookingComplete || !isMobileViewport) return;

    window.requestAnimationFrame(() => {
      bookingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isBookingComplete, isMobileViewport]);

  useEffect(() => {
    const element = locationSectionRef.current;
    if (!element || shouldRenderMap) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          setShouldRenderMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldRenderMap]);

  const validateDates = () => {
    if (!checkIn || !checkOut) {
      setBookingError("Please select check-in and check-out dates from the calendar.");
      return false;
    }

    if (checkOut <= checkIn) {
      setBookingError("Check-out must be after check-in.");
      return false;
    }

    if (getNightCount(checkIn, checkOut) > maxStayNights) {
      setBookingError("The maximum stay for online booking is 14 nights.");
      return false;
    }

    if (!isRangeAvailable(checkIn, checkOut)) {
      setBookingError("That stay crosses unavailable dates. Please choose another range.");
      return false;
    }

    setBookingError("");
    return true;
  };

  const handleDateClick = (date: string) => {
    setBookingSuccess("");

    if (blockedDates.has(date)) {
      return;
    }

    if (checkIn === date && !checkOut) {
      setCheckIn("");
      setHoverDate("");
      setBookingError("");
      return;
    }

    if (checkIn === date && checkOut) {
      setCheckIn("");
      setCheckOut("");
      setHoverDate("");
      setBookingError("");
      return;
    }

    if (checkOut === date) {
      setCheckOut("");
      setHoverDate("");
      setBookingError("");
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut("");
      setHoverDate("");
      setBookingError("");
      setBookingStep(1);
      setIsMonthPickerOpen(false);
      return;
    }

    if (date <= checkIn) {
      setCheckIn(date);
      setCheckOut("");
      setHoverDate("");
      setBookingError("");
      setIsMonthPickerOpen(false);
      return;
    }

    if (getNightCount(checkIn, date) > maxStayNights) {
      setBookingError("The maximum stay for online booking is 14 nights.");
      return;
    }

    if (!isRangeAvailable(checkIn, date)) {
      setBookingError("Some nights in that range are unavailable. Choose another check-out date.");
      return;
    }

    setCheckOut(date);
    setHoverDate("");
    setBookingError("");
    setIsMonthPickerOpen(false);
  };

  const handleContinue = () => {
    setBookingSuccess("");
    if (!validateDates()) {
      return;
    }
    setBookingStep(2);
  };

  const handleBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingSuccess("");
    setShowConfetti(false);

    if (!validateDates()) {
      setBookingStep(1);
      return;
    }

    if (!hasValidGuestDetails) {
      return;
    }

    setBookingError("");
    setIsConfirmationOpen(true);
  };

  const handleConfirmBooking = () => {
    setIsConfirmationOpen(false);
    setIsBookingComplete(true);
    setBookingSuccess(
      "Booking confirmed. A confirmation email will follow shortly with stay details and instructions for making payment.",
    );
    setShowConfetti(true);
  };

  const handleResetBooking = () => {
    setBookingStep(1);
    setCheckIn("");
    setCheckOut("");
    setHoverDate("");
    setGuestCount(1);
    setHasPets(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSpecialRequests("");
    setBookingError("");
    setBookingSuccess("");
    setIsConfirmationOpen(false);
    setIsBookingComplete(false);
    setShowConfetti(false);
    setIsGalleryLightboxOpen(false);
  };

  useEffect(() => {
    if (!showConfetti) return;

    const duration = 1800;
    const animationEnd = Date.now() + duration;

    const frame = window.setInterval(async () => {
      if (Date.now() > animationEnd) {
        window.clearInterval(frame);
        setShowConfetti(false);
        return;
      }

      const { default: confetti } = await import("canvas-confetti");
      confetti({
        particleCount: 10,
        startVelocity: 28,
        spread: 72,
        ticks: 220,
        origin: { x: 0.2 + Math.random() * 0.6, y: 0.12 + Math.random() * 0.08 },
        colors: ["#9a5f3c", "#f6ede2", "#ffffff", "#d9b38c", "#7c4b32"],
        scalar: 0.9,
      });
    }, 180);

    return () => window.clearInterval(frame);
  }, [showConfetti]);

  return (
    <main className="min-h-screen bg-[#f7f2ea] text-stone-900">
      <div
        className={`fixed bottom-4 left-4 right-4 z-[9999] rounded-[22px] border border-white/80 bg-white/95 p-3 shadow-[0_18px_40px_rgba(28,25,23,0.16)] ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 sm:left-auto sm:right-4 sm:max-w-sm ${
          isHostOverlayVisible && !isGalleryLightboxOpen && !isMobileBookingOverlayOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-amber-800/80">Host demo</p>
          <button
            type="button"
            onClick={() => {
              setIsHostOverlayDismissed(true);
              setIsHostOverlayVisible(false);
            }}
            className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:border-stone-400 hover:text-stone-900 sm:hidden"
            aria-label="Dismiss host demo banner"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">
            This demo shows the kind of direct-booking website DirectRental can build for your property.
          </p>
          <Link
            to="/"
            className="shrink-0 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Back to Direct Rental
          </Link>
        </div>
      </div>

      {isGalleryLightboxOpen ? (
        <div className="fixed inset-0 z-40 bg-stone-950/95 text-white">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Stay photos</p>
                <p className="mt-1 text-sm text-white/80">
                  Photo {selectedImage + 1} of {galleryImages.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryLightboxOpen(false)}
                className="rounded-full border border-white/15 bg-white/10 p-3 text-white transition hover:bg-white/15"
                aria-label="Close full screen gallery"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-6">
              <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-black/20">
                <div key={`lightbox-${featuredImage.jpg}`} className="animate-gallery-fade">
                  <ResponsiveImage
                    image={featuredImage}
                    loading="eager"
                    sizes="100vw"
                    className="block h-full w-full"
                    imgClassName="max-h-[72vh] w-full object-contain"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
                  <p className="text-base sm:text-lg">{featuredImage.alt}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1)
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/15"
                  aria-label="Previous photo"
                >
                  <ChevronLeftIcon />
                </button>
                <div className="grid flex-1 grid-cols-4 gap-2 overflow-hidden sm:grid-cols-6">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`lightbox-thumb-${image.jpg}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-2xl border transition ${
                        index === selectedImage ? "border-white" : "border-white/10 opacity-70"
                      }`}
                      aria-label={`View photo ${index + 1}`}
                    >
                      <ResponsiveImage
                        image={image}
                        sizes="96px"
                        className="block h-full w-full"
                        imgClassName="aspect-[4/3] w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage((selectedImage + 1) % galleryImages.length)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/15"
                  aria-label="Next photo"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isConfirmationOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/35 px-4">
          <div className="animate-fade-up w-full max-w-lg rounded-[30px] border border-white/60 bg-white p-6 shadow-[0_30px_80px_rgba(28,25,23,0.18)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">Confirm booking request</p>
            <h3 className="mt-4 text-3xl text-stone-900">Ready to send your request?</h3>
            <p className="mt-4 text-base leading-7 text-stone-600">
              We will email your booking confirmation and send full details on how to make payment after the host reviews your stay.
            </p>
            <div className="mt-6 rounded-[22px] bg-[#f8f4ed] px-4 py-4 text-sm text-stone-600">
              <p className="font-medium text-stone-900">
                {formatDisplayDate(checkIn)} to {formatDisplayDate(checkOut)}
              </p>
              <p className="mt-1">{selectedNights} nights, {guestCount} guest{guestCount === 1 ? "" : "s"}</p>
              <p className="mt-2">Total payable: GBP {total}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full rounded-full bg-stone-900 px-6 py-4 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
              >
                Confirm booking
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmationOpen(false)}
                className="w-full rounded-full border border-stone-300 bg-white px-6 py-4 text-base font-medium text-stone-900 transition hover:border-stone-500"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="pb-8">
        <div className="overflow-hidden shadow-[0_30px_80px_rgba(28,25,23,0.12)]">
          <div className="relative min-h-[540px] sm:min-h-[720px]">
            {heroImages.map((image, index) => (
              <div
                key={image.jpg}
                className={`absolute inset-0 transition-opacity duration-[1600ms] ${
                  index === heroImageIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <ResponsiveImage
                  image={image}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="absolute inset-0"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <p className="text-center text-sm uppercase tracking-[0.28em] text-white/70">
                Mereford, England
              </p>
              <div className="mt-4 flex flex-col items-center gap-6 text-center">
                <div>
                  <h1 className="max-w-3xl text-4xl text-white sm:text-6xl">
                    Foxglove Hollow Cottage
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
                    A calm, design-led countryside stay for families and weekend escapes.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm text-white/80">
                    {[
                      { label: "Sleeps 6", icon: <GuestsIcon /> },
                      { label: "3 bedrooms", icon: <BedIcon /> },
                      { label: "2 bathrooms", icon: <BathIcon /> },
                    ].map((item) => (
                      <span
                        key={item.label}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
                      >
                        {item.icon}
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href="#booking"
                  className="rounded-full bg-white px-6 py-4 text-center text-base font-medium text-stone-900 transition hover:-translate-y-0.5 hover:bg-sand"
                >
                  Book now
                </a>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 flex gap-2 sm:bottom-8 sm:right-8">
              {heroImages.map((image, index) => (
                <button
                  key={`${image.jpg}-dot`}
                  type="button"
                  onClick={() => setHeroImageIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === heroImageIndex ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"
                  }`}
                  aria-label={`Show hero image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="container-shell section-spacing pt-0">
        <div className="mb-6 sm:mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">Stay photos</p>
            <h2 className="mt-3 text-3xl text-stone-900 sm:text-4xl">See the cottage before you book.</h2>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col gap-4 xl:h-full">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[30px] text-left shadow-[0_24px_60px_rgba(28,25,23,0.08)] sm:min-h-[420px]">
              <div key={featuredImage.jpg} className="animate-gallery-fade h-full w-full">
                <ResponsiveImage
                  image={featuredImage}
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover object-center"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryLightboxOpen(true)}
                className="absolute inset-0"
                aria-label="Open full screen gallery"
              />
              <button
                type="button"
                onClick={() => setIsGalleryLightboxOpen(true)}
                className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-stone-950/35 p-3 text-white backdrop-blur-sm transition hover:bg-stone-950/50"
                aria-label="Open gallery full screen"
              >
                <ExpandIcon />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 bg-gradient-to-t from-stone-950/60 to-transparent p-4 text-white sm:flex-row sm:items-end sm:justify-between sm:p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                    Photo {selectedImage + 1} of {galleryImages.length}
                  </p>
                  <p className="mt-2 text-lg">{featuredImage.alt}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/70 sm:hidden">
                    Tap for full-screen viewing
                  </p>
                </div>
                <div className="hidden gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage(
                        selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1,
                      )
                    }
                    className="rounded-full border border-white/20 bg-white/10 p-2.5 transition hover:bg-white/20"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage((selectedImage + 1) % galleryImages.length)}
                    className="rounded-full border border-white/20 bg-white/10 p-2.5 transition hover:bg-white/20"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image.jpg}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(index);
                    if (isMobileViewport) {
                      setIsGalleryLightboxOpen(true);
                    }
                  }}
                  className={`overflow-hidden rounded-[22px] border text-left transition ${
                    index === selectedImage
                      ? "border-stone-900 shadow-[0_18px_40px_rgba(28,25,23,0.14)]"
                      : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <ResponsiveImage
                    image={image}
                    sizes="180px"
                    className="block h-full w-full"
                    imgClassName="aspect-[4/3] h-[100px] w-full object-cover object-center sm:h-[120px]"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_60px_rgba(28,25,23,0.08)] backdrop-blur-sm sm:p-6 xl:h-full">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">At a glance</p>
            <h2 className="mt-4 text-2xl text-stone-900 sm:text-3xl">
              A relaxed countryside stay with hotel-level polish.
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-600">
              Foxglove Hollow Cottage blends warm stone, soft linens, and generous communal spaces for
              family weekends, walking breaks, and longer countryside escapes.
            </p>
            <div className="mt-6 grid flex-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {amenities.map((amenity, index) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3 rounded-[20px] bg-[#f4ecdf] px-4 py-3 text-sm text-stone-700"
                >
                  <AmenityIcon index={index} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="details" ref={bookingSectionRef} className="container-shell section-spacing">
        <div>
          {isBookingComplete ? (
            <div className="booking-shell animate-fade-up rounded-[30px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.08)] sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">
                    Booking confirmed
                  </p>
                  <h3 className="mt-3 text-3xl text-stone-900">
                    Your stay request has been sent.
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetBooking}
                  className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:border-stone-400 hover:text-stone-900"
                  aria-label="Start again"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mt-6 rounded-[22px] bg-[#f8f4ed] px-4 py-4 text-sm text-stone-600">
                <p className="font-medium text-stone-900">
                  {formatDisplayDate(checkIn)} to {formatDisplayDate(checkOut)}
                </p>
                <p className="mt-1">{selectedNights} nights, {guestCount} guest{guestCount === 1 ? "" : "s"}</p>
                <p className="mt-2">Total payable: GBP {total}</p>
              </div>

              <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-pulse-soft">
                {bookingSuccess}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleResetBooking}
                  className="rounded-full bg-stone-900 px-6 py-4 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
                >
                  Start a new booking
                </button>
              </div>
            </div>
          ) : (
            <form
              id="booking"
              onSubmit={handleBookingSubmit}
              noValidate
              className={`booking-shell rounded-[30px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.08)] sm:p-8 lg:p-10 ${
                isMobileBookingOverlayOpen
                  ? "mobile-booking-overlay fixed inset-0 z-40 overflow-y-auto rounded-none border-0 p-0 shadow-none"
                  : ""
              }`}
            >
            <div className={isMobileBookingOverlayOpen ? "mx-auto flex min-h-full w-full max-w-2xl flex-col bg-[#fbf7f0]" : ""}>
            <div className={`flex items-start justify-between gap-4 ${isMobileBookingOverlayOpen ? "border-b border-stone-200 bg-white px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]" : ""}`}>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">
                  {bookingStep === 1 ? "Availability" : "Your stay"}
                </p>
                <h3 className="mt-3 text-3xl text-stone-900">
                  {isMobileBookingOverlayOpen ? "Complete your booking request" : "Book now for the best rate"}
                </h3>
                {isMobileBookingOverlayOpen ? (
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Your dates are locked in below. Add guest details and send the request in one step.
                  </p>
                ) : null}
              </div>
              {isMobileBookingOverlayOpen ? (
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="rounded-full border border-stone-200 bg-white p-3 text-stone-500 transition hover:border-stone-400 hover:text-stone-900"
                  aria-label="Back to date selection"
                >
                  <CloseIcon />
                </button>
              ) : null}
            </div>

            {bookingStep === 1 ? (
              <div className={`booking-step animate-fade-up ${isMobileBookingOverlayOpen ? "px-5 pb-5" : ""}`}>
                <div className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-stone-900">
                    Guests
                    <div className="flex min-h-[76px] items-center rounded-2xl border border-stone-200 bg-white px-4 py-3">
                      <div className="flex w-full items-center justify-between gap-4">
                        <div className="flex flex-1 items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f4ed] text-stone-900">
                            <GuestsIcon />
                          </span>
                          <div>
                            <p className="text-base font-medium text-stone-900">
                              {guestCount} guest{guestCount === 1 ? "" : "s"}
                            </p>
                            <p className="text-xs text-stone-500">Minimum 1, maximum 6</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGuestCount((count) => Math.max(1, count - 1))}
                            disabled={guestCount === 1}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg text-stone-900 transition enabled:hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuestCount((count) => Math.min(6, count + 1))}
                            disabled={guestCount === 6}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg text-stone-900 transition enabled:hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="mt-4 rounded-[24px] border border-stone-200 bg-[#fcfaf6] p-3">
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCalendarMonthIndex((current) => Math.max(0, current - 1))
                          }
                          disabled={calendarMonthIndex === 0}
                          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600 transition enabled:hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeftIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMonthPickerOpen((open) => !open)}
                          className="flex-1 rounded-full border border-transparent px-2 py-1 text-center text-sm uppercase tracking-[0.22em] text-stone-500 transition hover:border-stone-200 hover:bg-white"
                        >
                          {activeMonth.label}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCalendarMonthIndex((current) =>
                              Math.min(calendarMonths.length - 1, current + 1),
                            )
                          }
                          disabled={calendarMonthIndex === calendarMonths.length - 1}
                          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600 transition enabled:hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRightIcon />
                        </button>
                    </div>
                    <div className="mt-3 hidden text-right text-xs text-stone-500 sm:block">
                      <p>{previewCheckOut ? "Preview" : "Selected"}</p>
                      <p className="mt-1 font-medium text-stone-900">
                        {checkIn ? formatDisplayDate(checkIn) : "Choose stay"}
                        {checkOut
                          ? ` to ${formatDisplayDate(checkOut)}`
                          : previewCheckOut
                            ? ` to ${formatDisplayDate(previewCheckOut)}`
                            : ""}
                      </p>
                    </div>
                  </div>
                  {isMonthPickerOpen ? (
                    <div className="animate-pop-in mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {calendarMonths.map((month, index) => (
                        <button
                          key={`${month.year}-${month.monthIndex}`}
                          type="button"
                          onClick={() => {
                            setCalendarMonthIndex(index);
                            setIsMonthPickerOpen(false);
                          }}
                          className={`rounded-2xl border px-3 py-3 text-sm transition ${
                            index === calendarMonthIndex
                              ? "border-[#9a5f3c] bg-[#f6ede2] text-[#9a5f3c]"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          {month.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="mx-auto grid w-full max-w-[360px] grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-[0.14em] text-stone-400 sm:max-w-[420px] sm:gap-1">
                    {weekDays.map((day) => (
                      <div key={day} className="py-0.5">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div
                    className="mx-auto mt-2 grid w-full max-w-[360px] grid-cols-7 gap-0.5 sm:max-w-[420px] sm:gap-1"
                    onMouseLeave={() => {
                      if (!checkOut) setHoverDate("");
                    }}
                  >
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }

                      const isBlocked = blockedDates.has(date);
                      const isSelectedStart = checkIn === date;
                      const isSelectedEnd = checkOut === date;
                      const isPreviewEnd = !checkOut && previewCheckOut === date;
                      const isInRange = Boolean(
                        checkIn && checkOut && date > checkIn && date < checkOut && !isBlocked,
                      );
                      const isInPreviewRange = Boolean(
                        checkIn &&
                          !checkOut &&
                          previewCheckOut &&
                          date > checkIn &&
                          date < previewCheckOut &&
                          !isBlocked,
                      );

                      return (
                        <button
                          key={date}
                          type="button"
                          disabled={isBlocked}
                          onClick={() => handleDateClick(date)}
                          onMouseEnter={() => {
                            if (!checkIn || checkOut || isBlocked) return;
                            if (getNightCount(checkIn, date) > maxStayNights) {
                              setHoverDate("");
                              return;
                            }
                            setHoverDate(date);
                          }}
                          className={`aspect-square min-h-[38px] rounded-[14px] border p-1 text-left transition sm:min-h-[48px] ${
                            isBlocked
                              ? "cursor-not-allowed border-stone-100 bg-stone-100 text-stone-300 line-through"
                              : isSelectedStart || isSelectedEnd || isPreviewEnd
                                ? "border-[#9a5f3c] bg-[#9a5f3c] text-white shadow-[0_10px_24px_rgba(154,95,60,0.22)]"
                                : isInRange || isInPreviewRange
                                  ? "border-[#e8d8c5] bg-[#f6ede2] text-stone-900"
                                  : "border-stone-200 bg-white text-stone-800 hover:border-[#caa27f] hover:bg-[#fbf6ef]"
                          }`}
                        >
                          <div className="flex h-full flex-col justify-center sm:justify-between">
                            <span className="text-center text-[11px] sm:text-left sm:text-xs">
                              {Number(date.slice(-2))}
                            </span>
                            <span
                              className={`hidden truncate text-[7px] leading-3 sm:block sm:text-[9px] sm:leading-4 ${
                                isBlocked
                                  ? "text-stone-300"
                                  : isSelectedStart || isSelectedEnd || isPreviewEnd
                                    ? "text-white/80"
                                    : isInRange || isInPreviewRange
                                      ? "text-[#9a5f3c]/80"
                                      : "text-stone-500"
                              }`}
                            >
                              {isBlocked ? "Booked" : `GBP ${nightlyRate}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-xs text-stone-500 sm:hidden">
                    From GBP {nightlyRate} per night
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#9a5f3c]" />
                      Selected
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#f6ede2]" />
                      Stay range / preview
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-stone-200" />
                      Unavailable
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`booking-step mt-6 grid gap-4 animate-fade-up ${isMobileBookingOverlayOpen ? "px-5 pb-5" : ""}`}>
                <div className={`rounded-[22px] bg-[#f8f4ed] px-4 py-4 text-sm text-stone-600 ${isMobileBookingOverlayOpen ? "border border-[#e6d8c8] bg-white shadow-[0_14px_35px_rgba(28,25,23,0.06)]" : ""}`}>
                  <p className="font-medium text-stone-900">
                    {formatDisplayDate(checkIn)} to {formatDisplayDate(checkOut)}
                  </p>
                  <p className="mt-1">{selectedNights} nights, {guestCount} guest{guestCount === 1 ? "" : "s"}</p>
                  {isMobileBookingOverlayOpen ? (
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="mt-3 text-sm font-medium text-[#9a5f3c]"
                    >
                      Change dates or guest count
                    </button>
                  ) : null}
                </div>
                <p className="text-sm text-stone-500">
                  Required fields are marked with <span className="font-semibold text-[#9a5f3c]">*</span>
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-stone-900">
                    <span>
                      First name <span className="text-[#9a5f3c]">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Alex"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-stone-900">
                    <span>
                      Last name <span className="text-[#9a5f3c]">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Turner"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium text-stone-900">
                  <span>
                    Email address <span className="text-[#9a5f3c]">*</span>
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="alex@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                  />
                  {email && !hasValidEmail ? (
                    <span className="text-xs font-normal text-rose-700">
                      Please enter a valid email address.
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-900">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    placeholder="+44 7700 900123"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                  />
                  <span className="text-xs font-normal text-stone-500">
                    Optional. Include if you would like updates by phone.
                  </span>
                  {phone && !hasValidPhone ? (
                    <span className="text-xs font-normal text-rose-700">
                      Please enter a valid phone number.
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-900">
                  Pets
                  <div className="flex min-h-[76px] items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f4ed] text-stone-900">
                        <PawIcon />
                      </span>
                      <div>
                        <p className="text-base font-medium text-stone-900">
                          {hasPets ? "Bringing pets" : "No pets"}
                        </p>
                        <p className="text-xs text-stone-500">Pet-friendly stay available</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasPets}
                      onChange={(event) => setHasPets(event.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900/10"
                    />
                  </div>
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-900">
                  Special requests
                  <textarea
                    rows={3}
                    placeholder="Celebrating a birthday, arrival time, dog details..."
                    value={specialRequests}
                    onChange={(event) => setSpecialRequests(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                  />
                </label>
              </div>
            )}

            <div
              className={`mt-6 rounded-[24px] bg-[#f4ecdf] p-5 ${
                isMobileBookingOverlayOpen ? "mx-5 mb-5 bg-[#efe4d4]" : ""
              } ${hasValidDateRange && !isMobileBookingOverlayOpen ? "mobile-booking-summary" : ""}`}
            >
              {hasValidDateRange ? (
                <>
                  <div className="hidden items-center justify-between text-sm text-stone-600 sm:flex">
                    <span>{selectedNights} nights</span>
                    <span>GBP {subtotal}</span>
                  </div>
                  <div className="mt-3 hidden items-center justify-between text-sm text-stone-600 sm:flex">
                    <span>Cleaning fee</span>
                    <span>GBP {cleaningFee}</span>
                  </div>
                  <div className="mt-3 hidden items-center justify-between text-sm text-stone-600 sm:flex">
                    <span>Service fee</span>
                    <span>GBP 0</span>
                  </div>
                  <div className="sm:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Stay total</p>
                        <p className="mt-1 text-sm text-stone-600">
                          {selectedNights} nights{cleaningFee ? ` + GBP ${cleaningFee} cleaning` : ""}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-stone-900">GBP {total}</p>
                    </div>
                  </div>
                  <div className="mt-4 hidden border-t border-stone-900/10 pt-4 sm:block">
                    <div className="flex items-center justify-between text-base font-semibold text-stone-900">
                      <span>Total</span>
                      <span>GBP {total}</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-500">
                      Booking now gives guests the best available rate and direct host support.
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-base font-medium text-stone-900">Choose your dates to see pricing</p>
                  <p className="mt-2 text-sm text-stone-500">
                    Once you select a valid check-in and check-out, the stay total will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className={`mt-5 flex items-center gap-3 text-sm text-stone-500 ${isMobileBookingOverlayOpen ? "px-5" : ""}`}>
              <ShieldIcon />
              <span>Secure booking request. You will receive host confirmation by email.</span>
            </div>

            {bookingError ? (
              <p className={`mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-up ${isMobileBookingOverlayOpen ? "mx-5" : ""}`}>
                {bookingError}
              </p>
            ) : null}

            {bookingSuccess ? (
              <p className={`mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-pulse-soft ${isMobileBookingOverlayOpen ? "mx-5" : ""}`}>
                {bookingSuccess}
              </p>
            ) : null}

            {bookingStep === 1 ? (
              <button
                type="button"
                onClick={handleContinue}
                disabled={!hasValidDateRange}
                className={`mt-6 rounded-full bg-stone-900 px-6 py-4 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 disabled:hover:translate-y-0 disabled:hover:bg-stone-200 ${
                  isMobileBookingOverlayOpen
                    ? "mx-5 mb-[max(1rem,env(safe-area-inset-bottom))] mt-auto block"
                    : "mobile-booking-cta w-full"
                }`}
              >
                {hasValidDateRange ? "Continue" : "Please select check-in and check-out"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!hasValidGuestDetails}
                className={`mt-6 rounded-full bg-stone-900 px-6 py-4 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 disabled:hover:translate-y-0 disabled:hover:bg-stone-200 ${
                  isMobileBookingOverlayOpen
                    ? "mx-5 mb-[max(1rem,env(safe-area-inset-bottom))] mt-auto block"
                    : "mobile-booking-cta w-full"
                }`}
              >
                {hasValidGuestDetails ? "Request booking" : "Please complete required fields"}
              </button>
            )}
            </div>
            </form>
          )}
        </div>
      </section>

      <section id="reviews" className="container-shell section-spacing">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">Guest reviews</p>
          <h2 className="mt-3 text-3xl text-stone-900 sm:text-4xl">What guests loved about their stay.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_60px_rgba(28,25,23,0.06)]"
            >
              <div className="mb-4 flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <StarIcon key={starIndex} />
                ))}
              </div>
              <p className="text-lg leading-8 text-stone-700">&ldquo;{review.quote}&rdquo;</p>
              <div className="mt-6">
                <p className="text-base font-semibold text-stone-900">{review.name}</p>
                <p className="text-sm text-stone-500">{review.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="location" ref={locationSectionRef} className="container-shell pb-16 sm:pb-20">
        <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_24px_60px_rgba(28,25,23,0.08)]">
          <div className="border-b border-stone-200 px-6 py-6 sm:px-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">Location</p>
              <h2 className="mt-4 text-4xl text-stone-900">
                Moments from village pubs, walking trails, and market towns.
              </h2>
              <p className="mt-4 text-lg leading-8 text-stone-600">
                Explore the cottage location and a few nearby favourites for food, walks, and easy day trips.
              </p>
            </div>
          </div>
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-4 sm:p-5">
              <div className="h-[320px] overflow-hidden rounded-[24px] ring-1 ring-stone-200 sm:h-[420px] lg:h-[520px]">
                {shouldRenderMap ? (
                  <Suspense fallback={<div className="h-full w-full bg-[#efe4d4]" />}>
                    <PropertyMap position={propertyPosition} />
                  </Suspense>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(239,228,212,0.95),rgba(232,223,208,0.95))] text-sm text-stone-500">
                    Loading map...
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-3 border-t border-stone-200 p-6 text-sm text-stone-600 lg:border-l lg:border-t-0 lg:p-8">
              <div className="rounded-[18px] bg-[#f8f4ed] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900 ring-1 ring-stone-200">
                    <VillageIcon />
                  </span>
                  <div>
                    <p className="font-medium text-stone-900">10 mins to Mereford village centre</p>
                <p className="mt-1">Easy access to village shops, cafes, and riverside walks.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] bg-[#f8f4ed] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900 ring-1 ring-stone-200">
                    <ParkingIcon />
                  </span>
                  <div>
                    <p className="font-medium text-stone-900">Easy parking on site</p>
                    <p className="mt-1">Private parking makes arrival simple for families and weekend stays.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] bg-[#f8f4ed] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900 ring-1 ring-stone-200">
                    <CompassIcon />
                  </span>
                  <div>
                    <p className="font-medium text-stone-900">Great base for weekend escapes</p>
                    <p className="mt-1">Close to walking trails, pubs, farm shops, and quiet fictional villages.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] bg-white p-4 ring-1 ring-stone-200">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f4ed] text-stone-900">
                    <SparklesIcon />
                  </span>
                  <p className="font-medium text-stone-900">Nearby highlights</p>
                </div>
                <ul className="mt-3 space-y-2 text-stone-600">
                  <li className="flex items-center gap-2"><PubIcon /> The Lantern Fox</li>
                  <li className="flex items-center gap-2"><WalkIcon /> Mereford Riverside Walk</li>
                  <li className="flex items-center gap-2"><BasketIcon /> Hollow Farm Pantry</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell pb-16 sm:pb-20">
        <div className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.08)] sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amber-800/80">Booking promise</p>
            <h2 className="mt-4 text-4xl text-stone-900">Book now for the best rate.</h2>
            <p className="mt-4 text-lg leading-8 text-stone-600">
              Skip marketplace friction and enquire with the host directly. Better pricing, clearer
              communication, and a more personal stay from the first click.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#booking"
              className="rounded-full bg-stone-900 px-6 py-4 text-center text-base font-medium text-white transition hover:bg-stone-800"
            >
              Book now
            </a>
            <div className="flex items-center gap-3 rounded-[22px] bg-[#f8f4ed] px-4 py-4 text-sm text-stone-600">
              <CheckIcon />
              <span>No booking fees. Best-rate guarantee for direct guests.</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200/80 bg-[#efe4d4]">
        <div className="container-shell py-10">
          <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Foxglove Hollow Cottage</p>
              <p className="mt-3 max-w-md text-base leading-7 text-stone-700">
                This is a demo site for a completely fictional holiday cottage in a made-up location, created to show how a DirectRental booking website can feel.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Contact</p>
              <div className="mt-3 grid gap-2 text-sm text-stone-600">
                <p>hello@foxglovehollow.co.uk</p>
                <p>+44 7700 900123</p>
                <p>Direct booking enquiries welcome</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-stone-300/70 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Foxglove Hollow Cottage. All rights reserved.</p>
            <p>Powered by DirectRental</p>
          </div>
        </div>
      </footer>

    </main>
  );
}

function buildCalendarDays(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));
  const daysInMonth = last.getUTCDate();
  const startOffset = (first.getUTCDay() + 6) % 7;
  const cells: Array<string | null> = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${year}-${pad(monthIndex + 1)}-${pad(day)}`);
  }

  return cells;
}

function buildCalendarMonths(startYear: number, startMonthIndex: number, count: number) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(Date.UTC(startYear, startMonthIndex + offset, 1));
    return {
      year: date.getUTCFullYear(),
      monthIndex: date.getUTCMonth(),
      label: date.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    };
  });
}

function isRangeAvailable(start: string, end: string) {
  let current = start;

  while (current < end) {
    if (blockedDates.has(current)) {
      return false;
    }
    current = addDays(current, 1);
  }

  return true;
}

function getNightCount(start: string, end: string) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
}

function formatDisplayDate(date: string) {
  return parseDate(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  return /^[+]?[\d\s().-]{7,20}$/.test(value.trim());
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDate(value: string) {
  const [year = 0, month = 1, day = 1] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(value: string, days: number) {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function AmenityIcon({ index }: { index: number }) {
  const icons = [
    <WifiIcon key="wifi" />,
    <ParkingIcon key="parking" />,
    <LeafIcon key="garden" />,
    <KitchenIcon key="kitchen" />,
    <FireIcon key="fire" />,
    <PawIcon key="paw" />,
    <BagIcon key="bag" />,
    <TvIcon key="tv" />,
  ];

  return <span className="text-stone-900">{icons[index] ?? <CheckIcon />}</span>;
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M10 1.8l2.5 5.06 5.58.81-4.04 3.94.96 5.56L10 14.53 5 17.17l.96-5.56L1.92 7.67l5.58-.81L10 1.8z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M9 4H4v5" />
      <path d="M15 4h5v5" />
      <path d="M9 20H4v-5" />
      <path d="M15 20h5v-5" />
      <path d="M10 4L4 10" />
      <path d="M14 4l6 6" />
      <path d="M4 14l6 6" />
      <path d="M20 14l-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function GuestsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M16 19a4 4 0 00-8 0" />
      <circle cx="12" cy="11" r="3" />
      <path d="M21 19a4 4 0 00-3-3.87" />
      <path d="M3 19a4 4 0 013-3.87" />
      <path d="M17.5 8.5a2.5 2.5 0 010 5" />
      <path d="M6.5 8.5a2.5 2.5 0 000 5" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 18v-7h18v7" />
      <path d="M3 14h18" />
      <path d="M7 11V8h4a2 2 0 012 2v1" />
      <path d="M3 18v2" />
      <path d="M21 18v2" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 13h16v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1z" />
      <path d="M6 17v2" />
      <path d="M18 17v2" />
      <path d="M8 13V7a2 2 0 114 0" />
      <path d="M12 9h2" />
    </svg>
  );
}

function VillageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 20h18" />
      <path d="M5 20v-7l4-3 4 3v7" />
      <path d="M13 20v-11l3-2 3 2v11" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M15.5 8.5l-2.6 6.1-6.1 2.6 2.6-6.1 6.1-2.6z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
    </svg>
  );
}

function PubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 4h7v7a3 3 0 01-3 3h-1v6" />
      <path d="M7 8h7" />
      <path d="M18 4v4a2 2 0 01-2 2h-2" />
    </svg>
  );
}

function WalkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <circle cx="14" cy="5" r="2" />
      <path d="M12 20l1.5-5-2.5-2 1-4 3 2h2" />
      <path d="M10 11l-3 3" />
      <path d="M13 20h4" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 10h14l-1.5 9h-11L5 10z" />
      <path d="M9 10l3-5 3 5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.8-2.8 8.6-7 10-4.2-1.4-7-5.2-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 8.5C7.3 4.1 16.7 4.1 22 8.5" />
      <path d="M5 12c4.1-3.3 9.9-3.3 14 0" />
      <path d="M8.5 15.5c2.1-1.6 4.9-1.6 7 0" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 20V4h6a4 4 0 010 8H7" />
      <path d="M7 12h6" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M19 5c-6.5 0-11 4.5-11 11 6.5 0 11-4.5 11-11z" />
      <path d="M6 18c2-3 5-5 9-7" />
    </svg>
  );
}

function KitchenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 5h16v14H4z" />
      <path d="M9 5v14" />
      <path d="M12 9h5" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3c2 3 4 4.5 4 8a4 4 0 11-8 0c0-2.5 1.1-4 4-8z" />
      <path d="M12 13c1.2 1.1 2 2.1 2 3.4A2 2 0 0112 18a2 2 0 01-2-1.6c0-1.3.8-2.3 2-3.4z" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <circle cx="7" cy="9" r="2" />
      <circle cx="12" cy="6.5" r="2" />
      <circle cx="17" cy="9" r="2" />
      <circle cx="9" cy="14" r="2" />
      <path d="M12 20c3 0 5-1.7 5-3.8 0-1.8-1.4-3.2-3.1-3.2-1 0-1.6.3-1.9.8-.3-.5-.9-.8-1.9-.8C8.4 13 7 14.4 7 16.2 7 18.3 9 20 12 20z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 9h12l-1 11H7L6 9z" />
      <path d="M9 9V7a3 3 0 016 0v2" />
    </svg>
  );
}

function TvIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 17v3" />
    </svg>
  );
}
