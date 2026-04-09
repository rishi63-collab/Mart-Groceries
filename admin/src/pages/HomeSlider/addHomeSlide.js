import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import { postData, fetchDataFromApi, editData } from "../../utils/api";
import { MyContext } from "../../App";

const AddHomeSlide = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ================= LOAD EXISTING =================
  useEffect(() => {
    if (id) {
      fetchDataFromApi(`/api/homeBanner/${id}`).then((res) => {
        if (res?.success) {
          setPreview(res.slide.images || []);

          if (res.slide.startDate) {
            setStartDate(res.slide.startDate.substring(0, 10));
          }

          if (res.slide.endDate) {
            setEndDate(res.slide.endDate.substring(0, 10));
          }
        }
      });
    }
  }, [id]);

  // ================= IMAGE SELECT =================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setImages(files);
    setPreview(previews);
  };

  // ================= REMOVE =================
  const handleRemoveImage = (index) => {
    const updatedPreview = preview.filter((_, i) => i !== index);
    setPreview(updatedPreview);

    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedUrls = preview;

      //  upload only if new images
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((img) => {
          formData.append("images", img);
        });

        const res = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/imageUpload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        if (data?.images) {
          uploadedUrls = data.images;
        }
      }

      const payload = {
        images: uploadedUrls,
        startDate: startDate || null,
        endDate: endDate || null,
      };

      let response;

      if (id) {
        response = await editData(`/api/homeBanner/${id}`, payload);
      } else {
        response = await postData("/api/homeBanner", payload);
      }

      if (response?.success) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: id
            ? "Slide updated successfully"
            : "Slide added successfully",
        });

        navigate("/homeSlider");
      }
    } catch (error) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Upload failed",
      });
    }
  };

  return (
    <div className="card shadow border-0 p-4 mt-5">
      <h2 className="mb-4">
        {id ? "Edit Home Slide" : "Add Home Slide"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* IMAGE INPUT */}
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="form-control mb-3"
        />

        {/* PREVIEW */}
        {preview.length > 0 && (
          <div className="row">
            {preview.map((img, index) => (
              <div className="col-md-3 mb-3" key={index}>
                <div style={{ position: "relative" }}>
                  <img
                    src={
                      img.startsWith("blob:")
                        ? img
                        : `${process.env.REACT_APP_BASE_URL}/uploads/${img}`
                    }
                    alt="preview"
                    className="w-100"
                    style={{
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "#fff",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DATES */}
        <TextField
          type="date"
          label="Start Date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mb-3"
        />

        <TextField
          type="date"
          label="End Date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mb-3"
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          {id ? "Update Slide" : "Upload Slide"}
        </Button>
      </form>
    </div>
  );
};

export default AddHomeSlide;