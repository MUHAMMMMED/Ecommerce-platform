import React, { useContext, useState } from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import slugify from 'slugify';

import { CartContext } from '../../../../Context/CartContext';
import './CartItem.css';

const CartItem = ({ item, currency }) => {
    const { updateQuantity, removeFromCart, addNote, deleteNote } = useContext(CartContext);
    const [noteInput, setNoteInput] = useState('');
    const [expandedNotes, setExpandedNotes] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleQuantityChange = async (delta) => {
        if (isLoading) return;
        setIsLoading(true);
        const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.stock || Infinity));
        try {
            await updateQuantity(item.id, newQuantity);
            setNoteInput('');
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('حدث خطأ أثناء تحديث الكمية، حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await removeFromCart(item.id);
        } catch (error) {
            console.error('Error deleting cart item:', error);
            alert('حدث خطأ أثناء حذف العنصر، حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNoteChange = (e) => {
        setNoteInput(e.target.value);
    };

    const handleAddNote = async () => {
        const noteText = noteInput.trim();
        if (!noteText) {
            alert('يرجى إدخال ملاحظة قبل الإضافة.');
            return;
        }
        try {
            await addNote(item.id, noteText);
            setNoteInput('');
        } catch (error) {
            console.error('Error adding note:', error);
            alert('حدث خطأ أثناء إضافة الملاحظة، حاول مرة أخرى.');
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await deleteNote(item.id, noteId);
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('حدث خطأ أثناء حذف الملاحظة، حاول مرة أخرى.');
        }
    };

    const toggleNoteExpansion = (noteId) => {
        setExpandedNotes((prev) => ({
            ...prev,
            [noteId]: !prev[noteId],
        }));
    };

    const subtotal = (item.price * item.quantity).toFixed(2);

    const formatTitleForUrl = (title) => {
        return slugify(title || '', {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };



    return (
        <div className="ci-cart-item">
            {/* Image Section
            <div className="ci-image-section">
                <div className="ci-item-image-container">
                    <img
                        src={`${Config.baseURL}${item.image}`}
                        alt={item.name || 'صورة المنتج'}
                        className="ci-item-image"
                    />
                </div>
            </div> */}

            {/* Content Section */}
            <div className="ci-content-section">
                <div className="ci-product-info">
                    <Link
                        to={`/products/${formatTitleForUrl(item?.name)}/${item?.product_id}`}
                        className="ci-item-link"
                    >
                        <h3 className="ci-item-title">{item?.name || 'منتج بدون اسم'}</h3>
                    </Link>
                    <button className="ci-item-remove" onClick={handleRemove} disabled={isLoading}>
                        <FaTrash />
                    </button>
                </div>

                <div className="ci-product-info">
                    <div className="ci-price-section">
                        <span className="ci-item-price">
                            {item.price.toFixed(2)} <span className="ci-currency">{currency}</span>
                        </span>
                    </div>

                    {item.variant && (
                        <div className="ci-variant-section">
                            {item.variant.size && (
                                <span className="ci-variant-size">
                                    المقاس: <span className="ci-size-swatch">{item.variant.size}</span>
                                </span>
                            )}
                            {item.variant.color && (
                                <span className="ci-variant-color">
                                    اللون: {item.variant.color.name}
                                    <span
                                        className="ci-color-swatch"
                                        style={{ backgroundColor: item.variant.color.hex_code }}
                                    />
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Notes Section */}
                {item.isNot && (
                    <div className="ci-notes">
                        {Array.isArray(item.notes) && item.notes.length > 0 && (
                            <>
                                <span>الملاحظات:</span>
                                <ul>
                                    {item.notes.map((note) => (
                                        <li key={note.id} className="ci-note-item">
                                            <div className="ci-note-content">
                                                <span className="ci-note-text">
                                                    {note.text.length > 50 && !expandedNotes[note.id]
                                                        ? `${note.text.slice(0, 50)}...`
                                                        : note.text}
                                                </span>
                                                {note.text.length > 50 && (
                                                    <button
                                                        className="ci-toggle-note-btn"
                                                        onClick={() => toggleNoteExpansion(note.id)}
                                                    >
                                                        {expandedNotes[note.id] ? 'عرض أقل' : 'عرض المزيد'}
                                                    </button>
                                                )}
                                                <button
                                                    className="ci-delete-note-btn"
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    disabled={isLoading}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {item.notes?.length < item.quantity && (
                            <div className="ci-add-note">
                                <input
                                    type="text"
                                    value={noteInput}
                                    onChange={handleNoteChange}
                                    placeholder="أضف ملاحظة..."
                                    className="ci-note-input"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={isLoading || !noteInput.trim()}
                                    className="ci-add-note-btn"
                                >
                                    إضافة
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Quantity & Subtotal */}
                <div className="ci-controls-section">
                    <div className="ci-quantity-controls">
                        <button
                            className="ci-quantity-btn minus"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={isLoading || item.quantity <= 1}
                        >
                            <FaMinus />
                        </button>
                        <span className="ci-quantity-value">{item.quantity}</span>
                        <button
                            className="ci-quantity-btn plus"
                            onClick={() => handleQuantityChange(1)}
                            disabled={isLoading || item.quantity >= item.stock}
                        >
                            <FaPlus />
                        </button>
                    </div>
                    <div className="ci-subtotal-section">
                        <span className="ci-subtotal-label">الإجمالي الفرعي:</span>
                        <span className="ci-subtotal-value">
                            {subtotal} <span className="ci-currency">{currency}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;