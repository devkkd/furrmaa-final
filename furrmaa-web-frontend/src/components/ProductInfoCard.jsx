const ProductInfoCard = ({ order }) => {
  const item = order.items[0];

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
      <div className="aspect-square w-full max-w-[280px] mx-auto bg-gray-50 rounded-2xl mb-6 overflow-hidden border border-gray-100 p-4">
        <img src={item.product.image} alt="Product" className="w-full h-full object-contain" />
      </div>

      <h3 className="text-sm font-bold text-gray-800 mb-2">
        {item.product.name}
      </h3>

      <p className="text-sm font-extrabold text-gray-900 mb-4">
        Order ID: #{order._id}
      </p>

      <p className="text-sm font-bold text-gray-900 mb-8">
        Placed, {new Date(order.createdAt).toDateString()}
      </p>

      <div className="pt-6 border-t border-gray-50">
        <p className="text-xs font-bold text-gray-400 mb-3">Deliver to:</p>
        <div className="text-sm text-gray-700 font-medium">
          {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} |{" "}
          <span className="font-bold">{order.shippingAddress.phone}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoCard;