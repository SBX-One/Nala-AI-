"use client";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPsychiatrist: any;
  availableDates: any[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  timeSlots: any[];
  selectedTimeSlot: { start: string; end: string } | null;
  onSelectTimeSlot: (slot: { start: string; end: string }) => void;
  complaint: string;
  onComplaintChange: (val: string) => void;
  step: number;
  setStep: (step: number) => void;
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  billingInfo: {
    cardHolder: string;
    cardNumber: string;
    expireDate: string;
    cvv: string;
  };
  onBillingInfoChange: (info: any) => void;
  isSubmitting: boolean;
  onPaymentSubmit: () => void;
  idr: (number: number) => string;
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedPsychiatrist,
  availableDates,
  selectedDate,
  onSelectDate,
  timeSlots,
  selectedTimeSlot,
  onSelectTimeSlot,
  complaint,
  onComplaintChange,
  step,
  setStep,
  paymentMethod,
  onPaymentMethodChange,
  billingInfo,
  onBillingInfoChange,
  isSubmitting,
  onPaymentSubmit,
  idr,
}: BookingModalProps) {
  const getInitials = (name: string) => {
    const cleanName = name.replace(/^Dr\.?\s+/i, "");
    const parts = cleanName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 z-100 flex justify-end items-center transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white w-full md:max-w-lg h-full md:rounded-l-3xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex justify-between items-center">
          <h2 className="text-heading-6-bold text-text-heading">
            {step === 1 ? "Book Specialist" : "Payment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-default rounded-full text-icon-default transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 6L6 18M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8">
          {step === 1 ? (
            <div className="flex flex-col gap-8">
              {/* Specialist Mini Card */}
              <div className="flex items-center gap-4 rounded-2xl">
                <div className="bg-surface-disabled size-20 rounded-lg overflow-hidden shrink-0">
                  {selectedPsychiatrist?.image ? (
                    <img 
                      src={selectedPsychiatrist.image} 
                      alt={selectedPsychiatrist.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-heading-5-bold">
                      {getInitials(selectedPsychiatrist?.name || "??")}
                    </div>
                  )}
                </div>
                <div className="grid">
                  <p className="text-body-xl-semibold">
                    {selectedPsychiatrist?.name}
                  </p>
                  <p className="text-body-sm-semibold text-text-action">
                    {selectedPsychiatrist?.spesialist}
                  </p>
                </div>
              </div>

              {/* Select Date */}
              <div className="flex flex-col gap-4">
                <p className="text-label-base-bold text-text-label">
                  Select Date
                </p>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {availableDates.map((d, idx) => (
                    <button
                      key={idx}
                      disabled={!d.isAvailable}
                      onClick={() => onSelectDate(d.date)}
                      className={`flex flex-col gap-1 items-center justify-center rounded-lg border transition-all min-w-18 py-3 shrink-0 ${
                        !d.isAvailable
                          ? "opacity-30 cursor-not-allowed bg-neutral-50"
                          : selectedDate?.toDateString() ===
                            d.date.toDateString()
                            ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                            : "border-border-default bg-white hover:border-primary-200"
                      }`}
                    >
                      <span className="text-label-small-semibold">
                        {d.label}
                      </span>
                      <span className="text-body-xl-semibold">
                        {d.dayNum}
                      </span>
                      <span className="text-label-caption-medium">
                        {d.month}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Time */}
              <div className="flex flex-col gap-4">
                <p className="text-label-base-bold text-text-label">
                  Select Time
                </p>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectTimeSlot(t)}
                          className={`py-3 rounded-xl border text-sm transition-all text-center ${
                            selectedTimeSlot?.start === t.start
                              ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                              : "border-border-default bg-white hover:border-primary-200"
                          }`}
                        >
                          {t.start}-{t.end}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-3 text-body-sm-medium text-text-subheading py-4 text-center">
                        No time slots available for this day.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-body-sm-medium text-text-placeholder py-4 border-2 border-dashed border-border-default rounded-xl text-center">
                    Please select a date first
                  </p>
                )}
              </div>

              {/* Complaints */}
              <div className="flex flex-col gap-3">
                <p className="text-label-base-bold text-text-label">
                  Complaints
                </p>
                <textarea
                  value={complaint}
                  onChange={(e) => onComplaintChange(e.target.value)}
                  className="w-full h-32 p-4 rounded-xl border border-border-default bg-surface-default text-body-sm-regular focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
                  placeholder="Describe your complaints here..."
                />
              </div>
              <div className="grid gap-4">
                <div className="flex justify-between items-center mt-4">
                  <p className="text-body-base-medium text-text-subheading">
                    Grand Total
                  </p>
                  <p className="text-body-xl-bold text-text-action">
                    {idr(selectedPsychiatrist?.Price || 0)}
                  </p>
                </div>
                <button
                  disabled={!selectedDate || !selectedTimeSlot}
                  onClick={() => setStep(2)}
                  className="button-primary-large w-full justify-center py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between min-h-full h-fit gap-8">
              {/* Payment Method */}
              <div className="flex flex-col gap-4">
                <p className="text-body-base-bold">Payment Method</p>
                <div className="flex flex-col gap-3">
                  {["Credit Card", "QRIS", "Bank Transfer"].map((pm) => (
                    <button
                      key={pm}
                      onClick={() => onPaymentMethodChange(pm)}
                      className={`w-full py-4 rounded-xl border transition-all text-center font-semibold ${
                        paymentMethod === pm
                          ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                          : "border-border-default bg-white hover:border-primary-200"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
                <hr className="border-border-default" />
              </div>

              {/* QRIS Display */}
              {paymentMethod === "QRIS" && (
                <div className="flex flex-col items-center gap-4 p-6 bg-surface-default rounded-2xl border border-border-default">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-border-default">
                    <img 
                      src="/images/qris.jpeg" 
                      alt="QRIS" 
                      className="w-full max-w-[240px] h-auto object-contain"
                    />
                  </div>
                  <p className="text-body-sm-medium text-text-subheading text-center">
                    Scan QR code di atas untuk melakukan pembayaran
                  </p>
                </div>
              )}

              {/* Card Form - Only for Credit Card */}
              {paymentMethod === "Credit Card" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-label-small-semibold text-text-label">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      value={billingInfo.cardHolder}
                      onChange={(e) =>
                        onBillingInfoChange({
                          ...billingInfo,
                          cardHolder: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
                      placeholder="Name on card"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-label-small-semibold text-text-label">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={billingInfo.cardNumber}
                      onChange={(e) =>
                        onBillingInfoChange({
                          ...billingInfo,
                          cardNumber: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
                      placeholder="1234 5678 9101 1121"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-label-small-semibold text-text-label">
                        Expire Date
                      </label>
                      <input
                        type="text"
                        value={billingInfo.expireDate}
                        onChange={(e) =>
                          onBillingInfoChange({
                            ...billingInfo,
                            expireDate: e.target.value,
                          })
                        }
                        className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-small-semibold text-text-label">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={billingInfo.cvv}
                        onChange={(e) =>
                          onBillingInfoChange({
                            ...billingInfo,
                            cvv: e.target.value,
                          })
                        }
                        className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-text-subheading">
                    <span className="text-label-base-semibold text-text-subheading">
                      Specialist Fee
                    </span>
                    <span className="text-label-base-medium text-text-body">
                      {idr(selectedPsychiatrist?.Price || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-text-subheading">
                    <span className="text-label-base-semibold text-text-subheading">
                      Platform Fee
                    </span>
                    <span className="text-label-base-medium text-text-body">
                      {idr(2000)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-border-default">
                    <span className="text-label-base-semibold text-text-subheading">
                      Grand Total
                    </span>
                    <span className="text-label-large-bold text-text-action">
                      {idr((selectedPsychiatrist?.Price || 0) + 2000)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="button-outline-large flex-1 justify-center"
                  >
                    Back
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={onPaymentSubmit}
                    className="button-primary-large flex-2 justify-center py-4 rounded-xl text-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="size-6 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                      "Confirm Payment"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
