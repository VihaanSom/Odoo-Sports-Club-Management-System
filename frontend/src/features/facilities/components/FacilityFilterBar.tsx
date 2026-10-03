import React from 'react';
import {
  FaVolleyball,
  FaTableTennisPaddleBall,
  FaBasketball,
  FaPersonSwimming,
  FaDumbbell,
} from 'react-icons/fa6';

interface FacilityFilterBarProps {
  sports: string[];
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

export const FacilityFilterBar: React.FC<FacilityFilterBarProps> = ({
  sports,
  selectedSport,
  onSelectSport,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {sports.map((sport) => (
        <button
          key={sport}
          type="button"
          onClick={() => onSelectSport(sport)}
          className={`btn btn-sm ${
            selectedSport === sport ? 'btn-primary shadow-xs' : 'btn-outline border-base-300'
          }`}
        >
          {sport === 'Tennis' && <FaVolleyball className="size-3 mr-1" />}
          {sport === 'Badminton' && <FaTableTennisPaddleBall className="size-3 mr-1" />}
          {sport === 'Basketball' && <FaBasketball className="size-3 mr-1" />}
          {sport === 'Swimming' && <FaPersonSwimming className="size-3 mr-1" />}
          {sport === 'Gym' && <FaDumbbell className="size-3 mr-1" />}
          {sport}
        </button>
      ))}
    </div>
  );
};
