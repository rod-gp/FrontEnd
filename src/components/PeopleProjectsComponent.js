import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const TableTransfer = () => {
  // Initial available items
  const [availableItems, setAvailableItems] = useState([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" }
  ]);

  // Initially empty selected items
  const [selectedItems, setSelectedItems] = useState([]);

  // Track selected items in each table
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedSelected, setSelectedSelected] = useState([]);

  // Move selected items from Available → Selected
  const moveRight = () => {
    setSelectedItems([...selectedItems, ...selectedAvailable]);
    setAvailableItems(availableItems.filter((item) => !selectedAvailable.includes(item)));
    setSelectedAvailable([]);
  };

  // Move selected items from Selected → Available
  const moveLeft = () => {
    setAvailableItems([...availableItems, ...selectedSelected]);
    setSelectedItems(selectedItems.filter((item) => !selectedSelected.includes(item)));
    setSelectedSelected([]);
  };

  // Toggle selection in Available table
  const toggleSelectAvailable = (item) => {
    setSelectedAvailable((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Toggle selection in Selected table
  const toggleSelectSelected = (item) => {
    setSelectedSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Table Transfer</h2>
      <div className="row justify-content-center">
        {/* Available Items Table */}
        <div className="col-md-4">
          <h5 className="text-center">Available Items</h5>
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              {availableItems.map((item) => (
                <tr
                  key={item.id}
                  className={selectedAvailable.includes(item) ? "table-primary" : ""}
                  onClick={() => toggleSelectAvailable(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Move Buttons */}
        <div className="col-md-2 d-flex flex-column align-items-center justify-content-center">
          <button
            className="btn btn-success mb-2"
            onClick={moveRight}
            disabled={selectedAvailable.length === 0}
          >
            ➡ Move Right
          </button>
          <button
            className="btn btn-danger"
            onClick={moveLeft}
            disabled={selectedSelected.length === 0}
          >
            ⬅ Move Left
          </button>
        </div>

        {/* Selected Items Table */}
        <div className="col-md-4">
          <h5 className="text-center">Selected Items</h5>
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr
                  key={item.id}
                  className={selectedSelected.includes(item) ? "table-danger" : ""}
                  onClick={() => toggleSelectSelected(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableTransfer;
