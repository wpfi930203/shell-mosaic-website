"use client";

import { useSiteData } from "@/components/admin/use-site-data";

export default function AdminReviewsPage() {
  const { data, save, status } = useSiteData();

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Reviews</p>
          <h1 className="mt-2 text-4xl font-semibold text-stone-900">Moderate feedback.</h1>
        </div>
        <p className="text-sm text-stone-500">{status}</p>
      </div>
      <div className="mt-6 space-y-5">
        {data.reviews.map((review, index) => (
          <div key={review.id} className="rounded-[24px] border border-stone-200 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_200px]">
              <textarea
                value={review.content}
                rows={4}
                onChange={(event) => {
                  const nextReviews = [...data.reviews];
                  nextReviews[index] = { ...review, content: event.target.value };
                  save({ ...data, reviews: nextReviews });
                }}
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <select
                value={review.status}
                onChange={(event) => {
                  const nextReviews = [...data.reviews];
                  nextReviews[index] = {
                    ...review,
                    status: event.target.value as typeof review.status,
                  };
                  save({ ...data, reviews: nextReviews });
                }}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
              >
                {["pending", "approved", "rejected"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
