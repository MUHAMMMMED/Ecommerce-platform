
import React, { useContext, useState } from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { TbShoppingBag, TbShoppingBagPlus } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Config from '../../Authentication/config';
import { CartContext } from '../../Context/CartContext';
import './FloatingCart.css';

const FloatingCart = () => {
    const { cartItems, currency, cartCount, loading, isOpen, toggleCart, updateQuantity, removeFromCart, addNote, deleteNote } = useContext(CartContext);
    const navigate = useNavigate();
    const [noteInputs, setNoteInputs] = useState({}); // Track note input for each cart item
    const [expandedNotes, setExpandedNotes] = useState({}); // Track expanded state for each note

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const handleQuantityChange = async (id, delta) => {
        const item = cartItems.find(item => item.id === id);
        let newQuantity = item.quantity + delta;

        try {
            if (newQuantity <= 0) {
                // Delete item if quantity becomes zero or less
                await removeFromCart(id);
                toast.success('تم إزالة المنتج من السلة');
            } else if (newQuantity > item.stock) {
                // Prevent exceeding stock
                toast.error('الكمية تتجاوز المخزون المتاح');
            } else {
                // Update quantity if valid
                await updateQuantity(id, newQuantity);
                setNoteInputs(prev => ({ ...prev, [id]: '' }));
                toast.success('تم تحديث الكمية');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('فشل في تحديث الكمية');
        }
    };

    const handleRemove = async (id) => {
        try {
            await removeFromCart(id);
            setNoteInputs(prev => {
                const newInputs = { ...prev };
                delete newInputs[id];
                return newInputs;
            });
            toast.success('تم إزالة المنتج من السلة');
        } catch (error) {
            console.error('Error deleting cart item:', error);
            toast.error('فشل في إزالة المنتج من السلة');
        }
    };

    const handleNoteChange = (id, value) => {
        setNoteInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleAddNote = async (cartItemId) => {
        const noteText = noteInputs[cartItemId]?.trim();
        if (!noteText) {
            toast.error('يرجى إدخال ملاحظة صالحة');
            return;
        }
        try {
            await addNote(cartItemId, noteText);
            setNoteInputs(prev => ({ ...prev, [cartItemId]: '' }));
            toast.success('تم إضافة الملاحظة');
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('فشل في إضافة الملاحظة');
        }
    };

    const handleDeleteNote = async (cartItemId, noteId) => {
        try {
            await deleteNote(cartItemId, noteId);
            toast.success('تم حذف الملاحظة');
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('فشل في حذف الملاحظة');
        }
    };

    const toggleNoteExpansion = (cartItemId, noteId) => {
        setExpandedNotes(prev => ({
            ...prev,
            [`${cartItemId}-${noteId}`]: !prev[`${cartItemId}-${noteId}`]
        }));
    };

    const isMobile = window.innerWidth <= 768;

    const handleButtonClick = () => {
        if (isMobile) {
            navigate('/cart');
        } else {
            toggleCart();
        }
    };

    return (
        <div className="fc-container">
            <button className="fc-cart-float-button" onClick={handleButtonClick}>
                <TbShoppingBag />
                {cartCount > 0 && <span className="fc-cart-badge">{cartCount}</span>}
            </button>

            <div className={`fc-cart-sidebar-wrapper ${isOpen ? 'fc-open' : ''}`}>
                <div className={`fc-cart-sidebar ${isOpen ? 'fc-slide-in' : 'fc-slide-out'}`}>
                    <div className="fc-cart-sidebar-header">
                        <h3>عربة التسوق</h3>
                        <button className="fc-close-btn" onClick={toggleCart}>
                            <TbShoppingBagPlus />
                        </button>
                    </div>

                    <div className="fc-cart-items">
                        {loading ? (
                            <p>جارٍ التحميل...</p>
                        ) : cartItems.length === 0 ? (
                            <p className="fc-empty-cart">عربة التسوق فارغة</p>
                        ) : (
                            cartItems.map(item => (
                                <div className="fc-cart-item" key={item.id}>
                                    <button className="fc-remove-btn" onClick={() => handleRemove(item.id)}>
                                        <FaTrash />
                                    </button>
                                    <img
                                        src={item.image ? `${Config.baseURL}${item.image}` : ' '}
                                        alt={item.name}
                                    />
                                    <div className="fc-item-info">
                                        <p className="fc-item-name">{item.name}</p>
                                        {item.variant && (
                                            <div className="fc-variant-details">
                                                {item.variant.size && (
                                                    <span>المقاس: {item.variant.size}</span>
                                                )}
                                                {item.variant.color && (
                                                    <span className="fc-color-detail">
                                                        اللون: {item.variant.color.name}
                                                        <span
                                                            className="fc-color-swatch"
                                                            style={{ backgroundColor: item.variant.color.hex_code }}
                                                        ></span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {item.notes.length > 0 && (
                                            <div className="fc-notes">
                                                <span>الملاحظات:</span>
                                                <ul>
                                                    {item.notes.map((note, index) => (
                                                        <li key={note.id} className="fc-note-item">
                                                            <div className="fc-note-content">
                                                                <span className="fc-note-text">
                                                                    {note.text.length > 50 && !expandedNotes[`${item.id}-${note.id}`]
                                                                        ? `${note.text.slice(0, 50)}...`
                                                                        : note.text}
                                                                </span>
                                                                {note.text.length > 50 && (
                                                                    <button
                                                                        className="fc-toggle-note-btn"
                                                                        onClick={() => toggleNoteExpansion(item.id, note.id)}
                                                                    >
                                                                        {expandedNotes[`${item.id}-${note.id}`] ? 'عرض أقل' : 'عرض المزيد'}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="fc-delete-note-btn"
                                                                    onClick={() => handleDeleteNote(item.id, note.id)}
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {item.isNot && item.notes.length < item.quantity && (
                                            <div className="fc-add-note">
                                                <input
                                                    type="text"
                                                    value={noteInputs[item.id] || ''}
                                                    onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                                    placeholder="أضف ملاحظة..."
                                                />
                                                <button
                                                    onClick={() => handleAddNote(item.id)}
                                                    disabled={!noteInputs[item.id]?.trim()}
                                                >
                                                    إضافة
                                                </button>
                                            </div>
                                        )}
                                        <div className="fc-item-details">
                                            <span className="fc-item-price">
                                                {item.price.toFixed(2)} <span className="fc-currency">{currency}</span>
                                            </span>
                                            <div className="fc-quantity-controls">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, -1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 1)}
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="fc-item-subtotal">
                                            <span className="fc-subtotal-label">الإجمالي الفرعي:</span>
                                            <span className="fc-subtotal-value">
                                                {(item.price * item.quantity).toFixed(2)} {currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="fc-cart-footer">
                        <div className="fc-total-price">
                            <span>الإجمالي العام:</span>
                            <span>{totalPrice} {currency}</span>
                        </div>
                        <Link to="/cart">
                            <button className="fc-checkout-button" disabled={cartItems.length === 0}>
                                متابعة الشراء
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="fc-overlay" onClick={toggleCart} />
            </div>
        </div>
    );
};

export default FloatingCart;