// import React, { forwardRef, useEffect, useState } from 'react';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import { toast } from 'react-toastify';
// import AxiosInstance from '../../../../Authentication/AxiosInstance';
// import Config from '../../../../Authentication/config';
// import './ContactForm.css';

// const ContactForm = forwardRef(({ cartItems, currency, cartId, onShippingPriceChange, onTaxChange }, ref) => {
//     const [shippingCountries, setShippingCountries] = useState([]);
//     const [companies, setCompanies] = useState([]);
//     const [selectedCountry, setSelectedCountry] = useState('');
//     const [selectedCompany, setSelectedCompany] = useState('');
//     const [errors, setErrors] = useState({});
//     const [orderData, setOrderData] = useState({
//         name: '',
//         phone: '',
//         country: '',
//         city: '',
//         neighborhood: '',
//         street: '',
//         Shipping: '',
//         cartId: cartId,
//         shippingPrice: 0,
//     });
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         const fetchShippingCountries = async () => {
//             try {
//                 const response = await AxiosInstance.get('/orders/shipping-countries/');
//                 setShippingCountries(response.data);
//                 const saudiArabia = response.data.find(country => country.code === 'sa');
//                 if (saudiArabia) {
//                     setSelectedCountry(saudiArabia.id);
//                     setOrderData(prevData => ({ ...prevData, country: saudiArabia.id }));
//                 }
//             } catch (error) {
//                 console.error('خطأ في جلب الدول:', error);
//                 toast.error('فشل في جلب قائمة الدول، حاول مرة أخرى.');
//             }
//         };
//         fetchShippingCountries();
//     }, []);

//     useEffect(() => {
//         if (selectedCountry) {
//             const fetchShippingDetails = async () => {
//                 try {
//                     const response = await AxiosInstance.get(`/orders/shipping-company/${selectedCountry}/`);
//                     const shippingCompanies = response.data?.Shipping || [];
//                     setCompanies(shippingCompanies);
//                     onTaxChange(response.data?.tax || 0);
//                     if (shippingCompanies.length > 0) {
//                         setSelectedCompany(shippingCompanies[0].id);
//                         const selectedCompanyObj = shippingCompanies.find(c => c.id === shippingCompanies[0].id);
//                         setOrderData(prevData => ({
//                             ...prevData,
//                             Shipping: shippingCompanies[0].id,
//                             shippingPrice: selectedCompanyObj?.shipping_price || 0,
//                         }));
//                         if (onShippingPriceChange) {
//                             onShippingPriceChange(selectedCompanyObj?.shipping_price || 0);
//                         }
//                     }
//                 } catch (error) {
//                     console.error('خطأ في جلب تفاصيل الشحن:', error);
//                     toast.error('فشل في جلب شركات الشحن، حاول مرة أخرى.');
//                 }
//             };
//             fetchShippingDetails();
//         }
//     }, [selectedCountry, onShippingPriceChange, onTaxChange]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setOrderData((prevData) => ({ ...prevData, [name]: value }));
//         setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
//     };

//     const handlePhoneChange = (phone, countryData) => {
//         setOrderData((prevData) => ({ ...prevData, phone }));
//         setErrors((prevErrors) => ({ ...prevErrors, phone: '' }));
//         // Log for debugging
//         // console.log('Phone changed:', phone, 'Country:', countryData.countryCode);
//     };

//     const handleShippingCompanySelect = (companyId) => {
//         setSelectedCompany(companyId);
//         const selectedCompanyObj = companies.find(c => c.id === companyId);
//         const newShippingPrice = selectedCompanyObj?.shipping_price || 0;
//         setOrderData((prevData) => ({
//             ...prevData,
//             Shipping: companyId,
//             shippingPrice: newShippingPrice,
//         }));
//         if (onShippingPriceChange) {
//             onShippingPriceChange(newShippingPrice);
//         }
//         setErrors((prevErrors) => ({ ...prevErrors, Shipping: '' }));
//     };

//     const validateForm = () => {
//         const formErrors = {};
//         if (!orderData.name.trim()) {
//             formErrors.name = 'يرجى إدخال الاسم.';
//         }
//         if (!orderData.phone.trim()) {
//             formErrors.phone = 'يرجى إدخال رقم الهاتف.';
//         }
//         // Optional: Log phone number for debugging, no strict validation

//         if (!orderData.country) {
//             formErrors.country = 'يرجى اختيار الدولة.';
//         }
//         if (!orderData.city.trim()) {
//             formErrors.city = 'يرجى إدخال المدينة.';
//         }
//         if (!orderData.neighborhood.trim()) {
//             formErrors.neighborhood = 'يرجى إدخال الحي.';
//         }
//         // if (!orderData.street.trim()) {
//         //     formErrors.street = 'يرجى إدخال الشارع.';
//         // }
//         if (!orderData.Shipping) {
//             formErrors.Shipping = 'يرجى اختيار طريقة الشحن.';
//         }
//         setErrors(formErrors);
//         return Object.keys(formErrors).length === 0;
//     };

//     React.useImperativeHandle(ref, () => ({
//         getValidatedOrderData: () => {
//             if (!validateForm()) {
//                 toast.error('يرجى تصحيح الأخطاء في النموذج قبل الإرسال.');
//                 return null;
//             }
//             return orderData;
//         },
//     }));

//     return (
//         <div className="contact-form-unique-container">
//             {cartItems.length === 0 ? (
//                 <div className="contact-form-unique-empty-cart-message">السلة فارغة، يرجى إضافة منتجات أولاً.</div>
//             ) : (
//                 <form className="contact-form-unique-form">
//                     <h3 className="contact-form-unique-title">بيانات الشحن</h3>
//                     <div className="contact-form-unique-row">
//                         <div className="contact-form-unique-group">
//                             <label htmlFor="name" className="contact-form-unique-label" aria-required="true">
//                                 الاسم<span className="contact-form-unique-required-star">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 id="name"
//                                 name="name"
//                                 className="contact-form-unique-input"
//                                 placeholder="الاسم"
//                                 value={orderData.name}
//                                 onChange={handleInputChange}
//                                 disabled={isLoading}
//                             />
//                             {errors.name && <span className="contact-form-unique-error">{errors.name}</span>}
//                         </div>
//                         <div className="contact-form-unique-group">
//                             <label htmlFor="phone" className="contact-form-unique-label" aria-required="true">
//                                 رقم الهاتف<span className="contact-form-unique-required-star">*</span>
//                             </label>
//                             <PhoneInput
//                                 country="sa"
//                                 value={orderData.phone}
//                                 onChange={handlePhoneChange}
//                                 inputProps={{ name: 'phone', required: true, style: { paddingLeft: '8px' } }}
//                                 containerClass="contact-form-unique-phone-container"
//                                 inputClass="contact-form-unique-phone-input"
//                                 disabled={isLoading}
//                                 dropdownStyle={{ width: '300px' }}
//                             />
//                             {errors.phone && <span className="contact-form-unique-error">{errors.phone}</span>}
//                         </div>
//                     </div>
//                     <div className="contact-form-unique-row">
//                         <div className="contact-form-unique-group">
//                             <label htmlFor="country" className="contact-form-unique-label" aria-required="true">
//                                 الدولة<span className="contact-form-unique-required-star">*</span>
//                             </label>
//                             <select
//                                 id="country"
//                                 name="country"
//                                 className="contact-form-unique-input"
//                                 value={orderData.country}
//                                 onChange={(e) => {
//                                     setSelectedCountry(e.target.value);
//                                     setOrderData((prevData) => ({ ...prevData, country: e.target.value }));
//                                 }}
//                                 disabled={isLoading}
//                             >
//                                 <option value="">اختر الدولة</option>
//                                 {shippingCountries.map((country) => (
//                                     <option key={country?.id} value={country?.id}>
//                                         {country?.name}
//                                     </option>
//                                 ))}
//                             </select>
//                             {errors.country && <span className="contact-form-unique-error">{errors.country}</span>}
//                         </div>
//                         <div className="contact-form-unique-group">
//                             <label htmlFor="city" className="contact-form-unique-label" aria-required="true">
//                                 المدينة<span className="contact-form-unique-required-star">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 id="city"
//                                 name="city"
//                                 className="contact-form-unique-input"
//                                 placeholder="المدينة"
//                                 value={orderData.city}
//                                 onChange={handleInputChange}
//                                 disabled={isLoading}
//                             />
//                             {errors.city && <span className="contact-form-unique-error">{errors.city}</span>}
//                         </div>
//                     </div>
//                     <div className="contact-form-unique-row">
//                         <div className="contact-form-unique-group">
//                             <label htmlFor="neighborhood" className="contact-form-unique-label" aria-required="true">
//                                 الحي<span className="contact-form-unique-required-star">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 id="neighborhood"
//                                 name="neighborhood"
//                                 className="contact-form-unique-input"
//                                 placeholder="الحي"
//                                 value={orderData.neighborhood}
//                                 onChange={handleInputChange}
//                                 disabled={isLoading}
//                             />
//                             {errors.neighborhood && <span className="contact-form-unique-error">{errors.neighborhood}</span>}
//                         </div>
//                         <div className="contact-form-unique-group">
//                             <label htmlFor="street" className="contact-form-unique-label" aria-required="true">
//                                 الشارع<span className="contact-form-unique-required-star">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 id="street"
//                                 name="street"
//                                 className="contact-form-unique-input"
//                                 placeholder="الشارع"
//                                 value={orderData.street}
//                                 onChange={handleInputChange}
//                                 disabled={isLoading}
//                             />
//                             {errors.street && <span className="contact-form-unique-error">{errors.street}</span>}
//                         </div>
//                     </div>
//                     {companies.length > 0 && (
//                         <div className="contact-form-unique-shipping-section">
//                             <h4 className="contact-form-unique-shipping-title">طريقة الشحن</h4>
//                             <div className="contact-form-unique-shipping-methods">
//                                 {companies.map((company) => (
//                                     <div
//                                         key={company.id}
//                                         className={`contact-form-unique-shipping-card ${selectedCompany === company.id ? 'contact-form-unique-selected' : ''}`}
//                                         onClick={() => handleShippingCompanySelect(company.id)}
//                                     >
//                                         <div className="contact-form-unique-shipping-card-content">
//                                             <img
//                                                 src={`${Config.baseURL}${company.image}`}
//                                                 alt={company.name}
//                                                 className="contact-form-unique-shipping-icon"
//                                             />
//                                             <div className="contact-form-unique-shipping-details">
//                                                 <span className="contact-form-unique-shipping-name">{company.name}</span>
//                                                 <span className="contact-form-unique-shipping-days">{company.work_days}</span>
//                                             </div>
//                                             <span className="contact-form-unique-shipping-price">
//                                                 {company.shipping_price} {currency}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {errors.Shipping && <span className="contact-form-unique-error">{errors.Shipping}</span>}
//                             </div>
//                         </div>
//                     )}
//                 </form>
//             )}
//         </div>
//     );
// });

// export default ContactForm;



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

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await AxiosInstance.get('/orders/shipping-countries/');
                setShippingCountries(res.data);
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

    useEffect(() => {
        if (selectedCountry) {
            const fetchCompanies = async () => {
                try {
                    const res = await AxiosInstance.get(`/orders/shipping-company/${selectedCountry}/`);
                    const comps = res.data?.Shipping || [];
                    setCompanies(comps);
                    onTaxChange(res.data?.tax || 0);

                    if (comps.length > 0) {
                        const first = comps[0];
                        setSelectedCompany(first.id);
                        const price = first.shipping_price || 0;
                        set_FormData(prev => ({ ...prev, Shipping: first.id, shippingPrice: price }));
                        onShippingPriceChange(price);
                    }
                } catch (err) {
                    toast.error('فشل جلب شركات الشحن');
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
            <form className="contact-form-unique-form" onSubmit={e => e.preventDefault()}>
                <h3 className="contact-form-unique-title">بيانات الشحن</h3>

                <div className="contact-form-unique-row">
                    <div className="contact-form-unique-group">
                        <label>الاسم <span className="contact-form-unique-required-star">*</span></label>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="الاسم الكامل" className="contact-form-unique-input" />
                        {errors.name && <span className="contact-form-unique-error">{errors.name}</span>}
                    </div>
                    <div className="contact-form-unique-group">
                        <label>رقم الهاتف <span className="contact-form-unique-required-star">*</span></label>


                        <PhoneInput
                            country="sa"
                            value={formData.phone || ''}
                            onChange={handlePhone}
                            inputProps={{ name: 'phone', required: true, style: { paddingLeft: '8px' } }}
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
                            onChange={(e) => {
                                setSelectedCountry(e.target.value);
                                set_FormData(prev => ({ ...prev, country: e.target.value }));
                            }}
                        >
                            <option value="">اختر الدولة</option>
                            {shippingCountries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.country && <span className="contact-form-unique-error">{errors.country}</span>}
                    </div>
                    <div className="contact-form-unique-group">
                        <label>المدينة <span className="contact-form-unique-required-star">*</span></label>
                        <input name="city" value={formData.city || ''} onChange={handleChange} placeholder="المدينة" className="contact-form-unique-input" />
                        {errors.city && <span className="contact-form-unique-error">{errors.city}</span>}
                    </div>
                </div>

                <div className="contact-form-unique-row">
                    <div className="contact-form-unique-group">
                        <label>الحي <span className="contact-form-unique-required-star">*</span></label>
                        <input name="neighborhood" value={formData.neighborhood || ''} onChange={handleChange} placeholder="الحي" className="contact-form-unique-input" />
                        {errors.neighborhood && <span className="contact-form-unique-error">{errors.neighborhood}</span>}
                    </div>
                    <div className="contact-form-unique-group">
                        <label>الشارع</label>
                        <input name="street" value={formData.street || ''} onChange={handleChange} placeholder="اختياري" className="contact-form-unique-input" />
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
                                        <img src={`${Config.baseURL}${comp.image}`} alt={comp.name} />
                                        <div>
                                            <span>{comp.name}</span>
                                            <span>{comp.work_days}</span>
                                        </div>
                                        <span>{comp.shipping_price} {currency}</span>
                                    </div>
                                </div>
                            ))}
                            {errors.Shipping && <span className="contact-form-unique-error">{errors.Shipping}</span>}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
});

export default ContactForm;