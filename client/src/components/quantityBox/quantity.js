import React, { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const QuantityBox = ({ quantity = 1, max = 10, onChange }) => {

  const [inputValue, setInputValue] = useState(quantity);

  //  sync with parent
  useEffect(() => {
    setInputValue(quantity);
  }, [quantity]);

  //  increment
  const increment = () => {
    if (inputValue < max) {
      const newValue = inputValue + 1;
      setInputValue(newValue);
      onChange?.(newValue);  
    }
  };

  //  decrement
  const decrement = () => {
    if (inputValue > 1) {
      const newValue = inputValue - 1;
      setInputValue(newValue);
      onChange?.(newValue);   
    }
  };

  //  handle manual input 
  const handleChange = (e) => {
    let value = parseInt(e.target.value);

    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > max) value = max;

    setInputValue(value);
    onChange?.(value);
  };

  return (
    <div className="addCartSection pt-2 pb-2 d-flex align-items-center">
      <div className="counterSec">

        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          min={1}
          max={max}
        />

        <span className="arrow up" onClick={increment}>
          <KeyboardArrowUpIcon />
        </span>

        <span className="arrow down" onClick={decrement}>
          <KeyboardArrowDownIcon />
        </span>

      </div>
    </div>
  );
};

export default QuantityBox;