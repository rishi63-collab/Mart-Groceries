import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import "./checkout.css";

const Checkout = () => {
  const context = useContext(MyContext);

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= LOAD CART =================
  useEffect(() => {
    if (!user) return;

    fetchDataFromApi(`/api/cart/${user._id || user.id || user.uid}`).then(
      (res) => {
        if (res?.success) {
          setCartItems(res.cartItems);
        }
      }
    );
  }, [user]);

  // ================= TOTAL =================
  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // ================= LOAD RAZORPAY SCRIPT =================
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ================= HANDLE CHECKOUT =================
  const handleCheckout = async () => {
    if (!address) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Enter address!",
      });
      return;
    }

    //  LOAD SCRIPT
    const loaded = await loadRazorpay();

    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    //  CREATE ORDER
    const res = await fetch("http://localhost:8000/api/orders/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: total }),
    });

    const data = await res.json();

    // RAZORPAY OPTIONS
    const options = {
      key: "RAZORPAY_KEY_ID", 
      amount: data.order.amount,
      currency: "INR",
      name: "Your Store",
      description: "Order Payment",
      order_id: data.order.id,

      // ================= PAYMENT HANDLER =================
      handler: async function (response) {
        try {
          // VERIFY PAYMENT
          const verifyRes = await fetch(
            "http://localhost:8000/api/orders/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            }
          );

          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            alert("Payment verification failed");
            return;
          }

          //  SAVE ORDER
          await fetch("http://localhost:8000/api/orders/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user._id,
              products: cartItems.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price,
              })),
              amount: total,
              address,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              status: "paid",
            }),
          });

          //  CLEAR CART
          await fetch(
            `http://localhost:8000/api/cart/clear/${user._id}`,
            {
              method: "DELETE",
            }
          );

          //  UPDATE HEADER
          context.setCartUpdated((prev) => !prev);

          //  SUCCESS MESSAGE
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Payment Successful ",
          });
        } catch (error) {
          console.log(error);
          alert("Something went wrong ");
        }
      },

      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="container mt-5 checkoutPage">
      <h2>Checkout</h2>

      <div className="row mt-4">
        {/* LEFT - ADDRESS */}
        <div className="col-md-6">
          <h5>Delivery Address</h5>

          <textarea
            className="form-control"
            rows="5"
            placeholder="Enter your full address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="col-md-6">
          <h5>Order Summary</h5>

          <div className="card p-3">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="d-flex justify-content-between mb-2"
              >
                <span>{item.product?.name}</span>
                <span>
                  ₹{item.price} x {item.quantity}
                </span>
              </div>
            ))}

            <hr />

            <h4>Total: ₹{total}</h4>

            <button
              className="btn btn-success mt-3 w-100"
              onClick={handleCheckout}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;