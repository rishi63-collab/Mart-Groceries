import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { fetchDataFromApi, deleteData } from "../../utils/api";
import { IoCloseSharp } from "react-icons/io5";

/* ================= Breadcrumb ================= */
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];

  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: emphasize(backgroundColor, 0.08),
    },
  };
});

const SubCategoryList = () => {
  const [catData, setCatData] = useState([]);
  const context = useContext(MyContext);

  /* ================= FETCH CATEGORY ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(30);

    fetchDataFromApi("/api/category").then((res) => {
      setCatData(res?.categoryList || []);
      context.setProgress(100);
    });
  }, []);

  /* ================= DELETE SUB CATEGORY ================= */
  const deleteSubCat = (id) => {
    if (!id) return;

    context.setProgress(30);

    deleteData(`/api/category/${id}`).then(() => {
      fetchDataFromApi("/api/category").then((res) => {
        setCatData(res?.categoryList || []);
        context.setProgress(100);

        context.setAlertBox({
          open: true,
          error: false,
          msg: "Sub Category Deleted!",
        });
      });
    });
  };

  return (
    <div className="right-content w-100">
      {/* ================= HEADER ================= */}
      <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
        <h5 className="mb-0">Sub Category List</h5>

        <Breadcrumbs className="ms-auto breadcrumbs_">
          <StyledBreadcrumb
            component="a"
            href="#"
            label="Dashboard"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb label="Category" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>

        <Link to="/subCategory/add">
          <Button className="btn-blue ms-3 px-3 pe-3">Add Sub Category</Button>
        </Link>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card shadow border-0 p-3 mt-4">
        <h3 className="hd">Sub Category List</h3>

        <div className="table-responsive mt-3">
          <table className="table table-bordered table-striped v-align">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "180px" }}>CATEGORY IMAGE</th>
                <th style={{ width: "200px" }}>CATEGORY</th>
                <th>SUB CATEGORY</th>
              </tr>
            </thead>

            <tbody>
              {catData.length > 0 ? (
                catData.map((item, index) => {
                  if (item?.children?.length > 0) {
                    return (
                      <tr key={item._id || index}>
                        {/* IMAGE */}
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="imgWrapper"
                              style={{ width: "50px" }}
                            >
                              <div className="img card shadow m-0">
                                <LazyLoadImage
                                  src={`${process.env.REACT_APP_BASE_URL}/uploads/${item?.images?.[0]}`}
                                  effect="blur"
                                  className="w-100"
                                />
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY NAME */}
                        <td>{item?.name}</td>

                        {/* SUB CATEGORY */}
                        <td>
                          {item.children.map((subCat, key) => (
                            <span
                              key={subCat._id || key}
                              className="badge badge-primary mx-1"
                            >
                              {subCat.name}
                              <IoCloseSharp
                                className="cursor ms-1"
                                onClick={() => deleteSubCat(subCat._id)}
                              />
                            </span>
                          ))}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No Sub Category Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryList;
