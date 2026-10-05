'use client';

import { useState } from 'react';

export default function StarRating({ onSelectRating }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    onSelectRating(rating);
  };

  return (
    <div className="flex items-center justify-center gap-2 my-6">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || selectedRating);
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRatingClick(star)}
            className="p-1 transition-transform duration-200 hover:scale-125 focus:outline-none"
          >
            <svg
              className={`w-12 h-12 transition-colors duration-200 ${
                isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}