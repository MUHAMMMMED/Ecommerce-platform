import React from 'react';
import { Link } from 'react-router-dom';
import './Loading.css';
import errorImag from './errorImag.png';

export default function ErrorPage({head,error}) {
  return (
<main>
<section className='error'>
<div className='error_row' ><img className='error_img' src={errorImag} alt="404 error" /></div>
        
<div className='error_row' >
<h1 className='error_head' > {head}</h1>
<p className='error_p'>{error}</p></div>
<div className='error_row' >
<div className='error_button-container' >
<Link to={'/'}>   <button className='error_but'>  عوده الصفحه الرئيسيه</button></Link>
 </div></div>
 </section>
</main>
  );
}
