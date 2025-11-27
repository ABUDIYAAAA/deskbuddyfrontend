import React, { useState } from 'react';
import './AdvancedFilter.css';

const AdvancedFilter = ({ 
  searchTerm, 
  onSearchChange, 
  selectedStage, 
  onStageChange, 
  selectedVolunteer, 
  onVolunteerChange,
  stages,
  volunteers 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    searchTerm && 1,
    selectedStage !== 'all' && 1,
    selectedVolunteer !== 'all' && 1
  ].filter(Boolean).length;

  return (
    <div className="advanced-filter-container">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filter-toggle">
          <svg 
            className={`filter-icon ${isExpanded ? 'expanded' : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
          </svg>
          <span>Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span className="filter-count">{activeFiltersCount}</span>
          )}
        </div>
      </div>

      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="filter-grid">
          {/* Search Bar */}
          <div className="filter-group">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </label>
            <input
              type="text"
              className="filter-input"
              placeholder="Search by name, ID, volunteer..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Stage Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                <circle cx="7" cy="7" r="1"/>
              </svg>
              Stage
            </label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={selectedStage}
                onChange={(e) => onStageChange(e.target.value)}
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>
                    {stage === 'all' ? 'All Stages' : stage}
                  </option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>

          {/* Volunteer Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m23 21-2-2"/>
                <path d="m16 16 4 4 4-4"/>
              </svg>
              Volunteer
            </label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={selectedVolunteer}
                onChange={(e) => onVolunteerChange(e.target.value)}
              >
                {volunteers.map(volunteer => (
                  <option key={volunteer} value={volunteer}>
                    {volunteer === 'all' ? 'All Volunteers' : volunteer}
                  </option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="active-filters">
            {searchTerm && (
              <span className="filter-chip">
                Search: {searchTerm}
                <button 
                  className="chip-remove"
                  onClick={() => onSearchChange('')}
                >
                  ×
                </button>
              </span>
            )}
            {selectedStage !== 'all' && (
              <span className="filter-chip">
                Stage: {selectedStage}
                <button 
                  className="chip-remove"
                  onClick={() => onStageChange('all')}
                >
                  ×
                </button>
              </span>
            )}
            {selectedVolunteer !== 'all' && (
              <span className="filter-chip">
                Volunteer: {selectedVolunteer}
                <button 
                  className="chip-remove"
                  onClick={() => onVolunteerChange('all')}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilter; 