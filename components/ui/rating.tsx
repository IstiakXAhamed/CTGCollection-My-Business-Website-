import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  readonly?: boolean
  onRatingChange?: (rating: number) => void
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ rating, maxRating = 5, size = "md", showValue = false, readonly = true, onRatingChange, className, ...props }, ref) => {
    const [hoverRating, setHoverRating] = React.useState(0)

    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    }

    const handleClick = (value: number) => {
      if (!readonly && onRatingChange) {
        onRatingChange(value)
      }
    }

    const handleMouseEnter = (value: number) => {
      if (!readonly) {
        setHoverRating(value)
      }
    }

    const handleMouseLeave = () => {
      if (!readonly) {
        setHoverRating(0)
      }
    }

    const displayRating = hoverRating || rating

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
        <div className="flex gap-0.5">
          {[...Array(maxRating)].map((_, index) => {
            const value = index + 1
            const isFilled = value <= Math.round(displayRating)
            
            return (
              <button
                key={index}
                type="button"
                disabled={readonly}
                onClick={() => handleClick(value)}
                onMouseEnter={() => handleMouseEnter(value)}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  "transition-all",
                  !readonly && "cursor-pointer hover:scale-110",
                  readonly && "cursor-default"
                )}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                    !readonly && hoverRating >= value && "fill-yellow-300 text-yellow-300"
                  )}
                />
              </button>
            )
          })}
        </div>
        {showValue && (
          <span className="text-sm text-muted-foreground ml-1">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    )
  }
)

Rating.displayName = "Rating"

export { Rating }
