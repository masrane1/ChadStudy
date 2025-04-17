import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  count?: number;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (rating: number) => void;
}

export default function StarRating({
  value,
  count = 0,
  readonly = false,
  size = "md",
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  // Determine size based on prop
  const getStarSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };
  
  const starSize = getStarSize();
  
  // Generate stars
  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const isFilled = hoverRating ? starValue <= hoverRating : starValue <= value;
      
      return (
        <button
          key={index}
          type="button"
          className={`${
            isFilled ? "text-yellow-400" : "text-gray-300"
          } focus:outline-none ${!readonly && "cursor-pointer hover:scale-110"} transition-transform`}
          onClick={() => {
            if (!readonly && onChange) {
              onChange(starValue);
            }
          }}
          onMouseEnter={() => {
            if (!readonly) {
              setHoverRating(starValue);
            }
          }}
          onMouseLeave={() => {
            if (!readonly) {
              setHoverRating(0);
            }
          }}
          disabled={readonly}
        >
          <Star className={`${starSize} fill-current`} />
        </button>
      );
    });
  };
  
  return (
    <div className="flex items-center">
      <div className="flex">{renderStars()}</div>
      {count > 0 && (
        <span className="text-xs text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
}
