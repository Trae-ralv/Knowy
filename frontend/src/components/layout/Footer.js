import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <div className='border-top d-flex align-items-center container-fluid py-3' >
            <div className='col text-start ms-2'>
                <p className='mb-0'>© 2025 ABC Condo. All Rights Reserved</p>
            </div>
            <div className='col text-end me-2'>
                <Link to="/contact" className="navbar-brand ps-4 fw-bolder">
                    Contact Us
                </Link>
                <Link to="/terms" className="navbar-brand ps-4 fw-bolder">
                    Terms and Condition
                </Link>
            </div>
        </div>

    );
};

export default Footer;