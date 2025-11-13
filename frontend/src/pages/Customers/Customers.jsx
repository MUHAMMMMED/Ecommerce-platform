import React, { useEffect, useState } from 'react';
import {
    FiCalendar, FiChevronDown, FiChevronUp, FiClock, FiCreditCard, FiDollarSign,
    FiFileText, FiFilter, FiHash, FiList, FiMail, FiMapPin, FiPackage, FiPhone,
    FiSearch, FiShoppingCart, FiTruck, FiUser, FiX
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import AxiosInstance from '../../Authentication/AxiosInstance';
import ErrorPage from '../../components/Loading/ErrorPage';
import Loading from '../../components/Loading/Loading';
import './Customers.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedNotes, setSelectedNotes] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        name: '',
        phone: '',
        dateRange: { start: '', end: '' },
    });

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
        fetchCustomers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, customers]);

    const fetchCustomers = async () => {
        try {

            const response = await AxiosInstance.get(`/customers/customers/`);
            setCustomers(response.data);
            setIsLoading(false);
        } catch (err) {
            setError('فشل في جلب العملاء');
            setIsLoading(false);
        }
    };

    const fetchCustomerOrders = async (customerId) => {
        try {
            const response = await AxiosInstance.get(`/orders/orders/?customer_id=${customerId}`);
            return response.data;
        } catch (err) {
            console.error('فشل في جلب طلبات العميل:', err);
            return [];
        }
    };

    const applyFilters = () => {
        let result = [...customers];
        if (filters.name) {
            result = result.filter((customer) =>
                customer.name?.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
        if (filters.phone) {
            result = result.filter((customer) =>
                customer.phone?.includes(filters.phone)
            );
        }
        if (filters.dateRange.start || filters.dateRange.end) {
            const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
            const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
            result = result.filter((customer) => {
                if (!customer.lastOrderDate) return false;
                const orderDate = new Date(customer.lastOrderDate);
                return (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
            });
        }
        setFilteredCustomers(result);
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

    const resetFilters = () => {
        setFilters({
            name: '',
            phone: '',
            dateRange: { start: '', end: '' },
        });
    };

    const openCustomerDetails = async (customer) => {
        const orders = await fetchCustomerOrders(customer.id);
        setSelectedCustomer({ ...customer, orders });
    };

    const closeCustomerDetails = () => {
        setSelectedCustomer(null);
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



    if (isLoading) return <Loading />;
    if (error) return <ErrorPage head='فشل في جلب العملاء' error={error} />;

    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };

    return (
        <div className="customers-container">
            <div className="customers-header">
                <h2>إدارة العملاء</h2>
                <div className="customers-header-actions">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="customers-toggle-filters-btn"
                    >
                        <FiFilter />
                        {showFilters ? 'إخفاء الفلتر' : 'عرض الفلتر'}
                        {showFilters ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="customers-advanced-filters">
                    <div className="customers-filter-row">
                        <div className="customers-filter-group">
                            <label>اسم العميل:</label>
                            <div className="customers-search-input">
                                <FiSearch className="customers-search-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="ابحث باسم العميل..."
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                    className="customers-filter-input"
                                />
                            </div>
                        </div>
                        <div className="customers-filter-group">
                            <label>رقم الهاتف:</label>
                            <div className="customers-search-input">
                                <FiSearch className="customers-search-icon" />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="ابحث برقم الهاتف..."
                                    value={filters.phone}
                                    onChange={handleFilterChange}
                                    className="customers-filter-input"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="customers-filter-row">
                        <div className="customers-filter-group">
                            <label>نطاق تاريخ آخر طلب:</label>
                            <div className="customers-date-range">
                                <div className="customers-date-input">
                                    <FiCalendar className="customers-calendar-icon" />
                                    <input
                                        type="date"
                                        name="start"
                                        placeholder="من تاريخ"
                                        value={filters.dateRange.start}
                                        onChange={handleDateChange}
                                        className="customers-filter-input"
                                    />
                                </div>
                                <span>إلى</span>
                                <div className="customers-date-input">
                                    <FiCalendar className="customers-calendar-icon" />
                                    <input
                                        type="date"
                                        name="end"
                                        placeholder="إلى تاريخ"
                                        value={filters.dateRange.end}
                                        onChange={handleDateChange}
                                        className="customers-filter-input"
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={resetFilters} className="customers-reset-filters-btn">
                            <FiX /> مسح الفلاتر
                        </button>
                    </div>
                </div>
            )}

            <div className="customers-summary">
                <div className="customers-summary-card customers-total-customers">
                    <h3><FiUser /> إجمالي العملاء</h3>
                    <p>{filteredCustomers.length}</p>
                </div>
            </div>

            <div className="customers-list">
                {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                        <div key={customer.id} className="customers-customer-card">
                            <div className="customers-customer-header">
                                <h3><FiUser /> {customer.name}</h3>
                            </div>
                            <div className="customers-customer-details">
                                <div className="customers-details-row">
                                    <p><FiPhone /> {customer.phone || 'غير متوفر'}</p>
                                    <p><FiMail /> {customer.email || 'غير متوفر'}</p>
                                </div>
                                <div className="customers-details-row">
                                    <p><FiShoppingCart /> <strong>عدد المشتريات:</strong> {customer.purchase_count || 0}</p>
                                    <p><FiDollarSign /> <strong>إجمالي الإنفاق:</strong> {customer.total_spending.toFixed(2)} EGP</p>
                                </div>
                                <div className="customers-details-row">
                                    <p><FiCalendar /> <strong>آخر طلب:</strong> {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('ar-EG') : 'لم يتم الشراء بعد'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => openCustomerDetails(customer)}
                                className="customers-view-more-btn"
                            >
                                عرض التفاصيل
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="customers-no-customers">
                        <p>لا توجد عملاء تطابق معايير البحث</p>
                        {Object.values(filters).some((filter) =>
                            typeof filter === 'string' ? filter !== '' : Object.values(filter).some((val) => val !== '')
                        ) && (
                                <button onClick={resetFilters} className="customers-reset-search-btn">
                                    عرض جميع العملاء
                                </button>
                            )}
                    </div>
                )}
            </div>

            {selectedCustomer && (
                <div className="customers-details-modal">
                    <div className="customers-modal-content">
                        <div className="customers-modal-header">
                            <h3><FiUser /> تفاصيل العميل: {selectedCustomer.name}</h3>
                            <button onClick={closeCustomerDetails} className="customers-btn-close">×</button>
                        </div>
                        <div className="customers-modal-body">
                            <div className="customers-detail-section">
                                <h4><FiUser /> معلومات العميل</h4>
                                <div className="customers-details-grid">
                                    <p><FiUser /> <strong>الاسم:</strong> {selectedCustomer.name || 'غير معروف'}</p>
                                    <p><FiPhone /> <strong>الهاتف:</strong> {selectedCustomer.phone || 'غير متوفر'}</p>
                                    <p><FiMail /> <strong>البريد:</strong> {selectedCustomer.email || 'غير متوفر'}</p>
                                    <p><FiMapPin /> <strong>المحافظة:</strong> {selectedCustomer.governorate || 'غير معروف'}</p>
                                    <p><FiMapPin /> <strong>المدينة:</strong> {selectedCustomer.city || 'غير معروف'}</p>
                                    <p><FiMapPin /> <strong>الحي:</strong> {selectedCustomer.neighborhood || 'غير معروف'}</p>
                                    <p><FiMapPin /> <strong>الشارع:</strong> {selectedCustomer.street || 'غير معروف'}</p>
                                    <p><FiMapPin /> <strong>عنوان الشحن:</strong> {selectedCustomer.shipping_address || 'غير متوفر'}</p>
                                    <p><FiMapPin /> <strong>البلد:</strong> {selectedCustomer.country?.name || 'غير معروف'}</p>
                                    <p><FiShoppingCart /> <strong>عدد المشتريات:</strong> {selectedCustomer.purchase_count || 0}</p>
                                    <p><FiDollarSign /> <strong>إجمالي الإنفاق:</strong> {selectedCustomer.total_spending.toFixed(2)} EGP</p>
                                    <p><FiCalendar /> <strong>تاريخ الإنشاء:</strong> {new Date(selectedCustomer.created_at).toLocaleString('ar-EG')}</p>
                                    <p><FiCalendar /> <strong>آخر طلب:</strong> {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString('ar-EG') : 'لم يتم الشراء بعد'}</p>
                                </div>
                            </div>
                            <div className="customers-detail-section">
                                <h4><FiShoppingCart /> الطلبات</h4>
                                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                                    <div className="customers-orders-list">
                                        {selectedCustomer.orders.map((order, index) => (
                                            <div key={order.created_at || index} className="customers-order-card">
                                                <div className="customers-order-header">
                                                    <h3><FiShoppingCart /> طلب #{order.created_at.split('T')[0]}</h3>
                                                    <span className={`customers-status-badge customers-status-${order.status}`}>
                                                        {statusChoices.find((s) => s.value === order.status)?.label || 'غير معروف'}
                                                    </span>
                                                </div>
                                                <div className="customers-order-details">
                                                    <div className="customers-details-row">
                                                        <p><FiDollarSign /> {order.total.toFixed(2)} {order.currency || 'EGP'}</p>
                                                        <p><FiCalendar /> {new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                                                    </div>
                                                    <div className="customers-details-row">
                                                        <p className={`customers-paid-status ${order.paid ? 'paid' : 'unpaid'}`}>
                                                            <FiCreditCard /> {order.paid ? 'تم الدفع' : 'لم يتم الدفع'}
                                                        </p>
                                                        <p><FiDollarSign /> <strong>الضريبة:</strong> {order.tax_amount || 0} {order.currency || 'EGP'}</p>
                                                    </div>
                                                    <div className="customers-details-row">
                                                        <p><FiTruck /> <strong>الشحن:</strong> {order.shipping.toFixed(2)} {order.currency || 'EGP'}</p>
                                                        {order.tracking && <p><FiTruck /> {order.tracking}</p>}
                                                    </div>
                                                    <div className="customers-details-row">
                                                        {order.invoice_number && <p><FiHash /> {order.invoice_number}</p>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => openOrderDetails(order)}
                                                    className="customers-view-more-btn"
                                                >
                                                    عرض تفاصيل الطلب
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="customers-no-orders">لا توجد طلبات لهذا العميل</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <div className="customers-details-modal">
                    <div className="customers-modal-content">
                        <div className="customers-modal-header">
                            <h3><FiShoppingCart /> تفاصيل الطلب #{selectedOrder.created_at.split('T')[0]}</h3>
                            <button onClick={closeOrderDetails} className="customers-btn-close">×</button>
                        </div>
                        <div className="customers-modal-body">
                            <div className="customers-detail-section">
                                <h4><FiShoppingCart /> معلومات الطلب</h4>
                                <div className="customers-details-grid">
                                    <p className={`customers-paid-status ${selectedOrder.paid ? 'paid' : 'unpaid'}`}>
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
                            <div className="customers-detail-section">
                                <h4><FiTruck /> معلومات الشحن</h4>
                                <div className="customers-details-grid">
                                    <p><FiTruck /> <strong>شركة الشحن:</strong> {selectedOrder.shipping_company?.name || 'غير معروف'}</p>
                                    <p><FiDollarSign /> <strong>سعر الشحن:</strong> {selectedOrder.shipping_company?.shipping_price?.toFixed(2) || 'غير متوفر'} {selectedOrder.currency || 'EGP'}</p>
                                    <p><FiDollarSign /> <strong>سعر الشحن المخفض:</strong> {selectedOrder.shipping_company?.discount_price?.toFixed(2) || 'غير متوفر'} {selectedOrder.currency || 'EGP'}</p>
                                    <p><FiCalendar /> <strong>أيام العمل:</strong> {selectedOrder.shipping_company?.work_days || 'غير متوفر'} </p>
                                    <p><FiMapPin /> <strong>البلد:</strong> {selectedOrder.customer?.country?.name || 'غير معروف'}</p>
                                </div>
                            </div>
                            {selectedOrder.package && (
                                <div className="customers-detail-section">
                                    <h4><FiPackage /> معلومات الطرد</h4>
                                    <div className="customers-details-grid">
                                        <p><FiHash /> <strong>معرف الطرد:</strong> {selectedOrder.package.id || 'غير متوفر'}</p>
                                        <p><FiList /> <strong>التفاصيل:</strong> {selectedOrder.package.description || 'غير متوفر'}</p>
                                    </div>
                                </div>
                            )}
                            <div className="customers-detail-section">
                                <h4><FiShoppingCart /> المنتجات المشتراة</h4>
                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                    <div className="customers-items-table">
                                        <div className="customers-items-table-header">
                                            <span>معرف المنتج</span>
                                            <span>المنتج</span>
                                            <span>المقاس</span>
                                            <span>اللون</span>
                                            <span>الكمية</span>
                                            <span>السعر</span>
                                            <span>الملاحظات</span>
                                        </div>
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={item.id || index} className="customers-items-table-row">
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
                                                            className="customers-notes-btn"
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
                                    <p className="customers-no-items">لا توجد منتجات مرتبطة بهذا الطلب</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedNotes && (
                <div className="customers-details-modal">
                    <div className="customers-modal-content customers-notes-modal">
                        <div className="customers-modal-header">
                            <h3><FiFileText /> ملاحظات المنتج</h3>
                            <button onClick={closeNotesModal} className="customers-btn-close">×</button>
                        </div>
                        <div className="customers-modal-body">
                            <div className="customers-detail-section">
                                {selectedNotes.length > 0 ? (
                                    <ul className="customers-notes-list">
                                        {selectedNotes.map(note => (
                                            <li key={note.id} className="customers-note-item">
                                                <FiFileText /> {note.note || 'غير متوفر'}
                                            </li>
                                        ))}
                                    </ul>

                                ) : (
                                    <p className="customers-no-items">لا توجد ملاحظات لهذا المنتج</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;