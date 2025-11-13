import React, { useEffect, useState } from 'react';
import AxiosInstance from '../../Authentication/AxiosInstance';
import ErrorPage from '../../components/Loading/ErrorPage';
import Loading from '../../components/Loading/Loading';
import './Shipping.css';

const Shipping = () => {
    const [countries, setCountries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [countryFormData, setCountryFormData] = useState({ name: '', tax: 0 });
    const [companyFormData, setCompanyFormData] = useState({
        name: '', shipping_price: 0, discount_price: 0, work_days: '', image: null
    });
    const [editingCountry, setEditingCountry] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [selectedCountryId, setSelectedCountryId] = useState(null);
    const [expandedCountryId, setExpandedCountryId] = useState(null);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const response = await AxiosInstance.get(`/shipping/country/`);
            setCountries(response.data);
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في جلب البلدان');
            setIsLoading(false);
        }
    };

    const handleCountryInputChange = (e) => {
        const { name, value } = e.target;
        setCountryFormData({ ...countryFormData, [name]: name === 'tax' ? parseInt(value) || 0 : value });
    };

    const handleCompanyInputChange = (e) => {
        const { name, value } = e.target;
        setCompanyFormData({
            ...companyFormData,
            [name]: name === 'shipping_price' || name === 'discount_price' ? parseFloat(value) || 0 : value
        });
    };

    const handleCompanyFileChange = (e) => {
        setCompanyFormData({ ...companyFormData, image: e.target.files[0] });
    };

    const handleCountrySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCountry) {
                const response = await AxiosInstance.patch(`/shipping/country/${editingCountry.id}/`, countryFormData);
                setCountries(countries.map(c => (c.id === editingCountry.id ? response.data : c)));
            } else {
                const response = await AxiosInstance.post(`/shipping/country/`, countryFormData);
                setCountries([...countries, response.data]);
            }
            resetCountryForm();
            setIsCountryModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في حفظ البلد');
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', companyFormData.name);
        data.append('shipping_price', companyFormData.shipping_price);
        data.append('discount_price', companyFormData.discount_price);
        data.append('work_days', companyFormData.work_days);
        if (companyFormData.image) {
            data.append('image', companyFormData.image);
        }

        try {
            if (editingCompany) {
                const response = await AxiosInstance.patch(`/shipping/company/${editingCompany.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setCountries(countries.map(country => ({
                    ...country,
                    Shipping: country.Shipping.map(comp =>
                        comp.id === editingCompany.id ? response.data : comp
                    )
                })));
            } else {
                const response = await AxiosInstance.post(`/shipping/country/${selectedCountryId}/add_company/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setCountries(countries.map(country =>
                    country.id === selectedCountryId
                        ? { ...country, Shipping: [...country.Shipping, response.data] }
                        : country
                ));
            }
            resetCompanyForm();
            setIsCompanyModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في حفظ الشركة');
        }
    };

    const handleDeleteCountry = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا البلد؟')) {
            try {
                await AxiosInstance.delete(`/shipping/country/${id}/`);
                setCountries(countries.filter(c => c.id !== id));
            } catch (err) {
                setError(err.response?.data?.detail || 'فشل في حذف البلد');
            }
        }
    };

    const handleDeleteCompany = async (countryId, companyId) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الشركة؟')) {
            try {
                await AxiosInstance.delete(`/shipping/country/${countryId}/remove_company/${companyId}/`);
                setCountries(countries.map(country =>
                    country.id === countryId
                        ? { ...country, Shipping: country.Shipping.filter(comp => comp.id !== companyId) }
                        : country
                ));
            } catch (err) {
                setError(err.response?.data?.detail || 'فشل في حذف الشركة');
            }
        }
    };

    const resetCountryForm = () => {
        setCountryFormData({ name: '', tax: 0 });
        setEditingCountry(null);
    };

    const resetCompanyForm = () => {
        setCompanyFormData({ name: '', shipping_price: 0, discount_price: 0, work_days: '', image: null });
        setEditingCompany(null);
        setSelectedCountryId(null);
    };

    const openCountryModal = (country = null) => {
        if (country) {
            setEditingCountry(country);
            setCountryFormData({ name: country.name, tax: country.tax });
        }
        setIsCountryModalOpen(true);
    };

    const openCompanyModal = (countryId, company = null) => {
        setSelectedCountryId(countryId);
        if (company) {
            setEditingCompany(company);
            setCompanyFormData({
                name: company.name,
                shipping_price: company.shipping_price,
                discount_price: company.discount_price,
                work_days: company.work_days,
                image: null
            });
        }
        setIsCompanyModalOpen(true);
    };

    const toggleCountryExpand = (countryId) => {
        setExpandedCountryId(expandedCountryId === countryId ? null : countryId);
    };


    if (isLoading) return <Loading />;
    if (error) return <ErrorPage head='فشل في جلب البلدان' error={error} />;
    return (
        <div className="shipping-dashboard">
            <div className="dashboard-header">
                <h2>إدارة الشحن</h2>
                <button onClick={() => openCountryModal()} className="btn-add">إضافة بلد</button>
            </div>

            <div className="countries-list">
                {countries.length > 0 ? (
                    countries.map(country => (
                        <div key={country.id} className="country-card">
                            <div className="country-header" onClick={() => toggleCountryExpand(country.id)}>
                                <h3>{country.name}</h3>
                                <div className="country-actions">
                                    <button onClick={(e) => { e.stopPropagation(); openCountryModal(country); }} className="btn-edit">تعديل</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCountry(country.id); }} className="btn-delete">حذف</button>
                                    <span className="expand-icon">{expandedCountryId === country.id ? '−' : '+'}</span>
                                </div>
                            </div>
                            {expandedCountryId === country.id && (
                                <div className="country-details">
                                    <p><strong>الضريبة:</strong> ${country.tax}</p>
                                    <div className="companies-section">
                                        <div className="companies-header">
                                            <h4>شركات الشحن</h4>
                                            <button
                                                onClick={() => openCompanyModal(country.id)}
                                                className="btn-add-company"
                                            >
                                                إضافة شركة
                                            </button>
                                        </div>
                                        {country.Shipping.length > 0 ? (
                                            <div className="companies-list">
                                                {country.Shipping.map(company => (
                                                    <div key={company.id} className="company-card">
                                                        <div className="company-details">
                                                            {company.image && (
                                                                <img src={company.image} alt={company.name} className="company-image" />
                                                            )}
                                                            <p><strong>الاسم:</strong> {company.name}</p>
                                                            <p><strong>سعر الشحن:</strong> ${company.shipping_price.toFixed(2)}</p>
                                                            <p><strong>سعر الخصم:</strong> ${company.discount_price.toFixed(2)}</p>
                                                            <p><strong>أيام العمل:</strong> {company.work_days}</p>
                                                        </div>
                                                        <div className="company-actions">
                                                            <button
                                                                onClick={() => openCompanyModal(country.id, company)}
                                                                className="btn-edit"
                                                            >
                                                                تعديل
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCompany(country.id, company.id)}
                                                                className="btn-delete"
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-companies">لم يتم العثور على شركات شحن.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-countries">لم يتم العثور على بلدان.</p>
                )}
            </div>

            {isCountryModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingCountry ? 'تعديل البلد' : 'إضافة بلد'}</h3>
                            <button onClick={() => setIsCountryModalOpen(false)} className="btn-close">×</button>
                        </div>
                        <form onSubmit={handleCountrySubmit} className="country-form">
                            <div className="form-group">
                                <label htmlFor="name">الاسم*</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={countryFormData.name}
                                    onChange={handleCountryInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="tax">الضريبة ($)*</label>
                                <input
                                    type="number"
                                    id="tax"
                                    name="tax"
                                    min="0"
                                    value={countryFormData.tax}
                                    onChange={handleCountryInputChange}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save">{editingCountry ? 'تحديث' : 'إضافة'}</button>
                                <button type="button" onClick={() => setIsCountryModalOpen(false)} className="btn-cancel">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCompanyModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingCompany ? 'تعديل الشركة' : 'إضافة شركة'}</h3>
                            <button onClick={() => setIsCompanyModalOpen(false)} className="btn-close">×</button>
                        </div>
                        <form onSubmit={handleCompanySubmit} className="company-form">
                            <div className="form-group">
                                <label htmlFor="name">الاسم*</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={companyFormData.name}
                                    onChange={handleCompanyInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="shipping_price">سعر الشحن ($)*</label>
                                <input
                                    type="number"
                                    id="shipping_price"
                                    name="shipping_price"
                                    min="0"
                                    step="0.01"
                                    value={companyFormData.shipping_price}
                                    onChange={handleCompanyInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="discount_price">سعر الخصم ($)</label>
                                <input
                                    type="number"
                                    id="discount_price"
                                    name="discount_price"
                                    min="0"
                                    step="0.01"
                                    value={companyFormData.discount_price}
                                    onChange={handleCompanyInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="work_days">أيام العمل*</label>
                                <input
                                    type="text"
                                    id="work_days"
                                    name="work_days"
                                    value={companyFormData.work_days}
                                    onChange={handleCompanyInputChange}
                                    required
                                    placeholder="مثال: الأحد-الخميس"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="image">الصورة</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleCompanyFileChange}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save">{editingCompany ? 'تحديث' : 'إضافة'}</button>
                                <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="btn-cancel">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shipping;