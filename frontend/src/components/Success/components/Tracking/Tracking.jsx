import React from 'react';
import { LiaShippingFastSolid } from 'react-icons/lia';
import './Tracking.css';

const Tracking = ({Tracking}) => {
  return (
    <div className="Tracking">
      <div className="Tracking-icon-wrapper ">
        <LiaShippingFastSolid />
      </div>
      <div className="Tracking-message ">يمكنك تتبع حاله الطلب من خلال هذا الرقم</div>
      <div className="Tracking-order-number ">{Tracking}</div>
      <div className="Tracking-p "> استخدم رقم التتبع داخل صفحة تتبع طلبك</div>

    </div>
  );
};

export default Tracking;
