import React, { useEffect, useState } from 'react';
import { FaStickyNote } from 'react-icons/fa';
import {
    FiCalendar, FiChevronDown, FiChevronUp, FiClock, FiCreditCard, FiDollarSign,
    FiFileText,
    FiFilter, FiHash, FiList, FiMail, FiMapPin,
    FiPhone,
    FiSave, FiSearch, FiShoppingCart, FiTruck, FiUser, FiX
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import AxiosInstance from '../../Authentication/AxiosInstance';
import ErrorPage from '../../components/Loading/ErrorPage';
import Loading from '../../components/Loading/Loading';
import Invoice from '../Invoice/Invoice';
import './Orders.css';


const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState(null);
    const [packagings, setPackagings] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        invoiceNumber: '',
        trackingNumber: '',
        customerName: '',
        dateRange: { start: '', end: '' },
    });
    const [orderUpdates, setOrderUpdates] = useState({ status: '', anticipation: '', package: '' });

    const statusChoices = [
        { value: 'all', label: 'جميع الطلبات' },
        { value: 'P', label: 'تم الطلب' },
        { value: 'PU', label: 'في انتظار الاستلام' },
        { value: 'Di', label: 'تم الشحن' },
        { value: 'PA', label: 'وصلت الشحنة' },
        { value: 'DFD', label: 'في الطريق للتسليم' },
        { value: 'D', label: 'تسليم' },
        { value: 'C', label: 'ملغي' },
    ];

    const dayChoices = [
        { value: '', label: 'غير محدد' },
        { value: 'mon', label: 'الإثنين' },
        { value: 'tue', label: 'الثلاثاء' },
        { value: 'wed', label: 'الأربعاء' },
        { value: 'thu', label: 'الخميس' },
        { value: 'fri', label: 'الجمعة' },
        { value: 'sat', label: 'السبت' },
        { value: 'sun', label: 'الأحد' },
    ];

    useEffect(() => {
        fetchOrders();
        fetchPackagings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, orders]);

    useEffect(() => {
        if (selectedOrder) {
            // Handle package as either a number or an object with id
            const packageId = typeof selectedOrder.package === 'number'
                ? selectedOrder.package.toString()
                : selectedOrder.package?.id?.toString() || '';
            setOrderUpdates({
                status: selectedOrder.status || '',
                anticipation: selectedOrder.anticipation || '',
                package: packageId,
            });
        }
    }, [selectedOrder]);

    const fetchOrders = async () => {
        try {
            const response = await AxiosInstance.get(`/orders/orders/`);
            setOrders(response.data);
            setIsLoading(false);
        } catch (err) {
            setError('فشل في جلب الطلبات');
            setIsLoading(false);
        }
    };

    const fetchPackagings = async () => {
        try {
            const response = await AxiosInstance.get(`/orders/packages/`);
            setPackagings(response.data);
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في جلب التغليف');
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...orders];
        if (filters.status !== 'all') {
            result = result.filter((order) => order.status === filters.status);
        }
        if (filters.invoiceNumber) {
            result = result.filter((order) =>
                order.invoice_number?.toLowerCase().includes(filters.invoiceNumber.toLowerCase())
            );
        }
        if (filters.trackingNumber) {
            result = result.filter((order) =>
                order.tracking?.toLowerCase().includes(filters.trackingNumber.toLowerCase())
            );
        }
        if (filters.customerName) {
            result = result.filter((order) =>
                order.customer?.name?.toLowerCase().includes(filters.customerName.toLowerCase())
            );
        }
        if (filters.dateRange.start || filters.dateRange.end) {
            const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
            const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
            result = result.filter((order) => {
                const orderDate = new Date(order.created_at || new Date());
                return (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
            });
        }
        setFilteredOrders(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            dateRange: { ...prev.dateRange, [name]: value },
        }));
    };

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setOrderUpdates((prev) => ({ ...prev, [name]: value }));
    };

    const saveOrderUpdates = async () => {
        if (!selectedOrder) return;
        try {
            const updates = {};
            if (orderUpdates.status !== selectedOrder.status) updates.status = orderUpdates.status;
            if (orderUpdates.anticipation !== (selectedOrder.anticipation || '')) {
                updates.anticipation = orderUpdates.anticipation || null;
            }
            // Compare with the package ID (handle both number and object cases)
            const currentPackageId = typeof selectedOrder.package === 'number'
                ? selectedOrder.package.toString()
                : selectedOrder.package?.id?.toString() || '';
            if (orderUpdates.package !== currentPackageId) {
                updates.package = orderUpdates.package || null;
            }
            if (Object.keys(updates).length === 0) return;




            await AxiosInstance.patch(`/orders/update/${selectedOrder.id}/`, updates);
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id ? {
                        ...order,
                        ...updates,
                        package: updates.package
                            ? packagings.find(p => p.id.toString() === updates.package) || { id: updates.package }
                            : null
                    } : order
                )
            );
            setSelectedOrder((prev) => ({
                ...prev,
                ...updates,
                package: updates.package
                    ? packagings.find(p => p.id.toString() === updates.package) || { id: updates.package }
                    : null
            }));
            alert('تم تحديث الطلب بنجاح');
            fetchOrders();
        } catch (err) {
            alert('فشل في تحديث الطلب');
        }
    };

    const resetFilters = () => {
        setFilters({
            status: 'all',
            invoiceNumber: '',
            trackingNumber: '',
            customerName: '',
            dateRange: { start: '', end: '' },
        });
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    const openNotesModal = (notes) => {
        setSelectedNotes(notes);
    };

    const closeNotesModal = () => {
        setSelectedNotes(null);
    };



    const handleViewMore = (order) => {
        setSelectedOrder(order);
    };

    const handleViewInvoice = (order) => {
        setSelectedOrder(order);
        setShowInvoiceModal(true);
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setShowInvoiceModal(false);
    };

    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };



    if (isLoading) return <Loading />;
    if (error) return <ErrorPage head='فشل في جلب الطلبات' error={error} />;

    return (
        <>
            <div className="orders-container">
                <div className="orders-header">
                    <h2>إدارة الطلبات</h2>
                    <div className="orders-header-actions">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="orders-toggle-filters-btn"
                        >
                            <FiFilter />
                            {showFilters ? 'إخفاء الفلتر' : 'عرض الفلتر'}
                            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="orders-advanced-filters">
                        <div className="orders-filter-row">
                            <div className="orders-filter-group">
                                <label>حالة الطلب:</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="orders-filter-select"
                                >
                                    {statusChoices.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="orders-filter-group">
                                <label>رقم الفاتورة:</label>
                                <div className="orders-search-input">
                                    <FiSearch className="orders-search-icon" />
                                    <input
                                        type="text"
                                        name="invoiceNumber"
                                        placeholder="ابحث برقم الفاتورة..."
                                        value={filters.invoiceNumber}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="orders-filter-row">
                            <div className="orders-filter-group">
                                <label>رقم التتبع:</label>


                                <div className="orders-search-input">
                                    <FiSearch className="orders-search-icon" />


                                    <input
                                        type="text"
                                        name="trackingNumber"
                                        placeholder="ابحث برقم التتبع..."
                                        value={filters.trackingNumber}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="orders-filter-group">
                                <label>اسم العميل:</label>
                                <div className="orders-search-input">
                                    <FiSearch className="orders-search-icon" />
                                    <input
                                        type="text"
                                        name="customerName"
                                        placeholder="ابحث باسم العميل..."
                                        value={filters.customerName}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="orders-filter-row">
                            <div className="orders-filter-group">
                                <label>نطاق التاريخ:</label>
                                <div className="orders-date-range">
                                    <div className="orders-date-input">
                                        <FiCalendar className="orders-calendar-icon" />
                                        <input
                                            type="date"
                                            name="start"
                                            placeholder="من تاريخ"
                                            value={filters.dateRange.start}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                    <span>إلى</span>
                                    <div className="orders-date-input">
                                        <FiCalendar className="orders-calendar-icon" />
                                        <input
                                            type="date"
                                            name="end"
                                            placeholder="إلى تاريخ"
                                            value={filters.dateRange.end}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button onClick={resetFilters} className="orders-reset-filters-btn">
                                <FiX /> مسح الفلاتر
                            </button>
                        </div>
                    </div>
                )}

                <div className="orders-summary">
                    <div className="orders-summary-card orders-total-orders">
                        <h3><FiList /> إجمالي الطلبات</h3>
                        <p>{filteredOrders.length}</p>
                    </div>
                    {statusChoices.slice(1).map((status) => (
                        <div key={status.value} className={`orders-summary-card orders-status-${status.value}`}>
                            <h3>{status.label}</h3>
                            <p>{orders.filter((o) => o.status === status.value).length}</p>
                        </div>
                    ))}
                </div>

                <div className="orders-list">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <div key={order.created_at || index} className="orders-order-card">
                                <div className="orders-order-header">
                                    <h3><FiShoppingCart /> طلب #{order.created_at.split('T')[0]}</h3>
                                    <span className={`orders-status-badge orders-status-${order.status}`}>
                                        {statusChoices.find((s) => s.value === order.status)?.label || 'غير معروف'}
                                    </span>
                                </div>
                                <div className="orders-order-details">
                                    <div className="orders-details-row">
                                        <p><FiUser /> {order.customer?.name || 'غير معروف'}</p>
                                        <p><FiDollarSign /> {order.total.toFixed(2)} {order.currency || 'EGP'}</p>
                                    </div>
                                    <div className="orders-details-row">
                                        <p><FiCalendar /> {new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                                        <p className={`orders-paid-status ${order.paid ? 'paid' : 'unpaid'}`}>
                                            <FiCreditCard /> {order.paid ? 'تم الدفع' : 'لم يتم الدفع'}
                                        </p>
                                    </div>
                                    <div className="orders-details-row">
                                        <p><FiDollarSign /> <strong>الضريبة:</strong> {order.tax_amount || 0} {order.currency || 'EGP'}</p>
                                        <p><FiTruck /> <strong>الشحن:</strong> {order.shipping.toFixed(2)} {order.currency || 'EGP'}</p>
                                    </div>
                                    <div className="orders-details-row">
                                        {order.tracking && <p><FiTruck /> {order.tracking}</p>}
                                        {order.invoice_number && <p><FiHash /> {order.invoice_number}</p>}
                                    </div>
                                </div>
                                {/* <button
                                    onClick={() => openOrderDetails(order)}
                                    className="orders-view-more-btn"
                                >
                                    عرض التفاصيل
                                </button> */}



                                <div className="orders-order-actions">
                                    <button
                                        className="orders-view-more-btn"
                                        onClick={() => openOrderDetails(order)}
                                    >
                                        عرض التفاصيل
                                    </button>
                                    <button
                                        className="invoice-popup-btn"
                                        onClick={() => handleViewInvoice(order)}
                                    >
                                        <FaStickyNote /> عرض الفاتورة
                                    </button>
                                </div>



                            </div>
                        ))
                    ) : (
                        <div className="orders-no-orders">
                            <p>لا توجد طلبات تطابق معايير البحث</p>
                            {Object.values(filters).some((filter) =>
                                typeof filter === 'string'
                                    ? filter !== '' && filter !== 'all'
                                    : Object.values(filter).some((val) => val !== '')
                            ) && (
                                    <button onClick={resetFilters} className="orders-reset-search-btn">
                                        عرض جميع الطلبات
                                    </button>
                                )}
                        </div>
                    )}
                </div>

                {selectedOrder && (
                    <div className="orders-details-modal">
                        <div className="orders-modal-content">
                            <div className="orders-modal-header">
                                <h3><FiShoppingCart /> تفاصيل الطلب #{selectedOrder.created_at.split('T')[0]}</h3>
                                <button onClick={closeOrderDetails} className="orders-btn-close">×</button>
                            </div>
                            <div className="orders-modal-body">
                                <div className="orders-status-update-section">
                                    <h4><FiList /> تحديث حالة الطلب وموعد التسليم</h4>
                                    <div className="orders-update-grid">
                                        <div className="orders-update-group">
                                            <label>حالة الطلب:</label>
                                            <select
                                                name="status"
                                                value={orderUpdates.status}
                                                onChange={handleUpdateChange}
                                                className="orders-update-select"
                                            >
                                                {statusChoices.slice(1).map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="orders-update-group">
                                            <label>يوم التسليم:</label>
                                            <select
                                                name="anticipation"
                                                value={orderUpdates.anticipation}
                                                onChange={handleUpdateChange}
                                                className="orders-update-select"
                                            >
                                                {dayChoices.map((day) => (
                                                    <option key={day.value} value={day.value}>
                                                        {day.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="orders-update-group">
                                            <label>التغليف:</label>
                                            <select
                                                name="package"
                                                value={orderUpdates.package}
                                                onChange={handleUpdateChange}
                                                className="orders-update-select"
                                            >
                                                <option value="">غير محدد</option>
                                                {packagings.map((pkg) => (
                                                    <option key={pkg.id} value={pkg.id.toString()}>
                                                        {pkg.description || `تغليف ${pkg.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button onClick={saveOrderUpdates} className="orders-save-updates-btn">
                                            <FiSave /> حفظ التغييرات
                                        </button>
                                    </div>
                                </div>
                                <div className="orders-detail-section">
                                    <h4><FiUser /> معلومات العميل</h4>
                                    <div className="orders-details-grid">
                                        <p><FiUser /> <strong>الاسم:</strong> {selectedOrder.customer?.name || 'غير معروف'}</p>
                                        <p><FiPhone /> <strong>الهاتف:</strong> {selectedOrder.customer?.phone || 'غير معروف'}</p>
                                        <p><FiMail /> <strong>البريد:</strong> {selectedOrder.customer?.email || 'غير متوفر'}</p>
                                        <p><FiMapPin /> <strong>المحافظة:</strong> {selectedOrder.customer?.governorate || 'غير معروف'}</p>
                                        <p><FiMapPin /> <strong>المدينة:</strong> {selectedOrder.customer?.city || 'غير معروف'}</p>
                                        <p><FiMapPin /> <strong>الحي:</strong> {selectedOrder.customer?.neighborhood || 'غير معروف'}</p>
                                        <p><FiMapPin /> <strong>الشارع:</strong> {selectedOrder.customer?.street || 'غير معروف'}</p>
                                        <p><FiMapPin /> <strong>عنوان الشحن:</strong> {selectedOrder.customer?.shipping_address || 'غير متوفر'}</p>
                                        <p><FiMapPin /> <strong>البلد:</strong> {selectedOrder.customer?.country?.name || 'غير معروف'}</p>
                                    </div>
                                </div>
                                <div className="orders-detail-section">
                                    <h4><FiShoppingCart /> معلومات الطلب</h4>
                                    <div className="orders-details-grid">
                                        <p className={`orders-paid-status ${selectedOrder.paid ? 'paid' : 'unpaid'}`}>
                                            <FiCreditCard /> <strong>حالة الدفع:</strong> {selectedOrder.paid ? 'تم الدفع' : 'لم يتم الدفع'}
                                        </p>
                                        <p><FiList /> <strong>الحالة:</strong> {statusChoices.find((s) => s.value === selectedOrder.status)?.label || 'غير معروف'}</p>
                                        <p><FiDollarSign /> <strong>الإجمالي:</strong> {selectedOrder.total.toFixed(2)} {selectedOrder.currency || 'EGP'}</p>
                                        <p><FiDollarSign /> <strong>الضريبة:</strong> {selectedOrder.tax_amount || 0} {selectedOrder.currency || 'EGP'}</p>
                                        <p><FiDollarSign /> <strong>الشحن:</strong> {selectedOrder.shipping.toFixed(2)} {selectedOrder.currency || 'EGP'}</p>
                                        <p><FiCalendar /> <strong>تاريخ الإنشاء:</strong> {new Date(selectedOrder.created_at || new Date()).toLocaleString('ar-EG')}</p>
                                        <p><FiClock /> <strong>يوم التسليم:</strong> {dayChoices.find((d) => d.value === selectedOrder.anticipation)?.label || 'غير محدد'}</p>
                                        <p><FiHash /> <strong>رقم الفاتورة:</strong> {selectedOrder.invoice_number || 'غير متوفر'}</p>
                                        <p><FiTruck /> <strong>رقم التتبع:</strong> {selectedOrder.tracking || 'غير متوفر'}</p>
                                    </div>
                                </div>
                                <div className="orders-detail-section">
                                    <h4><FiTruck /> معلومات الشحن</h4>
                                    <div className="orders-details-grid">
                                        <p><FiTruck /> <strong>شركة الشحن:</strong> {selectedOrder.shipping_company?.name || 'غير معروف'}</p>
                                        <p><FiDollarSign /> <strong>سعر الشحن:</strong> {selectedOrder.shipping_company?.shipping_price?.toFixed(2) || 'غير متوفر'} {selectedOrder.currency || 'EGP'}</p>
                                        <p><FiDollarSign /> <strong>سعر الشحن المخفض:</strong> {selectedOrder.shipping_company?.discount_price?.toFixed(2) || 'غير متوفر'} {selectedOrder.currency || 'EGP'}</p>
                                        <p><FiCalendar /> <strong>أيام العمل:</strong> {selectedOrder.shipping_company?.work_days || 'غير متوفر'}</p>
                                        <p><FiMapPin /> <strong>البلد:</strong> {selectedOrder.customer?.country?.name || 'غير معروف'}</p>
                                    </div>
                                </div>
                                {/* {selectedOrder.package && (
                                    <div className="orders-detail-section">
                                        <h4><FiPackage /> معلومات الطرد</h4>
                                        <div className="orders-details-grid">
                                            <p><FiHash /> <strong>معرف الطرد:</strong> {typeof selectedOrder.package === 'number' ? selectedOrder.package : selectedOrder.package?.id || 'غير متوفر'}</p>
                                            <p><FiList /> <strong>التفاصيل:</strong> {selectedOrder.package?.description || 'غير متوفر'}</p>
                                        </div>
                                    </div>
                                )} */}
                                <div className="orders-detail-section">
                                    <h4><FiShoppingCart /> المنتجات المشتراة</h4>
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        <div className="orders-items-table">
                                            <div className="orders-items-table-header">
                                                <span>معرف المنتج</span>
                                                <span>المنتج</span>
                                                <span>المقاس</span>
                                                <span>اللون</span>
                                                <span>الكمية</span>
                                                <span>السعر</span>
                                                <span>الملاحظات</span>
                                            </div>
                                            {selectedOrder?.items.map((item, index) => (
                                                <div key={item.id || index} className="orders-items-table-row">
                                                    <span>
                                                        {item?.product?.id ? (
                                                            <Link to={`/products/${formatTitleForUrl(item?.product?.title)}/${item?.product?.id}`}>
                                                                {item.product.code}
                                                            </Link>
                                                        ) : (
                                                            'غير متوفر'
                                                        )}
                                                    </span>
                                                    <span>{item.product_title?.title || 'غير معروف'}</span>
                                                    <span>{item.variant_size?.name || 'غير محدد'}</span>
                                                    <span>{item.variant_color?.name || 'غير محدد'}</span>
                                                    <span>{item.quantity || 0}</span>
                                                    <span>
                                                        {item.price?.amount
                                                            ? `${parseFloat(item.price.amount).toFixed(2)} ${selectedOrder.currency || 'EGP'}`
                                                            : `0.00 ${selectedOrder.currency || 'EGP'}`}
                                                    </span>
                                                    <span>
                                                        {item.notes?.length > 0 ? (
                                                            <button
                                                                onClick={() => openNotesModal(item.notes)}
                                                                className="orders-notes-btn"
                                                            >
                                                                <FiFileText /> عرض الملاحظات
                                                            </button>
                                                        ) : (
                                                            'لا توجد ملاحظات'
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="orders-no-items">لا توجد منتجات مرتبطة بهذا الطلب</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedNotes && (
                    <div className="orders-details-modal">
                        <div className="orders-modal-content orders-notes-modal">
                            <div className="orders-modal-header">
                                <h3><FiFileText /> ملاحظات المنتج</h3>
                                <button onClick={closeNotesModal} className="orders-btn-close">×</button>
                            </div>
                            <div className="orders-modal-body">
                                <div className="orders-detail-section">
                                    {selectedNotes.length > 0 ? (
                                        <ul className="orders-notes-list">
                                            {selectedNotes.map((note) => (
                                                <li key={note.id} className="orders-note-item">
                                                    <FiFileText /> {note.note || 'غير متوفر'}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="orders-no-items">لا توجد ملاحظات لهذا المنتج</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showInvoiceModal && selectedOrder && (
                <div className="invoice-popup-modal">
                    <Invoice order={selectedOrder} closeModal={closeModal} />
                </div>
            )}



        </>
    );
};

export default Orders;