import React, { useCallback, useEffect, useRef, useState } from 'react'
import './AddRestaurant.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const MAP_CONTAINER_STYLE = { width: '100%', height: '380px', borderRadius: '16px' }
const DEFAULT_COUNTRY = 'Vietnam'
const ADDRESS_FIELDS = new Set(['street', 'ward', 'district', 'city', 'country'])
const DEFAULT_ADMIN_MAP_CENTER = { lat: 10.78005, lng: 106.6997 }
const EMBEDDED_GOOGLE_MAPS_KEY = 'AIzaSyA-hZIJzWtU2mw5aIwC4fKJS0rEnf6zqzA'
const MIN_WARD_THRESHOLD = 5

const AddRestaurant = ({ url }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    country: DEFAULT_COUNTRY,
    phone: '',
    adminEmail: '',
    adminPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const trimmedMapsKey = (EMBEDDED_GOOGLE_MAPS_KEY || '').trim()
  const [mapRequest, setMapRequest] = useState({ visible: false, query: '' })
  const [mapLoadError, setMapLoadError] = useState(null)
  const [mapsReady, setMapsReady] = useState(false)
  const [geocodeState, setGeocodeState] = useState({ loading: false, error: null })
  const [locationHint, setLocationHint] = useState('Fill the address fields and press Locate to drop the marker.')
  const mapRef = useRef(null)
  const geocoderRef = useRef(null)
  const [locationState, setLocationState] = useState({
    lat: DEFAULT_ADMIN_MAP_CENTER.lat,
    lng: DEFAULT_ADMIN_MAP_CENTER.lng,
    label: '',
    confirmed: false,
    confirmedAt: null
  })
  const [provinceOptions, setProvinceOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [wardOptions, setWardOptions] = useState([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('')
  const [selectedWardCode, setSelectedWardCode] = useState('')
  const [adminDataState, setAdminDataState] = useState({ loading: true, error: null })
  const [wardState, setWardState] = useState({ loading: false, error: null })

  const markLocationDirty = useCallback(() => {
    setLocationState((prev) => ({ ...prev, confirmed: false, confirmedAt: null }))
    setMapRequest((prev) => ({ ...prev, visible: false, query: '' }))
    setLocationHint('The address changed. Please locate it on the map again.')
    setGeocodeState({ loading: false, error: null })
    setMapLoadError(null)
  }, [])

  const normalizeWardOptions = useCallback((wardList = []) => {
    return wardList
      .map((ward) => {
        const code = ward?.code ?? ward?.ward_id ?? ward?.wardCode ?? ward?.id ?? ward?.value
        const name = ward?.name || ward?.name_with_type || ward?.full_name || ward?.fullName || ward?.ward_name || ward?.label
        return code && name ? { code: String(code), name } : null
      })
      .filter(Boolean)
  }, [])

  const fetchWardsFromPrimary = useCallback(
    async (districtCode) => {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      if (!response.ok) {
        throw new Error('Primary ward API failed')
      }
      const districtData = await response.json()
      return normalizeWardOptions(districtData?.wards)
    },
    [normalizeWardOptions]
  )

  const fetchWardsFromFallback = useCallback(
    async (districtCode) => {
      const response = await fetch(`https://vapi.vnappmob.com/api/province/ward/${districtCode}`)
      if (!response.ok) {
        throw new Error('Fallback ward API failed')
      }
      const payload = await response.json()
      const wardList = payload?.results || payload?.data || []
      return normalizeWardOptions(wardList)
    },
    [normalizeWardOptions]
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (ADDRESS_FIELDS.has(name)) {
      markLocationDirty()
    }
  }

  const handleProvinceChange = (event) => {
    const provinceCode = event.target.value
    const province = provinceOptions.find((item) => String(item.code) === provinceCode) || null
    const districts = province?.districts || []
    const firstDistrict = districts[0] || null

    setSelectedProvinceCode(provinceCode)
    setDistrictOptions(districts)
    setSelectedDistrictCode(firstDistrict ? String(firstDistrict.code) : '')
    setWardOptions([])
    setSelectedWardCode('')
    setFormData((prev) => ({
      ...prev,
      city: province?.name || '',
      district: firstDistrict?.name || '',
      ward: ''
    }))
    markLocationDirty()
  }

  const handleDistrictChange = (event) => {
    const districtCode = event.target.value
    const district = districtOptions.find((item) => String(item.code) === districtCode) || null
    setSelectedDistrictCode(districtCode)
    setFormData((prev) => ({
      ...prev,
      district: district?.name || prev.district,
      ward: ''
    }))
    markLocationDirty()
  }

  const handleWardChange = (event) => {
    const wardCode = event.target.value
    const ward = wardOptions.find((item) => String(item.code) === wardCode) || null
    setSelectedWardCode(wardCode)
    setFormData((prev) => ({
      ...prev,
      ward: ward?.name || prev.ward
    }))
    markLocationDirty()
  }

  const formatFullAddress = () => {
    return [formData.street, formData.ward, formData.district, formData.city, formData.country].filter(Boolean).join(', ')
  }

  useEffect(() => {
    let isMounted = true
    const loadAdministrativeData = async () => {
      try {
        setAdminDataState({ loading: true, error: null })
        const response = await fetch('https://provinces.open-api.vn/api/?depth=2')
        if (!response.ok) {
          throw new Error('Failed to load provinces')
        }
        const provinces = await response.json()
        if (!isMounted) {
          return
        }
        setProvinceOptions(provinces)
        const defaultProvince = provinces.find((province) => /Hồ Chí Minh/i.test(province.name)) || provinces[0]
        const defaultDistrict = defaultProvince?.districts?.[0] || null
        setDistrictOptions(defaultProvince?.districts || [])
        setSelectedProvinceCode(defaultProvince ? String(defaultProvince.code) : '')
        setSelectedDistrictCode(defaultDistrict ? String(defaultDistrict.code) : '')
        setFormData((prev) => ({
          ...prev,
          city: defaultProvince?.name || '',
          district: defaultDistrict?.name || '',
          ward: ''
        }))
      } catch (error) {
        if (isMounted) {
          setAdminDataState({ loading: false, error: 'Unable to load provinces. Please try again.' })
          toast.error('Failed to load province data.')
        }
        return
      }
      if (isMounted) {
        setAdminDataState({ loading: false, error: null })
      }
    }

    loadAdministrativeData()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedDistrictCode) {
      setWardOptions([])
      setSelectedWardCode('')
      setFormData((prev) => ({ ...prev, ward: '' }))
      return
    }

    let isMounted = true
    const loadWards = async () => {
      try {
        setWardState({ loading: true, error: null })
        let wards = await fetchWardsFromPrimary(selectedDistrictCode)
        if (wards.length < MIN_WARD_THRESHOLD) {
          const fallbackWards = await fetchWardsFromFallback(selectedDistrictCode)
          if (fallbackWards.length) {
            wards = fallbackWards
          }
        }
        if (!isMounted) {
          return
        }
        const defaultWard = wards[0] || null
        setWardOptions(wards)
        setSelectedWardCode(defaultWard ? String(defaultWard.code) : '')
        setFormData((prev) => ({
          ...prev,
          ward: defaultWard?.name || ''
        }))
        setWardState({ loading: false, error: null })
      } catch (error) {
        if (!isMounted) {
          return
        }
        setWardOptions([])
        setSelectedWardCode('')
        setWardState({ loading: false, error: 'Unable to load wards. Please try again.' })
      }
    }

    loadWards()
    return () => {
      isMounted = false
    }
  }, [fetchWardsFromFallback, fetchWardsFromPrimary, selectedDistrictCode])

  const panMapTo = useCallback((coords) => {
    if (mapRef.current) {
      mapRef.current.panTo(coords)
    }
  }, [])

  useEffect(() => {
    if (!mapsReady || typeof window === 'undefined' || !window.google) {
      return
    }
    geocoderRef.current = new window.google.maps.Geocoder()
  }, [mapsReady])

  useEffect(() => {
    if (!mapsReady || !mapRequest.visible || !mapRequest.query) {
      return
    }
    if (!geocoderRef.current && typeof window !== 'undefined' && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
    if (!geocoderRef.current) {
      return
    }
    let isCancelled = false
    setGeocodeState({ loading: true, error: null })
    geocoderRef.current.geocode(
      {
        address: mapRequest.query,
        componentRestrictions: { country: 'VN' }
      },
      (results, status) => {
        if (isCancelled) {
          return
        }
        if (status === 'OK' && Array.isArray(results) && results[0]) {
          const { geometry, formatted_address: formattedAddress } = results[0]
          const lat = geometry.location.lat()
          const lng = geometry.location.lng()
          setLocationState((prev) => ({
            ...prev,
            lat,
            lng,
            label: formattedAddress || mapRequest.query,
            confirmed: false,
            confirmedAt: null
          }))
          panMapTo({ lat, lng })
          setLocationHint('Drag the marker if needed, then confirm the coordinates.')
          setGeocodeState({ loading: false, error: null })
        } else {
          setGeocodeState({ loading: false, error: 'Unable to locate the address automatically. Drag the marker manually.' })
          setLocationHint('Auto locate failed. Drag the marker manually and confirm the spot.')
        }
      }
    )
    return () => {
      isCancelled = true
    }
  }, [mapRequest.query, mapRequest.visible, mapsReady, panMapTo])

  const handleMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance
  }, [])

  const handleMarkerDrag = (event) => {
    if (!event?.latLng) {
      return
    }
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    setLocationState((prev) => ({
      ...prev,
      lat,
      lng,
      confirmed: false,
      confirmedAt: null
    }))
    setLocationHint('Marker moved. Confirm the position before saving.')
  }

  const confirmLocation = () => {
    setLocationState((prev) => ({
      ...prev,
      confirmed: true,
      confirmedAt: new Date().toISOString(),
      label: prev.label || formatFullAddress()
    }))
    setLocationHint('Coordinates locked. You can submit the restaurant now.')
    toast.success('Restaurant coordinates confirmed')
  }

  const handleLocateOnMap = () => {
    if (!trimmedMapsKey) {
      toast.error('Google Maps API key missing. Update AddRestaurant.jsx to continue.')
      return
    }
    if (!formData.street || !formData.city || !formData.district || !formData.ward) {
      toast.error('Please complete street, ward, district, and city before locating on the map.')
      return
    }
    const nextQuery = formatFullAddress()
    setMapLoadError(null)
    setGeocodeState({ loading: true, error: null })
    setMapRequest({ visible: true, query: nextQuery })
    setLocationHint('Locating this address on the map...')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = sessionStorage.getItem('token')
    if (!token) {
      toast.error('Not authenticated')
      return
    }
    if (!locationState.confirmed) {
      toast.error('Confirm the marker on the map before saving the restaurant.')
      return
    }
    const fullAddress = formatFullAddress()
    const payload = {
      name: formData.name,
      address: fullAddress,
      phone: formData.phone,
      adminEmail: formData.adminEmail,
      adminPassword: formData.adminPassword,
      location: {
        lat: locationState.lat,
        lng: locationState.lng,
        label: locationState.label || fullAddress
      }
    }
    setIsSubmitting(true)
    try {
      const response = await axios.post(`${url}/api/restaurant/add`, payload, { headers: { token } })
      if (response.data.success) {
        toast.success('Restaurant added')
        navigate('/restaurants')
      } else {
        toast.error(response.data.message || 'Failed to add restaurant')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add restaurant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/restaurants')
  }

  const isSubmitDisabled = isSubmitting

  return (
    <div className='add-restaurant-page'>
      <form className='restaurant-form' onSubmit={handleSubmit}>
        <section className='form-card'>
          <h3>Restaurant Profile</h3>
          <div className='form-grid'>
            <div className='form-field'>
              <label>Restaurant Name *</label>
              <input type='text' name='name' value={formData.name} onChange={handleInputChange} placeholder='Enter restaurant name' required />
            </div>
            <div className='form-field'>
              <label>Phone *</label>
              <input type='tel' name='phone' value={formData.phone} onChange={handleInputChange} placeholder='Enter phone number' required />
            </div>
          </div>
        </section>

        <section className='form-card'>
          <h3>Location & Address</h3>
          <div className='form-grid'>
            <div className='form-field full-width'>
              <label>Street / Building *</label>
              <input type='text' name='street' value={formData.street} onChange={handleInputChange} placeholder='E.g. 273 An Duong Vuong' required />
            </div>
            <div className='form-field'>
              <label>City / Province *</label>
              <select name='province-select' value={selectedProvinceCode} onChange={handleProvinceChange} disabled={adminDataState.loading || !!adminDataState.error} required>
                <option value=''>Select city / province</option>
                {provinceOptions.map((province) => (
                  <option key={province.code} value={province.code}>{province.name}</option>
                ))}
              </select>
            </div>
            <div className='form-field'>
              <label>District *</label>
              <select
                name='district-select'
                value={selectedDistrictCode}
                onChange={handleDistrictChange}
                disabled={adminDataState.loading || !!adminDataState.error || districtOptions.length === 0}
                required
              >
                <option value=''>Select district</option>
                {districtOptions.map((district) => (
                  <option key={district.code} value={district.code}>{district.name}</option>
                ))}
              </select>
            </div>
            <div className='form-field'>
              <label>Ward *</label>
              <select
                name='ward-select'
                value={selectedWardCode}
                onChange={handleWardChange}
                disabled={wardState.loading || !!wardState.error || wardOptions.length === 0}
                required
              >
                <option value=''>Select ward</option>
                {wardOptions.map((ward) => (
                  <option key={ward.code} value={ward.code}>{ward.name}</option>
                ))}
              </select>
            </div>
            <div className='form-field'>
              <label>Country</label>
              <input type='text' name='country' value={formData.country} onChange={handleInputChange} readOnly />
            </div>
          </div>
          {adminDataState.loading && <p className='map-card__hint'>Loading provinces…</p>}
          {wardState.loading && !wardState.error && <p className='map-card__hint'>Loading wards…</p>}
          {adminDataState.error && <p className='map-card__hint map-card__hint--error'>{adminDataState.error}</p>}
          {wardState.error && <p className='map-card__hint map-card__hint--error'>{wardState.error}</p>}
          <div className='map-actions'>
            <button type='button' className='locate-btn' onClick={handleLocateOnMap}>Locate & open map</button>
            <p className='map-hint'>The map appears only after the address fields are complete.</p>
          </div>

          {mapRequest.visible && (
            <div className='map-card map-card--admin'>
              <div className='map-card__header'>
                <div>
                  <h4>Confirm restaurant coordinates</h4>
                  <small>{locationState.label || formatFullAddress()}</small>
                </div>
                <span className={`location-chip ${locationState.confirmed ? 'location-chip--ok' : 'location-chip--warn'}`}>
                  {locationState.confirmed ? 'Confirmed' : 'Not confirmed'}
                </span>
              </div>

              {!trimmedMapsKey && <p className='map-card__hint map-card__hint--error'>Google Maps API key missing. Update AddRestaurant.jsx.</p>}
              {trimmedMapsKey && (
                <>
                  {mapLoadError && <p className='map-card__hint map-card__hint--error'>{mapLoadError}</p>}
                  <LoadScript
                    googleMapsApiKey={trimmedMapsKey}
                    language='vi'
                    region='VN'
                    onLoad={() => {
                      setMapLoadError(null)
                      setMapsReady(true)
                      if (typeof window !== 'undefined' && window.google) {
                        geocoderRef.current = new window.google.maps.Geocoder()
                      }
                    }}
                    onError={() => {
                      setMapsReady(false)
                      setMapLoadError('Unable to load Google Maps. Check billing and the API key.')
                    }}
                    loadingElement={<p className='map-card__hint'>Loading Google Maps...</p>}
                  >
                    <GoogleMap
                      mapContainerStyle={MAP_CONTAINER_STYLE}
                      center={{ lat: locationState.lat, lng: locationState.lng }}
                      zoom={16}
                      onLoad={handleMapLoad}
                      options={{ disableDefaultUI: true, clickableIcons: false }}
                    >
                      <Marker position={{ lat: locationState.lat, lng: locationState.lng }} draggable onDragEnd={handleMarkerDrag} />
                    </GoogleMap>
                  </LoadScript>
                  <p className='map-card__hint'>
                    {locationHint}
                    {geocodeState.loading && ' (Locating...)'}
                  </p>
                  {geocodeState.error && <p className='map-card__hint map-card__hint--error'>{geocodeState.error}</p>}
                  <div className='map-card__actions'>
                    <button type='button' className='confirm-location-btn confirm-location-btn--primary' onClick={confirmLocation}>
                      Confirm location
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className='form-card'>
          <h3>Admin Account</h3>
          <div className='form-grid'>
            <div className='form-field'>
              <label>Admin Email *</label>
              <input type='email' name='adminEmail' value={formData.adminEmail} onChange={handleInputChange} placeholder='Enter admin email' required />
            </div>
            <div className='form-field'>
              <label>Admin Password *</label>
              <input type='password' name='adminPassword' value={formData.adminPassword} onChange={handleInputChange} placeholder='Min 8 characters' required minLength={8} />
            </div>
          </div>
        </section>

        <div className='form-actions'>
          <button type='button' className='cancel-btn' onClick={handleCancel} disabled={isSubmitting}>🔙 Back</button>
          <button type='submit' className='submit-btn' disabled={isSubmitDisabled}>
            {isSubmitting ? 'Saving...' : 'Add Restaurant'}
          </button>
        </div>
        {!locationState.confirmed && <p className='map-hint map-hint--warn'>Confirm the marker before saving to guarantee accurate coordinates.</p>}
      </form>
    </div>
  )
}

export default AddRestaurant
