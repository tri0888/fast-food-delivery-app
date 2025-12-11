import React, { useEffect, useMemo, useState } from 'react'
import './Orders.css'
import axios from 'axios'
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const STATUS_FLOW = {
  'Pending Confirmation': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Out for delivery'],
  'Out for delivery': ['Delivered'],
  'Delivered': [],
  'Cancelled': []
}

const ALL_STATUSES = ['Pending Confirmation', 'Confirmed', 'Out for delivery', 'Delivered', 'Cancelled']
const STATUS_LABELS = {
  'Pending Confirmation': 'Pending confirmation',
  'Confirmed': 'Confirmed',
  'Out for delivery': 'Out for delivery',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled'
}

const DRONE_STATUS_LABELS = {
  'awaiting-drone': 'Awaiting drone',
  'flying': 'Flying',
  'delivered': 'Delivered',
  'returning': 'Returning to base',
  'idle': 'Idle',
  'cancelled': 'Cancelled'
}

const CHART_COLORS = ['#fb7185', '#f97316', '#facc15', '#34d399', '#38bdf8', '#a78bfa', '#f472b6', '#60a5fa', '#fbbf24', '#4ade80']

const getStatusLabel = (status) => STATUS_LABELS[status] || status
const PAYMENT_LABELS = {
  pending: 'Pending',
  authorized: 'Authorized',
  captured: 'Captured',
  failed: 'Failed'
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

const formatCurrency = (value = 0) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return currencyFormatter.format(0)
  }
  return currencyFormatter.format(amount)
}

const formatCompactCurrency = (value = 0) => {
  const amount = Number(value) || 0
  const absAmount = Math.abs(amount)
  if (absAmount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (absAmount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return `$${amount.toFixed(0)}`
}

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const ORDER_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const getMonthKeyFromDate = (dateInput) => {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

const getMonthLabelFromKey = (monthKey) => {
  if (!monthKey) return ''
  const [year, month] = monthKey.split('-').map(Number)
  if (!year || !month) return ''
  const date = new Date(year, month - 1, 1)
  if (Number.isNaN(date.getTime())) return ''
  return MONTH_LABEL_FORMATTER.format(date)
}

const formatOrderDate = (dateInput) => {
  if (!dateInput) return 'Unknown purchase date'
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return 'Unknown purchase date'
  return ORDER_DATE_FORMATTER.format(date)
}

const INITIAL_DIALOG_STATE = {
  isOpen: false,
  orderId: null,
  newStatus: '',
  orderInfo: '',
  droneId: '',
  restaurantId: ''
}

const Orders = ({url}) => {

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({ term: '', status: 'all', restaurant: 'all', month: 'all' })
  const [confirmDialog, setConfirmDialog] = useState({ ...INITIAL_DIALOG_STATE })
  const [droneSelection, setDroneSelection] = useState({ options: [], loading: false })
  const [restaurantsCatalog, setRestaurantsCatalog] = useState([])
  const role = sessionStorage.getItem('role') || ''
  const restaurantId = sessionStorage.getItem('restaurantId') || ''

  const extractRestaurantId = (restaurantRef) => {
    if (!restaurantRef) return ''
    if (typeof restaurantRef === 'string') return restaurantRef
    if (typeof restaurantRef === 'object') {
      if (restaurantRef._id) return restaurantRef._id
      if (restaurantRef.id) return restaurantRef.id
    }
    return ''
  }

  const canManageOrder = (order) => {
    if (role !== 'admin') return false
    if (!restaurantId) return false
    return extractRestaurantId(order?.res_id) === restaurantId
  }

  const fetchAllOrders = async () => {
    const token = sessionStorage.getItem("token");
    try {
      setIsLoading(true)
      const response = await axios.get(url + "/api/order/list", {
                                       headers: { token }});    
      if (response.data.success) {
        const received = response.data.data || []
        setOrders(received);

        // show transient admin notifications (1/3 and 2/3) once
        try {
          const seen = new Set()
          // maintain seen in sessionStorage to avoid repeats during refresh
          const stored = sessionStorage.getItem('adminSeenNotifications')
          if (stored) {
            JSON.parse(stored).forEach(id => seen.add(id))
          }

          const newSeen = []
          received.forEach((order) => {
            const notes = order?.droneTracking?.notifications || []
            notes.forEach((n) => {
              if (!n || !n.id) return
              if (seen.has(n.id)) return
              // show admin toast for any transient notification
              toast.info(n.message, { autoClose: 15000 })
              seen.add(n.id)
              newSeen.push(n.id)
            })
          })
          if (newSeen.length) {
            const all = Array.from(seen)
            sessionStorage.setItem('adminSeenNotifications', JSON.stringify(all))
          }
        } catch (e) {
          console.error('notification processing failed', e)
        }
      }else{
        toast.error(response.data.message || "Error")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const resetConfirmDialog = () => {
    setConfirmDialog({ ...INITIAL_DIALOG_STATE })
    setDroneSelection({ options: [], loading: false })
  }

  const fetchIdleDrones = async (restaurantId) => {
    const token = sessionStorage.getItem("token");
    if (!restaurantId) {
      toast.error('Unable to dispatch drone because the restaurant is missing');
      return []
    }
    try {
      setDroneSelection({ options: [], loading: true })
      const response = await axios.get(`${url}/api/drone/list`, {
        params: { res_id: restaurantId, status: 'idle' },
        headers: { token }
      })
      const list = response.data?.data || []
      setDroneSelection({ options: list, loading: false })
      return list
    } catch (error) {
      setDroneSelection({ options: [], loading: false })
      const errorMessage = error.response?.data?.message || 'Failed to load idle drones'
      toast.error(errorMessage)
      return []
    }
  }

  const handleDroneSelectionChange = (event) => {
    setConfirmDialog(prev => ({ ...prev, droneId: event.target.value }))
  }

  const fetchRestaurantsCatalog = async () => {
    if (role !== 'superadmin') return
    const token = sessionStorage.getItem('token')
    try {
      const response = await axios.get(`${url}/api/restaurant/list`, { headers: { token } })
      if (response.data.success) {
        setRestaurantsCatalog(response.data.data || [])
      } else {
        toast.error(response.data.message || 'Failed to load restaurants')
      }
    } catch (error) {
      console.error('Failed to fetch restaurants catalog', error)
      toast.error(error.response?.data?.message || 'Failed to load restaurants')
    }
  }

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const currentOrder = orders.find(order => order._id === orderId);
    const currentStatusKey = currentOrder?.status === 'Food Processing' ? 'Pending Confirmation' : currentOrder?.status

    if (!canManageOrder(currentOrder)) {
      toast.warning('Only the assigned restaurant admin can update this order');
      event.target.value = currentStatusKey;
      return;
    }

    if (newStatus === 'Delivered') {
      toast.info('Delivery status is updated automatically');
      event.target.value = currentStatusKey;
      return;
    }
    
    if (currentOrder && currentOrder.status === newStatus) {
      return;
    }

    const allowedStatuses = STATUS_FLOW[currentStatusKey] || []
    const paymentReady = ['authorized', 'captured'].includes(currentOrder?.paymentStatus)
    if (!allowedStatuses.includes(newStatus)) {
      toast.warning('This status transition is not allowed');
      event.target.value = currentOrder?.status || 'Pending Confirmation';
      return;
    }

    if (newStatus !== 'Cancelled' && !paymentReady) {
      toast.warning('Payment must be authorized before advancing the order');
      event.target.value = currentOrder?.status || 'Pending Confirmation';
      return;
    }

    const orderInfo = `${currentOrder?.address.firstName} ${currentOrder?.address.lastName}`;
    const nextStatusLabel = getStatusLabel(newStatus === 'Food Processing' ? 'Pending Confirmation' : newStatus)

    if (newStatus === 'Out for delivery') {
      const orderRestaurantId = extractRestaurantId(currentOrder?.res_id)
      if (!orderRestaurantId) {
        toast.warning('Restaurant information for this order is missing. Please try again later.');
        event.target.value = currentStatusKey;
        return;
      }
      const idleDrones = await fetchIdleDrones(orderRestaurantId)
      if (idleDrones.length === 0) {
        toast.warning('No idle drone is available for this restaurant yet. Please try again once one returns.')
        event.target.value = currentStatusKey;
        return;
      }
    } else {
      setDroneSelection({ options: [], loading: false })
    }
    
    setConfirmDialog({
      isOpen: true,
      orderId: orderId,
      newStatus: newStatus,
      orderInfo: `${orderInfo} → ${nextStatusLabel}`,
      droneId: '',
      restaurantId: extractRestaurantId(currentOrder?.res_id)
    });

    // Reset select về giá trị cũ
    event.target.value = currentStatusKey;
  };

  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus, orderInfo, droneId } = confirmDialog;
    const token = sessionStorage.getItem("token");

    if (newStatus === 'Out for delivery' && !droneId) {
      toast.warning('Please select an idle drone to dispatch.');
      return;
    }
    const payload = { orderId, status: newStatus }
    if (newStatus === 'Out for delivery') {
      payload.droneId = droneId
    }
    
    try {
      const response = await axios.patch(`${url}/api/order/status`, 
                                          payload,
                                          {headers: {token}});
      
      if(response.data.success){
        await fetchAllOrders();
        toast.success(`The order of ${orderInfo}`);
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update order status';
      toast.error(errorMessage);
    }
    
    resetConfirmDialog();
  };

  const handleCancelStatusChange = () => {
    resetConfirmDialog();
  };

  useEffect(() => {
    fetchAllOrders()
    if (role === 'superadmin') {
      fetchRestaurantsCatalog()
    }
  }, [])

  const restaurantOptions = useMemo(() => {
    if (role !== 'superadmin') return []
    const map = new Map()

    restaurantsCatalog.forEach((restaurant) => {
      if (!restaurant) return
      const id = restaurant?._id?.toString?.() || restaurant?._id
      if (!id) return
      const name = restaurant?.name || 'Unnamed restaurant'
      map.set(id, name)
    })

    orders.forEach((order) => {
      const resId = extractRestaurantId(order?.res_id)
      if (!resId) return
      const name = order?.res_id?.name || 'Unnamed restaurant'
      if (!map.has(resId)) {
        map.set(resId, name)
      }
    })

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [orders, restaurantsCatalog, role])

  const monthOptions = useMemo(() => {
    const map = new Map()
    orders.forEach((order) => {
      const key = getMonthKeyFromDate(order?.createdAt)
      if (!key) return
      if (!map.has(key)) {
        map.set(key, getMonthLabelFromKey(key))
      }
    })
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => b.value.localeCompare(a.value))
  }, [orders])

  const selectedRestaurantLabel = useMemo(() => {
    if (role !== 'superadmin') {
      return 'Your restaurant'
    }
    if (filters.restaurant === 'all') {
      return 'All restaurants'
    }
    const match = restaurantOptions.find((restaurant) => restaurant.id === filters.restaurant)
    return match?.name || 'Selected restaurant'
  }, [role, filters.restaurant, restaurantOptions])

  const selectedMonthLabel = useMemo(() => {
    if (filters.month === 'all') {
      return monthOptions.length ? 'All months' : 'No orders yet'
    }
    return monthOptions.find((option) => option.value === filters.month)?.label || 'Selected month'
  }, [filters.month, monthOptions])

  const filteredOrders = useMemo(() => {
    const term = filters.term.trim().toLowerCase()
    const restaurantFilter = role === 'superadmin' ? filters.restaurant : 'all'
    return orders.filter((order) => {
      const matchesStatus = filters.status === 'all' || (order.status === filters.status)
      const matchesRestaurant = restaurantFilter === 'all' || extractRestaurantId(order?.res_id) === restaurantFilter
      const matchesMonth = filters.month === 'all' || getMonthKeyFromDate(order?.createdAt) === filters.month
      if (!matchesStatus || !matchesRestaurant || !matchesMonth) {
        return false
      }
      if (!term) return matchesStatus

      const customerName = `${order?.address?.firstName || ''} ${order?.address?.lastName || ''}`.toLowerCase()
      const restaurantName = (order?.res_id?.name || '').toLowerCase()
      const containsItem = (order.food_items || order.items || []).some((item) =>
        item.name?.toLowerCase().includes(term)
      )

      return (
        customerName.includes(term) ||
        restaurantName.includes(term) ||
        containsItem
      )
    })
  }, [orders, filters, role])

  const revenueStats = useMemo(() => {
    if (!filteredOrders.length) {
      return { totalRevenue: 0, totalOrders: 0, restaurants: [] }
    }

    const totals = {}
    let overall = 0

    filteredOrders.forEach((order) => {
      const amount = Number(order.amount) || 0
      overall += amount

      const restaurantId = order?.res_id?._id?.toString?.() || order?.res_id?._id || order?.res_id || 'unassigned'
      const restaurantName = order?.res_id?.name || 'Unassigned restaurant'

      if (!totals[restaurantId]) {
        totals[restaurantId] = {
          id: restaurantId,
          name: restaurantName,
          orders: 0,
          revenue: 0
        }
      }

      totals[restaurantId].orders += 1
      totals[restaurantId].revenue += amount
    })

    return {
      totalRevenue: overall,
      totalOrders: filteredOrders.length,
      restaurants: Object.values(totals).sort((a, b) => b.revenue - a.revenue)
    }
  }, [filteredOrders])

  const superadminRevenueOverview = useMemo(() => {
    if (role !== 'superadmin') {
      return { total: 0, totalOrders: 0, data: [] }
    }

    const totals = {}
    let totalRevenue = 0
    let totalOrders = 0

    orders.forEach((order) => {
      if (filters.month !== 'all' && getMonthKeyFromDate(order?.createdAt) !== filters.month) {
        return
      }

      const amount = Number(order.amount) || 0
      totalRevenue += amount
      totalOrders += 1
      const id = extractRestaurantId(order?.res_id) || 'unassigned'
      const name = order?.res_id?.name || 'Unassigned restaurant'

      if (!totals[id]) {
        totals[id] = {
          id,
          name,
          revenue: 0
        }
      }

      totals[id].revenue += amount
    })

    restaurantsCatalog.forEach((restaurant) => {
      if (!restaurant) return
      const id = restaurant?._id?.toString?.() || restaurant?._id
      if (!id) return
      const name = restaurant?.name || 'Unnamed restaurant'
      if (!totals[id]) {
        totals[id] = {
          id,
          name,
          revenue: 0
        }
      } else if (!totals[id].name || totals[id].name === 'Unassigned restaurant') {
        totals[id].name = name
      }
    })

    const data = Object.values(totals)
      .sort((a, b) => b.revenue - a.revenue)
      .map((entry) => ({ ...entry, revenue: Number(entry.revenue.toFixed(2)) }))

    return { total: totalRevenue, totalOrders, data }
  }, [orders, filters.month, restaurantsCatalog, role])

  const hasSuperadminRevenueData = superadminRevenueOverview.data.length > 0

  const shouldShowSuperadminFallback = role === 'superadmin' && filters.restaurant !== 'all' && filteredOrders.length === 0
  const summaryTitle = shouldShowSuperadminFallback
    ? 'Total revenue · All restaurants (Superadmin)'
    : `Total revenue · ${selectedRestaurantLabel}`
  const summaryValue = shouldShowSuperadminFallback
    ? superadminRevenueOverview.total
    : revenueStats.totalRevenue
  const summaryOrders = shouldShowSuperadminFallback
    ? superadminRevenueOverview.totalOrders
    : revenueStats.totalOrders

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className='order-toolbar'>
        <div className='order-filters'>
          <div className='filter-group'>
            <label htmlFor='month-filter'>Billing month</label>
            <select
              id='month-filter'
              name='month'
              value={filters.month}
              onChange={handleFilterChange}
            >
              <option value='all'>All months</option>
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {role === 'superadmin' && (
            <div className='filter-group'>
              <label htmlFor='restaurant-filter'>Restaurant</label>
              <select
                id='restaurant-filter'
                name='restaurant'
                value={filters.restaurant}
                onChange={handleFilterChange}
              >
                <option value='all'>All restaurants</option>
                {restaurantOptions.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className='order-toolbar__meta'>
          <span>{selectedMonthLabel}</span>
          <span>{filteredOrders.length} orders shown</span>
        </div>
      </div>
      

      <div className='order-summary'>
        <div className='order-summary-card primary'>
          <p className='order-summary-label'>{summaryTitle}</p>
          <p className='order-summary-value'>{formatCurrency(summaryValue)}</p>
          <p className='order-summary-sub'>{selectedMonthLabel} · {summaryOrders} orders</p>
        </div>
        
        <div className='order-summary-card'>
          <p className='order-summary-label'>Pending fulfillment</p>
          <p className='order-summary-value small'>
            {filteredOrders.filter((order) => order.status === 'Pending Confirmation').length}
          </p>
          <p className='order-summary-sub'>Awaiting confirmation</p>
        </div>
        
      </div>

      {role === 'superadmin' && (
        <div className='order-analytics'>
          <div className='order-analytics__header'>
            <div>
              Tổng doanh thu tất cả nhà hàng · {selectedMonthLabel}
              <p className='order-analytics__sub'>Biểu đồ hiển thị doanh thu tổng hợp theo từng nhà hàng</p>
            </div>
            <span>{formatCurrency(superadminRevenueOverview.total)}</span>
          </div>
          <div className='order-analytics__grid'>
            <div className='order-chart-card'>
              <p className='order-chart-card__title'>Bar chart</p>
              <p className='order-chart-card__subtitle'>Tổng doanh thu theo nhà hàng</p>
              {hasSuperadminRevenueData ? (
                <ResponsiveContainer width='100%' height={320}>
                  <BarChart data={superadminRevenueOverview.data} margin={{ top: 12, right: 24, left: 0, bottom: 24 }}>
                    <XAxis
                      dataKey='name'
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-25}
                      textAnchor='end'
                      height={70}
                    />
                    <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: 'rgba(251, 113, 133, 0.08)' }} />
                    <Bar dataKey='revenue' radius={[8, 8, 0, 0]}>
                      {superadminRevenueOverview.data.map((entry, index) => (
                        <Cell key={`bar-${entry.id}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className='order-chart-card__empty'>Chưa có dữ liệu doanh thu để hiển thị.</p>
              )}
            </div>
            <div className='order-chart-card'>
              <p className='order-chart-card__title'>Pie chart</p>
              <p className='order-chart-card__subtitle'>Tỷ trọng đóng góp của từng nhà hàng</p>
              {hasSuperadminRevenueData ? (
                <ResponsiveContainer width='100%' height={320}>
                  <PieChart>
                    <Pie
                      data={superadminRevenueOverview.data}
                      dataKey='revenue'
                      nameKey='name'
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {superadminRevenueOverview.data.map((entry, index) => (
                        <Cell key={`pie-${entry.id}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                    <Legend
                      layout='vertical'
                      align='right'
                      verticalAlign='middle'
                      formatter={(value, entry) => `${value} · ${formatCurrency(entry.payload.revenue)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className='order-chart-card__empty'>Chưa có dữ liệu doanh thu để hiển thị.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {role === 'superadmin' && (
        <div className='order-breakdown'>
          <div className='order-breakdown__header'>Revenue by restaurant · {selectedMonthLabel}</div>
          <div className='order-breakdown__body'>
            {revenueStats.restaurants.length === 0 && (
              <p className='order-breakdown__empty'>No orders yet.</p>
            )}
            {revenueStats.restaurants.map((restaurant) => (
              <div key={restaurant.id} className='order-breakdown__row'>
                <div>
                  <p className='order-breakdown__name'>{restaurant.name}</p>
                  <p className='order-breakdown__meta'>{restaurant.orders} orders</p>
                </div>
                <span className='order-breakdown__amount'>{formatCurrency(restaurant.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="order-list">
        {isLoading && (
          <div className='order-placeholder'>
            <span className='material-symbols-outlined spin'>hourglass_top</span>
            Loading orders…
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <div className='order-placeholder'>
            <span className='material-symbols-outlined'>inbox</span>
            No orders match your filters
          </div>
        )}

        {!isLoading && filteredOrders.map((order) => {
          const canUpdateStatus = canManageOrder(order)
          return (
          <div key={order._id} className="order-item">
            <div className='order-item__header'>
              <div className='order-item__title-group'>
                <p className="order-item-name">{order.address.firstName + " "+order.address.lastName}</p>
                {role === 'superadmin' && (
                  <p className='order-item-restaurant'>Restaurant: {order?.res_id?.name || 'Unassigned'}</p>
                )}
                <p className='order-item-date'>Purchased {formatOrderDate(order.createdAt)}</p>
                <p className="order-item-food">
                  {(order.food_items || order.items || []).map((item,index, arr) => {
                    const text = `${item.name} x ${item.quantity}`
                    return index === arr.length - 1 ? text : `${text}, `
                  })}
                </p>
              </div>
              <div className='order-item__badges'>
                <span className={`badge status-${(order.status || '').replace(/\s+/g, '-').toLowerCase()}`}>
                  {getStatusLabel(order.status)}
                </span>
                <span className={`badge payment-${order.paymentStatus || 'pending'}`}>
                  Payment · {PAYMENT_LABELS[order.paymentStatus || 'pending'] || 'Pending'}
                </span>
              </div>
            </div>
            <div className="order-item-address">
              <p>{order.address.state + ","}</p>
              <p>{order.address.city+" ,"+ order.address.state+" ,"+order.address.country+" ,"+order.address.zipcode}</p>
            </div>
            <p className='order-item-phone'>{order.address.phone}</p>
            <p className='order-item-drone'>
              Drone: {DRONE_STATUS_LABELS[order?.droneTracking?.adminStatus || order?.droneTracking?.status || 'awaiting-drone']}
              {order?.droneTracking?.assignedDrone?.name && ` · ${order.droneTracking.assignedDrone.name}`}
              {order?.droneTracking?.status === 'awaiting-drone' && <span className='order-item-drone__note'>&nbsp;(None available yet)</span>}
            </p>
            <div className='order-item__footer'>
              <div className='order-item__meta'>
                <p>Items: {(order.food_items || order.items || []).length}</p>
                <p className='order-item__amount'>{formatCurrency(order.amount)}</p>
              </div>
              {canUpdateStatus ? (
                <select onChange={(event)=> statusHandler(event,order._id)} value={order.status === 'Food Processing' ? 'Pending Confirmation' : order.status} >
                  {ALL_STATUSES.map((statusOption) => {
                    const normalizedStatus = order.status === 'Food Processing' ? 'Pending Confirmation' : order.status
                    const allowed = STATUS_FLOW[normalizedStatus] || []
                    const isCurrent = statusOption === normalizedStatus
                    const isAllowedOption = allowed.includes(statusOption)
                    if (!isCurrent && !isAllowedOption) {
                      return null
                    }

                    const paymentReady = ['authorized', 'captured'].includes(order.paymentStatus)
                    const requiresPayment = statusOption !== 'Cancelled'
                    const transitionBlocked = !isCurrent && requiresPayment && !paymentReady
                    const isDeliveryStatus = statusOption === 'Delivered'
                    const isDisabled = isCurrent || isDeliveryStatus || transitionBlocked
                    const label = getStatusLabel(statusOption)
                    return (
                      <option key={statusOption} value={statusOption} disabled={isDisabled}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <p className='order-item__view-only'>
                  {role === 'superadmin'
                    ? 'Superadmin can view orders only.'
                    : 'Status updates are limited to the assigned restaurant admin.'}
                </p>
              )}
            </div>
          </div>
        )})}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to change the order status for ${confirmDialog.orderInfo}?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        confirmText="Confirm"
        cancelText="Cancel"
        disableConfirm={confirmDialog.newStatus === 'Out for delivery' && (droneSelection.loading || !confirmDialog.droneId)}
      >
        {confirmDialog.newStatus === 'Out for delivery' && (
          <div className='drone-select-panel'>
            {droneSelection.loading ? (
              <p className='drone-select-panel__loading'>Loading idle drones…</p>
            ) : (
              <>
                <label htmlFor='drone-select'>Select an idle drone</label>
                <select
                  id='drone-select'
                  value={confirmDialog.droneId}
                  onChange={handleDroneSelectionChange}
                >
                  <option value=''>-- Choose drone --</option>
                  {droneSelection.options.map((drone) => (
                    <option key={drone._id} value={drone._id}>
                      {drone.name} · {(drone.res_id?.name) || 'Restaurant'}
                    </option>
                  ))}
                </select>
                <small>The drone will start flying immediately after confirmation.</small>
              </>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}

export default Orders