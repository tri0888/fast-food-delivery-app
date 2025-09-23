import React, { useState, useContext } from 'react'
import './Filter.css';

const Filter = ({setPriceRange, setSearchTerm}) => {
    const [tempPriceRange, setTempPriceRange] = useState(200); // giá trị tạm khi kéo slider
    const [tempSearchTerm, setTempSearchTerm] = useState('');
    return (
        <div className="filter-sidebar">
            <h3>Filters</h3>
            <div className="filter-group">
                <h4>Search</h4>
                <input 
                    type="text"
                    placeholder="Search by name..."
                    value={tempSearchTerm}
                    onChange={(e)=>setTempSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="filter-group">
                <h4>Price Range</h4>
                <input 
                    type="range" 
                    min="0" 
                    max={200} 
                    value={tempPriceRange} 
                    onChange={(e)=>setTempPriceRange(parseInt(e.target.value))}
                    className="range-slider"
                />
                <div className="price-inputs">
                    <span className="price-display">$0</span>
                    <span className="price-display">${tempPriceRange}</span>
                </div>
            </div>
            

            <button className="apply-button" onClick={()=>{setPriceRange(tempPriceRange);
                                                           setSearchTerm(tempSearchTerm)}}>
                Apply
            </button>
        </div>
    );
};

export default Filter;