import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessMessage from "./components/SuccessMessage/SuccessMessage";

export default function FollowSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a timer to navigate back to the previous page after 5 seconds
    const timer = setTimeout(() => {
      navigate(-1); // This will navigate back to the last page in the history stack
    }, 50);

    // Cleanup the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <SuccessMessage />
    </>
  );
}

 