import React from 'react';
import { InfoCard } from './InfoCard';
import { useFormatters } from './hooks/useFormatters';

// Import types from the actual TravelPlan interface
interface AccommodationOption {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort' | 'guesthouse' | 'bnb';
  rating: number;
  pricePerNight: {
    amount: number;
    currency: string;
  };
  totalPrice: {
    amount: number;
    currency: string;
  };
  location: {
    address: string;
    distanceFromCenter: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  description: string;
  cancellationPolicy: string;
  bookingUrl?: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guestCapacity: number;
  breakfastIncluded: boolean;
}

interface AccommodationDetailsProps {
  accommodations?: AccommodationOption[] | null;
}

const AccommodationCard: React.FC<{ accommodation: AccommodationOption }> = ({ accommodation }) => {
  const { formatCurrency, formatDate } = useFormatters();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    
    return stars;
  };

  const getAccommodationIcon = (type: string) => {
    const icons: Record<string, string> = {
      'hotel': '🏨',
      'hostel': '🏠',
      'apartment': '🏢',
      'villa': '🏡',
      'resort': '🏖️',
      'bnb': '🏠',
      'guesthouse': '🏘️',
    };
    
    const lowerType = type.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerType.includes(key)) {
        return icon;
      }
    }
    return '🏨';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getAccommodationIcon(accommodation.type)}</span>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {accommodation.name}
            </h3>
            <p className="text-gray-600 capitalize">{accommodation.type}</p>
            <p className="text-sm text-gray-500">{accommodation.roomType} • {accommodation.guestCapacity} guest{accommodation.guestCapacity !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(accommodation.pricePerNight.amount, accommodation.pricePerNight.currency)}
          </p>
          <p className="text-sm text-gray-500">per night</p>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            Total: {formatCurrency(accommodation.totalPrice.amount, accommodation.totalPrice.currency)}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center">
          {renderStars(accommodation.rating)}
        </div>
        <span className="text-gray-600 text-sm">({accommodation.rating}/5)</span>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 mb-3 text-gray-600">
        <span>📍</span>
        <span className="text-sm">{accommodation.location.address}</span>
        <span className="text-xs text-gray-500 ml-2">({accommodation.location.distanceFromCenter} from center)</span>
      </div>

      {/* Check-in/Check-out */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 font-medium">Check-in</p>
          <p className="font-semibold text-gray-800">{formatDate(accommodation.checkIn)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Check-out</p>
          <p className="font-semibold text-gray-800">{formatDate(accommodation.checkOut)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Breakfast</p>
          <p className="font-semibold text-gray-800">{accommodation.breakfastIncluded ? '✅ Included' : '❌ Not included'}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{accommodation.description}</p>
      </div>

      {/* Amenities */}
      {accommodation.amenities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {accommodation.amenities.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cancellation Policy */}
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-1">Cancellation Policy</h4>
        <p className="text-sm text-gray-600">{accommodation.cancellationPolicy}</p>
      </div>

      {/* Booking Button */}
      {accommodation.bookingUrl && (
        <div className="pt-4 border-t border-gray-100">
          <a
            href={accommodation.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <span>🏨</span>
            Book Now
          </a>
        </div>
      )}
    </div>
  );
};

export const AccommodationDetails: React.FC<AccommodationDetailsProps> = ({ accommodations }) => {
  if (!accommodations || accommodations.length === 0) {
    return null;
  }

  return (
    <InfoCard title="Accommodation" className="bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="space-y-6">
        {accommodations.map((accommodation, index) => (
          <AccommodationCard key={index} accommodation={accommodation} />
        ))}
      </div>
    </InfoCard>
  );
};
