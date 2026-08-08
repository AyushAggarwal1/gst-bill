"use client";

import { useState } from "react";
import Link from "next/link";

interface OnboardingChecklistProps {
  hasProfile: boolean;
  customers: number;
  items: number;
  bills: number;
  userId?: string;
}

interface Step {
  key: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  done: boolean;
  icon: React.ReactNode;
}

// First-run checklist: guides a new user profile -> customer -> item -> first
// invoice. Auto-hides once all four are done, and can be dismissed early.
export default function OnboardingChecklist({
  hasProfile,
  customers,
  items,
  bills,
  userId,
}: OnboardingChecklistProps) {
  const dismissKey = `gstly:onboarding-dismissed:${userId || "anon"}`;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(dismissKey) === "1";
  });

  const steps: Step[] = [
    {
      key: "profile",
      title: "Set up your business profile",
      description: "Add your firm name, GST number, logo and UPI ID.",
      cta: "Set up profile",
      href: "/dashboard/profile",
      done: hasProfile,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
    },
    {
      key: "customer",
      title: "Add your first customer",
      description: "Save who you bill, with their GST and contact details.",
      cta: "Add customer",
      href: "/dashboard/customers/new",
      done: customers > 0,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      ),
    },
    {
      key: "item",
      title: "Add your first item",
      description: "Create a product or service with its HSN code and tax rate.",
      cta: "Add item",
      href: "/dashboard/items/new",
      done: items > 0,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      ),
    },
    {
      key: "invoice",
      title: "Create your first invoice",
      description: "Generate a GST invoice and share it over WhatsApp.",
      cta: "Create invoice",
      href: "/dashboard/bills/new",
      done: bills > 0,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;

  // Nothing to nudge once everything is done, or if the user dismissed it.
  if (completed === total || dismissed) return null;

  const nextIndex = steps.findIndex((s) => !s.done);
  const progressPct = Math.round((completed / total) * 100);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(dismissKey, "1");
    }
    setDismissed(true);
  };

  return (
    <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Getting started</p>
            <h2 className="mt-0.5 text-base sm:text-lg font-semibold text-gray-900">
              Finish setting up GSTly
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              A few quick steps to send your first GST invoice.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
            aria-label="Dismiss checklist"
            title="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 flex-shrink-0 tabular-nums">
            {completed} of {total}
          </span>
        </div>
      </div>

      {/* Steps */}
      <ul className="divide-y divide-gray-100">
        {steps.map((step, i) => {
          const isNext = i === nextIndex;
          return (
            <li
              key={step.key}
              className={`flex items-center gap-3 sm:gap-4 px-5 py-3.5 sm:px-6 sm:py-4 ${
                isNext ? "bg-blue-50/40" : ""
              }`}
            >
              {/* Indicator */}
              <div className="flex-shrink-0">
                {step.done ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isNext ? "bg-blue-600" : "bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${isNext ? "text-white" : "text-gray-400"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {step.icon}
                    </svg>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.done ? "text-gray-500" : "text-gray-900"}`}>
                  {step.title}
                </p>
                {!step.done && (
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{step.description}</p>
                )}
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {step.done ? (
                  <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                    Done
                  </span>
                ) : (
                  <Link
                    href={step.href}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                      isNext
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {step.cta}
                    <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
