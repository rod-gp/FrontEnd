import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

const InvoiceComponent =() => {

    return(
        <div className="container-fluid border border-primary mt-4">
            <h2>Invoices</h2>
            <div className="row w-100">
            <div className="col-6 d-flex align-items-center">
                <label className="me-2 fw-bold">Select the Month:</label>  
            </div>
            <div className="col-6">
                <select class="form-select" aria-label="Select Month">
                    <option selected disabled>Select a month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
                </div>
            </div> 
        </div>
    );
};

export default InvoiceComponent;