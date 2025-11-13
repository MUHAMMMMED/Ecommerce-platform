
from django.core.mail import EmailMessage
from django.conf import settings

def send_invoice_email(order):
    try:
        # print("🔎 Starting invoice creation...")

        # تجهيز المنتجات
        items = order.get('items', [])
        flat_items = []

        for item in items:
            # حساب السعر لكل منتج
            price = item.get('price', 0)
            if isinstance(price, dict):
                price_val = float(price.get('amount', 0))
            else:
                price_val = float(price or 0)

            quantity = int(item.get('quantity', 1))
            total_item = price_val * quantity

            # الحصول على اسم المنتج
            product_data = item.get('product', {})
            if isinstance(product_data, dict):
                product_title = product_data.get('title', 'غير محدد')
            else:
                product_title = item.get('title', 'غير محدد')

            flat_items.append({
                "product_title": product_title,
                "color": item.get('color'),
                "quantity": quantity,
                "price": f"{price_val:.2f}",
                "total": f"{total_item:.2f}",
            })

        # حساب المجاميع
        subtotal = sum(float(i['total']) for i in flat_items)
        tax = float(order.get('tax_amount', 0))
        shipping = float(order.get('shipping', 0))
        total = float(order.get('total', 0))
        calculated_total = subtotal + tax + shipping
        discount = max(calculated_total - total, 0)

        # بيانات العميل
        customer = order.get('customer', {})
        country_data = customer.get('country', {})
        customer_country = country_data.get('name', 'غير محدد') if isinstance(country_data, dict) else country_data or 'غير محدد'

        # بناء HTML للمنتجات
        html_items = ""
        for idx, item in enumerate(flat_items, 1):
            row_bg = "#f9f9f9" if idx % 2 == 0 else "white"
            html_items += f"""
            <tr style="background: {row_bg};">
                <td style="padding: 10px; text-align: center;">{idx}</td>
                <td style="padding: 10px; text-align: right;">{item['product_title']}</td>
                <td style="padding: 10px; text-align: center;">{item['color'] or '-'}</td>
                <td style="padding: 10px; text-align: center;">{item['quantity']}</td>
                <td style="padding: 10px; text-align: center;">{item['price']} EGP</td>
                <td style="padding: 10px; text-align: center;">{item['total']} EGP</td>
            </tr>
            """

        # بناء HTML الفاتورة
        html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة طلبك #{order.get('id') or 'غير متوفر'}</title>
</head>
<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 0; padding: 0; background: #f4f4f4;">
    <table style="width: 100%; max-width: 800px; margin: 20px auto; border-collapse: collapse; background: white; border: 1px solid #ddd;">
        <tbody>
            <tr>
                <td style="background: #134e4a; color: white; padding: 20px; text-align: right;">
                    <h1 style="font-size: 24px; margin: 0;">فاتورة ضريبية</h1>
                    <p style="font-size: 16px; margin: 5px 0;">ALTAUREA</p>
           
                </td>
            </tr>
            <tr>
                <td style="padding: 15px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; background: #f1f1f1;"># رقم الفاتورة: {order.get('invoice_number', 'غير متوفر')}</td>
                            <td style="padding: 10px; background: #f1f1f1;">📅 تاريخ الفاتورة: {order.get('created_at', '')}</td>
                            <td style="padding: 10px; background: {'#2ecc71' if order.get('is_paid') else '#e74c3c'}; color: white;">
                                💳 حالة الدفع: {'تم الدفع' if order.get('is_paid') else 'لم يتم الدفع'}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <h3 style="font-size: 18px; color: #134e4a;">📍 معلومات العميل</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; background: #f8f9fa;"><strong>الاسم:</strong> {customer.get('name', 'غير معروف')}</td>
                            <td style="padding: 10px; background: #f8f9fa;"><strong>الهاتف:</strong> {customer.get('phone', 'غير متوفر')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f8f9fa;"><strong>الدولة:</strong> {customer_country}</td>
                            <td style="padding: 10px; background: #f8f9fa;"><strong>المحافظة:</strong> {customer.get('governorate', 'غير محدد')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f8f9fa;"><strong>المدينة:</strong> {customer.get('city', 'غير محدد')}</td>
                            <td style="padding: 10px; background: #f8f9fa;"><strong>الحي:</strong> {customer.get('neighborhood', 'غير محدد')}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 10px; background: #f8f9fa;"><strong>عنوان الشحن:</strong> {customer.get('shipping_address', 'غير محدد')}</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <h3 style="font-size: 18px; color: #134e4a;">🛒 تفاصيل المنتجات</h3>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <thead>
                            <tr style="background: #134e4a; color: white;">
                                <th style="padding: 10px; text-align: center;">#</th>
                                <th style="padding: 10px; text-align: right;">المنتج</th>
                                <th style="padding: 10px; text-align: center;">اللون</th>
                                <th style="padding: 10px; text-align: center;">الكمية</th>
                                <th style="padding: 10px; text-align: center;">السعر</th>
                                <th style="padding: 10px; text-align: center;">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {html_items}
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; background: #f8f9fa;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px;">المجموع الفرعي:</td>
                            <td style="padding: 10px; text-align: left;">{subtotal:.2f} SAR</td>
                        </tr>
                        {f"<tr><td style='padding: 10px;'>الخصم:</td><td style='padding: 10px; text-align: left; color: #e74c3c;'>-{discount:.2f} SAR</td></tr>" if discount else ""}
                        <tr>
                            <td style="padding: 10px;">الشحن:</td>
                            <td style="padding: 10px; text-align: left;">{shipping:.2f} SAR</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">الضريبة:</td>
                            <td style="padding: 10px; text-align: left;">{tax:.2f} SAR</td>
                        </tr>
                        <tr style="font-weight: bold; border-top: 2px solid #ddd;">
                            <td style="padding: 10px;">الإجمالي النهائي:</td>
                            <td style="padding: 10px; text-align: left; color: #134e4a;">{total:.2f} SAR</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; text-align: center; background: #f8f9fa;">
                    <p style="font-size: 16px; color: #134e4a; margin: 0 0 10px;">✨ شكراً لاختياركم متجرنا ✨</p>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
"""

        # إرسال الإيميل
        email = EmailMessage(
            subject=f"فاتورة طلبك #{order.get('id') or 'غير متوفر'}",
            body=html_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=['nfcsmartcard1@gmail.com'],  
        )
        email.content_subtype = "html"
        email.send()
        # print("✅ HTML Email sent successfully")

    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        raise