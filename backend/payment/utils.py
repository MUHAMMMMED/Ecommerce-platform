 
from orders.models import Order,OrderItem,DictionaryProductName
from cart.models import CartItem
import random
import datetime
 


def generate_invoice_number():
    while True:
        random_number = random.randint(1000, 9999)
        current_date = datetime.datetime.now()
        formatted_date = current_date.strftime('%Y%m%d')
        invoice_number = f"{formatted_date}{random_number}"
        # Check if the invoice number already exists in Order objects
        if not Order.objects.filter(invoice_number=invoice_number).exists():
            return invoice_number

 
  
def generate_tracking_number():
    while True:
        random_number = random.randint(1000, 9999)
        current_date = datetime.datetime.now()
        formatted_date = current_date.strftime('%Y%m%d')
        tracking_number = f"{formatted_date}{random_number}"
        # Check if the tracking number already exists in Order objects
        if not Order.objects.filter(tracking=tracking_number).exists():
       
            return tracking_number
 





def get_price_based_on_quantity(product, quantity):
    # Calculate the discount price
    discount_price = product.price - (product.price * product.discount / 100)

    # Determine which price to use for subtotal
    if product.price > discount_price:
        total = discount_price * quantity
    else:
        total = product.price * quantity
    
    return total

   
def handle_Cart_To_OrderItem(final_total,taxAmount, order_id, cart_id):
    # try:
           # Get the order and update the total
            order = Order.objects.get(id=order_id)
            shipping = order.shipping_company.shipping_price
            order.shipping = shipping
            order.total = final_total
            country_tax = order.customer.country.tax or 0
            order.tax = country_tax
            order.tax_amount = taxAmount
            order.save()
           

            # Transfer cart items to order items
            cart_items = CartItem.objects.filter(cart_id=cart_id)
            for item in cart_items:
                name = item.product.name
                quantity = item.quantity
                price = get_price_based_on_quantity(item.product, quantity)
 
                dictionary, _ = DictionaryProductName.objects.get_or_create(name=name)
                orderItem, _ = OrderItem.objects.get_or_create(
                    order = order,
                    dictionary = dictionary,
                    quantity = quantity,
                    price = price,
                    cost = item.product.cost
                )

                for note in item.notes.all():  # Assuming notes is a ManyToMany field
                    orderItem.notes.add(note)
                orderItem.save()



 