import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp from "./pages/Auth/SignUp";
import SignIn from "./pages/Auth/SignIn";

import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import Home from "./pages/Home/home.js";
import Listing from "./pages/Listing/listing.js";
import NotFound from "./pages/NotFound/notFound.js";
import DetailsPage from "./pages/Details/details.js";
import Cart from "./pages/Cart/cart.js";
import { createContext, useEffect, useState } from "react";

import axios from "axios";
import Loader from "../src/assets/images/loading.gif";
import { fetchDataFromApi } from "./utils/api.js";
import Wishlist from "./pages/Wishlist/wishlist.js";
import { useCallback } from "react";
import Checkout from "./pages/Checkout/checkout.js";

export const MyContext = createContext();

function App() {
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [isopenNavigation, setIsopenNavigation] = useState(false);

  const [cartUpdated, setCartUpdated] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  //  FIXED LOGIN STATE (Boolean)
  const [isLogin, setIsLogin] = useState(
    localStorage.getItem("isLogin") === "true",
  );

  const [isOpenFilters, setIsopenFilters] = useState(false);
  const [cartTotalAmount, setCartTotalAmount] = useState();

  const [wishlistItems, setWishlistItems] = useState([]);

  // const loadWishlist = async () => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (!user) return;

  //   const res = await fetchDataFromApi(
  //     `/api/wishlist/${user._id || user.id || user.uid}`,
  //   );

  //   if (res?.items) {
  //     setWishlistItems(res.items);
  //   }
  // };



const loadWishlist = useCallback(async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  const res = await fetchDataFromApi(
    `/api/wishlist/${user._id || user.id || user.uid}`
  );

  if (res?.items) {
    setWishlistItems(res.items);
  }
}, []);

  const [alertBox, setAlertBox] = useState({
    open: false,
    msg: "",
    error: false,
  });

  /* ================= FETCH INITIAL DATA ================= */
  useEffect(() => {
    fetchDataFromApi("/api/category").then((res) => {
      if (res?.categoryList) {
        setCategories(res.categoryList);
      }
    });

    // STOP LOADER
    setTimeout(() => {
      setProductData([]);
      setIsloading(false);
    }, 2000);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getCartCount();
  }, [isLogin]);

  const getCartData = async (url) => {
    try {
      const response = await axios.get(url);
      setCartItems(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  // const addToCart = async (item) => {
  //   item.quantity = 1;

  //   try {
  //     const res = await axios.post("http://localhost:8000/cartItems", item);
  //     if (res) {
  //       setCartItems([...cartItems, { ...item, quantity: 1 }]);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const addToCart = async (item) => {
  //   const user = JSON.parse(localStorage.getItem("user"));

  //   if (!user) {
  //     setAlertBox({
  //       open: true,
  //       error: true,
  //       msg: "Please login first",
  //     });
  //     return;
  //   }

  //   try {
  //     const res = await fetchDataFromApi("/api/cart", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         productId: item._id,
  //         userId: user._id || user.id || user.uid,
  //         quantity: 1,
  //       }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (res?.success) {
  //       getCartCount();

  //       setAlertBox({
  //         open: true,
  //         error: false,
  //         msg: "Product added to cart ✅",
  //       });
  //     } else {
  //       setAlertBox({
  //         open: true,
  //         error: true,
  //         msg: res?.message || "Failed to add product",
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const addToCart = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setAlertBox({
        open: true,
        error: true,
        msg: "Please login first",
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/cart", {
        productId: item._id,
        userId: user._id || user.id || user.uid,
        quantity: 1,
      });

      if (res.data?.success) {
        getCartCount();

        setAlertBox({
          open: true,
          error: false,
          msg: "Product added to cart ",
        });
      } else {
        setAlertBox({
          open: true,
          error: true,
          msg: res.data?.message,
        });
      }
    } catch (error) {
      console.log(error);

      setAlertBox({
        open: true,
        error: true,
        msg: error.response?.data?.message || "Error adding product",
      });
    }
  };

  const removeItemsFromCart = async (id) => {
    const response = await axios.delete(
      `http://localhost:8000/cartItems/${id}`,
    );
    if (response) {
      getCartData("http://localhost:8000/cartItems");
    }
  };

  const emptyCart = () => {
    setCartItems([]);
  };

  //  FIXED SIGN IN
  const signIn = () => {
    localStorage.setItem("isLogin", true);
    setIsLogin(true);
  };

  //  FIXED SIGN OUT
  const signOut = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLogin(false);
  };

  const openFilters = () => {
    setIsopenFilters(!isOpenFilters);
  };

  const getCartCount = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      // const res = await fetchDataFromApi(`/api/cart/${user.uid}`);
      const res = await fetchDataFromApi(
        `/api/cart/${user._id || user.id || user.uid}`,
      );
      if (res?.success) {
        setCartCount(res.cartItems.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);
  /* ================= CONTEXT VALUE ================= */
  const value = {
    isLogin,
    windowWidth,
    categories,
    isOpenFilters,
    addToCart,
    removeItemsFromCart,
    emptyCart,
    signOut,
    signIn,
    openFilters,
    isopenNavigation,
    setIsopenNavigation,
    setCartTotalAmount,
    cartTotalAmount,
    setCartItems,
    cartItems,
    cartUpdated,
    setCartUpdated,
    cartCount,
    getCartCount,
    setAlertBox,
    alertBox,
    wishlistItems,
    setWishlistItems,
    loadWishlist,
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={value}>
        {isLoading ? (
          <div className="loader">
            <img src={Loader} alt="loading" />
          </div>
        ) : (
          <>
            <Header />
            {alertBox.open && (
              <div
                className={`alert ${alertBox.error ? "alert-danger" : "alert-success"}`}
              >
                {alertBox.msg}
              </div>
            )}
            <Routes>
              <Route
                exact={true}
                path="/"
                element={<Home data={productData} />}
              />

              <Route
                exact={true}
                path="/category/:id"
                element={<Listing data={productData} single={true} />}
              />

              <Route
                exact={true}
                path="/category/subCat/:id"
                element={<Listing data={productData} single={false} />}
              />

              <Route
                exact={true}
                path="/product/:id"
                element={<DetailsPage data={productData} />}
              />

              <Route exact={true} path="/cart" element={<Cart />} />

              <Route exact={true} path="*" element={<NotFound />} />

              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>

            <Footer />
          </>
        )}
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
