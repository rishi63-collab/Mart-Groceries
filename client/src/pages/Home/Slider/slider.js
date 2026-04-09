import React from "react";
import Slider from "react-slick";
import "./slider.css";

import Newsletter from "../../../components/newsletter/newsLetter";

const SliderBox = ({ data }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: true,
    autoplay: true, 
    autoplaySpeed: 3000, 
  };

  // Filter active banners
  // const activeSlides = Array.isArray(data)
  //   ? data.filter((slide) => slide.autoActive !== false)
  //   : [];

  const activeSlides = Array.isArray(data)
    ? data.filter((slide) => slide.isActive !== false)
    : [];

  return (
    <section className="homeSlider">
      <div className="container-fluid position-relative">
        {/* <div className="sliderWrapper position-relative"> */}
        <Slider {...settings} className="home_slider_main">
          {activeSlides.length > 0 ? (
            activeSlides.map((slide, slideIndex) =>
              slide.images?.map((img, imgIndex) => (
                <div className="item" key={`${slideIndex}-${imgIndex}`}>
                  <img
                    src={`${process.env.REACT_APP_BASE_URL}/uploads/${img}`}
                    className="w-100"
                    alt="Home banner"
                  />
                </div>
              )),
            )
          ) : (
            <div className="item" >
              <div style={{ padding: "100px", textAlign: "center" }}>
                <h4>No Active Slides</h4>
              </div>
            </div>
          )}
        </Slider>

        <Newsletter />
      </div>
    </section>
  );
};

export default SliderBox;
