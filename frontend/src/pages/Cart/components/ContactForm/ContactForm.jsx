
import React, { forwardRef, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import Config from '../../../../Authentication/config';
import './ContactForm.css';

const ContactForm = forwardRef(({
    cartItems,
    currency,
    cartId,
    onShippingPriceChange,
    onTaxChange,
    formData,
    set_FormData
}, ref) => {
    const [shippingCountries, setShippingCountries] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [errors, setErrors] = useState({});

    // جلب الدول عند تحميل الكومبوننت
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await AxiosInstance.get('/orders/shipping-countries/');
                setShippingCountries(res.data);

                // تعيين السعودية كافتراضي إذا وُجدت
                const sa = res.data.find(c => c.code === 'sa');
                if (sa) {
                    setSelectedCountry(sa.id);
                    set_FormData(prev => ({ ...prev, country: sa.id }));
                }
            } catch (err) {
                toast.error('فشل جلب الدول');
            }
        };
        fetchCountries();
    }, [set_FormData]);

    // جلب شركات الشحن عند تغيير الدولة
    useEffect(() => {
        if (selectedCountry) {
            const fetchCompanies = async () => {
                try {
                    const res = await AxiosInstance.get(`/orders/shipping-company/${selectedCountry}/`);
                    const comps = res.data?.Shipping || [];
                    setCompanies(comps);
                    onTaxChange(res.data?.tax || 0);

                    // اختيار أول شركة شحن تلقائيًا
                    if (comps.length > 0) {
                        const first = comps[0];
                        setSelectedCompany(first.id);
                        const price = first.shipping_price || 0;
                        set_FormData(prev => ({
                            ...prev,
                            Shipping: first.id,
                            shippingPrice: price
                        }));
                        onShippingPriceChange(price);
                    } else {
                        setSelectedCompany('');
                        set_FormData(prev => ({ ...prev, Shipping: '', shippingPrice: 0 }));
                        onShippingPriceChange(0);
                    }
                } catch (err) {
                    toast.error('فشل جلب شركات الشحن');
                    setCompanies([]);
                }
            };
            fetchCompanies();
        }
    }, [selectedCountry, onShippingPriceChange, onTaxChange, set_FormData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        set_FormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handlePhone = (phone) => {
        set_FormData(prev => ({ ...prev, phone }));
        setErrors(prev => ({ ...prev, phone: '' }));
    };

    const handleCountryChange = (e) => {
        const value = e.target.value;
        setSelectedCountry(value);
        set_FormData(prev => ({ ...prev, country: value }));
        setErrors(prev => ({ ...prev, country: '' }));
        // إعادة تعيين الشحن عند تغيير الدولة
        setSelectedCompany('');
        setCompanies([]);
    };

    const handleShippingSelect = (id) => {
        setSelectedCompany(id);
        const comp = companies.find(c => c.id === id);
        const price = comp?.shipping_price || 0;
        set_FormData(prev => ({ ...prev, Shipping: id, shippingPrice: price }));
        onShippingPriceChange(price);
        setErrors(prev => ({ ...prev, Shipping: '' }));
    };

    const validate = () => {
        const err = {};
        if (!formData.name?.trim()) err.name = 'الاسم مطلوب';
        if (!formData.phone?.trim()) err.phone = 'رقم الهاتف مطلوب';
        if (!formData.country) err.country = 'اختر الدولة';
        if (!formData.city?.trim()) err.city = 'المدينة مطلوبة';
        if (!formData.neighborhood?.trim()) err.neighborhood = 'الحي مطلوب';
        if (!formData.Shipping) err.Shipping = 'اختر طريقة الشحن';
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    React.useImperativeHandle(ref, () => ({
        getValidatedOrderData: () => validate() ? formData : null
    }));

    return (
        <div className="contact-form-unique-container">
            {/* تم حذف <form> تمامًا لأنه هو السبب في الـ Refresh */}
            <div className="contact-form-unique-form">
                <h3 className="contact-form-unique-title">بيانات الشحن</h3>

                <div className="contact-form-unique-row">
                    <div className="contact-form-unique-group">
                        <label>الاسم <span className="contact-form-unique-required-star">*</span></label>
                        <input
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            placeholder="الاسم الكامل"
                            className="contact-form-unique-input"
                        />
                        {errors.name && <span className="contact-form-unique-error">{errors.name}</span>}
                    </div>

                    <div className="contact-form-unique-group">
                        <label>رقم الهاتف <span className="contact-form-unique-required-star">*</span></label>
                        <PhoneInput
                            country="sa"
                            value={formData.phone || ''}
                            onChange={handlePhone}
                            inputProps={{
                                name: 'phone',
                                required: true,
                                style: { paddingLeft: '8px' }
                            }}
                            containerClass="contact-form-unique-phone-container"
                            inputClass="contact-form-unique-phone-input"
                            dropdownStyle={{ width: '300px' }}
                        />
                        {errors.phone && <span className="contact-form-unique-error">{errors.phone}</span>}
                    </div>
                </div>

                <div className="contact-form-unique-row">
                    <div className="contact-form-unique-group">
                        <label>الدولة <span className="contact-form-unique-required-star">*</span></label>
                        <select
                            className="contact-form-unique-input"
                            value={formData.country || ''}
                            onChange={handleCountryChange}
                        >
                            <option value="">اختر الدولة</option>
                            {shippingCountries.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.country && <span className="contact-form-unique-error">{errors.country}</span>}
                    </div>

                    <div className="contact-form-unique-group">
                        <label>المدينة <span className="contact-form-unique-required-star">*</span></label>
                        <input
                            name="city"
                            value={formData.city || ''}
                            onChange={handleChange}
                            placeholder="المدينة"
                            className="contact-form-unique-input"
                        />
                        {errors.city && <span className="contact-form-unique-error">{errors.city}</span>}
                    </div>
                </div>

                <div className="contact-form-unique-row">
                    <div className="contact-form-unique-group">
                        <label>الحي <span className="contact-form-unique-required-star">*</span></label>
                        <input
                            name="neighborhood"
                            value={formData.neighborhood || ''}
                            onChange={handleChange}
                            placeholder="الحي"
                            className="contact-form-unique-input"
                        />
                        {errors.neighborhood && <span className="contact-form-unique-error">{errors.neighborhood}</span>}
                    </div>

                    <div className="contact-form-unique-group">
                        <label>الشارع</label>
                        <input
                            name="street"
                            value={formData.street || ''}
                            onChange={handleChange}
                            placeholder="اختياري"
                            className="contact-form-unique-input"
                        />
                    </div>
                </div>

                {companies.length > 0 && (
                    <div className="contact-form-unique-shipping-section">
                        <h4>طريقة الشحن</h4>
                        <div className="contact-form-unique-shipping-methods">
                            {companies.map(comp => (
                                <div
                                    key={comp.id}
                                    className={`contact-form-unique-shipping-card ${selectedCompany === comp.id ? 'contact-form-unique-selected' : ''}`}
                                    onClick={() => handleShippingSelect(comp.id)}
                                >
                                    <div className="contact-form-unique-shipping-card-content">
                                        <img
                                            src={`${Config.baseURL}${comp.image}`}
                                            alt={comp.name}
                                            className="contact-form-unique-shipping-icon"
                                        />
                                        <div className="contact-form-unique-shipping-details">
                                            <span className="contact-form-unique-shipping-name">{comp.name}</span>
                                            <span className="contact-form-unique-shipping-days">{comp.work_days}</span>
                                        </div>
                                        <span className="contact-form-unique-shipping-price">
                                            {comp.shipping_price} {currency}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {errors.Shipping && <span className="contact-form-unique-error">{errors.Shipping}</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

ContactForm.displayName = 'ContactForm';

export default ContactForm;