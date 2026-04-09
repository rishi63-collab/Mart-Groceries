import React from "react";
import { Link } from "react-router-dom";
import "./PopularCategories.css"; 

const PopularCategories = ({ data }) => {
  return (
    <section className="container-fluid mt-4 popular-container">
      <h3>Popular Categories</h3>

      <ul className="category-list mt-3">
        {data.map((item) => (
          <li key={item._id} className="category-item">
            <Link
              to={`/category/subCat/${item._id}`}
              className="category-link"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PopularCategories;