import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../components/context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api'

const DEFAULT_COUNTRY = 'Vietnam'
const DEFAULT_POSTAL_CODE = '700000'
const DEFAULT_CENTER = { lat: 10.78005, lng: 106.6997 }
const MAP_CONTAINER_STYLE = { width: '100%', height: '420px', borderRadius: '16px' }
// Replace this placeholder with a browser-restricted Google Maps key to avoid backend exposure.
const EMBEDDED_GOOGLE_MAPS_KEY = 'AIzaSyA-hZIJzWtU2mw5aIwC4fKJS0rEnf6zqzA'
const MIN_WARD_THRESHOLD = 5

const PlaceOrder = () => {
  const { getTotalCartAmount, token, cartItems, url, allFoodsMap } = useContext(StoreContext)
  const trimmedGoogleMapsKey = (EMBEDDED_GOOGLE_MAPS_KEY || '').trim()
  const isMapsKeyConfigured = Boolean(trimmedGoogleMapsKey)
  const mapsCredentialError = isMapsKeyConfigured ? null : 'Google Maps API key is missing. Edit PlaceOrder.jsx and update EMBEDDED_GOOGLE_MAPS_KEY.'
  const [mapRequest, setMapRequest] = useState({ visible: false, addressQuery: '' })

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    ward: '',
    zipcode: DEFAULT_POSTAL_CODE,
    country: DEFAULT_COUNTRY,
    phone: ''
  })
  const [provinceOptions, setProvinceOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [wardOptions, setWardOptions] = useState([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('')
  const [selectedWardCode, setSelectedWardCode] = useState('')
  const [adminDataState, setAdminDataState] = useState({ loading: true, error: null })
  const [wardState, setWardState] = useState({ loading: false, error: null })
  const [geocodeState, setGeocodeState] = useState({ loading: false, error: null })
  const [mapsLibraryReady, setMapsLibraryReady] = useState(false)
  const [mapLoadError, setMapLoadError] = useState(null)
  const [geocodeTrigger, setGeocodeTrigger] = useState(0)
  const mapRef = useRef(null)
  const geocoderRef = useRef(null)
  const [dropoffLocation, setDropoffLocation] = useState({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    label: '',
    confirmed: false,
    confirmedAt: null
  })
  const markerPosition = useMemo(() => ({ lat: dropoffLocation.lat, lng: dropoffLocation.lng }), [dropoffLocation.lat, dropoffLocation.lng])
  const [locationHint, setLocationHint] = useState('Confirm your address first to open the map and place the marker.')

  useEffect(() => {
    if (!mapsLibraryReady || typeof window === 'undefined' || !window.google) {
      return
    }
    geocoderRef.current = new window.google.maps.Geocoder()
  }, [mapsLibraryReady])

  const requestLocationRefresh = useCallback(() => {
    setDropoffLocation((prev) => ({ ...prev, confirmed: false, confirmedAt: null }))
    setMapRequest({ visible: false, addressQuery: '' })
    setMapLoadError(null)
    setLocationHint('Confirm your address to open the map and place the marker.')
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
        setData((prev) => ({
          ...prev,
          city: defaultProvince?.name || '',
          state: defaultDistrict?.name || '',
          zipcode: DEFAULT_POSTAL_CODE,
          country: DEFAULT_COUNTRY,
          ward: ''
        }))
      } catch (error) {
        if (isMounted) {
          setAdminDataState({ loading: false, error: 'Unable to load Vietnam administrative data. Please try again.' })
          toast.error('Failed to load provinces. Check your connection and retry.')
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
      setData((prev) => ({ ...prev, ward: '' }))
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
        setData((prev) => ({
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

  const buildAddressLabel = () => {
    return [data.street, data.ward, data.state, data.city, data.country]
      .filter(Boolean)
      .join(', ')
  }

  const panMapTo = useCallback((coords) => {
    if (mapRef.current) {
      mapRef.current.panTo(coords)
    }
  }, [])

  useEffect(() => {
    if (!mapRequest.visible || !mapRequest.addressQuery || !mapsLibraryReady) {
      return
    }
    const googleAvailable = typeof window !== 'undefined' && window.google
    if (!googleAvailable) {
      return
    }
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }

    let isCancelled = false
    setGeocodeState({ loading: true, error: null })
    geocoderRef.current.geocode(
      {
        address: mapRequest.addressQuery,
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
          setDropoffLocation((prev) => ({
            ...prev,
            lat,
            lng,
            label: formattedAddress || mapRequest.addressQuery,
            confirmed: false,
            confirmedAt: null
          }))
          panMapTo({ lat, lng })
          setLocationHint('Drag the marker if needed, then press Confirm location.')
          setGeocodeState({ loading: false, error: null })
        } else {
          setGeocodeState({ loading: false, error: 'We could not locate that address automatically. Drag the marker manually.' })
          setLocationHint('We could not locate that address automatically. Drag the marker manually, then confirm the location.')
        }
      }
    )

    return () => {
      isCancelled = true
    }
  }, [mapRequest.addressQuery, mapRequest.visible, mapsLibraryReady, panMapTo, geocodeTrigger])

  const handleMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance
  }, [])

  const requestMapPreview = useCallback(() => {
    if (!isMapsKeyConfigured) {
      toast.error('Google Maps is unavailable. Please provide a valid browser key in PlaceOrder.jsx.')
      return
    }
    const addressParts = [data.street, data.ward, data.state, data.city, data.country].filter(Boolean)
    if (addressParts.length < 3) {
      toast.error('Please fill street, district, and ward before showing the map.')
      return
    }
    setGeocodeState({ loading: true, error: null })
    setMapRequest({ visible: true, addressQuery: addressParts.join(', ') })
    setLocationHint('Locating your address on the map...')
    setGeocodeTrigger((prev) => prev + 1)
  }, [data.city, data.country, data.state, data.street, data.ward, isMapsKeyConfigured])


  const handleMarkerDrag = (event) => {
    if (!event?.latLng) {
      return
    }
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    setDropoffLocation((prev) => ({
      ...prev,
      lat,
      lng,
      confirmed: false,
      confirmedAt: null
    }))
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && Array.isArray(results) && results[0]) {
          setLocationHint(`Marker placed at ${results[0].formatted_address}`)
        } else {
          setLocationHint('Marker moved. Please confirm the location.')
        }
      })
    } else {
      setLocationHint('Marker moved. Please confirm the location.')
    }
  }

  const confirmDropoffLocation = () => {
    setDropoffLocation((prev) => ({
      ...prev,
      label: buildAddressLabel() || prev.label || 'Customer drop-off',
      confirmed: true,
      confirmedAt: new Date().toISOString()
    }))
    setLocationHint('Location confirmed. You can proceed to payment.')
    toast.success('Delivery location confirmed')
  }

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, [name]: value }))
    if (name === 'street') {
      requestLocationRefresh()
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
    setData((prev) => ({
      ...prev,
      city: province?.name || '',
      state: firstDistrict?.name || '',
      country: DEFAULT_COUNTRY,
      ward: ''
    }))
    requestLocationRefresh()
  }

  const handleDistrictChange = (event) => {
    const districtCode = event.target.value
    const district = districtOptions.find((item) => String(item.code) === districtCode) || null
    setSelectedDistrictCode(districtCode)
    setData((prev) => ({
      ...prev,
      state: district?.name || prev.state,
      ward: ''
    }))
    requestLocationRefresh()
  }

  const handleWardChange = (event) => {
    const wardCode = event.target.value
    const ward = wardOptions.find((item) => String(item.code) === wardCode) || null
    setSelectedWardCode(wardCode)
    setData((prev) => ({
      ...prev,
      ward: ward?.name || prev.ward
    }))
    requestLocationRefresh()
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    const orderItems = []
    const missingItems = []

    Object.entries(cartItems)
      .filter(([, qty]) => qty > 0)
      .forEach(([itemId, qty]) => {
        const item = allFoodsMap[itemId]
        if (!item) {
          missingItems.push(itemId)
          return
        }
        orderItems.push({ ...item, quantity: qty })
      })

    if (missingItems.length) {
      toast.error('Some products could not be found. Please refresh and try again.')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    if (!dropoffLocation.confirmed) {
      toast.error('Please confirm the delivery location on the map before paying.')
      return
    }

    const addressPayload = {
      ...data,
      location: dropoffLocation
    }

    const orderData = {
      address: addressPayload,
      items: orderItems,
      amount: getTotalCartAmount() + 2
    }

    const response = await axios.post(
      `${url}/api/order/place`,
      orderData,
      { headers: { token } }
    )
    if (response.data.success) {
      const { session_url: sessionUrl } = response.data
      window.location.replace(sessionUrl)
    } else {
      alert('Error')
    }
  }

  const navigate = useNavigate()
  useEffect(() => {
    if (!token) {
      navigate('/cart')
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart')
    }
  }, [getTotalCartAmount, navigate, token])

  return (
    <div className='place-order-page'>
      <form onSubmit={placeOrder} className='place-order'>
        <div className='place-order-left'>
        <p className='title'>Delivery Information</p>
        <div className='multi-fields'>
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type='text' placeholder='First Name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type='text' placeholder='Last Name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type='text' placeholder='Street, house number' />
        <div className='multi-fields'>
          <input name='country' value={data.country} type='text' readOnly placeholder='Country' />
          <select
            name='province-select'
            value={selectedProvinceCode}
            onChange={handleProvinceChange}
            disabled={adminDataState.loading || !!adminDataState.error}
            required
          >
            <option value=''>Select city / province</option>
            {provinceOptions.map((province) => (
              <option key={province.code} value={province.code}>{province.name}</option>
            ))}
          </select>
        </div>
        <div className='multi-fields'>
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
        {adminDataState.error && <p className='form-hint form-hint--error'>{adminDataState.error}</p>}
        {wardState.error && <p className='form-hint form-hint--error'>{wardState.error}</p>}
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type='text' placeholder='Phone' />
        <div className='map-cta-block'>
          <button
            type='button'
            className='show-map-btn'
            onClick={requestMapPreview}
            disabled={!isMapsKeyConfigured}
          >
            {mapRequest.visible ? 'Refresh map lookup' : 'Locate delivery address before checkout'}
          </button>
        </div>
        </div>
        <div className='place-order-right'>
        <div className='cart-total'>
          <h2>Cart Total</h2>
          <div>
            <div className='cart-total-detail'>
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className='cart-total-detail'>
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className='cart-total-detail'>
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
      </form>
      {mapRequest.visible && (
        <section className='checkout-map-panel'>
          <div className='map-card map-card--wide'>
            <div className='map-card__header'>
              <h4>Confirm delivery location</h4>
              <span className={`location-chip ${dropoffLocation.confirmed ? 'location-chip--ok' : 'location-chip--warn'}`}>
                {dropoffLocation.confirmed ? 'Confirmed' : 'Not confirmed'}
              </span>
            </div>
            {mapsCredentialError && <p className='map-card__hint map-card__hint--error'>{mapsCredentialError}</p>}
            {!mapsCredentialError && (
              <>
                {mapLoadError && <p className='map-card__hint map-card__hint--error'>{mapLoadError}</p>}
                <LoadScript
                  googleMapsApiKey={trimmedGoogleMapsKey}
                  language='vi'
                  region='VN'
                  onLoad={() => {
                    setMapLoadError(null)
                    setMapsLibraryReady(true)
                    if (typeof window !== 'undefined' && window.google) {
                      geocoderRef.current = new window.google.maps.Geocoder()
                    }
                  }}
                  onError={() => {
                    setMapsLibraryReady(false)
                    setMapLoadError('Unable to load Google Maps. Please verify billing and API key settings.')
                  }}
                  loadingElement={<p className='map-card__hint'>Loading Google Maps...</p>}
                >
                  <GoogleMap
                    mapContainerStyle={MAP_CONTAINER_STYLE}
                    center={markerPosition}
                    zoom={15}
                    onLoad={handleMapLoad}
                    options={{ clickableIcons: false, disableDefaultUI: true }}
                  >
                    <Marker position={markerPosition} draggable onDragEnd={handleMarkerDrag} />
                  </GoogleMap>
                </LoadScript>
              </>
            )}
            <p className='map-card__hint'>
              {locationHint}
              {geocodeState.loading && ' (Locating...)'}
            </p>
            {geocodeState.error && <p className='map-card__hint map-card__hint--error'>{geocodeState.error}</p>}
            <div className='map-card__actions'>
              <button type='button' className='confirm-location-btn confirm-location-btn--primary' onClick={confirmDropoffLocation}>
                Confirm location
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default PlaceOrder