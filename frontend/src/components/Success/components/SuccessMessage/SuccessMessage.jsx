import React from 'react';
import { BiSolidBadgeCheck } from "react-icons/bi";
import './SuccessMessage.css';
export default function SuccessMessage() {
  return (
    <div className='SuccessMessage'>
      <h2 className='SuccessMessage-text'>
        تم الدفع بنجاح
        <span className='SuccessMessage-icon'><BiSolidBadgeCheck /> </span>
      </h2>    </div>

  )
}
