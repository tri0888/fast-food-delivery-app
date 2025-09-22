import React, { useState, useContext } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import Filter from '../../components/Filter/Filter'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  const [category, setCategory] = useState('All')
  const [priceRange, setPriceRange] = useState(200); 
  const [searchTerm, setSearchTerm] = useState(''); 

  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <div className="home-content">
        <div className="home-sidebar">
          <Filter 
            setPriceRange={setPriceRange}
            setSearchTerm={setSearchTerm}
          />
        </div>
        <div className="home-main">
          <FoodDisplay 
            category={category}
            price={priceRange}
            name={searchTerm}/>
        </div>
      </div>
      <AppDownload/>
    </div>
  )
}

export default Home