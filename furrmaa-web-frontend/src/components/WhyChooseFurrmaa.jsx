"use client"
import { fetchWhyChooseFeatures } from "@/lib/api";
import { useEffect, useState } from "react";
import React from "react";
import { IoChevronDown } from 'react-icons/io5';
import { fetchFaqs } from "@/lib/api";
import { AdminImage } from "@/app/admin/components/AdminImage";

export default function WhyChooseFurrmaa() {
  const [features, setFeatures] = useState([]);
  const [tagline, setTagline] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchWhyChooseFeatures()
      .then(({ features: list, tagline: t }) => {
        if (cancelled) return;
        setFeatures(list || []);
        setTagline(t || "");
      })
      .catch(() => {
        if (!cancelled) {
          setFeatures([]);
          setTagline("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultTagline =
    "Furrmaa Is Built To Simplify Pet Parenting Without Compromising Care, Safety, Or Love.";

  return (
    <>
      <section className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-4xl md:text-4xl font-bold text-gray-900 mb-14">
            Why Pet Parents Choose Furrmaa
          </h2>

          {loading ? (
            <p className="text-gray-500 mb-14">Loading...</p>
          ) : features.length === 0 ? (
            <p className="text-gray-500 mb-14">No features added yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
              {features.map((item) => (
                <div key={item._id} className="flex flex-col items-center">
                  {item.image ? (
                    <AdminImage
                      src={item.image}
                      alt={item.title}
                      className="h-20 mb-4 object-contain w-full max-w-[120px]"
                    />
                  ) : (
                    <div className="h-20 w-20 mb-4 bg-gray-100 rounded-xl" />
                  )}
                  <p className="text-sm font-medium text-gray-700 whitespace-pre-line">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="text-xs text-gray-500 mt-1 text-center max-w-[140px] leading-snug">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <p className="text-gray-700 font-semibold max-w-4xl mx-auto">
            {tagline || defaultTagline}
          </p>
        </div>
      </section>

      <DownloadApk />
      <FaqSection />
    </>
  );
}

function DownloadApk() {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-7xl mx-auto p-8 rounded-2xl"
        style={{
          background: "linear-gradient(180deg, #F3F8FF 0%, #C0DBFF 100%)",
        }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-14">
          <div>
            <p className="text-xl font-bold text-gray-900 mb-8">
              Download the Furrmaa App
            </p>

            <h2 className="text-4xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Care for Your <br />
              Pet Anytime, Anywhere
            </h2>
            <p className="text-gray-700 max-w-xl mb-8 leading-relaxed">
              Everything Furrmaa offers is available right in your pocket.
              Manage your pet&apos;s needs, track health, shop essentials,
              book services, and stay connected with the pet community
              wherever you are.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl hover:scale-105 transition">
                <img src="/images/buttons/apple-button.png" className="w-32" alt="App Store" />
              </button>
              <button className="flex items-center gap-2 rounded-xl hover:scale-105 transition">
                <img src="/images/buttons/play-button.png" className="w-34" alt="Google Play" />
              </button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end gap-6">
            <img
              src="/images/twophones.png"
              alt="App Home"
              className="w-[340px] md:w-[460px] drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFaqs()
      .then((list) => {
        if (!cancelled) {
          setFaqs((list || []).map((item) => ({ q: item.question, a: item.answer })));
        }
      })
      .catch(() => {
        if (!cancelled) setFaqs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl leading-13 md:text-4xl font-bold text-gray-900">
            Frequently Asked
            <br />
            Questions
          </h2>
        </div>
        <div className="space-y-6">
          {loading ? (
            <p className="text-gray-500">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <p className="text-gray-500">No FAQs available right now.</p>
          ) : (
            faqs.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <h4 className="text-base font-semibold text-gray-900">{item.q}</h4>
                  <span
                    className={`ml-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-black transition-transform duration-300 ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <IoChevronDown />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeIndex === index ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))
          )}
          <button className="mt-10 bg-slate-900 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-slate-800 transition">
            See All FAQ&apos;s →
          </button>
        </div>
      </div>
    </section>
  );
}
