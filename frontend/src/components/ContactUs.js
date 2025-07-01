import React from 'react';
import "../css/contact.css"

function ContactUs() {
  return (
    <div className="container content contact-container">
      <h2 className="mb-4">Contact Us</h2>
      <div className="row">
        <div className="col-md-7">
          <form>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Your Name</label>
              <input type="text" className="form-control" id="name" placeholder="Enter your name" required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input type="email" className="form-control" id="email" placeholder="Enter your email" required />
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Subject</label>
              <input type="text" className="form-control" id="subject" placeholder="Subject" required />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea className="form-control" id="message" rows="5" placeholder="Type your message here" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
        <div className="col-md-5">
          <div className="card p-3 bg-light">
            <h5>ABC Condo Management</h5>
            <p className="mb-1"><strong>Address:</strong> 123 ABC Condo Ave, CityName, Country</p>
            <p className="mb-1"><strong>Email:</strong> support@abccondo.com</p>
            <p className="mb-1"><strong>Phone:</strong> +1 (555) 123-4567</p>
            <hr />
            <p>
              Our team is here to assist you with any questions or concerns about the ABC Condo community.
              Please allow up to 2 business days for a response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;