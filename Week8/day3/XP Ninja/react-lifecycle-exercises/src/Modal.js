import React, { Component } from "react";
import "./Modal.css";

/* ============================================================
   XP Gold - Exercise 1 : Modal
   A simple modal window : a semi-transparent, darkened overlay
   (".modal-background") that covers the whole viewport and
   centers a white card (".modal-body") both vertically and
   horizontally. The card renders whatever is passed as children
   (here, an error message) plus a button to close the modal.
   ============================================================ */
class Modal extends Component {
  render() {
    return (
      <div className="modal-background">
        <div className="modal-body">
          {this.props.children}
          <button type="button" onClick={this.props.onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default Modal;
